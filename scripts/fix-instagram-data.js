#!/usr/bin/env node

/**
 * Fix Instagram engagement and views data
 */

const fetch = require('node-fetch');

async function fixInstagramData() {
  console.log('🔧 Fixing Instagram engagement and views data...\n');
  
  try {
    // Step 1: Check current Instagram data
    console.log('📊 Step 1: Checking current Instagram data...');
    
    const statsResponse = await fetch('http://localhost:3000/api/influencer/stats');
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Current stats data:', JSON.stringify(statsData, null, 2));
      
      if (statsData.success && statsData.data?.platforms) {
        const instagramPlatform = statsData.data.platforms.find(p => p.platform === 'instagram');
        if (instagramPlatform) {
          console.log('Instagram platform data:');
          console.log(`  - Username: @${instagramPlatform.username}`);
          console.log(`  - Followers: ${instagramPlatform.followers?.toLocaleString() || 'N/A'}`);
          console.log(`  - Engagement: ${instagramPlatform.engagement_rate ? (instagramPlatform.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}`);
          console.log(`  - Avg Views: ${instagramPlatform.avg_views?.toLocaleString() || 'N/A'}`);
          console.log(`  - Connected: ${instagramPlatform.is_connected}`);
          console.log(`  - Data Source: ${instagramPlatform.data_source || 'N/A'}`);
        }
      }
    }
    
    console.log('\n🔧 Step 2: Attempting manual refresh...');
    
    // Step 2: Try to manually refresh the Instagram data
    // First, we need to get the social account ID
    const socialAccountsResponse = await fetch('http://localhost:3000/api/influencer/social-accounts');
    if (socialAccountsResponse.ok) {
      const socialData = await socialAccountsResponse.json();
      console.log('Social accounts data:', JSON.stringify(socialData, null, 2));
      
      if (socialData.success && socialData.data) {
        const instagramAccount = socialData.data.find(account => account.platform === 'instagram');
        if (instagramAccount) {
          console.log(`Found Instagram account with ID: ${instagramAccount.id}`);
          
          // Try to refresh this account
          const refreshResponse = await fetch('http://localhost:3000/api/modash/refresh-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              influencerPlatformId: instagramAccount.id,
              platform: 'instagram'
            })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ Refresh successful:', refreshData);
          } else {
            const errorText = await refreshResponse.text();
            console.log('❌ Refresh failed:', refreshResponse.status, errorText);
          }
        }
      }
    }
    
    console.log('\n📊 Step 3: Checking updated data...');
    
    // Step 3: Check if the data was updated
    const updatedStatsResponse = await fetch('http://localhost:3000/api/influencer/stats');
    if (updatedStatsResponse.ok) {
      const updatedStatsData = await updatedStatsResponse.json();
      
      if (updatedStatsData.success && updatedStatsData.data?.platforms) {
        const updatedInstagramPlatform = updatedStatsData.data.platforms.find(p => p.platform === 'instagram');
        if (updatedInstagramPlatform) {
          console.log('Updated Instagram platform data:');
          console.log(`  - Username: @${updatedInstagramPlatform.username}`);
          console.log(`  - Followers: ${updatedInstagramPlatform.followers?.toLocaleString() || 'N/A'}`);
          console.log(`  - Engagement: ${updatedInstagramPlatform.engagement_rate ? (updatedInstagramPlatform.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}`);
          console.log(`  - Avg Views: ${updatedInstagramPlatform.avg_views?.toLocaleString() || 'N/A'}`);
          console.log(`  - Connected: ${updatedInstagramPlatform.is_connected}`);
          console.log(`  - Data Source: ${updatedInstagramPlatform.data_source || 'N/A'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing Instagram data:', error.message);
  }
}

fixInstagramData();
