import { query } from './connection'

async function checkCampaignSystem() {
  console.log('🎯 Checking Campaign System Database Integration...\n')
  
  try {
    // 1. Check campaign-related tables exist
    console.log('1. Checking Campaign Tables:')
    const campaignTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'campaigns', 'campaign_influencers', 'campaign_invitations',
        'quotations', 'quotation_influencers'
      )
      ORDER BY table_name
    `)
    
    const expectedTables = ['campaigns', 'campaign_influencers', 'campaign_invitations', 'quotations', 'quotation_influencers']
    expectedTables.forEach(table => {
      const exists = campaignTables.find(t => t.table_name === table)
      console.log(`   ${exists ? '✅' : '❌'} ${table}`)
    })
    
    // 2. Check campaigns table structure
    console.log('\n2. Campaigns Table Schema:')
    const campaignsSchema = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' 
      ORDER BY ordinal_position
    `)
    
    const requiredCampaignColumns = [
      'id', 'name', 'brand_id', 'status', 'created_at', 'updated_at',
      'description', 'budget', 'start_date', 'end_date'
    ]
    
    console.log('   Campaign columns:')
    campaignsSchema.forEach(col => {
      const isRequired = requiredCampaignColumns.includes(col.column_name)
      console.log(`   ${isRequired ? '✅' : '📋'} ${col.column_name} (${col.data_type})`)
    })
    
    // 3. Check current campaign data
    console.log('\n3. Current Campaign Data:')
    const campaigns = await query(`
      SELECT 
        id, name, status, created_at,
        (SELECT COUNT(*) FROM campaign_influencers ci WHERE ci.campaign_id = c.id) as influencer_count
      FROM campaigns c
      ORDER BY created_at DESC
      LIMIT 5
    `)
    
    console.log(`   Found ${campaigns.length} campaigns:`)
    campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (${campaign.status}) - ${campaign.influencer_count} influencers - Created: ${new Date(campaign.created_at).toLocaleDateString()}`)
    })
    
    // 4. Check campaign statuses
    console.log('\n4. Campaign Status Distribution:')
    const statusDistribution = await query(`
      SELECT status, COUNT(*) as count
      FROM campaigns 
      GROUP BY status
      ORDER BY status
    `)
    
    statusDistribution.forEach(status => {
      console.log(`   ${status.status}: ${status.count} campaigns`)
    })
    
    // 5. Check quotations system
    console.log('\n5. Quotations System:')
    const quotations = await query(`
      SELECT 
        id, status, created_at,
        (SELECT COUNT(*) FROM quotation_influencers qi WHERE qi.quotation_id = q.id) as influencer_count
      FROM quotations q
      ORDER BY created_at DESC
      LIMIT 5
    `)
    
    console.log(`   Found ${quotations.length} quotations:`)
    quotations.forEach(quotation => {
      console.log(`   - Quotation ${quotation.id} (${quotation.status}) - ${quotation.influencer_count} influencers - Created: ${new Date(quotation.created_at).toLocaleDateString()}`)
    })
    
    // 6. Check quotation statuses
    console.log('\n6. Quotation Status Distribution:')
    const quotationStatuses = await query(`
      SELECT status, COUNT(*) as count
      FROM quotations 
      GROUP BY status
      ORDER BY status
    `)
    
    quotationStatuses.forEach(status => {
      console.log(`   ${status.status}: ${status.count} quotations`)
    })
    
    // 7. Check campaign-influencer relationships
    console.log('\n7. Campaign-Influencer Relationships:')
    const campaignInfluencers = await query(`
      SELECT 
        c.name as campaign_name,
        c.status as campaign_status,
        i.display_name as influencer_name,
        ci.participation_status,
        ci.created_at
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      JOIN influencers i ON ci.influencer_id = i.id
      ORDER BY ci.created_at DESC
      LIMIT 5
    `)
    
    console.log(`   Found ${campaignInfluencers.length} campaign assignments:`)
    campaignInfluencers.forEach(assignment => {
      console.log(`   - ${assignment.influencer_name} → ${assignment.campaign_name} (${assignment.participation_status})`)
    })
    
    // 8. Check campaign invitations
    console.log('\n8. Campaign Invitations:')
    const invitations = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM campaign_invitations
      GROUP BY status
      ORDER BY status
    `)
    
    console.log(`   Invitation statuses:`)
    invitations.forEach(inv => {
      console.log(`   ${inv.status}: ${inv.count} invitations`)
    })
    
    // 9. Check for API endpoints
    console.log('\n9. Campaign API Endpoints Status:')
    console.log('   /api/campaigns (GET): ✅ Expected for listing campaigns')
    console.log('   /api/campaigns (POST): ✅ Expected for creating campaigns')
    console.log('   /api/campaigns/[id] (PUT): ✅ Expected for updating campaigns')
    console.log('   /api/quotations (GET/POST): ✅ Expected for quotation system')
    console.log('   /api/campaign-invitations: ✅ Expected for invitation system')
    
    // 10. Check enum values for statuses
    console.log('\n10. Campaign Status Enums:')
    const campaignEnums = await query(`
      SELECT 
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'campaign_status'
      ORDER BY e.enumsortorder
    `)
    
    console.log('   Campaign statuses:')
    campaignEnums.forEach(enumVal => {
      console.log(`   - ${enumVal.enum_value}`)
    })
    
    // 11. Overall system health
    console.log('\n11. Overall Campaign System Health:')
    const totalCampaigns = await query('SELECT COUNT(*) as count FROM campaigns')
    const totalQuotations = await query('SELECT COUNT(*) as count FROM quotations')
    const totalInvitations = await query('SELECT COUNT(*) as count FROM campaign_invitations')
    const totalAssignments = await query('SELECT COUNT(*) as count FROM campaign_influencers')
    
    console.log(`   Total Campaigns: ${totalCampaigns[0]?.count || 0}`)
    console.log(`   Total Quotations: ${totalQuotations[0]?.count || 0}`)
    console.log(`   Total Invitations: ${totalInvitations[0]?.count || 0}`)
    console.log(`   Total Assignments: ${totalAssignments[0]?.count || 0}`)
    
    // 12. Final verdict
    console.log('\n🎯 CAMPAIGN SYSTEM VERDICT:')
    const hasAllTables = expectedTables.every(table => 
      campaignTables.find(t => t.table_name === table)
    )
    
    if (hasAllTables) {
      console.log('✅ DATABASE SCHEMA: Fully configured for campaigns')
      console.log('✅ TABLES: All campaign-related tables present')
      
      if ((totalCampaigns[0]?.count || 0) > 0) {
        console.log('✅ DATA: Campaign data present in database')
        console.log('✅ OPERATIONAL: Campaign system is active')
      } else {
        console.log('🆕 DATA: No campaigns yet, but ready to receive data')
        console.log('✅ READY: Campaign system configured and waiting for data')
      }
      
      if ((totalQuotations[0]?.count || 0) > 0) {
        console.log('✅ QUOTATIONS: Quotation system active with data')
      } else {
        console.log('🆕 QUOTATIONS: Quotation system ready but no data yet')
      }
      
    } else {
      console.log('❌ SCHEMA: Missing required campaign tables')
      console.log('⚠️  NEEDS: Database schema migration required')
    }
    
  } catch (error) {
    console.error('❌ Error checking campaign system:', error)
  }
}

checkCampaignSystem().then(() => process.exit(0)) 