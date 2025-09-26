#!/usr/bin/env node

/**
 * Test script to verify search functionality for all platforms
 */

const fetch = require('node-fetch');

async function testPlatformSearch() {
  console.log('🔍 Testing search functionality for all platforms...\n');
  
  const platforms = ['instagram', 'tiktok', 'youtube'];
  const testQueries = {
    instagram: 'cristiano',
    tiktok: 'charlidamelio', 
    youtube: 'mrbeast'
  };
  
  for (const platform of platforms) {
    console.log(`📱 Testing ${platform.toUpperCase()} search...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/influencer/search-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testQueries[platform],
          platform: platform
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${platform.toUpperCase()}: ${data.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Results: ${data.results?.length || 0} profiles found`);
        
        if (data.results && data.results.length > 0) {
          const firstResult = data.results[0];
          console.log(`   First result: @${firstResult.username}`);
          console.log(`   Followers: ${firstResult.followers || 'N/A'}`);
          console.log(`   Engagement: ${firstResult.engagement_rate ? (firstResult.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}`);
          console.log(`   Avg Views: ${firstResult.avg_views || 'N/A'}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${platform.toUpperCase()}: HTTP ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${platform.toUpperCase()}: Network error - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 Platform search testing completed!');
}

// Run the test
testPlatformSearch();
