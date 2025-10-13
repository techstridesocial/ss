import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { notifyCampaignAssigned } from '@/lib/services/notifications'

// PATCH - Assign staff member to campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const campaignId = params.id
    const body = await request.json()
    const { assigned_staff_id } = body

    // Validate assigned_staff_id if provided
    if (assigned_staff_id) {
      const staffResult = await query(`
        SELECT id, email FROM users 
        WHERE id = $1 AND role IN ('STAFF', 'ADMIN') AND status = 'ACTIVE'
      `, [assigned_staff_id])
      
      if (staffResult.length === 0) {
        return NextResponse.json({ 
          error: 'Invalid staff member. Must be an active staff or admin user.' 
        }, { status: 400 })
      }
    }

    // Check if campaign exists
    const campaignResult = await query(`
      SELECT id, name FROM campaigns WHERE id = $1
    `, [campaignId])

    if (campaignResult.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const campaign = campaignResult[0]

    // Update campaign assignment
    const updateResult = await query(`
      UPDATE campaigns 
      SET assigned_staff_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, assigned_staff_id
    `, [assigned_staff_id || null, campaignId])

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Failed to update campaign assignment' }, { status: 500 })
    }

    // Get assigned staff details if assigned
    let assignedStaff = null
    if (assigned_staff_id) {
      const staffDetails = await query(`
        SELECT 
          u.id, u.email, 
          up.first_name, up.last_name
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `, [assigned_staff_id])

      if (staffDetails.length > 0) {
        const staff = staffDetails[0]
        assignedStaff = {
          id: staff.id,
          email: staff.email,
          firstName: staff.first_name || '',
          lastName: staff.last_name || '',
          fullName: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.email
        }

        // Send notification to assigned staff
        try {
          await notifyCampaignAssigned(
            assigned_staff_id,
            campaign.name,
            campaignId
          )
          console.log(`📬 Campaign assignment notification sent to ${assignedStaff.fullName}`)
        } catch (error) {
          console.error('Failed to send campaign assignment notification:', error)
          // Don't fail the request if notification fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: assigned_staff_id 
        ? `Campaign assigned to ${assignedStaff?.fullName || 'staff member'}` 
        : 'Campaign assignment removed',
      data: {
        campaignId: updateResult[0].id,
        campaignName: updateResult[0].name,
        assignedStaff
      }
    })

  } catch (error) {
    console.error('Error updating campaign assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
