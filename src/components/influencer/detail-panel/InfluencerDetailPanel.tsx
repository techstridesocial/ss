'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
import { InfluencerDetailPanelProps, SocialContact, InfluencerData } from './types'
import SocialMediaIcons from '../SocialMediaIcons'
import { InstagramLogo, YouTubeLogo, TikTokLogo } from '../../icons/BrandLogos'

// Export utilities removed

// Custom hooks
import { useInfluencerAnalytics } from './hooks/useInfluencerAnalytics'

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

// New enhanced sections
import { CreatorProfileInsightsSection } from './sections/CreatorProfileInsightsSection'
import { AdvancedAudienceMatrixSection } from './sections/AdvancedAudienceMatrixSection'
import { FollowerQualityScoreSection } from './sections/FollowerQualityScoreSection'
import { ContentStrategyOptimizerSection } from './sections/ContentStrategyOptimizerSection'
import { CompetitiveBenchmarkingSection } from './sections/CompetitiveBenchmarkingSection'

// Critical missing data sections
import { AudienceReachabilitySection } from './sections/AudienceReachabilitySection'
import { BrandAffinitySection } from './sections/BrandAffinitySection'
import { GeographicReachSection } from './sections/GeographicReachSection'








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
        
        // Check if the influencer has an account on this platform by looking at contacts
        const hasAccount = influencer.contacts?.some((contact: SocialContact) => 
          contact.type === platform.id
        ) ?? false
        
        // Disable the button if the influencer doesn't have an account on this platform
        const isDisabled = loading || !hasAccount
        
        return (
          <button
            key={platform.id}
            onClick={() => hasAccount ? onPlatformSwitch(platform.id) : undefined}
            disabled={isDisabled}
            className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : hasAccount 
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed opacity-60'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !hasAccount 
                ? `${platform.name} account not available`
                : hasData 
                  ? `View ${platform.name} analytics` 
                  : `Load ${platform.name} analytics`
            }
            aria-label={`Switch to ${platform.name} analytics${isActive ? ' (currently selected)' : ''}${!hasAccount ? ' (not available)' : ''}`}
            aria-pressed={isActive}
            aria-disabled={!hasAccount}
            role="tab"
            tabIndex={isActive ? 0 : -1}
          >
            <span className={hasAccount ? '' : 'opacity-50'}>{platform.logo}</span>
            <span className={`font-bold ${hasAccount ? '' : 'opacity-50'}`}>{platform.name}</span>
            {loading && isActive && (
              <div className="ml-1 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!hasAccount && !loading && (
              <span className="ml-1 w-2 h-2 bg-gray-400 rounded-full opacity-50" title="Account not available"></span>
            )}
            {hasAccount && !hasData && !isActive && !loading && (
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
  loading = false,
  pictureSrc
}: { 
  influencer: InfluencerData
  onClose: () => void
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
  onPlatformSwitch?: (platform: 'instagram' | 'tiktok' | 'youtube') => void
  loading?: boolean
  pictureSrc: string
}) => {

  // Get display name with fallbacks
  const displayName = influencer.name || influencer.displayName || influencer.display_name ||
    influencer.handle || influencer.username || 'User'
  
  // Get platform-specific data for dynamic header metrics  
  const platforms = influencer.platforms
  const currentPlatformData = selectedPlatform && platforms?.[selectedPlatform]
    ? platforms[selectedPlatform]
    : null

  // pictureSrc is now passed as a prop from the main component



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
                referrerPolicy="no-referrer-when-downgrade"
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
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center group"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
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

  // Use React Query for API data fetching with automatic caching and retry
  // FIXED: Disable when it's a roster influencer (we get data from useRosterInfluencerAnalytics instead)
  // The roster hook already fetches the data correctly with username
  // Get influencer ID - handle both roster and discovery influencers
  const influencerId = influencer?.rosterId || influencer?.id || influencer?.userId
  
  const { 
    data: apiData, 
    isLoading: isLoadingApiData,
    error: apiError,
    refetch: refetchAnalytics
  } = useInfluencerAnalytics({
    influencerId: influencerId,
    platform: selectedPlatform || 'instagram',
    // Disable when it's a roster influencer - we get data from parent component instead
    enabled: isOpen && !!influencer && !!influencerId && !influencer.isRosterInfluencer
  })

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

  // Merge API data with influencer data
  // FIXED: Use stable references to prevent infinite re-renders
  // For roster influencers, data is already merged by useRosterInfluencerAnalytics
  // For discovery influencers, merge apiData here
  // React Query provides stable object references, so using apiData directly is safe
  // IMPORTANT: This hook must be called BEFORE any conditional returns
  const enrichedInfluencer = useMemo(() => {
    // If influencer is not available, return null
    if (!influencer) {
      return null
    }
    
    // If it's a roster influencer, data is already merged, just return as-is
    if (influencer.isRosterInfluencer) {
      return influencer
    }
    
    // For discovery influencers, merge with apiData
    if (apiData) {
      return {
        ...influencer,
        ...apiData,
        // Preserve metadata
        id: influencer.id,
        isRosterInfluencer: influencer.isRosterInfluencer
      }
    }
    
    return influencer
  }, [
    influencer, // Use full object for stable reference
    apiData ? JSON.stringify(apiData) : null
  ])

  // Get platform-specific profile picture or fallback to general (PRIORITIZE apiData)
  // FIXED: Use stable references to prevent infinite re-renders
  // IMPORTANT: This hook must be called BEFORE any conditional returns
  const pictureSrc = useMemo(() => {
    // Use influencer directly if enrichedInfluencer is null
    const source = enrichedInfluencer || influencer
    if (!source) return ''
    
    // PRIORITY 1: Fresh API data picture (from Modash)
    if (apiData?.picture) {
      return apiData.picture
    }
    
    // PRIORITY 2: Platform-specific picture from connected accounts
    const platformData = selectedPlatform ? source.platforms?.[selectedPlatform] : null
    const platformProfilePicture = platformData?.profile_picture || platformData?.profilePicture
    
    // PRIORITY 3: General influencer picture fallbacks
    return platformProfilePicture ||
      source.picture ||
      source.profilePicture ||
      source.profile_picture || ''
  }, [
    selectedPlatform, 
    enrichedInfluencer,
    influencer,
    apiData?.picture || null
  ])

  // Early return AFTER all hooks are called
  // Only check mounted, isOpen, and influencer - enrichedInfluencer can be null initially
  if (!mounted || !isOpen || !influencer) return null

  // Ensure enrichedInfluencer is never null - default to influencer if enrichment failed
  const finalInfluencer = enrichedInfluencer || influencer

  // Get platform-specific data if available (guard against missing platforms type)
  const platforms = finalInfluencer.platforms
  const currentPlatformData = selectedPlatform && platforms?.[selectedPlatform]
    ? platforms[selectedPlatform]
    : null

  // DEBUG: Log data discrepancy for Charlie

  // 🔍 [DEBUG] Panel rendering debug

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-stretch justify-end"
          onClick={(e) => {
            onClose()
          }}
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
              influencer={finalInfluencer} 
              onClose={onClose} 
              selectedPlatform={selectedPlatform}
              onPlatformSwitch={onPlatformSwitch}
              loading={loading || isLoadingApiData}
              pictureSrc={pictureSrc}
            />

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {(loading || isLoadingApiData) ? (
                <LoadingSpinner />
              ) : apiError ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="text-red-500 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {apiError instanceof Error ? apiError.message : String(apiError)}
                    </p>
                    <button
                      onClick={() => refetchAnalytics()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-full">
                  {/* Core Profile Section - Always visible */}
                  <div className="bg-gradient-to-b from-gray-50 to-white">
                    <PremiumOverviewSection 
                      influencer={finalInfluencer} 
                      currentPlatformData={currentPlatformData}
                      selectedPlatform={selectedPlatform}
                    />
                  </div>
                  
                  {/* Creator Profile Information */}
                  <PremiumProfileSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Content Performance Sections */}
                  <div>
                    <PremiumContentSection
                      influencer={finalInfluencer}
                      selectedPlatform={selectedPlatform}
                      contentType="popular"
                    />
                    {/* Platform-specific paid/organic analysis */}
                    {selectedPlatform === 'tiktok' ? (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <TikTokPaidOrganicSection influencer={finalInfluencer} />
                      </PremiumSectionWrapper>
                    ) : selectedPlatform === 'youtube' ? (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <YouTubePaidOrganicSection influencer={finalInfluencer} />
                      </PremiumSectionWrapper>
                    ) : (
                      <PremiumSectionWrapper title="Paid vs Organic Performance" defaultOpen={false}>
                        <PaidOrganicSection influencer={finalInfluencer} />
                      </PremiumSectionWrapper>
                    )}
                    
                    {/* Platform-specific content sections */}
                    
                    {selectedPlatform === 'tiktok' ? (
                      <>
                        {/* TikTok Premium Content Sections */}
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="videos"
                        />
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                      </>
                    ) : selectedPlatform === 'youtube' ? (
                      <>
                        {/* YouTube Premium Content Sections */}
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="videos"
                        />
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="popular"
                        />
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                      </>
                    ) : (
                      <>
                        {/* Instagram Premium Content Sections */}
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="recent"
                        />
                        <PremiumContentSection
                          influencer={finalInfluencer}
                          selectedPlatform={selectedPlatform}
                          contentType="popular"
                        />
                      </>
                    )}
                  </div>
                  
                  {/* Instagram-Specific Performance Metrics */}
                  <PremiumInstagramMetricsSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Creator Profile Insights - New Enhanced Section */}
                  <CreatorProfileInsightsSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Audience Intelligence Section */}
                  <PremiumAudienceSection influencer={finalInfluencer} />
                  
                  {/* Advanced Audience Intelligence */}
                  <PremiumAdvancedAudienceSection influencer={finalInfluencer} />
                  
                  {/* Advanced Audience Matrix - New Enhanced Section */}
                  <AdvancedAudienceMatrixSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Follower Quality Score - New Enhanced Section */}
                  <FollowerQualityScoreSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Audience Reachability */}
                  <AudienceReachabilitySection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Geographic Reach */}
                  <GeographicReachSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Brand Partnerships & Strategy Sections */}
                  <PremiumBrandPartnershipsSection influencer={finalInfluencer} />
                  
                  {/* Brand Affinity */}
                  <BrandAffinitySection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Content Strategy Optimizer - Replaces old Content Strategy */}
                  <ContentStrategyOptimizerSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Keep existing hashtag and topics sections */}
                  <PremiumSectionWrapper title="Hashtag Strategy" defaultOpen={false}>
                    <HashtagStrategySection influencer={finalInfluencer} />
                  </PremiumSectionWrapper>
                  <PremiumSectionWrapper title="Content Topics" defaultOpen={false}>
                    <ContentTopicsSection influencer={finalInfluencer} />
                  </PremiumSectionWrapper>
                  
                  {/* Competitive Benchmarking - New Enhanced Section */}
                  <CompetitiveBenchmarkingSection 
                    influencer={finalInfluencer}
                    selectedPlatform={selectedPlatform}
                  />
                  
                  {/* Analytics & Growth Sections */}
                  <PremiumAnalyticsSection influencer={finalInfluencer} sectionType="performance" />
                  <PremiumAnalyticsSection influencer={finalInfluencer} sectionType="analytics" />
                  <PremiumAnalyticsSection influencer={finalInfluencer} sectionType="growth" />
                  <PremiumAnalyticsSection influencer={finalInfluencer} sectionType="insights" />
                  
                  


                  
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

  // Portal rendering - always render when mounted, open, and influencer exists
  // The panel JSX already handles the isOpen check inside AnimatePresence
  if (!mounted || !isOpen || !influencer) {
    return null
  }

  return createPortal(panel, document.body)
})

export default InfluencerDetailPanel