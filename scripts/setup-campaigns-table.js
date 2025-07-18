require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function setupCampaignsTable() {
  console.log('🎯 Setting up campaigns table for immediate use...')
  
  // Get database connection string
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables')
    return
  }
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    // First, check if campaigns table exists and what columns it has
    const tableExists = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'campaigns'
    `)
    
    if (tableExists.rows.length > 0) {
      console.log('📋 Campaigns table exists, checking columns...')
      
      // Get existing columns
      const existingColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaigns'
        ORDER BY ordinal_position
      `)
      
      console.log('Existing columns:')
      existingColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`)
      })
      
      // Add missing columns that our API expects
      const columnsToAdd = [
        { name: 'brand', type: 'VARCHAR(200)', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand VARCHAR(200);` },
        { name: 'goals', type: 'JSONB', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]';` },
        { name: 'start_date', type: 'DATE', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;` },
        { name: 'end_date', type: 'DATE', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE;` },
        { name: 'application_deadline', type: 'DATE', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS application_deadline DATE;` },
        { name: 'content_deadline', type: 'DATE', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content_deadline DATE;` },
        { name: 'total_budget', type: 'DECIMAL(10,2)', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_budget DECIMAL(10,2) DEFAULT 0;` },
        { name: 'per_influencer_budget', type: 'DECIMAL(10,2)', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS per_influencer_budget DECIMAL(10,2) DEFAULT 0;` },
        { name: 'min_followers', type: 'INTEGER', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS min_followers INTEGER DEFAULT 1000;` },
        { name: 'max_followers', type: 'INTEGER', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_followers INTEGER DEFAULT 1000000;` },
        { name: 'min_engagement', type: 'DECIMAL(5,2)', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS min_engagement DECIMAL(5,2) DEFAULT 2.0;` },
        { name: 'platforms', type: 'JSONB', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '[]';` },
        { name: 'demographics', type: 'JSONB', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS demographics JSONB DEFAULT '{}';` },
        { name: 'content_guidelines', type: 'TEXT', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content_guidelines TEXT;` },
        { name: 'deliverables', type: 'JSONB', condition: `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]';` }
      ]
      
      console.log('🔧 Adding missing columns...')
      for (const column of columnsToAdd) {
        try {
          await client.query(column.condition)
          console.log(`  ✅ Added/verified column: ${column.name}`)
        } catch (error) {
          console.log(`  ⚠️  Column ${column.name}: ${error.message}`)
        }
      }
      
    } else {
      console.log('📝 Creating campaigns table from scratch...')
      // Create the complete table
      const createTableQuery = `
        CREATE TABLE campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          brand VARCHAR(200) NOT NULL,
          status VARCHAR(20) DEFAULT 'DRAFT',
          description TEXT,
          goals JSONB DEFAULT '[]',
          start_date DATE,
          end_date DATE,
          application_deadline DATE,
          content_deadline DATE,
          total_budget DECIMAL(10,2) DEFAULT 0,
          per_influencer_budget DECIMAL(10,2) DEFAULT 0,
          min_followers INTEGER DEFAULT 1000,
          max_followers INTEGER DEFAULT 1000000,
          min_engagement DECIMAL(5,2) DEFAULT 2.0,
          platforms JSONB DEFAULT '[]',
          demographics JSONB DEFAULT '{}',
          content_guidelines TEXT,
          deliverables JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      
      await client.query(createTableQuery)
      console.log('✅ Campaigns table created')
    }
    
    // Create campaign_influencers table if it doesn't exist
    const createCampaignInfluencersQuery = `
      CREATE TABLE IF NOT EXISTS campaign_influencers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        influencer_id UUID,
        status VARCHAR(20) DEFAULT 'INVITED',
        compensation_amount DECIMAL(10,2),
        notes TEXT,
        deadline TIMESTAMP WITH TIME ZONE,
        product_shipped BOOLEAN DEFAULT FALSE,
        content_posted BOOLEAN DEFAULT FALSE,
        payment_released BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    await client.query(createCampaignInfluencersQuery)
    console.log('✅ Campaign influencers table created/verified')
    
    // Check if any campaigns exist
    const campaignCount = await client.query('SELECT COUNT(*) as count FROM campaigns')
    console.log(`📊 Current campaigns in database: ${campaignCount.rows[0].count}`)
    
    // Add some sample data if table is empty
    if (campaignCount.rows[0].count === '0') {
      console.log('📝 Adding sample campaign data...')
      
      const sampleCampaigns = [
        {
          name: 'Summer Collection Launch',
          brand: 'Fashion Forward',
          status: 'ACTIVE',
          description: 'Launch our new summer collection with top fashion influencers',
          goals: ['Brand awareness', 'Drive sales'],
          start_date: '2024-06-01',
          end_date: '2024-06-30',
          application_deadline: '2024-05-15',
          content_deadline: '2024-06-25',
          total_budget: 15000,
          per_influencer_budget: 1500,
          min_followers: 10000,
          max_followers: 500000,
          min_engagement: 3.0,
          platforms: ['instagram', 'tiktok'],
          demographics: { ageRange: '18-35', location: 'UK' },
          content_guidelines: 'High-quality photos, natural lighting',
          deliverables: ['2 feed posts', '3 stories']
        },
        {
          name: 'Tech Product Review',
          brand: 'TechCorp',
          status: 'DRAFT',
          description: 'Review our latest smart device',
          goals: ['Product awareness'],
          start_date: '2024-07-01',
          end_date: '2024-07-15',
          application_deadline: '2024-06-20',
          content_deadline: '2024-07-10',
          total_budget: 8000,
          per_influencer_budget: 2000,
          min_followers: 50000,
          max_followers: 1000000,
          min_engagement: 4.0,
          platforms: ['youtube'],
          demographics: { ageRange: '25-45', interests: 'technology' },
          content_guidelines: 'Detailed review, honest opinions',
          deliverables: ['1 review video']
        }
      ]
      
      for (const campaign of sampleCampaigns) {
        try {
          await client.query(`
            INSERT INTO campaigns (
              name, brand, status, description, goals, start_date, end_date,
              application_deadline, content_deadline, total_budget, per_influencer_budget,
              min_followers, max_followers, min_engagement, platforms, demographics,
              content_guidelines, deliverables
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
            campaign.name,
            campaign.brand,
            campaign.status,
            campaign.description,
            JSON.stringify(campaign.goals),
            campaign.start_date,
            campaign.end_date,
            campaign.application_deadline,
            campaign.content_deadline,
            campaign.total_budget,
            campaign.per_influencer_budget,
            campaign.min_followers,
            campaign.max_followers,
            campaign.min_engagement,
            JSON.stringify(campaign.platforms),
            JSON.stringify(campaign.demographics),
            campaign.content_guidelines,
            JSON.stringify(campaign.deliverables)
          ])
          console.log(`  ✅ Added sample campaign: ${campaign.name}`)
        } catch (error) {
          console.log(`  ⚠️  Error adding campaign ${campaign.name}: ${error.message}`)
        }
      }
    }
    
    console.log('🎉 Campaigns table setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up campaigns table:', error.message)
  } finally {
    await client.end()
  }
}

// Run the script
setupCampaignsTable() 