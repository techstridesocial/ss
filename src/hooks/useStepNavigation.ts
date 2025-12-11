import { useState, useEffect } from 'react'
import { OnboardingData } from './useOnboardingForm'
import { isValidEmail } from '../../lib/utils/validation'

export interface Step {
  id: string
  title: string
  type: string
  optional?: boolean
}

export function useStepNavigation(
  steps: Step[],
  formData: OnboardingData,
  onComplete: () => void
) {
  const [currentStep, setCurrentStep] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const isStepValid = (stepId?: string): { valid: boolean; error?: string } => {
    const step = stepId ? steps.find(s => s.id === stepId) : currentStepData
    if (!step) return { valid: false, error: 'Step not found' }

    if (step.optional) return { valid: true }

    switch (step.id) {
      case 'company_name':
        if (formData.company_name.trim().length === 0) {
          return { valid: false, error: 'Company name is required' }
        }
        return { valid: true }
      case 'website':
        if (formData.website.trim().length === 0) {
          return { valid: false, error: 'Website is required' }
        }
        return { valid: true }
      case 'industry':
        if (formData.industry.length === 0) {
          return { valid: false, error: 'Please select an industry' }
        }
        return { valid: true }
      case 'company_size':
        if (formData.company_size.length === 0) {
          return { valid: false, error: 'Please select company size' }
        }
        return { valid: true }
      case 'description':
        if (formData.description.trim().length === 0) {
          return { valid: false, error: 'Description is required' }
        }
        return { valid: true }
      case 'logo_url':
        return { valid: true }
      case 'annual_budget':
        if (formData.annual_budget.length === 0) {
          return { valid: false, error: 'Please select annual budget' }
        }
        return { valid: true }
      case 'preferred_niches':
        if (formData.preferred_niches.length === 0) {
          return { valid: false, error: 'Please select at least one niche' }
        }
        return { valid: true }
      case 'target_regions':
        if (formData.target_regions.length === 0) {
          return { valid: false, error: 'Please select at least one target region' }
        }
        return { valid: true }
      case 'brand_contact_name':
        if (formData.brand_contact_name.trim().length === 0) {
          return { valid: false, error: 'Contact name is required' }
        }
        return { valid: true }
      case 'brand_contact_role':
        if (formData.brand_contact_role.trim().length === 0) {
          return { valid: false, error: 'Contact role is required' }
        }
        return { valid: true }
      case 'brand_contact_email':
        if (!formData.brand_contact_email.trim()) {
          return { valid: false, error: 'Email is required' }
        }
        if (!isValidEmail(formData.brand_contact_email)) {
          return { valid: false, error: 'Please enter a valid email address' }
        }
        return { valid: true }
      case 'brand_contact_phone':
        if (formData.brand_contact_phone.trim().length === 0) {
          return { valid: false, error: 'Phone number is required' }
        }
        return { valid: true }
      case 'review':
        return { valid: true }
      default:
        return { valid: false, error: 'Unknown step' }
    }
  }

  const getNextStep = (current: number): number => {
    let next = current + 1
    
    // Skip team_invitations if user said no
    if (steps[next]?.id === 'team_invitations' && formData.invite_team_members === 'no') {
      next += 1
    }
    
    return next
  }

  const getPrevStep = (current: number): number => {
    let prev = current - 1
    
    // Skip team_invitations if user said no
    if (steps[prev]?.id === 'team_invitations' && formData.invite_team_members === 'no') {
      prev -= 1
    }
    
    return prev
  }

  const handleNext = async () => {
    const validation = isStepValid()
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Please complete this step')
      return
    }
    
    setValidationError(null)
    
    if (currentStep === steps.length - 1) {
      onComplete()
    } else {
      setCurrentStep(getNextStep(currentStep))
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setValidationError(null)
      setCurrentStep(getPrevStep(currentStep))
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setValidationError(null)
      setCurrentStep(stepIndex)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement && !e.target.type.includes('file')) {
          e.preventDefault()
          const validation = isStepValid()
          if (validation.valid) {
            handleNext()
          }
        }
        return
      }
      
      if (e.key === 'Escape' && currentStep > 0) {
        handlePrev()
      }
      
      if (e.key === 'Enter') {
        const validation = isStepValid()
        if (validation.valid) {
          handleNext()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  return {
    currentStep,
    currentStepData,
    progress,
    validationError,
    setValidationError,
    isStepValid,
    handleNext,
    handlePrev,
    goToStep
  }
}
