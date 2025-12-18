'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import BrandOnboardingCheck from '../../../components/auth/BrandOnboardingCheck'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'
import { AddToShortlistModal } from '../../../components/shortlists/AddToShortlistModal'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { Search, FilterIcon, Eye, Users, TrendingUp, MapPin, ChevronDown, ChevronUp, Heart } from 'lucide-react'

interface InfluencerTableProps {
  searchParams: {
    search?: string
    niche?: string
    platform?: Platform
    page?: string
  }
  onPanelStateChange?: (isAnyPanelOpen: boolean) => void
}

function InfluencerTableClient({ searchParams, onPanelStateChange }: InfluencerTableProps) {
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerDetail, setSelectedInfluencerDetail] = useState<InfluencerDetailView | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('INSTAGRAM')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Hearted influencers context
  const { addHeartedInfluencer, removeHeartedInfluencer, isInfluencerHearted } = useHeartedInfluencers()
  
  // Add to shortlist modal state
  const [addToShortlistModal, setAddToShortlistModal] = useState<{
    isOpen: boolean
    influencer: any | null
  }>({ isOpen: false, influencer: null })
  
  // Router hooks for URL state management
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const pathname = usePathname()
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // Add sort state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })
  
  // Add filter state management
  const [rosterFilters, setRosterFilters] = useState({
    niche: '',
    platform: '',
    followerRange: '',
    engagementRange: '',
    location: '',
    contentType: ''
  })
  const [rosterFilterOpen, setRosterFilterOpen] = useState(false)

  // URL state management functions
  const updateUrl = (influencerId: string | null, platform?: string) => {
    const params = new URLSearchParams(urlSearchParams)
    
    if (influencerId) {
      params.set('influencer', influencerId)
      if (platform) {
        params.set('platform', platform)
      }
    } else {
      params.delete('influencer')
      params.delete('platform')
    }
    
    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  const handleInfluencerFromUrl = async (influencerId: string) => {
    setIsLoading(true)
    try {
      const basicInfluencer = influencers.find(inf => inf.id === influencerId)
      if (basicInfluencer) {
        const detailedInfluencer = generateDetailedInfluencerData(basicInfluencer)
        setSelectedInfluencerDetail(detailedInfluencer)
        setDetailPanelOpen(true)
        onPanelStateChange?.(true)
      } else {
        // Remove invalid influencer from URL
        updateUrl(null)
      }
    } catch (error) {
      console.error('Failed to load influencer details:', error)
      updateUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle URL state for influencer selection
  useEffect(() => {
    const influencerId = urlSearchParams.get('influencer')
    const platform = urlSearchParams.get('platform')
    
    if (influencerId && influencerId !== selectedInfluencerDetail?.id) {
      // Load influencer from URL
      handleInfluencerFromUrl(influencerId)
    } else if (!influencerId && detailPanelOpen) {
      // Close panel if no influencer in URL
      setDetailPanelOpen(false)
      setSelectedInfluencerDetail(null)
      onPanelStateChange?.(false)
    }
    
    if (platform) {
      setSelectedPlatform(platform)
    }
  }, [urlSearchParams])

  const [influencers, setInfluencers] = useState<any[]>(() => {
    // Initialize with empty array - will be populated from API
    return []
  })

  // Function to load influencers from the database
  const loadInfluencers = async () => {
    try {
      const response = await fetch('/api/influencers')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setInfluencers(result.data)
          return result.data
        }
      }
      // Fallback - keep existing data if API fails
      console.warn('API failed, keeping current data')
    } catch (error) {
      console.error('Error loading influencers:', error)
    }
  }

  // Load real influencers on component mount
  useEffect(() => {
    loadInfluencers()
  }, [])

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || searchQuery
      const nicheFilter = searchParams.niche as string
  const platformFilter = searchParams.platform
  
  // Add filter change handlers
  const handleRosterFilterChange = (key: string, value: string) => {
    setRosterFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearRosterFilters = () => {
    setRosterFilters({
      niche: '',
      platform: '',
      followerRange: '',
      engagementRange: '',
      location: '',
      contentType: ''
    })
  }

  // Filter options
  const rosterFilterOptions = {
    niche: [
      { value: '', label: 'All Niches' },
      { value: 'Lifestyle', label: 'Lifestyle' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Beauty', label: 'Beauty' },
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Health', label: 'Health' },
      { value: 'Tech', label: 'Tech' },
      { value: 'Gaming', label: 'Gaming' },
      { value: 'Travel', label: 'Travel' },
      { value: 'Food', label: 'Food' },
      { value: 'Business', label: 'Business' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'UGC', label: 'UGC' },
      { value: 'Product Reviews', label: 'Product Reviews' },
      { value: 'Product Seeding', label: 'Product Seeding' }
    ],
    platform: [
      { value: '', label: 'All Platforms' },
      { value: 'INSTAGRAM', label: 'Instagram' },
      { value: 'TIKTOK', label: 'TikTok' },
      { value: 'YOUTUBE', label: 'YouTube' },
      { value: 'TWITTER', label: 'Twitter' }
    ],
    followerRange: [
      { value: '', label: 'All Follower Ranges' },
      { value: 'under-10k', label: 'Under 10K' },
      { value: '10k-50k', label: '10K - 50K' },
      { value: '50k-100k', label: '50K - 100K' },
      { value: '100k-500k', label: '100K - 500K' },
      { value: '500k-1m', label: '500K - 1M' },
      { value: 'over-1m', label: 'Over 1M' }
    ],
    engagementRange: [
      { value: '', label: 'All Engagement Rates' },
      { value: 'under-2', label: 'Under 2%' },
      { value: '2-4', label: '2% - 4%' },
      { value: '4-6', label: '4% - 6%' },
      { value: 'over-6', label: 'Over 6%' }
    ],
    location: [
      { value: '', label: 'All Locations' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'United States', label: 'United States' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Australia', label: 'Australia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'France', label: 'France' },
      { value: 'Other', label: 'Other' }
    ],
    contentType: [
      { value: '', label: 'All Content Types' },
      { value: 'STANDARD', label: 'Standard' },
      { value: 'UGC', label: 'UGC' },
      { value: 'SEEDING', label: 'Seeding' }
    ]
  }

  // Generate detailed influencer data (mock function for the detailed view)
  const generateDetailedInfluencerData = (influencer: any): InfluencerDetailView => {
    // Preserve platform_details with usernames from API
    const platformDetails = Array.isArray(influencer.platforms) 
      ? influencer.platforms.filter((p: any) => p && p.platform) 
      : []
    
    return {
      ...influencer,
      platforms: platformDetails.map((p: any) => p.platform).filter(Boolean) || ['INSTAGRAM'],
      platform_details: platformDetails, // Preserve full platform data with usernames
      
      // Management fields are not accessible to brands (empty/null)
      assigned_to: null,
      labels: [],
      notes: null,
      audienceGrowth: {
        instagram: {
          past30days: Math.floor(Math.random() * 10000) + 1000,
          percentageChange: (Math.random() * 20 - 10),
        },
        tiktok: {
          past30days: Math.floor(Math.random() * 8000) + 500,
          percentageChange: (Math.random() * 25 - 12.5),
        },
        youtube: {
          past30days: Math.floor(Math.random() * 5000) + 200,
          percentageChange: (Math.random() * 15 - 7.5),
        }
      },
      contentTypes: ['Posts', 'Stories', 'Reels'],
      recentPosts: [
        {
          id: '1',
          thumbnail: influencer.avatar_url || '',
          likes: Math.floor(Math.random() * 10000) + 1000,
          comments: Math.floor(Math.random() * 500) + 50,
          date: '2 days ago',
          platform: 'INSTAGRAM' as Platform
        }
      ],
      audienceInsights: {
        topCountries: [
          { country: 'United States', percentage: 35 },
          { country: 'United Kingdom', percentage: 25 },
          { country: 'Canada', percentage: 15 },
          { country: 'Australia', percentage: 10 },
          { country: 'Other', percentage: 15 }
        ],
        ageGroups: [
          { range: '18-24', percentage: 30 },
          { range: '25-34', percentage: 45 },
          { range: '35-44', percentage: 20 },
          { range: '45+', percentage: 5 }
        ],
        genderSplit: { male: 45, female: 55 }
      }
    }
  }

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Apply filters and search
  const filteredInfluencers = influencers.filter(influencer => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        influencer.display_name?.toLowerCase().includes(searchLower) ||
        influencer.first_name?.toLowerCase().includes(searchLower) ||
        influencer.last_name?.toLowerCase().includes(searchLower) ||
        influencer.location_city?.toLowerCase().includes(searchLower) ||
        influencer.location_country?.toLowerCase().includes(searchLower) ||
        influencer.niches?.some((niche: string) => niche.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false
    }

    // Niche filter
    if (rosterFilters.niche && !influencer.niches?.includes(rosterFilters.niche)) {
      return false
    }

    // Platform filter
    if (rosterFilters.platform && !influencer.platforms?.includes(rosterFilters.platform as Platform)) {
      return false
    }

    // Follower range filter
    if (rosterFilters.followerRange) {
      const followers = influencer.total_followers || 0
      switch (rosterFilters.followerRange) {
        case 'under-10k':
          if (followers >= 10000) return false
          break
        case '10k-50k':
          if (followers < 10000 || followers >= 50000) return false
          break
        case '50k-100k':
          if (followers < 50000 || followers >= 100000) return false
          break
        case '100k-500k':
          if (followers < 100000 || followers >= 500000) return false
          break
        case '500k-1m':
          if (followers < 500000 || followers >= 1000000) return false
          break
        case 'over-1m':
          if (followers < 1000000) return false
          break
      }
    }

    // Engagement range filter
    if (rosterFilters.engagementRange) {
      const engagement = (influencer.total_engagement_rate || 0) * 100
      switch (rosterFilters.engagementRange) {
        case 'under-2':
          if (engagement >= 2) return false
          break
        case '2-4':
          if (engagement < 2 || engagement >= 4) return false
          break
        case '4-6':
          if (engagement < 4 || engagement >= 6) return false
          break
        case 'over-6':
          if (engagement < 6) return false
          break
      }
    }

    // Location filter
    if (rosterFilters.location && influencer.location_country !== rosterFilters.location) {
      return false
    }

    // Content type filter
    if (rosterFilters.contentType && influencer.content_type !== rosterFilters.contentType) {
      return false
    }

    return true
  })

  // Apply sorting
  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue: any = a[sortConfig.key as keyof typeof a]
    let bValue: any = b[sortConfig.key as keyof typeof b]

    // Handle special cases
    if (sortConfig.key === 'total_engagement_rate') {
      aValue = (aValue as number) || 0
      bValue = (bValue as number) || 0
    }

    // Handle undefined values
    if (aValue === undefined) aValue = ''
    if (bValue === undefined) bValue = ''

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Apply pagination
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedInfluencers = sortedInfluencers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(sortedInfluencers.length / pageSize)

  // Handle view influencer
  const handleViewInfluencer = (influencer: any) => {
    const detailedInfluencer = generateDetailedInfluencerData(influencer)
    setSelectedInfluencerDetail(detailedInfluencer)
    setDetailPanelOpen(true)
    setSelectedPlatform('INSTAGRAM')
    updateUrl(influencer.id, 'INSTAGRAM')
  }

  // Handle close detail panel
  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false)
    setSelectedInfluencerDetail(null)
    updateUrl(null)
    onPanelStateChange?.(false)
  }

  // Handle heart button click
  const handleHeartInfluencer = (influencer: any) => {
    if (isInfluencerHearted(influencer.id)) {
      removeHeartedInfluencer(influencer.id)
    } else {
      // Convert influencer data to HeartedInfluencer format
      const heartedInfluencer = {
        id: influencer.id,
        displayName: influencer.display_name,
        username: influencer.display_name, // Using display_name as username since we don't have a separate username field
        platform: (influencer.platforms?.[0] || 'instagram') as 'instagram' | 'tiktok' | 'youtube',
        followers: influencer.total_followers || 0,
        engagement_rate: influencer.total_engagement_rate || 0,
        profilePicture: influencer.avatar_url,
        niches: influencer.niches || [],
        location: `${influencer.location_city || ''}, ${influencer.location_country || ''}`.replace(/^, |, $/, ''),
        bio: influencer.bio || ''
      }
      
      // Open the add to shortlist modal
      setAddToShortlistModal({ isOpen: true, influencer: heartedInfluencer })
    }
  }

  // Track panel state changes for the parent component
  useEffect(() => {
    const isAnyPanelOpen = detailPanelOpen
    onPanelStateChange?.(isAnyPanelOpen)
  }, [detailPanelOpen, onPanelStateChange])

  // Platform Icon Component
  const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
    if (!platform || typeof platform !== 'string') {
      return null;
    }
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-pink-500" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
      case 'tiktok':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-gray-900" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        )
      case 'youtube':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-red-600" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  // Sortable Header Component
  const SortableHeader = ({ 
    children, 
    sortKey, 
    className = "" 
  }: { 
    children: React.ReactNode
    sortKey: string
    className?: string 
  }) => {
    const isActive = sortConfig.key === sortKey
    const direction = sortConfig.direction
    
    return (
      <th 
        className={`px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/40 transition-colors ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <ChevronUp 
              size={12} 
              className={`${isActive && direction === 'asc' ? 'text-black' : 'text-gray-300'} transition-colors`} 
            />
            <ChevronDown 
              size={12} 
              className={`${isActive && direction === 'desc' ? 'text-black' : 'text-gray-300'} transition-colors -mt-1`} 
            />
          </div>
        </div>
      </th>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search influencers by name, niche, or location..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button
          onClick={() => setRosterFilterOpen(!rosterFilterOpen)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border transition-all duration-300 font-medium ${
            Object.values(rosterFilters).filter(value => value !== '').length > 0
              ? 'bg-black text-white border-black'
              : 'bg-white/60 backdrop-blur-md border-gray-200 hover:bg-white/80 text-gray-700'
          }`}
        >
                              <FilterIcon size={16} />
          <span>Filters</span>
          {Object.values(rosterFilters).filter(value => value !== '').length > 0 && (
            <span className="bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {Object.values(rosterFilters).filter(value => value !== '').length}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${rosterFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {rosterFilterOpen && (
        <div className="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/40 mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="p-4">
            {/* Active Filters Chips */}
            {Object.values(rosterFilters).filter(value => value !== '').length > 0 && (
              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Filters</h4>
                  <button
                    onClick={clearRosterFilters}
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(rosterFilters).map(([key, value]) => {
                    if (!value) return null
                    const option = rosterFilterOptions[key as keyof typeof rosterFilterOptions]?.find((opt: any) => opt.value === value)
                    const displayKey = key === 'contentType' ? 'Content Type' 
                                     : key === 'followerRange' ? 'Followers'
                                     : key === 'engagementRange' ? 'Engagement'
                                     : key.charAt(0).toUpperCase() + key.slice(1)
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black text-white"
                      >
                        {displayKey}: {option?.label || value}
                        <button
                          onClick={() => handleRosterFilterChange(key, '')}
                          className="ml-1 hover:text-gray-300"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Niche Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Niche</label>
                <select
                  value={rosterFilters.niche}
                  onChange={(e) => handleRosterFilterChange('niche', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.niche.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Platform</label>
                <select
                  value={rosterFilters.platform}
                  onChange={(e) => handleRosterFilterChange('platform', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.platform.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Follower Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Followers</label>
                <select
                  value={rosterFilters.followerRange}
                  onChange={(e) => handleRosterFilterChange('followerRange', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.followerRange.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Engagement Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Engagement</label>
                <select
                  value={rosterFilters.engagementRange}
                  onChange={(e) => handleRosterFilterChange('engagementRange', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.engagementRange.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Location</label>
                <select
                  value={rosterFilters.location}
                  onChange={(e) => handleRosterFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.location.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Content Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Content Type</label>
                <select
                  value={rosterFilters.contentType}
                  onChange={(e) => handleRosterFilterChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
                >
                  {rosterFilterOptions.contentType.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedInfluencers.length)} of {sortedInfluencers.length} influencers
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Influencer Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <SortableHeader sortKey="display_name" className="w-1/5">Influencer</SortableHeader>
                <SortableHeader sortKey="content_type" className="w-24">Content Type</SortableHeader>
                <SortableHeader sortKey="platforms" className="w-20">Platforms</SortableHeader>
                <SortableHeader sortKey="niches" className="w-32">Niches</SortableHeader>
                <SortableHeader sortKey="total_followers" className="w-24">Followers</SortableHeader>
                <SortableHeader sortKey="total_engagement_rate" className="w-24">Engagement</SortableHeader>
                <SortableHeader sortKey="location_city" className="w-28">Location</SortableHeader>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {paginatedInfluencers.map((influencer) => (
                <tr key={influencer.id} className="hover:bg-white/70 transition-colors duration-150">
                  {/* Influencer Info */}
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {influencer.display_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {influencer.first_name} {influencer.last_name}
                      </div>
                    </div>
                  </td>

                  {/* Content Type */}
                  <td className="px-3 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      influencer.content_type === 'UGC' 
                        ? 'bg-purple-100 text-purple-800'
                        : influencer.content_type === 'SEEDING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {influencer.content_type === 'UGC' ? 'UGC' : 
                       influencer.content_type === 'SEEDING' ? 'Seeding' : 'Standard'}
                    </span>
                  </td>

                  {/* Platforms */}
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      {(() => {
                        // Handle platforms - can be array of strings or array of objects with platform property
                        const platformArray = Array.isArray(influencer.platforms) ? influencer.platforms : []
                        const platforms = platformArray
                          .map((p: any) => typeof p === 'string' ? p : p?.platform)
                          .filter(Boolean)
                          .slice(0, 3)
                        
                        return platforms.map((platform: Platform, index: number) => (
                          <div key={`${influencer.id}-${platform}-${index}`} className="flex items-center">
                            <PlatformIcon platform={platform} size={24} />
                          </div>
                        ))
                      })()}
                    </div>
                  </td>

                  {/* Niches */}
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Handle niches - ensure it's an array and filter out null/empty values
                        const nichesArray = Array.isArray(influencer.niches) 
                          ? influencer.niches.filter((n: any) => n && typeof n === 'string' && n.trim())
                          : []
                        
                        if (nichesArray.length === 0) {
                          return null
                        }
                        
                        return (
                          <>
                            {nichesArray.slice(0, 2).map((niche: string) => (
                              <span
                                key={niche}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg truncate max-w-full"
                              >
                                {niche}
                              </span>
                            ))}
                            {nichesArray.length > 2 && (
                              <div className="relative group">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg cursor-help">
                                  +{nichesArray.length - 2}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                  {nichesArray.slice(2).join(', ')}
                                  {/* Tooltip arrow */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </td>

                  {/* Followers */}
                  <td className="px-3 py-4">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_followers)}
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-3 py-4">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <TrendingUp size={14} className="mr-1 text-gray-400" />
                      {influencer.total_engagement_rate && Number(influencer.total_engagement_rate) > 0 
                        ? (Number(influencer.total_engagement_rate) * 100).toFixed(1) 
                        : '0.0'}%
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{influencer.location_city}</div>
                        <div className="text-xs text-gray-500 truncate">{influencer.location_country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleHeartInfluencer(influencer)}
                        className={`transition-colors ${
                          isInfluencerHearted(influencer.id) 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={isInfluencerHearted(influencer.id) ? "Remove from Shortlist" : "Add to Shortlist"}
                      >
                        <Heart 
                          size={16} 
                          fill={isInfluencerHearted(influencer.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedInfluencers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria to find more influencers.
            </p>
            <button
              onClick={clearRosterFilters}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
              if (pageNum > totalPages) return null
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-black text-white border-black'
                      : 'border-gray-200 hover:bg-gray-50 bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Influencer Detail Panel */}
      {detailPanelOpen && selectedInfluencerDetail && (
        <InfluencerDetailPanel
          influencer={{
            id: selectedInfluencerDetail.id,
            handle: selectedInfluencerDetail.display_name,
            username: selectedInfluencerDetail.display_name, // Fallback (but won't be used if platform_details exists)
            followers: selectedInfluencerDetail.total_followers || 0,
            profilePicture: selectedInfluencerDetail.avatar_url || undefined,
            bio: selectedInfluencerDetail.bio || undefined,
            engagement_rate: selectedInfluencerDetail.total_engagement_rate || undefined,
            avgViews: selectedInfluencerDetail.total_avg_views || undefined,
            // Pass platform_details so InfluencerDetailPanel can extract usernames
            // Map InfluencerPlatform to match expected type (convert null values to undefined)
            platform_details: (selectedInfluencerDetail.platform_details || []).map((p: any) => ({
              id: p.id,
              platform: p.platform,
              username: p.username,
              followers: p.followers,
              engagement_rate: p.engagement_rate,
              avg_views: p.avg_views,
              is_connected: p.is_connected,
              profile_url: p.profile_url ?? undefined // Convert null to undefined
            })),
            // Also pass as contacts for compatibility
            contacts: selectedInfluencerDetail.platform_details?.map((p: any) => ({
              type: p.platform?.toLowerCase() || 'instagram',
              value: p.username || ''
            })).filter((c: any) => c.value) || []
          }}
          selectedPlatform={selectedPlatform.toLowerCase() as 'instagram' | 'tiktok' | 'youtube'}
          onPlatformSwitch={(platform) => setSelectedPlatform(platform.toUpperCase())}
          onClose={handleCloseDetailPanel}
          isOpen={detailPanelOpen}
        />
      )}

      {/* Add to Shortlist Modal */}
      {addToShortlistModal.isOpen && addToShortlistModal.influencer && (
        <AddToShortlistModal
          influencer={addToShortlistModal.influencer}
          isOpen={addToShortlistModal.isOpen}
          onClose={() => setAddToShortlistModal({ isOpen: false, influencer: null })}
          onSuccess={() => {
            setAddToShortlistModal({ isOpen: false, influencer: null })
            // Optionally show a success message
          }}
        />
      )}
    </div>
  )
}

function InfluencerTable(props: InfluencerTableProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfluencerTableClient {...props} />
    </Suspense>
  )
}

export default function BrandInfluencersPage() {
  return (
    <BrandProtectedRoute>
      <BrandOnboardingCheck>
        <div className="min-h-screen bg-gray-50">
          <ModernBrandHeader />
          
          <div className="px-4 lg:px-8 py-8">
            <InfluencerTable 
              searchParams={{}}
              onPanelStateChange={() => {}} // No-op since panel is fixed overlay
            />
          </div>
        </div>
      </BrandOnboardingCheck>
    </BrandProtectedRoute>
  )
} 