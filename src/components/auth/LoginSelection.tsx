'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SignIn } from '@clerk/nextjs'
import { Settings } from 'lucide-react'

type LoginMode = 'selection' | 'brand' | 'influencer' | 'staff'

export default function LoginSelection() {
  const [mode, setMode] = useState<LoginMode>('selection')

  const handleStaffAccess = () => {
    setMode('staff')
  }

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 LoginSelection mode changed:', mode)
  }, [mode])

  // Removed plaintext staff access code. Clicking the button reveals a staff-themed sign-in.

  // Custom Clerk appearance for staff login
  const staffAppearance = {
    variables: {
      colorPrimary: '#1F2937',  // Tailwind slate-800
      colorText: '#111827',
      fontSize: '16px',
      borderRadius: '10px',
    },
    elements: {
      card: 'shadow-xl px-6 py-8 border border-gray-200',
      headerTitle: 'text-xl font-semibold text-center',
      headerSubtitle: 'text-sm text-gray-500 text-center mb-4',
      formFieldLabel: 'text-sm font-medium text-gray-700',
      formFieldInput: 'h-10 px-4 border-gray-300 focus:ring-2 focus:ring-slate-500 rounded-md text-sm',
      footerAction: 'text-sm text-gray-400',
      button: 'bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm h-10 rounded-md',
      logoBox: 'mb-2',
    },
  }

  // Get background image and text colors based on mode
  const getBackgroundStyle = (mode: LoginMode) => {
    switch (mode) {
      case 'brand':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      case 'influencer':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      case 'staff':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      default:
        return undefined
    }
  }

  // Get text colors based on mode
  const getTextColors = (mode: LoginMode) => {
    switch (mode) {
      case 'brand':
        return {
          title: 'text-white',
          subtitle: 'text-blue-200',
          description: 'text-blue-100',
          backButton: 'text-blue-200 hover:text-white'
        }
      case 'influencer':
        return {
          title: 'text-white',
          subtitle: 'text-cyan-200',
          description: 'text-cyan-100',
          backButton: 'text-cyan-200 hover:text-white'
        }
      case 'staff':
        return {
          title: 'text-white',
          subtitle: 'text-cyan-200',
          description: 'text-cyan-100',
          backButton: 'text-cyan-200 hover:text-white'
        }
      default:
        return {
          title: 'text-gray-900',
          subtitle: 'text-gray-500',
          description: 'text-gray-600',
          backButton: 'text-gray-500 hover:text-gray-700'
        }
    }
  }

  const backgroundStyle = getBackgroundStyle(mode)
  const textColors = getTextColors(mode)

  if (mode === 'brand' || mode === 'influencer' || mode === 'staff') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full flex items-center justify-center relative"
        style={backgroundStyle}
      >
        {/* Background overlay for all modes */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Centered login container */}
        <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center">
          {/* Header */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`font-bold text-xl mb-1 ${textColors.title}`}>
                {mode === 'brand' && 'Stride Social'}
                {mode === 'influencer' && 'Stride Social'}
                {mode === 'staff' && 'Stride Social'}
              </h1>
              
              <div className={`text-xs uppercase tracking-wider font-medium mb-2 ${textColors.subtitle}`}>
                {mode === 'brand' && 'Brand Portal'}
                {mode === 'influencer' && 'Creator Portal'}
                {mode === 'staff' && 'Team Portal'}
              </div>
              
              <p className={`text-xs ${textColors.description}`}>
                {mode === 'brand' && 'Access your influencer dashboard'}
                {mode === 'influencer' && 'Connect and manage your campaigns'}
                {mode === 'staff' && 'Sign in to access staff tools'}
              </p>
            </motion.div>
          </div>
          
          {/* Clerk Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full flex justify-center"
          >
            <div className="w-full max-w-md">
              <SignIn 
                routing="hash"
                appearance={mode === 'staff' ? staffAppearance : {
                  elements: {
                    formButtonPrimary: mode === 'brand' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-sm normal-case'
                      : 'bg-purple-600 hover:bg-purple-700 text-sm normal-case'
                  }
                }}
                afterSignInUrl={
                  mode === 'staff' ? '/staff/roster' : 
                  mode === 'brand' ? '/brand/influencers' : 
                  mode === 'influencer' ? '/influencer/campaigns' : 
                  '/'
                }
              />
            </div>
          </motion.div>
          
          {/* Back Button - Outside card with proper spacing */}
          <div className="mt-8">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMode('selection')}
              className={`text-xs transition-colors ${textColors.backButton}`}
            >
              ← Back to selection
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Removed intermediate staff access modal; gear button now opens staff SignIn directly

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand Section - Left/Top */}
      <motion.div
        className="flex-1 relative overflow-hidden cursor-pointer group"
        onClick={() => setMode('brand')}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0">
          <img 
            src="https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/images/business.png"
            alt="Business background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 h-full min-h-[50vh] lg:min-h-screen flex items-center justify-center p-8">
          <div className="text-center text-white">
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              BRANDS
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover & Connect with Influencers
            </motion.p>
            <motion.div
              className="mt-8 inline-block px-6 py-3 border-2 border-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Access Brand Portal
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Influencer Section - Right/Bottom */}
      <motion.div
        className="flex-1 relative overflow-hidden cursor-pointer group"
        onClick={() => setMode('influencer')}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0">
          <img 
            src="https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/images/influencer.jpg"
            alt="Influencer background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 h-full min-h-[50vh] lg:min-h-screen flex items-center justify-center p-8">
          <div className="text-center text-white">
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              INFLUENCERS
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Manage Campaigns & Track Performance
            </motion.p>
            <motion.div
              className="mt-8 inline-block px-6 py-3 border-2 border-white rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Access Creator Portal
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hidden Staff Access - Bottom Right */}
      <motion.button
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 shadow-lg z-50"
        onClick={handleStaffAccess}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Team Access"
      >
        <Settings size={20} />
      </motion.button>
    </div>
  )
} 