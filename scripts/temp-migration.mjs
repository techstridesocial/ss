
import { query } from '../src/lib/db/connection.js';

async function runMigration() {
  try {
    console.log('🔄 Running Campaign ID migration...');
    
    const sql = `-- Add campaign_id field to campaigns table
-- This allows staff to manually input a campaign ID for external tracking

-- Add the campaign_id column to the campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(100);

-- Add a comment to explain the field
COMMENT ON COLUMN campaigns.campaign_id IS 'Manual campaign ID for external tracking and reference';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_id ON campaigns(campaign_id);

-- Update existing campaigns with a default campaign_id if they don't have one
-- This will use the first 8 characters of the UUID as a readable ID
UPDATE campaigns 
SET campaign_id = UPPER(SUBSTRING(id::text, 1, 8))
WHERE campaign_id IS NULL OR campaign_id = '';

-- Make the field unique to prevent duplicates
ALTER TABLE campaigns 
ADD CONSTRAINT unique_campaign_id UNIQUE (campaign_id);
`;
    
    await query(sql);
    console.log('✅ Campaign ID field added successfully');
    
    // Verify the field was added
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND column_name = 'campaign_id'
    `);
    
    if (result.length > 0) {
      console.log('✅ Verification successful - campaign_id field exists');
      console.log('Field details:', result[0]);
    } else {
      console.log('❌ Verification failed - campaign_id field not found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
