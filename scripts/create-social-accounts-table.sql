-- Enhanced influencer social accounts table
-- This stores connected social media accounts with cached performance data

CREATE TABLE IF NOT EXISTS influencer_social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL, -- 'instagram', 'tiktok', 'youtube'
    handle VARCHAR(100) NOT NULL,
    user_id VARCHAR(100), -- Modash user ID
    
    -- Cached profile data (updated daily)
    followers BIGINT,
    engagement_rate DECIMAL(5,4),
    avg_likes BIGINT,
    avg_comments BIGINT,
    avg_views BIGINT,
    credibility_score DECIMAL(3,2),
    
    -- Profile metadata
    profile_picture_url TEXT,
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Connection status
    is_connected BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 24,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(influencer_id, platform)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_influencer_social_accounts_influencer_id ON influencer_social_accounts(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_social_accounts_platform ON influencer_social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_influencer_social_accounts_last_sync ON influencer_social_accounts(last_sync);
CREATE INDEX IF NOT EXISTS idx_influencer_social_accounts_is_connected ON influencer_social_accounts(is_connected);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_influencer_social_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER trigger_update_influencer_social_accounts_updated_at
    BEFORE UPDATE ON influencer_social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_influencer_social_accounts_updated_at();

-- Function to get influencers that need social account updates
CREATE OR REPLACE FUNCTION get_influencers_needing_social_update()
RETURNS TABLE (
    influencer_id UUID,
    platform VARCHAR(20),
    handle VARCHAR(100),
    last_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        isa.influencer_id,
        isa.platform,
        isa.handle,
        isa.last_sync
    FROM influencer_social_accounts isa
    WHERE isa.is_connected = true
        AND (isa.last_sync IS NULL OR isa.last_sync < NOW() - INTERVAL '24 hours')
    ORDER BY isa.last_sync ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Function to get social account stats for an influencer
CREATE OR REPLACE FUNCTION get_influencer_social_stats(p_influencer_id UUID)
RETURNS TABLE (
    platform VARCHAR(20),
    handle VARCHAR(100),
    followers BIGINT,
    engagement_rate DECIMAL(5,4),
    avg_views BIGINT,
    is_connected BOOLEAN,
    last_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        isa.platform,
        isa.handle,
        isa.followers,
        isa.engagement_rate,
        isa.avg_views,
        isa.is_connected,
        isa.last_sync
    FROM influencer_social_accounts isa
    WHERE isa.influencer_id = p_influencer_id
    ORDER BY isa.platform;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO influencer_social_accounts (
    influencer_id,
    platform,
    handle,
    followers,
    engagement_rate,
    avg_views,
    is_connected,
    last_sync
) VALUES (
    (SELECT id FROM influencers LIMIT 1),
    'instagram',
    'test_user',
    50000,
    0.035,
    25000,
    true,
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (influencer_id, platform) DO NOTHING;

-- Create a view for easy access to social account data
CREATE OR REPLACE VIEW influencer_social_summary AS
SELECT 
    i.id as influencer_id,
    i.display_name,
    COUNT(isa.id) as total_platforms,
    COUNT(CASE WHEN isa.is_connected THEN 1 END) as connected_platforms,
    SUM(CASE WHEN isa.is_connected THEN isa.followers ELSE 0 END) as total_followers,
    AVG(CASE WHEN isa.is_connected THEN isa.engagement_rate ELSE NULL END) as avg_engagement,
    MAX(isa.last_sync) as last_updated
FROM influencers i
LEFT JOIN influencer_social_accounts isa ON i.id = isa.influencer_id
GROUP BY i.id, i.display_name;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON influencer_social_accounts TO authenticated;
GRANT SELECT ON influencer_social_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_social_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_social_stats(UUID) TO authenticated;
