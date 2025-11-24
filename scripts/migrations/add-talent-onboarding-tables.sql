-- Migration: Add Signed Talent Onboarding Tables
-- This adds tables for tracking signed talent onboarding progress

-- ========================================
-- TALENT ONBOARDING SYSTEM
-- ========================================

-- Talent onboarding steps tracking
CREATE TABLE IF NOT EXISTS talent_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_key VARCHAR(50) NOT NULL, -- 'welcome_video', 'social_goals', 'brand_selection', etc.
  completed BOOLEAN DEFAULT FALSE,
  data JSONB, -- Store step-specific data
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_key)
);

-- Talent brand preferences (many-to-many with brands table)
CREATE TABLE IF NOT EXISTS talent_brand_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, brand_id)
);

-- Talent previous payment information
CREATE TABLE IF NOT EXISTS talent_payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  previous_payment_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Talent previous brand collaborations
CREATE TABLE IF NOT EXISTS talent_brand_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name VARCHAR(200),
  collaboration_type VARCHAR(100), -- 'sponsored_post', 'product_seeding', etc.
  date_range VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to user_profiles (following existing pattern)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_forwarding_setup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manager_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram_bio_setup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uk_events_chat_joined BOOLEAN DEFAULT FALSE;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_talent_onboarding_steps_user ON talent_onboarding_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_onboarding_steps_key ON talent_onboarding_steps(step_key);
CREATE INDEX IF NOT EXISTS idx_talent_brand_preferences_user ON talent_brand_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_brand_preferences_brand ON talent_brand_preferences(brand_id);
CREATE INDEX IF NOT EXISTS idx_talent_payment_history_user ON talent_payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_brand_collaborations_user ON talent_brand_collaborations(user_id);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

DROP TRIGGER IF EXISTS update_talent_onboarding_steps_updated_at ON talent_onboarding_steps;
CREATE TRIGGER update_talent_onboarding_steps_updated_at 
  BEFORE UPDATE ON talent_onboarding_steps 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

