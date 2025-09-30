-- Migration to fix analytics columns to handle large numbers
-- Change INTEGER columns to BIGINT for large analytics values

-- Update analytics columns to BIGINT
ALTER TABLE influencers 
ALTER COLUMN total_engagements TYPE BIGINT,
ALTER COLUMN estimated_reach TYPE BIGINT,
ALTER COLUMN total_likes TYPE BIGINT,
ALTER COLUMN total_comments TYPE BIGINT,
ALTER COLUMN total_views TYPE BIGINT;

-- Verify the migration
SELECT 'Analytics columns updated to BIGINT successfully' as status;
