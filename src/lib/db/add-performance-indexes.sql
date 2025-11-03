-- ========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ========================================
-- This migration adds composite indexes for common query patterns
-- to improve query performance across the application

-- Campaign Influencers Performance Indexes
-- Commonly queried by status and campaign_id together
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_influencers_status_campaign 
  ON campaign_influencers(status, campaign_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_influencers_campaign_status
  ON campaign_influencers(campaign_id, status);

-- Influencer payment status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_influencers_payment_status
  ON campaign_influencers(payment_status, campaign_id)
  WHERE payment_status IS NOT NULL;

-- Influencer Platforms Performance Indexes
-- Commonly filtered by connection status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencer_platforms_connected 
  ON influencer_platforms(is_connected, influencer_id) 
  WHERE is_connected = true;

-- Platform-specific queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencer_platforms_platform_connected
  ON influencer_platforms(platform, is_connected, influencer_id)
  WHERE is_connected = true;

-- Modash Cache Lookup Optimization
-- Multi-column index for cache lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modash_cache_lookup 
  ON modash_profile_cache(influencer_platform_id, platform, expires_at);

-- Fresh cache queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modash_cache_fresh
  ON modash_profile_cache(expires_at, last_updated)
  WHERE expires_at > NOW();

-- Priority-based update queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modash_cache_priority
  ON modash_profile_cache(update_priority DESC, expires_at)
  WHERE update_priority > 75;

-- Campaigns Performance Indexes
-- Brand campaigns lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_brand_status
  ON campaigns(brand_id, status, created_at DESC);

-- Active campaigns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_active
  ON campaigns(status, start_date, end_date)
  WHERE status IN ('ACTIVE', 'DRAFT');

-- Staff assignment queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_assigned_staff
  ON campaigns(assigned_staff_id, status)
  WHERE assigned_staff_id IS NOT NULL;

-- Influencers Performance Indexes
-- Tier-based queries for update scheduling
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_tier_update
  ON influencers(tier, modash_last_updated);

-- Ready for campaigns filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_ready
  ON influencers(ready_for_campaigns, tier)
  WHERE ready_for_campaigns = true;

-- Staff assignment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_assigned
  ON influencers(assigned_to)
  WHERE assigned_to IS NOT NULL;

-- User Profiles Performance Indexes
-- Onboarding status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_onboarded
  ON user_profiles(is_onboarded, user_id);

-- Users Performance Indexes
-- Role-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status
  ON users(role, status);

-- Active users by role
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_role
  ON users(role, last_login DESC)
  WHERE status = 'ACTIVE';

-- Shortlists Performance Indexes
-- Brand shortlists with timestamps
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shortlists_brand_created
  ON shortlists(brand_id, created_at DESC);

-- Shortlist Influencers Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shortlist_influencers_list
  ON shortlist_influencers(shortlist_id, added_at DESC);

-- Influencer presence across shortlists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shortlist_influencers_influencer
  ON shortlist_influencers(influencer_id, shortlist_id);

-- Audit Logs Performance Indexes
-- Recent activity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_recent
  ON audit_logs(created_at DESC, user_id);

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action
  ON audit_logs(user_id, action, created_at DESC);

-- Entity audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);

-- Content Submissions Performance Indexes
-- Pending content review
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_pending
  ON campaign_content_submissions(status, submitted_at DESC)
  WHERE status IN ('PENDING', 'SUBMITTED');

-- Campaign content tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_campaign
  ON campaign_content_submissions(campaign_influencer_id, status);

-- Brands Performance Indexes
-- User brand lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_user
  ON brands(user_id);

-- Invitations Performance Indexes
-- Pending invitations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_invitations_pending
  ON campaign_invitations(status, created_at DESC)
  WHERE status = 'PENDING';

-- Tracking Links Performance Indexes
-- Influencer links lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_links_influencer
  ON tracking_links(influencer_id, created_at DESC);

-- Short.io lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_links_short_io
  ON tracking_links(short_io_link_id);

-- Modash Update Log Performance Indexes
-- Recent updates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modash_update_log_recent
  ON modash_update_log(completed_at DESC)
  WHERE status = 'completed';

-- Credits usage tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modash_update_log_credits
  ON modash_update_log(started_at, credits_used)
  WHERE started_at >= DATE_TRUNC('month', NOW());

-- ========================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ========================================
-- Update statistics for the query planner

ANALYZE campaigns;
ANALYZE campaign_influencers;
ANALYZE influencers;
ANALYZE influencer_platforms;
ANALYZE modash_profile_cache;
ANALYZE users;
ANALYZE user_profiles;
ANALYZE brands;
ANALYZE shortlists;
ANALYZE shortlist_influencers;
ANALYZE audit_logs;
ANALYZE campaign_content_submissions;

