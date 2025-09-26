-- Migration: Add Invitation Tracking System
-- This adds comprehensive invitation tracking to the database

-- ========================================
-- INVITATION TRACKING SYSTEM
-- ========================================

-- Invitation status enum
CREATE TYPE invitation_status AS ENUM (
    'PENDING',
    'ACCEPTED', 
    'REVOKED',
    'EXPIRED'
);

-- User invitations table
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_invitation_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk invitation ID
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status invitation_status DEFAULT 'PENDING',
    
    -- Invitation details
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_by_email VARCHAR(255),
    
    -- Timestamps
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Response tracking
    accepted_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who accepted
    clerk_user_id VARCHAR(255), -- Clerk user ID of who accepted
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX idx_user_invitations_clerk_id ON user_invitations(clerk_invitation_id);

-- Function to update invitation status
CREATE OR REPLACE FUNCTION update_invitation_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_invitation_status
    BEFORE UPDATE ON user_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_invitation_status();

-- ========================================
-- CLERK WEBHOOK EVENTS TABLE
-- ========================================

-- Webhook events for tracking Clerk events
CREATE TABLE clerk_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    clerk_user_id VARCHAR(255),
    clerk_invitation_id VARCHAR(255),
    event_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for webhook processing
CREATE INDEX idx_webhook_events_type ON clerk_webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON clerk_webhook_events(processed);
CREATE INDEX idx_webhook_events_clerk_user ON clerk_webhook_events(clerk_user_id);
CREATE INDEX idx_webhook_events_clerk_invitation ON clerk_webhook_events(clerk_invitation_id);
