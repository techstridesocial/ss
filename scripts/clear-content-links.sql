-- Clear all content links from campaign_influencers table

-- First, let's see the current state
SELECT 
  COUNT(*) as total_campaign_influencers,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]' AND content_links != '' THEN 1 END) as with_content_links
FROM campaign_influencers;

-- Clear all content links
UPDATE campaign_influencers 
SET content_links = NULL
WHERE content_links IS NOT NULL 
  AND content_links != '[]' 
  AND content_links != '';

-- Verify the cleanup
SELECT 
  COUNT(*) as total_campaign_influencers,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]' AND content_links != '' THEN 1 END) as with_content_links
FROM campaign_influencers;