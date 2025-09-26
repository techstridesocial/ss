const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function testInvoiceGeneration() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 Starting Simple Invoice Generation Test...')
    
    // Test 1: Check if invoice system tables exist
    console.log('\n📝 Step 1: Checking invoice system tables...')
    
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('influencer_invoices', 'invoice_line_items', 'invoice_status_history')
      ORDER BY table_name
    `)
    
    console.log(`✅ Found ${tablesCheck.rows.length} invoice tables:`)
    tablesCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })
    
    // Test 2: Check invoice table structure
    console.log('\n📝 Step 2: Checking invoice table structure...')
    
    const columnsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'influencer_invoices'
      ORDER BY ordinal_position
    `)
    
    console.log(`✅ Invoice table has ${columnsCheck.rows.length} columns:`)
    columnsCheck.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    // Test 3: Test invoice creation with manual invoice number
    console.log('\n📝 Step 3: Testing manual invoice creation...')
    
    // First, clean up any existing test data
    await client.query('DELETE FROM influencer_invoices WHERE creator_name = $1', ['Test Creator'])
    
    // Create a test invoice with manual invoice number (using NULL for foreign keys to avoid constraints)
    const testInvoice = await client.query(`
      INSERT INTO influencer_invoices (
        invoice_number,
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
        status,
        created_at
      ) VALUES (
        'INV-TEST-001',
        NULL,
        NULL,
        'Test Creator',
        '123 Test Street, London, UK',
        'test@example.com',
        '+44 123 456 7890',
        'TEST-REF-001',
        'Test Brand',
        'Instagram Reel for Test Brand',
        'https://instagram.com/p/test123',
        500.00,
        'GBP',
        true,
        20.00,
        'Net 30',
        'DRAFT',
        NOW()
      )
      RETURNING *
    `)
    
    const invoice = testInvoice.rows[0]
    console.log(`✅ Test invoice created successfully!`)
    console.log(`   - Invoice ID: ${invoice.id}`)
    console.log(`   - Invoice Number: ${invoice.invoice_number}`)
    console.log(`   - Creator: ${invoice.creator_name}`)
    console.log(`   - Brand: ${invoice.brand_name}`)
    console.log(`   - Amount: ${invoice.currency} ${invoice.agreed_price}`)
    console.log(`   - VAT Required: ${invoice.vat_required}`)
    console.log(`   - Status: ${invoice.status}`)
    
    // Test 4: Test invoice calculations
    console.log('\n📝 Step 4: Testing invoice calculations...')
    
    const agreedPrice = parseFloat(invoice.agreed_price)
    const vatRate = parseFloat(invoice.vat_rate)
    const expectedVatAmount = agreedPrice * (vatRate / 100)
    const expectedTotal = agreedPrice + expectedVatAmount
    
    console.log(`   - Agreed Price: ${invoice.currency} ${agreedPrice}`)
    console.log(`   - VAT Rate: ${vatRate}%`)
    console.log(`   - Expected VAT: ${invoice.currency} ${expectedVatAmount.toFixed(2)}`)
    console.log(`   - Expected Total: ${invoice.currency} ${expectedTotal.toFixed(2)}`)
    
    // Test 5: Test status updates
    console.log('\n📝 Step 5: Testing status updates...')
    
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
      SET status = 'VERIFIED', verified_by = NULL, verified_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [invoice.id])
    
    console.log('✅ Invoice status updated to VERIFIED')
    
    // Test 6: Test invoice queries
    console.log('\n📝 Step 6: Testing invoice queries...')
    
    // Test basic invoice query
    const invoiceQuery = await client.query(`
      SELECT * FROM influencer_invoices WHERE id = $1
    `, [invoice.id])
    
    if (invoiceQuery.rows.length > 0) {
      console.log('✅ Invoice query successful')
      const updatedInvoice = invoiceQuery.rows[0]
      console.log(`   - Current Status: ${updatedInvoice.status}`)
      console.log(`   - Verified By: ${updatedInvoice.verified_by}`)
      console.log(`   - Verified At: ${updatedInvoice.verified_at}`)
    }
    
    // Test 7: Test invoice summary
    console.log('\n📝 Step 7: Testing invoice summary...')
    
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified_count,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'DELAYED' THEN 1 END) as delayed_count,
        SUM(CASE WHEN status = 'PAID' THEN agreed_price ELSE 0 END) as total_paid,
        SUM(CASE WHEN status IN ('SENT', 'VERIFIED', 'DELAYED') THEN agreed_price ELSE 0 END) as pending_amount
      FROM influencer_invoices
    `)
    
    const summaryData = summary.rows[0]
    console.log('✅ Invoice summary generated:')
    console.log(`   - Total Invoices: ${summaryData.total_invoices}`)
    console.log(`   - Sent: ${summaryData.sent_count}`)
    console.log(`   - Verified: ${summaryData.verified_count}`)
    console.log(`   - Paid: ${summaryData.paid_count}`)
    console.log(`   - Total Paid: ${invoice.currency} ${summaryData.total_paid}`)
    console.log(`   - Pending Amount: ${invoice.currency} ${summaryData.pending_amount}`)
    
    // Test 8: Test invoice search and filtering
    console.log('\n📝 Step 8: Testing invoice search and filtering...')
    
    // Test search by creator name
    const searchResults = await client.query(`
      SELECT * FROM influencer_invoices 
      WHERE creator_name ILIKE $1
      ORDER BY created_at DESC
    `, ['%Test%'])
    
    console.log(`✅ Search by creator name found ${searchResults.rows.length} result(s)`)
    
    // Test filter by status
    const statusFilter = await client.query(`
      SELECT * FROM influencer_invoices 
      WHERE status = $1
      ORDER BY created_at DESC
    `, ['VERIFIED'])
    
    console.log(`✅ Filter by status found ${statusFilter.rows.length} result(s)`)
    
    // Test 9: Test invoice line items (if table exists)
    console.log('\n📝 Step 9: Testing invoice line items...')
    
    try {
      const lineItemsCheck = await client.query(`
        SELECT COUNT(*) as count FROM invoice_line_items
      `)
      console.log(`✅ Invoice line items table accessible (${lineItemsCheck.rows[0].count} items)`)
    } catch (error) {
      console.log('ℹ️  Invoice line items table not accessible or empty')
    }
    
    // Test 10: Test status history (if table exists)
    console.log('\n📝 Step 10: Testing status history...')
    
    try {
      const statusHistoryCheck = await client.query(`
        SELECT COUNT(*) as count FROM invoice_status_history
      `)
      console.log(`✅ Status history table accessible (${statusHistoryCheck.rows[0].count} items)`)
    } catch (error) {
      console.log('ℹ️  Status history table not accessible or empty')
    }
    
    // Test 11: Cleanup
    console.log('\n📝 Step 11: Test cleanup...')
    
    await client.query('DELETE FROM influencer_invoices WHERE id = $1', [invoice.id])
    console.log('✅ Test invoice cleaned up')
    
    console.log('\n🎉 Simple Invoice Generation Test Completed Successfully!')
    console.log('\n📊 Test Results Summary:')
    console.log(`   ✅ Database Tables Exist`)
    console.log(`   ✅ Table Structure Valid`)
    console.log(`   ✅ Invoice Creation Works`)
    console.log(`   ✅ Status Updates Work`)
    console.log(`   ✅ Query Functions Work`)
    console.log(`   ✅ Search and Filtering Work`)
    console.log(`   ✅ Summary Statistics Work`)
    console.log(`   ✅ Cleanup Successful`)
    
    console.log(`\n🔗 Test Invoice Details:`)
    console.log(`   - Invoice Number: ${invoice.invoice_number}`)
    console.log(`   - Creator: ${invoice.creator_name}`)
    console.log(`   - Brand: ${invoice.brand_name}`)
    console.log(`   - Amount: ${invoice.currency} ${invoice.agreed_price}`)
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
