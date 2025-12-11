'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

function SignedCheckPageContent() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null)

  const handleSubmit = async () => {
    if (!selected) return

    setIsLoading(true)

    try {
      // Update Clerk metadata with the role
      const role = selected === 'yes' ? 'INFLUENCER_SIGNED' : 'INFLUENCER_PARTNERED'
      
      // Call API to update Clerk metadata
      const response = await fetch('/api/influencer/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      // Redirect to appropriate onboarding
      if (selected === 'yes') {
        router.push('/influencer/onboarding/signed')
      } else {
        router.push('/influencer/onboarding')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to save your selection. Please try again.',
        variant: 'destructive'
      })
      setIsLoading(false)
    }
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

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="text-cyan-200 text-sm font-medium mb-2">
              Quick Question
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Are you a signed influencer to Stride Social?
            </h1>
            <p className="text-cyan-200 text-lg">
              This helps us show you the right onboarding process
            </p>
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <button
              onClick={() => setSelected('yes')}
              className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                selected === 'yes'
                  ? 'bg-white/20 border-white backdrop-blur-sm'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected === 'yes'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {selected === 'yes' && (
                      <CheckCircle className="w-4 h-4 text-cyan-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xl font-semibold">Yes</div>
                    <div className="text-cyan-200 text-sm">I am a signed influencer</div>
                  </div>
                </div>
                {selected === 'yes' && (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
            </button>

            <button
              onClick={() => setSelected('no')}
              className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                selected === 'no'
                  ? 'bg-white/20 border-white backdrop-blur-sm'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected === 'no'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {selected === 'no' && (
                      <XCircle className="w-4 h-4 text-cyan-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xl font-semibold">No</div>
                    <div className="text-cyan-200 text-sm">I am a partnered influencer</div>
                  </div>
                </div>
                {selected === 'no' && (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
            </button>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSubmit}
              disabled={!selected || isLoading}
              className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                selected && !isLoading
                  ? 'bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg'
                  : 'bg-white/20 text-white/70 cursor-not-allowed backdrop-blur-sm border border-white/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SignedCheckPage() {
  return <SignedCheckPageContent />
}

