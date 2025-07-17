-- Migration: Add is_onboarded field to user_profiles table
-- This tracks whether a user has completed their onboarding process

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Update existing brand users to show they need onboarding
UPDATE user_profiles 
SET is_onboarded = FALSE 
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'BRAND'
); 