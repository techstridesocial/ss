'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SignIn } from '@clerk/nextjs'
import { Settings } from 'lucide-react'

type LoginMode = 'selection' | 'brand' | 'influencer' | 'staff'

export default function LoginSelection() {
  const [mode, setMode] = useState<LoginMode>('selection')
  const [showStaffAccess, setShowStaffAccess] = useState(false)
  const [staffCode, setStaffCode] = useState('')

  const handleStaffAccess = () => {
    setShowStaffAccess(true)
  }

  const handleStaffCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple access code check (in production, this would be more secure)
    if (staffCode === 'stride2024' || staffCode === 'admin') {
      setMode('staff')
    } else {
      alert('Invalid access code')
      setStaffCode('')
    }
  }

  if (mode === 'brand' || mode === 'influencer' || mode === 'staff') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'brand' && 'Welcome, Brand'}
              {mode === 'influencer' && 'Welcome, Influencer'}
              {mode === 'staff' && 'Team Access'}
            </h1>
            <p className="text-gray-600 mt-2">
              {mode === 'brand' && 'Access your influencer dashboard'}
              {mode === 'influencer' && 'Connect and manage your campaigns'}
              {mode === 'staff' && 'Staff & Admin Portal'}
            </p>
          </div>
          
          <SignIn 
            routing="hash"
            appearance={{
              elements: {
                formButtonPrimary: mode === 'brand' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-sm normal-case'
                  : mode === 'influencer'
                  ? 'bg-purple-600 hover:bg-purple-700 text-sm normal-case'
                  : 'bg-gray-600 hover:bg-gray-700 text-sm normal-case'
              }
            }}
            afterSignInUrl="/dashboard"
          />
          
          <button
            onClick={() => setMode('selection')}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to selection
          </button>
        </div>
      </motion.div>
    )
  }

  if (showStaffAccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-900 p-4"
      >
        <div className="w-full max-w-sm bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold text-center mb-6">Team Access</h2>
          <form onSubmit={handleStaffCodeSubmit}>
            <input
              type="password"
              placeholder="Enter access code"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Access
            </button>
          </form>
          <button
            onClick={() => setShowStaffAccess(false)}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand Section - Left/Top */}
      <motion.div
        className="flex-1 relative overflow-hidden cursor-pointer group"
        onClick={() => setMode('brand')}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          {/* Background pattern or image would go here */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600">
          {/* Background pattern or image would go here */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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