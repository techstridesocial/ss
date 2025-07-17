import { query } from '../db/connection'
import { currentUser } from '@clerk/nextjs/server'

/**
 * Check if a brand user has completed onboarding
 */
export async function isBrandOnboarded(userId: string): Promise<boolean> {
  try {
    // Get user profile from database
    const result = await query<{ is_onboarded: boolean }>(
      'SELECT up.is_onboarded FROM user_profiles up JOIN users u ON up.user_id = u.id WHERE u.clerk_id = $1',
      [userId]
    )

    if (result.length === 0 || !result[0]) {
      return false // No profile found = not onboarded
    }

    return result[0].is_onboarded || false
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * Check if current user is a brand and needs onboarding
 */
export async function shouldRedirectToOnboarding(): Promise<boolean> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return false
    }

    // Only check for brand users
    const role = user.publicMetadata?.role as string
    if (role !== 'BRAND') {
      return false
    }

    // Check if they've completed onboarding
    const isOnboarded = await isBrandOnboarded(user.id)
    return !isOnboarded
  } catch (error) {
    console.error('Error checking onboarding redirect:', error)
    return false
  }
}

/**
 * Check if a brand user exists in the database
 */
export async function brandUserExists(userId: string): Promise<boolean> {
  try {
    const result = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1 AND role = $2',
      [userId, 'BRAND']
    )

    return result.length > 0
  } catch (error) {
    console.error('Error checking brand user existence:', error)
    return false
  }
} 