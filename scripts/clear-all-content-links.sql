-- COMPREHENSIVE Content Links Cleanup Script
-- This clears content links from ALL database tables that contain them

-- ========================================
-- 1. CAMPAIGN_INFLUENCERS TABLE
-- ========================================

-- Check current state
SELECT 
  'CAMPAIGN_INFLUENCERS - Before cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
FROM campaign_influencers;

-- Show what we're clearing from campaign_influencers
SELECT 
  'CAMPAIGN_INFLUENCERS - Records to clear:' as table_name,
  ci.id,
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

-- Clear campaign_influencers content links
UPDATE campaign_influencers 
SET 
  content_links = '[]'::jsonb,
  discount_code = NULL,
  updated_at = NOW()
WHERE content_links IS NOT NULL 
  AND content_links != '[]'::jsonb
  AND content_links != 'null'::jsonb;

-- ========================================
-- 2. CAMPAIGN_CONTENT_SUBMISSIONS TABLE
-- ========================================

-- Check current state
SELECT 
  'CAMPAIGN_CONTENT_SUBMISSIONS - Before cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_url IS NOT NULL AND content_url != '' THEN 1 END) as records_with_content_urls
FROM campaign_content_submissions;

-- Show what we're clearing from campaign_content_submissions
SELECT 
  'CAMPAIGN_CONTENT_SUBMISSIONS - Records to clear:' as table_name,
  ccs.id,
  ccs.content_url,
  ccs.content_type,
  ccs.platform,
  ccs.status,
  c.name as campaign_name,
  i.display_name as influencer_name
FROM campaign_content_submissions ccs
JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
JOIN campaigns c ON ci.campaign_id = c.id
JOIN influencers i ON ci.influencer_id = i.id
WHERE ccs.content_url IS NOT NULL 
  AND ccs.content_url != '';

-- Clear campaign_content_submissions content URLs
UPDATE campaign_content_submissions 
SET 
  content_url = '',
  updated_at = NOW()
WHERE content_url IS NOT NULL 
  AND content_url != '';

-- ========================================
-- 3. INFLUENCER_CONTENT TABLE
-- ========================================

-- Check current state
SELECT 
  'INFLUENCER_CONTENT - Before cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN post_url IS NOT NULL AND post_url != '' THEN 1 END) as records_with_post_urls
FROM influencer_content;

-- Show what we're clearing from influencer_content
SELECT 
  'INFLUENCER_CONTENT - Records to clear:' as table_name,
  ic.id,
  ic.post_url,
  ic.post_type,
  ic.caption,
  i.display_name as influencer_name,
  ip.platform
FROM influencer_content ic
JOIN influencer_platforms ip ON ic.influencer_platform_id = ip.id
JOIN influencers i ON ip.influencer_id = i.id
WHERE ic.post_url IS NOT NULL 
  AND ic.post_url != '';

-- Clear influencer_content post URLs
UPDATE influencer_content 
SET 
  post_url = '',
  updated_at = NOW()
WHERE post_url IS NOT NULL 
  AND post_url != '';

-- ========================================
-- 4. VERIFICATION - AFTER CLEANUP
-- ========================================

-- Verify campaign_influencers cleanup
SELECT 
  'CAMPAIGN_INFLUENCERS - After cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
FROM campaign_influencers;

-- Verify campaign_content_submissions cleanup
SELECT 
  'CAMPAIGN_CONTENT_SUBMISSIONS - After cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN content_url IS NOT NULL AND content_url != '' THEN 1 END) as records_with_content_urls
FROM campaign_content_submissions;

-- Verify influencer_content cleanup
SELECT 
  'INFLUENCER_CONTENT - After cleanup:' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN post_url IS NOT NULL AND post_url != '' THEN 1 END) as records_with_post_urls
FROM influencer_content;

-- ========================================
-- 5. RESET INFLUENCER ANALYTICS
-- ========================================

-- Reset influencer analytics for all affected influencers
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
  SELECT DISTINCT ci.influencer_id 
  FROM campaign_influencers ci
  WHERE ci.updated_at >= NOW() - INTERVAL '1 minute'
  
  UNION
  
  SELECT DISTINCT ip.influencer_id
  FROM influencer_content ic
  JOIN influencer_platforms ip ON ic.influencer_platform_id = ip.id
  WHERE ic.updated_at >= NOW() - INTERVAL '1 minute'
);

-- Show how many influencers had analytics reset
SELECT 
  'INFLUENCER ANALYTICS RESET:' as action,
  COUNT(*) as reset_count
FROM influencers 
WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 6. FINAL SUMMARY
-- ========================================

SELECT 
  'FINAL SUMMARY:' as status,
  'All content links cleared from all tables' as message,
  NOW() as completed_at;

-- Show summary of what was cleared
SELECT 
  'CLEANUP SUMMARY:' as summary_type,
  'campaign_influencers.content_links' as table_column,
  'Cleared all content links and discount codes' as action
UNION ALL
SELECT 
  'CLEANUP SUMMARY:',
  'campaign_content_submissions.content_url',
  'Cleared all content submission URLs'
UNION ALL
SELECT 
  'CLEANUP SUMMARY:',
  'influencer_content.post_url',
  'Cleared all influencer post URLs'
UNION ALL
SELECT 
  'CLEANUP SUMMARY:',
  'influencers analytics',
  'Reset all influencer analytics to 0';
