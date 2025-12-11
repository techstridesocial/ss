/**
 * Detailed Check of Influencer Notes
 * Shows exactly what's stored in modash_data for debugging
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function checkNotes() {
  let pool
  
  try {
    console.log('🔍 Detailed check of influencer notes...\n')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    const query = async (text, params) => {
      const result = await pool.query(text, params)
      return result.rows
    }

    // Check the specific influencer ID that was failing
    const influencerId = '02f68bd0-b120-4da8-ace1-4dbeb5af2aee'
    
    console.log(`🔍 Checking influencer: ${influencerId}\n`)

    const influencers = await query(`
      SELECT 
        id,
        display_name,
        notes
      FROM influencers
      WHERE id = $1 OR notes::text LIKE '%modash_data%'
      ORDER BY display_name
      LIMIT 20
    `, influencerId === '02f68bd0-b120-4da8-ace1-4dbeb5af2aee' ? [influencerId] : [])

    console.log(`📊 Found ${influencers.length} influencers\n`)

    for (const influencer of influencers) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`Influencer: ${influencer.display_name}`)
      console.log(`ID: ${influencer.id}`)
      console.log(`${'='.repeat(60)}`)

      if (!influencer.notes) {
        console.log('   Notes: NULL/EMPTY')
        continue
      }

      try {
        const notes = typeof influencer.notes === 'string' 
          ? JSON.parse(influencer.notes) 
          : influencer.notes

        const modashData = notes?.modash_data
        if (!modashData) {
          console.log('   modash_data: NOT FOUND')
          continue
        }

        console.log('   modash_data found!')
        console.log(`   Platform: ${modashData.platform || 'N/A'}`)
        console.log(`   Legacy userId: ${modashData.userId || 'N/A'}`)
        console.log(`   Legacy modash_user_id: ${modashData.modash_user_id || 'N/A'}`)
        
        if (modashData.platforms) {
          console.log(`   Platform-specific data:`)
          for (const [platform, data] of Object.entries(modashData.platforms)) {
            const platformData = data || {}
            console.log(`     ${platform}:`)
            console.log(`       userId: ${platformData.userId || 'N/A'}`)
            console.log(`       username: ${platformData.username || 'N/A'}`)
            console.log(`       last_refreshed: ${platformData.last_refreshed || 'N/A'}`)
            
            // Check if it's a UUID
            if (platformData.userId) {
              const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
              if (uuidPattern.test(platformData.userId)) {
                console.log(`       ⚠️  WARNING: userId is a UUID!`)
              }
            }
          }
        } else {
          console.log(`   platforms: NOT FOUND`)
        }

        // Show raw notes structure
        console.log(`\n   Raw modash_data structure:`)
        console.log(JSON.stringify(modashData, null, 2))

      } catch (err) {
        console.log(`   ❌ Error parsing notes: ${err.message}`)
        console.log(`   Raw notes (first 500 chars): ${String(influencer.notes).substring(0, 500)}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

checkNotes()

