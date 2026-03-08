-- Add calendar_url to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS calendar_url TEXT DEFAULT NULL;

-- Add plan_type to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'creator';

-- Add index for plan_type queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);
