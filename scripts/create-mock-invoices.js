const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function createMockInvoices() {
  const client = await pool.connect()
  
  try {
    console.log('🎭 Creating Mock Invoices for Staff UI Testing...')
    
    // Clean up any existing mock data
    await client.query('DELETE FROM influencer_invoices WHERE creator_name LIKE $1', ['%Mock%'])
    
    // Create mock invoices with different statuses
    const mockInvoices = [
      {
        invoice_number: 'INV-2024-001',
        creator_name: 'Mock Creator 1',
        creator_email: 'mock1@example.com',
        creator_phone: '+44 123 456 7890',
        creator_address: '123 Mock Street, London, UK',
        brand_name: 'Fashion Brand Co.',
        campaign_reference: 'FB-2024-001',
        content_description: 'Instagram Reel showcasing new collection',
        content_link: 'https://instagram.com/p/mock1',
        agreed_price: 750.00,
        currency: 'GBP',
        vat_required: true,
        vat_rate: 20.00,
        status: 'SENT',
        payment_terms: 'Net 30',
        invoice_date: new Date('2024-01-15'),
        due_date: new Date('2024-02-14')
      },
      {
        invoice_number: 'INV-2024-002',
        creator_name: 'Mock Creator 2',
        creator_email: 'mock2@example.com',
        creator_phone: '+44 987 654 3210',
        creator_address: '456 Test Avenue, Manchester, UK',
        brand_name: 'Tech Startup Ltd.',
        campaign_reference: 'TS-2024-002',
        content_description: 'TikTok video promoting app launch',
        content_link: 'https://tiktok.com/@mock2/video/123',
        agreed_price: 1200.00,
        currency: 'GBP',
        vat_required: true,
        vat_rate: 20.00,
        status: 'VERIFIED',
        payment_terms: 'Net 15',
        invoice_date: new Date('2024-01-20'),
        due_date: new Date('2024-02-04')
      },
      {
        invoice_number: 'INV-2024-003',
        creator_name: 'Mock Creator 3',
        creator_email: 'mock3@example.com',
        creator_phone: '+44 555 123 4567',
        creator_address: '789 Sample Road, Birmingham, UK',
        brand_name: 'Beauty Brand Inc.',
        campaign_reference: 'BB-2024-003',
        content_description: 'YouTube video review of skincare products',
        content_link: 'https://youtube.com/watch?v=mock3',
        agreed_price: 2000.00,
        currency: 'GBP',
        vat_required: true,
        vat_rate: 20.00,
        status: 'PAID',
        payment_terms: 'Net 30',
        invoice_date: new Date('2024-01-10'),
        due_date: new Date('2024-02-09')
      },
      {
        invoice_number: 'INV-2024-004',
        creator_name: 'Mock Creator 4',
        creator_email: 'mock4@example.com',
        creator_phone: '+44 777 888 9999',
        creator_address: '321 Demo Lane, Liverpool, UK',
        brand_name: 'Food Company Ltd.',
        campaign_reference: 'FC-2024-004',
        content_description: 'Instagram Stories featuring new product',
        content_link: 'https://instagram.com/stories/mock4/123',
        agreed_price: 500.00,
        currency: 'GBP',
        vat_required: false,
        vat_rate: 0.00,
        status: 'DELAYED',
        payment_terms: 'Net 30',
        invoice_date: new Date('2024-01-25'),
        due_date: new Date('2024-02-24')
      },
      {
        invoice_number: 'INV-2024-005',
        creator_name: 'Mock Creator 5',
        creator_email: 'mock5@example.com',
        creator_phone: '+44 111 222 3333',
        creator_address: '654 Example Street, Glasgow, UK',
        brand_name: 'Fitness Brand Co.',
        campaign_reference: 'FB-2024-005',
        content_description: 'TikTok dance challenge with product',
        content_link: 'https://tiktok.com/@mock5/video/456',
        agreed_price: 800.00,
        currency: 'GBP',
        vat_required: true,
        vat_rate: 20.00,
        status: 'SENT',
        payment_terms: 'Net 30',
        invoice_date: new Date('2024-01-28'),
        due_date: new Date('2024-02-27')
      }
    ]
    
    console.log(`\n📝 Creating ${mockInvoices.length} mock invoices...`)
    
    for (let i = 0; i < mockInvoices.length; i++) {
      const invoice = mockInvoices[i]
      
      // Calculate VAT and total amounts
      const vatAmount = invoice.vat_required ? invoice.agreed_price * (invoice.vat_rate / 100) : 0
      const totalAmount = invoice.agreed_price + vatAmount
      
      const result = await client.query(`
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
          vat_amount,
          total_amount,
          status,
          payment_terms,
          invoice_date,
          due_date,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW()
        )
        RETURNING id, invoice_number, status
      `, [
        invoice.invoice_number,
        null, // influencer_id
        null, // campaign_id
        invoice.creator_name,
        invoice.creator_address,
        invoice.creator_email,
        invoice.creator_phone,
        invoice.campaign_reference,
        invoice.brand_name,
        invoice.content_description,
        invoice.content_link,
        invoice.agreed_price,
        invoice.currency,
        invoice.vat_required,
        invoice.vat_rate,
        vatAmount,
        totalAmount,
        invoice.status,
        invoice.payment_terms,
        invoice.invoice_date,
        invoice.due_date
      ])
      
      console.log(`✅ Created ${invoice.invoice_number}: ${invoice.creator_name} - ${invoice.status} (${invoice.currency} ${totalAmount.toFixed(2)})`)
    }
    
    // Create status history entries for some invoices
    console.log('\n📝 Creating status history entries...')
    
    const statusHistoryEntries = [
      { invoice_number: 'INV-2024-002', status: 'SENT', created_at: new Date('2024-01-20') },
      { invoice_number: 'INV-2024-002', status: 'VERIFIED', created_at: new Date('2024-01-22') },
      { invoice_number: 'INV-2024-003', status: 'SENT', created_at: new Date('2024-01-10') },
      { invoice_number: 'INV-2024-003', status: 'VERIFIED', created_at: new Date('2024-01-12') },
      { invoice_number: 'INV-2024-003', status: 'PAID', created_at: new Date('2024-01-15') },
      { invoice_number: 'INV-2024-004', status: 'SENT', created_at: new Date('2024-01-25') },
      { invoice_number: 'INV-2024-004', status: 'DELAYED', created_at: new Date('2024-02-01') }
    ]
    
    for (const entry of statusHistoryEntries) {
      await client.query(`
        INSERT INTO invoice_status_history (
          invoice_id,
          new_status,
          created_at
        ) SELECT 
          id,
          $2,
          $3
        FROM influencer_invoices 
        WHERE invoice_number = $1
      `, [entry.invoice_number, entry.status, entry.created_at])
    }
    
    console.log(`✅ Created ${statusHistoryEntries.length} status history entries`)
    
    // Generate summary statistics
    console.log('\n📊 Mock Invoice Summary:')
    
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
      WHERE creator_name LIKE '%Mock%'
    `)
    
    const summaryData = summary.rows[0]
    console.log(`   - Total Invoices: ${summaryData.total_invoices}`)
    console.log(`   - Sent: ${summaryData.sent_count}`)
    console.log(`   - Verified: ${summaryData.verified_count}`)
    console.log(`   - Paid: ${summaryData.paid_count}`)
    console.log(`   - Delayed: ${summaryData.delayed_count}`)
    console.log(`   - Total Paid: £${summaryData.total_paid}`)
    console.log(`   - Pending Amount: £${summaryData.pending_amount}`)
    
    console.log('\n🎉 Mock invoices created successfully!')
    console.log('\n🔗 You can now test the staff finances UI at: /staff/finances')
    
  } catch (error) {
    console.error('❌ Failed to create mock invoices:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createMockInvoices().catch(console.error)
