'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
import { InfluencerDetailPanelProps, SocialContact, InfluencerData } from './types'
import SocialMediaIcons from '../SocialMediaIcons'
import { InstagramLogo, YouTubeLogo, TikTokLogo } from '../../icons/BrandLogos'

// Sections
import { OverviewSection } from './sections/OverviewSection'
import { AllContentSection } from './sections/AllContentSection'
import { PaidOrganicSection } from './sections/PaidOrganicSection'
import { ReelsSection } from './sections/ReelsSection'
import { StoriesSection } from './sections/StoriesSection'
import { TikTokVideosSection } from './sections/TikTokVideosSection'
import { TikTokPaidOrganicSection } from './sections/TikTokPaidOrganicSection'
import { TikTokPostsSection } from './sections/TikTokPostsSection'
import { YouTubeVideosSection } from './sections/YouTubeVideosSection'
import { YouTubeShortsSection } from './sections/YouTubeShortsSection'
import { YouTubeStreamsSection } from './sections/YouTubeStreamsSection'
import { YouTubePaidOrganicSection } from './sections/YouTubePaidOrganicSection'
import { AudienceSection } from './sections/AudienceSection'
import { ContentStrategySection } from './sections/ContentStrategySection'
import { PerformanceStatusSection } from './sections/PerformanceStatusSection'
import { BrandPartnershipsSection } from './sections/BrandPartnershipsSection'
import { HashtagStrategySection } from './sections/HashtagStrategySection'
import { ContentTopicsSection } from './sections/ContentTopicsSection'
import { AudienceInterestsSection } from './sections/AudienceInterestsSection'
import { LanguageBreakdownSection } from './sections/LanguageBreakdownSection'

import { ContentAnalyticsSection } from './sections/ContentAnalyticsSection'
import { HistoricalGrowthSection } from './sections/HistoricalGrowthSectionWithCharts'
import { RecentContentSection } from './sections/RecentContentSection'
import { CreatorInsightsSection } from './sections/CreatorInsightsSection'




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
const PlatformSwitcherTabs = ({ 
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
  const platforms = [
    { id: 'instagram' as const, name: 'Instagram', logo: <InstagramLogo /> },
    { id: 'tiktok' as const, name: 'TikTok', logo: <TikTokLogo /> },
    { id: 'youtube' as const, name: 'YouTube', logo: <YouTubeLogo /> }
  ]

  // Show all 3 platforms always
  const platformsAny: any = (influencer as any).platforms

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
      {platforms.map((platform) => {
        const isActive = currentPlatform === platform.id
        const hasData = platformsAny?.[platform.id]
        
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
}

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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
  influencer: any
  onClose: () => void
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
  onPlatformSwitch?: (platform: 'instagram' | 'tiktok' | 'youtube') => void
  loading?: boolean
}) => {

  const displayName =
    influencer.name || influencer.displayName || influencer.display_name ||
    influencer.handle || influencer.username || 'User'
  
  // Get platform-specific data for dynamic header metrics
  const platformsAny: any = (influencer as any).platforms
  const currentPlatformData = selectedPlatform && platformsAny?.[selectedPlatform]
    ? platformsAny[selectedPlatform]
    : null

  // Get platform-specific profile picture or fallback to general
  const platformProfilePicture = currentPlatformData?.profile_picture || currentPlatformData?.profilePicture
  const pictureSrc = platformProfilePicture ||
    influencer.picture ||
    influencer.profilePicture ||
    influencer.profile_picture || ''



  // Use platform-specific metrics or fallback to general data
  const displayFollowers = currentPlatformData?.followers || influencer.followers
  const displayEngagementRate = currentPlatformData?.engagementRate || influencer.engagementRate || influencer.engagement_rate
  const displayAvgLikes = currentPlatformData?.avgLikes || influencer.avgLikes

  // Add visual feedback for data source
  const isUsingPlatformData = !!currentPlatformData?.followers
  const isUsingPlatformImage = !!platformProfilePicture
  const dataSource = isUsingPlatformData ? `${selectedPlatform} data` : 'general data'

  // Force header re-render with key
  const headerKey = `${selectedPlatform}-${displayFollowers}-${displayEngagementRate}-${pictureSrc}`

  return (
    <div className="bg-white border-b border-gray-100" key={headerKey}>
      {/* Premium Header Layout - Bigger Height for Larger Profile */}
      <div className="h-32 px-6 flex items-center">
        {/* Larger Square Profile Picture */}
        <div className="h-24 w-24 flex-shrink-0 mr-6">
          {pictureSrc ? (
            <div className="relative h-full w-full">
              <img
                src={pictureSrc}
                alt={`${displayName}'s profile`}
                className={`h-full w-full object-cover rounded-2xl shadow-lg transition-all duration-300 ${
                  isUsingPlatformImage 
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
              {isUsingPlatformImage && selectedPlatform && (
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
              <h1 className="text-2xl font-semibold text-gray-900 truncate leading-tight">
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
            {displayFollowers && (
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className={`text-lg font-semibold ${
                  isUsingPlatformData ? 'text-gray-900' : 'text-gray-600'
                } transition-colors duration-300`}>
                  {formatFollowerCount(displayFollowers)}
                </span>
                <span className="text-sm text-gray-500">followers</span>
                {isUsingPlatformData && (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
            {displayEngagementRate && (
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className={`text-lg font-semibold ${
                  isUsingPlatformData ? 'text-gray-900' : 'text-gray-600'
                } transition-colors duration-300`}>
                  {typeof displayEngagementRate === 'number' 
                    ? `${(displayEngagementRate * 100).toFixed(1)}%`
                    : displayEngagementRate}
                </span>
                <span className="text-sm text-gray-500">engagement</span>
                {isUsingPlatformData && (
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
                } ${!isUsingPlatformData ? 'opacity-50 animate-pulse' : 'shadow-sm'}`}></div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  {dataSource}
                </span>
                {!isUsingPlatformData && loading && (
                  <div className="text-xs text-orange-500 font-medium animate-pulse">
                    Loading...
                  </div>
                )}
              </div>
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

function InfluencerDetailPanel({ 
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

  // DEBUG: Log data discrepancy for Charlie
  console.log('🔍 Platform Data Debug:', {
    selectedPlatform,
    influencerFollowers: influencer.followers,
    platformsAvailable: platformsAny ? Object.keys(platformsAny) : 'none',
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
                    <OverviewSection 
                      influencer={influencer} 
                      currentPlatformData={currentPlatformData}
                      selectedPlatform={selectedPlatform}
                    />
                  </div>
                  
                  {/* Content Performance Section Group */}
                  <div className="bg-white">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                        Content Performance
                        {selectedPlatform && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            {selectedPlatform.toUpperCase()}
                          </span>
                        )}
                      </h2>
                    </div>
                    <AllContentSection 
                      influencer={influencer} 
                      currentPlatformData={currentPlatformData} 
                    />
                    {/* Platform-specific paid/organic analysis */}
                    {selectedPlatform === 'tiktok' ? (
                      <TikTokPaidOrganicSection influencer={influencer} />
                    ) : selectedPlatform === 'youtube' ? (
                      <YouTubePaidOrganicSection influencer={influencer} />
                    ) : (
                      <PaidOrganicSection influencer={influencer} />
                    )}
                    
                    {/* Platform-specific content sections */}
                    
                    {selectedPlatform === 'tiktok' ? (
                      <>
                        {/* TikTok-specific content sections */}
                        <div className="border-l-4 border-black bg-gray-50 p-2 mb-4 mx-4">
                          <p className="text-xs font-medium text-gray-700">📱 TikTok Platform Sections</p>
                        </div>
                        <TikTokVideosSection influencer={influencer} />
                        <TikTokPostsSection influencer={influencer} />
                      </>
                    ) : selectedPlatform === 'youtube' ? (
                      <>
                        {/* YouTube-specific content sections */}
                        <div className="border-l-4 border-red-500 bg-gray-50 p-2 mb-4 mx-4">
                          <p className="text-xs font-medium text-gray-700">📺 YouTube Platform Sections</p>
                        </div>
                        <YouTubeVideosSection influencer={influencer} />
                        <YouTubeShortsSection influencer={influencer} />
                        <YouTubeStreamsSection influencer={influencer} />
                        <RecentContentSection influencer={influencer} />
                      </>
                    ) : (
                      <>
                        {/* Instagram-specific content sections */}
                        <div className="border-l-4 border-pink-500 bg-gray-50 p-2 mb-4 mx-4">
                          <p className="text-xs font-medium text-gray-700">📸 Instagram Platform Sections</p>
                        </div>
                        <ReelsSection influencer={influencer} />
                        <StoriesSection influencer={influencer} />
                        <RecentContentSection influencer={influencer} />
                      </>
                    )}
                  </div>
                  
                  {/* Audience Intelligence Section Group - NOW AVAILABLE FOR TIKTOK! */}
                  <div className="bg-gray-50/50">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Audience Intelligence</h2>
                    </div>
                    <AudienceSection influencer={influencer} />
                    <AudienceInterestsSection influencer={influencer} />
                    <LanguageBreakdownSection influencer={influencer} />
                  </div>
                  
                  {/* Brand Partnerships & Strategy Section Group - NOW AVAILABLE FOR TIKTOK! */}
                  <div className="bg-white">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Brand Partnerships & Strategy</h2>
                    </div>
                    <BrandPartnershipsSection influencer={influencer} />
                    <ContentStrategySection influencer={influencer} />
                    <HashtagStrategySection influencer={influencer} />
                  </div>
                  
                  <div className="bg-white">
                    <ContentTopicsSection influencer={influencer} />
                  </div>
                  
                  {/* Analytics & Growth Section Group - NOW AVAILABLE FOR TIKTOK! */}
                  <div className="bg-gray-50/50">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Analytics & Growth</h2>
                    </div>
                    <PerformanceStatusSection influencer={influencer} />
                    <ContentAnalyticsSection influencer={influencer} />
                    <HistoricalGrowthSection influencer={influencer} />
                    <CreatorInsightsSection influencer={influencer} />
                  </div>
                  


                  
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