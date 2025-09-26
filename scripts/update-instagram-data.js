#!/usr/bin/env node

/**
 * Manually update Instagram data with test engagement and views
 */

const { getDatabase } = require('../src/lib/db/connection');

async function updateInstagramData() {
  console.log('🔧 Manually updating Instagram data with test values...\n');
  
  try {
    const db = getDatabase();
    const client = await db.connect();
    
    // Find the Instagram account
    console.log('📊 Finding Instagram account...');
    const instagramResult = await client.query(`
      SELECT id, handle, followers, engagement_rate, avg_views, is_connected
      FROM influencer_social_accounts 
      WHERE platform = 'instagram' AND is_connected = true
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (instagramResult.rows.length === 0) {
      console.log('❌ No connected Instagram account found');
      return;
    }
    
    const instagramAccount = instagramResult.rows[0];
    console.log(`Found Instagram account: @${instagramAccount.handle}`);
    console.log(`Current followers: ${instagramAccount.followers?.toLocaleString() || 'N/A'}`);
    console.log(`Current engagement: ${instagramAccount.engagement_rate ? (instagramAccount.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`Current avg views: ${instagramAccount.avg_views?.toLocaleString() || 'N/A'}`);
    
    // Update with realistic test data
    console.log('\n🔄 Updating with test engagement and views data...');
    
    const updateResult = await client.query(`
      UPDATE influencer_social_accounts 
      SET 
        engagement_rate = $1,
        avg_views = $2,
        avg_likes = $3,
        avg_comments = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING engagement_rate, avg_views, avg_likes, avg_comments
    `, [
      0.045, // 4.5% engagement rate
      25000000, // 25M average views
      1500000, // 1.5M average likes
      50000, // 50K average comments
      instagramAccount.id
    ]);
    
    if (updateResult.rows.length > 0) {
      const updated = updateResult.rows[0];
      console.log('✅ Instagram data updated successfully:');
      console.log(`  - Engagement Rate: ${(updated.engagement_rate * 100).toFixed(2)}%`);
      console.log(`  - Average Views: ${updated.avg_views.toLocaleString()}`);
      console.log(`  - Average Likes: ${updated.avg_likes.toLocaleString()}`);
      console.log(`  - Average Comments: ${updated.avg_comments.toLocaleString()}`);
    }
    
    await client.release();
    
    console.log('\n🎉 Instagram data updated! Refresh the stats page to see the changes.');
    
  } catch (error) {
    console.error('❌ Error updating Instagram data:', error.message);
  }
}

updateInstagramData();
