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

/**
 * Constants for influencer onboarding flow
 */

// Onboarding video URLs
export const ONBOARDING_VIDEOS = {
  WELCOME_VIDEO: 'https://www.youtube.com/embed/JcD9mmfEx84',
  EMAIL_FORWARDING_VIDEO: 'https://www.youtube.com/embed/oB_PTV5A1jw'
} as const

// UK Events WhatsApp link
export const UK_EVENTS_WHATSAPP_LINK = 'https://chat.whatsapp.com/FGJTrGhovt6CiHBOMZyV6O'

// Expectations content for influencer onboarding
export const EXPECTATIONS_CONTENT = {
  title: 'What to Expect',
  sections: [
    {
      title: 'Campaign Opportunities',
      content: 'You will receive campaign invitations that match your profile and audience.'
    },
    {
      title: 'Communication',
      content: 'We will keep you updated on campaign details and requirements via email and our platform.'
    },
    {
      title: 'Payment',
      content: 'Payment will be processed according to the terms agreed upon for each campaign.'
    }
  ]
} as const
