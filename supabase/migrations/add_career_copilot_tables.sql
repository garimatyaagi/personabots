-- Career Copilot: New tables for jobs, applications, tailored content, and profile scoring
-- Migration: add_career_copilot_tables.sql

-- 1. Jobs table: stores job descriptions added by the user
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core job data
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  url TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',

  -- Ingestion metadata
  source TEXT DEFAULT 'paste' CHECK (source IN ('paste', 'url', 'scrape', 'import')),
  raw_input TEXT,

  -- AI-computed fields (populated async after creation)
  match_score FLOAT CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100)),
  match_analysis JSONB DEFAULT '{}',

  -- Flexible metadata (salary, job_type, seniority, etc.)
  metadata JSONB DEFAULT '{}',

  -- Lifecycle
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_active ON jobs(user_id, is_dismissed) WHERE is_dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(user_id, match_score DESC NULLS LAST);

-- 2. Applications table: tracks application lifecycle per job
CREATE TYPE application_stage AS ENUM (
  'discovered', 'saved', 'tailored', 'applied', 'interview', 'offer', 'archived'
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  stage application_stage DEFAULT 'discovered' NOT NULL,
  notes TEXT,
  applied_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

-- 3. Tailored content table: AI-generated role-specific content per job
CREATE TYPE tailored_content_type AS ENUM (
  'summary', 'resume_bullets', 'cover_note', 'recruiter_pitch',
  'interview_questions', 'proof_points', 'gap_analysis', 'suggested_framing'
);

CREATE TABLE IF NOT EXISTS tailored_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  content_type tailored_content_type NOT NULL,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tailored_content_job ON tailored_content(job_id);
CREATE INDEX IF NOT EXISTS idx_tailored_content_user ON tailored_content(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_content_type ON tailored_content(job_id, content_type);

-- 4. Profile scores table: profile strength analysis
CREATE TABLE IF NOT EXISTS profile_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,

  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Individual dimension scores (each 0-100)
  dimensions JSONB DEFAULT '{}',

  -- AI suggestions for improvement
  suggestions JSONB DEFAULT '[]',

  -- What content was analyzed
  analyzed_memory_count INTEGER DEFAULT 0,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, bot_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_scores_user ON profile_scores(user_id);

-- Add update_updated_at triggers (reuses existing function from schema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    DROP TRIGGER IF EXISTS tr_jobs_updated_at ON jobs;
    CREATE TRIGGER tr_jobs_updated_at
      BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    DROP TRIGGER IF EXISTS tr_applications_updated_at ON applications;
    CREATE TRIGGER tr_applications_updated_at
      BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    DROP TRIGGER IF EXISTS tr_tailored_content_updated_at ON tailored_content;
    CREATE TRIGGER tr_tailored_content_updated_at
      BEFORE UPDATE ON tailored_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    DROP TRIGGER IF EXISTS tr_profile_scores_updated_at ON profile_scores;
    CREATE TRIGGER tr_profile_scores_updated_at
      BEFORE UPDATE ON profile_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

-- Enable RLS with service-role full access (same pattern as existing tables)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON jobs FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON applications FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON tailored_content FOR ALL USING (TRUE);
CREATE POLICY "Service role full access" ON profile_scores FOR ALL USING (TRUE);
