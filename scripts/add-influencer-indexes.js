const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function addIndexes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('🔗 Connecting to database...')
    
    // Note: CREATE INDEX CONCURRENTLY cannot run in a transaction
    // So we execute each index creation separately
    
    console.log('📊 Creating index: idx_influencers_user_id...')
    await pool.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_user_id 
      ON influencers(user_id)
    `)
    console.log('✅ Index idx_influencers_user_id created successfully')
    
    console.log('📊 Creating index: idx_influencers_user_ready...')
    await pool.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_user_ready
      ON influencers(user_id, ready_for_campaigns)
      WHERE ready_for_campaigns = true
    `)
    console.log('✅ Index idx_influencers_user_ready created successfully')
    
    console.log('🎉 All indexes created successfully!')
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message)
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Indexes may already exist, which is fine.')
    } else {
      throw error
    }
  } finally {
    await pool.end()
  }
}

addIndexes()
  .then(() => {
    console.log('✅ Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })

