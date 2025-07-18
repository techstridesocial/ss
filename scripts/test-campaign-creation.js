require('dotenv').config({ path: '.env.local' })

async function testCampaignCreation() {
  console.log('🧪 Testing campaign creation API...')
  
  // Test data
  const testCampaign = {
    name: 'Test Campaign',
    brand: 'Test Brand',
    description: 'This is a test campaign to verify the API works',
    goals: ['Testing', 'Verification'],
    timeline: {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      applicationDeadline: '2024-07-25',
      contentDeadline: '2024-08-28'
    },
    budget: {
      total: 5000,
      perInfluencer: 1000
    },
    requirements: {
      minFollowers: 5000,
      maxFollowers: 100000,
      minEngagement: 2.5,
      platforms: ['Instagram', 'TikTok'],
      demographics: { ageRange: '18-30' },
      contentGuidelines: 'High quality, authentic content'
    },
    deliverables: ['Instagram post', 'Instagram story']
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You might need to add authentication headers here
      },
      body: JSON.stringify(testCampaign)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Campaign creation test PASSED')
      console.log('Created campaign:', result.campaign)
    } else {
      console.log('❌ Campaign creation test FAILED')
      console.log('Error:', result.error)
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
  }
}

// Run the test
testCampaignCreation() 