import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { isValidEmail } from '../lib/utils/validation'

export interface OnboardingData {
  company_name: string
  website: string
  industry: string
  company_size: string
  description: string
  logo_url: string
  annual_budget: string
  preferred_niches: string[]
  target_regions: string[]
  brand_contact_name: string
  brand_contact_role: string
  brand_contact_email: string
  brand_contact_phone: string
  primary_region: string
  campaign_objective: string
  product_service_type: string
  preferred_contact_method: string
  proactive_suggestions: string
  invite_team_members: string
  team_member_1_email: string
  team_member_2_email: string
  stride_contact_name: string
}

const initialFormData = (user: any): OnboardingData => ({
  company_name: '',
  website: '',
  industry: '',
  company_size: '',
  description: '',
  logo_url: '',
  annual_budget: '',
  preferred_niches: [],
  target_regions: [],
  brand_contact_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
  brand_contact_role: '',
  brand_contact_email: user?.primaryEmailAddress?.emailAddress || '',
  brand_contact_phone: '',
  primary_region: '',
  campaign_objective: '',
  product_service_type: '',
  preferred_contact_method: '',
  proactive_suggestions: '',
  invite_team_members: '',
  team_member_1_email: '',
  team_member_2_email: '',
  stride_contact_name: ''
})

export function useOnboardingForm() {
  const { user } = useUser()
  const [formData, setFormData] = useState<OnboardingData>(() => initialFormData(user))
  const [validationError, setValidationError] = useState<string | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Auto-populate contact email when user loads
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !formData.brand_contact_email) {
      setFormData(prev => ({
        ...prev,
        brand_contact_email: user.primaryEmailAddress?.emailAddress || ''
      }))
    }
  }, [user, formData.brand_contact_email])

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    hasUnsavedChanges.current = true
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const resetForm = () => {
    setFormData(initialFormData(user))
    hasUnsavedChanges.current = false
    setValidationError(null)
  }

  return {
    formData,
    setFormData,
    updateFormData,
    validationError,
    setValidationError,
    hasUnsavedChanges,
    resetForm
  }
}
