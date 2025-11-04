import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { getUserFromClerkId as _getUserFromClerkId } from '@/lib/db/queries/users'

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user's database ID
    const userResult = await query(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dbUserId = userResult[0].id
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // Build query based on filters
    let notificationQuery = `
      SELECT 
        n.*,
        CASE 
          WHEN n.related_type = 'quotation' THEN (
            SELECT json_build_object(
              'brand_name', q.brand_name,
              'campaign_name', q.campaign_name
            ) FROM quotations q WHERE q.id = n.related_id::uuid
          )
          ELSE NULL
        END as related_data
      FROM notifications n
      WHERE n.recipient_id = $1
    `
    
    const queryParams = [dbUserId]
    
    if (unreadOnly) {
      notificationQuery += ` AND n.is_read = FALSE`
    }
    
    notificationQuery += ` ORDER BY n.created_at DESC LIMIT 50`

    const notifications = await query(notificationQuery, queryParams)

    // Get unread count
    const unreadCountResult = await query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE recipient_id = $1 AND is_read = FALSE
    `, [dbUserId])

    const unreadCount = parseInt(unreadCountResult[0]?.count || '0')

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user's database ID
    const userResult = await query(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dbUserId = userResult[0].id
    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await query(`
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW() 
        WHERE recipient_id = $1 AND is_read = FALSE
      `, [dbUserId])
      
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const placeholders = notificationIds.map((_, index) => `$${index + 2}`).join(',')
      await query(`
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW() 
        WHERE recipient_id = $1 AND id = ANY(ARRAY[${placeholders}]::uuid[])
      `, [dbUserId, ...notificationIds])
      
      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) marked as read`
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide notificationIds array or markAllAsRead: true' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
