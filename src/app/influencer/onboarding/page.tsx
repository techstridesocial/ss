'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Upload,
  Eye,
  CheckCircle,
  Hash,
  Monitor
} from 'lucide-react'

// Platform and niche options
const PLATFORM_OPTIONS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TWITTER', label: 'Twitter' }
]

const NICHE_OPTIONS = [
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Health', label: 'Health' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Food', label: 'Food' },
  { value: 'Business', label: 'Business' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'UGC', label: 'UGC' },
  { value: 'Product Reviews', label: 'Product Reviews' },
  { value: 'Product Seeding', label: 'Product Seeding' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Music', label: 'Music' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Education', label: 'Education' },
  { value: 'Home', label: 'Home' },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Family', label: 'Family' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'AI', label: 'AI' },
  { value: 'Web', label: 'Web' }
]

interface OnboardingData {
  first_name: string
  last_name: string
  display_name: string
  email: string
  phone_number: string
  location: string
  website: string
  instagram_handle: string
  tiktok_handle: string
  youtube_handle: string
  main_platform: string
  niche: string
  profile_picture: string
}

const STEPS = [
  { id: 'first_name', title: "What's your first name?", type: 'text' },
  { id: 'last_name', title: "And your last name?", type: 'text' },
  { id: 'display_name', title: "What should we call you publicly?", type: 'text' },
  { id: 'email', title: "What's your email address?", type: 'email' },
  { id: 'phone_number', title: "What's your phone number?", type: 'tel' },
  { id: 'location', title: "Where are you based?", type: 'text' },
  { id: 'instagram_handle', title: "What's your Instagram handle?", type: 'text' },
  { id: 'tiktok_handle', title: "What's your TikTok handle?", type: 'text' },
  { id: 'youtube_handle', title: "What's your YouTube handle?", type: 'text' },
  { id: 'main_platform', title: "What's your main platform?", type: 'select' },
  { id: 'niche', title: "What's your main content niche?", type: 'select' },
  { id: 'website', title: "Do you have a website or portfolio?", type: 'url' },
  { id: 'profile_picture', title: "Upload your profile picture", type: 'upload' },
  { id: 'review', title: "Final step: review your details", type: 'review' }
]

function InfluencerOnboardingPageContent() {
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const [formData, setFormData] = useState<OnboardingData>({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    display_name: '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone_number: '',
    location: '',
    website: '',
    instagram_handle: '',
    tiktok_handle: '',
    youtube_handle: '',
    main_platform: '',
    niche: '',
    profile_picture: ''
  })

  // Auto-populate fields when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.firstName || prev.first_name,
        last_name: user.lastName || prev.last_name,
        display_name: prev.display_name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''),
        email: user.primaryEmailAddress?.emailAddress || prev.email
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
      const response = await fetch('/api/influencer/onboarding', {
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
        router.push('/influencer/campaigns')
      }, 3000)
    } catch (error) {
      console.error('Onboarding submission failed:', error)
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: string) => {
    // Special handling for phone number to enforce +country code format
    if (field === 'phone_number') {
      // Remove any non-digit characters except +
      let phoneValue = value.replace(/[^0-9\+]/g, '')
      // Ensure it starts with + if not empty
      if (phoneValue && !phoneValue.startsWith('+')) {
        phoneValue = '+' + phoneValue
      }
      setFormData(prev => ({ ...prev, [field]: phoneValue }))
    } else if (field === 'instagram_handle' || field === 'tiktok_handle' || field === 'youtube_handle') {
      // Remove @ symbol if user enters it
      const handleValue = value.replace('@', '')
      setFormData(prev => ({ ...prev, [field]: handleValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const canProceed = () => {
    if (!currentStepData) return false
    const field = currentStepData.id as keyof OnboardingData
    
    // Skip validation for optional fields
    if (['website', 'profile_picture'].includes(field)) {
      return true
    }
    
    // Special validation for phone number (must start with +)
    if (field === 'phone_number') {
      return formData[field]?.trim() !== '' && formData[field]?.startsWith('+')
    }
    
    // Special validation for email
    if (field === 'email') {
      return formData[field]?.trim() !== '' && formData[field]?.includes('@')
    }
    
    if (currentStepData.id === 'review') return true
    
    return formData[field]?.trim() !== ''
  }

  const renderStepContent = () => {
    if (!currentStepData) return null
    const field = currentStepData.id as keyof OnboardingData
    
        switch (currentStepData.type) {
      case 'text':
      case 'tel':
      case 'url':
      case 'email':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              {getFieldIcon(field)}
              <input
                type={currentStepData.type === 'tel' ? 'tel' : currentStepData.type === 'url' ? 'url' : currentStepData.type === 'email' ? 'email' : 'text'}
                value={formData[field]}
                onChange={(e) => updateFormData(field, e.target.value)}
                placeholder={getPlaceholder(field)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white placeholder-cyan-200 text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                autoFocus
                required={!['website'].includes(field)}
              />
            </div>
            
            {field === 'display_name' && (
              <p className="text-cyan-200 text-sm text-center">
                This is how your name will appear to brands and on your public profile
              </p>
            )}
            
            {field === 'email' && (
              <p className="text-cyan-200 text-sm text-center">
                This should be your primary email address for communications
              </p>
            )}
            
            {field === 'phone_number' && (
              <p className="text-cyan-200 text-sm text-center">
                Required format: +country code followed by number (e.g., +447712345678)
              </p>
            )}
           
            {field === 'location' && (
              <p className="text-cyan-200 text-sm text-center">
                Country or city (e.g., "London, UK" or "United States")
              </p>
            )}
            
            {(field === 'instagram_handle' || field === 'tiktok_handle' || field === 'youtube_handle') && (
              <p className="text-cyan-200 text-sm text-center">
                Enter your handle without the @ symbol (optional - can be added later)
              </p>
            )}
          </motion.div>
        )
        
      case 'select':
        const options = field === 'main_platform' ? PLATFORM_OPTIONS : NICHE_OPTIONS
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              {getFieldIcon(field)}
              <select
                value={formData[field]}
                onChange={(e) => updateFormData(field, e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl 
                  text-white text-lg focus:outline-none focus:border-white/50 
                  focus:bg-white/20 transition-all duration-300 backdrop-blur-sm appearance-none"
                autoFocus
              >
                <option value="" className="bg-gray-800 text-white">
                  {field === 'main_platform' ? 'Select your main platform' : 'Select your main niche'}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {field === 'main_platform' && (
              <p className="text-cyan-200 text-sm text-center">
                Choose the platform where you have the most followers or engagement
              </p>
            )}
            
            {field === 'niche' && (
              <p className="text-cyan-200 text-sm text-center">
                Select the category that best describes your primary content focus
              </p>
            )}
          </motion.div>
        )
      
             case 'upload':
         return (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
             <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center bg-white/10 backdrop-blur-sm">
               <Upload className="w-12 h-12 text-cyan-200 mx-auto mb-4" />
               <p className="text-cyan-200 mb-4">
                 Upload a professional photo (optional)
               </p>
               <div className="space-y-4">
                 <input
                   type="file"
                   accept="image/*"
                   className="hidden"
                   id="profile-upload"
                   onChange={(e) => {
                     const file = e.target.files?.[0]
                     if (file) {
                       // In a real app, you'd upload to Vercel Blob here
                       // For now, just store the filename
                       updateFormData('profile_picture', file.name)
                     }
                   }}
                 />
                 <label htmlFor="profile-upload">
                   <div className="inline-block px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 cursor-pointer transition-all duration-300 backdrop-blur-sm border border-white/20">
                     Choose Photo
                   </div>
                 </label>
                 
                 {formData.profile_picture && (
                   <p className="text-cyan-200 text-sm">
                     Selected: {formData.profile_picture}
                   </p>
                 )}
               </div>
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
                         <div className="bg-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-cyan-200 text-sm">Name</p>
                  <p className="text-white text-lg">{formData.first_name} {formData.last_name}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Display Name</p>
                  <p className="text-white text-lg">{formData.display_name}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Email</p>
                  <p className="text-white text-lg">{formData.email}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Phone</p>
                  <p className="text-white text-lg">{formData.phone_number}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Location</p>
                  <p className="text-white text-lg">{formData.location}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Main Platform</p>
                  <p className="text-white text-lg">{formData.main_platform}</p>
                </div>
                <div>
                  <p className="text-cyan-200 text-sm">Niche</p>
                  <p className="text-white text-lg">{formData.niche}</p>
                </div>
                {formData.instagram_handle && (
                  <div>
                    <p className="text-cyan-200 text-sm">Instagram</p>
                    <p className="text-white text-lg">@{formData.instagram_handle}</p>
                  </div>
                )}
                {formData.tiktok_handle && (
                  <div>
                    <p className="text-cyan-200 text-sm">TikTok</p>
                    <p className="text-white text-lg">@{formData.tiktok_handle}</p>
                  </div>
                )}
                {formData.youtube_handle && (
                  <div>
                    <p className="text-cyan-200 text-sm">YouTube</p>
                    <p className="text-white text-lg">@{formData.youtube_handle}</p>
                  </div>
                )}
                {formData.website && (
                  <div>
                    <p className="text-cyan-200 text-sm">Website</p>
                    <p className="text-white text-lg">{formData.website}</p>
                  </div>
                )}
              </div>
            </div>
           </motion.div>
         )
      
      default:
        return null
    }
  }

  const getPlaceholder = (field: keyof OnboardingData) => {
    switch (field) {
      case 'first_name': return 'Enter your first name'
      case 'last_name': return 'Enter your last name'
      case 'display_name': return 'e.g., Alex Thompson'
      case 'email': return 'your.email@example.com'
      case 'phone_number': return '+447712345678'
      case 'location': return 'e.g., London, UK'
      case 'instagram_handle': return 'yourusername (optional)'
      case 'tiktok_handle': return 'yourusername (optional)'
      case 'youtube_handle': return 'yourusername (optional)'
      case 'website': return 'https://yourwebsite.com (optional)'
      default: return ''
    }
  }

  const getFieldIcon = (field: keyof OnboardingData) => {
    switch (field) {
      case 'first_name':
      case 'last_name':
      case 'display_name':
        return <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'email':
        return <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'phone_number':
        return <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'location':
        return <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'website':
        return <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'instagram_handle':
      case 'tiktok_handle':
      case 'youtube_handle':
        return <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      case 'main_platform':
      case 'niche':
        return <Monitor className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
      default:
        return <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
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
        {/* Black Overlay */}
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
            <CheckCircle className="w-12 h-12 text-cyan-600" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Welcome to Stride Social! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-cyan-200 mb-8"
          >
            Your influencer profile is now live and ready to go.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-2xl font-semibold text-lg"
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
        backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
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
            <div className="text-cyan-200 text-sm font-medium mb-2">
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
                  ? 'text-cyan-300 cursor-not-allowed'
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
                  ? 'bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg'
                  : 'bg-white/20 text-white/70 cursor-not-allowed backdrop-blur-sm border border-white/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <>
                  {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
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

export default function InfluencerOnboardingPage() {
  return (
    <InfluencerProtectedRoute>
      <InfluencerOnboardingPageContent />
    </InfluencerProtectedRoute>
  )
} 