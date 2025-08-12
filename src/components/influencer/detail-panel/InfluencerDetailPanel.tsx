'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
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

import { ContentAnalyticsSection } from './sections/ContentAnalyticsSection'
import { HistoricalGrowthSection } from './sections/HistoricalGrowthSection'
import { RecentContentSection } from './sections/RecentContentSection'
import { CreatorInsightsSection } from './sections/CreatorInsightsSection'

import { ContactInfoSection } from './sections/ContactInfoSection'

// Helper function to format follower counts properly
const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  } else {
    return count.toString()
  }
}

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
}) => {
  const displayName =
    influencer.name || influencer.displayName || influencer.display_name ||
    influencer.handle || influencer.username || 'User'
  // Use only API-provided image fields. Do not replace with generated avatars.
  const pictureSrc =
    influencer.picture ||
    influencer.profilePicture ||
    influencer.profile_picture || ''

  return (
  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        <div className="relative">
          <img
            src={pictureSrc}
            alt={displayName}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-gray-100 ring-2 ring-gray-100"
          />
          {influencer.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate leading-tight">
              {displayName}
            </h1>
            {influencer.url && (
              <a
                href={influencer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="View profile on platform"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 truncate leading-tight mb-2">
            @{influencer.handle || influencer.username}
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
            {influencer.followers && (
              <span className="flex items-center">
                <span className="font-medium text-gray-900">
                  {formatFollowerCount(influencer.followers)}
                </span>
                <span className="ml-1 hidden sm:inline">followers</span>
                <span className="ml-1 sm:hidden">f</span>
              </span>
            )}
            {influencer.engagementRate && (
              <span className="flex items-center">
                <span className="font-medium text-gray-900">
                  {(influencer.engagementRate * 100).toFixed(1)}%
                </span>
                <span className="ml-1 hidden sm:inline">engagement</span>
                <span className="ml-1 sm:hidden">eng</span>
              </span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Close panel"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  </div>
)}

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

  // Get platform-specific data if available (guard against missing platforms type)
  const platformsAny: any = (influencer as any).platforms
  const currentPlatformData = selectedPlatform && platformsAny?.[selectedPlatform]
    ? platformsAny[selectedPlatform]
    : null

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-stretch justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white shadow-2xl w-full max-w-2xl lg:max-w-3xl h-screen overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <PanelHeader influencer={influencer} onClose={onClose} />

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="min-h-full">
                  {/* Core Profile Section - Always visible */}
                  <div className="bg-gradient-to-b from-gray-50 to-white">
                    <OverviewSection 
                      influencer={influencer} 
                      currentPlatformData={currentPlatformData} 
                    />
                    <ContactInfoSection contacts={influencer.contacts} />
                  </div>
                  
                  {/* Content Performance Section Group */}
                  <div className="bg-white">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Content Performance</h2>
                    </div>
                    <AllContentSection 
                      influencer={influencer} 
                      currentPlatformData={currentPlatformData} 
                    />
                    <PaidOrganicSection influencer={influencer} />
                    <ReelsSection influencer={influencer} />
                    <StoriesSection influencer={influencer} />
                    <RecentContentSection influencer={influencer} />
                  </div>
                  
                  {/* Audience Intelligence Section Group */}
                  <div className="bg-gray-50/50">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Audience Intelligence</h2>
                    </div>
                    <AudienceSection influencer={influencer} />
                    <AudienceInterestsSection influencer={influencer} />
                    <LanguageBreakdownSection influencer={influencer} />
                  </div>
                  
                  {/* Brand Partnerships & Strategy Section Group */}
                  <div className="bg-white">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Brand Partnerships & Strategy</h2>
                    </div>
                    <BrandPartnershipsSection influencer={influencer} />
                    <ContentStrategySection influencer={influencer} />
                    <HashtagStrategySection influencer={influencer} />
                    <ContentTopicsSection influencer={influencer} />
                  </div>
                  
                  {/* Analytics & Growth Section Group */}
                  <div className="bg-gray-50/50">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Analytics & Growth</h2>
                    </div>
                    <PerformanceStatusSection influencer={influencer} />
                    <ContentAnalyticsSection influencer={influencer} />
                    <HistoricalGrowthSection influencer={influencer} />
                    <CreatorInsightsSection influencer={influencer} />
                  </div>
                  
                  {/* 🔍 DEBUG: Temporary Data Check */}

                  
                  {/* Bottom spacing for better scrolling experience */}
                  <div className="h-8"></div>
                </div>
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