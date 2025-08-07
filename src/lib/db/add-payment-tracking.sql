-- Migration: Add payment tracking to campaign_influencers table
-- This allows tracking payment status for each influencer in a campaign

-- Add payment tracking columns to campaign_influencers table
ALTER TABLE campaign_influencers 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_payment_status 
ON campaign_influencers(payment_status);

-- Create index for payment date queries
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_payment_date 
ON campaign_influencers(payment_date);

-- Add comment to document the payment status values
COMMENT ON COLUMN campaign_influencers.payment_status IS 'Payment status: PENDING, PAID';

-- Update existing records to have PENDING status if NULL
UPDATE campaign_influencers 
SET payment_status = 'PENDING' 
WHERE payment_status IS NULL; 