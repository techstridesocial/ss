'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { ONBOARDING_SUCCESS_REDIRECT_DELAY } from '../../../constants/onboarding'
import { useOnboardingForm, OnboardingData } from '../../../hooks/useOnboardingForm'
import { useStepNavigation, Step } from '../../../hooks/useStepNavigation'
import { useFormPersistence } from '../../../hooks/useFormPersistence'
import {
  CompanyNameStep,
  WebsiteStep,
  IndustryStep,
  CompanySizeStep,
  DescriptionStep,
  LogoUploadStep,
  BudgetStep,
  NichesStep,
  RegionsStep,
  ContactNameStep,
  ContactRoleStep,
  ContactEmailStep,
  ContactPhoneStep,
  TeamInvitationStep,
  OptionalSelectStep,
  OptionalRadioStep,
  ReviewStep
} from '../../../components/onboarding/steps'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle
} from 'lucide-react'

// Step definitions
const STEPS: Step[] = [
  { id: 'company_name', title: "What's your brand called?", type: 'text' },
  { id: 'website', title: "Do you have a website?", type: 'url' },
  { id: 'industry', title: "Which industry are you in?", type: 'select' },
  { id: 'company_size', title: "How big is your team?", type: 'radio' },
  { id: 'description', title: "What does your brand do?", type: 'textarea' },
  { id: 'logo_url', title: "Upload your logo", type: 'upload', optional: true },
  { id: 'annual_budget', title: "What's your annual marketing budget?", type: 'radio' },
  { id: 'preferred_niches', title: "What content niches do you want to focus on?", type: 'multiselect' },
  { id: 'target_regions', title: "Where are your target customers located?", type: 'multiselect' },
  { id: 'primary_region', title: "What's your primary region of operation?", type: 'select', optional: true },
  { id: 'campaign_objective', title: "What's your main campaign objective?", type: 'select', optional: true },
  { id: 'product_service_type', title: "What type of product/service do you offer?", type: 'select', optional: true },
  { id: 'preferred_contact_method', title: "How would you prefer we contact you?", type: 'radio', optional: true },
  { id: 'proactive_suggestions', title: "Would you like Stride to suggest creators proactively?", type: 'radio', optional: true },
  { id: 'invite_team_members', title: "Would you like to invite team members to collaborate?", type: 'radio', optional: true },
  { id: 'team_invitations', title: "Invite your team members", type: 'team_invitations', optional: true },
  { id: 'brand_contact_name', title: "Who's your main point of contact at your brand?", type: 'text' },
  { id: 'brand_contact_role', title: "What's their role in your company?", type: 'text' },
  { id: 'brand_contact_email', title: "Brand contact email address?", type: 'email' },
  { id: 'brand_contact_phone', title: "Brand contact phone number?", type: 'tel' },
  { id: 'stride_contact_name', title: "Who should be your main contact at Stride Social?", type: 'text', optional: true },
  { id: 'review', title: "Final step: review your details", type: 'review' }
]

// Options data
const INDUSTRY_OPTIONS = [
  'Beauty & Cosmetics', 'Fashion & Apparel', 'Wellness & Health', 'Technology',
  'Food & Beverage', 'Travel & Tourism', 'Home & Lifestyle', 'Automotive',
  'Entertainment', 'Education', 'Finance', 'Sports & Fitness',
  'Parenting', 'Business', 'Art & Design', 'Gaming', 'Music', 'Photography'
]

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '200+', label: '200+' }
]

const BUDGET_OPTIONS = [
  { value: 'under-10k', label: 'Under $10K' },
  { value: '10k-25k', label: '$10K – $25K' },
  { value: '25k-50k', label: '$25K – $50K' },
  { value: '50k-100k', label: '$50K – $100K' },
  { value: '100k-250k', label: '$100K – $250K' },
  { value: '250k-500k', label: '$250K – $500K' },
  { value: '500k+', label: '$500K+' }
]

const NICHE_OPTIONS = [
  'Beauty', 'Skincare', 'Lifestyle', 'Sustainability', 'Fitness', 'Food',
  'Music', 'Parenting', 'Education', 'Health', 'Technology', 'Art',
  'Business', 'Travel', 'Gaming', 'Photography', 'Finance', 'Home Decor'
]

const REGION_OPTIONS = [
  'United Kingdom', 'United States', 'Canada', 'Europe', 'Latin America',
  'Africa', 'Asia Pacific', 'Middle East', 'Australia', 'Global'
]

const PRIMARY_REGION_OPTIONS = [
  'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 
  'Italy', 'Spain', 'Netherlands', 'Australia', 'New Zealand',
  'Brazil', 'Mexico', 'Japan', 'South Korea', 'India', 'Singapore',
  'UAE', 'South Africa', 'Other'
]

const CAMPAIGN_OBJECTIVE_OPTIONS = [
  'Brand Awareness', 'Product Launch', 'Sales & Conversions', 
  'Engagement & Community Building', 'Event Promotion', 
  'Seasonal Campaign', 'User-Generated Content', 'Reviews & Testimonials',
  'Educational Content', 'Lifestyle Integration', 'Other'
]

const PRODUCT_SERVICE_TYPE_OPTIONS = [
  'Physical Product', 'Digital Product/Software', 'Service-Based Business',
  'E-commerce', 'Subscription Service', 'Mobile App', 'Event/Experience',
  'Consulting', 'Education/Course', 'Non-Profit', 'Other'
]

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'any', label: 'Any method is fine' }
]

const PROACTIVE_SUGGESTIONS_OPTIONS = [
  { value: 'yes', label: 'Yes, suggest creators proactively' },
  { value: 'no', label: 'No, I\'ll browse and select myself' }
]

const TEAM_INVITATION_OPTIONS = [
  { value: 'yes', label: 'Yes, I\'d like to invite team members' },
  { value: 'no', label: 'No, just me for now' }
]

function BrandOnboardingPageContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    formData,
    setFormData,
    updateFormData,
    validationError,
    setValidationError,
    hasUnsavedChanges
  } = useOnboardingForm()

  // Create step map for review step edit functionality
  const stepMap = useMemo(() => {
    const map = new Map<string, number>()
    STEPS.forEach((step, index) => {
      map.set(step.id, index)
    })
    return map
  }, [])

  // Form persistence
  useFormPersistence(formData, setFormData, isCompleted)

  // Beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current && !isCompleted) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isCompleted, hasUnsavedChanges])

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    setSubmitError(null)
    
    try {
      const response = await fetch('/api/brand/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        let errorMessage = 'Onboarding failed. Please try again.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      hasUnsavedChanges.current = false
      setIsCompleted(true)
      
      setTimeout(() => {
        router.push('/brand/campaigns')
      }, ONBOARDING_SUCCESS_REDIRECT_DELAY)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.'
      setSubmitError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [formData, router])

  const {
    currentStep,
    currentStepData,
    progress,
    validationError: stepValidationError,
    setValidationError: setStepValidationError,
    isStepValid,
    handleNext,
    handlePrev,
    goToStep
  } = useStepNavigation(STEPS, formData, handleSubmit)

  // Merge validation errors
  const displayError = validationError || stepValidationError

  const renderStepContent = () => {
    if (!currentStepData) return null

    const stepId = currentStepData.id

    switch (stepId) {
      case 'company_name':
        return (
          <CompanyNameStep
            value={formData.company_name}
            onChange={(v) => updateFormData('company_name', v)}
            error={displayError && stepId === 'company_name' ? displayError : undefined}
          />
        )

      case 'website':
        return (
          <WebsiteStep
            value={formData.website}
            onChange={(v) => updateFormData('website', v)}
            error={displayError && stepId === 'website' ? displayError : undefined}
          />
        )

      case 'industry':
        return (
          <IndustryStep
            value={formData.industry}
            onChange={(v) => updateFormData('industry', v)}
            error={displayError && stepId === 'industry' ? displayError : undefined}
            options={INDUSTRY_OPTIONS}
          />
        )

      case 'company_size':
        return (
          <CompanySizeStep
            value={formData.company_size}
            onChange={(v) => updateFormData('company_size', v)}
            error={displayError && stepId === 'company_size' ? displayError : undefined}
            options={COMPANY_SIZE_OPTIONS}
          />
        )

      case 'description':
        return (
          <DescriptionStep
            value={formData.description}
            onChange={(v) => updateFormData('description', v)}
            error={displayError && stepId === 'description' ? displayError : undefined}
          />
        )

      case 'logo_url':
        return (
          <LogoUploadStep
            value={formData.logo_url}
            onChange={(v) => updateFormData('logo_url', v)}
            onError={setValidationError}
          />
        )

      case 'annual_budget':
        return (
          <BudgetStep
            value={formData.annual_budget}
            onChange={(v) => updateFormData('annual_budget', v)}
            error={displayError && stepId === 'annual_budget' ? displayError : undefined}
            options={BUDGET_OPTIONS}
          />
        )

      case 'preferred_niches':
        return (
          <NichesStep
            value={formData.preferred_niches}
            onChange={(v) => updateFormData('preferred_niches', v)}
            error={displayError && stepId === 'preferred_niches' ? displayError : undefined}
            options={NICHE_OPTIONS}
          />
        )

      case 'target_regions':
        return (
          <RegionsStep
            value={formData.target_regions}
            onChange={(v) => updateFormData('target_regions', v)}
            error={displayError && stepId === 'target_regions' ? displayError : undefined}
            options={REGION_OPTIONS}
          />
        )

      case 'primary_region':
        return (
          <OptionalSelectStep
            value={formData.primary_region}
            onChange={(v) => updateFormData('primary_region', v)}
            options={PRIMARY_REGION_OPTIONS}
            label="Select your primary region of operation"
          />
        )

      case 'campaign_objective':
        return (
          <OptionalSelectStep
            value={formData.campaign_objective}
            onChange={(v) => updateFormData('campaign_objective', v)}
            options={CAMPAIGN_OBJECTIVE_OPTIONS}
            label="What's your main campaign objective?"
          />
        )

      case 'product_service_type':
        return (
          <OptionalSelectStep
            value={formData.product_service_type}
            onChange={(v) => updateFormData('product_service_type', v)}
            options={PRODUCT_SERVICE_TYPE_OPTIONS}
            label="What type of product/service do you offer?"
          />
        )

      case 'preferred_contact_method':
        return (
          <OptionalRadioStep
            value={formData.preferred_contact_method}
            onChange={(v) => updateFormData('preferred_contact_method', v)}
            options={CONTACT_METHOD_OPTIONS}
            label="How would you prefer we contact you?"
          />
        )

      case 'proactive_suggestions':
        return (
          <OptionalRadioStep
            value={formData.proactive_suggestions}
            onChange={(v) => updateFormData('proactive_suggestions', v)}
            options={PROACTIVE_SUGGESTIONS_OPTIONS}
            label="Would you like Stride to suggest creators proactively?"
          />
        )

      case 'invite_team_members':
        return (
          <OptionalRadioStep
            value={formData.invite_team_members}
            onChange={(v) => updateFormData('invite_team_members', v)}
            options={TEAM_INVITATION_OPTIONS}
            label="You can add team members later if you prefer"
          />
        )

      case 'team_invitations':
        return (
          <TeamInvitationStep
            email1={formData.team_member_1_email}
            email2={formData.team_member_2_email}
            onEmail1Change={(v) => updateFormData('team_member_1_email', v)}
            onEmail2Change={(v) => updateFormData('team_member_2_email', v)}
          />
        )

      case 'brand_contact_name':
        return (
          <ContactNameStep
            value={formData.brand_contact_name}
            onChange={(v) => updateFormData('brand_contact_name', v)}
            error={displayError && stepId === 'brand_contact_name' ? displayError : undefined}
          />
        )

      case 'brand_contact_role':
        return (
          <ContactRoleStep
            value={formData.brand_contact_role}
            onChange={(v) => updateFormData('brand_contact_role', v)}
            error={displayError && stepId === 'brand_contact_role' ? displayError : undefined}
          />
        )

      case 'brand_contact_email':
        return (
          <ContactEmailStep
            value={formData.brand_contact_email}
            onChange={(v) => updateFormData('brand_contact_email', v)}
            error={displayError && stepId === 'brand_contact_email' ? displayError : undefined}
          />
        )

      case 'brand_contact_phone':
        return (
          <ContactPhoneStep
            value={formData.brand_contact_phone}
            onChange={(v) => updateFormData('brand_contact_phone', v)}
            error={displayError && stepId === 'brand_contact_phone' ? displayError : undefined}
          />
        )

      case 'stride_contact_name':
        return (
          <ContactNameStep
            value={formData.stride_contact_name}
            onChange={(v) => updateFormData('stride_contact_name', v)}
          />
        )

      case 'review':
        return (
          <ReviewStep
            formData={formData}
            onEditStep={(stepId) => {
              const stepIndex = stepMap.get(stepId)
              if (stepIndex !== undefined) {
                goToStep(stepIndex)
              }
            }}
            stepMap={stepMap}
            options={{
              budget: BUDGET_OPTIONS,
              contactMethod: CONTACT_METHOD_OPTIONS,
              proactiveSuggestions: PROACTIVE_SUGGESTIONS_OPTIONS
            }}
          />
        )

      default:
        return null
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative"
        style={{
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <img 
              src="https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/logo/logo-full-white-yyqQnjIujCXZTACVDaoHzFvyh3XDPF.webp"
              alt="Stride Social"
              className="h-20 w-auto mx-auto mb-6"
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-4"
          >
            You're all set!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-blue-200 mb-8"
          >
            Your brand profile is now live and ready to go.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg"
          >
            Redirecting to Dashboard...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const validation = isStepValid()

  return (
    <div className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 w-full h-1 bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <img 
              src="https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/logo/logo-full-white-yyqQnjIujCXZTACVDaoHzFvyh3XDPF.webp"
              alt="Stride Social"
              className="h-16 w-auto mx-auto mb-6"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="text-blue-200 text-sm font-medium mb-2" aria-live="polite" aria-atomic="true">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" id="step-title">
              {currentStepData?.title || 'Loading...'}
            </h1>
          </motion.div>

          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm"
                role="alert"
                aria-live="polite"
              >
                {displayError}
              </motion.div>
            )}
            
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm"
                role="alert"
                aria-live="assertive"
              >
                <strong>Error:</strong> {submitError}
              </motion.div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <motion.button
              onClick={handlePrev}
              disabled={currentStep === 0 || isLoading}
              whileHover={{ scale: currentStep > 0 && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: currentStep > 0 && !isLoading ? 0.95 : 1 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 0 || isLoading
                  ? 'opacity-50 cursor-not-allowed text-blue-200'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!validation.valid || isLoading}
              whileHover={{ scale: validation.valid && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: validation.valid && !isLoading ? 0.95 : 1 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                validation.valid && !isLoading
                  ? 'text-white hover:bg-white/10 border border-white/30'
                  : 'opacity-50 cursor-not-allowed text-white/50'
              }`}
              aria-label={validation.valid ? 'Continue to next step' : `Cannot continue: ${validation.error || 'Please complete this step'}`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  </motion.div>
                  <span>Setting up...</span>
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <span>Complete Setup</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrandOnboardingPage() {
  return (
    <BrandProtectedRoute>
      <BrandOnboardingPageContent />
    </BrandProtectedRoute>
  )
}
