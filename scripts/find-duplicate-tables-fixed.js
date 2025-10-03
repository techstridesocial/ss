const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function findDuplicateTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 COMPREHENSIVE DATABASE DUPLICATE CHECK\n')
  
  // 1. Get all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `
  
  const tableNames = tables.map(t => t.table_name)
  
  console.log(`📊 Total Tables Found: ${tableNames.length}\n`)
  
  // 2. Check record counts for all tables
  console.log('1️⃣ RECORD COUNTS FOR ALL TABLES:\n')
  
  const counts = []
  for (const tableName of tableNames) {
    try {
      const result = await sql.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      const count = parseInt(result.rows[0].count)
      counts.push({
        table: tableName,
        records: count,
        status: count === 0 ? '🔴 EMPTY' : '✅ HAS DATA'
      })
    } catch (err) {
      counts.push({
        table: tableName,
        records: 'ERROR',
        status: `❌ ${err.message.substring(0, 30)}`
      })
    }
  }
  
  counts.sort((a, b) => {
    if (a.records === 'ERROR') return 1
    if (b.records === 'ERROR') return -1
    return b.records - a.records
  })
  
  console.table(counts)
  
  // 3. Find empty tables
  console.log('\n2️⃣ EMPTY TABLES (Potential candidates for cleanup):\n')
  const emptyTables = counts.filter(c => c.records === 0)
  if (emptyTables.length > 0) {
    console.table(emptyTables.map(t => ({ table: t.table })))
  } else {
    console.log('✅ No empty tables found')
  }
  
  // 4. Look for similar table names
  console.log('\n3️⃣ SIMILAR TABLE NAME ANALYSIS:\n')
  
  const similarGroups = {}
  
  // Group by common keywords
  const keywords = ['influencer', 'campaign', 'audience', 'payment', 'invoice', 'user', 'brand', 'quotation', 'shortlist']
  
  keywords.forEach(keyword => {
    const matching = tableNames.filter(name => name.includes(keyword))
    if (matching.length > 1) {
      similarGroups[keyword] = matching
    }
  })
  
  Object.entries(similarGroups).forEach(([keyword, tables]) => {
    console.log(`\n📁 "${keyword.toUpperCase()}" related tables (${tables.length}):`)
    tables.forEach(t => {
      const count = counts.find(c => c.table === t)
      console.log(`   - ${t.padEnd(35)} (${count?.records || 0} records)`)
    })
  })
  
  console.log('\n\n4️⃣ POTENTIAL DUPLICATE ANALYSIS:\n')
  
  // Check for truly suspicious duplicates
  const suspiciousPairs = []
  
  // Check: influencer_platforms vs influencer_social_accounts
  const platforms = counts.find(c => c.table === 'influencer_platforms')
  const socialAccounts = counts.find(c => c.table === 'influencer_social_accounts')
  if (platforms && socialAccounts) {
    suspiciousPairs.push({
      pair: 'influencer_platforms vs influencer_social_accounts',
      table1: 'influencer_platforms',
      count1: platforms.records,
      table2: 'influencer_social_accounts', 
      count2: socialAccounts.records,
      verdict: '🔍 INVESTIGATE'
    })
  }
  
  // Check: influencer_payments vs payment_transactions
  const influencerPayments = counts.find(c => c.table === 'influencer_payments')
  const paymentTransactions = counts.find(c => c.table === 'payment_transactions')
  if (influencerPayments && paymentTransactions) {
    suspiciousPairs.push({
      pair: 'influencer_payments vs payment_transactions',
      table1: 'influencer_payments',
      count1: influencerPayments.records,
      table2: 'payment_transactions',
      count2: paymentTransactions.records,
      verdict: '🔍 INVESTIGATE'
    })
  }
  
  // Check: short_links vs tracking_links
  const shortLinks = counts.find(c => c.table === 'short_links')
  const trackingLinks = counts.find(c => c.table === 'tracking_links')
  if (shortLinks && trackingLinks) {
    suspiciousPairs.push({
      pair: 'short_links vs tracking_links',
      table1: 'short_links',
      count1: shortLinks.records,
      table2: 'tracking_links',
      count2: trackingLinks.records,
      verdict: '🔍 INVESTIGATE'
    })
  }
  
  if (suspiciousPairs.length > 0) {
    console.table(suspiciousPairs)
  } else {
    console.log('✅ No obvious duplicates found')
  }
  
  console.log('\n\n📊 FINAL SUMMARY:')
  console.log(`   Total tables: ${tableNames.length}`)
  console.log(`   Empty tables: ${emptyTables.length}`)
  console.log(`   Suspicious pairs: ${suspiciousPairs.length}`)
  
  console.log('\n✅ Analysis complete!')
}

findDuplicateTables().catch(console.error)
