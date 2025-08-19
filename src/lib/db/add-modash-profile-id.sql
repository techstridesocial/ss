-- Add modash_profile_id column to influencer_platforms table
ALTER TABLE influencer_platforms 
ADD COLUMN IF NOT EXISTS modash_profile_id VARCHAR(255);

-- Add index for better lookup performance
CREATE INDEX IF NOT EXISTS idx_influencer_platforms_modash_id ON influencer_platforms(modash_profile_id);

-- Add comment for documentation
COMMENT ON COLUMN influencer_platforms.modash_profile_id IS 'Modash profile ID for connected accounts';

-- Verify the migration
SELECT 'Modash profile ID column added successfully' as status; 
