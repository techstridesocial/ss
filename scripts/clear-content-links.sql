-- Clear all content links from campaign_influencers table
-- This script safely removes all content links and discount codes

-- First, let's see what we have
SELECT 
  'Before cleanup:' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
FROM campaign_influencers;

-- Show what we're about to clear
SELECT 
  'Records to be cleared:' as status,
  ci.id,
  ci.influencer_id,
  ci.content_links,
  ci.discount_code,
  c.name as campaign_name,
  i.display_name as influencer_name
FROM campaign_influencers ci
JOIN campaigns c ON ci.campaign_id = c.id
JOIN influencers i ON ci.influencer_id = i.id
WHERE ci.content_links IS NOT NULL 
  AND ci.content_links != '[]'::jsonb
  AND ci.content_links != 'null'::jsonb;

-- Clear content links (set to empty array)
UPDATE campaign_influencers 
SET 
  content_links = '[]'::jsonb,
  discount_code = NULL,
  updated_at = NOW()
WHERE content_links IS NOT NULL 
  AND content_links != '[]'::jsonb
  AND content_links != 'null'::jsonb;

-- Show how many records were updated
SELECT 
  'Records updated:' as status,
  COUNT(*) as updated_count
FROM campaign_influencers 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

-- Verify cleanup
SELECT 
  'After cleanup:' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
FROM campaign_influencers;

-- Reset influencer analytics for affected influencers
UPDATE influencers 
SET 
  total_engagements = 0,
  total_engagement_rate = 0,
  avg_engagement_rate = 0,
  estimated_reach = 0,
  total_likes = 0,
  total_comments = 0,
  total_views = 0,
  analytics_updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT influencer_id 
  FROM campaign_influencers 
  WHERE updated_at >= NOW() - INTERVAL '1 minute'
);

-- Show how many influencers had analytics reset
SELECT 
  'Influencers analytics reset:' as status,
  COUNT(*) as reset_count
FROM influencers 
WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute';

-- Final verification
SELECT 
  'Final status:' as status,
  'Content links cleared successfully' as message,
  NOW() as completed_at;
