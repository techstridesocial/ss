import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, transaction } from '@/lib/db/connection'
import {
  getOnboardingProgress,
  markOnboardingComplete,
  savePaymentHistory,
  saveBrandCollaboration
} from '@/lib/db/queries/talent-onboarding'

// POST - Mark onboarding as complete
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
    }

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id

    // Check if all steps are completed
    const progress = await getOnboardingProgress(user_id)
    
    if (!progress.isComplete) {
      return NextResponse.json(
        { success: false, error: 'All onboarding steps must be completed first' },
        { status: 400 }
      )
    }

    // Extract and save payment history and collaborations to dedicated tables
    const paymentStep = progress.steps.find(s => s.stepKey === 'payment_information')
    if (paymentStep?.data && (paymentStep.data.previous_payment_amount || paymentStep.data.payment_method)) {
      try {
        await savePaymentHistory(user_id, {
          previousPaymentAmount: paymentStep.data.previous_payment_amount ? parseFloat(paymentStep.data.previous_payment_amount) : undefined,
          currency: paymentStep.data.currency || 'GBP',
          paymentMethod: paymentStep.data.payment_method,
          notes: paymentStep.data.payment_notes
        })
      } catch (error) {
        console.error('Error saving payment history:', error)
        // Don't fail onboarding if this fails
      }
    }

    // Save collaborations
    const collaborationsStep = progress.steps.find(s => s.stepKey === 'previous_collaborations')
    if (collaborationsStep?.data?.collaborations && Array.isArray(collaborationsStep.data.collaborations)) {
      for (const collab of collaborationsStep.data.collaborations) {
        try {
          await saveBrandCollaboration(user_id, {
            brandName: collab.brand_name,
            collaborationType: collab.collaboration_type,
            dateRange: collab.date_range,
            notes: collab.notes
          })
        } catch (error) {
          console.error('Error saving collaboration:', error)
          // Don't fail onboarding if this fails
        }
      }
    }

    // Update user profile fields from onboarding steps
    const emailSetupStep = progress.steps.find(s => s.stepKey === 'brand_inbound_setup')
    const instagramBioStep = progress.steps.find(s => s.stepKey === 'instagram_bio_setup')
    const ukEventsStep = progress.steps.find(s => s.stepKey === 'uk_events_chat')

    if (emailSetupStep?.data || instagramBioStep?.data || ukEventsStep?.data) {
      await transaction(async (client) => {
        if (emailSetupStep?.data) {
          await client.query(`
            UPDATE user_profiles 
            SET 
              email_forwarding_setup = $1,
              manager_email = $2,
              updated_at = NOW()
            WHERE user_id = $3
          `, [
            emailSetupStep.data.email_setup_type === 'email_forwarding',
            emailSetupStep.data.manager_email || null,
            user_id
          ])
        }

        if (instagramBioStep?.data) {
          await client.query(`
            UPDATE user_profiles 
            SET 
              instagram_bio_setup = $1,
              updated_at = NOW()
            WHERE user_id = $2
          `, [
            instagramBioStep.data.instagram_bio_setup === 'done',
            user_id
          ])
        }

        if (ukEventsStep?.data) {
          await client.query(`
            UPDATE user_profiles 
            SET 
              uk_events_chat_joined = $1,
              updated_at = NOW()
            WHERE user_id = $2
          `, [
            ukEventsStep.data.uk_events_chat_joined === true,
            user_id
          ])
        }
      })
    }

    // Mark onboarding as complete
    await markOnboardingComplete(user_id)

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

