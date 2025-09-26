const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function migrateInfluencerColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Adding missing columns to influencers table...');
    
    // Add missing columns to influencers table
    await pool.query(`
      ALTER TABLE influencers 
      ADD COLUMN IF NOT EXISTS influencer_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS content_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website_url TEXT;
    `);

    console.log('🔄 Adding missing columns to influencer_platforms table...');
    
    // Add missing columns to influencer_platforms table
    await pool.query(`
      ALTER TABLE influencer_platforms 
      ADD COLUMN IF NOT EXISTS followers_count INTEGER,
      ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_synced TIMESTAMP WITH TIME ZONE;
    `);

    console.log('🔄 Updating existing records with default values...');
    
    // Update existing records to have default values
    await pool.query(`
      UPDATE influencers 
      SET 
        influencer_type = CASE 
          WHEN user_id IS NOT NULL THEN 'SIGNED'
          ELSE 'PARTNERED'
        END,
        content_type = 'STANDARD'
      WHERE influencer_type IS NULL;
    `);

    console.log('🔄 Creating indexes for better performance...');
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_influencers_type ON influencers(influencer_type);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_influencer_platforms_connected ON influencer_platforms(is_connected);
    `);

    console.log('✅ Migration completed successfully!');
    console.log('🎉 All missing columns have been added to the database.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateInfluencerColumns();
