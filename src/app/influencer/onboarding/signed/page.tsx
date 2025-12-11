'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { InfluencerProtectedRoute } from '../../../../components/auth/ProtectedRoute'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Video,
  Target,
  Building2,
  Briefcase,
  DollarSign,
  Mail,
  Instagram,
  MessageCircle,
  FileText,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { ONBOARDING_VIDEOS, UK_EVENTS_WHATSAPP_LINK, EXPECTATIONS_CONTENT } from '@/constants/onboarding'

interface SignedOnboardingData {
  // Step 1: Welcome Video - no data needed, just watched
  welcome_video_watched: boolean
  
  // Step 2: Social Media Goals
  social_goals: string
  
  // Step 3: Brand Selection
  selected_brands: string[] // Array of brand IDs
  
  // Step 4: Previous Collaborations
  collaborations: Array<{
    brand_name: string
    collaboration_type: string
    date_range: string
    notes: string
  }>
  
  // Step 5: Payment Information
  previous_payment_amount: string
  currency: string
  payment_method: string
  payment_notes: string
  
  // Step 6: Brand Inbound Setup
  email_setup_type: 'email_forwarding' | 'manager_email' | ''
  manager_email: string
  
  // Step 7: Email Forwarding Video - no data needed, just watched
  email_forwarding_video_watched: boolean
  
  // Step 8: Instagram Bio Setup
  instagram_bio_setup: 'done' | 'will_do' | ''
  
  // Step 9: UK Events Chat - no data needed, just link clicked
  uk_events_chat_joined: boolean
  
  // Step 10: Expectations - read-only, no data needed
}

const STEPS = [
  { id: 'welcome_video', title: 'Welcome to Stride Talent', type: 'video' },
  { id: 'social_goals', title: 'What are your social media goals?', type: 'textarea' },
  { id: 'brand_selection', title: 'Brands you\'d like to work with', type: 'brand_selection' },
  { id: 'previous_collaborations', title: 'Previous brand collaborations', type: 'collaborations' },
  { id: 'payment_information', title: 'Previous payment information', type: 'payment' },
  { id: 'brand_inbound_setup', title: 'Brand inbound setup', type: 'email_setup' },
  { id: 'email_forwarding_video', title: 'Email forwarding setup', type: 'video' },
  { id: 'instagram_bio_setup', title: 'Instagram bio setup', type: 'instagram_bio' },
  { id: 'uk_events_chat', title: 'Access to UK events chat', type: 'whatsapp_link' },
  { id: 'expectations', title: 'Expectations', type: 'expectations' }
]

function SignedOnboardingPageContent() {
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [brands, setBrands] = useState<any[]>([])
  const [origin, setOrigin] = useState('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])
  const [collaborationForm, setCollaborationForm] = useState({
    brand_name: '',
    collaboration_type: '',
    date_range: '',
    notes: ''
  })

  const [formData, setFormData] = useState<SignedOnboardingData>({
    welcome_video_watched: false,
    social_goals: '',
    selected_brands: [],
    collaborations: [],
    previous_payment_amount: '',
    currency: 'GBP',
    payment_method: '',
    payment_notes: '',
    email_setup_type: '',
    manager_email: '',
    email_forwarding_video_watched: false,
    instagram_bio_setup: '',
    uk_events_chat_joined: false
  })

  // Load onboarding progress on mount
  useEffect(() => {
    loadOnboardingProgress()
    loadBrands()
  }, [])

  const loadOnboardingProgress = async () => {
    try {
      setIsLoadingProgress(true)
      const response = await fetch('/api/influencer/onboarding/signed')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Restore form data from saved progress
          const progress = result.data
          if (progress.steps) {
            progress.steps.forEach((step: any) => {
              if (step.data) {
                Object.keys(step.data).forEach(key => {
                  if (key in formData) {
                    setFormData(prev => ({
                      ...prev,
                      [key]: step.data[key]
                    }))
                  }
                })
              }
            })
          }
          
          // Find the first incomplete step
          const incompleteStep = progress.steps.findIndex((s: any) => !s.completed)
          if (incompleteStep !== -1) {
            setCurrentStep(incompleteStep)
          }
        }
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error)
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/influencer/onboarding/signed/brands')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setBrands(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Last step - complete onboarding
      await handleComplete()
    } else {
      // Save current step
      await saveStep()
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const saveStep = async () => {
    if (!currentStepData) return
    const stepKey = currentStepData.id
    const stepData: any = {}

    // Collect data based on step type
    switch (stepKey) {
      case 'welcome_video':
        stepData.welcome_video_watched = formData.welcome_video_watched
        break
      case 'social_goals':
        stepData.social_goals = formData.social_goals
        break
      case 'brand_selection':
        stepData.selected_brands = formData.selected_brands
        break
      case 'previous_collaborations':
        stepData.collaborations = formData.collaborations
        break
      case 'payment_information':
        stepData.previous_payment_amount = formData.previous_payment_amount
        stepData.currency = formData.currency
        stepData.payment_method = formData.payment_method
        stepData.payment_notes = formData.payment_notes
        break
      case 'brand_inbound_setup':
        stepData.email_setup_type = formData.email_setup_type
        stepData.manager_email = formData.manager_email
        break
      case 'email_forwarding_video':
        stepData.email_forwarding_video_watched = formData.email_forwarding_video_watched
        break
      case 'instagram_bio_setup':
        stepData.instagram_bio_setup = formData.instagram_bio_setup
        break
      case 'uk_events_chat':
        stepData.uk_events_chat_joined = formData.uk_events_chat_joined
        break
    }

    try {
      await fetch('/api/influencer/onboarding/signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_key: stepKey,
          data: stepData
        })
      })
    } catch (error) {
      console.error('Error saving step:', error)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      // Save final step
      await saveStep()

      // Save brand preferences if selected
      if (formData.selected_brands.length > 0) {
        await fetch('/api/influencer/onboarding/signed/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_ids: formData.selected_brands
          })
        })
      }

      // Save collaborations (already saved in step data, no need to save separately)

      // Mark onboarding as complete
      const response = await fetch('/api/influencer/onboarding/signed/complete', {
        method: 'POST'
      })

      if (response.ok) {
        setIsCompleted(true)
        setTimeout(() => {
          router.push('/influencer/campaigns')
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Onboarding completion error:', errorData)
        throw new Error(errorData.error || `Failed to complete onboarding: ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      const errorMessage = error.message || 'Failed to complete onboarding. Please try again.'
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (!currentStepData) return false
    const stepKey = currentStepData.id
    
    switch (stepKey) {
      case 'welcome_video':
        return formData.welcome_video_watched
      case 'social_goals':
        return formData.social_goals.trim() !== ''
      case 'brand_selection':
        return formData.selected_brands.length > 0
      case 'previous_collaborations':
        return true // Optional step
      case 'payment_information':
        return true // Optional step
      case 'brand_inbound_setup':
        return formData.email_setup_type !== '' && 
               (formData.email_setup_type === 'email_forwarding' || formData.manager_email.trim() !== '')
      case 'email_forwarding_video':
        return formData.email_forwarding_video_watched || formData.email_setup_type === 'manager_email'
      case 'instagram_bio_setup':
        return formData.instagram_bio_setup !== ''
      case 'uk_events_chat':
        return formData.uk_events_chat_joined
      case 'expectations':
        return true // Read-only step
      default:
        return false
    }
  }

  const renderStepContent = () => {
    if (!currentStepData) return null

    switch (currentStepData.type) {
      case 'video':
        if (currentStepData.id === 'welcome_video') {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                  <iframe
                    src={`${ONBOARDING_VIDEOS.WELCOME_VIDEO}?rel=0&modestbranding=1&enablejsapi=1${origin ? `&origin=${origin}` : ''}`}
                    title="Welcome to Stride Talent"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, welcome_video_watched: true }))}
                  className="px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  I've watched the video
                </button>
              </div>
            </motion.div>
          )
        } else {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                  <iframe
                    src={`${ONBOARDING_VIDEOS.EMAIL_FORWARDING_VIDEO}?rel=0&modestbranding=1&enablejsapi=1${origin ? `&origin=${origin}` : ''}`}
                    title="Email Forwarding Setup"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                    loading="lazy"
                  />
                </div>
              </div>
              {formData.email_setup_type === 'email_forwarding' && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, email_forwarding_video_watched: true }))}
                    className="px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    I've watched the video
                  </button>
                </div>
              )}
            </motion.div>
          )
        }

      case 'textarea':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <textarea
              value={formData.social_goals}
              onChange={(e) => setFormData(prev => ({ ...prev, social_goals: e.target.value }))}
              placeholder="Tell us about your social media goals..."
              className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 
                focus:bg-white/20 transition-all duration-300 backdrop-blur-sm min-h-[200px]"
              autoFocus
            />
          </motion.div>
        )

      case 'brand_selection':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
              {brands.map(brand => {
                const isSelected = formData.selected_brands.includes(brand.id)
                return (
                  <motion.button
                    key={brand.id}
                    onClick={() => {
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          selected_brands: prev.selected_brands.filter(id => id !== brand.id)
                        }))
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          selected_brands: [...prev.selected_brands, brand.id]
                        }))
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-white text-gray-800 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <Check className="w-5 h-5" />
                      )}
                      <div>
                        <span className={`font-medium ${isSelected ? 'text-gray-800' : 'text-white'}`}>
                          {brand.company_name}
                        </span>
                        {brand.industry && (
                          <p className={`text-sm mt-1 ${isSelected ? 'text-gray-600' : 'text-white'}`}>
                            {brand.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
            <p className="text-white text-sm text-center">
              Selected: {formData.selected_brands.length} {formData.selected_brands.length === 1 ? 'brand' : 'brands'}
            </p>
          </motion.div>
        )

      case 'collaborations':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Brand name"
                  value={collaborationForm.brand_name}
                  onChange={(e) => setCollaborationForm(prev => ({ ...prev, brand_name: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
                <input
                  type="text"
                  placeholder="Collaboration type"
                  value={collaborationForm.collaboration_type}
                  onChange={(e) => setCollaborationForm(prev => ({ ...prev, collaboration_type: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
                <input
                  type="text"
                  placeholder="Date range"
                  value={collaborationForm.date_range}
                  onChange={(e) => setCollaborationForm(prev => ({ ...prev, date_range: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={collaborationForm.notes}
                  onChange={(e) => setCollaborationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={() => {
                  if (collaborationForm.brand_name.trim()) {
                    setFormData(prev => ({
                      ...prev,
                      collaborations: [...prev.collaborations, { ...collaborationForm }]
                    }))
                    setCollaborationForm({
                      brand_name: '',
                      collaboration_type: '',
                      date_range: '',
                      notes: ''
                    })
                  }
                }}
                className="w-full px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Collaboration
              </button>
            </div>
            
            {formData.collaborations.length > 0 && (
              <div className="space-y-2">
                {formData.collaborations.map((collab, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{collab.brand_name}</p>
                      {collab.collaboration_type && (
                        <p className="text-white text-sm">{collab.collaboration_type}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          collaborations: prev.collaborations.filter((_, i) => i !== index)
                        }))
                      }}
                      className="text-red-300 hover:text-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-white text-sm text-center">
              Add any previous brand collaborations (optional)
            </p>
          </motion.div>
        )

      case 'payment':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Previous payment amount"
                  value={formData.previous_payment_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, previous_payment_amount: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm appearance-none"
                >
                  <option value="GBP" className="bg-gray-800 text-white">GBP</option>
                  <option value="USD" className="bg-gray-800 text-white">USD</option>
                  <option value="EUR" className="bg-gray-800 text-white">EUR</option>
                </select>
                <input
                  type="text"
                  placeholder="Payment method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={formData.payment_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_notes: e.target.value }))}
                className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-cyan-200 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm min-h-[100px]"
              />
            </div>
            <p className="text-white text-sm text-center">
              Share your previous payment information (optional)
            </p>
          </motion.div>
        )

      case 'email_setup':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 space-y-4">
              <label className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="email_setup"
                  value="email_forwarding"
                  checked={formData.email_setup_type === 'email_forwarding'}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_setup_type: e.target.value as 'email_forwarding' }))}
                  className="w-5 h-5 text-white"
                />
                <span className="ml-3 text-white font-medium text-lg">Email forwarding</span>
              </label>
              <label className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="email_setup"
                  value="manager_email"
                  checked={formData.email_setup_type === 'manager_email'}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_setup_type: e.target.value as 'manager_email' }))}
                  className="w-5 h-5 text-white"
                />
                <span className="ml-3 text-white font-medium text-lg">Manager email</span>
              </label>
              {formData.email_setup_type === 'manager_email' && (
                <input
                  type="email"
                  placeholder="Manager email address"
                  value={formData.manager_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_email: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              )}
            </div>
          </motion.div>
        )

      case 'instagram_bio':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 space-y-4">
              <label className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="instagram_bio"
                  value="done"
                  checked={formData.instagram_bio_setup === 'done'}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_bio_setup: e.target.value as 'done' }))}
                  className="w-5 h-5 text-white"
                />
                <span className="ml-3 text-white font-medium text-lg">I've already done this</span>
              </label>
              <label className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="instagram_bio"
                  value="will_do"
                  checked={formData.instagram_bio_setup === 'will_do'}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_bio_setup: e.target.value as 'will_do' }))}
                  className="w-5 h-5 text-white"
                />
                <span className="ml-3 text-white font-medium text-lg">I'll do this now</span>
              </label>
            </div>
          </motion.div>
        )

      case 'whatsapp_link':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 text-center">
              <MessageCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-white text-lg mb-4">Join our UK events WhatsApp group</p>
              <a
                href={UK_EVENTS_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setFormData(prev => ({ ...prev, uk_events_chat_joined: true }))}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Join WhatsApp Group
              </a>
            </div>
            <p className="text-white text-sm text-center">
              Click the link above to join the group
            </p>
          </motion.div>
        )

      case 'expectations':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/20 space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">{EXPECTATIONS_CONTENT.title}</h3>
              {EXPECTATIONS_CONTENT.sections.map((section, index) => (
                <div key={index} className="border-l-4 border-white/50 pl-4">
                  <h4 className="text-xl font-semibold text-white mb-2">{section.title}</h4>
                  <p className="text-white">{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Success screen
  if (isCompleted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-gray-800" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Onboarding Complete! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-white mb-8"
          >
            Welcome to Stride Social! Your onboarding is complete.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-block px-8 py-4 bg-white text-gray-800 rounded-2xl font-semibold text-lg"
          >
            Redirecting to Dashboard...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (isLoadingProgress) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
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
            <div className="text-white text-sm font-medium mb-2">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center"
          >
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-white/50 cursor-not-allowed'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                canProceed() && !isLoading
                  ? 'bg-white text-gray-800 hover:bg-gray-50 shadow-lg'
                  : 'bg-white/20 text-white/70 cursor-not-allowed backdrop-blur-sm border border-white/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <>
                  {currentStep === STEPS.length - 1 ? 'Complete Onboarding' : 'Continue'}
                  {currentStep !== STEPS.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SignedOnboardingPage() {
  return (
    <InfluencerProtectedRoute>
      <SignedOnboardingPageContent />
    </InfluencerProtectedRoute>
  )
}

