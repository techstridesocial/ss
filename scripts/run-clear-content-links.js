const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function clearAllContentLinks() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting to clear all content links...');
    
    // First, let's see how many content links exist (safer query)
    const countResult = await client.query(`
      SELECT 
        COUNT(*) as total_campaign_influencers,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links::text != '[]' AND content_links::text != '' THEN 1 END) as with_content_links
      FROM campaign_influencers
    `);
    
    console.log('📊 Current state:');
    console.log(`   Total campaign influencers: ${countResult.rows[0].total_campaign_influencers}`);
    console.log(`   With content links: ${countResult.rows[0].with_content_links}`);
    
    if (countResult.rows[0].with_content_links === '0') {
      console.log('✅ No content links found to clear.');
      return;
    }
    
    // Clear all content links (safer approach)
    const updateResult = await client.query(`
      UPDATE campaign_influencers 
      SET content_links = NULL
      WHERE content_links IS NOT NULL
    `);
    
    console.log(`✅ Cleared content links from ${updateResult.rowCount} campaign influencers`);
    
    // Verify the cleanup
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total_campaign_influencers,
        COUNT(CASE WHEN content_links IS NOT NULL THEN 1 END) as with_content_links
      FROM campaign_influencers
    `);
    
    console.log('📊 After cleanup:');
    console.log(`   Total campaign influencers: ${verifyResult.rows[0].total_campaign_influencers}`);
    console.log(`   With content links: ${verifyResult.rows[0].with_content_links}`);
    
    console.log('🎉 All content links have been cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing content links:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearAllContentLinks()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });