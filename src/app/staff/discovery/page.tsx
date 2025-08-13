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
import { FOLLOWER_VIEW_OPTIONS } from '../../../constants/filterOptions'
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
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'

// Add to roster functionality
const addToRoster = async (discoveredId: string) => {
  try {
    const response = await fetch('/api/discovery/add-to-roster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ discoveredId }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      return { success: true, newInfluencerId: data.data.newInfluencerId }
    } else {
      throw new Error(data.error || 'Failed to add to roster')
    }
  } catch (error) {
    console.error('Error adding to roster:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Mock data for Modash credit usage and discovered influencers
const MOCK_CREDIT_USAGE = {
  monthlyLimit: 3000,
  monthlyUsed: 1247,
  yearlyLimit: 36000,
  yearlyUsed: 8934,
  lastUpdated: '2024-01-20T10:30:00Z',
  rolloverCredits: 425
}

const MOCK_DISCOVERED_INFLUENCERS = [
  {
    id: 'discovered_1',
    display_name: 'HealthyLifeMia',
    profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    instagram_handle: '@healthylifemia',
    youtube_handle: '@healthylifemia',
    tiktok_handle: null,
    followers: 89000,
    engagement_rate: 4.7,
    avg_views: 32000,
    niche: 'Health',
    location: 'United Kingdom',
    verified: true,
    last_post: '2024-01-19',
    estimated_price: 650,
    already_imported: false,
    modash_score: 92
  },
  {
    id: 'discovered_2',
    display_name: 'FashionForwardSam',
    profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    instagram_handle: '@fashionforwardsam',
    youtube_handle: null,
    tiktok_handle: '@fashionforwardsam',
    followers: 156000,
    engagement_rate: 3.9,
    avg_views: 58000,
    niche: 'Fashion',
    location: 'United States',
    verified: false,
    last_post: '2024-01-20',
    estimated_price: 920,
    already_imported: true,
    modash_score: 88
  },
  {
    id: 'discovered_3',
    display_name: 'TechReviewTom',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    instagram_handle: null,
    youtube_handle: '@techreviewtom',
    tiktok_handle: '@techreviewtom',
    followers: 234000,
    engagement_rate: 5.2,
    avg_views: 125000,
    niche: 'Tech',
    location: 'Canada',
    verified: true,
    last_post: '2024-01-18',
    estimated_price: 1450,
    already_imported: false,
    modash_score: 95
  },
  {
    id: 'discovered_4',
    display_name: 'FitnessWithFiona',
    profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    instagram_handle: '@fitnesswithfiona',
    youtube_handle: '@fitnesswithfiona',
    tiktok_handle: '@fitnesswithfiona',
    followers: 67000,
    engagement_rate: 6.1,
    avg_views: 43000,
    niche: 'Fitness',
    location: 'Australia',
    verified: false,
    last_post: '2024-01-20',
    estimated_price: 480,
    already_imported: false,
    modash_score: 83
  }
]

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

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
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')

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
    if (selectedLocation) filters.selectedLocation = selectedLocation
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
    selectedContentCategories, selectedLocation, selectedGender, selectedAge,
    selectedLanguage, accountType, selectedSocials, fakeFollowers, lastPosted,
    verifiedOnly, hideProfilesInRoster, onFiltersChange
  ])

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
                      <AutocompleteInput
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        placeholder="Search locations..."
                        apiEndpoint="/api/discovery/locations"
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
  onViewProfile
}: { 
  selectedPlatform: 'instagram' | 'tiktok' | 'youtube'
  searchResults?: any[]
  isLoading?: boolean
  error?: string | null
  searchQuery?: string
  onViewProfile?: (influencer: any) => void
}) {
  const [addingToRoster, setAddingToRoster] = useState<string | null>(null)
  const [rosterMessages, setRosterMessages] = useState<Record<string, { type: 'success' | 'error', message: string }>>({})
  // Use props or fallback to mock data
  const discoveredCreators = searchResults || MOCK_DISCOVERED_INFLUENCERS
  const showLoading = isLoading || false
  
  console.log('📊 DiscoveredInfluencersTable received:', {
    searchResultsLength: searchResults?.length || 0,
    discoveredCreatorsLength: discoveredCreators.length,
    firstResult: discoveredCreators[0]?.username || 'No results',
    isLoading,
    searchQuery
  })
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
    console.log('💖 Heart context loaded in discovery page')
    console.log('💖 Current hearted influencers:', heartedInfluencers)
  }, [heartedInfluencers])

  // Toggle heart status for an influencer
  const handleHeartToggle = (influencer: any) => {
    console.log('💖 Heart toggle clicked for influencer:', influencer)
    
    const influencerId = influencer.creatorId || influencer.userId || influencer.username || influencer.id
    console.log('💖 Extracted influencer ID:', influencerId)
    
    if (isInfluencerHearted(influencerId)) {
      console.log('💔 Removing influencer from hearts')
      removeHeartedInfluencer(influencerId)
    } else {
      // Add to hearted influencers with all relevant data
      const heartedInfluencer = {
        id: influencerId,
        displayName: influencer.displayName || influencer.display_name || influencer.username || influencer.id,
        username: influencer.username || influencer.instagram_handle?.replace('@', '') || influencer.tiktok_handle?.replace('@', '') || influencer.youtube_handle?.replace('@', '') || 'unknown',
        platform: selectedPlatform,
        followers: influencer.platforms?.[selectedPlatform]?.followers || influencer.followers || 0,
        engagement_rate: influencer.platforms?.[selectedPlatform]?.engagement_rate || influencer.engagement_rate || 0,
        profilePicture: influencer.profilePicture || influencer.profile_picture,
        niches: influencer.niches || [influencer.niche].filter(Boolean) || [],
        location: influencer.location,
        bio: influencer.bio
      }
      
      console.log('❤️ Adding influencer to hearts:', heartedInfluencer)
      addHeartedInfluencer(heartedInfluencer)
    }
  }

  // Add to roster functionality
  const handleAddToRoster = async (influencer: any) => {
    if (!influencer.discoveredId) {
      console.error('No discovered ID for influencer:', influencer)
      return
    }

    setAddingToRoster(influencer.discoveredId)
    
    try {
      const result = await addToRoster(influencer.discoveredId)
      
      if (result.success) {
        setRosterMessages(prev => ({
          ...prev,
          [influencer.discoveredId]: {
            type: 'success',
            message: 'Successfully added to roster!'
          }
        }))
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setRosterMessages(prev => {
            const newMessages = { ...prev }
            delete newMessages[influencer.discoveredId]
            return newMessages
          })
        }, 3000)
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
    let sortableInfluencers = [...discoveredCreators]
    
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
                            isInfluencerHearted(creator.creatorId || creator.userId || creator.username || creator.id)
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                          }`}
                          title={isInfluencerHearted(creator.creatorId || creator.userId || creator.username || creator.id) ? "Remove from favorites" : "Add to favorites"}
                          onClick={() => handleHeartToggle(creator)}
                        >
                          <Heart 
                            size={16} 
                            fill={isInfluencerHearted(creator.creatorId || creator.userId || creator.username || creator.id) ? 'currentColor' : 'none'}
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
  
  // Platform state moved here to share between components
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  
  // API state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [creditUsage, setCreditUsage] = useState(MOCK_CREDIT_USAGE)
  const [apiWarning, setApiWarning] = useState<string | null>(null)
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false)
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Current filters state
  const [currentFilters, setCurrentFilters] = useState<any>({})
  
  // Function to refresh credits from API
  const refreshCredits = async () => {
    setIsRefreshingCredits(true)
    try {
      const response = await fetch(`${window.location.origin}/api/discovery/credits`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCreditUsage(prev => ({
            ...prev,
            monthlyUsed: result.data.used,
            monthlyLimit: result.data.limit,
            yearlyUsed: result.data.used, // In production, track separately
            yearlyLimit: result.data.limit * 12,
            lastUpdated: result.data.resetDate
          }))
          console.log('💳 Refreshed credits:', result.data.used + '/' + result.data.limit)
        }
      }
    } catch (error) {
      console.error('Failed to refresh credits:', error)
    } finally {
      setIsRefreshingCredits(false)
    }
  }
  
  // Auto-search when platform changes (only if there are existing results or search query)
  useEffect(() => {
    // Only trigger auto-search if we have existing search results or a search query
    if ((searchResults.length > 0 || searchQuery.trim()) && !isSearching) {
      console.log('🔄 Platform changed to:', selectedPlatform, '- Auto-refreshing search')
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
      
      console.log('🔍 Searching:', {
        platform: selectedPlatform,
        mode: searchQuery.trim() ? 'Exact Match' : 'Discovery',
        activeFilters: Object.keys(currentFilters).filter(k => {
          const value = currentFilters[k]
          return value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)
        }).length
      })
      
      // Smart API selection: use List Users for simple searches, Search Influencers for complex filtering
      const activeFilters = Object.keys(currentFilters).filter(k => {
        const value = currentFilters[k]
        return value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)
      })
      const hasComplexFilters = activeFilters.length > 0
      
      console.log('🔍 Filter Analysis:', {
        currentFilters,
        activeFilterKeys: activeFilters,
        activeFilterValues: activeFilters.map(k => ({ [k]: currentFilters[k] })),
        hasComplexFilters
      })
      
      let apiEndpoint = '/api/discovery/search'
      let requestBody = filters
      
      // FORCE simple text searches to use List Users API - ignore filters for exact username searches
      if (searchQuery.trim()) {
        console.log('🔍 FORCED simple search (List Users API) for query:', searchQuery)
        console.log('🔍 Ignoring complex filters for exact username search')
        apiEndpoint = '/api/discovery/search'
        // Send clean request body for simple searches - only essential fields
        requestBody = {
          platform: selectedPlatform,
          searchQuery: searchQuery.trim(),
          preferFreeAPI: true
        }
        console.log('🔍 Clean request body for simple search:', requestBody)
      } else if (hasComplexFilters) {
        console.log('🎯 Using advanced search (Search Influencers API)')
        // Transform current filters to new API format
        const searchFilters: any = {
          influencer: {},
          audience: {}
        }
        
        // Map follower filters
        if (currentFilters.follower_count) {
          searchFilters.influencer.followers = {
            min: currentFilters.follower_count.min,
            max: currentFilters.follower_count.max
          }
        }
        
        // Map engagement rate
        if (currentFilters.engagement_rate) {
          searchFilters.influencer.engagementRate = currentFilters.engagement_rate / 100 // Convert percentage to decimal
        }
        
        // Map verification
        if (currentFilters.verified === true) {
          searchFilters.influencer.isVerified = true
        }
        
        // Map location if available
        if (currentFilters.location_ids && currentFilters.location_ids.length > 0) {
          searchFilters.influencer.location = currentFilters.location_ids
        }
        
        // Map language
        if (currentFilters.language) {
          searchFilters.influencer.language = currentFilters.language
        }
        
        // Map interests
        if (currentFilters.interests && currentFilters.interests.length > 0) {
          searchFilters.influencer.interests = currentFilters.interests
        }
        
        // Add audience credibility (fake follower protection)
        searchFilters.audience.credibility = 0.8 // 80% real followers minimum
        
        apiEndpoint = '/api/discovery/search-v2'
        requestBody = {
          page: 0,
          sort: { field: 'followers', direction: 'desc' },
          filter: searchFilters
        }
        
        console.log('🎯 Advanced search filters:', searchFilters)
      }

      const response = await fetch(`${window.location.origin}${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
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
          
          console.log('✅ Advanced search completed:', {
            resultsFound: searchResults.length,
            totalAvailable: result.pagination?.total || 0,
            creditsUsed: creditsUsed,
            isExactMatch: result.metadata?.isExactMatch
          })
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
          
          console.log('✅ Search completed:', {
            resultsFound: searchResults.length,
            creditsUsed: creditsUsed
          })
        } else {
          throw new Error(result.details || 'Search failed')
        }
      }
      
      console.log('🎯 Setting search results:', {
        searchResultsLength: searchResults.length,
        firstResult: searchResults[0]?.username || 'No results',
        firstResultFollowers: searchResults[0]?.followers || 'No followers',
        searchQuery: searchQuery,
        apiEndpoint: apiEndpoint,
        resultFormat: result.data ? 'legacy' : 'v2',
        searchMode: result.data?.searchMode || result.searchMode || 'unknown'
      })
      
      setSearchResults(searchResults)
      
      // If real API was used and credits were consumed, refresh the credit count
      if (creditsUsed > 0) {
        setTimeout(() => refreshCredits(), 1000)
      }
      
    } catch (error) {
      console.error('❌ Search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Search failed')
      setSearchResults(MOCK_DISCOVERED_INFLUENCERS) // Fallback to mock data
    } finally {
      setIsSearching(false)
    }
  }
  
  // Load initial credit usage
  React.useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/discovery/credits`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setCreditUsage(prev => ({
              ...prev,
              monthlyUsed: result.data.used,
              monthlyLimit: result.data.limit,
              // Initialize yearly based on current monthly usage for now
              // In production, this would be tracked separately 
              yearlyUsed: result.data.used,
              yearlyLimit: result.data.limit * 12, // Assuming 12 months
              lastUpdated: result.data.resetDate,
              rolloverCredits: prev.rolloverCredits
            }))
            console.log('💳 Loaded initial credits:', {
              monthly: result.data.used + '/' + result.data.limit,
              yearly: result.data.used + '/' + (result.data.limit * 12)
            })
          }
        }
      } catch (error) {
        console.error('Failed to load credits:', error)
      }
    }
    
    loadCredits()
  }, [])

  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [detailInfluencer, setDetailInfluencer] = useState<any | null>(null)
  const [detailCity, setDetailCity] = useState<string | undefined>()
  const [detailCountry, setDetailCountry] = useState<string | undefined>()
  const [detailLoading, setDetailLoading] = useState(false)

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
      let platformData = influencer.platforms?.[selectedPlatform]
      let actualPlatform = selectedPlatform
      
      // Don't fallback to other platforms - this causes wrong data to show!
      if (!platformData) {
        console.log(`📊 No ${selectedPlatform} data available, will fetch fresh data from ${selectedPlatform} API`)
      }
      
      const userId = platformData?.userId || influencer.userId
      
      if (!userId) {
        console.log('📊 No userId available for detailed profile fetch, using fallback data')
        setDetailLoading(false)
        return
      }
      
      console.log('🔍 About to fetch profile for:', {
        userId: userId,
        platform: actualPlatform,
        originalInfluencer: {
          username: influencer.username,
          handle: influencer.handle,
          userId: influencer.userId,
          followers: influencer.followers
        }
      })
      
      console.log('🔍 Full influencer object for debugging:', influencer)
      console.log('🖼️ Profile picture debugging:', {
        profile_picture: influencer.profile_picture,
        profilePicture: influencer.profilePicture,
        picture: influencer.picture,
        avatar_url: influencer.avatar_url,
        platformData_profile_picture: platformData?.profile_picture,
        allInfluencerKeys: Object.keys(influencer),
        platformDataKeys: platformData ? Object.keys(platformData) : 'No platform data'
      })
      
      // Fetch core profile data first (faster)
      try {
        console.log('📊 Step 1: Fetching core influencer profile...')
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
            
            console.log('✅ Step 1 complete: Core profile loaded')
            
            // Step 2: Fetch extended data in background
            console.log('📊 Step 2: Fetching extended profile data...')
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
                  console.log('🔗 Extended API Debug - Overlap Data:', {
                    hasOverlapData: !!extendedResult.data.overlap,
                    overlapValue: extendedResult.data.overlap?.value,
                    overlapValueLength: extendedResult.data.overlap?.value?.length || 0,
                    overlapConfidence: extendedResult.data.overlap?.confidence,
                    overlapSource: extendedResult.data.overlap?.source
                  })
                  
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
                  console.log('✅ Step 2 complete: Extended profile data loaded')
                }
              }
            } catch (extendedError) {
              console.warn('⚠️ Extended data fetch failed (non-critical):', extendedError)
              // Core profile still works without extended data
            }
            
            return // Exit here since we've handled the response
          }
        }
        
        // Fallback to old method if new tiered approach fails
        console.log('⚠️ Tiered loading failed, falling back to single request...')
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
            console.log('📊 Enhanced influencer data with demographics:', enhancedInfluencer)
          } else {
            console.log('📊 Using basic influencer data, no enhanced report available')
            // Use the basic influencer data without enhancement
            setDetailInfluencer(influencer)
          }
        } else {
          console.warn('⚠️ Comprehensive report API returned:', response.status, response.statusText)
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch comprehensive report, using basic data:', error)
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
            console.log('📍 Updated location data:', locationResult.data)
          }
        }
      } catch (locationError) {
        console.error('❌ Failed to fetch location data:', locationError)
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch comprehensive data:', error)
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
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 mb-1">Monthly Credits</p>
                  <button 
                    onClick={refreshCredits}
                    disabled={isRefreshingCredits}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Refresh credits"
                  >
                    <RefreshCw size={14} className={isRefreshingCredits ? 'animate-spin' : ''} />
                  </button>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(creditUsage.monthlyUsed)} / {Math.round(creditUsage.monthlyLimit)}
                </p>
                <div className="flex items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {((creditUsage.monthlyUsed / creditUsage.monthlyLimit) * 100).toFixed(1)}% used
                  </p>
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
          <MetricCard
            title="Yearly Credits"
            value={`${Math.round(creditUsage.yearlyUsed)} / ${Math.round(creditUsage.yearlyLimit)}`}
            icon={<Calendar size={20} />}
            trend={`${Math.round(creditUsage.yearlyLimit - creditUsage.yearlyUsed)} remaining`}
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

        {/* Main Content Area - Side by Side Layout */}
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
            />
          </div>
        </div>
      </main>
      <InfluencerDetailPanel 
        influencer={detailInfluencer}
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        selectedPlatform={selectedPlatform}
        city={detailCity}
        country={detailCountry}
        loading={detailLoading}
      />
      {/* 🚨 DEBUG: Log what's being passed to the panel */}
      {detailPanelOpen && selectedPlatform === 'tiktok' && (
        <div style={{ display: 'none' }}>
          {console.log('🚨 Discovery Page - Data being passed to TikTok popup:', {
            selectedPlatform,
            detailInfluencer,
            hasEngagements: detailInfluencer?.engagements,
            hasTotalLikes: detailInfluencer?.totalLikes,
            hasPostsCount: detailInfluencer?.postsCount,
            hasAverageViews: detailInfluencer?.averageViews,
            hasGender: detailInfluencer?.gender,
            hasAgeGroup: detailInfluencer?.ageGroup,
            hasRecentPosts: detailInfluencer?.recentPosts,
            hasPopularPosts: detailInfluencer?.popularPosts,
            hasPaidData: detailInfluencer?.paidPostPerformance
          })}
        </div>
      )}
    </div>
  )
}

export default DiscoveryPageClient 