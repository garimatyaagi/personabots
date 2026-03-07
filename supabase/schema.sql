-- PersonaBots: Supabase Schema with pgvector
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for keyword search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE use_case_type AS ENUM (
  'hiring', 'networking', 'investor', 'dating', 'support', 'custom'
);

CREATE TYPE memory_source_type AS ENUM (
  'resume', 'linkedin', 'upload', 'note', 'qa', 'chat'
);

CREATE TYPE access_level AS ENUM (
  'public', 'unlisted', 'private'
);

CREATE TYPE message_role AS ENUM (
  'system', 'user', 'assistant'
);

-- ============================================
-- TABLES
-- ============================================

-- Users (synced from Clerk via webhook)
CREATE TABLE users (
  id TEXT PRIMARY KEY,               -- Clerk user ID
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bots
CREATE TABLE bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  tone INTEGER DEFAULT 50 CHECK (tone >= 0 AND tone <= 100), -- 0=formal, 100=casual
  personality_traits JSONB DEFAULT '{}',  -- {"friendly": true, "concise": true, ...}
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_bots_slug ON bots(slug);
CREATE INDEX idx_bots_public ON bots(is_public) WHERE is_public = TRUE;

-- Bot Use Cases
CREATE TABLE bot_use_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  type use_case_type NOT NULL,
  config JSONB DEFAULT '{}',          -- playbook config, system prompt overrides, tool schemas
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bot_use_cases_bot_id ON bot_use_cases(bot_id);

-- Memory Items
CREATE TABLE memory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,  -- NULL = personal memory layer
  source_type memory_source_type NOT NULL,
  title TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',        -- source URL, file name, etc.
  is_shareable BOOLEAN DEFAULT FALSE, -- controls visibility for public bot visitors
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_memory_items_user_id ON memory_items(user_id);
CREATE INDEX idx_memory_items_bot_id ON memory_items(bot_id);
CREATE INDEX idx_memory_items_source ON memory_items(source_type);
CREATE INDEX idx_memory_items_shareable ON memory_items(is_shareable) WHERE is_shareable = TRUE;

-- Embeddings (chunks with vectors)
CREATE TABLE embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_item_id UUID NOT NULL REFERENCES memory_items(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),             -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',        -- chunk index, overlap info
  is_shareable BOOLEAN DEFAULT FALSE, -- inherited from memory_item
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- HNSW index for fast similarity search
CREATE INDEX idx_embeddings_vector ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_embeddings_memory_item ON embeddings(memory_item_id);
CREATE INDEX idx_embeddings_bot_id ON embeddings(bot_id);
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_shareable ON embeddings(is_shareable) WHERE is_shareable = TRUE;

-- GIN index for keyword search on chunk_text
CREATE INDEX idx_embeddings_chunk_trgm ON embeddings USING gin (chunk_text gin_trgm_ops);

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  visitor_id TEXT,                     -- anonymous visitor identifier
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,  -- if authenticated user
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_conversations_bot_id ON conversations(bot_id);
CREATE INDEX idx_conversations_visitor ON conversations(visitor_id);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',        -- token counts, latency, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Share Links
CREATE TABLE share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,           -- same as bot slug usually
  access access_level DEFAULT 'private' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_share_links_slug ON share_links(slug);
CREATE INDEX idx_share_links_bot ON share_links(bot_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Hybrid search function: combines vector similarity + keyword matching
CREATE OR REPLACE FUNCTION search_embeddings(
  query_embedding vector(1536),
  query_text TEXT,
  match_user_id TEXT,
  match_bot_id UUID DEFAULT NULL,
  match_count INTEGER DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.3,
  public_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  memory_item_id UUID,
  bot_id UUID,
  similarity FLOAT,
  keyword_rank FLOAT,
  combined_score FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      e.id,
      e.chunk_text,
      e.memory_item_id,
      e.bot_id,
      1 - (e.embedding <=> query_embedding) AS similarity,
      COALESCE(similarity(e.chunk_text, query_text), 0)::FLOAT AS keyword_rank,
      e.metadata
    FROM embeddings e
    WHERE e.user_id = match_user_id
      AND (
        -- Personal memory layer (bot_id IS NULL) OR specific bot memory
        e.bot_id IS NULL
        OR e.bot_id = match_bot_id
      )
      AND (NOT public_only OR e.is_shareable = TRUE)
      AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
  )
  SELECT
    vr.id,
    vr.chunk_text,
    vr.memory_item_id,
    vr.bot_id,
    vr.similarity,
    vr.keyword_rank,
    -- Combined score: vector similarity (70%) + keyword (10%) + bot-specific boost (20%)
    (
      vr.similarity * 0.7
      + vr.keyword_rank * 0.1
      + CASE WHEN vr.bot_id = match_bot_id THEN 0.2 ELSE 0.0 END
    )::FLOAT AS combined_score,
    vr.metadata
  FROM vector_results vr
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_bots_updated_at
  BEFORE UPDATE ON bots FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_memory_items_updated_at
  BEFORE UPDATE ON memory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_conversations_updated_at
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; these policies are for anon/authenticated access
-- For this MVP, API routes use the service role key, so RLS is permissive
-- In production, tighten these based on JWT claims

CREATE POLICY "Service role full access" ON users FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON bots FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON bot_use_cases FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON memory_items FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON embeddings FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON messages FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON share_links FOR ALL USING (TRUE);

-- ============================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================

CREATE TYPE subscription_status AS ENUM (
  'created', 'authenticated', 'active', 'paused', 'cancelled', 'expired'
);

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT NOT NULL UNIQUE,
  razorpay_plan_id TEXT NOT NULL,
  status subscription_status DEFAULT 'created' NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER tr_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON subscriptions FOR ALL USING (TRUE);

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT NOT NULL,
  method TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_razorpay_id ON payments(razorpay_payment_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON payments FOR ALL USING (TRUE);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Create via Supabase Dashboard:
-- Bucket name: "uploads"
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain
