import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { transaction as _transaction } from '@/lib/db/connection'
import { logAuditEvent } from '@/lib/db/queries/audit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { confirmation, reason } = body

    if (!confirmation || confirmation !== 'I confirm that I want to delete all my data') {
      return NextResponse.json(
        { error: 'Confirmation required. Please type the exact confirmation message.' },
        { status: 400 }
      )
    }

    // Get user data first for audit logging
    const userData = await transaction(async (client) => {
      const result = await client.query(`
        SELECT u.*, up.*
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.clerk_id = $1
      `, [userId])

      return result.rows[0]
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the deletion request before actually deleting
    await logAuditEvent({
      user_id: userData.id,
      action: 'GDPR_DELETION_REQUESTED',
      table_name: 'users',
      record_id: userData.id,
      metadata: {
        reason: reason || 'No reason provided',
        confirmation_provided: true,
        deletion_date: new Date().toISOString()
      }
    })

    // Perform the deletion in a transaction
    await transaction(async (client) => {
      // Delete in order to respect foreign key constraints
      
      // 1. Delete campaign content submissions
      await client.query(`
        DELETE FROM campaign_content_submissions 
        WHERE campaign_id IN (
          SELECT c.id FROM campaigns c
          JOIN campaign_influencers ci ON c.id = ci.campaign_id
          JOIN influencers i ON ci.influencer_id = i.id
          WHERE i.user_id = $1
        )
      `, [userData.id])

      // 2. Delete campaign influencers
      await client.query(`
        DELETE FROM campaign_influencers 
        WHERE influencer_id IN (
          SELECT id FROM influencers WHERE user_id = $1
        )
      `, [userData.id])

      // 3. Delete shortlist influencers
      await client.query(`
        DELETE FROM shortlist_influencers 
        WHERE shortlist_id IN (
          SELECT id FROM shortlists WHERE brand_id IN (
            SELECT id FROM brands WHERE user_id = $1
          )
        )
      `, [userData.id])

      // 4. Delete shortlists
      await client.query(`
        DELETE FROM shortlists WHERE brand_id IN (
          SELECT id FROM brands WHERE user_id = $1
        )
      `, [userData.id])

      // 5. Delete brand contacts
      await client.query(`
        DELETE FROM brand_contacts WHERE brand_id IN (
          SELECT id FROM brands WHERE user_id = $1
        )
      `, [userData.id])

      // 6. Delete brands
      await client.query(`
        DELETE FROM brands WHERE user_id = $1
      `, [userData.id])

      // 7. Delete influencer platforms
      await client.query(`
        DELETE FROM influencer_platforms WHERE influencer_id IN (
          SELECT id FROM influencers WHERE user_id = $1
        )
      `, [userData.id])

      // 8. Delete influencers
      await client.query(`
        DELETE FROM influencers WHERE user_id = $1
      `, [userData.id])

      // 9. Delete user profiles
      await client.query(`
        DELETE FROM user_profiles WHERE user_id = $1
      `, [userData.id])

      // 10. Delete audit logs (keep for compliance but anonymize)
      await client.query(`
        UPDATE audit_logs 
        SET user_id = NULL, 
            old_values = NULL, 
            new_values = NULL,
            metadata = jsonb_set(metadata, '{anonymized}', 'true')
        WHERE user_id = $1
      `, [userData.id])

      // 11. Finally, delete the user
      await client.query(`
        DELETE FROM users WHERE id = $1
      `, [userData.id])
    })

    // Log successful deletion
    await logAuditEvent({
      user_id: userData.id,
      action: 'GDPR_DELETION_COMPLETED',
      table_name: 'users',
      record_id: userData.id,
      metadata: {
        reason: reason || 'No reason provided',
        deletion_date: new Date().toISOString(),
        data_types_deleted: [
          'user_profile',
          'brand_data',
          'influencer_data',
          'campaign_participation',
          'shortlists',
          'audit_logs_anonymized'
        ]
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Your data has been successfully deleted. Your account and all associated data have been permanently removed.',
      deletion_date: new Date().toISOString()
    })

  } catch (error) {
    console.error('GDPR deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    )
  }
} 