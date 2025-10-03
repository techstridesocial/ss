-- Check Analytics Values in Database
-- Run this script to see the actual analytics values causing the inflated numbers

-- ========================================
-- 1. CHECK SPECIFIC CAMPAIGN INFLUENCERS
-- ========================================

SELECT 
  'CAMPAIGN INFLUENCERS ANALYTICS:' as status,
  '' as separator;

SELECT 
  i.id,
  i.display_name,
  i.total_engagements,
  i.total_engagement_rate,
  i.avg_engagement_rate,
  i.estimated_reach,
  i.total_likes,
  i.total_comments,
  i.total_views,
  i.analytics_updated_at
FROM influencers i
WHERE i.display_name IN ('test', 'Kylie Jenner', 'MrBeast', 'Test Creator')
ORDER BY i.total_engagements DESC;

-- ========================================
-- 2. CALCULATE FRONTEND TOTALS
-- ========================================

SELECT 
  'FRONTEND CALCULATION TOTALS:' as status,
  '' as separator;

SELECT 
  SUM(i.total_engagements) as total_engagements,
  SUM(i.total_views) as total_views,
  SUM(i.total_likes) as total_likes,
  SUM(i.total_comments) as total_comments,
  SUM(i.estimated_reach) as total_reach,
  AVG(i.avg_engagement_rate) as avg_engagement_rate,
  COUNT(*) as influencer_count
FROM influencers i
WHERE i.display_name IN ('test', 'Kylie Jenner', 'MrBeast', 'Test Creator');

-- ========================================
-- 3. CHECK FOR SUSPICIOUS VALUES
-- ========================================

SELECT 
  'SUSPICIOUS VALUES CHECK:' as status,
  '' as separator;

SELECT 
  'INFLUENCERS WITH HIGH ENGAGEMENTS:' as check_type,
  COUNT(*) as count
FROM influencers 
WHERE total_engagements > 1000000;

SELECT 
  'INFLUENCERS WITH HIGH VIEWS:' as check_type,
  COUNT(*) as count
FROM influencers 
WHERE total_views > 1000000;

SELECT 
  'INFLUENCERS WITH HIGH LIKES:' as check_type,
  COUNT(*) as count
FROM influencers 
WHERE total_likes > 1000000;

SELECT 
  'INFLUENCERS WITH HIGH COMMENTS:' as check_type,
  COUNT(*) as count
FROM influencers 
WHERE total_comments > 1000000;

-- ========================================
-- 4. SHOW SPECIFIC SUSPICIOUS RECORDS
-- ========================================

SELECT 
  'SPECIFIC SUSPICIOUS RECORDS:' as status,
  '' as separator;

SELECT 
  id,
  display_name,
  total_engagements,
  total_views,
  total_likes,
  total_comments,
  avg_engagement_rate,
  analytics_updated_at
FROM influencers 
WHERE total_engagements > 1000000 
   OR total_views > 1000000 
   OR total_likes > 1000000 
   OR total_comments > 1000000
ORDER BY total_engagements DESC;

-- ========================================
-- 5. CHECK CONTENT LINKS
-- ========================================

SELECT 
  'CONTENT LINKS CHECK:' as status,
  '' as separator;

SELECT 
  ci.id as campaign_influencer_id,
  i.display_name,
  ci.content_links,
  jsonb_array_length(ci.content_links) as link_count,
  ci.updated_at
FROM campaign_influencers ci
JOIN influencers i ON ci.influencer_id = i.id
WHERE ci.campaign_id = '502a8b9e-d676-4278-a675-dba120c80abc'
ORDER BY i.display_name;

-- ========================================
-- 6. CHECK ALL INFLUENCERS ANALYTICS
-- ========================================

SELECT 
  'ALL INFLUENCERS ANALYTICS SUMMARY:' as status,
  '' as separator;

SELECT 
  COUNT(*) as total_influencers,
  COUNT(CASE WHEN total_engagements > 0 THEN 1 END) as with_engagements,
  COUNT(CASE WHEN total_views > 0 THEN 1 END) as with_views,
  COUNT(CASE WHEN total_likes > 0 THEN 1 END) as with_likes,
  COUNT(CASE WHEN total_comments > 0 THEN 1 END) as with_comments,
  MAX(total_engagements) as max_engagements,
  MAX(total_views) as max_views,
  MAX(total_likes) as max_likes,
  MAX(total_comments) as max_comments,
  AVG(avg_engagement_rate) as avg_er_rate
FROM influencers;

-- ========================================
-- 7. RECENT ANALYTICS UPDATES
-- ========================================

SELECT 
  'RECENT ANALYTICS UPDATES:' as status,
  '' as separator;

SELECT 
  display_name,
  total_engagements,
  total_views,
  analytics_updated_at
FROM influencers 
WHERE analytics_updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY analytics_updated_at DESC;

-- ========================================
-- 8. CAMPAIGN INFLUENCER ASSIGNMENTS
-- ========================================

SELECT 
  'CAMPAIGN INFLUENCER ASSIGNMENTS:' as status,
  '' as separator;

SELECT 
  ci.id,
  i.display_name,
  ci.status,
  ci.content_links,
  ci.compensation_amount,
  ci.created_at
FROM campaign_influencers ci
JOIN influencers i ON ci.influencer_id = i.id
WHERE ci.campaign_id = '502a8b9e-d676-4278-a675-dba120c80abc'
ORDER BY ci.created_at DESC;
