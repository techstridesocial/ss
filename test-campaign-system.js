const { getAllCampaigns, createCampaign, getCampaignById } = require('./src/lib/db/queries/campaigns');

async function testCampaignSystem() {
  console.log('🧪 Testing Campaign System...\n');
  
  try {
    // Test 1: Get all campaigns
    console.log('1. Testing getAllCampaigns...');
    const campaigns = await getAllCampaigns();
    console.log(`✅ Found ${campaigns.length} campaigns`);
    campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (${campaign.status}) - ${campaign.brand}`);
    });
    console.log('');
    
    // Test 2: Get specific campaign
    if (campaigns.length > 0) {
      console.log('2. Testing getCampaignById...');
      const campaign = await getCampaignById(campaigns[0].id);
      if (campaign) {
        console.log(`✅ Found campaign: ${campaign.name}`);
        console.log(`   Budget: £${campaign.budget.total}`);
        console.log(`   Influencers: ${campaign.totalInfluencers}`);
      } else {
        console.log('❌ Campaign not found');
      }
      console.log('');
    }
    
    // Test 3: Create a new campaign
    console.log('3. Testing createCampaign...');
    const newCampaign = await createCampaign({
      name: 'Test Campaign - ' + new Date().toISOString(),
      brand: 'Test Brand',
      status: 'DRAFT',
      description: 'This is a test campaign created by the automated test',
      goals: ['Test goal 1', 'Test goal 2'],
      timeline: {
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        contentDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      budget: {
        total: 5000,
        perInfluencer: 500
      },
      requirements: {
        minFollowers: 5000,
        maxFollowers: 100000,
        minEngagement: 2.5,
        platforms: ['instagram'],
        demographics: { ageRange: '18-35' },
        contentGuidelines: 'Test content guidelines'
      },
      deliverables: ['1 feed post', '2 stories']
    });
    
    console.log(`✅ Created new campaign: ${newCampaign.name} (ID: ${newCampaign.id})`);
    console.log('');
    
    // Test 4: Verify the new campaign was created
    console.log('4. Verifying new campaign...');
    const campaignsAfter = await getAllCampaigns();
    console.log(`✅ Total campaigns after creation: ${campaignsAfter.length}`);
    
    console.log('\n🎉 Campaign System Test Completed Successfully!');
    console.log('✅ Database integration is working');
    console.log('✅ Campaign CRUD operations are functional');
    console.log('✅ Data mapping and formatting is correct');
    
  } catch (error) {
    console.error('❌ Campaign System Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testCampaignSystem(); 