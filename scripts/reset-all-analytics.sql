-- COMPLETE ANALYTICS RESET - Remove ALL content links and reset analytics to 0
-- This will clean up the entire analytics system

-- ========================================
-- 1. RESET ALL INFLUENCER ANALYTICS TO 0
-- ========================================

UPDATE influencers 
SET 
  total_engagements = 0,
  total_engagement_rate = 0,
  avg_engagement_rate = 0,
  estimated_reach = 0,
  total_avg_views = 0,
  estimated_promotion_views = 0,
  total_likes = 0,
  total_comments = 0,
  total_views = 0,
  analytics_updated_at = NOW()
WHERE total_engagements > 0 
   OR total_views > 0 
   OR total_likes > 0 
   OR total_comments > 0
   OR avg_engagement_rate > 0;

-- Show how many influencers were reset
SELECT 
  'INFLUENCER ANALYTICS RESET:' as action,
  COUNT(*) as reset_count
FROM influencers 
WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 2. RESET ALL PLATFORM ANALYTICS TO 0
-- ========================================

UPDATE influencer_platforms 
SET 
  avg_views = 0,
  engagement_rate = 0,
  last_synced = NOW()
WHERE avg_views > 0 OR engagement_rate > 0;

-- Show how many platform records were reset
SELECT 
  'PLATFORM ANALYTICS RESET:' as action,
  COUNT(*) as reset_count
FROM influencer_platforms 
WHERE last_synced >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 3. CLEAR ALL CONTENT LINKS FROM CAMPAIGN_INFLUENCERS
-- ========================================

UPDATE campaign_influencers 
SET 
  content_links = '[]'::jsonb,
  discount_code = NULL,
  updated_at = NOW()
WHERE content_links IS NOT NULL 
  AND content_links != '[]'::jsonb;

-- Show how many campaign influencer records were cleared
SELECT 
  'CAMPAIGN INFLUENCER CONTENT LINKS CLEARED:' as action,
  COUNT(*) as cleared_count
FROM campaign_influencers 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 4. CLEAR ALL CONTENT LINKS FROM CAMPAIGN_CONTENT_SUBMISSIONS
-- ========================================

UPDATE campaign_content_submissions 
SET 
  content_url = '',
  views = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  saves = 0,
  updated_at = NOW()
WHERE content_url != '' 
   OR views > 0 
   OR likes > 0 
   OR comments > 0 
   OR shares > 0 
   OR saves > 0;

-- Show how many content submissions were cleared
SELECT 
  'CONTENT SUBMISSIONS CLEARED:' as action,
  COUNT(*) as cleared_count
FROM campaign_content_submissions 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 5. CLEAR ALL CONTENT LINKS FROM INFLUENCER_CONTENT
-- ========================================

UPDATE influencer_content 
SET 
  post_url = '',
  views = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  updated_at = NOW()
WHERE post_url != '' 
   OR views > 0 
   OR likes > 0 
   OR comments > 0 
   OR shares > 0;

-- Show how many influencer content records were cleared
SELECT 
  'INFLUENCER CONTENT CLEARED:' as action,
  COUNT(*) as cleared_count
FROM influencer_content 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 6. VERIFICATION - CHECK ALL ANALYTICS ARE 0
-- ========================================

SELECT 
  'VERIFICATION - ALL ANALYTICS SHOULD BE 0:' as status,
  '' as separator;

-- Check influencer analytics
SELECT 
  'INFLUENCER ANALYTICS CHECK:' as check_type,
  COUNT(*) as total_influencers,
  COUNT(CASE WHEN total_engagements > 0 THEN 1 END) as with_engagements,
  COUNT(CASE WHEN total_views > 0 THEN 1 END) as with_views,
  COUNT(CASE WHEN total_likes > 0 THEN 1 END) as with_likes,
  COUNT(CASE WHEN total_comments > 0 THEN 1 END) as with_comments,
  COUNT(CASE WHEN avg_engagement_rate > 0 THEN 1 END) as with_er_rate
FROM influencers;

-- Check content links
SELECT 
  'CONTENT LINKS CHECK:' as check_type,
  COUNT(*) as total_campaign_influencers,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb THEN 1 END) as with_content_links,
  COUNT(CASE WHEN discount_code IS NOT NULL THEN 1 END) as with_discount_codes
FROM campaign_influencers;

-- Check content submissions
SELECT 
  'CONTENT SUBMISSIONS CHECK:' as check_type,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN content_url != '' THEN 1 END) as with_content_urls,
  COUNT(CASE WHEN views > 0 THEN 1 END) as with_views,
  COUNT(CASE WHEN likes > 0 THEN 1 END) as with_likes
FROM campaign_content_submissions;

-- Check influencer content
SELECT 
  'INFLUENCER CONTENT CHECK:' as check_type,
  COUNT(*) as total_content,
  COUNT(CASE WHEN post_url != '' THEN 1 END) as with_post_urls,
  COUNT(CASE WHEN views > 0 THEN 1 END) as with_views,
  COUNT(CASE WHEN likes > 0 THEN 1 END) as with_likes
FROM influencer_content;

-- ========================================
-- 7. FINAL SUMMARY
-- ========================================

SELECT 
  'FINAL SUMMARY - ANALYTICS RESET COMPLETED:' as status,
  NOW() as completed_at;

SELECT 
  'RESET SUMMARY:' as summary_type,
  'All influencer analytics' as item,
  'Reset to 0' as action
UNION ALL
SELECT 
  'RESET SUMMARY:',
  'All platform analytics',
  'Reset to 0'
UNION ALL
SELECT 
  'RESET SUMMARY:',
  'All campaign content links',
  'Cleared to []'
UNION ALL
SELECT 
  'RESET SUMMARY:',
  'All content submissions',
  'Cleared URLs and metrics'
UNION ALL
SELECT 
  'RESET SUMMARY:',
  'All influencer content',
  'Cleared URLs and metrics'
UNION ALL
SELECT 
  'RESET SUMMARY:',
  'All discount codes',
  'Cleared to NULL';

-- ========================================
-- 8. SHOW CURRENT STATE
-- ========================================

SELECT 
  'CURRENT STATE AFTER RESET:' as status,
  '' as separator;

-- Show current analytics state
SELECT 
  'CURRENT ANALYTICS STATE:' as state_type,
  COUNT(*) as total_influencers,
  MAX(total_engagements) as max_engagements,
  MAX(total_views) as max_views,
  MAX(total_likes) as max_likes,
  MAX(total_comments) as max_comments,
  MAX(avg_engagement_rate) as max_er_rate
FROM influencers;

-- Show current content links state
SELECT 
  'CURRENT CONTENT LINKS STATE:' as state_type,
  COUNT(*) as total_campaign_influencers,
  COUNT(CASE WHEN content_links != '[]'::jsonb THEN 1 END) as non_empty_links,
  COUNT(CASE WHEN discount_code IS NOT NULL THEN 1 END) as with_discount_codes
FROM campaign_influencers;
