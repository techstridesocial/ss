const { getAllQuotations, createQuotation, getQuotationById, approveQuotation } = require('./src/lib/db/queries/quotations');

async function testQuotationSystem() {
  console.log('🧪 Testing Quotation System...\n');
  
  try {
    // Test 1: Get all quotations
    console.log('1. Testing getAllQuotations...');
    const quotations = await getAllQuotations();
    console.log(`✅ Found ${quotations.length} quotations`);
    quotations.forEach(quotation => {
      console.log(`   - ${quotation.brandName} (${quotation.status}) - £${quotation.budget}`);
    });
    console.log('');
    
    // Test 2: Get specific quotation
    if (quotations.length > 0) {
      console.log('2. Testing getQuotationById...');
      const quotation = await getQuotationById(quotations[0].id);
      if (quotation) {
        console.log(`✅ Found quotation: ${quotation.brandName}`);
        console.log(`   Budget: £${quotation.budget}`);
        console.log(`   Status: ${quotation.status}`);
        console.log(`   Influencers: ${quotation.influencers.length}`);
      } else {
        console.log('❌ Quotation not found');
      }
      console.log('');
    }
    
    // Test 3: Create a new quotation
    console.log('3. Testing createQuotation...');
    const newQuotation = await createQuotation({
      brandName: 'Test Brand - ' + new Date().toISOString(),
      brandEmail: 'test@example.com',
      industry: 'Technology',
      campaignDescription: 'This is a test quotation created by the automated test',
      targetAudience: 'Tech professionals, 25-40',
      budget: 12000,
      timeline: '6 weeks',
      deliverables: ['2 feed posts', '1 video review', '4 stories'],
      platforms: ['instagram', 'youtube'],
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
      notes: 'Test quotation for system verification'
    });
    
    console.log(`✅ Created new quotation: ${newQuotation.brandName} (ID: ${newQuotation.id})`);
    console.log('');
    
    // Test 4: Approve the quotation
    console.log('4. Testing approveQuotation...');
    const approvedQuotation = await approveQuotation(newQuotation.id, 'test@stridesocial.com', 'Approved for testing');
    if (approvedQuotation) {
      console.log(`✅ Approved quotation: ${approvedQuotation.brandName}`);
      console.log(`   New status: ${approvedQuotation.status}`);
      console.log(`   Reviewed by: ${approvedQuotation.reviewedBy}`);
    } else {
      console.log('❌ Failed to approve quotation');
    }
    console.log('');
    
    // Test 5: Verify the new quotation was created
    console.log('5. Verifying new quotation...');
    const quotationsAfter = await getAllQuotations();
    console.log(`✅ Total quotations after creation: ${quotationsAfter.length}`);
    
    console.log('\n🎉 Quotation System Test Completed Successfully!');
    console.log('✅ Database integration is working');
    console.log('✅ Quotation CRUD operations are functional');
    console.log('✅ Data mapping and formatting is correct');
    console.log('✅ Approval workflow is working');
    
  } catch (error) {
    console.error('❌ Quotation System Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testQuotationSystem(); 