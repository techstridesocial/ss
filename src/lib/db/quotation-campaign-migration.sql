-- Migration: Add Quotations and Campaign Invitations System
-- This adds the missing quotation system and campaign invitation workflow

-- ========================================
-- QUOTATION SYSTEM
-- ========================================

-- Quotation status enum
CREATE TYPE quotation_status AS ENUM (
    'PENDING_REVIEW',
    'SENT',
    'APPROVED', 
    'REJECTED',
    'EXPIRED'
);

-- Quotation requests from brands
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    brand_name VARCHAR(200) NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    description TEXT,
    status quotation_status DEFAULT 'PENDING_REVIEW',
    
    -- Campaign details
    influencer_count INTEGER NOT NULL,
    budget_range VARCHAR(100), -- e.g., "$5,000 - $8,000"
    campaign_duration VARCHAR(50), -- e.g., "2 weeks"
    deliverables TEXT[], -- Array of deliverables
    target_demographics TEXT,
    
    -- Staff pricing
    total_quote DECIMAL(10,2), -- Final quoted amount
    individual_pricing JSONB, -- JSON object with individual influencer pricing
    quote_notes TEXT, -- Staff notes when sending quote
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quoted_at TIMESTAMP WITH TIME ZONE, -- When staff sent quote
    approved_at TIMESTAMP WITH TIME ZONE, -- When brand approved
    rejected_at TIMESTAMP WITH TIME ZONE, -- When brand rejected
    expires_at TIMESTAMP WITH TIME ZONE, -- Quote expiration
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Influencers selected for quotations
CREATE TABLE quotation_influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    influencer_name VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    followers VARCHAR(20) NOT NULL, -- e.g., "45.2K"
    engagement VARCHAR(10) NOT NULL, -- e.g., "4.8%"
    quoted_price DECIMAL(10,2), -- Individual price for this influencer
    notes TEXT, -- Notes about this selection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quotation_id, influencer_id)
);

-- ========================================
-- CAMPAIGN INVITATION SYSTEM
-- ========================================

-- Campaign invitation status enum
CREATE TYPE invitation_status AS ENUM (
    'INVITED',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED'
);

-- Campaign invitations sent to influencers
CREATE TABLE campaign_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    status invitation_status DEFAULT 'INVITED',
    
    -- Invitation details
    offered_amount DECIMAL(10,2), -- Amount offered to this influencer
    deliverables TEXT[], -- What they need to deliver
    deadline TIMESTAMP WITH TIME ZONE, -- When content is due
    
    -- Response tracking
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE, -- When they accepted/declined
    expires_at TIMESTAMP WITH TIME ZONE, -- Invitation expiration
    
    -- Notes
    invitation_message TEXT, -- Custom message to influencer
    decline_reason TEXT, -- If declined, why
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, influencer_id)
);

-- ========================================
-- LINK QUOTATIONS TO CAMPAIGNS
-- ========================================

-- Add quotation reference to campaigns table
ALTER TABLE campaigns ADD COLUMN quotation_id UUID REFERENCES quotations(id);
ALTER TABLE campaigns ADD COLUMN auto_created_from_quotation BOOLEAN DEFAULT FALSE;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Quotation indexes
CREATE INDEX idx_quotations_brand ON quotations(brand_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_requested_at ON quotations(requested_at);
CREATE INDEX idx_quotation_influencers_quotation ON quotation_influencers(quotation_id);
CREATE INDEX idx_quotation_influencers_influencer ON quotation_influencers(influencer_id);

-- Campaign invitation indexes
CREATE INDEX idx_campaign_invitations_campaign ON campaign_invitations(campaign_id);
CREATE INDEX idx_campaign_invitations_influencer ON campaign_invitations(influencer_id);
CREATE INDEX idx_campaign_invitations_status ON campaign_invitations(status);
CREATE INDEX idx_campaign_invitations_invited_at ON campaign_invitations(invited_at);

-- Campaign quotation reference index
CREATE INDEX idx_campaigns_quotation ON campaigns(quotation_id);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE TRIGGER update_quotations_updated_at 
    BEFORE UPDATE ON quotations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_invitations_updated_at 
    BEFORE UPDATE ON campaign_invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 