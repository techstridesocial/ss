const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function findDuplicateTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 COMPREHENSIVE DATABASE DUPLICATE CHECK\n')
  
  // 1. Get all tables
  console.log('1️⃣ ALL TABLES IN DATABASE:')
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `
  console.table(tables)
  
  // 2. Group similar table names
  console.log('\n2️⃣ ANALYZING TABLE NAMES FOR POTENTIAL DUPLICATES:\n')
  
  const tableNames = tables.map(t => t.table_name)
  const suspiciousGroups = {}
  
  // Group tables by similar base names
  tableNames.forEach(name => {
    // Extract base name (remove common suffixes/prefixes)
    const baseName = name
      .replace(/_temp$/, '')
      .replace(/_old$/, '')
      .replace(/_new$/, '')
      .replace(/_backup$/, '')
      .replace(/^old_/, '')
      .replace(/^new_/, '')
      .replace(/^temp_/, '')
    
    if (!suspiciousGroups[baseName]) {
      suspiciousGroups[baseName] = []
    }
    suspiciousGroups[baseName].push(name)
  })
  
  // Find groups with multiple tables
  const potentialDuplicates = Object.entries(suspiciousGroups)
    .filter(([_, tables]) => tables.length > 1)
  
  if (potentialDuplicates.length > 0) {
    console.log('⚠️  POTENTIAL DUPLICATE GROUPS FOUND:')
    potentialDuplicates.forEach(([baseName, tables]) => {
      console.log(`\n   ${baseName}:`)
      tables.forEach(t => console.log(`     - ${t}`))
    })
  } else {
    console.log('✅ No obvious duplicate table name patterns found')
  }
  
  // 3. Check for tables with identical structures
  console.log('\n\n3️⃣ CHECKING FOR IDENTICAL TABLE STRUCTURES:\n')
  
  const tableStructures = {}
  
  for (const table of tableNames) {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${table}
      ORDER BY ordinal_position
    `
    
    const structure = columns.map(c => `${c.column_name}:${c.data_type}:${c.is_nullable}`).join('|')
    
    if (!tableStructures[structure]) {
      tableStructures[structure] = []
    }
    tableStructures[structure].push({
      name: table,
      columnCount: columns.length
    })
  }
  
  const identicalStructures = Object.entries(tableStructures)
    .filter(([_, tables]) => tables.length > 1)
  
  if (identicalStructures.length > 0) {
    console.log('⚠️  TABLES WITH IDENTICAL STRUCTURES:')
    identicalStructures.forEach(([_, tables]) => {
      console.log(`\n   ${tables[0].columnCount} columns:`)
      tables.forEach(t => console.log(`     - ${t.name}`))
    })
  } else {
    console.log('✅ No tables with identical structures found')
  }
  
  // 4. Check record counts for all tables
  console.log('\n\n4️⃣ RECORD COUNTS FOR ALL TABLES:\n')
  
  const counts = []
  for (const table of tableNames) {
    try {
      const result = await sql(`SELECT COUNT(*) as count FROM "${table}"`)
      counts.push({
        table: table,
        records: result[0].count,
        status: result[0].count === '0' ? '🔴 EMPTY' : '✅ HAS DATA'
      })
    } catch (err) {
      counts.push({
        table: table,
        records: 'ERROR',
        status: '❌ ERROR'
      })
    }
  }
  
  counts.sort((a, b) => {
    if (a.records === 'ERROR') return 1
    if (b.records === 'ERROR') return -1
    return parseInt(b.records) - parseInt(a.records)
  })
  
  console.table(counts)
  
  // 5. Find empty tables
  console.log('\n5️⃣ EMPTY TABLES (Potential candidates for cleanup):\n')
  const emptyTables = counts.filter(c => c.records === '0')
  if (emptyTables.length > 0) {
    console.table(emptyTables)
  } else {
    console.log('✅ No empty tables found')
  }
  
  console.log('\n\n📊 SUMMARY:')
  console.log(`   Total tables: ${tableNames.length}`)
  console.log(`   Empty tables: ${emptyTables.length}`)
  console.log(`   Potential duplicate groups: ${potentialDuplicates.length}`)
  console.log(`   Identical structures: ${identicalStructures.length}`)
  
  console.log('\n✅ Analysis complete!')
}

findDuplicateTables().catch(console.error)
