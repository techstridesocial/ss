-- Add missing fields to influencer onboarding
-- The website_url field already exists, we just need to add main_platform

-- Add main_platform field to influencers table
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS main_platform VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN influencers.main_platform IS 'Primary social media platform (INSTAGRAM, TIKTOK, YOUTUBE, TWITTER)';
