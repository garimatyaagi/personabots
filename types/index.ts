export type UseCaseType =
  | "hiring"
  | "networking"
  | "investor"
  | "dating"
  | "support"
  | "custom";

export type MemorySourceType =
  | "resume"
  | "linkedin"
  | "upload"
  | "note"
  | "qa"
  | "chat";

export type AccessLevel = "public" | "unlisted" | "private";
export type MessageRole = "system" | "user" | "assistant";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  tone: number;
  personality_traits: Record<string, boolean>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotUseCase {
  id: string;
  bot_id: string;
  type: UseCaseType;
  config: PlaybookConfig;
  is_active: boolean;
  created_at: string;
}

export interface PlaybookConfig {
  system_prompt?: string;
  tools?: ToolSchema[];
  prompt_templates?: Record<string, string>;
  suggested_prompts?: string[];
  capabilities?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  bot_id: string | null;
  source_type: MemorySourceType;
  title: string;
  raw_text: string;
  metadata: Record<string, unknown>;
  is_shareable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Embedding {
  id: string;
  memory_item_id: string;
  bot_id: string | null;
  user_id: string;
  chunk_text: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  is_shareable: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  bot_id: string;
  visitor_id: string | null;
  user_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ShareLink {
  id: string;
  bot_id: string;
  slug: string;
  access: AccessLevel;
  created_at: string;
}

export interface SearchResult {
  id: string;
  chunk_text: string;
  memory_item_id: string;
  bot_id: string | null;
  similarity: number;
  keyword_rank: number;
  combined_score: number;
  metadata: Record<string, unknown>;
}

// Bot Builder wizard state
export interface BotBuilderState {
  step: 1 | 2 | 3 | 4;
  basics: {
    name: string;
    slug: string;
    description: string;
    tone: number;
    personality_traits: Record<string, boolean>;
  };
  memory: {
    uploads: File[];
    links: string[];
    notes: string;
    qa_answers: Record<string, string>;
  };
  useCase: {
    type: UseCaseType;
    config: PlaybookConfig;
  };
  access: AccessLevel;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface BotWithUseCase extends Bot {
  use_cases: BotUseCase[];
  share_links: ShareLink[];
}

// Subscription types
export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  razorpay_signature: string | null;
  created_at: string;
}
