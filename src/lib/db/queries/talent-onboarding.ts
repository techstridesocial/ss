import { query, transaction } from '../connection'

// Helper function to safely parse JSON fields
function safeJsonParse(value: any, defaultValue: any = null) {
  if (!value) return defaultValue
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

export interface OnboardingStep {
  id: string
  userId: string
  stepKey: string
  completed: boolean
  data: any
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface BrandPreference {
  id: string
  userId: string
  brandId: string
  createdAt: Date
}

export interface PaymentHistory {
  id: string
  userId: string
  previousPaymentAmount: number | null
  currency: string
  paymentMethod: string | null
  notes: string | null
  createdAt: Date
}

export interface BrandCollaboration {
  id: string
  userId: string
  brandName: string
  collaborationType: string | null
  dateRange: string | null
  notes: string | null
  createdAt: Date
}

export interface OnboardingProgress {
  userId: string
  steps: OnboardingStep[]
  completedSteps: number
  totalSteps: number
  isComplete: boolean
  brandPreferences: BrandPreference[]
  paymentHistory: PaymentHistory[]
  collaborations: BrandCollaboration[]
}

/**
 * Get onboarding progress for a user
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  try {
    // Get all steps for user
    const stepsResult = await query<OnboardingStep>(`
      SELECT * FROM talent_onboarding_steps 
      WHERE user_id = $1 
      ORDER BY created_at ASC
    `, [userId])

    const steps = stepsResult.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      stepKey: row.step_key,
      completed: row.completed,
      data: safeJsonParse(row.data, {}),
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    // Get brand preferences
    const brandPrefsResult = await query<BrandPreference>(`
      SELECT * FROM talent_brand_preferences 
      WHERE user_id = $1
    `, [userId])

    const brandPreferences = brandPrefsResult.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      brandId: row.brand_id,
      createdAt: row.created_at
    }))

    // Get payment history
    const paymentResult = await query<PaymentHistory>(`
      SELECT * FROM talent_payment_history 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId])

    const paymentHistory = paymentResult.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      previousPaymentAmount: row.previous_payment_amount,
      currency: row.currency,
      paymentMethod: row.payment_method,
      notes: row.notes,
      createdAt: row.created_at
    }))

    // Get collaborations
    const collabResult = await query<BrandCollaboration>(`
      SELECT * FROM talent_brand_collaborations 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId])

    const collaborations = collabResult.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      brandName: row.brand_name,
      collaborationType: row.collaboration_type,
      dateRange: row.date_range,
      notes: row.notes,
      createdAt: row.created_at
    }))

    const completedSteps = steps.filter(s => s.completed).length
    const totalSteps = 10 // Total number of onboarding steps
    const isComplete = completedSteps === totalSteps

    return {
      userId,
      steps,
      completedSteps,
      totalSteps,
      isComplete,
      brandPreferences,
      paymentHistory,
      collaborations
    }
  } catch (error) {
    console.error('Error getting onboarding progress:', error)
    throw error
  }
}

/**
 * Complete an onboarding step
 */
export async function completeOnboardingStep(
  userId: string,
  stepKey: string,
  data: any
): Promise<OnboardingStep> {
  try {
    const result = await query(`
      INSERT INTO talent_onboarding_steps (user_id, step_key, completed, data, completed_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, step_key)
      DO UPDATE SET
        completed = $3,
        data = $4,
        completed_at = CASE WHEN $3 = true THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      RETURNING *
    `, [userId, stepKey, true, JSON.stringify(data)])

    const row = result[0] as any
    return {
      id: row.id,
      userId: row.user_id,
      stepKey: row.step_key,
      completed: row.completed,
      data: safeJsonParse(row.data, {}),
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error completing onboarding step:', error)
    throw error
  }
}

/**
 * Get selected brands for a user
 */
export async function getSelectedBrands(userId: string): Promise<BrandPreference[]> {
  try {
    const result = await query(`
      SELECT tbp.*, b.company_name, b.id as brand_id
      FROM talent_brand_preferences tbp
      JOIN brands b ON tbp.brand_id = b.id
      WHERE tbp.user_id = $1
      ORDER BY tbp.created_at DESC
    `, [userId])

    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      brandId: row.brand_id,
      createdAt: row.created_at
    }))
  } catch (error) {
    console.error('Error getting selected brands:', error)
    throw error
  }
}

/**
 * Save brand preferences (replace existing)
 */
export async function saveBrandPreferences(
  userId: string,
  brandIds: string[]
): Promise<BrandPreference[]> {
  try {
    return await transaction(async (client) => {
      // Delete existing preferences
      await client.query(`
        DELETE FROM talent_brand_preferences WHERE user_id = $1
      `, [userId])

      // Insert new preferences
      if (brandIds.length > 0) {
        const values = brandIds.map((_, index) => `($1, $${index + 2})`).join(', ')
        const params = [userId, ...brandIds]
        
        await client.query(`
          INSERT INTO talent_brand_preferences (user_id, brand_id)
          VALUES ${values}
        `, params)
      }

      // Return updated preferences
      const result = await client.query(`
        SELECT * FROM talent_brand_preferences WHERE user_id = $1
      `, [userId])

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        brandId: row.brand_id,
        createdAt: row.created_at
      }))
    })
  } catch (error) {
    console.error('Error saving brand preferences:', error)
    throw error
  }
}

/**
 * Save payment history
 */
export async function savePaymentHistory(
  userId: string,
  data: {
    previousPaymentAmount?: number
    currency?: string
    paymentMethod?: string
    notes?: string
  }
): Promise<PaymentHistory> {
  try {
    const result = await query(`
      INSERT INTO talent_payment_history (
        user_id, previous_payment_amount, currency, payment_method, notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      userId,
      data.previousPaymentAmount || null,
      data.currency || 'GBP',
      data.paymentMethod || null,
      data.notes || null
    ])

    const row = result[0] as any
    return {
      id: row.id,
      userId: row.user_id,
      previousPaymentAmount: row.previous_payment_amount,
      currency: row.currency,
      paymentMethod: row.payment_method,
      notes: row.notes,
      createdAt: row.created_at
    }
  } catch (error) {
    console.error('Error saving payment history:', error)
    throw error
  }
}

/**
 * Save brand collaboration
 */
export async function saveBrandCollaboration(
  userId: string,
  collaboration: {
    brandName: string
    collaborationType?: string
    dateRange?: string
    notes?: string
  }
): Promise<BrandCollaboration> {
  try {
    const result = await query(`
      INSERT INTO talent_brand_collaborations (
        user_id, brand_name, collaboration_type, date_range, notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      userId,
      collaboration.brandName,
      collaboration.collaborationType || null,
      collaboration.dateRange || null,
      collaboration.notes || null
    ])

    const row = result[0] as any
    return {
      id: row.id,
      userId: row.user_id,
      brandName: row.brand_name,
      collaborationType: row.collaboration_type,
      dateRange: row.date_range,
      notes: row.notes,
      createdAt: row.created_at
    }
  } catch (error) {
    console.error('Error saving brand collaboration:', error)
    throw error
  }
}

/**
 * Mark onboarding as complete
 */
export async function markOnboardingComplete(userId: string): Promise<boolean> {
  try {
    return await transaction(async (client) => {
      // Update user profile
      await client.query(`
        UPDATE user_profiles 
        SET is_onboarded = true, updated_at = NOW()
        WHERE user_id = $1
      `, [userId])

      // Update user status
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [userId])

      return true
    })
  } catch (error) {
    console.error('Error marking onboarding complete:', error)
    throw error
  }
}

