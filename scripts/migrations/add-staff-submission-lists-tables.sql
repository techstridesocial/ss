-- Migration: Add Staff Submission Lists System
-- This adds tables for staff to submit influencer lists to brands for review
-- Similar workflow to quotations but reversed (staff → brand)

-- ========================================
-- STAFF SUBMISSION LISTS SYSTEM
-- ========================================

-- Submission list status enum
DO $$ BEGIN
    CREATE TYPE submission_list_status AS ENUM (
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'REVISION_REQUESTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Staff submission lists
CREATE TABLE IF NOT EXISTS staff_submission_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id), -- Staff member
  status submission_list_status DEFAULT 'DRAFT',
  notes TEXT, -- Initial notes from staff
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Influencers in submission lists
CREATE TABLE IF NOT EXISTS staff_submission_list_influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_list_id UUID REFERENCES staff_submission_lists(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  initial_price DECIMAL(10,2), -- Optional initial pricing
  notes TEXT, -- Notes about this specific influencer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_list_id, influencer_id)
);

-- Comments on submission lists (conversation between staff and brand)
CREATE TABLE IF NOT EXISTS staff_submission_list_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_list_id UUID REFERENCES staff_submission_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- Staff or Brand user
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Submission list indexes
CREATE INDEX IF NOT EXISTS idx_staff_submission_lists_brand ON staff_submission_lists(brand_id);
CREATE INDEX IF NOT EXISTS idx_staff_submission_lists_created_by ON staff_submission_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_staff_submission_lists_status ON staff_submission_lists(status);
CREATE INDEX IF NOT EXISTS idx_staff_submission_lists_submitted_at ON staff_submission_lists(submitted_at);

-- Submission list influencers indexes
CREATE INDEX IF NOT EXISTS idx_submission_list_influencers_list ON staff_submission_list_influencers(submission_list_id);
CREATE INDEX IF NOT EXISTS idx_submission_list_influencers_influencer ON staff_submission_list_influencers(influencer_id);

-- Submission list comments indexes
CREATE INDEX IF NOT EXISTS idx_submission_list_comments_list ON staff_submission_list_comments(submission_list_id);
CREATE INDEX IF NOT EXISTS idx_submission_list_comments_user ON staff_submission_list_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_list_comments_created_at ON staff_submission_list_comments(created_at);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

DROP TRIGGER IF EXISTS update_staff_submission_lists_updated_at ON staff_submission_lists;
CREATE TRIGGER update_staff_submission_lists_updated_at 
  BEFORE UPDATE ON staff_submission_lists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_submission_list_comments_updated_at ON staff_submission_list_comments;
CREATE TRIGGER update_staff_submission_list_comments_updated_at 
  BEFORE UPDATE ON staff_submission_list_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

