'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
import { InfluencerDetailPanelProps, SocialContact, InfluencerData } from './types'
import SocialMediaIcons from '../SocialMediaIcons'
import { InstagramLogo, YouTubeLogo, TikTokLogo } from '../../icons/BrandLogos'

// Sections
import { PremiumOverviewSection } from './sections/PremiumOverviewSection'
import { PremiumContentSection } from './sections/PremiumContentSection'
import { PremiumProfileSection } from './sections/PremiumProfileSection'
import { PremiumInstagramMetricsSection } from './sections/PremiumInstagramMetricsSection'
import { PremiumAudienceSection } from './sections/PremiumAudienceSection'
import { PremiumAdvancedAudienceSection } from './sections/PremiumAdvancedAudienceSection'
import { PremiumBrandPartnershipsSection } from './sections/PremiumBrandPartnershipsSection'
import { PremiumAnalyticsSection } from './sections/PremiumAnalyticsSection'
import { PremiumSectionWrapper } from './components/PremiumSectionWrapper'
import { AllContentSection } from './sections/AllContentSection'
import { PaidOrganicSection } from './sections/PaidOrganicSection'
import { TikTokPaidOrganicSection } from './sections/TikTokPaidOrganicSection'
import { YouTubePaidOrganicSection } from './sections/YouTubePaidOrganicSection'

import { ContentStrategySection } from './sections/ContentStrategySection'

import { HashtagStrategySection } from './sections/HashtagStrategySection'
import { ContentTopicsSection } from './sections/ContentTopicsSection'







// Helper function to map contact types to our platform types
const mapContactToPlatform = (contactType: string): 'instagram' | 'tiktok' | 'youtube' | null => {
  const mapping: Record<string, 'instagram' | 'tiktok' | 'youtube'> = {
    'instagram': 'instagram',
    'tiktok': 'tiktok', 
    'youtube': 'youtube'
  }
  return mapping[contactType.toLowerCase()] || null
}

// Platform Analytics Switcher Component - Simple tabs like discovery page
const PlatformSwitcherTabs = memo(({ 
  currentPlatform, 
  onPlatformSwitch,
  influencer,
  loading = false
}: {
  currentPlatform?: 'instagram' | 'tiktok' | 'youtube'
  onPlatformSwitch: (platform: 'instagram' | 'tiktok' | 'youtube') => void
  influencer: InfluencerData
  loading?: boolean
}) => {
  const platformTabs = [
    { id: 'instagram' as const, name: 'Instagram', logo: <InstagramLogo /> },
    { id: 'tiktok' as const, name: 'TikTok', logo: <TikTokLogo /> },
    { id: 'youtube' as const, name: 'YouTube', logo: <YouTubeLogo /> }
  ]

  // Get platform-specific data from influencer
  const influencerPlatforms = influencer.platforms

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
      {platformTabs.map((platform) => {
        const isActive = currentPlatform === platform.id
        const hasData = influencerPlatforms?.[platform.id]
        
        return (
          <button
            key={platform.id}
            onClick={() => onPlatformSwitch(platform.id)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={hasData ? `View ${platform.name} analytics` : `Load ${platform.name} analytics`}
            aria-label={`Switch to ${platform.name} analytics${isActive ? ' (currently selected)' : ''}`}
            aria-pressed={isActive}
            role="tab"
            tabIndex={isActive ? 0 : -1}
          >
            <span>{platform.logo}</span>
            <span className="font-bold">{platform.name}</span>
            {loading && isActive && (
              <div className="ml-1 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!hasData && !isActive && !loading && (
              <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full" title="Click to load data"></span>
            )}
          </button>
        )
      })}
    </div>
  )
})

// Helper function to format follower counts
const formatFollowerCount = (count: number | string): string => {
  if (typeof count === 'string') return count
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toLocaleString()
}

// Loading component with skeleton UI for better UX
const LoadingSpinner = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="h-32 px-6 flex items-center border-b border-gray-100">
      <div className="h-24 w-24 bg-gray-300 rounded-2xl"></div>
      <div className="flex-1 ml-6">
        <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="flex space-x-6">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

// Premium Header component with dynamic platform metrics
const PanelHeader = ({ 
  influencer, 
  onClose,
  selectedPlatform,
  onPlatformSwitch,
  loading = false
}: { 
  influencer: InfluencerData
  onClose: () => void
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
  onPlatformSwitch?: (platform: 'instagram' | 'tiktok' | 'youtube') => void
  loading?: boolean
}) => {

  // Get display name with fallbacks
  const displayName = influencer.name || influencer.displayName || influencer.display_name ||
    influencer.handle || influencer.username || 'User'
  
  // Get platform-specific data for dynamic header metrics  
  const platforms = influencer.platforms
  const currentPlatformData = selectedPlatform && platforms?.[selectedPlatform]
    ? platforms[selectedPlatform]
    : null

  // Get platform-specific profile picture or fallback to general
  const pictureSrc = useMemo(() => {
    const platformProfilePicture = currentPlatformData?.profile_picture || currentPlatformData?.profilePicture
    return platformProfilePicture ||
      influencer.picture ||
      influencer.profilePicture ||
      influencer.profile_picture || ''
  }, [currentPlatformData, influencer.picture, influencer.profilePicture, influencer.profile_picture])



  // Use platform-specific metrics or fallback to general data
  const displayMetrics = {
    followers: currentPlatformData?.followers || influencer.followers,
    engagementRate: currentPlatformData?.engagementRate || influencer.engagementRate || influencer.engagement_rate,
    avgLikes: currentPlatformData?.avgLikes || influencer.avgLikes
  }

  // Add visual feedback for data source
  const isUsingPlatformData = !!currentPlatformData?.followers
  const isUsingPlatformImage = !!(currentPlatformData?.profile_picture || currentPlatformData?.profilePicture)
  const dataSource = isUsingPlatformData ? `${selectedPlatform} data` : 'general data'
  const visualFeedback = { isUsingPlatformData, isUsingPlatformImage, dataSource }

  // Force header re-render with key
  const headerKey = `${selectedPlatform}-${displayMetrics.followers}-${displayMetrics.engagementRate}-${pictureSrc}`

  return (
    <div className="bg-white border-b border-gray-100" key={headerKey}>
      {/* Premium Header Layout - Bigger Height for Larger Profile */}
      <div className="h-32 px-6 flex items-center">
        {/* Larger Square Profile Picture */}
        <div className="h-24 w-24 flex-shrink-0 mr-6">
          {loading ? (
            /* Loading skeleton for profile picture */
            <div className="relative h-full w-full">
              <div className="h-full w-full rounded-2xl bg-gray-200 animate-pulse shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              {/* Loading platform indicator */}
              {selectedPlatform && (
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                  selectedPlatform === 'instagram' ? 'bg-pink-500' :
                  selectedPlatform === 'tiktok' ? 'bg-gray-900' :
                  selectedPlatform === 'youtube' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ) : pictureSrc ? (
            <div className="relative h-full w-full">
              <img
                src={pictureSrc}
                alt={`${displayName}'s profile`}
                className={`h-full w-full object-cover rounded-2xl shadow-lg transition-all duration-300 ${
                  visualFeedback.isUsingPlatformImage 
                    ? `ring-2 ${
                        selectedPlatform === 'instagram' ? 'ring-pink-500' :
                        selectedPlatform === 'tiktok' ? 'ring-gray-900' :
                        selectedPlatform === 'youtube' ? 'ring-red-500' : 'ring-blue-500'
                      } ring-opacity-80` 
                    : 'ring-1 ring-gray-200'
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              {/* Platform indicator for profile image */}
              {visualFeedback.isUsingPlatformImage && selectedPlatform && (
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                  selectedPlatform === 'instagram' ? 'bg-pink-500' :
                  selectedPlatform === 'tiktok' ? 'bg-gray-900' :
                  selectedPlatform === 'youtube' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {influencer.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className={`h-full w-full rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
              selectedPlatform 
                ? `ring-2 ${
                    selectedPlatform === 'instagram' ? 'ring-pink-500' :
                    selectedPlatform === 'tiktok' ? 'ring-gray-900' :
                    selectedPlatform === 'youtube' ? 'ring-red-500' : 'ring-blue-500'
                  } ring-opacity-50` 
                : ''
            }`}>
              <span className="text-white font-semibold text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content Area - Name, Handle & Dynamic Metrics */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          {/* Name & Handle Row */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="min-w-0 flex-1">
              <h1 id="influencer-panel-title" className="text-2xl font-semibold text-gray-900 truncate leading-tight">
                {displayName}
              </h1>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                @{influencer.handle || influencer.username}
              </p>
            </div>
            {influencer.url && (
              <a
                href={influencer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="View profile on platform"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Dynamic Platform Metrics Row */}
          <div className="flex items-center space-x-6">
            {loading ? (
              /* Loading skeletons for metrics */
              <>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <span className="text-sm text-gray-500">followers</span>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <span className="text-sm text-gray-500">engagement</span>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                {selectedPlatform && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                      selectedPlatform === 'instagram' ? 'bg-pink-500' :
                      selectedPlatform === 'tiktok' ? 'bg-gray-900' :
                      selectedPlatform === 'youtube' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-blue-500 uppercase tracking-wider font-medium animate-pulse">
                      Loading {selectedPlatform} data...
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Normal metrics display */
              <>
                {displayMetrics.followers && (
                  <div className="flex items-center space-x-2 transition-all duration-300">
                    <span className={`text-lg font-semibold ${
                      visualFeedback.isUsingPlatformData ? 'text-gray-900' : 'text-gray-600'
                    } transition-colors duration-300`}>
                      {formatFollowerCount(displayMetrics.followers)}
                    </span>
                    <span className="text-sm text-gray-500">followers</span>
                    {visualFeedback.isUsingPlatformData && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
                {displayMetrics.engagementRate && (
                  <div className="flex items-center space-x-2 transition-all duration-300">
                    <span className={`text-lg font-semibold ${
                      visualFeedback.isUsingPlatformData ? 'text-gray-900' : 'text-gray-600'
                    } transition-colors duration-300`}>
                      {typeof displayMetrics.engagementRate === 'number' 
                        ? `${(displayMetrics.engagementRate * 100).toFixed(1)}%`
                        : displayMetrics.engagementRate}
                    </span>
                    <span className="text-sm text-gray-500">engagement</span>
                    {visualFeedback.isUsingPlatformData && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
                {selectedPlatform && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      selectedPlatform === 'instagram' ? 'bg-pink-500' :
                      selectedPlatform === 'tiktok' ? 'bg-gray-900' :
                      selectedPlatform === 'youtube' ? 'bg-red-500' : 'bg-gray-400'
                    } ${!visualFeedback.isUsingPlatformData ? 'opacity-50 animate-pulse' : 'shadow-sm'}`}></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {visualFeedback.dataSource}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 w-10 h-10 ml-4 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center group"
          aria-label="Close panel"
        >
          <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Social Media & Platform Tabs Section */}
      <div className="px-6 pb-5 space-y-4">
        {/* Connected Social Media Links */}
        {influencer.contacts && influencer.contacts.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wider">Connected Profiles</div>
            <SocialMediaIcons 
              contacts={influencer.contacts}
              size="sm"
            />
          </div>
        )}

        {/* Platform Analytics Switcher */}
        {onPlatformSwitch && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wider">Platform Analytics</div>
            <PlatformSwitcherTabs
              currentPlatform={selectedPlatform}
              onPlatformSwitch={onPlatformSwitch}
              influencer={influencer}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const InfluencerDetailPanel = memo(function InfluencerDetailPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  selectedPlatform,
  onPlatformSwitch,
  loading = false 
}: InfluencerDetailPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      
      // Focus management - focus first tab button for better accessibility
      setTimeout(() => {
        const firstTab = document.querySelector('[role="tab"]') as HTMLElement
        if (firstTab) {
          firstTab.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !influencer) return null

  // Get platform-specific data if available (guard against missing platforms type)
  const platforms = influencer.platforms
  const currentPlatformData = selectedPlatform && platforms?.[selectedPlatform]
    ? platforms[selectedPlatform]
    : null

  // DEBUG: Log data discrepancy for Charlie
  console.log('🔍 Platform Data Debug:', {
    selectedPlatform,
    influencerFollowers: influencer.followers,
    platformsAvailable: platforms ? Object.keys(platforms) : 'none',
    currentPlatformData: currentPlatformData,
    currentPlatformFollowers: currentPlatformData?.followers
  })

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-stretch justify-end"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="influencer-panel-title"
        >
          <motion.div
            initial={{ x: '100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white shadow-2xl w-full max-w-2xl lg:max-w-3xl h-screen overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <PanelHeader 
              influencer={influencer} 
              onClose={onClose} 
              selectedPlatform={selectedPlatform}
              onPlatformSwitch={onPlatformSwitch}
              loading={loading}
            />

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="min-h-full">
                  {/* Core Profile Section - Always visible */}
                  <div className="bg-gradient-to-b from-gray-50 to-white">
                    <PremiumOverviewSection 
                      influencer={influencer} 
                      currentPlatformData={currentPlatformData}
                      selectedPlatform={selectedPlatform}
                    />
                  </div>
                  
                  {/* Creator Profile Information */}
                  <PremiumProfileSection 
                    influencer={influencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Content Performance Sections */}
                  <div>
                    <PremiumContentSection
                      influencer={influencer}
                      selectedPlatform={selectedPlatform}
                      contentType="popular"
                    />
                    {/* Platform-specific paid/organic analysis */}
                    {selectedPlatform === 'tiktok' ? (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <TikTokPaidOrganicSection influencer={influencer} />
                      </PremiumSectionWrapper>
                    ) : selectedPlatform === 'youtube' ? (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <YouTubePaidOrganicSection influencer={influencer} />
                      </PremiumSectionWrapper>
                    ) : (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <PaidOrganicSection influencer={influencer} />
                      </PremiumSectionWrapper>
                    )}
                    
                    {/* Platform-specific content sections */}
                    
                    {selectedPlatform === 'tiktok' ? (
                      <>
                        {/* TikTok Premium Content Sections */}
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="videos"
                        />
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                      </>
                    ) : selectedPlatform === 'youtube' ? (
                      <>
                        {/* YouTube Premium Content Sections */}
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="videos"
                        />
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="popular"
                        />
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                      </>
                    ) : (
                      <>
                        {/* Instagram Premium Content Sections */}
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                        <PremiumContentSection
                          influencer={influencer}
                          selectedPlatform={selectedPlatform}
                          contentType="popular"
                        />
                      </>
                    )}
                  </div>
                  
                  {/* Instagram-Specific Performance Metrics */}
                  <PremiumInstagramMetricsSection 
                    influencer={influencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Audience Intelligence Section */}
                  <PremiumAudienceSection influencer={influencer} />
                  
                  {/* Advanced Audience Intelligence */}
                  <PremiumAdvancedAudienceSection influencer={influencer} />
                  
                  {/* Brand Partnerships & Strategy Sections */}
                  <PremiumBrandPartnershipsSection influencer={influencer} />
                  <PremiumSectionWrapper title="Content Strategy" defaultOpen={false}>
                    <ContentStrategySection influencer={influencer} />
                  </PremiumSectionWrapper>
                  <PremiumSectionWrapper title="Hashtag Strategy" defaultOpen={false}>
                    <HashtagStrategySection influencer={influencer} />
                  </PremiumSectionWrapper>
                  <PremiumSectionWrapper title="Content Topics" defaultOpen={false}>
                    <ContentTopicsSection influencer={influencer} />
                  </PremiumSectionWrapper>
                  
                  {/* Analytics & Growth Sections */}
                  <PremiumAnalyticsSection influencer={influencer} sectionType="performance" />
                  <PremiumAnalyticsSection influencer={influencer} sectionType="analytics" />
                  <PremiumAnalyticsSection influencer={influencer} sectionType="growth" />
                  <PremiumAnalyticsSection influencer={influencer} sectionType="insights" />
                  


                  
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
})

export default InfluencerDetailPanel