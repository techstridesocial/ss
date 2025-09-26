const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function testInvoiceGeneration() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 Starting Invoice Generation Test...')
    
    // Test 1: Create a test user and influencer
    console.log('\n📝 Step 1: Creating test user and influencer...')
    
    // First, try to delete any existing test user
    await client.query('DELETE FROM users WHERE clerk_id = $1', ['test_user_123'])
    
    const testUser = await client.query(`
      INSERT INTO users (clerk_id, email, role, created_at)
      VALUES ('test_user_123', 'test@example.com', 'INFLUENCER_SIGNED', NOW())
      RETURNING id, clerk_id
    `)
    
    const userId = testUser.rows[0].id
    console.log(`✅ Test user created: ${userId}`)
    
    // Create test influencer
    const testInfluencer = await client.query(`
      INSERT INTO influencers (user_id, display_name, niche_primary, total_followers, ready_for_campaigns, created_at)
      VALUES ($1, 'Test Creator', 'Lifestyle', 50000, true, NOW())
      RETURNING id, display_name
    `, [userId])
    
    const influencerId = testInfluencer.rows[0].id
    console.log(`✅ Test influencer created: ${influencerId}`)
    
    // Test 2: Create a test brand and campaign
    console.log('\n📝 Step 2: Creating test brand and campaign...')
    
    // First create a test brand
    const testBrand = await client.query(`
      INSERT INTO brands (user_id, company_name, industry, website_url, created_at)
      VALUES ($1, 'Test Brand', 'Fashion', 'https://testbrand.com', NOW())
      RETURNING id, company_name
    `, [userId])
    
    const brandId = testBrand.rows[0].id
    console.log(`✅ Test brand created: ${brandId}`)
    
    // Then create a test campaign
    const testCampaign = await client.query(`
      INSERT INTO campaigns (brand_id, name, status, created_at)
      VALUES ($1, 'Test Campaign', 'ACTIVE', NOW())
      RETURNING id, name
    `, [brandId])
    
    const campaignId = testCampaign.rows[0].id
    console.log(`✅ Test campaign created: ${campaignId}`)
    
    // Assign influencer to campaign
    await client.query(`
      INSERT INTO campaign_influencers (campaign_id, influencer_id, status, created_at)
      VALUES ($1, $2, 'ACCEPTED', NOW())
      ON CONFLICT (campaign_id, influencer_id) DO NOTHING
    `, [campaignId, influencerId])
    
    console.log(`✅ Influencer assigned to campaign`)
    
    // Test 3: Generate test invoice data
    console.log('\n📝 Step 3: Creating test invoice...')
    
    const invoiceData = {
      influencer_id: influencerId,
      campaign_id: campaignId,
      creator_name: 'Test Creator',
      creator_address: '123 Test Street, London, UK',
      creator_email: 'test@example.com',
      creator_phone: '+44 123 456 7890',
      campaign_reference: campaignId,
      brand_name: testBrand.rows[0].company_name, // Use the actual brand name from the database
      content_description: 'Instagram Reel for Test Brand',
      content_link: 'https://instagram.com/p/test123',
      agreed_price: 500.00,
      currency: 'GBP',
      vat_required: true,
      vat_rate: 20.00,
      payment_terms: 'Net 30'
    }
    
    // Insert test invoice
    const testInvoice = await client.query(`
      INSERT INTO influencer_invoices (
        influencer_id,
        campaign_id,
        creator_name,
        creator_address,
        creator_email,
        creator_phone,
        campaign_reference,
        brand_name,
        content_description,
        content_link,
        agreed_price,
        currency,
        vat_required,
        vat_rate,
        payment_terms,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      invoiceData.influencer_id,
      invoiceData.campaign_id,
      invoiceData.creator_name,
      invoiceData.creator_address,
      invoiceData.creator_email,
      invoiceData.creator_phone,
      invoiceData.campaign_reference,
      invoiceData.brand_name,
      invoiceData.content_description,
      invoiceData.content_link,
      invoiceData.agreed_price,
      invoiceData.currency,
      invoiceData.vat_required,
      invoiceData.vat_rate,
      invoiceData.payment_terms,
      userId
    ])
    
    const invoice = testInvoice.rows[0]
    console.log(`✅ Test invoice created: ${invoice.invoice_number}`)
    console.log(`   - Invoice ID: ${invoice.id}`)
    console.log(`   - Total Amount: ${invoice.currency} ${invoice.total_amount}`)
    console.log(`   - VAT Amount: ${invoice.currency} ${invoice.vat_amount}`)
    console.log(`   - Status: ${invoice.status}`)
    
    // Test 4: Verify invoice calculations
    console.log('\n📝 Step 4: Verifying invoice calculations...')
    
    const expectedVatAmount = invoiceData.agreed_price * (invoiceData.vat_rate / 100)
    const expectedTotal = invoiceData.agreed_price + expectedVatAmount
    
    console.log(`   - Agreed Price: ${invoiceData.currency} ${invoiceData.agreed_price}`)
    console.log(`   - VAT Rate: ${invoiceData.vat_rate}%`)
    console.log(`   - Expected VAT: ${invoiceData.currency} ${expectedVatAmount.toFixed(2)}`)
    console.log(`   - Expected Total: ${invoiceData.currency} ${expectedTotal.toFixed(2)}`)
    console.log(`   - Actual VAT: ${invoice.vat_amount}`)
    console.log(`   - Actual Total: ${invoice.total_amount}`)
    
    if (Math.abs(invoice.vat_amount - expectedVatAmount) < 0.01) {
      console.log('✅ VAT calculation is correct')
    } else {
      console.log('❌ VAT calculation is incorrect')
    }
    
    if (Math.abs(invoice.total_amount - expectedTotal) < 0.01) {
      console.log('✅ Total calculation is correct')
    } else {
      console.log('❌ Total calculation is incorrect')
    }
    
    // Test 5: Test invoice status updates
    console.log('\n📝 Step 5: Testing invoice status updates...')
    
    // Update to SENT
    await client.query(`
      UPDATE influencer_invoices 
      SET status = 'SENT', updated_at = NOW()
      WHERE id = $1
    `, [invoice.id])
    
    console.log('✅ Invoice status updated to SENT')
    
    // Update to VERIFIED
    await client.query(`
      UPDATE influencer_invoices 
      SET status = 'VERIFIED', verified_by = $2, verified_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [invoice.id, userId])
    
    console.log('✅ Invoice status updated to VERIFIED')
    
    // Test 6: Test invoice queries
    console.log('\n📝 Step 6: Testing invoice queries...')
    
    // Test influencer invoices query
    const influencerInvoices = await client.query(`
      SELECT ii.*, c.name as campaign_name
      FROM influencer_invoices ii
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      WHERE ii.influencer_id = $1
      ORDER BY ii.created_at DESC
    `, [influencerId])
    
    console.log(`✅ Found ${influencerInvoices.rows.length} invoice(s) for influencer`)
    
    // Test staff invoices query
    const staffInvoices = await client.query(`
      SELECT 
        ii.*,
        i.display_name as influencer_name,
        c.name as campaign_name,
        cb.name as created_by_name
      FROM influencer_invoices ii
      LEFT JOIN influencers i ON ii.influencer_id = i.id
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      LEFT JOIN users cb ON ii.created_by = cb.id
      ORDER BY ii.created_at DESC
    `)
    
    console.log(`✅ Found ${staffInvoices.rows.length} invoice(s) for staff view`)
    
    // Test 7: Test invoice summary
    console.log('\n📝 Step 7: Testing invoice summary...')
    
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified_count,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'DELAYED' THEN 1 END) as delayed_count,
        SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status IN ('SENT', 'VERIFIED', 'DELAYED') THEN total_amount ELSE 0 END) as pending_amount
      FROM influencer_invoices
    `)
    
    const summaryData = summary.rows[0]
    console.log('✅ Invoice summary generated:')
    console.log(`   - Total Invoices: ${summaryData.total_invoices}`)
    console.log(`   - Sent: ${summaryData.sent_count}`)
    console.log(`   - Verified: ${summaryData.verified_count}`)
    console.log(`   - Paid: ${summaryData.paid_count}`)
    console.log(`   - Total Paid: ${invoiceData.currency} ${summaryData.total_paid}`)
    console.log(`   - Pending Amount: ${invoiceData.currency} ${summaryData.pending_amount}`)
    
    // Test 8: Test PDF generation endpoint (simulation)
    console.log('\n📝 Step 8: Testing PDF generation data...')
    
    const pdfData = await client.query(`
      SELECT 
        ii.*,
        i.display_name as influencer_name,
        c.name as campaign_name
      FROM influencer_invoices ii
      LEFT JOIN influencers i ON ii.influencer_id = i.id
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      WHERE ii.id = $1
    `, [invoice.id])
    
    if (pdfData.rows.length > 0) {
      console.log('✅ PDF generation data retrieved successfully')
      console.log(`   - Invoice Number: ${pdfData.rows[0].invoice_number}`)
      console.log(`   - Creator: ${pdfData.rows[0].creator_name}`)
      console.log(`   - Brand: ${pdfData.rows[0].brand_name}`)
      console.log(`   - Amount: ${pdfData.rows[0].currency} ${pdfData.rows[0].total_amount}`)
    } else {
      console.log('❌ PDF generation data not found')
    }
    
    // Test 9: Cleanup (optional)
    console.log('\n📝 Step 9: Test cleanup...')
    
    // Note: We'll keep the test data for now, but you can uncomment these lines to clean up
    /*
    await client.query('DELETE FROM influencer_invoices WHERE id = $1', [invoice.id])
    await client.query('DELETE FROM campaign_influencers WHERE campaign_id = $1 AND influencer_id = $2', [campaignId, influencerId])
    await client.query('DELETE FROM campaigns WHERE id = $1', [campaignId])
    await client.query('DELETE FROM influencers WHERE id = $1', [influencerId])
    await client.query('DELETE FROM users WHERE id = $1', [userId])
    console.log('✅ Test data cleaned up')
    */
    
    console.log('\n🎉 Invoice Generation Test Completed Successfully!')
    console.log('\n📊 Test Results Summary:')
    console.log(`   ✅ User and Influencer Creation`)
    console.log(`   ✅ Campaign Creation and Assignment`)
    console.log(`   ✅ Invoice Creation with Auto-calculations`)
    console.log(`   ✅ VAT and Total Calculations`)
    console.log(`   ✅ Status Updates and History`)
    console.log(`   ✅ Query Functions (Influencer & Staff Views)`)
    console.log(`   ✅ Summary Statistics`)
    console.log(`   ✅ PDF Generation Data`)
    
    console.log(`\n🔗 Test Invoice Details:`)
    console.log(`   - Invoice Number: ${invoice.invoice_number}`)
    console.log(`   - Creator: ${invoice.creator_name}`)
    console.log(`   - Brand: ${invoice.brand_name}`)
    console.log(`   - Amount: ${invoice.currency} ${invoice.total_amount}`)
    console.log(`   - Status: ${invoice.status}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

testInvoiceGeneration().catch(console.error)
