import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'
import { requireAuth } from '@/lib/auth/roles'

export async function POST() {
  try {
    // Require admin authentication
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🗑️  Starting to clear all content links...')
    
    // First, let's see how many content links exist
    const countResult = await query(`
      SELECT 
        COUNT(*) as total_campaign_influencers,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]' AND content_links != '' THEN 1 END) as with_content_links
      FROM campaign_influencers
    `)
    
    console.log('📊 Current state:')
    console.log(`   Total campaign influencers: ${countResult[0].total_campaign_influencers}`)
    console.log(`   With content links: ${countResult[0].with_content_links}`)
    
    if (countResult[0].with_content_links === '0') {
      return NextResponse.json({ 
        success: true, 
        message: 'No content links found to clear',
        cleared: 0,
        total: countResult[0].total_campaign_influencers
      })
    }
    
    // Clear all content links
    const updateResult = await query(`
      UPDATE campaign_influencers 
      SET content_links = NULL
      WHERE content_links IS NOT NULL 
        AND content_links != '[]' 
        AND content_links != ''
    `)
    
    console.log(`✅ Cleared content links from ${updateResult.length} campaign influencers`)
    
    // Verify the cleanup
    const verifyResult = await query(`
      SELECT 
        COUNT(*) as total_campaign_influencers,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]' AND content_links != '' THEN 1 END) as with_content_links
      FROM campaign_influencers
    `)
    
    console.log('📊 After cleanup:')
    console.log(`   Total campaign influencers: ${verifyResult[0].total_campaign_influencers}`)
    console.log(`   With content links: ${verifyResult[0].with_content_links}`)
    
    return NextResponse.json({
      success: true,
      message: 'All content links have been cleared',
      cleared: parseInt(countResult[0].with_content_links),
      total: verifyResult[0].total_campaign_influencers,
      remaining: verifyResult[0].with_content_links
    })
    
  } catch (_error) {
    console.error('❌ Error clearing content links:', error)
    return NextResponse.json(
      { error: 'Failed to clear content links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}