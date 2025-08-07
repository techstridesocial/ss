-- Add unique constraint on influencer_id for UPSERT operations
ALTER TABLE influencer_payments 
ADD CONSTRAINT unique_influencer_payment UNIQUE (influencer_id); 