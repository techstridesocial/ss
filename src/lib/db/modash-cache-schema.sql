-- ========================================
-- MODASH DATA CACHE TABLES
-- Store rich Modash profile data with 4-week update cycles
-- ========================================

-- Main cached profile data table
CREATE TABLE IF NOT EXISTS modash_profile_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_platform_id UUID REFERENCES influencer_platforms(id) ON DELETE CASCADE,
    modash_user_id VARCHAR(50) NOT NULL,
    platform platform_type NOT NULL,
    
    -- Cache metadata
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '4 weeks'),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_priority INTEGER DEFAULT 50, -- Higher = update sooner
    
    -- Core profile data (from profile.profile)
    username VARCHAR(100),
    fullname VARCHAR(255),
    followers INTEGER,
    following INTEGER,
    engagement_rate DECIMAL(10,8),
    avg_likes INTEGER,
    avg_comments INTEGER,
    avg_views INTEGER,
    avg_reels_plays INTEGER,
    posts_count INTEGER,
    profile_url TEXT,
    picture_url TEXT,
    bio TEXT,
    
    -- Profile metadata
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2),
    age_group VARCHAR(20),
    gender VARCHAR(20),
    language_code VARCHAR(10),
    language_name VARCHAR(50),
    is_private BOOLEAN,
    is_verified BOOLEAN,
    account_type VARCHAR(50),
    
    -- Contact information (JSON for flexibility)
    contacts JSONB,
    
    -- Content metadata
    hashtags JSONB, -- Array of {tag, weight}
    mentions JSONB, -- Array of {tag, weight}
    
    -- Performance stats with comparisons
    stats JSONB, -- {avgLikes: {value, compared}, followers: {value, compared}, etc}
    
    -- Content arrays
    recent_posts JSONB, -- Array of recent post objects
    popular_posts JSONB, -- Array of top performing posts
    sponsored_posts JSONB, -- Array of brand collaboration posts
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(influencer_platform_id, platform)
);

-- Audience demographics cache table
CREATE TABLE IF NOT EXISTS modash_audience_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_cache_id UUID REFERENCES modash_profile_cache(id) ON DELETE CASCADE,
    
    -- Audience quality metrics
    notable_percentage DECIMAL(5,4), -- Percentage of notable followers
    credibility_score DECIMAL(5,4), -- Credibility score (0-1)
    fake_followers_percentage DECIMAL(5,2), -- Calculated from credibility
    
    -- Demographic breakdowns (JSON arrays)
    genders JSONB, -- [{code, weight}] e.g. male/female/other
    ages JSONB, -- [{code, weight}] e.g. 18-24, 25-34
    genders_per_age JSONB, -- [{code, male, female}] cross-analysis
    
    -- Geographic data
    geo_countries JSONB, -- [{name, weight, code}]
    geo_cities JSONB, -- [{name, weight}]
    geo_states JSONB, -- [{name, weight}]
    
    -- Interests and brand affinity
    interests JSONB, -- [{name, weight}]
    brand_affinity JSONB, -- [{name, weight}]
    languages JSONB, -- [{code, name, weight}]
    ethnicities JSONB, -- [{code, name, weight}]
    
    -- Advanced audience metrics
    audience_reachability JSONB, -- Follower reach distribution
    audience_types JSONB, -- mass_followers, influencers, real, suspicious
    notable_users JSONB, -- Array of notable follower profiles
    audience_lookalikes JSONB, -- Similar audience profiles
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update tracking table for monitoring cache freshness
CREATE TABLE IF NOT EXISTS modash_update_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_cache_id UUID REFERENCES modash_profile_cache(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL, -- 'scheduled', 'manual', 'initial'
    status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    credits_used INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_modash_cache_platform ON modash_profile_cache(influencer_platform_id);
CREATE INDEX IF NOT EXISTS idx_modash_cache_expires ON modash_profile_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_modash_cache_priority ON modash_profile_cache(update_priority DESC, expires_at ASC);
CREATE INDEX IF NOT EXISTS idx_modash_update_log_status ON modash_update_log(status, started_at);

-- Add comments for documentation
COMMENT ON TABLE modash_profile_cache IS 'Cached Modash profile data with 4-week refresh cycle';
COMMENT ON TABLE modash_audience_cache IS 'Cached audience demographics and interests data';
COMMENT ON TABLE modash_update_log IS 'Tracking log for Modash data update operations';

COMMENT ON COLUMN modash_profile_cache.expires_at IS 'When this cache entry expires (4 weeks from last update)';
COMMENT ON COLUMN modash_profile_cache.update_priority IS 'Priority for updates: higher = update sooner (1-100)';
COMMENT ON COLUMN modash_update_log.credits_used IS 'Number of Modash credits consumed for this update';

-- Verify the migration
SELECT 'Modash cache schema created successfully' as status; 
