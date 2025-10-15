'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2, 
  Globe, 
  Tag, 
  Users, 
  FileText, 
  Upload, 
  DollarSign, 
  Target,
  MapPin,
  User,
  Mail,
  Phone,
  Eye,
  CheckCircle
} from 'lucide-react'

interface OnboardingData {
  company_name: string
  website: string
  industry: string
  company_size: string
  description: string
  logo_url: string
  annual_budget: string
  preferred_niches: string[]
  target_regions: string[]
  // Brand Contact Information
  brand_contact_name: string
  brand_contact_role: string
  brand_contact_email: string
  brand_contact_phone: string
  // New Optional Fields
  primary_region: string
  campaign_objective: string
  product_service_type: string
  preferred_contact_method: string
  proactive_suggestions: string
  // Team Member Invitations (Optional)
  invite_team_members: string
  team_member_1_email: string
  team_member_2_email: string
  // Stride Social Contact Information
  stride_contact_name: string
}

const STEPS = [
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

const INDUSTRY_OPTIONS = [
  'Beauty & Cosmetics',
  'Fashion & Apparel',
  'Wellness & Health',
  'Technology',
  'Food & Beverage',
  'Travel & Tourism',
  'Home & Lifestyle',
  'Automotive',
  'Entertainment',
  'Education',
  'Finance',
  'Sports & Fitness',
  'Parenting',
  'Business',
  'Art & Design',
  'Gaming',
  'Music',
  'Photography'
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
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const [formData, setFormData] = useState<OnboardingData>({
    company_name: '',
    website: '',
    industry: '',
    company_size: '',
    description: '',
    logo_url: '',
    annual_budget: '',
    preferred_niches: [],
    target_regions: [],
    // Brand Contact Information (auto-populated from Clerk)
    brand_contact_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    brand_contact_role: '',
    brand_contact_email: user?.primaryEmailAddress?.emailAddress || '',
    brand_contact_phone: '',
    // New Optional Fields
    primary_region: '',
    campaign_objective: '',
    product_service_type: '',
    preferred_contact_method: '',
    proactive_suggestions: '',
    // Team Member Invitations (Optional)
    invite_team_members: '',
    team_member_1_email: '',
    team_member_2_email: '',
    // Stride Social Contact Information
    stride_contact_name: ''
  })

  // Auto-populate contact email when user loads
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !formData.brand_contact_email) {
      setFormData(prev => ({
        ...prev,
        brand_contact_email: user.primaryEmailAddress?.emailAddress || ''
      }))
    }
  }, [user])

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Last step - submit
      await handleSubmit()
    } else {
      let nextStep = currentStep + 1
      
      // Skip team_invitations step if user said no to inviting team members
      if (STEPS[nextStep]?.id === 'team_invitations' && formData.invite_team_members === 'no') {
        nextStep += 1
      }
      
      setCurrentStep(nextStep)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1
      
      // Skip team_invitations step if user said no to inviting team members
      if (STEPS[prevStep]?.id === 'team_invitations' && formData.invite_team_members === 'no') {
        prevStep -= 1
      }
      
      setCurrentStep(prevStep)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/brand/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        let errorMessage = 'Onboarding failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          // If JSON parsing fails, it's likely an HTML error page
          const textError = await response.text()
          console.error('Server error response:', textError)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Onboarding successful:', result)
      
      setIsCompleted(true)
      
      // Redirect to dashboard after success animation
      setTimeout(() => {
        router.push('/brand/campaigns')
      }, 3000)
    } catch (error) {
      console.error('Onboarding submission failed:', error)
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    const step = currentStepData
    if (!step) return false

    // Optional steps are always valid
    if (step.optional) return true

    switch (step.id) {
      case 'company_name':
        return formData.company_name.trim().length > 0
      case 'website':
        return formData.website.trim().length > 0
      case 'industry':
        return formData.industry.length > 0
      case 'company_size':
        return formData.company_size.length > 0
      case 'description':
        return formData.description.trim().length > 0
      case 'logo_url':
        return true // Optional
      case 'annual_budget':
        return formData.annual_budget.length > 0
      case 'preferred_niches':
        return formData.preferred_niches.length > 0
      case 'target_regions':
        return formData.target_regions.length > 0
      case 'brand_contact_name':
        return formData.brand_contact_name.trim().length > 0
      case 'brand_contact_role':
        return formData.brand_contact_role.trim().length > 0
      case 'brand_contact_email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(formData.brand_contact_email)
      case 'brand_contact_phone':
        return formData.brand_contact_phone.trim().length > 0 // Required
      case 'review':
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    const step = currentStepData
    if (!step) return null

    switch (step.id) {
      case 'company_name':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                placeholder="e.g. Luxe Beauty Co."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'website':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'industry':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {INDUSTRY_OPTIONS.map((industry) => (
                <motion.button
                  key={industry}
                  onClick={() => updateFormData('industry', industry)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    formData.industry === industry
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span className="font-medium">{industry}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 'company_size':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => updateFormData('company_size', option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                  formData.company_size === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option.label}</span>
                  {formData.company_size === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )

      case 'description':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="We're a clean beauty brand focused on sustainable, cruelty-free cosmetics..."
                maxLength={300}
                rows={4}
                className="w-full p-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm resize-none"
                autoFocus
              />
              <div className="absolute bottom-4 right-4 text-blue-200 text-sm">
                {formData.description.length}/300
              </div>
            </div>
          </motion.div>
        )

      case 'logo_url':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center bg-white/5">
              <Upload className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <p className="text-white mb-4">Drop your logo here or click to browse</p>
              <p className="text-blue-200 text-sm">Optional - Upload your brand logo</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // In a real app, you'd upload to Vercel Blob here
                    updateFormData('logo_url', URL.createObjectURL(file))
                  }
                }}
              />
              <label
                htmlFor="logo-upload"
                className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl 
                  text-white cursor-pointer transition-all duration-200"
              >
                Choose File
              </label>
            </div>
            {formData.logo_url && (
              <div className="text-center">
                <img 
                  src={formData.logo_url} 
                  alt="Logo preview" 
                  className="max-w-32 max-h-32 mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </motion.div>
        )

      case 'annual_budget':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {BUDGET_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => updateFormData('annual_budget', option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                  formData.annual_budget === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option.label}</span>
                  {formData.annual_budget === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )

      case 'preferred_niches':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {NICHE_OPTIONS.map((niche) => {
                const isSelected = formData.preferred_niches.includes(niche)
                return (
                  <motion.button
                    key={niche}
                    onClick={() => {
                      const current = formData.preferred_niches
                      const updated = isSelected
                        ? current.filter(n => n !== niche)
                        : [...current, niche]
                      updateFormData('preferred_niches', updated)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl text-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <span className="font-medium text-sm">{niche}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 mx-auto mt-1" />
                    )}
                  </motion.button>
                )
              })}
            </div>
            <p className="text-blue-200 text-sm text-center">
              Selected: {formData.preferred_niches.length} niches
            </p>
          </motion.div>
        )

      case 'target_regions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {REGION_OPTIONS.map((region) => {
                const isSelected = formData.target_regions.includes(region)
                return (
                  <motion.button
                    key={region}
                    onClick={() => {
                      const current = formData.target_regions
                      const updated = isSelected
                        ? current.filter(r => r !== region)
                        : [...current, region]
                      updateFormData('target_regions', updated)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{region}</span>
                      {isSelected && (
                        <Check className="w-5 h-5" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
            <p className="text-blue-200 text-sm text-center">
              Selected: {formData.target_regions.length} regions
            </p>
          </motion.div>
        )

      case 'primary_region':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {PRIMARY_REGION_OPTIONS.map((region) => (
                <motion.button
                  key={region}
                  onClick={() => updateFormData('primary_region', region)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    formData.primary_region === region
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span className="font-medium">{region}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-blue-200 text-sm text-center">
              Optional - Select your primary region of operation
            </p>
          </motion.div>
        )

      case 'campaign_objective':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {CAMPAIGN_OBJECTIVE_OPTIONS.map((objective) => (
                <motion.button
                  key={objective}
                  onClick={() => updateFormData('campaign_objective', objective)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    formData.campaign_objective === objective
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span className="font-medium">{objective}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-blue-200 text-sm text-center">
              Optional - What's your main campaign objective?
            </p>
          </motion.div>
        )

      case 'product_service_type':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {PRODUCT_SERVICE_TYPE_OPTIONS.map((type) => (
                <motion.button
                  key={type}
                  onClick={() => updateFormData('product_service_type', type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    formData.product_service_type === type
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span className="font-medium">{type}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-blue-200 text-sm text-center">
              Optional - What type of product/service do you offer?
            </p>
          </motion.div>
        )

      case 'preferred_contact_method':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {CONTACT_METHOD_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => updateFormData('preferred_contact_method', option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                  formData.preferred_contact_method === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option.label}</span>
                  {formData.preferred_contact_method === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
            <p className="text-blue-200 text-sm text-center">
              Optional - How would you prefer we contact you?
            </p>
          </motion.div>
        )

      case 'proactive_suggestions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {PROACTIVE_SUGGESTIONS_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => updateFormData('proactive_suggestions', option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                  formData.proactive_suggestions === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option.label}</span>
                  {formData.proactive_suggestions === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
            <p className="text-blue-200 text-sm text-center">
              Optional - Would you like Stride to suggest creators proactively?
            </p>
          </motion.div>
        )

      case 'invite_team_members':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {TEAM_INVITATION_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => updateFormData('invite_team_members', option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                  formData.invite_team_members === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option.label}</span>
                  {formData.invite_team_members === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
            <p className="text-blue-200 text-sm text-center">
              Optional - You can add team members later if you prefer
            </p>
          </motion.div>
        )

      case 'team_invitations':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Users size={14} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Invite Team Members</h4>
                  <p className="text-sm text-blue-200 leading-relaxed">
                    Add up to 2 team members who will have access to the brand portal. They'll receive an invitation to join your team.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h4 className="text-base font-bold text-white">Team Member 1</h4>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.team_member_1_email}
                    onChange={(e) => updateFormData('team_member_1_email', e.target.value)}
                    placeholder="john.smith@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                      text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                      focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                {formData.team_member_1_email && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3"
                  >
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="font-medium">
                      Ready to invite {formData.team_member_1_email}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h4 className="text-base font-bold text-white">Team Member 2</h4>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.team_member_2_email}
                    onChange={(e) => updateFormData('team_member_2_email', e.target.value)}
                    placeholder="jane.doe@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                      text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                      focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                {formData.team_member_2_email && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3"
                  >
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="font-medium">
                      Ready to invite {formData.team_member_2_email}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <p className="text-blue-200 text-sm text-center">
              Optional - Leave blank if you don't want to invite anyone right now
            </p>
          </motion.div>
        )

      case 'brand_contact_name':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                value={formData.brand_contact_name}
                onChange={(e) => updateFormData('brand_contact_name', e.target.value)}
                placeholder="John Smith"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'brand_contact_role':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                value={formData.brand_contact_role}
                onChange={(e) => updateFormData('brand_contact_role', e.target.value)}
                placeholder="e.g. Marketing Manager"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'brand_contact_email':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="email"
                value={formData.brand_contact_email}
                onChange={(e) => updateFormData('brand_contact_email', e.target.value)}
                placeholder="john@company.com"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'brand_contact_phone':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="tel"
                value={formData.brand_contact_phone}
                onChange={(e) => updateFormData('brand_contact_phone', e.target.value)}
                placeholder="+44 20 1234 5678"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'stride_contact_name':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                value={formData.stride_contact_name}
                onChange={(e) => updateFormData('stride_contact_name', e.target.value)}
                placeholder="Jane Williams"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
            <p className="text-blue-200 text-sm text-center">
              Optional - Leave blank if you don't have a specific preference
            </p>
          </motion.div>
        )


      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200 font-medium">Company</p>
                  <p className="text-white">{formData.company_name}</p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium">Industry</p>
                  <p className="text-white">{formData.industry}</p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium">Website</p>
                  <p className="text-white break-all">{formData.website}</p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium">Team Size</p>
                  <p className="text-white">{formData.company_size}</p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium">Annual Budget</p>
                  <p className="text-white">{BUDGET_OPTIONS.find(o => o.value === formData.annual_budget)?.label}</p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium">Brand Contact</p>
                  <p className="text-white">{formData.brand_contact_name}</p>
                  <p className="text-white text-xs">{formData.brand_contact_email}</p>
                </div>
              </div>
              
              <div>
                <p className="text-blue-200 font-medium">Description</p>
                <p className="text-white text-sm">{formData.description}</p>
              </div>
              
              <div>
                <p className="text-blue-200 font-medium">Content Niches ({formData.preferred_niches.length})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferred_niches.map(niche => (
                    <span key={niche} className="px-2 py-1 bg-white/20 rounded-lg text-white text-xs">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-blue-200 font-medium">Target Regions ({formData.target_regions.length})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.target_regions.map(region => (
                    <span key={region} className="px-2 py-1 bg-white/20 rounded-lg text-white text-xs">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* New Optional Fields */}
              {formData.primary_region && (
                <div>
                  <p className="text-blue-200 font-medium">Primary Region</p>
                  <p className="text-white text-sm">{formData.primary_region}</p>
                </div>
              )}

              {formData.campaign_objective && (
                <div>
                  <p className="text-blue-200 font-medium">Campaign Objective</p>
                  <p className="text-white text-sm">{formData.campaign_objective}</p>
                </div>
              )}

              {formData.product_service_type && (
                <div>
                  <p className="text-blue-200 font-medium">Product/Service Type</p>
                  <p className="text-white text-sm">{formData.product_service_type}</p>
                </div>
              )}

              {formData.preferred_contact_method && (
                <div>
                  <p className="text-blue-200 font-medium">Preferred Contact Method</p>
                  <p className="text-white text-sm">
                    {CONTACT_METHOD_OPTIONS.find(o => o.value === formData.preferred_contact_method)?.label}
                  </p>
                </div>
              )}

              {formData.proactive_suggestions && (
                <div>
                  <p className="text-blue-200 font-medium">Proactive Creator Suggestions</p>
                  <p className="text-white text-sm">
                    {PROACTIVE_SUGGESTIONS_OPTIONS.find(o => o.value === formData.proactive_suggestions)?.label}
                  </p>
                </div>
              )}

              {/* Team Member Invitations */}
              {formData.invite_team_members === 'yes' && (formData.team_member_1_email || formData.team_member_2_email) && (
                <div>
                  <p className="text-blue-200 font-medium">Team Members to Invite</p>
                  <div className="space-y-1 mt-2">
                    {formData.team_member_1_email && (
                      <p className="text-white text-sm flex items-center space-x-2">
                        <Mail size={14} className="text-blue-300" />
                        <span>{formData.team_member_1_email}</span>
                      </p>
                    )}
                    {formData.team_member_2_email && (
                      <p className="text-white text-sm flex items-center space-x-2">
                        <Mail size={14} className="text-blue-300" />
                        <span>{formData.team_member_2_email}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Stride Social Contact Information */}
              {formData.stride_contact_name && (
                <div>
                  <p className="text-blue-200 font-medium">Stride Social Contact</p>
                  <p className="text-white text-sm">{formData.stride_contact_name}</p>
                </div>
              )}
            </div>
          </motion.div>
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
          {/* Stride Logo on Success */}
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

  return (
    <div className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Progress bar */}
      <div className="relative z-10 w-full h-1 bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Stride Logo */}
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

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="text-blue-200 text-sm font-medium mb-2">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentStepData?.title || 'Loading...'}
            </h1>
          </motion.div>

          {/* Step content */}
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
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <motion.button
              onClick={handlePrev}
              disabled={currentStep === 0}
              whileHover={{ scale: currentStep > 0 ? 1.05 : 1 }}
              whileTap={{ scale: currentStep > 0 ? 0.95 : 1 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed text-blue-200'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              whileHover={{ scale: isStepValid() && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: isStepValid() && !isLoading ? 0.95 : 1 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isStepValid() && !isLoading
                  ? 'text-white hover:bg-white/10 border border-white/30'
                  : 'opacity-50 cursor-not-allowed text-white/50'
              }`}
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