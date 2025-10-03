import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// POST - Clear all content links from campaign_influencers table
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin/staff role
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Admin/Staff access required' }, { status: 403 })
    }

    console.log('🧹 Admin clearing all content links from database...')

    // First, let's see what we have
    const beforeCount = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
      FROM campaign_influencers
    `)

    console.log('📊 Before cleanup:')
    console.log(`   Total campaign_influencer records: ${beforeCount[0].total_records}`)
    console.log(`   Records with content links: ${beforeCount[0].records_with_content_links}`)

    if (beforeCount[0].records_with_content_links === 0) {
      return NextResponse.json({
        success: true,
        message: 'No content links found to clear',
        stats: {
          before: beforeCount[0],
          after: beforeCount[0],
          cleared: 0
        }
      })
    }

    // Show what we're about to clear
    const contentLinksToClear = await query(`
      SELECT 
        ci.id,
        ci.influencer_id,
        ci.content_links,
        ci.discount_code,
        c.name as campaign_name,
        i.display_name as influencer_name
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.content_links IS NOT NULL 
        AND ci.content_links != '[]'::jsonb
        AND ci.content_links != 'null'::jsonb
    `)

    console.log('🗑️ Content links to be cleared:')
    const clearedRecords = contentLinksToClear.map(ci => ({
      id: ci.id,
      influencer_name: ci.influencer_name,
      campaign_name: ci.campaign_name,
      content_links: ci.content_links,
      discount_code: ci.discount_code
    }))

    // Clear content links from campaign_influencers table
    const updateResult1 = await query(`
      UPDATE campaign_influencers 
      SET 
        content_links = '[]'::jsonb,
        discount_code = NULL,
        updated_at = NOW()
      WHERE content_links IS NOT NULL 
        AND content_links != '[]'::jsonb
        AND content_links != 'null'::jsonb
    `)

    // Clear content URLs from campaign_content_submissions table
    const updateResult2 = await query(`
      UPDATE campaign_content_submissions 
      SET 
        content_url = '',
        updated_at = NOW()
      WHERE content_url IS NOT NULL 
        AND content_url != ''
    `)

    // Clear post URLs from influencer_content table
    const updateResult3 = await query(`
      UPDATE influencer_content 
      SET 
        post_url = '',
        updated_at = NOW()
      WHERE post_url IS NOT NULL 
        AND post_url != ''
    `)

    console.log(`✅ Successfully cleared content links from all tables`)
    console.log(`   - campaign_influencers: ${updateResult1.length || 0} records`)
    console.log(`   - campaign_content_submissions: ${updateResult2.length || 0} records`) 
    console.log(`   - influencer_content: ${updateResult3.length || 0} records`)

    // Verify cleanup from all tables
    const afterCounts = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
        FROM campaign_influencers
      `),
      query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN content_url IS NOT NULL AND content_url != '' THEN 1 END) as records_with_content_urls
        FROM campaign_content_submissions
      `),
      query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN post_url IS NOT NULL AND post_url != '' THEN 1 END) as records_with_post_urls
        FROM influencer_content
      `)
    ])

    const afterCount = afterCounts[0][0] // campaign_influencers count for backward compatibility

    console.log('📊 After cleanup:')
    console.log(`   campaign_influencers: ${afterCounts[0][0].total_records} total, ${afterCounts[0][0].records_with_content_links} with content links`)
    console.log(`   campaign_content_submissions: ${afterCounts[1][0].total_records} total, ${afterCounts[1][0].records_with_content_urls} with content URLs`)
    console.log(`   influencer_content: ${afterCounts[2][0].total_records} total, ${afterCounts[2][0].records_with_post_urls} with post URLs`)

    // Also reset any influencer analytics that might be affected
    console.log('🔄 Resetting influencer analytics...')

    const resetResult = await query(`
      UPDATE influencers 
      SET 
        total_engagements = 0,
        total_engagement_rate = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        analytics_updated_at = NOW()
      WHERE id IN (
        SELECT DISTINCT influencer_id 
        FROM campaign_influencers 
        WHERE updated_at >= NOW() - INTERVAL '1 minute'
      )
    `)

    console.log('✅ Reset analytics for affected influencers')

    console.log('🎉 Content links cleanup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Content links cleared from all tables successfully',
      stats: {
        campaign_influencers: {
          before: beforeCount[0],
          after: afterCounts[0][0],
          cleared: beforeCount[0].records_with_content_links
        },
        campaign_content_submissions: {
          after: afterCounts[1][0],
          cleared: updateResult2.length || 0
        },
        influencer_content: {
          after: afterCounts[2][0],
          cleared: updateResult3.length || 0
        }
      },
      clearedRecords: clearedRecords,
      actions: [
        'All content links cleared from campaign_influencers',
        'All content URLs cleared from campaign_content_submissions',
        'All post URLs cleared from influencer_content',
        'All discount codes cleared',
        'Influencer analytics reset to 0'
      ]
    })

  } catch (error) {
    console.error('❌ Error clearing content links:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear content links',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check current content links status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin/staff role
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Admin/Staff access required' }, { status: 403 })
    }

    // Get current status
    const stats = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
      FROM campaign_influencers
    `)

    const contentLinks = await query(`
      SELECT 
        ci.id,
        ci.influencer_id,
        ci.content_links,
        ci.discount_code,
        c.name as campaign_name,
        i.display_name as influencer_name
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.content_links IS NOT NULL 
        AND ci.content_links != '[]'::jsonb
        AND ci.content_links != 'null'::jsonb
      ORDER BY ci.updated_at DESC
    `)

    return NextResponse.json({
      success: true,
      stats: stats[0],
      contentLinks: contentLinks.map(ci => ({
        id: ci.id,
        influencer_name: ci.influencer_name,
        campaign_name: ci.campaign_name,
        content_links: ci.content_links,
        discount_code: ci.discount_code
      }))
    })

  } catch (error) {
    console.error('❌ Error checking content links:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check content links status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
