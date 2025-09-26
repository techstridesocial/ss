#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testSocialAccountsAPI() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to database...');
  const pool = new Pool({
    connectionString: databaseUrl
  });
  
  try {
    console.log('🔄 Testing social accounts API...');
    
    // Test 1: Check if table exists
    console.log('\n📋 Test 1: Checking if table exists...');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'influencer_social_accounts'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Table exists');
    } else {
      console.log('❌ Table does not exist');
      return;
    }
    
    // Test 2: Check table structure
    console.log('\n📋 Test 2: Checking table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'influencer_social_accounts'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test 3: Check if we have any influencers to test with
    console.log('\n📋 Test 3: Checking for test influencers...');
    const influencers = await pool.query(`
      SELECT id, display_name FROM influencers LIMIT 3
    `);
    
    if (influencers.rows.length > 0) {
      console.log('✅ Found influencers:');
      influencers.rows.forEach(inf => {
        console.log(`  - ${inf.display_name} (${inf.id})`);
      });
    } else {
      console.log('⚠️  No influencers found - creating test data...');
      
      // Create a test influencer
      const testUser = await pool.query(`
        INSERT INTO users (clerk_id, email, role) 
        VALUES ('test_user_123', 'test@example.com', 'INFLUENCER_SIGNED')
        RETURNING id
      `);
      
      const testInfluencer = await pool.query(`
        INSERT INTO influencers (user_id, display_name, niche_primary, total_followers, ready_for_campaigns)
        VALUES ($1, 'Test Influencer', 'Lifestyle', 10000, true)
        RETURNING id
      `, [testUser.rows[0].id]);
      
      console.log('✅ Test influencer created');
    }
    
    // Test 4: Test social accounts functionality
    console.log('\n📋 Test 4: Testing social accounts functionality...');
    
    const testInfluencerId = influencers.rows[0]?.id || (await pool.query(`SELECT id FROM influencers LIMIT 1`)).rows[0].id;
    
    if (testInfluencerId) {
      // Insert a test social account
      const testAccount = await pool.query(`
        INSERT INTO influencer_social_accounts (
          influencer_id, platform, handle, followers, engagement_rate, avg_views, is_connected
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (influencer_id, platform) DO UPDATE SET
          followers = EXCLUDED.followers,
          engagement_rate = EXCLUDED.engagement_rate,
          avg_views = EXCLUDED.avg_views
        RETURNING *
      `, [testInfluencerId, 'instagram', 'test_user', 50000, 0.035, 25000, true]);
      
      console.log('✅ Test social account created/updated');
      
      // Test getting social accounts
      const socialAccounts = await pool.query(`
        SELECT * FROM influencer_social_accounts WHERE influencer_id = $1
      `, [testInfluencerId]);
      
      console.log(`✅ Found ${socialAccounts.rows.length} social accounts for influencer`);
      
      // Test the view
      const summary = await pool.query(`
        SELECT * FROM influencer_social_summary WHERE influencer_id = $1
      `, [testInfluencerId]);
      
      if (summary.rows.length > 0) {
        console.log('✅ Social summary view working');
        console.log(`  - Total platforms: ${summary.rows[0].total_platforms}`);
        console.log(`  - Connected platforms: ${summary.rows[0].connected_platforms}`);
        console.log(`  - Total followers: ${summary.rows[0].total_followers}`);
      }
    }
    
    console.log('\n🎉 All tests passed! Social accounts system is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the tests
testSocialAccountsAPI().catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
