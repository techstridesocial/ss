import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
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

    // Get user_id from users table, create if doesn't exist
    let userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    let user_id: string

    if (userResult.length === 0 || !userResult[0]) {
      // User doesn't exist, create one automatically
      console.log('User not found, creating new user record for clerk_id:', userId)
      
      try {
        // Get user details from Clerk
        const clientClerk = await clerkClient()
        const clerkUser = await clientClerk.users.getUser(userId)
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`
        const userRole = clerkUser.publicMetadata?.role as string || 'INFLUENCER_SIGNED'
        
        console.log('Creating user with email:', userEmail, 'role:', userRole)
        
        const newUserResult = await query<{ id: string }>(
          `INSERT INTO users (clerk_id, email, status, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [userId, userEmail, 'ACTIVE', userRole]
        )
        
        if (newUserResult.length === 0 || !newUserResult[0]) {
          throw new Error('INSERT returned no results')
        }
        
        user_id = newUserResult[0].id
        console.log('✅ Created new user with ID:', user_id)
        
      } catch (createUserError: any) {
        console.error('Error creating user:', createUserError)
        return NextResponse.json(
          { error: 'Database error: ' + (createUserError?.message || 'Could not create user record') }, 
          { status: 500 }
        )
      }
    } else {
      user_id = userResult[0].id
      console.log('👤 Using existing user ID:', user_id)
    }

    // Check if all steps are completed
    const progress = await getOnboardingProgress(user_id)
    
    console.log('Onboarding progress check:', {
      completedSteps: progress.completedSteps,
      totalSteps: progress.totalSteps,
      isComplete: progress.isComplete,
      steps: progress.steps.map(s => ({ stepKey: s.stepKey, completed: s.completed }))
    })
    
    if (!progress.isComplete) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All onboarding steps must be completed first',
          details: {
            completedSteps: progress.completedSteps,
            totalSteps: progress.totalSteps,
            missingSteps: progress.steps.filter(s => !s.completed).map(s => s.stepKey)
          }
        },
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

    // Ensure user profile and influencer record exist (create if missing)
    // This handles the case where signed talent is redirected directly without doing regular onboarding
    await transaction(async (client) => {
      // Get Clerk user data for profile creation
      const clientClerk = await clerkClient()
      const clerkUser = await clientClerk.users.getUser(userId)
      const firstName = clerkUser.firstName || ''
      const lastName = clerkUser.lastName || ''
      const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Signed Talent'

      // Check if user profile exists
      const profileCheck = await client.query(
        'SELECT id FROM user_profiles WHERE user_id = $1',
        [user_id]
      )

      if (profileCheck.rows.length === 0) {
        // Create basic user profile from Clerk data
        await client.query(`
          INSERT INTO user_profiles (
            user_id, first_name, last_name, is_onboarded
          ) VALUES ($1, $2, $3, $4)
        `, [
          user_id,
          firstName || null,
          lastName || null,
          true
        ])
      }

      // Check if influencer record exists
      const influencerCheck = await client.query(
        'SELECT id FROM influencers WHERE user_id = $1',
        [user_id]
      )

      if (influencerCheck.rows.length === 0) {
        // Create basic influencer record
        await client.query(`
          INSERT INTO influencers (
            user_id, display_name, onboarding_completed, ready_for_campaigns, influencer_type
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          user_id,
          displayName,
          true,
          false, // Not ready until staff approval
          'SIGNED'
        ])
      } else {
        // Update existing influencer to ensure type is SIGNED and onboarding is complete
        await client.query(`
          UPDATE influencers 
          SET influencer_type = 'SIGNED', 
              onboarding_completed = true, 
              display_name = COALESCE(display_name, $2),
              updated_at = NOW()
          WHERE user_id = $1
        `, [user_id, displayName])
      }
    })

    // Mark onboarding as complete
    await markOnboardingComplete(user_id)

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (error: any) {
    console.error('Error completing onboarding:', error)
    const errorMessage = error?.message || 'Failed to complete onboarding'
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

