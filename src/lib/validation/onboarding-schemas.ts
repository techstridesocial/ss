/**
 * Validation schemas for signed influencer onboarding
 * Using Zod for runtime type safety and validation
 */

import { z } from 'zod'

// Step 1: Welcome Video
export const WelcomeVideoSchema = z.object({
  welcome_video_watched: z.boolean()
})

// Step 2: Personal Information
export const PersonalInfoSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
})

// Step 3: Social Goals
export const SocialGoalsSchema = z.object({
  social_goals: z.string()
    .min(10, 'Please write at least 10 characters')
    .max(2000, 'Please keep it under 2000 characters')
})

// Step 3: Social Handles (Optional)
export const SocialHandlesSchema = z.object({
  instagram_handle: z.string().max(30).optional(),
  tiktok_handle: z.string().max(30).optional(),
  youtube_handle: z.string().max(100).optional()
})

// Step 4: Brand Selection
export const BrandSelectionSchema = z.object({
  preferred_brands: z.string()
    .min(3, 'Please enter at least one brand')
    .max(1000, 'Please keep it under 1000 characters')
})

// Step 5: Previous Collaborations (Optional)
export const CollaborationItemSchema = z.object({
  brand_name: z.string().min(1).max(200),
  collaboration_type: z.string().max(100).optional(),
  date_range: z.string().max(100).optional(),
  notes: z.string().max(500).optional()
})

export const PreviousCollaborationsSchema = z.object({
  collaborations: z.array(CollaborationItemSchema).max(20)
})

// Step 6: Payment Information (Optional)
export const PaymentInformationSchema = z.object({
  previous_payment_amount: z.string().max(20).optional(),
  currency: z.enum(['GBP', 'USD', 'EUR']).default('GBP'),
  payment_method: z.string().max(100).optional(),
  payment_notes: z.string().max(500).optional()
})

// Step 7: Brand Inbound Setup
export const BrandInboundSetupSchema = z.object({
  email_setup_type: z.enum(['email_forwarding', 'manager_email']),
  manager_email: z.string().email('Invalid email address').optional()
}).refine(
  (data) => {
    if (data.email_setup_type === 'manager_email') {
      return !!data.manager_email
    }
    return true
  },
  {
    message: 'Manager email is required when using manager email setup',
    path: ['manager_email']
  }
)

// Step 8: Email Forwarding Video
export const EmailForwardingVideoSchema = z.object({
  email_forwarding_video_watched: z.boolean()
})

// Step 9: Instagram Bio Setup
export const InstagramBioSetupSchema = z.object({
  instagram_bio_setup: z.enum(['done', 'will_do'])
})

// Step 10: UK Events Chat
export const UKEventsChatSchema = z.object({
  uk_events_chat_joined: z.boolean()
})

// Step 11: Expectations
export const ExpectationsSchema = z.object({
  viewed: z.boolean().default(true)
})

// Map of step keys to their validation schemas
export const STEP_SCHEMAS = {
  welcome_video: WelcomeVideoSchema,
  personal_info: PersonalInfoSchema,
  social_goals: SocialGoalsSchema,
  social_handles: SocialHandlesSchema,
  brand_selection: BrandSelectionSchema,
  previous_collaborations: PreviousCollaborationsSchema,
  payment_information: PaymentInformationSchema,
  brand_inbound_setup: BrandInboundSetupSchema,
  email_forwarding_video: EmailForwardingVideoSchema,
  instagram_bio_setup: InstagramBioSetupSchema,
  uk_events_chat: UKEventsChatSchema,
  expectations: ExpectationsSchema
} as const

export type StepKey = keyof typeof STEP_SCHEMAS

// Validate step data
export function validateStepData(stepKey: string, data: any) {
  const schema = STEP_SCHEMAS[stepKey as StepKey]
  if (!schema) {
    throw new Error(`Unknown step: ${stepKey}`)
  }
  return schema.parse(data)
}

// Safe validation that returns result object
export function safeValidateStepData(stepKey: string, data: any) {
  const schema = STEP_SCHEMAS[stepKey as StepKey]
  if (!schema) {
    return {
      success: false,
      error: `Unknown step: ${stepKey}`
    }
  }
  
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    // TypeScript-safe error extraction
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || 'Validation failed'
    }
  }
}
