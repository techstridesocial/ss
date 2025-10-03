-- Fix Corrupted Analytics Data
-- This script identifies and fixes corrupted analytics data that shows unrealistic numbers

-- ========================================
-- 1. IDENTIFY CORRUPTED DATA
-- ========================================

-- Show influencers with suspiciously high analytics
SELECT 
  'CORRUPTED ANALYTICS DETECTED:' as status,
  COUNT(*) as affected_influencers
FROM influencers 
WHERE total_engagements > 1000000 
   OR total_views > 1000000 
   OR total_likes > 1000000 
   OR total_comments > 1000000;

-- Show specific corrupted records
SELECT 
  'CORRUPTED RECORDS:' as status,
  id,
  display_name,
  total_engagements,
  total_views,
  total_likes,
  total_comments,
  total_engagement_rate,
  analytics_updated_at
FROM influencers 
WHERE total_engagements > 1000000 
   OR total_views > 1000000 
   OR total_likes > 1000000 
   OR total_comments > 1000000
ORDER BY total_engagements DESC
LIMIT 10;

-- ========================================
-- 2. RESET CORRUPTED INFLUENCER ANALYTICS
-- ========================================

-- Reset all corrupted influencer analytics to 0
UPDATE influencers 
SET 
  total_engagements = 0,
  total_engagement_rate = 0,
  avg_engagement_rate = 0,
  estimated_reach = 0,
  total_likes = 0,
  total_comments = 0,
  total_views = 0,
  total_avg_views = 0,
  estimated_promotion_views = 0,
  analytics_updated_at = NOW()
WHERE total_engagements > 1000000 
   OR total_views > 1000000 
   OR total_likes > 1000000 
   OR total_comments > 1000000;

-- Show how many influencers were reset
SELECT 
  'INFLUENCER ANALYTICS RESET:' as action,
  COUNT(*) as reset_count
FROM influencers 
WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 3. RESET PLATFORM ANALYTICS
-- ========================================

-- Reset platform-specific analytics for affected influencers
UPDATE influencer_platforms 
SET 
  avg_views = 0,
  engagement_rate = 0,
  last_synced = NOW()
WHERE influencer_id IN (
  SELECT id FROM influencers 
  WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute'
);

-- Show how many platform records were reset
SELECT 
  'PLATFORM ANALYTICS RESET:' as action,
  COUNT(*) as reset_count
FROM influencer_platforms 
WHERE last_synced >= NOW() - INTERVAL '1 minute';

-- ========================================
-- 4. CLEAR CORRUPTED CONTENT DATA
-- ========================================

-- Clear corrupted campaign content submissions
UPDATE campaign_content_submissions 
SET 
  content_url = '',
  views = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  saves = 0,
  updated_at = NOW()
WHERE views > 1000000 
   OR likes > 1000000 
   OR comments > 1000000 
   OR shares > 1000000;

-- Clear corrupted influencer content
UPDATE influencer_content 
SET 
  post_url = '',
  views = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  updated_at = NOW()
WHERE views > 1000000 
   OR likes > 1000000 
   OR comments > 1000000 
   OR shares > 1000000;

-- Clear all content links (they might be corrupted too)
UPDATE campaign_influencers 
SET 
  content_links = '[]'::jsonb,
  updated_at = NOW()
WHERE content_links IS NOT NULL 
  AND content_links != '[]'::jsonb;

-- ========================================
-- 5. VERIFICATION
-- ========================================

-- Verify all analytics are now clean
SELECT 
  'VERIFICATION - CLEAN ANALYTICS:' as status,
  COUNT(*) as total_influencers,
  COUNT(CASE WHEN total_engagements > 0 THEN 1 END) as with_engagements,
  COUNT(CASE WHEN total_views > 0 THEN 1 END) as with_views,
  COUNT(CASE WHEN total_likes > 0 THEN 1 END) as with_likes,
  COUNT(CASE WHEN total_comments > 0 THEN 1 END) as with_comments
FROM influencers;

-- Check for any remaining corrupted data
SELECT 
  'REMAINING CORRUPTED DATA CHECK:' as status,
  COUNT(*) as still_corrupted
FROM influencers 
WHERE total_engagements > 1000000 
   OR total_views > 1000000 
   OR total_likes > 1000000 
   OR total_comments > 1000000;

-- Show content links status
SELECT 
  'CONTENT LINKS STATUS:' as status,
  COUNT(*) as total_campaign_influencers,
  COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb THEN 1 END) as with_content_links
FROM campaign_influencers;

-- ========================================
-- 6. FINAL SUMMARY
-- ========================================

SELECT 
  'FINAL SUMMARY:' as status,
  'Analytics corruption fix completed' as message,
  NOW() as completed_at;

-- Show what was fixed
SELECT 
  'FIX SUMMARY:' as summary_type,
  'influencer analytics' as table_column,
  'Reset all corrupted analytics to 0' as action
UNION ALL
SELECT 
  'FIX SUMMARY:',
  'platform analytics',
  'Reset platform-specific analytics to 0'
UNION ALL
SELECT 
  'FIX SUMMARY:',
  'content submissions',
  'Cleared corrupted content submission data'
UNION ALL
SELECT 
  'FIX SUMMARY:',
  'influencer content',
  'Cleared corrupted influencer content data'
UNION ALL
SELECT 
  'FIX SUMMARY:',
  'content links',
  'Cleared all content links for fresh start';
