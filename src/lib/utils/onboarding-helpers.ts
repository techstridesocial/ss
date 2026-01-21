/**
 * Shared utilities for onboarding data collection
 * Eliminates code duplication across frontend and backend
 */

import { SignedOnboardingData } from '@/types/onboarding'

export const REQUIRED_STEPS = [
  'welcome_video',
  'personal_info',
  'social_goals',
  'brand_selection',
  'brand_inbound_setup',
  'email_forwarding_video',
  'instagram_bio_setup',
  'uk_events_chat',
  'expectations'
] as const

export const OPTIONAL_STEPS = [
  'social_handles',
  'previous_collaborations',
  'payment_information'
] as const

export const ALL_STEPS = [
  REQUIRED_STEPS[0], // welcome_video
  REQUIRED_STEPS[1], // personal_info
  REQUIRED_STEPS[2], // social_goals
  OPTIONAL_STEPS[0], // social_handles
  REQUIRED_STEPS[3], // brand_selection
  OPTIONAL_STEPS[1], // previous_collaborations
  OPTIONAL_STEPS[2], // payment_information
  ...REQUIRED_STEPS.slice(4) // brand_inbound_setup through expectations
] as const

/**
 * Extract step data from form data
 * Single source of truth for data collection
 */
export function extractStepData(stepKey: string, formData: Partial<SignedOnboardingData>): any {
  switch (stepKey) {
    case 'welcome_video':
      return { welcome_video_watched: formData.welcome_video_watched }
    
    case 'personal_info':
      return {
        first_name: formData.first_name,
        last_name: formData.last_name
      }
    
    case 'social_goals':
      return { social_goals: formData.social_goals }
    
    case 'social_handles':
      return {
        instagram_handle: formData.instagram_handle,
        tiktok_handle: formData.tiktok_handle,
        youtube_handle: formData.youtube_handle
      }
    
    case 'brand_selection':
      return { preferred_brands: formData.preferred_brands }
    
    case 'previous_collaborations':
      return { collaborations: formData.collaborations || [] }
    
    case 'payment_information':
      return {
        previous_payment_amount: formData.previous_payment_amount,
        currency: formData.currency,
        payment_method: formData.payment_method,
        payment_notes: formData.payment_notes
      }
    
    case 'brand_inbound_setup':
      return {
        email_setup_type: formData.email_setup_type,
        manager_email: formData.manager_email
      }
    
    case 'email_forwarding_video':
      return { email_forwarding_video_watched: formData.email_forwarding_video_watched }
    
    case 'instagram_bio_setup':
      return { instagram_bio_setup: formData.instagram_bio_setup }
    
    case 'uk_events_chat':
      return { uk_events_chat_joined: formData.uk_events_chat_joined }
    
    case 'expectations':
      return { viewed: true }
    
    default:
      return {}
  }
}

/**
 * Check if step can proceed based on validation rules
 */
export function canProceedToNextStep(stepKey: string, formData: Partial<SignedOnboardingData>): boolean {
  switch (stepKey) {
    case 'welcome_video':
      return formData.welcome_video_watched === true
    
    case 'personal_info':
      return (formData.first_name?.trim().length || 0) >= 2 && 
             (formData.last_name?.trim().length || 0) >= 2
    
    case 'social_goals':
      return (formData.social_goals?.trim().length || 0) >= 10
    
    case 'social_handles':
      return true // Optional
    
    case 'brand_selection':
      return (formData.preferred_brands?.trim().length || 0) >= 3
    
    case 'previous_collaborations':
      return true // Optional
    
    case 'payment_information':
      return true // Optional
    
    case 'brand_inbound_setup':
      if (!formData.email_setup_type) return false
      if (formData.email_setup_type === 'manager_email') {
        return (formData.manager_email?.trim().length || 0) > 0
      }
      return true
    
    case 'email_forwarding_video':
      return formData.email_forwarding_video_watched === true || 
             formData.email_setup_type === 'manager_email'
    
    case 'instagram_bio_setup':
      return !!formData.instagram_bio_setup
    
    case 'uk_events_chat':
      return formData.uk_events_chat_joined === true
    
    case 'expectations':
      return true // Read-only
    
    default:
      return false
  }
}

/**
 * LocalStorage key for backup
 */
export const ONBOARDING_BACKUP_KEY = 'stride_onboarding_backup'

/**
 * Save progress to localStorage as backup
 */
export function saveProgressBackup(formData: Partial<SignedOnboardingData>, currentStep: number) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ONBOARDING_BACKUP_KEY, JSON.stringify({
      formData,
      currentStep,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Failed to save backup:', error)
  }
}

/**
 * Load progress from localStorage backup
 */
export function loadProgressBackup(): { formData: Partial<SignedOnboardingData>, currentStep: number } | null {
  if (typeof window === 'undefined') return null
  
  try {
    const backup = localStorage.getItem(ONBOARDING_BACKUP_KEY)
    if (!backup) return null
    
    const parsed = JSON.parse(backup)
    
    // Backup expires after 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - parsed.timestamp > sevenDaysMs) {
      localStorage.removeItem(ONBOARDING_BACKUP_KEY)
      return null
    }
    
    return {
      formData: parsed.formData,
      currentStep: parsed.currentStep
    }
  } catch (error) {
    console.error('Failed to load backup:', error)
    return null
  }
}

/**
 * Clear backup after successful completion
 */
export function clearProgressBackup() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(ONBOARDING_BACKUP_KEY)
  } catch (error) {
    console.error('Failed to clear backup:', error)
  }
}
