import { query, checkDatabaseHealth } from './connection'

async function checkSchemaHealth() {
  console.log('🔍 Checking database schema health...\n')
  
  try {
    // 1. Test basic connection
    console.log('1. Testing database connection...')
    const isHealthy = await checkDatabaseHealth()
    if (!isHealthy) {
      throw new Error('Database connection failed')
    }
    console.log('✅ Database connection: OK\n')

    // 2. Check core tables exist
    console.log('2. Checking core tables...')
    const coreTableCheck = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'users', 'user_profiles', 'influencers', 'influencer_platforms',
        'brands', 'campaigns', 'campaign_influencers', 'shortlists',
        'oauth_tokens', 'audit_logs'
      )
      ORDER BY table_name
    `
    const tables = await query<{ table_name: string }>(coreTableCheck)
    
    const expectedTables = [
      'audit_logs', 'brands', 'campaign_influencers', 'campaigns', 
      'influencers', 'influencer_platforms', 'oauth_tokens', 
      'shortlists', 'user_profiles', 'users'
    ]
    
    const foundTables = tables.map(t => t.table_name).sort()
    const missingTables = expectedTables.filter(t => !foundTables.includes(t))
    
    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`)
    } else {
      console.log('✅ All core tables present')
    }
    console.log(`   Found: ${foundTables.join(', ')}\n`)

    // 3. Check migration tables (quotations system)
    console.log('3. Checking migration tables...')
    const migrationTableCheck = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quotations', 'quotation_influencers', 'campaign_invitations')
      ORDER BY table_name
    `
    const migrationTables = await query<{ table_name: string }>(migrationTableCheck)
    const expectedMigrationTables = ['campaign_invitations', 'quotation_influencers', 'quotations']
    const foundMigrationTables = migrationTables.map(t => t.table_name).sort()
    const missingMigrationTables = expectedMigrationTables.filter(t => !foundMigrationTables.includes(t))
    
    if (missingMigrationTables.length > 0) {
      console.log(`⚠️  Missing migration tables: ${missingMigrationTables.join(', ')}`)
      console.log('   This might indicate the quotation-campaign migration needs to be run')
    } else {
      console.log('✅ All migration tables present')
    }
    console.log(`   Found: ${foundMigrationTables.join(', ')}\n`)

    // 4. Check enums exist
    console.log('4. Checking custom enums...')
    const enumCheck = `
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typname IN (
        'user_role', 'user_status', 'platform_type', 'campaign_status',
        'participation_status', 'payment_method_type', 'quotation_status',
        'invitation_status'
      )
      ORDER BY typname
    `
    const enums = await query<{ typname: string }>(enumCheck)
    const foundEnums = enums.map(e => e.typname).sort()
    console.log(`✅ Found enums: ${foundEnums.join(', ')}\n`)

    // 5. Check sample data
    console.log('5. Checking for sample data...')
    const userCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM users')
    const influencerCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM influencers')
    const brandCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM brands')
    
    console.log(`   Users: ${userCount[0]?.count || 0}`)
    console.log(`   Influencers: ${influencerCount[0]?.count || 0}`)
    console.log(`   Brands: ${brandCount[0]?.count || 0}\n`)

    // 6. Check database version and connection info
    console.log('6. Database information...')
    const dbInfo = await query<{ version: string }>('SELECT version()')
    const connectionInfo = await query<{ 
      database: string; 
      user: string; 
      host: string; 
      port: string; 
    }>(`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as host,
        inet_server_port()::text as port
    `)
    
    console.log(`   Database: ${connectionInfo[0]?.database}`)
    console.log(`   User: ${connectionInfo[0]?.user}`)
    console.log(`   Host: ${connectionInfo[0]?.host || 'localhost'}`)
    console.log(`   Version: ${dbInfo[0]?.version?.split(' ')[0]} ${dbInfo[0]?.version?.split(' ')[1]}\n`)

    console.log('🎉 Database health check completed!')
    
    // Summary
    const totalIssues = missingTables.length + missingMigrationTables.length
    if (totalIssues === 0) {
      console.log('✅ All systems operational - database is up to date!')
    } else {
      console.log(`⚠️  Found ${totalIssues} potential issues that may need attention`)
    }

  } catch (_error) {
    console.error('❌ Database health check failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  checkSchemaHealth()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default checkSchemaHealth 