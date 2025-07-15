-- Migration to add missing columns for the new influencer API
-- This adds columns that the /api/influencers endpoint expects

-- Add missing columns to influencers table
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS influencer_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'SILVER',
ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add missing columns to influencer_platforms table
ALTER TABLE influencer_platforms 
ADD COLUMN IF NOT EXISTS followers_count INTEGER,
ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS avg_views INTEGER,
ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_synced TIMESTAMP WITH TIME ZONE;

-- Update existing records to have default values
UPDATE influencers 
SET 
  influencer_type = CASE 
    WHEN user_id IS NOT NULL THEN 'SIGNED'
    ELSE 'PARTNERED'
  END,
  content_type = 'STANDARD',
  tier = 'SILVER'
WHERE influencer_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_influencers_type ON influencers(influencer_type);
CREATE INDEX IF NOT EXISTS idx_influencers_tier ON influencers(tier);
CREATE INDEX IF NOT EXISTS idx_influencer_platforms_connected ON influencer_platforms(is_connected);

-- Add comments for documentation
COMMENT ON COLUMN influencers.influencer_type IS 'Type of influencer: SIGNED, PARTNERED, AGENCY_PARTNER';
COMMENT ON COLUMN influencers.content_type IS 'Type of content they create: STANDARD, UGC, SEEDING';
COMMENT ON COLUMN influencers.tier IS 'Influencer tier: GOLD, SILVER';
COMMENT ON COLUMN influencer_platforms.is_connected IS 'Whether OAuth is connected for this platform';
COMMENT ON COLUMN influencer_platforms.last_synced IS 'Last time data was synced from platform';

-- Verify the migration
SELECT 'Migration completed successfully' as status; 