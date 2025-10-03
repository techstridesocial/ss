-- Add mock payment data for dashboard influencers
-- This script adds payment method details for the influencers shown in the dashboard

-- First, let's check if we have these influencers in our database
-- We'll use their display names to find them

-- Add payment data for PewDiePie
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'PAYPAL'::payment_method_type,
    'encrypted_paypal_data_pewdiepie', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%PewDiePie%' OR up.first_name ILIKE '%PewDiePie%'
LIMIT 1;

-- Add payment data for Charli D'Amelio
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'BANK_TRANSFER'::payment_method_type,
    'encrypted_bank_data_charli', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%Charli%' OR up.first_name ILIKE '%Charli%'
LIMIT 1;

-- Add payment data for Kylie Jenner
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'WISE'::payment_method_type,
    'encrypted_wise_data_kylie', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%Kylie%' OR up.first_name ILIKE '%Kylie%'
LIMIT 1;

-- Add payment data for MrBeast
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'PAYPAL'::payment_method_type,
    'encrypted_paypal_data_mrbeast', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%MrBeast%' OR up.first_name ILIKE '%MrBeast%'
LIMIT 1;

-- Add payment data for Addison Rae
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'BANK_TRANSFER'::payment_method_type,
    'encrypted_bank_data_addison', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%Addison%' OR up.first_name ILIKE '%Addison%'
LIMIT 1;

-- Add payment data for Emma Chamberlain
INSERT INTO influencer_payments (
    influencer_id,
    payment_method,
    encrypted_details,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    i.id,
    'STRIPE'::payment_method_type,
    'encrypted_stripe_data_emma', -- In real implementation, this would be properly encrypted
    true,
    NOW(),
    NOW()
FROM influencers i
JOIN users u ON i.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE i.display_name ILIKE '%Emma%' OR up.first_name ILIKE '%Emma%'
LIMIT 1;

-- Verify the data was inserted
SELECT 
    i.display_name,
    ip.payment_method,
    ip.is_verified,
    ip.created_at
FROM influencer_payments ip
JOIN influencers i ON ip.influencer_id = i.id
ORDER BY i.display_name;
