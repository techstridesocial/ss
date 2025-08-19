-- Add new optional fields to brands table for enhanced onboarding
-- Run this migration after updating the onboarding flow

-- Add new optional fields to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS primary_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS campaign_objective VARCHAR(100),
ADD COLUMN IF NOT EXISTS product_service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS proactive_suggestions VARCHAR(10);

-- Add comments for documentation
COMMENT ON COLUMN brands.primary_region IS 'Primary region of operation (optional)';
COMMENT ON COLUMN brands.campaign_objective IS 'Main campaign objective (optional)';
COMMENT ON COLUMN brands.product_service_type IS 'Type of product/service offered (optional)';
COMMENT ON COLUMN brands.preferred_contact_method IS 'Preferred method of contact (email, phone, whatsapp, any)';
COMMENT ON COLUMN brands.proactive_suggestions IS 'Whether brand wants proactive creator suggestions (yes/no)';
