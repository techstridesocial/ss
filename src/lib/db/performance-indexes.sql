-- Performance Optimization Indexes
-- Created: 2026-01-12
-- Purpose: Add missing indexes for frequently queried fields

-- ========================================
-- QUOTATIONS PERFORMANCE
-- ========================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_quotations_brand_id ON quotations(brand_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_requested_at ON quotations(requested_at DESC);

-- Composite index for common query pattern (brand + status filter)
CREATE INDEX IF NOT EXISTS idx_quotations_brand_status ON quotations(brand_id, status);

-- Index for staff view (all quotations ordered by request date)
CREATE INDEX IF NOT EXISTS idx_quotations_status_requested ON quotations(status, requested_at DESC);

-- ========================================
-- SHORTLISTS PERFORMANCE
-- ========================================

-- Composite index for brand's shortlists ordered by recent activity
CREATE INDEX IF NOT EXISTS idx_shortlists_brand_updated ON shortlists(brand_id, updated_at DESC);

-- Index for shortlist influencer lookups
CREATE INDEX IF NOT EXISTS idx_shortlist_influencers_influencer ON shortlist_influencers(influencer_id);

-- ========================================
-- CAMPAIGN PERFORMANCE
-- ========================================

-- Campaign influencer status for filtering
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_status ON campaign_influencers(status);

-- Composite index for campaign participant queries
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_campaign_status ON campaign_influencers(campaign_id, status);

-- ========================================
-- USER PROFILES PERFORMANCE
-- ========================================

-- Faster user profile lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ========================================
-- INFLUENCER SEARCH PERFORMANCE
-- ========================================

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_influencers_tier_followers ON influencers(tier, total_followers DESC);

-- Index for engagement rate filtering
CREATE INDEX IF NOT EXISTS idx_influencers_engagement_followers ON influencers(total_engagement_rate DESC, total_followers DESC);

-- ========================================
-- CAMPAIGN CONTENT SUBMISSIONS PERFORMANCE
-- ========================================

-- Index for brand viewing their submissions
CREATE INDEX IF NOT EXISTS idx_campaign_content_brand_status ON campaign_content_submissions(campaign_influencer_id, status);

-- ========================================
-- VERIFICATION
-- ========================================

-- Query to check if indexes were created successfully
-- Run this after migration:
-- SELECT schemaname, tablename, indexname 
-- FROM pg_indexes 
-- WHERE tablename IN ('quotations', 'shortlists', 'campaign_influencers', 'influencers')
-- ORDER BY tablename, indexname;
