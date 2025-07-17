-- Migration: Add campaign content submissions table
-- This allows influencers to submit links to their campaign content

-- Content submission status enum
CREATE TYPE content_submission_status AS ENUM (
    'PENDING',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'REVISION_REQUESTED'
);

-- Campaign content submissions table
CREATE TABLE campaign_content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_influencer_id UUID REFERENCES campaign_influencers(id) ON DELETE CASCADE,
    
    -- Content details
    content_url TEXT NOT NULL, -- URL to the posted content (Instagram post, TikTok video, etc.)
    content_type VARCHAR(50) NOT NULL, -- 'post', 'story', 'reel', 'video', 'blog_post', etc.
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok', 'youtube', 'twitter', etc.
    
    -- Performance metrics (if available)
    views INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    saves INTEGER,
    
    -- Submission details
    title VARCHAR(255),
    description TEXT,
    caption TEXT,
    hashtags TEXT[], -- Array of hashtags used
    
    -- Approval workflow
    status content_submission_status DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id), -- Staff/admin who reviewed
    review_notes TEXT,
    
    -- Tracking
    screenshot_url TEXT, -- Screenshot of the content for record keeping
    short_link_id UUID REFERENCES tracking_links(id), -- If using tracking links
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add content submission tracking fields to campaign_influencers table
ALTER TABLE campaign_influencers 
ADD COLUMN IF NOT EXISTS content_submissions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_approved_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_content_submitted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX idx_campaign_content_submissions_campaign_influencer ON campaign_content_submissions(campaign_influencer_id);
CREATE INDEX idx_campaign_content_submissions_status ON campaign_content_submissions(status);
CREATE INDEX idx_campaign_content_submissions_platform ON campaign_content_submissions(platform);
CREATE INDEX idx_campaign_content_submissions_submitted_at ON campaign_content_submissions(submitted_at);

-- Update trigger to maintain counts
CREATE OR REPLACE FUNCTION update_content_submission_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update submission count
    UPDATE campaign_influencers 
    SET 
        content_submissions_count = (
            SELECT COUNT(*) 
            FROM campaign_content_submissions 
            WHERE campaign_influencer_id = NEW.campaign_influencer_id
        ),
        content_approved_count = (
            SELECT COUNT(*) 
            FROM campaign_content_submissions 
            WHERE campaign_influencer_id = NEW.campaign_influencer_id 
            AND status = 'APPROVED'
        ),
        last_content_submitted_at = (
            SELECT MAX(submitted_at) 
            FROM campaign_content_submissions 
            WHERE campaign_influencer_id = NEW.campaign_influencer_id
        )
    WHERE id = NEW.campaign_influencer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_submission_counts
    AFTER INSERT OR UPDATE ON campaign_content_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_content_submission_counts(); 