const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function findDuplicateTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 COMPREHENSIVE DATABASE DUPLICATE CHECK\n')
  
  // Get all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `
  
  const tableNames = tables.map(t => t.table_name)
  console.log(`📊 Total Tables Found: ${tableNames.length}\n`)
  
  // Get counts for all tables
  console.log('1️⃣ RECORD COUNTS FOR ALL TABLES:\n')
  
  const counts = []
  for (const tableName of tableNames) {
    try {
      const result = await sql(`SELECT COUNT(*)::int as count FROM ${tableName}`)
      counts.push({
        table: tableName,
        records: result[0].count,
        status: result[0].count === 0 ? '🔴 EMPTY' : '✅'
      })
    } catch (err) {
      counts.push({
        table: tableName,
        records: 0,
        status: '❌ ERROR'
      })
    }
  }
  
  counts.sort((a, b) => b.records - a.records)
  console.table(counts)
  
  // Find empty tables
  console.log('\n2️⃣ EMPTY TABLES:\n')
  const emptyTables = counts.filter(c => c.records === 0 && c.status !== '❌ ERROR')
  if (emptyTables.length > 0) {
    console.table(emptyTables.map(t => ({ table: t.table })))
  } else {
    console.log('✅ No empty tables')
  }
  
  // Analyze potential duplicates
  console.log('\n3️⃣ SUSPICIOUS TABLE PAIRS TO INVESTIGATE:\n')
  
  const pairs = [
    { 
      tables: ['influencer_platforms', 'influencer_social_accounts'],
      reason: 'Both seem to store social media account info'
    },
    {
      tables: ['influencer_payments', 'payment_transactions'],
      reason: 'Both seem to handle payment records'
    },
    {
      tables: ['short_links', 'tracking_links'],
      reason: 'Both seem to handle link tracking'
    }
  ]
  
  for (const pair of pairs) {
    const [table1, table2] = pair.tables
    const count1 = counts.find(c => c.table === table1)
    const count2 = counts.find(c => c.table === table2)
    
    console.log(`\n🔍 ${table1} (${count1?.records || 0} records) vs ${table2} (${count2?.records || 0} records)`)
    console.log(`   Reason: ${pair.reason}`)
    
    // Get schema for both
    const schema1 = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ${table1}
      ORDER BY ordinal_position
      LIMIT 10
    `
    
    const schema2 = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ${table2}
      ORDER BY ordinal_position
      LIMIT 10
    `
    
    console.log(`\n   ${table1} columns:`, schema1.map(c => c.column_name).join(', '))
    console.log(`   ${table2} columns:`, schema2.map(c => c.column_name).join(', '))
  }
  
  console.log('\n\n📊 SUMMARY:')
  console.log(`   Total tables: ${tableNames.length}`)
  console.log(`   Empty tables: ${emptyTables.length}`)
  console.log(`   Pairs to investigate: ${pairs.length}`)
  console.log('\n✅ Analysis complete!')
}

findDuplicateTables().catch(console.error)
