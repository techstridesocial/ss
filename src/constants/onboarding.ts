/**
 * Constants for brand onboarding flow
 */

// Redirect delay after successful onboarding (in milliseconds)
export const ONBOARDING_SUCCESS_REDIRECT_DELAY = 3000

// File upload limits
export const MAX_LOGO_FILE_SIZE_MB = 5
export const MAX_LOGO_FILE_SIZE_BYTES = MAX_LOGO_FILE_SIZE_MB * 1024 * 1024

// Allowed image file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
] as const

// Step IDs as constants for type safety
export const STEP_IDS = {
  COMPANY_NAME: 'company_name',
  WEBSITE: 'website',
  INDUSTRY: 'industry',
  COMPANY_SIZE: 'company_size',
  DESCRIPTION: 'description',
  LOGO_URL: 'logo_url',
  ANNUAL_BUDGET: 'annual_budget',
  PREFERRED_NICHES: 'preferred_niches',
  TARGET_REGIONS: 'target_regions',
  PRIMARY_REGION: 'primary_region',
  CAMPAIGN_OBJECTIVE: 'campaign_objective',
  PRODUCT_SERVICE_TYPE: 'product_service_type',
  PREFERRED_CONTACT_METHOD: 'preferred_contact_method',
  PROACTIVE_SUGGESTIONS: 'proactive_suggestions',
  INVITE_TEAM_MEMBERS: 'invite_team_members',
  TEAM_INVITATIONS: 'team_invitations',
  BRAND_CONTACT_NAME: 'brand_contact_name',
  BRAND_CONTACT_ROLE: 'brand_contact_role',
  BRAND_CONTACT_EMAIL: 'brand_contact_email',
  BRAND_CONTACT_PHONE: 'brand_contact_phone',
  STRIDE_CONTACT_NAME: 'stride_contact_name',
  REVIEW: 'review'
} as const

export type StepId = typeof STEP_IDS[keyof typeof STEP_IDS]
