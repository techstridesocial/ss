-- Add missing index on influencers.user_id for performance
-- This is critical for JOIN queries from users to influencers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_user_id 
  ON influencers(user_id);

-- Add composite index for common lookup pattern (user_id + ready_for_campaigns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_user_ready
  ON influencers(user_id, ready_for_campaigns)
  WHERE ready_for_campaigns = true;


