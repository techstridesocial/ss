/**
 * Add Random Celebrity Social Media Accounts to All Influencers
 * For testing the roster functionality with realistic data
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

// List of celebrity accounts for each platform
const CELEBRITY_ACCOUNTS = {
  INSTAGRAM: [
    'cristiano', 'leomessi', 'selenagomez', 'therock', 'arianagrande',
    'beyonce', 'kyliejenner', 'jenniferlopez', 'nickiminaj', 'natgeo',
    'kendalljenner', 'justinbieber', 'taylorswift', 'mileycyrus', 'katyperry',
    'jlo', 'kourtneykardash', 'kevinhart4real', 'cardib', 'kingjames',
    'chrisbrownofficial', 'kanyewest', 'emmawatson', 'vindiesel', 'zendaya',
    'jamesrodriguez10', 'championsleague', 'fcbarcelona', 'realmadrid', 'nasa'
  ],
  TIKTOK: [
    'charlidamelio', 'addisonre', 'zachking', 'spencerx', 'lorengray',
    'riyaz.14', 'babyariel', 'willsmith', 'jamescharles', 'therock',
    'khaby00', 'jasonderulo', 'kimkardashian', 'kyliejenner', 'selenagomez',
    'justinbieber', 'taylorswift', 'mileycyrus', 'arianagrande', 'cardib',
    'kingjames', 'vindiesel', 'zendaya', 'emmawatson', 'nickiminaj',
    'beyonce', 'kanyewest', 'kevinhart4real', 'zachking', 'liza_koshy'
  ],
  YOUTUBE: [
    'MrBeast', 'PewDiePie', 'Markiplier', 'jacksepticeye', 'Ninja',
    'Dude Perfect', 'whinderssonnunes', 'juegagerman', 'elrubiusOMG', 'Vegeta777',
    'RUBIUS', 'W2S', 'iShowSpeed', 'sidemen', 'KSI',
    'SSSniperWolf', 'Dream', 'Jelly', 'FGTeeV', 'Ryan\'s World',
    'SET India', 'T-Series', 'Justin Bieber', 'EminemMusic', 'Ed Sheeran',
    'Billie Eilish', 'Ariana Grande', 'Taylor Swift', 'Maroon 5', 'Bad Bunny'
  ]
}

/**
 * Get random celebrity account for a platform
 */
function getRandomCelebrity(platform) {
  const accounts = CELEBRITY_ACCOUNTS[platform]
  if (!accounts || accounts.length === 0) {
    return null
  }
  return accounts[Math.floor(Math.random() * accounts.length)]
}

/**
 * Get random subset of platforms (1-3 platforms per influencer)
 */
function getRandomPlatforms() {
  const allPlatforms = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE']
  const numPlatforms = Math.floor(Math.random() * 3) + 1 // 1-3 platforms
  const shuffled = [...allPlatforms].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numPlatforms)
}

/**
 * Generate profile URL for a platform
 */
function getProfileUrl(platform, username) {
  const platformLower = platform.toLowerCase()
  if (platform === 'YOUTUBE') {
    // YouTube URLs are tricky - use channel format or username
    return `https://www.youtube.com/@${username.replace(/\s+/g, '')}`
  } else if (platform === 'INSTAGRAM') {
    return `https://www.instagram.com/${username}/`
  } else if (platform === 'TIKTOK') {
    return `https://www.tiktok.com/@${username}/`
  }
  return `https://www.${platformLower}.com/${username}/`
}

/**
 * Generate random followers (realistic range)
 */
function getRandomFollowers() {
  // Range: 100K to 150M followers
  const min = 100000
  const max = 150000000
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random engagement rate (realistic range)
 */
function getRandomEngagementRate() {
  // Range: 0.015 (1.5%) to 0.10 (10%)
  const min = 0.015
  const max = 0.10
  return parseFloat((Math.random() * (max - min) + min).toFixed(4))
}

/**
 * Generate random average views (realistic range)
 */
function getRandomAvgViews() {
  // Range: 10K to 50M views
  const min = 10000
  const max = 50000000
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function addCelebrityPlatforms() {
  let pool

  try {
    console.log('🎬 Adding celebrity social media accounts to influencers...\n')

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment')
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    const query = async (text, params) => {
      const result = await pool.query(text, params)
      return result.rows
    }

    // Get all influencers
    console.log('🔍 Step 1: Fetching all influencers...\n')
    const influencers = await query(`
      SELECT id, display_name
      FROM influencers
      ORDER BY display_name
    `)

    console.log(`📊 Found ${influencers.length} influencers\n`)

    if (influencers.length === 0) {
      console.log('⚠️  No influencers found in database.')
      process.exit(0)
    }

    let updatedCount = 0
    const results = []

    for (const influencer of influencers) {
      try {
        console.log(`\n👤 Processing: ${influencer.display_name} (${influencer.id})`)

        // Get random platforms (1-3 platforms)
        const selectedPlatforms = getRandomPlatforms()
        console.log(`   📱 Selected platforms: ${selectedPlatforms.join(', ')}`)

        // Process each platform
        const platformData = []
        for (const platform of selectedPlatforms) {
          const username = getRandomCelebrity(platform)
          if (!username) {
            console.warn(`   ⚠️  No celebrity accounts available for ${platform}`)
            continue
          }

          const followers = getRandomFollowers()
          const engagementRate = getRandomEngagementRate()
          const avgViews = getRandomAvgViews()
          const profileUrl = getProfileUrl(platform, username)

          // Check if platform record already exists
          const existing = await query(
            'SELECT id FROM influencer_platforms WHERE influencer_id = $1 AND platform = $2',
            [influencer.id, platform]
          )

          if (existing.length > 0) {
            // Update existing record
            await pool.query(`
              UPDATE influencer_platforms SET
                username = $1,
                profile_url = $2,
                followers = $3,
                engagement_rate = $4,
                avg_views = $5,
                is_connected = false,
                updated_at = NOW()
              WHERE influencer_id = $6 AND platform = $7
            `, [username, profileUrl, followers, engagementRate, avgViews, influencer.id, platform])

            console.log(`   ✅ Updated ${platform}: @${username}`)
          } else {
            // Insert new record
            await pool.query(`
              INSERT INTO influencer_platforms (
                influencer_id, platform, username, profile_url,
                followers, engagement_rate, avg_views, is_connected,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
            `, [influencer.id, platform, username, profileUrl, followers, engagementRate, avgViews])

            console.log(`   ✅ Added ${platform}: @${username}`)
          }

          platformData.push({
            platform,
            username,
            followers,
            engagementRate: (engagementRate * 100).toFixed(2) + '%',
            avgViews: avgViews.toLocaleString()
          })
        }

        // Calculate totals for influencer
        const totals = await query(`
          SELECT 
            SUM(followers) as total_followers,
            AVG(engagement_rate) as avg_engagement_rate,
            AVG(avg_views) as total_avg_views
          FROM influencer_platforms
          WHERE influencer_id = $1
        `, [influencer.id])

        const totalFollowers = Math.floor(totals[0]?.total_followers || 0)
        const avgEngagement = parseFloat(totals[0]?.avg_engagement_rate || 0)
        const totalAvgViews = Math.floor(totals[0]?.total_avg_views || 0)

        // Update influencer totals
        await pool.query(`
          UPDATE influencers SET
            total_followers = $1,
            total_engagement_rate = $2,
            total_avg_views = $3,
            updated_at = NOW()
          WHERE id = $4
        `, [totalFollowers, avgEngagement, totalAvgViews, influencer.id])

        updatedCount++
        results.push({
          id: influencer.id,
          display_name: influencer.display_name,
          platforms: platformData
        })

        console.log(`   📊 Updated totals: ${totalFollowers.toLocaleString()} followers, ${(avgEngagement * 100).toFixed(2)}% engagement`)

      } catch (err) {
        console.error(`   ❌ Error processing ${influencer.display_name}:`, err.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`   Total influencers processed: ${influencers.length}`)
    console.log(`   Successfully updated: ${updatedCount}`)
    console.log(`   Failed: ${influencers.length - updatedCount}`)

    console.log('\n📋 Updated Influencers:')
    results.forEach(result => {
      console.log(`\n   • ${result.display_name}`)
      result.platforms.forEach(p => {
        console.log(`     - ${p.platform}: @${p.username} (${p.followers.toLocaleString()} followers, ${p.engagementRate} engagement)`)
      })
    })

    console.log('\n✅ All celebrity platforms added successfully!')
    console.log('   You can now test the roster analytics functionality.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding celebrity platforms:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

addCelebrityPlatforms()

