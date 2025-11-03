'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import MinMaxSelector from '../../../components/filters/MinMaxSelector'
import FollowersGrowthSelector from '../../../components/filters/FollowersGrowthSelector'
import TotalLikesGrowthSelector from '../../../components/filters/TotalLikesGrowthSelector'
import ViewsGrowthSelector from '../../../components/filters/ViewsGrowthSelector'
import EngagementSelector from '../../../components/filters/EngagementSelector'
import CategorySelector from '../../../components/filters/CategorySelector'
import TextInputFilter from '../../../components/filters/TextInputFilter'
import ToggleFilter from '../../../components/filters/ToggleFilter'
import CustomDropdown from '../../../components/filters/CustomDropdown'
import MultiSelectDropdown from '../../../components/filters/MultiSelectDropdown'
import AutocompleteInput from '../../../components/filters/AutocompleteInput'
import MultiAutocompleteInput from '../../../components/filters/MultiAutocompleteInput'
import { FOLLOWER_VIEW_OPTIONS } from '../../../constants/filterOptions'
import { LOCATION_OPTIONS, getBestAvailableLocations, LocationService } from '../../../constants/locations'
import { 
  Search, 
  Download, 
  Users, 
  Target, 
  CreditCard, 
  Globe, 
  TrendingUp, 
  Filter,
  RefreshCw,
  Calendar,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  User,
  MessageSquare,
  Loader2,
  Info,
  MapPin,
  Video,
  Image,
  Heart
} from 'lucide-react'
import InfluencerDetailPanel from '@/components/influencer/InfluencerDetailPanel'
import { CreditCard as CreditCardComponent } from '@/components/credits/CreditDisplay'
import { getBrandLogo, getBrandColor } from '@/components/icons/BrandLogos'
// URL validation and platform icon helpers for social media contacts
const validateAndSanitizeUrl = (contact: any): string | null => {
  if (!contact?.value || typeof contact.value !== 'string') return null
  
  const url = contact.value.trim()
  
  // If it's already a full URL, validate it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url)
      return url
    } catch {
      return null
    }
  }
  
  // Generate fallback URLs based on platform
  const platform = contact.type?.toLowerCase()
  const username = url.replace(/^@/, '') // Remove @ if present
  
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${username}`
    case 'youtube':
      return url.includes('channel/') ? `https://www.youtube.com/${url}` : `https://www.youtube.com/@${username}`
    case 'tiktok':
      return `https://www.tiktok.com/@${username}`
    case 'linktree':
      return `https://linktr.ee/${username}`
    case 'twitter':
    case 'x':
      return `https://twitter.com/${username}`
    case 'facebook':
      return `https://www.facebook.com/${username}`
    default:
      // If platform type is unknown but URL looks valid, return it as-is
      if (url.includes('.')) {
        return url.startsWith('http') ? url : `https://${url}`
      }
      return null
  }
}

const getPlatformIconJSX = (platformType: string) => {
  return getBrandLogo(platformType, "w-4 h-4")
}

const getPlatformColor = (platformType: string) => {
  return getBrandColor(platformType)
}
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'
import { useStaffSavedInfluencers } from '../../../lib/hooks/useStaffSavedInfluencers'
import SavedInfluencersTable from '../../../components/staff/SavedInfluencersTable'
import { useToast } from '../../../components/ui/use-toast'
import { Toaster } from '../../../components/ui/toaster'

// Add to roster functionality with COMPLETE Modash data caching
const addToRoster = async (discoveredId: string, modashUserId?: string, platform?: string) => {
  try {
    const response = await fetch('/api/discovery/add-to-roster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        discoveredId, 
        modashUserId, 
        platform 
      }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      return { 
        success: true, 
        newInfluencerId: data.data.newInfluencerId,
        hasCompleteData: data.data.hasCompleteData
      }
    } else {
      throw new Error(data.error || 'Failed to add to roster')
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper functions
import { formatters } from '@/lib/utils/formatters'
const formatNumber = formatters.display
const formatNumberWithCommas = formatters.precise

const getScoreBadge = (score: number) => {
  if (score >= 90) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Excellent</span>
  } else if (score >= 75) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Good</span>
  } else if (score >= 60) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Fair</span>
  } else {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Poor</span>
  }
}

// New Modern Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendUp && <ArrowUpRight size={14} className="text-green-600 mr-1" />}
              <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>{trend}</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  )
}

// Logo components
const InstagramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const TikTokLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

const YouTubeLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

// New Modern Search Interface
function DiscoverySearchInterface({ 
  selectedPlatform, 
  setSelectedPlatform,
  onSearch,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  onFiltersChange
}: { 
  selectedPlatform: 'instagram' | 'tiktok' | 'youtube'
  setSelectedPlatform: React.Dispatch<React.SetStateAction<'instagram' | 'tiktok' | 'youtube'>>
  onSearch?: () => void
  isLoading?: boolean
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  onFiltersChange?: (filters: any) => void
}) {
  const [locationTarget, setLocationTarget] = useState<'creator' | 'audience'>('creator')
  const [genderTarget, setGenderTarget] = useState<'creator' | 'audience'>('creator')
  const [ageTarget, setAgeTarget] = useState<'creator' | 'audience'>('creator')
  const [languageTarget, setLanguageTarget] = useState<'creator' | 'audience'>('creator')

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    demographics: false,
    performance: false, 
    content: false,
    account: false
  })

  // Performance filter states
  const [followersMin, setFollowersMin] = useState('')
  const [followersMax, setFollowersMax] = useState('')
  const [growthPercentage, setGrowthPercentage] = useState('')
  const [growthPeriod, setGrowthPeriod] = useState('')
  const [engagement, setEngagement] = useState('')
  const [viewsMin, setViewsMin] = useState('')
  const [viewsMax, setViewsMax] = useState('')

  // TikTok-specific performance states
  const [likesGrowthPercentage, setLikesGrowthPercentage] = useState('')
  const [likesGrowthPeriod, setLikesGrowthPeriod] = useState('')
  const [sharesMin, setSharesMin] = useState('')
  const [sharesMax, setSharesMax] = useState('')
  const [savesMin, setSavesMin] = useState('')
  const [savesMax, setSavesMax] = useState('')

  // YouTube-specific performance states
  const [viewsGrowthPercentage, setViewsGrowthPercentage] = useState('')
  const [viewsGrowthPeriod, setViewsGrowthPeriod] = useState('')

  // Search bar states (removed searchQuery as it's now a prop)
  const [hideProfilesInRoster, setHideProfilesInRoster] = useState(false)

  // Content filter states
  const [contentCategoriesTarget, setContentCategoriesTarget] = useState<'creator' | 'audience'>('creator')
  const [selectedContentCategories, setSelectedContentCategories] = useState<string[]>([])
  const [hashtags, setHashtags] = useState('')
  const [mentions, setMentions] = useState('')
  const [captions, setCaptions] = useState('')
  const [collaborations, setCollaborations] = useState('')
  const [hasSponsoredPosts, setHasSponsoredPosts] = useState(false)

  // YouTube-specific content states
  const [topics, setTopics] = useState('')
  const [transcript, setTranscript] = useState('')

  // Demographics filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  
  // No need for availableLocations state anymore - MultiAutocompleteInput handles this dynamically

  // Account filter states
  const [bio, setBio] = useState('')
  const [description, setDescription] = useState('')
  const [accountType, setAccountType] = useState('')
  const [selectedSocials, setSelectedSocials] = useState<string[]>([])
  const [fakeFollowers, setFakeFollowers] = useState('')
  const [lastPosted, setLastPosted] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Function to collect all current filter values
  const getCurrentFilters = () => {
    const filters: any = {
      platform: selectedPlatform
    }

    // Performance filters
    if (followersMin || followersMax) {
      if (followersMin) filters.followersMin = parseFollowerValue(followersMin)
      if (followersMax) filters.followersMax = parseFollowerValue(followersMax)
    }

    if (engagement) {
      // Parse engagement value (e.g., "greater_than_2" -> 2)
      const match = engagement.match(/greater_than_(\d+(?:\.\d+)?)/)
      if (match && match[1]) {
        filters.engagementRate = parseFloat(match[1])
      }
    }

    if (viewsMin || viewsMax) {
      if (viewsMin) filters.avgViewsMin = parseFollowerValue(viewsMin)
      if (viewsMax) filters.avgViewsMax = parseFollowerValue(viewsMax)
    }

    // Content filters
    if (bio?.trim()) filters.bio = bio.trim()
    if (hashtags?.trim()) filters.hashtags = hashtags.trim()
    if (mentions?.trim()) filters.mentions = mentions.trim()
    if (captions?.trim()) filters.captions = captions.trim()
    if (topics?.trim()) filters.topics = topics.trim()
    if (transcript?.trim()) filters.transcript = transcript.trim()
    if (collaborations?.trim()) filters.collaborations = collaborations.trim()
    if (selectedContentCategories.length > 0) filters.selectedContentCategories = selectedContentCategories

    // Demographics
    if (selectedLocations.length > 0) filters.selectedLocations = selectedLocations
    if (selectedGender) filters.selectedGender = selectedGender
    if (selectedAge) filters.selectedAge = selectedAge
    if (selectedLanguage) filters.selectedLanguage = selectedLanguage

    // Account filters
    if (accountType) filters.accountType = accountType
    if (selectedSocials.length > 0) filters.selectedSocials = selectedSocials
    if (fakeFollowers) filters.fakeFollowers = fakeFollowers
    if (lastPosted) filters.lastPosted = lastPosted
    if (verifiedOnly) filters.verifiedOnly = verifiedOnly

    // Search options
    if (hideProfilesInRoster) filters.hideProfilesInRoster = hideProfilesInRoster

    return filters
  }

  // Helper function to parse follower/view values like "1k", "1m", etc.
  const parseFollowerValue = (value: string | undefined): number | undefined => {
    if (!value || value.trim() === '') return undefined
    
    const cleanValue = value.toLowerCase().replace(/[^0-9kmb.]/g, '')
    if (!cleanValue) return undefined
    
    let result: number
    if (cleanValue.includes('k')) {
      result = parseFloat(cleanValue.replace('k', '')) * 1000
    } else if (cleanValue.includes('m')) {
      result = parseFloat(cleanValue.replace('m', '')) * 1000000
    } else if (cleanValue.includes('b')) {
      result = parseFloat(cleanValue.replace('b', '')) * 1000000000
    } else {
      result = parseFloat(cleanValue)
    }
    
    return result
  }

  // Notify parent of filter changes
  React.useEffect(() => {
    if (onFiltersChange) {
      const filters = getCurrentFilters()
      onFiltersChange(filters)
    }
  }, [
    selectedPlatform, followersMin, followersMax, engagement, viewsMin, viewsMax,
    bio, hashtags, mentions, captions, topics, transcript, collaborations,
    selectedContentCategories, selectedLocations, selectedGender, selectedAge,
    selectedLanguage, accountType, selectedSocials, fakeFollowers, lastPosted,
    verifiedOnly, hideProfilesInRoster, onFiltersChange
  ])

  // Dynamic location loading is now handled by MultiAutocompleteInput component

  // Collapsible section toggle function with debouncing
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Collapsible Section Header Component
  const CollapsibleSectionHeader = ({ 
    title, 
    isExpanded, 
    onToggle,
    className = ""
  }: {
    title: string
    isExpanded: boolean
    onToggle: () => void
    className?: string
  }) => (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-expanded={isExpanded}
      aria-controls={`${title.toLowerCase()}-content`}
    >
      <h4 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
        {title}
      </h4>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="text-gray-500 group-hover:text-gray-700"
      >
        <ChevronDown size={20} />
      </motion.div>
    </button>
  )

  // Animation variants for sections
  const sectionVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden'
    },
    visible: { 
      height: 'auto', 
      opacity: 1,
      overflow: 'visible',
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transition: {
        opacity: { duration: 0.1 },
        height: { duration: 0.3, ease: 'easeInOut', delay: 0.1 }
      }
    }
  }

  // Dropdown options
  const LOCATION_OPTIONS = [
    { value: '', label: 'All Locations' },
    { value: 'united_kingdom', label: 'United Kingdom' },
    { value: 'united_states', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'australia', label: 'Australia' },
    { value: 'germany', label: 'Germany' },
    { value: 'france', label: 'France' },
    { value: 'spain', label: 'Spain' },
    { value: 'italy', label: 'Italy' },
    { value: 'netherlands', label: 'Netherlands' },
    { value: 'sweden', label: 'Sweden' },
    { value: 'norway', label: 'Norway' },
    { value: 'denmark', label: 'Denmark' },
    { value: 'belgium', label: 'Belgium' },
    { value: 'switzerland', label: 'Switzerland' },
    { value: 'austria', label: 'Austria' },
    { value: 'portugal', label: 'Portugal' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'finland', label: 'Finland' },
    { value: 'poland', label: 'Poland' },
    { value: 'czech_republic', label: 'Czech Republic' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'mexico', label: 'Mexico' },
    { value: 'argentina', label: 'Argentina' },
    { value: 'chile', label: 'Chile' },
    { value: 'japan', label: 'Japan' },
    { value: 'south_korea', label: 'South Korea' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'hong_kong', label: 'Hong Kong' },
    { value: 'india', label: 'India' },
    { value: 'south_africa', label: 'South Africa' },
    { value: 'new_zealand', label: 'New Zealand' },
    { value: 'israel', label: 'Israel' },
    { value: 'other', label: 'Other' }
  ]

  const GENDER_OPTIONS = [
    { value: '', label: 'Any Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const AGE_OPTIONS = [
    { value: '', label: 'Any Age' },
    { value: '13-17', label: '13-17' },
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45-54', label: '45-54' },
    { value: '55-64', label: '55-64' },
    { value: '65+', label: '65+' }
  ]

  const LANGUAGE_OPTIONS = [
    { value: '', label: 'Any Language' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'other', label: 'Other' }
  ]

  // Account section options
  const ACCOUNT_TYPE_OPTIONS = [
    { value: '', label: 'Any Type' },
    { value: 'regular', label: 'Regular' },
    { value: 'business', label: 'Business' },
    { value: 'creator', label: 'Creator' }
  ]

  const SOCIAL_PLATFORM_OPTIONS = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitch', label: 'Twitch' },
    { value: 'x', label: 'X' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'threads', label: 'Threads' },
    { value: 'snapchat', label: 'Snapchat' },
    { value: 'linktree', label: 'Linktree' },
    { value: 'kakao', label: 'Kakao' },
    { value: 'kik', label: 'Kik' },
    { value: 'line_id', label: 'Line ID' },
    { value: 'pinterest', label: 'Pinterest' },
    { value: 'sarahah', label: 'Sarahah' },
    { value: 'sayat', label: 'Sayat' },
    { value: 'tumblr', label: 'Tumblr' },
    { value: 'vk', label: 'VK' },
    { value: 'wechat', label: 'WeChat' }
  ]

  const FAKE_FOLLOWERS_OPTIONS = [
    { value: '', label: 'Any Amount' },
    { value: '25', label: '≤ 25%' },
    { value: '35', label: '≤ 35%' },
    { value: '50', label: '≤ 50%' }
  ]

  const LAST_POSTED_OPTIONS = [
    { value: '', label: 'Any Time' },
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days' }
  ]

  // TikTok shares and saves options
  const SHARES_SAVES_OPTIONS = [
    '100',
    '200', 
    '300',
    '400',
    '500',
    '1k',
    '5k',
    '10k',
    '50k',
    '100k',
    '500k',
    '> 1m'
  ]

  // Platform-specific options
  const getPerformanceOptions = () => {
    switch (selectedPlatform) {
      case 'youtube':
        return {
          followersLabel: 'Subscribers',
          viewsLabel: 'Video Views',
          engagement: [
            { value: '', label: 'Any Engagement' },
            { value: 'greater_than_0.5', label: '≥ 0.5%' },
            { value: 'greater_than_1', label: '≥ 1%' },
            { value: 'greater_than_2', label: '≥ 2%' },
            { value: 'greater_than_3', label: '≥ 3%' },
            { value: 'greater_than_4', label: '≥ 4%' },
            { value: 'greater_than_5', label: '≥ 5%' }
          ]
        }
      case 'tiktok':
        return {
          followersLabel: 'Followers',
          viewsLabel: 'Views',
          engagement: [
            { value: '', label: 'Any Engagement' },
            { value: 'greater_than_2', label: '≥ 2%' },
            { value: 'greater_than_5', label: '≥ 5%' },
            { value: 'greater_than_8', label: '≥ 8%' },
            { value: 'greater_than_10', label: '≥ 10%' },
            { value: 'greater_than_15', label: '≥ 15%' },
            { value: 'greater_than_20', label: '≥ 20%' }
          ]
        }
      default: // instagram
        return {
          followersLabel: 'Followers',
          viewsLabel: 'Views',
          engagement: [
            { value: '', label: 'Any Engagement' },
            { value: 'hidden_likes', label: 'Hidden likes' },
            { value: 'greater_than_0.5', label: '≥ 0.5%' },
            { value: 'greater_than_1', label: '≥ 1%' },
            { value: '2_average', label: '≥ 2% (average)' },
            { value: '3', label: '≥ 3%' },
            { value: '4', label: '≥ 4%' },
            { value: '5', label: '≥ 5%' },
            { value: '6', label: '≥ 6%' },
            { value: '7', label: '≥ 7%' },
            { value: '8', label: '≥ 8%' },
            { value: '9', label: '≥ 9%' },
            { value: '10', label: '≥ 10%' }
          ]
        }
    }
  }

  const getContentOptions = () => {
    switch (selectedPlatform) {
      case 'youtube':
        return {
          categories: [
            { value: 'gaming', label: 'Gaming' },
            { value: 'tech_reviews', label: 'Tech Reviews' },
            { value: 'tutorials', label: 'Tutorials' },
            { value: 'vlogs', label: 'Vlogs' },
            { value: 'music', label: 'Music' },
            { value: 'entertainment', label: 'Entertainment' },
            { value: 'education', label: 'Education' },
            { value: 'cooking', label: 'Cooking' },
            { value: 'fitness', label: 'Fitness' },
            { value: 'beauty', label: 'Beauty' },
            { value: 'travel', label: 'Travel' },
            { value: 'business', label: 'Business' },
            { value: 'lifestyle', label: 'Lifestyle' },
            { value: 'comedy', label: 'Comedy' },
            { value: 'news', label: 'News' }
          ],
          hashtags: 'Video Tags',
          captions: 'Video Descriptions',
          collaborations: 'Channel Collaborations',
          topics: 'Topics',
          transcript: 'Transcript'
        }
      case 'tiktok':
        return {
          categories: [
            { value: 'dance', label: 'Dance' },
            { value: 'comedy', label: 'Comedy' },
            { value: 'beauty', label: 'Beauty' },
            { value: 'fashion', label: 'Fashion' },
            { value: 'food', label: 'Food' },
            { value: 'pets', label: 'Pets' },
            { value: 'diy_crafts', label: 'DIY & Crafts' },
            { value: 'fitness', label: 'Fitness' },
            { value: 'travel', label: 'Travel' },
            { value: 'music', label: 'Music' },
            { value: 'lifestyle', label: 'Lifestyle' },
            { value: 'education', label: 'Education' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'tech', label: 'Tech' },
            { value: 'business', label: 'Business' }
          ],
          hashtags: 'TikTok Hashtags',
          mentions: 'Mentions',
          captions: 'Video Captions',
          collaborations: 'TikTok Collaborations'
        }
      default: // instagram
        return {
          categories: [
            { value: 'television_film', label: 'Television & film' },
            { value: 'music', label: 'Music' },
            { value: 'shopping_retail', label: 'Shopping & retail' },
            { value: 'entertainment_pop_culture', label: 'Entertainment & pop culture' },
            { value: 'family_relationships', label: 'Family & relationships' },
            { value: 'fitness_yoga', label: 'Fitness & yoga' },
            { value: 'food_cooking', label: 'Food & cooking' },
            { value: 'beauty_makeup', label: 'Beauty & makeup' },
            { value: 'fashion_outfits', label: 'Fashion & outfits' },
            { value: 'photography_art', label: 'Photography & art' },
            { value: 'travel_tourism', label: 'Travel & tourism' },
            { value: 'business_entrepreneurship', label: 'Business & entrepreneurship' },
            { value: 'sports', label: 'Sports' },
            { value: 'wellness_mindfulness', label: 'Wellness & mindfulness' },
            { value: 'home_garden', label: 'Home & garden' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'books_literature', label: 'Books & literature' },
            { value: 'cars_motorcycles', label: 'Cars & motorcycles' },
            { value: 'diy_crafts', label: 'DIY & crafts' },
            { value: 'animals_pets', label: 'Animals & pets' },
            { value: 'technology', label: 'Technology' },
            { value: 'science_nature', label: 'Science & nature' },
            { value: 'news_politics', label: 'News & politics' },
            { value: 'activism_causes', label: 'Activism & causes' },
            { value: 'health_medicine', label: 'Health & medicine' },
            { value: 'education_learning', label: 'Education & learning' },
            { value: 'finance_investing', label: 'Finance & investing' },
            { value: 'other', label: 'Other' }
          ],
          hashtags: 'Hashtags',
          captions: 'Captions',
          collaborations: 'Brand Collaborations'
        }
    }
  }

  const getAccountOptions = () => {
    switch (selectedPlatform) {
      case 'youtube':
        return {
          accountTypes: [
            { value: '', label: 'Any Type' },
            { value: 'personal', label: 'Personal' },
            { value: 'brand', label: 'Brand' },
            { value: 'music', label: 'Music' },
            { value: 'gaming', label: 'Gaming' }
          ],
          verifiedLabel: 'YouTube Verified',
          fakeFollowers: [
            { value: '', label: 'Any Amount' },
            { value: '10', label: '≤ 10%' },
            { value: '20', label: '≤ 20%' },
            { value: '30', label: '≤ 30%' }
          ]
        }
      case 'tiktok':
        return {
          accountTypes: [
            { value: '', label: 'Any Type' },
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' }
          ],
          verifiedLabel: 'TikTok Verified',
          fakeFollowers: [
            { value: '', label: 'Any Amount' },
            { value: '15', label: '≤ 15%' },
            { value: '25', label: '≤ 25%' },
            { value: '40', label: '≤ 40%' }
          ]
        }
      default: // instagram
        return {
          accountTypes: [
            { value: '', label: 'Any Type' },
            { value: 'regular', label: 'Regular' },
            { value: 'business', label: 'Business' },
            { value: 'creator', label: 'Creator' }
          ],
          verifiedLabel: 'Instagram Verified',
          fakeFollowers: [
            { value: '', label: 'Any Amount' },
            { value: '25', label: '≤ 25%' },
            { value: '35', label: '≤ 35%' },
            { value: '50', label: '≤ 50%' }
          ]
        }
    }
  }

  const platforms = [
    { id: 'instagram', name: 'Instagram', logo: <InstagramLogo /> },
    { id: 'tiktok', name: 'TikTok', logo: <TikTokLogo /> },
    { id: 'youtube', name: 'YouTube', logo: <YouTubeLogo /> }
  ] as const
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Discover Influencers</h3>
      </div>
      
      {/* Platform Selection Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedPlatform === platform.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{platform.logo}</span>
              <span className="font-bold capitalize">{platform.name}</span>
              {isLoading && selectedPlatform === platform.id && (
                <div className="ml-1 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Search Influencers
            </label>
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchQueryChange?.(e.target.value)}
                  placeholder="Search by username (e.g., cristiano)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onSearch?.();
                    }
                  }}
                />
              </div>
              <button
                onClick={onSearch}
                disabled={!onSearch || isLoading}
                className="px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-r-xl border border-l-0 border-black hover:border-gray-800 disabled:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter an Instagram, TikTok, or YouTube username to find specific influencers
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHideProfilesInRoster(!hideProfilesInRoster)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hideProfilesInRoster ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">Hide Profiles in Roster</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hideProfilesInRoster ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label className="text-sm font-medium text-gray-700">Hide Profiles in Roster</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="mb-8">
        <CollapsibleSectionHeader
          title="Demographics"
          isExpanded={expandedSections.demographics}
          onToggle={() => toggleSection('demographics')}
          className="mb-4"
        />
        <AnimatePresence initial={false}>
          {expandedSections.demographics && (
            <motion.div
              id="demographics-content"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => setLocationTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            locationTarget === 'creator' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button 
                          onClick={() => setLocationTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            locationTarget === 'audience' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <MultiAutocompleteInput
                        selectedValues={selectedLocations}
                        onChange={setSelectedLocations}
                        placeholder="Type to search locations (e.g., London, New York, Tokyo)..."
                        apiEndpoint="/api/discovery/locations"
                        additionalParams={{ platform: selectedPlatform }}
                        maxSelections={5}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => setGenderTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            genderTarget === 'creator' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button 
                          onClick={() => setGenderTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            genderTarget === 'audience' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <CustomDropdown
                        value={selectedGender}
                        onChange={setSelectedGender}
                        options={GENDER_OPTIONS}
                        placeholder="Any Gender"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => setAgeTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            ageTarget === 'creator' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button 
                          onClick={() => setAgeTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            ageTarget === 'audience' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <CustomDropdown
                        value={selectedAge}
                        onChange={setSelectedAge}
                        options={AGE_OPTIONS}
                        placeholder="Any Age"
                      />
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => setLanguageTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            languageTarget === 'creator' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button 
                          onClick={() => setLanguageTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            languageTarget === 'audience' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <AutocompleteInput
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        placeholder="Search languages..."
                        apiEndpoint="/api/discovery/languages"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Filter Sections */}
      <div className="space-y-4">
        {/* Divider */}
        <div className="border-t border-gray-200"></div>
        
        {/* Performance Filters */}
        <div className="mb-4">
          <CollapsibleSectionHeader
            title="Performance"
            isExpanded={expandedSections.performance}
            onToggle={() => toggleSection('performance')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.performance && (
              <motion.div
                id="performance-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Followers/Subscribers */}
                    <MinMaxSelector
                      label={getPerformanceOptions().followersLabel}
                      minValue={followersMin}
                      maxValue={followersMax}
                      onMinChange={setFollowersMin}
                      onMaxChange={setFollowersMax}
                      options={FOLLOWER_VIEW_OPTIONS}
                      placeholder="Any"
                    />

                    {/* Followers/Subscribers Growth */}
                    <FollowersGrowthSelector
                      growthPercentage={growthPercentage}
                      growthPeriod={growthPeriod}
                      onGrowthPercentageChange={setGrowthPercentage}
                      onGrowthPeriodChange={setGrowthPeriod}
                      label={selectedPlatform === 'youtube' ? 'Subscribers Growth' : 'Followers Growth'}
                    />

                    {/* Engagement */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Engagement</label>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Rate</label>
                          <CustomDropdown
                            value={engagement}
                            onChange={setEngagement}
                            options={getPerformanceOptions().engagement}
                            placeholder="Any Engagement"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Views/Video Views */}
                    <MinMaxSelector
                      label={getPerformanceOptions().viewsLabel}
                      minValue={viewsMin}
                      maxValue={viewsMax}
                      onMinChange={setViewsMin}
                      onMaxChange={setViewsMax}
                      options={FOLLOWER_VIEW_OPTIONS}
                      placeholder="Any"
                    />

                    {/* YouTube-specific fields */}
                    {selectedPlatform === 'youtube' && (
                      <ViewsGrowthSelector
                        growthPercentage={viewsGrowthPercentage}
                        growthPeriod={viewsGrowthPeriod}
                        onGrowthPercentageChange={setViewsGrowthPercentage}
                        onGrowthPeriodChange={setViewsGrowthPeriod}
                      />
                    )}

                    {/* TikTok-specific fields */}
                    {selectedPlatform === 'tiktok' && (
                      <>
                        {/* Total Likes Growth */}
                        <TotalLikesGrowthSelector
                          growthPercentage={likesGrowthPercentage}
                          growthPeriod={likesGrowthPeriod}
                          onGrowthPercentageChange={setLikesGrowthPercentage}
                          onGrowthPeriodChange={setLikesGrowthPeriod}
                        />

                        {/* Shares */}
                        <MinMaxSelector
                          label="Shares"
                          minValue={sharesMin}
                          maxValue={sharesMax}
                          onMinChange={setSharesMin}
                          onMaxChange={setSharesMax}
                          options={SHARES_SAVES_OPTIONS}
                          placeholder="Any"
                        />

                        {/* Saves */}
                        <MinMaxSelector
                          label="Saves"
                          minValue={savesMin}
                          maxValue={savesMax}
                          onMinChange={setSavesMin}
                          onMaxChange={setSavesMax}
                          options={SHARES_SAVES_OPTIONS}
                          placeholder="Any"
                        />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Content Filters */}
        <div className="mb-4">
          <CollapsibleSectionHeader
            title="Content"
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection('content')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.content && (
              <motion.div
                id="content-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {selectedPlatform === 'tiktok' ? (
                    // TikTok-specific content layout
                    <div className="grid grid-cols-1 gap-4">
                      {/* Hashtags with Autocomplete */}
                      <AutocompleteInput
                        value={hashtags}
                        onChange={setHashtags}
                        placeholder={`Search ${getContentOptions().hashtags.toLowerCase()}...`}
                        apiEndpoint="/api/discovery/hashtags"
                        label={getContentOptions().hashtags}
                      />

                      {/* Interests (Audience Interests) */}
                      <AutocompleteInput
                        value={topics}
                        onChange={setTopics}
                        placeholder="Search interests..."
                        apiEndpoint="/api/discovery/interests"
                        label="Interests"
                      />

                      {/* Mentions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getContentOptions().mentions}</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Search</label>
                            <input
                              type="text"
                              value={mentions}
                              onChange={(e) => setMentions(e.target.value)}
                              placeholder="Search mentions..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Captions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getContentOptions().captions}</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Search</label>
                            <input
                              type="text"
                              value={captions}
                              onChange={(e) => setCaptions(e.target.value)}
                              placeholder={`Search ${getContentOptions().captions.toLowerCase()}...`}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedPlatform === 'youtube' ? (
                    // YouTube-specific content layout
                    <div className="grid grid-cols-1 gap-4">
                      {/* Topics with Autocomplete */}
                      <AutocompleteInput
                        value={topics}
                        onChange={setTopics}
                        placeholder="Search topics..."
                        apiEndpoint="/api/discovery/topics"
                        label={getContentOptions().topics}
                      />

                      {/* Transcript */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getContentOptions().transcript}</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Search</label>
                            <input
                              type="text"
                              value={transcript}
                              onChange={(e) => setTranscript(e.target.value)}
                              placeholder="Search transcript..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Instagram content layout
                    <div className="grid grid-cols-1 gap-4">
                      {/* Categories */}
                      <CategorySelector
                        selectedCategories={selectedContentCategories}
                        onCategoriesChange={setSelectedContentCategories}
                        target={contentCategoriesTarget}
                        onTargetChange={setContentCategoriesTarget}
                      />

                      {/* Hashtags with Autocomplete */}
                      <AutocompleteInput
                        value={hashtags}
                        onChange={setHashtags}
                        placeholder={`Search ${getContentOptions().hashtags.toLowerCase()}...`}
                        apiEndpoint="/api/discovery/hashtags"
                        label={getContentOptions().hashtags}
                      />

                      {/* Captions/Descriptions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getContentOptions().captions}</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Search</label>
                            <input
                              type="text"
                              value={captions}
                              onChange={(e) => setCaptions(e.target.value)}
                              placeholder={`Search ${getContentOptions().captions.toLowerCase()}...`}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Collaborations (Brand Partnerships) with Autocomplete */}
                      <AutocompleteInput
                        value={collaborations}
                        onChange={setCollaborations}
                        placeholder="Search brand partnerships..."
                        apiEndpoint="/api/discovery/partnerships"
                        label={getContentOptions().collaborations}
                      />

                      {/* Sponsored Content Toggle */}
                      <ToggleFilter
                        label="Sponsored Content"
                        checked={hasSponsoredPosts}
                        onChange={setHasSponsoredPosts}
                        description="Has sponsored posts"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Account Filters */}
        <div className="mb-8">
          <CollapsibleSectionHeader
            title="Account"
            isExpanded={expandedSections.account}
            onToggle={() => toggleSection('account')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.account && (
              <motion.div
                id="account-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {selectedPlatform === 'tiktok' ? (
                    // TikTok-specific account layout (no Type, no Fake Followers)
                    <div className="grid grid-cols-1 gap-4">
                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Content</label>
                            <input
                              type="text"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Search bio content..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Platforms */}
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />

                      {/* Last Posted */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Within</label>
                            <CustomDropdown
                              value={lastPosted}
                              onChange={setLastPosted}
                              options={LAST_POSTED_OPTIONS}
                              placeholder="Any Time"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Verified Creators Toggle */}
                      <ToggleFilter
                        label={getAccountOptions().verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${getAccountOptions().verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  ) : selectedPlatform === 'youtube' ? (
                    // YouTube-specific account layout (Description, Socials, Last Posted, Verified)
                    <div className="grid grid-cols-1 gap-4">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Content</label>
                            <input
                              type="text"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Search description content..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Platforms */}
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />

                      {/* Last Posted */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Within</label>
                            <CustomDropdown
                              value={lastPosted}
                              onChange={setLastPosted}
                              options={LAST_POSTED_OPTIONS}
                              placeholder="Any Time"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Verified Creators Toggle */}
                      <ToggleFilter
                        label={getAccountOptions().verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${getAccountOptions().verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  ) : (
                    // Instagram account layout (full features)
                    <div className="grid grid-cols-1 gap-4">
                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Content</label>
                            <input
                              type="text"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Search bio content..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Account Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Account</label>
                            <CustomDropdown
                              value={accountType}
                              onChange={setAccountType}
                              options={getAccountOptions().accountTypes}
                              placeholder="Any Type"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Platforms */}
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />

                      {/* Fake Followers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fake Followers</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Threshold</label>
                            <CustomDropdown
                              value={fakeFollowers}
                              onChange={setFakeFollowers}
                              options={getAccountOptions().fakeFollowers}
                              placeholder="Any Amount"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Last Posted */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Within</label>
                            <CustomDropdown
                              value={lastPosted}
                              onChange={setLastPosted}
                              options={LAST_POSTED_OPTIONS}
                              placeholder="Any Time"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Verified Creators Toggle */}
                      <ToggleFilter
                        label={getAccountOptions().verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${getAccountOptions().verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Search Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onSearch}
          disabled={!onSearch || isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Search className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Searching...' : 'Search Influencers'}
        </button>
      </div>
    </div>
  )
}

// New Modern Influencer Table
function DiscoveredInfluencersTable({ 
  selectedPlatform, 
  searchResults, 
  isLoading, 
  error,
  searchQuery,
  onViewProfile,
  isInfluencerSaved,
  handleHeartToggle
}: { 
  selectedPlatform: 'instagram' | 'tiktok' | 'youtube'
  searchResults?: any[]
  isLoading?: boolean
  error?: string | null
  searchQuery?: string
  onViewProfile?: (influencer: any) => void
  isInfluencerSaved?: (username: string, platform: string) => boolean
  handleHeartToggle?: (influencer: any) => void
}) {
  const [addingToRoster, setAddingToRoster] = useState<string | null>(null)
  const [rosterMessages, setRosterMessages] = useState<Record<string, { type: 'success' | 'error', message: string }>>({})
  // Use props or fallback to empty array
  const discoveredCreators = searchResults || []
  const showLoading = isLoading || false
  
  const showError = error || null
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })

  // Use the hearted influencers context
  const { heartedInfluencers, addHeartedInfluencer, removeHeartedInfluencer, isInfluencerHearted } = useHeartedInfluencers()
  
  // Debug logging
  React.useEffect(() => {
  }, [heartedInfluencers])



  // Add to roster functionality with COMPLETE Modash data caching
  const handleAddToRoster = async (influencer: any) => {
    if (!influencer.discoveredId) {
      return
    }

    setAddingToRoster(influencer.discoveredId)
    
    try {
      // Extract Modash user ID and platform for complete data caching
      const modashUserId = influencer.userId || influencer.id
      const platform = influencer.platform || selectedPlatform
      
      
      const result = await addToRoster(influencer.discoveredId, modashUserId, platform)
      
      if (result.success) {
        const message = result.hasCompleteData 
          ? 'Successfully added to roster with complete analytics! 🎉'
          : 'Successfully added to roster!'
          
        setRosterMessages(prev => ({
          ...prev,
          [influencer.discoveredId]: {
            type: 'success',
            message: message
          }
        }))
        
        // Clear message after 4 seconds (longer for complete data message)
        setTimeout(() => {
          setRosterMessages(prev => {
            const newMessages = { ...prev }
            delete newMessages[influencer.discoveredId]
            return newMessages
          })
        }, 4000)
      } else {
        setRosterMessages(prev => ({
          ...prev,
          [influencer.discoveredId]: {
            type: 'error',
            message: result.error || 'Failed to add to roster'
          }
        }))
      }
    } catch (error) {
      setRosterMessages(prev => ({
        ...prev,
        [influencer.discoveredId]: {
          type: 'error',
          message: 'Failed to add to roster'
        }
      }))
    } finally {
      setAddingToRoster(null)
    }
  }

  // Generate title for multi-platform discovery
  const getDiscoveryTitle = () => {
    return `Discovered Creators (${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Stats)`
  }

  // Handle sorting - improved to handle different data structures
  const handleSort = (key: string) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    
    setSortConfig({
      key,
      direction: newDirection
    })
  }

  // Sort data - improved to handle different property names and nested data
  const sortedInfluencers = React.useMemo(() => {
    const sortableInfluencers = [...discoveredCreators]
    
    if (sortConfig.key) {
      sortableInfluencers.sort((a, b) => {
        let aValue: any
        let bValue: any
        
        // Handle different sorting keys with proper property mapping
        switch (sortConfig.key) {
          case 'display_name':
            aValue = a.displayName || a.display_name || a.username || ''
            bValue = b.displayName || b.display_name || b.username || ''
            break
          case 'followers':
            // Get platform-specific followers with improved fallback logic
            const aPlatformData = a.platforms?.[selectedPlatform] || 
              (a.platforms ? Object.values(a.platforms)[0] : a)
            const bPlatformData = b.platforms?.[selectedPlatform] || 
              (b.platforms ? Object.values(b.platforms)[0] : b)
            
            // Convert to number explicitly and handle undefined/null cases
            aValue = Number(aPlatformData?.followers || a.followers || 0) || 0
            bValue = Number(bPlatformData?.followers || b.followers || 0) || 0
            break
          case 'engagement_rate':
            // Get platform-specific engagement rate with improved fallback logic
            const aEngagementData = a.platforms?.[selectedPlatform] || 
              (a.platforms ? Object.values(a.platforms)[0] : a)
            const bEngagementData = b.platforms?.[selectedPlatform] || 
              (b.platforms ? Object.values(b.platforms)[0] : b)
            
            // Convert to number explicitly and handle undefined/null cases
            aValue = Number(aEngagementData?.engagement_rate || a.engagement_rate || 0) || 0
            bValue = Number(bEngagementData?.engagement_rate || b.engagement_rate || 0) || 0
            break
          default:
            aValue = a[sortConfig.key as keyof typeof a]
            bValue = b[sortConfig.key as keyof typeof b]
        }
        
        // Handle null/undefined values with proper type checking
        if (aValue == null || aValue === undefined) {
          aValue = (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') ? 0 : ''
        }
        if (bValue == null || bValue === undefined) {
          bValue = (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') ? 0 : ''
        }
        
        // Handle numeric comparisons with explicit type checking
        if (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') {
          // Ensure we're working with numbers
          const numA = typeof aValue === 'number' ? aValue : Number(aValue) || 0
          const numB = typeof bValue === 'number' ? bValue : Number(bValue) || 0
          
          const result = sortConfig.direction === 'asc' ? numA - numB : numB - numA
          return result
        }
        
        // Handle string comparisons (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        // Handle general comparisons
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    return sortableInfluencers
  }, [discoveredCreators, sortConfig, selectedPlatform])

  // Sort icon component
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sortConfig.key === columnKey
    const isAsc = sortConfig.direction === 'asc'
    
    if (!isActive) {
      return (
        <div className="flex flex-col">
          <ChevronUp size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors -mb-1" />
          <ChevronDown size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
      )
    }
    
    return (
      <div className="flex flex-col">
        <ChevronUp size={12} className={`transition-colors -mb-1 ${isAsc ? 'text-blue-600' : 'text-gray-300'}`} />
        <ChevronDown size={12} className={`transition-colors ${!isAsc ? 'text-blue-600' : 'text-gray-300'}`} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">{getDiscoveryTitle()}</h3>
            {searchQuery?.trim() && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Exact Match
                </span>
                <span className="text-sm text-gray-500">for "{searchQuery}"</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>

              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('display_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Influencer</span>
                  <SortIcon columnKey="display_name" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('followers')}
              >
                <div className="flex items-center space-x-1">
                  <span>Followers ({selectedPlatform})</span>
                  <SortIcon columnKey="followers" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('engagement_rate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Engagement ({selectedPlatform})</span>
                  <SortIcon columnKey="engagement_rate" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {showLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">Searching Modash database...</span>
                  </div>
                </td>
              </tr>
            ) : showError ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-center">
                    <div className="text-red-600 font-medium mb-2">Search Failed</div>
                    <div className="text-gray-600 text-sm">{showError}</div>
                  </div>
                </td>
              </tr>
            ) : sortedInfluencers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-600 font-medium mb-2">No influencers found</div>
                    <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedInfluencers.map((creator, index) => {
                // Check if this is a multi-platform creator
                const isMultiPlatform = creator.platforms && Object.keys(creator.platforms).length > 1
                
                // Get platform-specific data ONLY for the selected platform - NO FALLBACKS!
                const primaryPlatformData = creator.platforms?.[selectedPlatform] || creator
                
                // Helpers to mirror popup logic
                const displayName = creator.name || creator.displayName || creator.display_name || creator.username
                const handle = creator.username || (primaryPlatformData as any)?.username
                const pictureSrc = creator.picture || creator.profilePicture || creator.profile_picture
                const toPct = (n: any): string => {
                  const num = Number(n)
                  if (!num) return '0.00%'
                  return num > 1 ? `${num.toFixed(2)}%` : `${(num * 100).toFixed(2)}%`
                }
                // Use EXACT same logic as popup OverviewSection (getMetricValue function)
                const getMetricValue = (primaryValue: any, fallbackValue?: any): any => {
                  return primaryValue !== undefined && primaryValue !== null ? primaryValue : fallbackValue
                }
                
                const engagementRaw = getMetricValue(
                  (primaryPlatformData as any)?.engagement_rate || (primaryPlatformData as any)?.engagementRate,
                  (creator as any).engagement_rate || (creator as any).engagementRate
                )
                
                return (
                  <tr key={creator.creatorId || creator.userId || `creator-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={pictureSrc} 
                          alt={displayName || ''}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {displayName || creator.username}
                            {creator.verified && (
                              <CheckCircle size={14} className="ml-2 text-blue-500" />
                            )}
                          </div>
                          {/* Show platform handles */}
                          {isMultiPlatform ? (
                            <div className="text-xs text-gray-500 space-y-1 mt-1">
                              {Object.entries(creator.platforms).map(([platform, data]: [string, any]) => (
                                <div key={platform} className="flex items-center space-x-1">
                                  <span className="capitalize">{platform}:</span>
                                  <span>@{data.username}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              @{handle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {isMultiPlatform ? (
                          Object.entries(creator.platforms).map(([platform, data]: [string, any]) => (
                            <div key={platform} className="flex items-center space-x-1">
                              {platform === 'instagram' && (
                                <a 
                                  href={data.url || `https://www.instagram.com/${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                  title={`View on Instagram (@${data.username})`}
                                >
                                  <InstagramLogo />
                                </a>
                              )}
                              {platform === 'youtube' && (
                                <a 
                                  href={data.url || `https://www.youtube.com/@${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                  title={`View on YouTube (@${data.username})`}
                                >
                                  <YouTubeLogo />
                                </a>
                              )}
                              {platform === 'tiktok' && (
                                <a 
                                  href={data.url || `https://www.tiktok.com/@${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                  title={`View on TikTok (@${data.username})`}
                                >
                                  <TikTokLogo />
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            {/* For single platform, use the selected platform data */}
                            {(() => {
                              const platformData = creator.platforms?.[selectedPlatform] || creator
                              const username = platformData?.username || creator.username
                              const url = platformData?.url || creator.url
                              
                              if (selectedPlatform === 'instagram' || !selectedPlatform) {
                                return (
                                  <a 
                                    href={url || `https://www.instagram.com/${username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                    title={`View on Instagram (@${username})`}
                                  >
                                    <InstagramLogo />
                                  </a>
                                )
                              } else if (selectedPlatform === 'youtube') {
                                return (
                                  <a 
                                    href={url || `https://www.youtube.com/@${username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                    title={`View on YouTube (@${username})`}
                                  >
                                    <YouTubeLogo />
                                  </a>
                                )
                              } else if (selectedPlatform === 'tiktok') {
                                return (
                                  <a 
                                    href={url || `https://www.tiktok.com/@${username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer" 
                                    title={`View on TikTok (@${username})`}
                                  >
                                    <TikTokLogo />
                                  </a>
                                )
                              }
                              return null
                            })()}
                          </>
                        )}
                        
                        {/* 🔗 Connected Social Media Platforms - Bulletproof Implementation */}
                        {creator.contacts && creator.contacts.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {creator.contacts.map((contact: any, contactIndex: number) => {
                              // Validate URL and get platform info
                              const platformUrl = validateAndSanitizeUrl(contact)
                              const platformIcon = getPlatformIconJSX(contact.type)
                              const platformColor = getPlatformColor(contact.type)
                              
                              // Skip invalid contacts
                              if (!platformUrl || !platformIcon || !contact.type) {
                                return null
                              }
                              
                              const platformName = contact.type.charAt(0).toUpperCase() + contact.type.slice(1)
                              
                              return (
                                <a
                                  key={`contact-${contactIndex}-${contact.type}`}
                                  href={platformUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation() // Prevent table row click interference
                                    // Optional: Add analytics tracking
                                  }}
                                  className={`
                                    ${platformColor}
                                    hover:bg-gray-100 p-1 rounded transition-all duration-200 cursor-pointer
                                    opacity-75 hover:opacity-100 hover:scale-105
                                    flex items-center justify-center
                                  `.trim()}
                                  title={`Open ${platformName} profile`}
                                  aria-label={`Open ${platformName} profile in new tab`}
                                >
                                  {platformIcon}
                                </a>
                              )
                            }).filter(Boolean)} {/* Remove null entries */}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber((primaryPlatformData as any)?.followers ?? (creator as any).followers ?? 0)}
                      </div>
                      {isMultiPlatform && (
                        <div className="text-xs text-gray-500">
                          {selectedPlatform} • {formatNumber(creator.totalFollowers)} total
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {toPct(engagementRaw)}
                      </div>
                      {isMultiPlatform && (
                        <div className="text-xs text-gray-500">{selectedPlatform} only</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`p-2 transition-colors rounded-lg ${
                            isInfluencerSaved?.(creator.username || creator.instagram_handle?.replace('@', '') || creator.tiktok_handle?.replace('@', '') || creator.youtube_handle?.replace('@', '') || 'unknown', selectedPlatform) 
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                          }`}
                          title={isInfluencerSaved?.(creator.username || creator.instagram_handle?.replace('@', '') || creator.tiktok_handle?.replace('@', '') || creator.youtube_handle?.replace('@', '') || 'unknown', selectedPlatform) ? "Already saved" : "Save to favorites"}
                          onClick={() => handleHeartToggle?.(creator)}
                        >
                          <Heart 
                            size={16} 
                            fill={isInfluencerSaved?.(creator.username || creator.instagram_handle?.replace('@', '') || creator.tiktok_handle?.replace('@', '') || creator.youtube_handle?.replace('@', '') || 'unknown', selectedPlatform) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                          title="View Profile"
                          onClick={() => onViewProfile?.(creator)}
                        >
                          <Eye size={16} />
                        </button>
                        {creator.discoveredId && (
                          <button 
                            className={`p-2 transition-colors rounded-lg ${
                              addingToRoster === creator.discoveredId
                                ? 'text-blue-500 bg-blue-50'
                                : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title="Add to Roster"
                            onClick={() => handleAddToRoster(creator)}
                            disabled={addingToRoster === creator.discoveredId}
                          >
                            {addingToRoster === creator.discoveredId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        )}
                      </div>
                      {/* Roster message */}
                      {creator.discoveredId && rosterMessages[creator.discoveredId] && (
                        <div className={`mt-1 text-xs ${
                          rosterMessages[creator.discoveredId]?.type === 'success' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {rosterMessages[creator.discoveredId]?.message}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DiscoveryPageClient() {
  // Add heart context to main component for debugging
  const { heartedInfluencers } = useHeartedInfluencers()
  
  // Toast notifications
  const { toast } = useToast()
  
  // Tab state - Search or Saved
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  
  // Platform state moved here to share between components
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  
  // Staff saved influencers hook (after platform state)
  const { saveInfluencer, isInfluencerSaved, savedInfluencers } = useStaffSavedInfluencers(selectedPlatform)
  
  // API state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [apiWarning, setApiWarning] = useState<string | null>(null)
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Current filters state
  const [currentFilters, setCurrentFilters] = useState<any>({})
  

  
  // Auto-search when platform changes (only if there are existing results or search query)
  useEffect(() => {
    // Only trigger auto-search if we have existing search results or a search query
    if ((searchResults.length > 0 || searchQuery.trim()) && !isSearching) {
      handleSearch()
    }
  }, [selectedPlatform])
  
  // Enhanced search function with full API integration
  const handleSearch = async () => {
    setIsSearching(true)
    setSearchError(null)
    setApiWarning(null)
    
    try {
      // Combine current filters with search query
      const filters: any = {
        ...currentFilters,
        platform: selectedPlatform,
      }
      
      // Only add searchQuery if provided
      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim()
      }
      
      
      // Smart API selection: use List Users for simple searches, Search Influencers for complex filtering
      const activeFilters = Object.keys(currentFilters).filter(k => {
        const value = currentFilters[k]
        return value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)
      })
      const hasComplexFilters = activeFilters.length > 0
      
      
      let apiEndpoint = '/api/discovery/search'
      let requestBody = filters
      
      // FORCE simple text searches to use List Users API - ignore filters for exact username searches
      if (searchQuery.trim()) {
        apiEndpoint = '/api/discovery/search'
        // Send clean request body for simple searches - only essential fields
        requestBody = {
          platform: selectedPlatform,
          searchQuery: searchQuery.trim(),
          preferFreeAPI: true
        }
      } else if (hasComplexFilters) {
        // Transform current filters to new API format
        const searchFilters: any = {
          influencer: {},
          audience: {}
        }
        
        // Map follower filters - Fix mapping from getCurrentFilters()
        if (currentFilters.followersMin || currentFilters.followersMax) {
          searchFilters.influencer.followers = {}
          if (currentFilters.followersMin) searchFilters.influencer.followers.min = currentFilters.followersMin
          if (currentFilters.followersMax) searchFilters.influencer.followers.max = currentFilters.followersMax
        }
        
        // Map engagement rate - Fix mapping from getCurrentFilters()
        if (currentFilters.engagementRate) {
          searchFilters.influencer.engagementRate = currentFilters.engagementRate / 100 // Convert percentage to decimal
        }
        
        // Map verification - Fix mapping from getCurrentFilters()
        if (currentFilters.verifiedOnly === true) {
          searchFilters.influencer.isVerified = true
        }
        
        // Map bio search
        if (currentFilters.bio) {
          searchFilters.influencer.bio = currentFilters.bio
        }
        
        // Map hashtags and mentions as textTags per API spec
        const textTags: Array<{ type: 'hashtag' | 'mention', value: string }> = []
        if (currentFilters.hashtags) {
          currentFilters.hashtags.split(',').forEach((tag: string) => {
            const cleanTag = tag.trim().replace('#', '')
            if (cleanTag) textTags.push({ type: 'hashtag', value: cleanTag })
          })
        }
        if (currentFilters.mentions) {
          currentFilters.mentions.split(',').forEach((mention: string) => {
            const cleanMention = mention.trim().replace('@', '')
            if (cleanMention) textTags.push({ type: 'mention', value: cleanMention })
          })
        }
        if (textTags.length > 0) {
          searchFilters.influencer.textTags = textTags
        }
        
        // Map captions as keywords per API spec
        if (currentFilters.captions) {
          searchFilters.influencer.keywords = currentFilters.captions
        }
        
        // Map locations - Handle multiple location selection
        if (currentFilters.selectedLocations && currentFilters.selectedLocations.length > 0) {
          // Convert string IDs to numbers for Modash API
          searchFilters.influencer.location = currentFilters.selectedLocations.map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id))
        }
        
        // Map language - Fix mapping from getCurrentFilters()
        if (currentFilters.selectedLanguage) {
          searchFilters.influencer.language = currentFilters.selectedLanguage
        }
        
        // Map gender - Fix mapping from getCurrentFilters()
        if (currentFilters.selectedGender) {
          searchFilters.influencer.gender = currentFilters.selectedGender.toUpperCase()
        }
        
        // Map account type per API spec
        if (currentFilters.accountType) {
          const accountTypeMap: Record<string, number[]> = {
            'regular': [1],
            'business': [2], 
            'creator': [3]
          }
          if (accountTypeMap[currentFilters.accountType.toLowerCase()]) {
            searchFilters.influencer.accountTypes = accountTypeMap[currentFilters.accountType.toLowerCase()]
          }
        }
        
        // Map last posted per API spec
        if (currentFilters.lastPosted) {
          const daysMap: Record<string, number> = {
            '30': 30,
            '60': 60,
            '90': 90
          }
          if (daysMap[currentFilters.lastPosted]) {
            searchFilters.influencer.lastposted = daysMap[currentFilters.lastPosted]
          }
        }
        
        // Add audience credibility (fake follower protection)
        searchFilters.audience.credibility = 0.8 // 80% real followers minimum
        
        apiEndpoint = '/api/discovery/search-v2'
        requestBody = {
          platform: selectedPlatform,
          page: 0,
          sort: { field: 'followers', direction: 'desc' },
          filter: searchFilters
        }
        
      }

      const response = await fetch(`${window.location.origin}${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Search failed: ${response.status} ${response.statusText}`
        
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.code === 'AUTH_REQUIRED') {
            errorMessage = `Authentication required: ${errorData.message}`
            // Redirect to sign-in or refresh the page to trigger re-auth
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // If error text is not JSON, use the original error
        }
        
        
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      // Handle different response formats
      let searchResults = []
      let creditsUsed = 0
      
      if (apiEndpoint === '/api/discovery/search-v2') {
        // New Search Influencers API format
        if (result.success && result.influencers) {
          searchResults = result.influencers
          creditsUsed = result.influencers.length * 0.01 // 0.01 credits per result
          
        } else {
          throw new Error(result.error || 'Advanced search failed')
        }
      } else {
        // Legacy API format
        if (result.success && result.data) {
          searchResults = result.data.results || []
          creditsUsed = result.data.creditsUsed || 0
          
          // Check if using mock data
          if (result.warning) {
            setApiWarning(result.warning)
          }
          
        } else {
          throw new Error(result.details || 'Search failed')
        }
      }
      
      
      setSearchResults(searchResults)
      
      // Refresh credits if the search consumed credits
      if (creditsUsed > 0) {
        setTimeout(() => {
          // Use the simplified refresh method
          import('@/lib/services/credits').then(({ creditsService }) => {
            creditsService.refreshAfterAction('search')
          })
        }, 1000)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      
      // Show helpful error messages based on error type
      if (errorMessage.includes('Authentication required')) {
        setSearchError('⚠️ Your session has expired. Please refresh the page to sign in again.')
      } else if (errorMessage.includes('rate limit')) {
        setSearchError('⏱️ Too many requests. Please wait a moment before searching again.')
      } else if (errorMessage.includes('server error')) {
        setSearchError('🔧 Service temporarily unavailable. Please try again in a few minutes.')
      } else if (errorMessage.includes('API key')) {
        setSearchError('🔑 API configuration issue. Please contact support.')
      } else {
        setSearchError(`❌ ${errorMessage}`)
      }
      
      setSearchResults([]) // No fallback data
    } finally {
      setIsSearching(false)
    }
  }
  
  // Credits are now managed by CreditCardComponent hooks

  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [detailInfluencer, setDetailInfluencer] = useState<any | null>(null)
  const [detailCity, setDetailCity] = useState<string | undefined>()
  const [detailCountry, setDetailCountry] = useState<string | undefined>()
  const [detailLoading, setDetailLoading] = useState(false)

  // Toggle heart status for an influencer - saves to staff system with FULL analytics
  const handleHeartToggle = async (influencer: any) => {
    
    const username = influencer.username || influencer.instagram_handle?.replace('@', '') || influencer.tiktok_handle?.replace('@', '') || influencer.youtube_handle?.replace('@', '') || 'unknown'
    
    // Validate username before proceeding
    if (!username || username === 'unknown') {
      toast({
        title: "Unable to save influencer",
        description: "No valid username found for this influencer.",
        variant: "destructive"
      })
      return
    }
    
    if (isInfluencerSaved(username, selectedPlatform)) {
      toast({
        title: "Already saved",
        description: "This influencer is already in your saved list. Use the Saved tab to manage saved influencers.",
        variant: "default"
      })
      return
    }

    // Fetch COMPLETE Modash analytics before saving
    try {
      
      const modashUserId = influencer.userId || influencer.creatorId
      if (!modashUserId) {
        throw new Error('No Modash user ID available for this influencer')
      }

      // Fetch complete profile data
      const profileResponse = await fetch('/api/discovery/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: modashUserId,
          platform: selectedPlatform,
          includePerformanceData: true
        })
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch complete profile data')
      }

      const profileData = await profileResponse.json()
      
      // Fetch extended analytics (hashtags, partnerships, audience interests, etc.)
      const extendedResponse = await fetch('/api/discovery/profile-extended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: modashUserId,
          platform: selectedPlatform,
          sections: ['hashtags', 'partnerships', 'mentions', 'topics', 'interests', 'languages']
        })
      })

      let extendedData = null
      if (extendedResponse.ok) {
        const extendedResult = await extendedResponse.json()
        extendedData = extendedResult.data
      }

      // Combine search result with complete analytics
      const enrichedInfluencerData = {
        // Original search result data
        ...influencer,
        // Complete Modash profile data
        ...profileData.data,
        // Extended analytics
        extended_analytics: extendedData
      }


      const savedInfluencerData = {
        username,
        display_name: profileData.data?.fullname || influencer.displayName || influencer.display_name || influencer.username,
        platform: selectedPlatform,
        followers: profileData.data?.followers || influencer.platforms?.[selectedPlatform]?.followers || influencer.followers || 0,
        engagement_rate: profileData.data?.engagementRate || influencer.platforms?.[selectedPlatform]?.engagement_rate || influencer.engagement_rate || 0,
        avg_likes: profileData.data?.avgLikes || influencer.avgLikes,
        avg_views: profileData.data?.avgViews || influencer.avgViews,
        avg_comments: profileData.data?.avgComments || influencer.avgComments,
        profile_picture: profileData.data?.picture || influencer.profilePicture || influencer.profile_picture || influencer.picture,
        bio: profileData.data?.bio || influencer.bio,
        location: profileData.data?.location || influencer.location,
        niches: influencer.niches || [influencer.niche].filter(Boolean) || [],
        profile_url: profileData.data?.url || influencer.url || `https://${selectedPlatform}.com/${username}`,
        modash_user_id: modashUserId,
        modash_data: enrichedInfluencerData, // Store COMPLETE analytics data
        discovered_influencer_id: influencer.discoveredId
      }
      
      
      const saveResult = await saveInfluencer(savedInfluencerData)
      
      toast({
        title: "✅ Influencer saved!",
        description: `${savedInfluencerData.display_name || username} has been saved to your favorites with complete analytics.`,
        variant: "default"
      })
      
    } catch (error) {
      // Fallback to basic save if analytics fetch fails
      try {
        const basicSavedData = {
          username,
          display_name: influencer.displayName || influencer.display_name || influencer.username,
          platform: selectedPlatform,
          followers: influencer.platforms?.[selectedPlatform]?.followers || influencer.followers || 0,
          engagement_rate: influencer.platforms?.[selectedPlatform]?.engagement_rate || influencer.engagement_rate || 0,
          avg_likes: influencer.avgLikes,
          avg_views: influencer.avgViews,
          avg_comments: influencer.avgComments,
          profile_picture: influencer.profilePicture || influencer.profile_picture || influencer.picture,
          bio: influencer.bio,
          location: influencer.location,
          niches: influencer.niches || [influencer.niche].filter(Boolean) || [],
          profile_url: influencer.url || `https://${selectedPlatform}.com/${username}`,
          modash_user_id: influencer.userId || influencer.creatorId,
          modash_data: influencer, // Basic search result data
          discovered_influencer_id: influencer.discoveredId
        }
        
        const fallbackResult = await saveInfluencer(basicSavedData)
        toast({
          title: "⚠️ Partially saved",
          description: `${basicSavedData.display_name || username} has been saved with basic data only. Full analytics could not be retrieved.`,
          variant: "default"
        })
        
      } catch (fallbackError) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        toast({
          title: "❌ Failed to save influencer",
          description: `${errorMessage}. Please check your connection and try again.`,
          variant: "destructive"
        })
      }
    }
  }

  // Handler to open detail panel and fetch comprehensive data
  const handleViewProfile = async (influencer: any) => {
    setDetailPanelOpen(true)
    setDetailInfluencer(influencer)
    setDetailLoading(true)
    
    // Use location from search results as fallback
    const fallbackLocation = influencer.location || 'Unknown'
    const [fallbackCity, fallbackCountry] = fallbackLocation.includes(',') 
      ? fallbackLocation.split(',').map((s: string) => s.trim())
      : [fallbackLocation, 'Unknown']
    
    setDetailCity(fallbackCity)
    setDetailCountry(fallbackCountry)
    
    try {
      // Force the selected platform - NO fallbacks to prevent cross-platform contamination
      const platformData = influencer.platforms?.[selectedPlatform]
      const actualPlatform = selectedPlatform
      
      // Don't fallback to other platforms - this causes wrong data to show!
      if (!platformData) {
      }
      
      const userId = platformData?.userId || influencer.userId
      
      if (!userId) {
        setDetailLoading(false)
        return
      }
      
      
      
      // Fetch core profile data first (faster)
      try {
        const coreResponse = await fetch(`${window.location.origin}/api/discovery/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            platform: actualPlatform,
            includeReport: true,
            includePerformanceData: true, // Request real performance data
            // Pass the real search result data to be enhanced
            searchResultData: {
              username: influencer.username,
              handle: influencer.handle,
              followers: influencer.followers,
              engagement_rate: influencer.engagement_rate,
              platform: actualPlatform,
              // Try multiple profile picture fields from different APIs
              profile_picture: influencer.profile_picture || influencer.profilePicture || influencer.picture || influencer.avatar_url || platformData?.profile_picture,
              location: influencer.location,
              verified: influencer.verified
            }
          })
        })
        
        // Process core data first to show basic profile immediately
        if (coreResponse.ok) {
          const coreResult = await coreResponse.json()
          if (coreResult.success && coreResult.data) {
            // Show basic profile immediately
            const coreInfluencer = {
              ...influencer,
              // Pure Modash data - no .value wrappers
              followers: coreResult.data.followers || influencer.followers,
              engagement_rate: coreResult.data.engagementRate || influencer.engagement_rate,
              avgLikes: coreResult.data.avgLikes || 0,
              avgComments: coreResult.data.avgComments || 0,
              avgShares: coreResult.data.avgShares || 0,
              fake_followers_percentage: coreResult.data.fake_followers_percentage,
              credibility: coreResult.data.credibility,
              // Rich Modash audience data (already structured for UI)
              audience: coreResult.data.audience,
              audience_interests: coreResult.data.audience_interests,
              audience_languages: coreResult.data.audience_languages,
              relevant_hashtags: coreResult.data.relevant_hashtags,
              brand_partnerships: coreResult.data.brand_partnerships,
              content_topics: coreResult.data.content_topics,
              
              // 🔗 SOCIAL MEDIA CONTACTS from API
              contacts: coreResult.data.contacts || [],
              
              // 📊 Initialize platforms data structure with current platform
              platforms: {
                [actualPlatform]: {
                  followers: coreResult.data.followers,
                  engagementRate: coreResult.data.engagementRate,
                  avgLikes: coreResult.data.avgLikes,
                  avgComments: coreResult.data.avgComments,
                  avgShares: coreResult.data.avgShares,
                  fake_followers_percentage: coreResult.data.fake_followers_percentage,
                  credibility: coreResult.data.credibility,
                  audience: coreResult.data.audience,
                  audience_interests: coreResult.data.audience_interests,
                  audience_languages: coreResult.data.audience_languages,
                  relevant_hashtags: coreResult.data.relevant_hashtags,
                  brand_partnerships: coreResult.data.brand_partnerships,
                  content_topics: coreResult.data.content_topics,
                  statsByContentType: coreResult.data.statsByContentType,
                  topContent: coreResult.data.topContent,
                  // Platform-specific profile picture
                  profile_picture: coreResult.data.profile_picture || coreResult.data.profilePicture,
                  profilePicture: coreResult.data.profile_picture || coreResult.data.profilePicture,
                  ...coreResult.data
                }
              },
              
              // 🚨 FIX: Add missing TikTok fields from API response
              engagements: coreResult.data.engagements,
              totalLikes: coreResult.data.totalLikes,
              averageViews: coreResult.data.averageViews,
              postsCount: coreResult.data.postsCount,
              gender: coreResult.data.gender,
              ageGroup: coreResult.data.ageGroup,
              city: coreResult.data.city,
              state: coreResult.data.state,
              country: coreResult.data.country,
              bio: coreResult.data.bio,
              recentPosts: coreResult.data.recentPosts,
              popularPosts: coreResult.data.popularPosts,
              sponsoredPosts: coreResult.data.sponsoredPosts,
              statHistory: coreResult.data.statHistory,
              paidPostPerformance: coreResult.data.paidPostPerformance,
              paidPostPerformanceViews: coreResult.data.paidPostPerformanceViews,
              sponsoredPostsMedianViews: coreResult.data.sponsoredPostsMedianViews,
              sponsoredPostsMedianLikes: coreResult.data.sponsoredPostsMedianLikes,
              nonSponsoredPostsMedianViews: coreResult.data.nonSponsoredPostsMedianViews,
              nonSponsoredPostsMedianLikes: coreResult.data.nonSponsoredPostsMedianLikes,
              audienceExtra: coreResult.data.audienceExtra,
              statsByContentType: coreResult.data.statsByContentType,
              // Brand and sponsorship data for popup
              brandAffinity: coreResult.data.brand_affinity || [],
              mentions: coreResult.data.brand_mentions || [],
              sponsored_performance: coreResult.data.sponsored_performance || {},
              // Performance data for reels/stories sections
              content_performance: coreResult.data.content_performance || null,
              // Raw Modash data for advanced features
              genders: coreResult.data.genders,
              ages: coreResult.data.ages,
              geoCountries: coreResult.data.geoCountries,
              languages: coreResult.data.languages,
              interests: coreResult.data.interests
            }
            
            setDetailInfluencer(coreInfluencer)
            setDetailLoading(false) // Show basic profile
            
            
            // Step 2: Fetch extended data in background
              try {
              const extendedResponse = await fetch(`${window.location.origin}/api/discovery/profile-extended`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  platform: actualPlatform,
                    sections: ['hashtags', 'partnerships', 'topics', 'interests', 'languages', 'overlap'] // Include overlap for audience analysis
                })
              })
              
              if (extendedResponse.ok) {
                const extendedResult = await extendedResponse.json()
                if (extendedResult.success && extendedResult.data) {
                  // DEBUG: Check extended API overlap data
                  
                  // Merge extended data with core data
                  const fullInfluencer = {
                    ...coreInfluencer,
                    relevant_hashtags: extendedResult.data.hashtags?.value || [],
                    // Keep original brand_partnerships from core API (has proper sponsors structure)
                    // brand_partnerships: extendedResult.data.partnerships?.value || coreInfluencer.brand_partnerships,
                    content_topics: extendedResult.data.topics?.value || [],
                    audience_interests: extendedResult.data.interests?.value || [],
                    audience_languages: extendedResult.data.languages?.value || [],

                    // Enhanced sponsorship data from extended API (prefer extended data with full sponsor details)
                    sponsoredPosts: extendedResult.data.partnerships?.value || coreInfluencer.sponsoredPosts,
                    partnerships_aggregate_metrics: extendedResult.data.partnerships?.aggregate_metrics || {},
                    extendedDataConfidence: {
                      hashtags: extendedResult.data.hashtags?.confidence || 'low',
                      partnerships: extendedResult.data.partnerships?.confidence || 'low',
                      topics: extendedResult.data.topics?.confidence || 'low',
                      interests: extendedResult.data.interests?.confidence || 'low',
                      languages: extendedResult.data.languages?.confidence || 'low',

                    }
                  }
                  

                  
                  setDetailInfluencer(fullInfluencer)
                }
              }
            } catch (extendedError) {
              // Core profile still works without extended data
            }
            
            return // Exit here since we've handled the response
          }
        }
        
        // Fallback to old method if new tiered approach fails
        const response = coreResponse
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Merge the comprehensive data with the existing influencer data
            const enhancedInfluencer = {
              ...influencer,
              // Override with enhanced data if available
              followers: result.data.followers || influencer.followers,
              engagement_rate: result.data.engagementRate || influencer.engagement_rate,
              
              // 🔗 SOCIAL MEDIA CONTACTS from API
              contacts: result.data.contacts || influencer.contacts || [],
              
              // 📊 Ensure platforms data structure with enhanced data
              platforms: {
                ...influencer.platforms,
                [actualPlatform]: {
                  followers: result.data.followers,
                  engagementRate: result.data.engagementRate,
                  avgLikes: result.data.avgLikes,
                  avgComments: result.data.avgComments,
                  avgShares: result.data.avgShares,
                  fake_followers_percentage: result.data.fake_followers_percentage,
                  credibility: result.data.credibility,
                  audience: result.data.audience,
                  audience_interests: result.data.audience_interests,
                  audience_languages: result.data.audience_languages,
                  relevant_hashtags: result.data.relevant_hashtags,
                  brand_partnerships: result.data.brand_partnerships,
                  content_topics: result.data.content_topics,
                  statsByContentType: result.data.statsByContentType,
                  topContent: result.data.topContent,
                  content_performance: result.data.content_performance,
                  growth_trends: result.data.growth_trends,
                  // Platform-specific profile picture
                  profile_picture: result.data.profile_picture || result.data.profilePicture,
                  profilePicture: result.data.profile_picture || result.data.profilePicture,
                  ...result.data
                }
              },
              
              // Add demographic and audience data
              audience: result.data.audience || {},
              demographics: result.data.demographics || {},
              engagement: result.data.engagement || {},
              
              // Add engagement metrics
              avgLikes: result.data.avgLikes || 0,
              avgComments: result.data.avgComments || 0,
              avgShares: result.data.avgShares || 0,
              
              // Enhanced engagement metrics
              fake_followers_percentage: result.data.fake_followers_percentage,
              fake_followers_quality: result.data.fake_followers_quality,
              estimated_impressions: result.data.estimated_impressions,
              estimated_reach: result.data.estimated_reach,
              
              // Growth trends
              growth_trends: result.data.growth_trends,
              
              // Content performance breakdown
              content_performance: result.data.content_performance,
              
              // Paid vs organic performance
              paid_vs_organic: result.data.paid_vs_organic,
              
              // Add additional metadata that might be in the API response
              accountType: result.data.accountType || influencer.accountType,
              country: result.data.country || influencer.country,
              ageGroup: result.data.ageGroup || influencer.ageGroup,
              isPrivate: result.data.isPrivate || influencer.isPrivate,
              postCount: result.data.postCount || influencer.postCount,
              
              // Keep recent posts if available
              recentPosts: result.data.recentPosts || [],
              
              // Brand and sponsorship data
              brand_partnerships: result.data.brand_partnerships || [],
              sponsoredPosts: result.data.brand_partnerships || [],
              brandAffinity: result.data.brand_affinity || [],
              mentions: result.data.brand_mentions || [],
              sponsored_performance: result.data.sponsored_performance || {},
              
              // Legacy compatibility
              paidPostPerformance: result.data.paidPostPerformance,
              sponsoredPostsMedianLikes: result.data.sponsoredPostsMedianLikes,
              nonSponsoredPostsMedianLikes: result.data.nonSponsoredPostsMedianLikes
            }
            
            // Update the detail influencer with enhanced data
            setDetailInfluencer(enhancedInfluencer)
          } else {
            // Use the basic influencer data without enhancement
            setDetailInfluencer(influencer)
          }
        } else {
        }
      } catch (error) {
      }
      
      // Also fetch basic location data as fallback
      try {
        const locationResponse = await fetch(`${window.location.origin}/api/discovery/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            platform: actualPlatform,
            includeReport: false
          })
        })
        
        if (locationResponse.ok) {
          const locationResult = await locationResponse.json()
          if (locationResult.success && locationResult.data && (locationResult.data.city || locationResult.data.country)) {
            setDetailCity(locationResult.data.city || fallbackCity)
            setDetailCountry(locationResult.data.country || fallbackCountry)
          }
        }
      } catch (locationError) {
      }
      
    } catch (error) {
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-6 pb-8">
        {/* Debug: Show hearted influencers count */}
        {heartedInfluencers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800">
              💖 {heartedInfluencers.length} influencer{heartedInfluencers.length !== 1 ? 's' : ''} favorited
            </p>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CreditCardComponent
            title="Monthly Credits"
            period="monthly"
            icon={<TrendingUp size={20} />}
          />
          <CreditCardComponent
            title="Yearly Credits"
            period="yearly"
            icon={<Calendar size={20} />}
          />
          <MetricCard
            title="Search Mode"
            value={searchQuery.trim() ? 'Exact Match' : 'Discovery'}
            icon={<Search size={20} />}
            trend={searchQuery.trim() ? `Searching: "${searchQuery}"` : 'Browse all influencers'}
          />
        </div>

        {/* API Status Alert */}
        {apiWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Modash API Configuration Required</p>
              <p className="text-sm text-yellow-700 mt-1">{apiWarning}</p>
              <div className="text-xs text-yellow-600 mt-2 space-y-1">
                <p>To activate your Modash API key:</p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li>Visit <a href="https://marketer.modash.io/developer" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">https://marketer.modash.io/developer</a></li>
                  <li>Log in with your Modash account</li>
                  <li>Verify your API key is listed and active</li>
                  <li>Check if Discovery API access is enabled for your plan</li>
                </ol>
                <p className="mt-2">If issues persist, contact support@modash.io with reference to the Discovery API endpoint issues.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {searchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{searchError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              { 
                key: 'search', 
                label: 'Search', 
                icon: Search
              },
              { 
                key: 'saved', 
                label: 'Saved', 
                icon: Heart
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'search' | 'saved')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-bold capitalize">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area - Conditional based on active tab */}
        {activeTab === 'search' ? (
          <div className="flex flex-col lg:flex-row gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Left Column - Search Interface (1/3) */}
            <div className="w-full lg:w-1/3 lg:flex-shrink-0">
              <DiscoverySearchInterface 
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                onSearch={handleSearch}
                isLoading={isSearching}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onFiltersChange={setCurrentFilters}
              />
            </div>

            {/* Right Column - Results Table (2/3) */}
            <div className="flex-1 min-w-0 min-h-0">
              <DiscoveredInfluencersTable 
              selectedPlatform={selectedPlatform}
              searchResults={searchResults}
              isLoading={isSearching}
              error={searchError}
              searchQuery={searchQuery}
              onViewProfile={handleViewProfile}
              isInfluencerSaved={isInfluencerSaved}
              handleHeartToggle={handleHeartToggle}
            />
            </div>
          </div>
        ) : (
          /* Saved Tab Content */
          <div className="space-y-6">
            {/* Platform Selector for Saved Tab */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Platform:</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'instagram' | 'tiktok' | 'youtube')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            {/* Saved Influencers Table */}
            <SavedInfluencersTable 
              selectedPlatform={selectedPlatform}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </main>
      <InfluencerDetailPanel 
        influencer={detailInfluencer}
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        selectedPlatform={selectedPlatform}
        onPlatformSwitch={async (platform) => {
          
          // ALWAYS update the selected platform first for immediate UI feedback
          setSelectedPlatform(platform)
          
          // Try to fetch new data, but don't block UI updates
          if (detailInfluencer) {
            setDetailLoading(true)
            
            try {
              // 🎯 GENIUS APPROACH: Extract userId directly from contact URL!
              
              // Find the contact for the target platform
              const platformContact = detailInfluencer.contacts?.find((contact: any) => contact.type === platform)
              
              if (!platformContact) {
                throw new Error(`No ${platform} contact found for this influencer`)
              }
              
              
              // Extract userId directly from contact URL - no need to search!
              const contactUrl = platformContact.value
              let platformUserId = null
              
              if (contactUrl) {
                
                // Extract userId from URL patterns:
                // TikTok: https://www.tiktok.com/share/user/5831967 → 5831967
                // Instagram: Could be different format - let's see what we get!
                // YouTube: https://www.youtube.com/channel/UC123456 → UC123456
                
                if (platform === 'tiktok') {
                  const tiktokMatch = contactUrl.match(/\/user\/(\d+)/)
                  if (tiktokMatch) {
                    platformUserId = tiktokMatch[1]
                  }
                } else if (platform === 'instagram') {
                  // Let's see what Instagram URLs actually look like
                  
                  // Try different Instagram patterns
                  const patterns = [
                    /\/user\/(\d+)/,                    // /user/12345
                    /\/accounts\/.*\/(\d+)/,            // /accounts/.../12345  
                    /instagram\.com\/([a-zA-Z0-9_.]+)/, // instagram.com/username
                    /\/p\/user\/(\d+)/,                 // /p/user/12345
                    /profile\/(\d+)/                    // profile/12345
                  ]
                  
                  for (const pattern of patterns) {
                    const match = contactUrl.match(pattern)
                    if (match) {
                      platformUserId = match[1]
                      break
                    }
                  }
                  
                  if (!platformUserId) {
                  }
                } else if (platform === 'youtube') {
                  const youtubeMatch = contactUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/)
                  if (youtubeMatch) {
                    platformUserId = youtubeMatch[1]
                  }
                }
                
                if (!platformUserId) {
                  throw new Error(`Could not extract userId from ${platform} contact URL`)
                }
              }
              
              if (!platformUserId) {
                throw new Error(`No userId found in ${platform} contact`)
              }
              
              
              // Fetch the detailed profile directly with the userId from contacts
              const profileResponse = await fetch(`${window.location.origin}/api/discovery/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: platformUserId,
                  platform: platform,
                  includeReport: true,
                  includePerformanceData: true,
                  searchResultData: {
                    username: detailInfluencer.username,
                    handle: detailInfluencer.handle,
                    followers: detailInfluencer.followers,
                    engagement_rate: detailInfluencer.engagement_rate,
                    platform: platform,
                    profile_picture: detailInfluencer.profile_picture,
                    location: detailInfluencer.location,
                    verified: detailInfluencer.verified
                  }
                })
              })
              
              if (!profileResponse.ok) {
                throw new Error(`Profile fetch failed: ${profileResponse.statusText}`)
              }
              
              const profileResult = await profileResponse.json()
              
              if (profileResult.success && profileResult.data) {
                // Update influencer with new platform data
                const updatedInfluencer = {
                  ...detailInfluencer,
                  // 🎯 CRITICAL: Update main fields so ALL components see the new data
                  followers: profileResult.data.followers || detailInfluencer.followers,
                  engagement_rate: profileResult.data.engagementRate || profileResult.data.engagement_rate || detailInfluencer.engagement_rate,
                  engagementRate: profileResult.data.engagementRate || detailInfluencer.engagementRate,
                  avgLikes: profileResult.data.avgLikes || detailInfluencer.avgLikes,
                  avgComments: profileResult.data.avgComments || detailInfluencer.avgComments,
                  profile_picture: profileResult.data.profile_picture || profileResult.data.profilePicture || detailInfluencer.profile_picture,
                  profilePicture: profileResult.data.profile_picture || profileResult.data.profilePicture || detailInfluencer.profilePicture,
                  // Update content data
                  recentPosts: profileResult.data.recentPosts || detailInfluencer.recentPosts,
                  popularPosts: profileResult.data.popularPosts || detailInfluencer.popularPosts,
                  sponsoredPosts: profileResult.data.sponsoredPosts || detailInfluencer.sponsoredPosts,
                  audience: profileResult.data.audience || detailInfluencer.audience,
                  audience_interests: profileResult.data.audience_interests || detailInfluencer.audience_interests,
                  relevant_hashtags: profileResult.data.relevant_hashtags || detailInfluencer.relevant_hashtags,
                  brand_partnerships: profileResult.data.brand_partnerships || detailInfluencer.brand_partnerships,
                  content_topics: profileResult.data.content_topics || detailInfluencer.content_topics,
                  // Store platform-specific data in platforms object (for advanced features)
                  platforms: {
                    ...detailInfluencer.platforms,
                    [platform]: {
                      followers: profileResult.data.followers,
                      engagementRate: profileResult.data.engagementRate,
                      avgLikes: profileResult.data.avgLikes,
                      avgComments: profileResult.data.avgComments,
                      avgShares: profileResult.data.avgShares,
                      fake_followers_percentage: profileResult.data.fake_followers_percentage,
                      credibility: profileResult.data.credibility,
                      audience: profileResult.data.audience,
                      audience_interests: profileResult.data.audience_interests,
                      audience_languages: profileResult.data.audience_languages,
                      relevant_hashtags: profileResult.data.relevant_hashtags,
                      brand_partnerships: profileResult.data.brand_partnerships,
                      content_topics: profileResult.data.content_topics,
                      statsByContentType: profileResult.data.statsByContentType,
                      topContent: profileResult.data.topContent,
                      content_performance: profileResult.data.content_performance,
                      profile_picture: profileResult.data.profile_picture || profileResult.data.profilePicture,
                      profilePicture: profileResult.data.profile_picture || profileResult.data.profilePicture,
                      recentPosts: profileResult.data.recentPosts,
                      popularPosts: profileResult.data.popularPosts,
                      sponsoredPosts: profileResult.data.sponsoredPosts,
                      statHistory: profileResult.data.statHistory,
                      paidPostPerformance: profileResult.data.paidPostPerformance,
                      ...profileResult.data
                    }
                  },
                  // Keep original data as fallbacks and update contacts
                  contacts: profileResult.data.contacts || detailInfluencer.contacts || [],
                  // Include ALL other platform data for complete panel functionality
                  ...profileResult.data,
                  // 🔄 Force re-render with timestamp
                  lastUpdated: Date.now(),
                  currentPlatform: platform
                }
                
                setDetailInfluencer(updatedInfluencer)
              } else {
                throw new Error('Profile API returned no data')
              }
              
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
              setSearchError(`Failed to load ${platform} data: ${errorMessage}`)
            } finally {
              setDetailLoading(false)
            }
          }
        }}
        city={detailCity}
        country={detailCountry}
        loading={detailLoading}
      />
      {/* 🚨 DEBUG: Log what's being passed to the panel */}
      {detailPanelOpen && selectedPlatform === 'tiktok' && (() => {
        return null
      })()}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default DiscoveryPageClient 