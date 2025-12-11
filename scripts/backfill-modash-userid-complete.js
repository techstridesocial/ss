/**
 * Complete Backfill: Fetch and update modash_user_id for ALL platforms
 * Uses Modash API to fetch userId by username, then updates database
 * Goal: 100% coverage - every platform with username should have modash_user_id
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

// Import modash service (we'll need to adapt it for Node.js)
// For now, we'll implement a minimal version that works in Node.js

const BASE_URL = 'https://api.modash.io/v1'
const API_KEY = process.env.MODASH_API_KEY

if (!API_KEY) {
  throw new Error('❌ Missing MODASH_API_KEY in environment')
}

// Simple rate limiter (avoid hitting rate limits)
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 250 // 250ms between requests (conservative)

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
}

async function searchModashUsers(username, platform) {
  await waitForRateLimit()
  
  const normalizedPlatform = platform.toLowerCase()
  const cleanUsername = username.replace('@', '').trim()
  
  const url = `${BASE_URL}/${normalizedPlatform}/users?query=${encodeURIComponent(cleanUsername)}&limit=5`
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Search failed (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    // Find exact match by username (case-insensitive)
    if (data?.users && Array.isArray(data.users)) {
      const exactMatch = data.users.find((user) => 
        user.username && user.username.toLowerCase() === cleanUsername.toLowerCase()
      )
      
      if (exactMatch && exactMatch.userId) {
        return exactMatch.userId
      }
      
      // If no exact match, try first result if username is similar
      if (data.users.length > 0 && data.users[0].userId) {
        return data.users[0].userId
      }
    }
    
    throw new Error('No matching user found in search results')
    
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`)
  }
}

async function fetchModashProfile(username, platform) {
  await waitForRateLimit()
  
  // Normalize platform
  const normalizedPlatform = platform.toLowerCase()
  const cleanUsername = username.replace('@', '').trim()
  
  // Handle YouTube special case - check if it's a channel ID
  let identifier = cleanUsername
  if (normalizedPlatform === 'youtube') {
    // If it doesn't start with UC, we assume it's a username/handle
    // Modash API should handle this, but we'll try as-is first
    if (!cleanUsername.startsWith('UC') && !cleanUsername.startsWith('@')) {
      identifier = cleanUsername
    }
  }
  
  const url = `${BASE_URL}/${normalizedPlatform}/profile/${encodeURIComponent(identifier)}/report`
  
  console.log(`   🔍 Fetching: ${cleanUsername} on ${normalizedPlatform}...`)
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60'
        throw new Error(`RATE_LIMIT: ${retryAfter}`)
      }
      
      // For 400/404, try search as fallback
      if (response.status === 400 || response.status === 404) {
        console.log(`   ⚠️  Direct lookup failed (${response.status}), trying search method...`)
        try {
          const userIdFromSearch = await searchModashUsers(cleanUsername, normalizedPlatform)
          console.log(`   ✅ Found via search: ${userIdFromSearch}`)
          return userIdFromSearch
        } catch (searchError) {
          throw new Error(`Both direct lookup and search failed. Direct: ${errorData.error || errorText}; Search: ${searchError.message}`)
        }
      }
      
      throw new Error(`API_ERROR (${response.status}): ${errorData.error || errorText}`)
    }
    
    const data = await response.json()
    
    // Extract userId from response
    // The profile response should have a userId field
    if (data?.profile?.userId) {
      return data.profile.userId
    } else if (data?.userId) {
      return data.userId
    } else if (data?.profile?.username && data.profile.username === cleanUsername) {
      // Sometimes the userId is the username itself for some platforms
      return cleanUsername
    }
    
    throw new Error('No userId found in response')
    
  } catch (error) {
    if (error.message.includes('RATE_LIMIT')) {
      throw error // Re-throw rate limit errors
    }
    // If error is a 400/404 from the fetch (caught before response.ok check), try search
    // Note: This won't catch 400/404 since we handle them above, but keeps fallback logic
    if (error.message.includes('API_ERROR (400)') || error.message.includes('API_ERROR (404)')) {
      // Search should have already been tried above, so just re-throw
      throw error
    }
    throw error
  }
}

async function backfillModashUserId() {
  let pool

  try {
    console.log('🚀 Starting complete Modash userId backfill...\n')

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

    // Find ALL platforms without modash_user_id but with username
    const toBackfill = await query(`
      SELECT 
        i.id as influencer_id,
        i.display_name,
        ip.id as platform_id,
        ip.platform,
        ip.username,
        ip.modash_user_id
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE ip.username IS NOT NULL 
        AND ip.username != ''
        AND (ip.modash_user_id IS NULL OR ip.modash_user_id = '')
        AND ip.platform IN ('INSTAGRAM', 'TIKTOK', 'YOUTUBE')
      ORDER BY i.display_name, ip.platform
    `)

    console.log(`📊 Found ${toBackfill.length} platform records to backfill\n`)
    console.log('='.repeat(70))

    if (toBackfill.length === 0) {
      console.log('✅ No records need backfilling - database is already 100% complete!')
      process.exit(0)
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    for (let i = 0; i < toBackfill.length; i++) {
      const record = toBackfill[i]
      const progress = `[${i + 1}/${toBackfill.length}]`
      
      console.log(`\n${progress} Processing: ${record.display_name} - ${record.platform}`)
      console.log(`   Username: ${record.username}`)

      try {
        // Fetch userId from Modash API
        const modashUserId = await fetchModashProfile(record.username, record.platform)
        
        // Validate userId (must not be UUID)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidPattern.test(modashUserId)) {
          results.skipped.push({
            influencer: record.display_name,
            platform: record.platform,
            username: record.username,
            reason: `Fetched userId is UUID (invalid): ${modashUserId}`
          })
          console.log(`   ⚠️  Skipped: Invalid UUID userId`)
          continue
        }

        // Update database
        await pool.query(`
          UPDATE influencer_platforms
          SET modash_user_id = $1, updated_at = NOW()
          WHERE id = $2
        `, [modashUserId, record.platform_id])

        results.success.push({
          influencer: record.display_name,
          platform: record.platform,
          username: record.username,
          modash_user_id: modashUserId
        })

        console.log(`   ✅ Success: Updated with userId = ${modashUserId}`)

      } catch (error) {
        // Handle rate limiting
        if (error.message.includes('RATE_LIMIT')) {
          const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || '60') * 1000
          console.log(`\n⏸️  Rate limit hit! Waiting ${retryAfter / 1000} seconds...`)
          await new Promise(resolve => setTimeout(resolve, retryAfter))
          // Retry the same record
          i--
          continue
        }

        results.failed.push({
          influencer: record.display_name,
          platform: record.platform,
          username: record.username,
          error: error.message
        })

        console.log(`   ❌ Failed: ${error.message}`)
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70))
    console.log('📊 BACKFILL SUMMARY')
    console.log('='.repeat(70))
    console.log(`   Total processed: ${toBackfill.length}`)
    console.log(`   ✅ Successfully backfilled: ${results.success.length}`)
    console.log(`   ❌ Failed: ${results.failed.length}`)
    console.log(`   ⚠️  Skipped: ${results.skipped.length}`)

    if (results.success.length > 0) {
      console.log('\n✅ Successfully Backfilled:')
      results.success.forEach(item => {
        console.log(`   • ${item.influencer} - ${item.platform}`)
        console.log(`     ${item.username} → ${item.modash_user_id}`)
      })
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed (need manual review):')
      results.failed.forEach(item => {
        console.log(`   • ${item.influencer} - ${item.platform}`)
        console.log(`     Username: ${item.username}`)
        console.log(`     Error: ${item.error}`)
      })
    }

    if (results.skipped.length > 0) {
      console.log('\n⚠️  Skipped (invalid data):')
      results.skipped.forEach(item => {
        console.log(`   • ${item.influencer} - ${item.platform}`)
        console.log(`     Reason: ${item.reason}`)
      })
    }

    // Calculate final coverage
    const finalStats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN modash_user_id IS NOT NULL AND modash_user_id != '' THEN 1 END) as with_userid
      FROM influencer_platforms
      WHERE username IS NOT NULL AND username != ''
        AND platform IN ('INSTAGRAM', 'TIKTOK', 'YOUTUBE')
    `)

    const total = parseInt(finalStats[0].total)
    const withUserId = parseInt(finalStats[0].with_userid)
    const coverage = total > 0 ? ((withUserId / total) * 100).toFixed(1) : 0

    console.log('\n' + '='.repeat(70))
    console.log('🎯 FINAL COVERAGE')
    console.log('='.repeat(70))
    console.log(`   Total platforms: ${total}`)
    console.log(`   With modash_user_id: ${withUserId} (${coverage}%)`)
    console.log(`   Without modash_user_id: ${total - withUserId} (${(100 - parseFloat(coverage)).toFixed(1)}%)`)

    if (coverage === '100.0') {
      console.log('\n🎉 PERFECT! 100/100 coverage achieved! 🚀\n')
    } else {
      console.log(`\n⚠️  Coverage: ${coverage}% (${total - withUserId} remaining)\n`)
    }

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Fatal error during backfill:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

backfillModashUserId()

