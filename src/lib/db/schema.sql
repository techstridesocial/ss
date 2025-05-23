-- Stride Social Dashboard Database Schema
-- Complete schema supporting influencer roster requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE USER MANAGEMENT
-- ========================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
    'BRAND',
    'INFLUENCER_SIGNED', 
    'INFLUENCER_PARTNERED',
    'STAFF',
    'ADMIN'
);

-- User status enum
CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE', 
    'PENDING',
    'SUSPENDED'
);

-- Main users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User profiles with personal information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PLATFORM DEFINITIONS
-- ========================================

-- Social media platforms
CREATE TYPE platform_type AS ENUM (
    'INSTAGRAM',
    'TIKTOK', 
    'YOUTUBE',
    'TWITTER',
    'FACEBOOK',
    'TWITCH'
);

-- ========================================
-- INFLUENCER MANAGEMENT
-- ========================================

-- Influencer-specific data
CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    niche_primary VARCHAR(50),
    niches TEXT[], -- Array of niche tags
    total_followers INTEGER DEFAULT 0,
    total_engagement_rate DECIMAL(5,4), -- e.g., 0.0425 for 4.25%
    total_avg_views INTEGER DEFAULT 0,
    estimated_promotion_views INTEGER DEFAULT 0, -- 15% calculation
    ready_for_campaigns BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Tier-based update tracking
    tier VARCHAR(20) DEFAULT 'SILVER' CHECK (tier IN ('GOLD', 'SILVER', 'PARTNERED', 'BRONZE')),
    modash_last_updated TIMESTAMP WITH TIME ZONE,
    modash_update_priority INTEGER DEFAULT 50, -- 1-100 priority score
    auto_update_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform-specific influencer accounts
CREATE TABLE influencer_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    username VARCHAR(100),
    profile_url TEXT,
    followers INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4),
    avg_views INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT FALSE, -- OAuth connection status
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(influencer_id, platform)
);

-- Audience demographics data
CREATE TABLE audience_demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    
    -- Age breakdown (percentages)
    age_13_17 DECIMAL(5,2) DEFAULT 0,
    age_18_24 DECIMAL(5,2) DEFAULT 0,
    age_25_34 DECIMAL(5,2) DEFAULT 0,
    age_35_44 DECIMAL(5,2) DEFAULT 0,
    age_45_54 DECIMAL(5,2) DEFAULT 0,
    age_55_plus DECIMAL(5,2) DEFAULT 0,
    
    -- Gender breakdown (percentages)
    gender_male DECIMAL(5,2) DEFAULT 0,
    gender_female DECIMAL(5,2) DEFAULT 0,
    gender_other DECIMAL(5,2) DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience location breakdown
CREATE TABLE audience_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    country_code VARCHAR(2), -- ISO country code
    country_name VARCHAR(100),
    percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience language breakdown  
CREATE TABLE audience_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    language_code VARCHAR(5), -- e.g., 'en', 'es', 'fr'
    language_name VARCHAR(50),
    percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent content posts
CREATE TABLE influencer_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    post_url TEXT,
    thumbnail_url TEXT,
    caption TEXT,
    post_type VARCHAR(20), -- 'image', 'video', 'reel', 'story'
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- BRAND MANAGEMENT
-- ========================================

-- Brand-specific information
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    website_url TEXT,
    company_size VARCHAR(50), -- 'startup', 'small', 'medium', 'large', 'enterprise'
    annual_budget_range VARCHAR(50), -- '0-10k', '10k-50k', '50k-100k', '100k+'
    preferred_niches TEXT[], -- Array of preferred niches
    preferred_regions TEXT[], -- Array of preferred regions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand team members (multiple contacts per brand)
CREATE TABLE brand_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(100), -- 'Marketing Manager', 'CMO', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CAMPAIGN MANAGEMENT
-- ========================================

-- Campaign status enum
CREATE TYPE campaign_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED', 
    'COMPLETED',
    'CANCELLED'
);

-- Campaign participation status
CREATE TYPE participation_status AS ENUM (
    'INVITED',
    'ACCEPTED',
    'DECLINED',
    'IN_PROGRESS',
    'CONTENT_SUBMITTED',
    'COMPLETED',
    'PAID'
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status campaign_status DEFAULT 'DRAFT',
    budget DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    deliverables TEXT, -- JSON or text describing what's expected
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign influencer assignments
CREATE TABLE campaign_influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    status participation_status DEFAULT 'INVITED',
    compensation_amount DECIMAL(10,2),
    notes TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    product_shipped BOOLEAN DEFAULT FALSE,
    content_posted BOOLEAN DEFAULT FALSE,
    payment_released BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, influencer_id)
);

-- ========================================
-- SHORTLISTING SYSTEM
-- ========================================

-- Brand shortlists (saved influencer collections)
CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shortlisted influencers
CREATE TABLE shortlist_influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shortlist_id UUID REFERENCES shortlists(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(shortlist_id, influencer_id)
);

-- ========================================
-- FINANCIAL MANAGEMENT
-- ========================================

-- Payment method types
CREATE TYPE payment_method_type AS ENUM (
    'PAYPAL',
    'BANK_TRANSFER',
    'WISE',
    'STRIPE'
);

-- Encrypted financial information
CREATE TABLE influencer_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    payment_method payment_method_type NOT NULL,
    encrypted_details TEXT NOT NULL, -- Encrypted JSON with payment details
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_influencer_id UUID REFERENCES campaign_influencers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    transaction_id VARCHAR(255), -- External payment processor ID
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SYSTEM MANAGEMENT
-- ========================================

-- Audit logs for tracking all actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'user', 'campaign', 'influencer', etc.
    entity_id UUID,
    details JSONB, -- Flexible data storage
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth tokens (encrypted storage)
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Niche tags (predefined + custom)
CREATE TABLE niche_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'beauty', 'fitness', 'fashion', etc.
    is_predefined BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);

-- Influencer search indexes
CREATE INDEX idx_influencers_niches ON influencers USING GIN(niches);
CREATE INDEX idx_influencers_followers ON influencers(total_followers);
CREATE INDEX idx_influencers_engagement ON influencers(total_engagement_rate);

-- Platform data indexes
CREATE INDEX idx_platform_influencer ON influencer_platforms(influencer_id);
CREATE INDEX idx_platform_type ON influencer_platforms(platform);
CREATE INDEX idx_platform_followers ON influencer_platforms(followers);

-- Campaign indexes
CREATE INDEX idx_campaigns_brand ON campaigns(brand_id);
CREATE INDEX idx_campaign_influencers_campaign ON campaign_influencers(campaign_id);
CREATE INDEX idx_campaign_influencers_influencer ON campaign_influencers(influencer_id);

-- Shortlist indexes
CREATE INDEX idx_shortlists_brand ON shortlists(brand_id);
CREATE INDEX idx_shortlist_influencers_shortlist ON shortlist_influencers(shortlist_id);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_influencer_platforms_updated_at BEFORE UPDATE ON influencer_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_influencers_updated_at BEFORE UPDATE ON campaign_influencers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shortlists_updated_at BEFORE UPDATE ON shortlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_influencer_payments_updated_at BEFORE UPDATE ON influencer_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 