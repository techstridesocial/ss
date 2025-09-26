#!/usr/bin/env node

/**
 * Test the refresh API to see if it's working
 */

const fetch = require('node-fetch');

async function testRefreshAPI() {
  console.log('🔧 Testing refresh API...\n');
  
  try {
    // First, get the social accounts to find an Instagram account
    console.log('📊 Step 1: Getting social accounts...');
    const socialResponse = await fetch('http://localhost:3000/api/influencer/social-accounts');
    
    if (socialResponse.ok) {
      const socialData = await socialResponse.json();
      console.log('Social accounts response:', JSON.stringify(socialData, null, 2));
      
      if (socialData.success && socialData.data && socialData.data.length > 0) {
        const instagramAccount = socialData.data.find(account => account.platform === 'instagram');
        
        if (instagramAccount) {
          console.log(`\n🔍 Found Instagram account: ${instagramAccount.id}`);
          console.log(`Handle: @${instagramAccount.handle}`);
          console.log(`Followers: ${instagramAccount.followers?.toLocaleString() || 'N/A'}`);
          console.log(`Engagement: ${instagramAccount.engagement_rate ? (instagramAccount.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}`);
          console.log(`Avg Views: ${instagramAccount.avg_views?.toLocaleString() || 'N/A'}`);
          
          // Test the refresh API
          console.log('\n🔄 Step 2: Testing refresh API...');
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
            console.log('✅ Refresh API response:', JSON.stringify(refreshData, null, 2));
          } else {
            const errorText = await refreshResponse.text();
            console.log('❌ Refresh API failed:', refreshResponse.status, errorText);
          }
        } else {
          console.log('❌ No Instagram account found');
        }
      } else {
        console.log('❌ No social accounts found');
      }
    } else {
      console.log('❌ Failed to get social accounts:', socialResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRefreshAPI();
