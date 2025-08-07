const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function migratePaymentTracking() {
  console.log('🔄 Running payment tracking migration...')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    // Add payment tracking columns
    console.log('1. Adding payment tracking columns...')
    await pool.query(`
      ALTER TABLE campaign_influencers 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE
    `)
    console.log('✅ Payment tracking columns added')

    // Create indexes
    console.log('2. Creating indexes...')
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_influencers_payment_status 
      ON campaign_influencers(payment_status)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_influencers_payment_date 
      ON campaign_influencers(payment_date)
    `)
    console.log('✅ Indexes created')

    // Update existing records
    console.log('3. Updating existing records...')
    const updateResult = await pool.query(`
      UPDATE campaign_influencers 
      SET payment_status = 'PENDING' 
      WHERE payment_status IS NULL
    `)
    console.log(`✅ Updated ${updateResult.rowCount} records`)

    // Verify the changes
    console.log('4. Verifying changes...')
    const verifyResult = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as pending_count,
        COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_count
      FROM campaign_influencers
    `)
    
    const stats = verifyResult.rows[0]
    console.log(`✅ Verification complete:`)
    console.log(`   - Total records: ${stats.total_records}`)
    console.log(`   - Pending payments: ${stats.pending_count}`)
    console.log(`   - Paid payments: ${stats.paid_count}`)

    console.log('\n🎉 Payment tracking migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

migratePaymentTracking() 