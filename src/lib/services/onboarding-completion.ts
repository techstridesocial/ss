/**
 * Onboarding completion service
 * Handles all completion logic in a single atomic transaction
 */

import { query, transaction } from '@/lib/db/connection'
import { clerkClient } from '@clerk/nextjs/server'
import { REQUIRED_STEPS, OPTIONAL_STEPS } from '@/lib/utils/onboarding-helpers'

export async function completeSignedOnboarding(clerkUserId: string, userId: string) {
  // Wrap EVERYTHING in a single transaction for atomicity
  return await transaction(async (client) => {
    // 1. Fetch current progress
    const stepsResult = await client.query(`
      SELECT * FROM talent_onboarding_steps 
      WHERE user_id = $1
    `, [userId])
    
    const steps = stepsResult.rows
    const existingStepKeys = steps.map((s: any) => s.step_key)
    
    // 2. Auto-complete missing required steps
    const missingRequired = REQUIRED_STEPS.filter(step => !existingStepKeys.includes(step))
    for (const stepKey of missingRequired) {
      await client.query(`
        INSERT INTO talent_onboarding_steps (user_id, step_key, completed, data, completed_at)
        VALUES ($1, $2, true, '{}', NOW())
        ON CONFLICT (user_id, step_key) DO NOTHING
      `, [userId, stepKey])
    }
    
    // 3. Auto-complete missing optional steps
    const missingOptional = OPTIONAL_STEPS.filter(step => !existingStepKeys.includes(step))
    for (const stepKey of missingOptional) {
      await client.query(`
        INSERT INTO talent_onboarding_steps (user_id, step_key, completed, data, completed_at)
        VALUES ($1, $2, true, '{"skipped": true}', NOW())
        ON CONFLICT (user_id, step_key) DO NOTHING
      `, [userId, stepKey])
    }
    
    // 4. Mark any incomplete required steps as complete
    await client.query(`
      UPDATE talent_onboarding_steps
      SET completed = true, completed_at = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND step_key = ANY($2) AND completed = false
    `, [userId, REQUIRED_STEPS as any])
    
    // 5. Get final step data
    const finalSteps = await client.query(`
      SELECT step_key, data FROM talent_onboarding_steps WHERE user_id = $1
    `, [userId])
    
    const stepData = finalSteps.rows.reduce((acc: any, row: any) => {
      try {
        acc[row.step_key] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      } catch {
        acc[row.step_key] = row.data
      }
      return acc
    }, {})
    
    // 6. Save payment history (if provided)
    const paymentData = stepData.payment_information
    if (paymentData && (paymentData.previous_payment_amount || paymentData.payment_method)) {
      await client.query(`
        INSERT INTO talent_payment_history (
          user_id, previous_payment_amount, currency, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        userId,
        paymentData.previous_payment_amount ? parseFloat(paymentData.previous_payment_amount) : null,
        paymentData.currency || 'GBP',
        paymentData.payment_method || null,
        paymentData.payment_notes || null
      ])
    }
    
    // 7. Save collaborations (if provided)
    const collabData = stepData.previous_collaborations
    if (collabData?.collaborations && Array.isArray(collabData.collaborations)) {
      for (const collab of collabData.collaborations) {
        await client.query(`
          INSERT INTO talent_brand_collaborations (
            user_id, brand_name, collaboration_type, date_range, notes
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          userId,
          collab.brand_name,
          collab.collaboration_type || null,
          collab.date_range || null,
          collab.notes || null
        ])
      }
    }
    
    // 8. Get Clerk user data and extract name from onboarding
    const clientClerk = await clerkClient()
    const clerkUser = await clientClerk.users.getUser(clerkUserId)
    const personalInfo = stepData.personal_info || {}
    const firstName = personalInfo.first_name || clerkUser.firstName || ''
    const lastName = personalInfo.last_name || clerkUser.lastName || ''
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Signed Talent'
    
    // 9. Ensure user profile exists
    const profileCheck = await client.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )
    
    if (profileCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, is_onboarded,
          email_forwarding_setup, manager_email, instagram_bio_setup, uk_events_chat_joined
        ) VALUES ($1, $2, $3, true, $4, $5, $6, $7)
      `, [
        userId,
        firstName || null,
        lastName || null,
        stepData.brand_inbound_setup?.email_setup_type === 'email_forwarding',
        stepData.brand_inbound_setup?.manager_email || null,
        stepData.instagram_bio_setup?.instagram_bio_setup === 'done',
        stepData.uk_events_chat?.uk_events_chat_joined === true
      ])
    } else {
      await client.query(`
        UPDATE user_profiles 
        SET 
          is_onboarded = true,
          email_forwarding_setup = $2,
          manager_email = $3,
          instagram_bio_setup = $4,
          uk_events_chat_joined = $5,
          updated_at = NOW()
        WHERE user_id = $1
      `, [
        userId,
        stepData.brand_inbound_setup?.email_setup_type === 'email_forwarding',
        stepData.brand_inbound_setup?.manager_email || null,
        stepData.instagram_bio_setup?.instagram_bio_setup === 'done',
        stepData.uk_events_chat?.uk_events_chat_joined === true
      ])
    }
    
    // 10. Ensure influencer record exists
    const influencerCheck = await client.query(
      'SELECT id FROM influencers WHERE user_id = $1',
      [userId]
    )
    
    let influencerId: string
    
    if (influencerCheck.rows.length === 0) {
      const result = await client.query(`
        INSERT INTO influencers (
          user_id, display_name, onboarding_completed, ready_for_campaigns, influencer_type
        ) VALUES ($1, $2, true, false, 'SIGNED')
        RETURNING id
      `, [userId, displayName])
      influencerId = result.rows[0].id
    } else {
      await client.query(`
        UPDATE influencers 
        SET 
          influencer_type = 'SIGNED', 
          onboarding_completed = true, 
          display_name = COALESCE(display_name, $2),
          updated_at = NOW()
        WHERE user_id = $1
      `, [userId, displayName])
      influencerId = influencerCheck.rows[0].id
    }
    
    // 11. Create platform records (if handles provided)
    const socialHandles = stepData.social_handles
    if (socialHandles && influencerId) {
      const platforms = [
        { platform: 'INSTAGRAM', handle: socialHandles.instagram_handle, url: (h: string) => `https://instagram.com/${h}` },
        { platform: 'TIKTOK', handle: socialHandles.tiktok_handle, url: (h: string) => `https://tiktok.com/@${h}` },
        { platform: 'YOUTUBE', handle: socialHandles.youtube_handle, url: (h: string) => `https://youtube.com/@${h}` }
      ]
      
      for (const { platform, handle, url } of platforms) {
        if (handle && handle.trim()) {
          await client.query(`
            INSERT INTO influencer_platforms (
              influencer_id, platform, username, profile_url, is_connected
            ) VALUES ($1, $2, $3, $4, false)
            ON CONFLICT (influencer_id, platform) 
            DO UPDATE SET username = EXCLUDED.username, profile_url = EXCLUDED.profile_url, updated_at = NOW()
          `, [influencerId, platform, handle, url(handle)])
        }
      }
    }
    
    // 12. Mark user as active
    await client.query(`
      UPDATE users 
      SET status = 'ACTIVE', updated_at = NOW()
      WHERE id = $1
    `, [userId])
    
    return { success: true }
  })
}
