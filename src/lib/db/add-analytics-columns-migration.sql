-- Migration to add analytics columns for Modash RAW API data
-- This adds columns that store real analytics data from Modash

-- Add analytics columns to influencers table
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS total_engagements INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_reach INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analytics_updated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_influencers_total_engagements ON influencers(total_engagements);
CREATE INDEX IF NOT EXISTS idx_influencers_avg_engagement_rate ON influencers(avg_engagement_rate);
CREATE INDEX IF NOT EXISTS idx_influencers_estimated_reach ON influencers(estimated_reach);

-- Add comments for documentation
COMMENT ON COLUMN influencers.total_engagements IS 'Total engagements from Modash RAW API';
COMMENT ON COLUMN influencers.avg_engagement_rate IS 'Average engagement rate from Modash RAW API';
COMMENT ON COLUMN influencers.estimated_reach IS 'Estimated reach from Modash RAW API';
COMMENT ON COLUMN influencers.total_likes IS 'Total likes from Modash RAW API';
COMMENT ON COLUMN influencers.total_comments IS 'Total comments from Modash RAW API';
COMMENT ON COLUMN influencers.total_views IS 'Total views from Modash RAW API';
COMMENT ON COLUMN influencers.analytics_updated_at IS 'Last time analytics were updated from Modash';

-- Verify the migration
SELECT 'Analytics columns migration completed successfully' as status;
