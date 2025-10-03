// Test script for analytics updater functionality
const { updateInfluencerAnalyticsFromContentLinks } = require('../src/lib/services/analytics-updater.ts')

async function testAnalyticsUpdater() {
  console.log('🧪 Testing Analytics Updater...')
  
  try {
    // Test with sample content links
    const testInfluencerId = 'test-influencer-123'
    const testContentLinks = [
      'https://www.instagram.com/p/sample1/',
      'https://www.tiktok.com/@user/video/123456789',
      'https://www.youtube.com/watch?v=sample'
    ]
    
    console.log('📋 Testing with content links:', testContentLinks)
    
    const result = await updateInfluencerAnalyticsFromContentLinks(
      testInfluencerId, 
      testContentLinks
    )
    
    console.log('✅ Test result:', result)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test if called directly
if (require.main === module) {
  testAnalyticsUpdater()
}

module.exports = { testAnalyticsUpdater }
