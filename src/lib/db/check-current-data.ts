import { query } from './connection'

async function checkCurrentData() {
  console.log('📊 Checking current data in Neon database...\n')
  
  try {
    // Check users table
    console.log('1. Users table:')
    const users = await query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5')
    console.log(`   Found ${users.length} users`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Created: ${user.created_at}`)
    })
    console.log()

    // Check influencers table
    console.log('2. Influencers table:')
    const influencers = await query(`
      SELECT 
        i.id,
        i.display_name,
        i.niches,
        i.total_followers,
        i.total_engagement_rate,
        i.influencer_type,
        i.created_at,
        up.first_name,
        up.last_name
      FROM influencers i
      LEFT JOIN user_profiles up ON i.user_id = up.user_id
      ORDER BY i.created_at DESC
      LIMIT 10
    `)
    console.log(`   Found ${influencers.length} influencers`)
    influencers.forEach(inf => {
      console.log(`   - ${inf.display_name} (${inf.influencer_type}) - ${inf.total_followers} followers - Created: ${inf.created_at}`)
    })
    console.log()

    // Check influencer_platforms table
    console.log('3. Influencer Platforms table:')
    const platforms = await query(`
      SELECT 
        ip.id,
        ip.platform,
        ip.username,
        ip.followers_count,
        ip.engagement_rate,
        i.display_name
      FROM influencer_platforms ip
      JOIN influencers i ON ip.influencer_id = i.id
      ORDER BY ip.created_at DESC
      LIMIT 10
    `)
    console.log(`   Found ${platforms.length} platform connections`)
    platforms.forEach(platform => {
      console.log(`   - ${platform.display_name} on ${platform.platform}: @${platform.username} (${platform.followers_count} followers)`)
    })
    console.log()

    // Check brands table
    console.log('4. Brands table:')
    const brands = await query('SELECT id, company_name, industry, created_at FROM brands ORDER BY created_at DESC LIMIT 5')
    console.log(`   Found ${brands.length} brands`)
    brands.forEach(brand => {
      console.log(`   - ${brand.company_name} (${brand.industry}) - Created: ${brand.created_at}`)
    })
    console.log()

    console.log('✅ Database data check completed!')
    
  } catch (_error) {
    console.error('❌ Error checking database data:', error)
  }
}

checkCurrentData().then(() => process.exit(0)) 