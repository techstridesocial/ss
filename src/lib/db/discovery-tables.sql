-- Discovery System Tables Migration
-- This migration adds tables for tracking discovered influencers and discovery history

-- Table for storing discovered influencers
CREATE TABLE IF NOT EXISTS discovered_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  followers INTEGER NOT NULL,
  engagement_rate DECIMAL(5,4) NOT NULL,
  demographics JSONB,
  discovery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modash_data JSONB,
  added_to_roster BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique username per platform
  UNIQUE(username, platform)
);

-- Table for tracking discovery search history
CREATE TABLE IF NOT EXISTS discovery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT,
  filters_used JSONB,
  results_count INTEGER NOT NULL,
  credits_used DECIMAL(10,2) NOT NULL,
  search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovered_influencers_username ON discovered_influencers(username);
CREATE INDEX IF NOT EXISTS idx_discovered_influencers_platform ON discovered_influencers(platform);
CREATE INDEX IF NOT EXISTS idx_discovered_influencers_discovery_date ON discovered_influencers(discovery_date);
CREATE INDEX IF NOT EXISTS idx_discovered_influencers_added_to_roster ON discovered_influencers(added_to_roster);

CREATE INDEX IF NOT EXISTS idx_discovery_history_search_date ON discovery_history(search_date);
CREATE INDEX IF NOT EXISTS idx_discovery_history_user_id ON discovery_history(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_history_credits_used ON discovery_history(credits_used);

-- Add comments for documentation
COMMENT ON TABLE discovered_influencers IS 'Stores influencers discovered through Modash API searches';
COMMENT ON TABLE discovery_history IS 'Tracks discovery search history and credit usage';
COMMENT ON COLUMN discovered_influencers.modash_data IS 'Raw data from Modash API response';
COMMENT ON COLUMN discovered_influencers.demographics IS 'Audience demographic data from Modash';
COMMENT ON COLUMN discovery_history.filters_used IS 'Search filters applied during discovery';
COMMENT ON COLUMN discovery_history.credits_used IS 'Modash API credits consumed for this search'; 