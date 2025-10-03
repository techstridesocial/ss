const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function checkCampaignSchema() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 Checking database schema for campaigns...\n')
  
  // 1. Check campaign_influencers table structure
  console.log('1️⃣ CAMPAIGN_INFLUENCERS TABLE STRUCTURE:')
  const campaignInfluencersSchema = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'campaign_influencers'
    ORDER BY ordinal_position
  `
  console.table(campaignInfluencersSchema)
  
  // 2. Check if content_links and discount_code columns exist
  console.log('\n2️⃣ CHECKING FOR CONTENT_LINKS AND DISCOUNT_CODE COLUMNS:')
  const contentLinksExists = campaignInfluencersSchema.find(col => col.column_name === 'content_links')
  const discountCodeExists = campaignInfluencersSchema.find(col => col.column_name === 'discount_code')
  
  console.log('✓ content_links column:', contentLinksExists ? '✅ EXISTS' : '❌ MISSING')
  console.log('✓ discount_code column:', discountCodeExists ? '✅ EXISTS' : '❌ MISSING')
  
  // 3. Check sample data
  console.log('\n3️⃣ SAMPLE DATA FROM CAMPAIGN_INFLUENCERS:')
  const sampleData = await sql`
    SELECT 
      id,
      campaign_id,
      influencer_id,
      status,
      content_links,
      discount_code,
      created_at
    FROM campaign_influencers
    LIMIT 5
  `
  console.table(sampleData)
  
  // 4. Check campaigns table structure
  console.log('\n4️⃣ CAMPAIGNS TABLE STRUCTURE:')
  const campaignsSchema = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'campaigns'
    ORDER BY ordinal_position
  `
  console.table(campaignsSchema)
  
  // 5. Check for any discount codes or content links in the database
  console.log('\n5️⃣ CHECKING EXISTING DISCOUNT CODES AND CONTENT LINKS:')
  const existingData = await sql`
    SELECT 
      COUNT(*) as total_records,
      COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]' THEN 1 END) as has_content_links,
      COUNT(CASE WHEN discount_code IS NOT NULL AND discount_code != '' THEN 1 END) as has_discount_code
    FROM campaign_influencers
  `
  console.table(existingData)
  
  console.log('\n✅ Schema check complete!')
}

checkCampaignSchema().catch(console.error)
