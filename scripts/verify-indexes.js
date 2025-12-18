const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function verifyIndexes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('🔍 Verifying indexes on influencers table...')
    
    const result = await pool.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'influencers'
        AND indexname IN ('idx_influencers_user_id', 'idx_influencers_user_ready')
      ORDER BY indexname
    `)
    
    if (result.rows.length === 0) {
      console.log('⚠️  No indexes found')
    } else {
      console.log(`✅ Found ${result.rows.length} index(es):`)
      result.rows.forEach(row => {
        console.log(`   - ${row.indexname}`)
      })
    }
  } catch (error) {
    console.error('❌ Error verifying indexes:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

verifyIndexes()
  .then(() => {
    console.log('✅ Verification completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })


