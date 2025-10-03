// Simple script to run the SQL to clear content links
const fs = require('fs')
const path = require('path')

async function runClearContentLinksSQL() {
  try {
    console.log('🧹 Running content links cleanup SQL...')
    
    // Read the comprehensive SQL file
    const sqlPath = path.join(__dirname, 'clear-all-content-links.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📋 SQL script loaded successfully')
    console.log('\n' + '='.repeat(60))
    console.log('📝 EXECUTE THIS SQL IN YOUR DATABASE:')
    console.log('='.repeat(60))
    console.log(sql)
    console.log('='.repeat(60))
    
    console.log('\n✅ Instructions:')
    console.log('1. Copy the SQL above')
    console.log('2. Run it in your database (psql, pgAdmin, or any PostgreSQL client)')
    console.log('3. The script will show before/after counts and clear all content links')
    
    console.log('\n🔧 Alternative: Use the API endpoint (requires authentication):')
    console.log('POST http://localhost:3004/api/admin/clear-content-links')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run if called directly
if (require.main === module) {
  runClearContentLinksSQL()
}

module.exports = { runClearContentLinksSQL }
