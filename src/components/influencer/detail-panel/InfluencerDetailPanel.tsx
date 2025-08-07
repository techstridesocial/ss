'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
import { InfluencerDetailPanelProps } from './types'

// Sections
import { OverviewSection } from './sections/OverviewSection'
import { AllContentSection } from './sections/AllContentSection'
import { PaidOrganicSection } from './sections/PaidOrganicSection'
import { ReelsSection } from './sections/ReelsSection'
import { StoriesSection } from './sections/StoriesSection'
import { AudienceSection } from './sections/AudienceSection'
import { ContentStrategySection } from './sections/ContentStrategySection'
import { PerformanceStatusSection } from './sections/PerformanceStatusSection'
import { BrandPartnershipsSection } from './sections/BrandPartnershipsSection'
import { HashtagStrategySection } from './sections/HashtagStrategySection'
import { ContentTopicsSection } from './sections/ContentTopicsSection'
import { AudienceInterestsSection } from './sections/AudienceInterestsSection'
import { LanguageBreakdownSection } from './sections/LanguageBreakdownSection'
import { AudienceOverlapSection } from './sections/AudienceOverlapSection'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

// Header component
const PanelHeader = ({ 
  influencer, 
  onClose 
}: { 
  influencer: any
  onClose: () => void 
}) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
    <div className="flex items-center space-x-4">
      <img
        src={influencer.profilePicture || '/default-avatar.svg'}
        alt={influencer.name || influencer.handle}
        className="w-12 h-12 rounded-full object-cover bg-gray-100"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/default-avatar.svg'
        }}
      />
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {influencer.name || influencer.handle}
        </h2>
        <p className="text-gray-500">@{influencer.handle}</p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Close panel"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
)

function InfluencerDetailPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  selectedPlatform,
  loading = false 
}: InfluencerDetailPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !influencer) return null

  // Get platform-specific data if available
  const currentPlatformData = selectedPlatform && influencer.platforms?.[selectedPlatform] 
    ? influencer.platforms[selectedPlatform] 
    : null

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <PanelHeader influencer={influencer} onClose={onClose} />

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <OverviewSection 
                    influencer={influencer} 
                    currentPlatformData={currentPlatformData} 
                  />
                  
                  <AllContentSection 
                    influencer={influencer} 
                    currentPlatformData={currentPlatformData} 
                  />
                  
                  <PaidOrganicSection influencer={influencer} />
                  
                  <ReelsSection influencer={influencer} />
                  
                  <StoriesSection influencer={influencer} />
                  
                          <AudienceSection influencer={influencer} />
        
        <ContentStrategySection influencer={influencer} />
        
        <PerformanceStatusSection influencer={influencer} />
        
        {/* New Modash API Sections */}
        <BrandPartnershipsSection influencer={influencer} />
        
        <HashtagStrategySection influencer={influencer} />
        
        <ContentTopicsSection influencer={influencer} />
        
        <AudienceInterestsSection influencer={influencer} />
        
        <LanguageBreakdownSection influencer={influencer} />
        
        <AudienceOverlapSection influencer={influencer} />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(panel, document.body)
}

export default InfluencerDetailPanel