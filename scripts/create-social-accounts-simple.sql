-- Simple social accounts table for influencer social media connections
CREATE TABLE IF NOT EXISTS influencer_social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    handle VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    
    -- Cached profile data
    followers BIGINT DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    avg_likes BIGINT DEFAULT 0,
    avg_comments BIGINT DEFAULT 0,
    avg_views BIGINT DEFAULT 0,
    credibility_score DECIMAL(3,2) DEFAULT 0,
    
    -- Profile metadata
    profile_picture_url TEXT,
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Connection status
    is_connected BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 720, -- 30 days (monthly)
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(influencer_id, platform)
);

-- Create indexes for performance
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
DROP TRIGGER IF EXISTS trigger_update_influencer_social_accounts_updated_at ON influencer_social_accounts;
CREATE TRIGGER trigger_update_influencer_social_accounts_updated_at
    BEFORE UPDATE ON influencer_social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_influencer_social_accounts_updated_at();

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
