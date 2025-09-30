-- Migration to add content_links column to campaign_influencers table
-- This stores the content URLs that influencers post for campaigns

-- Add content_links column to campaign_influencers table
ALTER TABLE campaign_influencers 
ADD COLUMN IF NOT EXISTS content_links TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN campaign_influencers.content_links IS 'JSON array of content URLs posted by influencer for this campaign';
COMMENT ON COLUMN campaign_influencers.discount_code IS 'Discount code assigned to this influencer for this campaign';

-- Verify the migration
SELECT 'Content links column migration completed successfully' as status;
