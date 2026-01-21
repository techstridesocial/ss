/**
 * Type definitions for onboarding system
 */

export interface SignedOnboardingData {
  // Step 1: Welcome Video
  welcome_video_watched: boolean
  
  // Step 2: Social Media Goals
  social_goals: string
  
  // Step 3: Social Media Handles (Optional)
  instagram_handle: string
  tiktok_handle: string
  youtube_handle: string
  
  // Step 4: Brand Selection
  preferred_brands: string
  
  // Step 5: Previous Collaborations
  collaborations: Array<{
    brand_name: string
    collaboration_type: string
    date_range: string
    notes: string
  }>
  
  // Step 6: Payment Information
  previous_payment_amount: string
  currency: string
  payment_method: string
  payment_notes: string
  
  // Step 7: Brand Inbound Setup
  email_setup_type: 'email_forwarding' | 'manager_email' | ''
  manager_email: string
  
  // Step 8: Email Forwarding Video
  email_forwarding_video_watched: boolean
  
  // Step 9: Instagram Bio Setup
  instagram_bio_setup: 'done' | 'will_do' | ''
  
  // Step 10: UK Events Chat
  uk_events_chat_joined: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  type: string
}
