-- ========================================
-- STAFF SHARED SAVED INFLUENCERS SYSTEM
-- For discovery page "Saved" tab functionality
-- ========================================

-- Table for staff-shared saved influencers
CREATE TABLE IF NOT EXISTS staff_saved_influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Influencer identification
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    platform platform_type NOT NULL,
    
    -- Core metrics
    followers INTEGER NOT NULL DEFAULT 0,
    engagement_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    avg_views INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    
    -- Profile data
    profile_picture TEXT,
    bio TEXT,
    location VARCHAR(255),
    niches TEXT[], -- Array of niche tags
    
    -- External references
    profile_url TEXT,
    modash_user_id VARCHAR(50),
    discovered_influencer_id UUID REFERENCES discovered_influencers(id) ON DELETE SET NULL,
    
    -- Complete modash data for popup display
    modash_data JSONB, -- Full API response for detailed popup
    
    -- Management tracking
    saved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Roster management
    added_to_roster BOOLEAN DEFAULT FALSE,
    added_to_roster_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_to_roster_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique username per platform
    UNIQUE(username, platform)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_platform ON staff_saved_influencers(platform);
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_saved_at ON staff_saved_influencers(saved_at);
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_username ON staff_saved_influencers(username);
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_followers ON staff_saved_influencers(followers);
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_engagement_rate ON staff_saved_influencers(engagement_rate);
CREATE INDEX IF NOT EXISTS idx_staff_saved_influencers_added_to_roster ON staff_saved_influencers(added_to_roster);

-- Comments for documentation
COMMENT ON TABLE staff_saved_influencers IS 'Staff-shared saved influencers accessible by all staff members from discovery page';
COMMENT ON COLUMN staff_saved_influencers.modash_data IS 'Complete Modash API response for detailed popup display';
COMMENT ON COLUMN staff_saved_influencers.niches IS 'Array of niche/category tags for filtering';
