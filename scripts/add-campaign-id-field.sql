-- Add campaign_id field to campaigns table
-- This allows staff to manually input a campaign ID for external tracking

-- Add the campaign_id column to the campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(100);

-- Add a comment to explain the field
COMMENT ON COLUMN campaigns.campaign_id IS 'Manual campaign ID for external tracking and reference';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_id ON campaigns(campaign_id);

-- Update existing campaigns with a default campaign_id if they don't have one
-- This will use the first 8 characters of the UUID as a readable ID
UPDATE campaigns 
SET campaign_id = UPPER(SUBSTRING(id::text, 1, 8))
WHERE campaign_id IS NULL OR campaign_id = '';

-- Make the field unique to prevent duplicates
ALTER TABLE campaigns 
ADD CONSTRAINT unique_campaign_id UNIQUE (campaign_id);
