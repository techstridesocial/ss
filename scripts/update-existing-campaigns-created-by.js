const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function updateExistingCampaigns() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Checking existing campaigns without created_by...')
    
    // Check campaigns without created_by
    const campaignsWithoutCreator = await client.query(`
      SELECT id, name, created_at 
      FROM campaigns 
      WHERE created_by IS NULL
      ORDER BY created_at DESC
    `)
    
    console.log(`📊 Found ${campaignsWithoutCreator.rows.length} campaigns without created_by`)
    
    if (campaignsWithoutCreator.rows.length > 0) {
      console.log('📋 Campaigns without creator:')
      campaignsWithoutCreator.rows.forEach(campaign => {
        console.log(`  - ${campaign.name} (${campaign.id}) - Created: ${campaign.created_at}`)
      })
      
      // Get the first user to assign as creator for existing campaigns
      const staffUser = await client.query(`
        SELECT u.id, u.email
        FROM users u
        ORDER BY u.created_at ASC
        LIMIT 1
      `)
      
      if (staffUser.rows.length > 0) {
        const defaultCreator = staffUser.rows[0]
        console.log(`👤 Assigning default creator: ${defaultCreator.email}`)
        
        // Update all campaigns without created_by
        const updateResult = await client.query(`
          UPDATE campaigns 
          SET created_by = $1
          WHERE created_by IS NULL
        `, [defaultCreator.id])
        
        console.log(`✅ Updated ${updateResult.rowCount} campaigns with default creator`)
      } else {
        console.log('⚠️ No staff users found to assign as default creator')
      }
    }
    
    // Verify the update
    const updatedCampaigns = await client.query(`
      SELECT c.id, c.name, u.email as creator_email
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `)
    
    console.log('📊 Recent campaigns with creator info:')
    updatedCampaigns.rows.forEach(campaign => {
      console.log(`  - ${campaign.name}: Created by ${campaign.creator_email}`)
    })
    
    console.log('✅ Campaign creator tracking setup complete!')
    
  } catch (error) {
    console.error('❌ Error updating campaigns:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

updateExistingCampaigns()
  .then(() => {
    console.log('🎉 Campaign creator tracking update completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to update campaigns:', error)
    process.exit(1)
  })
