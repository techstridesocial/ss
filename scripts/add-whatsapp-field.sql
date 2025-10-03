-- Add whatsapp_url field to influencers table
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Add comment to column
COMMENT ON COLUMN influencers.whatsapp_url IS 'WhatsApp group chat URL for staff to contact influencer';

