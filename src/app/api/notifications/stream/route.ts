import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// Store last notification timestamp for each user
const userLastCheck = new Map<string, Date>()

/**
 * GET /api/notifications/stream
 * Server-Sent Events endpoint for real-time notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if user has a valid role (all authenticated users can receive notifications)
    const userRole = await getCurrentUserRole()
    if (!userRole) {
      return new Response(JSON.stringify({ error: 'User role not found' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get user's database ID
    const userResult = await query(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [clerkId])

    if (userResult.length === 0 || !userResult[0]) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const dbUserId = userResult[0].id as string

    // Create a TransformStream for SSE
    const encoder = new TextEncoder()
    let isConnectionActive = true
    
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        const initialMessage = JSON.stringify({
          type: 'connected',
          message: 'SSE connection established',
          timestamp: new Date().toISOString()
        })
        controller.enqueue(encoder.encode(`data: ${initialMessage}\n\n`))

        // Initialize last check time
        if (!userLastCheck.has(dbUserId)) {
          userLastCheck.set(dbUserId, new Date())
        }

        // Polling function to check for new notifications
        const checkForNotifications = async () => {
          if (!isConnectionActive) return

          try {
            const lastCheck = userLastCheck.get(dbUserId) || new Date(Date.now() - 60000)
            
            // Query for new notifications since last check
            const notifications = await query(`
              SELECT 
                n.id,
                n.type,
                n.title,
                n.message,
                n.is_read,
                n.created_at,
                n.related_type,
                n.related_id,
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
                AND n.created_at > $2
              ORDER BY n.created_at DESC
              LIMIT 10
            `, [dbUserId, lastCheck.toISOString()])

            // Get current unread count
            const unreadResult = await query(`
              SELECT COUNT(*) as count FROM notifications 
              WHERE recipient_id = $1 AND is_read = FALSE
            `, [dbUserId])
            const unreadCount = parseInt(unreadResult[0]?.count || '0')

            // Send update if there are new notifications
            if (notifications.length > 0 || true) { // Always send heartbeat with count
              const message = JSON.stringify({
                type: notifications.length > 0 ? 'notification' : 'heartbeat',
                notifications: notifications,
                unreadCount: unreadCount,
                timestamp: new Date().toISOString()
              })
              
              try {
                controller.enqueue(encoder.encode(`data: ${message}\n\n`))
              } catch {
                // Controller closed, stop polling
                isConnectionActive = false
                return
              }
            }

            // Update last check time
            userLastCheck.set(dbUserId, new Date())

          } catch (error) {
            console.error('Error checking for notifications:', error)
            // Don't break the connection on query errors
          }

          // Schedule next check if still active
          if (isConnectionActive) {
            setTimeout(checkForNotifications, 5000) // Check every 5 seconds
          }
        }

        // Start polling
        await checkForNotifications()
      },
      cancel() {
        isConnectionActive = false
        console.log(`SSE connection closed for user ${dbUserId}`)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      }
    })

  } catch (error) {
    console.error('Error in SSE endpoint:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic'
