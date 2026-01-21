'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { InfluencerProtectedRoute } from '../../../../components/auth/ProtectedRoute'
import { useToast } from '@/components/ui/use-toast'
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
  Trash2,
  RefreshCw
} from 'lucide-react'
import { ONBOARDING_VIDEOS, UK_EVENTS_WHATSAPP_LINK, EXPECTATIONS_CONTENT } from '@/constants/onboarding'
import { SignedOnboardingData } from '@/types/onboarding'
import { 
  extractStepData, 
  canProceedToNextStep, 
  saveProgressBackup, 
  loadProgressBackup,
  clearProgressBackup
} from '@/lib/utils/onboarding-helpers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const STEPS = [
  { id: 'welcome_video', title: 'Welcome to Stride Talent', type: 'video' },
  { id: 'personal_info', title: 'Tell us your name', type: 'personal_info' },
  { id: 'social_goals', title: 'What are your social media goals?', type: 'textarea' },
  { id: 'social_handles', title: 'Your social media handles (Optional)', type: 'social_handles' },
  { id: 'brand_selection', title: 'Brands you\'d like to work with', type: 'brand_text' },
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
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
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
    first_name: '',
    last_name: '',
    social_goals: '',
    instagram_handle: '',
    tiktok_handle: '',
    youtube_handle: '',
    preferred_brands: '',
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
  }, [])

  const loadOnboardingProgress = async () => {
    try {
      setIsLoadingProgress(true)
      
      // Try loading from localStorage first (instant)
      const backup = loadProgressBackup()
      if (backup) {
        setFormData(prev => ({ ...prev, ...backup.formData }))
        setCurrentStep(backup.currentStep)
      }
      
      // Then load from server (authoritative)
      const response = await fetch('/api/influencer/onboarding/signed')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const progress = result.data
          
          // Batch all form updates into a single state update (performance fix)
          if (progress.steps) {
            const allStepData = progress.steps.reduce((acc: any, step: any) => {
              if (step.data) {
                return { ...acc, ...step.data }
              }
              return acc
            }, {})
            
            setFormData(prev => ({ ...prev, ...allStepData }))
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
      // If server fails, localStorage backup keeps the user's work safe
      toast({
        title: 'Connection Issue',
        description: 'Using local backup. Your progress is safe.',
        variant: 'default'
      })
    } finally {
      setIsLoadingProgress(false)
    }
  }


  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = async () => {
    // Save current step to localStorage first
    saveProgressBackup(formData, currentStep)
    
    const isLastStep = currentStep === STEPS.length - 1
    
    if (isLastStep) {
      // Last step - complete onboarding (this must wait)
      await handleComplete()
    } else {
      // Move to next step immediately (optimistic UI)
      setCurrentStep(prev => prev + 1)
      
      // Save in background with retry
      saveStepWithRetry().catch(() => {
        // Error already handled by saveStepWithRetry
      })
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
      case 'personal_info':
        stepData.first_name = formData.first_name
        stepData.last_name = formData.last_name
        break
      case 'social_goals':
        stepData.social_goals = formData.social_goals
        break
      case 'social_handles':
        stepData.instagram_handle = formData.instagram_handle
        stepData.tiktok_handle = formData.tiktok_handle
        stepData.youtube_handle = formData.youtube_handle
        break
      case 'brand_selection':
        stepData.preferred_brands = formData.preferred_brands
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
      case 'expectations':
        // Expectations is read-only, just mark as viewed/completed
        stepData.viewed = true
        break
    }

    // Save to localStorage immediately (instant backup)
    saveProgressBackup(formData, currentStep)
    
    try {
      const requestBody = {
        step_key: stepKey,
        data: stepData
      }
      
      // Use AbortController for timeout (5 seconds max)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/influencer/onboarding/signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save step' }))
        console.error('Failed to save step:', stepKey, errorData)
        throw new Error(errorData.error || `Failed to save step: ${response.status}`)
      }
      
      // Success - silently complete
      await response.json().catch(() => {})
    } catch (error: any) {
      // Log errors but don't show toast for background saves
      if (error.name === 'AbortError') {
        console.warn('Save timeout for step:', stepKey)
      } else {
        console.error('Error saving step:', stepKey, error?.message)
      }
      throw error
    }
  }
  
  // Retry mechanism with exponential backoff
  const saveStepWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await saveStep()
        return true // Success
      } catch (error) {
        if (attempt === maxRetries) {
          // Last attempt failed
          toast({
            title: 'Save Failed',
            description: 'Your progress is backed up locally. Try again when online.',
            variant: 'destructive',
            action: {
              label: 'Retry',
              onClick: () => saveStepWithRetry(1)
            }
          } as any)
          return false
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    return false
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      // Save ALL steps using shared helper (no duplication!)
      const stepsToSave = STEPS.map(step => ({
        stepKey: step.id,
        stepData: extractStepData(step.id, formData)
      }))
      
      // Save all steps
      const saveResults = await Promise.allSettled(
        stepsToSave.map(({ stepKey, stepData }) =>
          fetch('/api/influencer/onboarding/signed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step_key: stepKey, data: stepData })
          }).then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Unknown error')
              throw new Error(`Step ${stepKey}: ${response.status}`)
            }
            return response.json()
          })
        )
      )

      // Check for failures
      const failures = saveResults.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.warn('Some steps had issues:', failures.length)
        // Continue anyway - server will auto-complete missing steps
      }

      // Mark onboarding as complete (server handles all data in transaction)
      const response = await fetch('/api/influencer/onboarding/signed/complete', {
        method: 'POST'
      })

      if (response.ok) {
        // Clear localStorage backup on successful completion
        clearProgressBackup()
        setIsCompleted(true)
        setTimeout(() => {
          router.push('/influencer/campaigns')
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Completion failed')
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Use shared helper for validation (no duplication!)
  const canProceed = () => {
    if (!currentStepData) return false
    return canProceedToNextStep(currentStepData.id, formData)
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
                    src={`${ONBOARDING_VIDEOS.WELCOME_VIDEO}?rel=0&modestbranding=1&enablejsapi=1&playsinline=1${origin ? `&origin=${origin}` : ''}`}
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
                    src={`${ONBOARDING_VIDEOS.EMAIL_FORWARDING_VIDEO}?rel=0&modestbranding=1&enablejsapi=1&playsinline=1${origin ? `&origin=${origin}` : ''}`}
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

      case 'personal_info':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First Name"
                  className="w-full px-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/60 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last Name"
                  className="w-full px-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/60 text-lg focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
            <p className="text-white text-sm text-center">
              Please enter your full legal name as it should appear on contracts and payments
            </p>
          </motion.div>
        )

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

      case 'social_handles':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="text-white/80 text-base mb-6">
              Enter your social media handles below. You can verify and connect them later from your stats page.
              <span className="block mt-2 text-white/60 text-sm">All fields are optional - skip if you prefer to add them later.</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                  placeholder="yourusername (optional)"
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl 
                    text-white placeholder-white/50 text-base focus:outline-none focus:border-white/50 
                    focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-white/90 text-sm mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  TikTok Handle
                </label>
                <input
                  type="text"
                  value={formData.tiktok_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok_handle: e.target.value }))}
                  placeholder="yourusername (optional)"
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl 
                    text-white placeholder-white/50 text-base focus:outline-none focus:border-white/50 
                    focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-white/90 text-sm mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  YouTube Handle
                </label>
                <input
                  type="text"
                  value={formData.youtube_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_handle: e.target.value }))}
                  placeholder="yourusername (optional)"
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl 
                    text-white placeholder-white/50 text-base focus:outline-none focus:border-white/50 
                    focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
          </motion.div>
        )

      case 'brand_text':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <textarea
              value={formData.preferred_brands}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_brands: e.target.value }))}
              placeholder="Enter the names of brands you'd like to work with..."
              className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/50 
                focus:bg-white/20 transition-all duration-300 backdrop-blur-sm min-h-[200px]"
              autoFocus
            />
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
    <ErrorBoundary>
      <InfluencerProtectedRoute>
        <SignedOnboardingPageContent />
      </InfluencerProtectedRoute>
    </ErrorBoundary>
  )
}

