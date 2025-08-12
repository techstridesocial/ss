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
  contact_name: string
  contact_role: string
  contact_email: string
  contact_phone: string
}

const STEPS = [
  { id: 'company_name', title: "What's your brand called?", type: 'text' },
  { id: 'website', title: "Do you have a website?", type: 'url' },
  { id: 'industry', title: "Which industry are you in?", type: 'select' },
  { id: 'company_size', title: "How big is your team?", type: 'radio' },
  { id: 'description', title: "What does your brand do?", type: 'textarea' },
  { id: 'logo_url', title: "Upload your logo", type: 'upload' },
  { id: 'annual_budget', title: "What's your annual marketing budget?", type: 'radio' },
  { id: 'preferred_niches', title: "What content niches do you want to focus on?", type: 'multiselect' },
  { id: 'target_regions', title: "Where are your target customers located?", type: 'multiselect' },
  { id: 'contact_name', title: "Who's your main point of contact?", type: 'text' },
  { id: 'contact_role', title: "What's their role?", type: 'text' },
  { id: 'contact_email', title: "Email address?", type: 'email' },
  { id: 'contact_phone', title: "Phone number?", type: 'tel' },
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
  'United Kingdom', 'North America', 'Europe', 'Latin America',
  'Africa', 'Asia Pacific', 'Middle East', 'Australia', 'Global'
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
    contact_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    contact_role: '',
    contact_email: user?.primaryEmailAddress?.emailAddress || '',
    contact_phone: ''
  })

  // Auto-populate contact email when user loads
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !formData.contact_email) {
      setFormData(prev => ({
        ...prev,
        contact_email: user.primaryEmailAddress?.emailAddress || ''
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
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
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
        router.push('/brand/influencers')
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
        return formData.logo_url.length > 0 // Now required
      case 'annual_budget':
        return formData.annual_budget.length > 0
      case 'preferred_niches':
        return formData.preferred_niches.length > 0
      case 'target_regions':
        return formData.target_regions.length > 0
      case 'contact_name':
        return formData.contact_name.trim().length > 0
      case 'contact_role':
        return formData.contact_role.trim().length > 0
      case 'contact_email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(formData.contact_email)
      case 'contact_phone':
        return formData.contact_phone.trim().length > 0 // Now required
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
              <p className="text-blue-200 text-sm">Required - Please upload your brand logo</p>
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

      case 'contact_name':
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
                value={formData.contact_name}
                onChange={(e) => updateFormData('contact_name', e.target.value)}
                placeholder="John Smith"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'contact_role':
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
                value={formData.contact_role}
                onChange={(e) => updateFormData('contact_role', e.target.value)}
                placeholder="e.g. Marketing Manager"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'contact_email':
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
                value={formData.contact_email}
                onChange={(e) => updateFormData('contact_email', e.target.value)}
                placeholder="john@company.com"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )

      case 'contact_phone':
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
                value={formData.contact_phone}
                onChange={(e) => updateFormData('contact_phone', e.target.value)}
                placeholder="+44 20 1234 5678"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
              />
            </div>
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
                  <p className="text-blue-200 font-medium">Contact</p>
                  <p className="text-white">{formData.contact_name}</p>
                  <p className="text-white text-xs">{formData.contact_email}</p>
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