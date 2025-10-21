'use client'

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuth } from '@clerk/nextjs'
import { useCurrentUserId } from '@/lib/auth/current-user'
import EditInfluencerModal from '../../../components/modals/EditInfluencerModal'
import AssignInfluencerModal from '../../../components/modals/AssignInfluencerModal'
import AddInfluencerPanel from '../../../components/influencer/AddInfluencerPanel'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import DashboardInfoPanel from '../../../components/influencer/DashboardInfoPanel'
import ErrorBoundary from '../../../components/debug/ErrorBoundary'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { Search, FilterIcon, Eye, Edit, Users, TrendingUp, DollarSign, MapPin, Tag, Trash2, RefreshCw, Globe, ChevronDown, Plus, ChevronUp, BarChart3, User, AlertTriangle } from 'lucide-react'

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
  const currentUserId = useCurrentUserId()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerDetail, setSelectedInfluencerDetail] = useState<InfluencerDetailView | null>(null)
  const [dashboardPanelOpen, setDashboardPanelOpen] = useState(false)
  const [selectedDashboardInfluencer, setSelectedDashboardInfluencer] = useState<any>(null)

  // 🔍 [DEBUG] Panel state debugging
  useEffect(() => {
    console.log('🔍 [DEBUG] Panel state changed:', {
      detailPanelOpen,
      hasSelectedInfluencerDetail: !!selectedInfluencerDetail,
      selectedInfluencerDetailId: selectedInfluencerDetail?.id,
      dashboardPanelOpen,
      hasSelectedDashboardInfluencer: !!selectedDashboardInfluencer,
      timestamp: new Date().toISOString()
    })
  }, [detailPanelOpen, selectedInfluencerDetail, dashboardPanelOpen, selectedDashboardInfluencer])

  // 🔧 FIX: Move useMemo to top level to avoid Rules of Hooks violation
  const memoizedInfluencer = useMemo(() => {
    if (!selectedInfluencerDetail) {
      console.log('🔍 [DEBUG] useMemo: selectedInfluencerDetail is null')
      return null
    }
    
    console.log('🔍 [DEBUG] useMemo called with selectedInfluencerDetail:', selectedInfluencerDetail)
    try {
      // Memoize platforms object separately to prevent recreation
      const platforms = selectedInfluencerDetail.platforms?.reduce((acc: any, platform: any) => {
        if (platform.is_connected) {
          acc[platform.platform.toLowerCase()] = {
            followers: platform.followers,
            engagement_rate: platform.engagement_rate,
            avgViews: platform.avg_views,
            username: platform.username
          }
        }
        return acc
      }, {}) || {}

      return {
        // API-First Approach: Always call Modash API for fresh data
        id: selectedInfluencerDetail.id,
        username: selectedInfluencerDetail.display_name,
        displayName: selectedInfluencerDetail.display_name,
        name: selectedInfluencerDetail.display_name,
        handle: (selectedInfluencerDetail.display_name || 'creator').toLowerCase().replace(/\s+/g, ''),
        picture: selectedInfluencerDetail.avatar_url || undefined,
        profilePicture: selectedInfluencerDetail.avatar_url || undefined,
        
        // Use memoized platforms object
        platforms,
        
        // Metadata for roster functionality  
        isRosterInfluencer: true,
        rosterId: selectedInfluencerDetail.id,
        hasPreservedAnalytics: false, // Will be populated by API call
        
        // Fallback basic data
        followers: selectedInfluencerDetail.total_followers || 0,
        engagement_rate: selectedInfluencerDetail.total_engagement_rate || 0,
        engagementRate: selectedInfluencerDetail.total_engagement_rate || 0,
        avgViews: selectedInfluencerDetail.total_avg_views || 0,
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Error in useMemo:', error)
      return {
        id: selectedInfluencerDetail.id,
        displayName: selectedInfluencerDetail.display_name,
        name: selectedInfluencerDetail.display_name,
        handle: (selectedInfluencerDetail.display_name || 'creator').toLowerCase().replace(/\s+/g, ''),
        picture: selectedInfluencerDetail.avatar_url || undefined,
        profilePicture: selectedInfluencerDetail.avatar_url || undefined,
        platforms: {},
        isRosterInfluencer: true,
        rosterId: selectedInfluencerDetail.id,
        hasPreservedAnalytics: false,
        followers: 0,
        engagement_rate: 0,
        engagementRate: 0,
        avgViews: 0,
      }
    }
  }, [selectedInfluencerDetail])

  // 🔍 [DEBUG] Log memoized influencer changes
  useEffect(() => {
    console.log('🔍 [DEBUG] memoizedInfluencer changed:', {
      hasMemoizedInfluencer: !!memoizedInfluencer,
      influencerId: memoizedInfluencer?.id,
      influencerName: memoizedInfluencer?.displayName,
      timestamp: new Date().toISOString()
    })
  }, [memoizedInfluencer])

  const [activeTab, setActiveTab] = useState<'ALL' | 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER' | 'PENDING_ASSIGNMENT' | 'MY_CREATORS'>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Router hooks for URL state management
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const pathname = usePathname()
  
  // Clerk authentication
  const { getToken } = useAuth()
  
  // Bulk refresh analytics for all roster influencers
  const handleBulkRefreshAnalytics = async () => {
    setIsRefreshingAnalytics(true)
    try {
      const response = await fetch('/api/roster/bulk-refresh-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Bulk refresh completed:', result)
        
        // Reload the page to show updated data
        window.location.reload()
      } else {
        throw new Error('Failed to refresh analytics')
      }
    } catch (error) {
      console.error('❌ Bulk refresh failed:', error)
      alert('Failed to refresh analytics. Please try again.')
    } finally {
      setIsRefreshingAnalytics(false)
    }
  }
  
  // Helper function to generate random 6-character alphanumeric ID
  const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
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
  
  // Add filter state management (matching brand page pattern)
  const [rosterFilters, setRosterFilters] = useState({
    niche: '',
    platform: '',
    followerRange: '',
    engagementRange: '',
    location: '',
    influencerType: '',
    contentType: '',
    tier: '',
    status: ''
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

  // Handle platform parameter from URL only
  useEffect(() => {
    const platform = urlSearchParams.get('platform')
    if (platform) {
      setSelectedPlatform(platform)
    }
  }, [urlSearchParams])

  const [influencers, setInfluencers] = useState<any[]>(() => {
    // Initialize with empty array - will load real data immediately
    return []
  })

  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // No fallback mock data - API must provide real data
  const FALLBACK_INFLUENCERS: any[] = []

  // Function to load influencers from the database
  const loadInfluencers = async () => {
    try {
      const token = await getToken()
      if (!token) {
        console.error('❌ No auth token available')
        setInfluencers([])
        setIsInitialLoading(false)
        return
      }

      console.log('📋 Loading influencers from API...')
      const response = await fetch('/api/influencers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          console.log(`✅ Loaded ${result.data.length} real influencers from database`)
          setInfluencers(result.data)
          setIsInitialLoading(false)
          return result.data
        } else {
          console.warn('⚠️ API returned success but no data:', result)
          setInfluencers([])
          setIsInitialLoading(false)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API response not ok:', response.status, response.statusText, errorData)
        setInfluencers([])
        setIsInitialLoading(false)
      }
    } catch (error) {
      console.error('❌ Error loading influencers:', error)
      setInfluencers([])
      setIsInitialLoading(false)
    }
  }

  // Load real influencers on component mount
  useEffect(() => {
    loadInfluencers()
  }, [])

  // Handle URL parameters on page load
  useEffect(() => {
    const influencerId = urlSearchParams.get('influencer')
    if (influencerId && influencers.length > 0) {
      const influencer = influencers.find(inf => inf.id === influencerId)
      if (influencer) {
        // Open the dashboard panel for this influencer (not analytics)
        setSelectedDashboardInfluencer(influencer)
        setDashboardPanelOpen(true)
        onPanelStateChange?.(true)
      }
    }
  }, [urlSearchParams, influencers]) // Removed onPanelStateChange from dependencies

  // Define the influencer type for consistency
  type InfluencerType = typeof influencers[0]

  // Mock data for now - in real app this would come from props
  const MOCK_INFLUENCERS = influencers

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || searchQuery
  const nicheFilter = searchParams.niche
  const platformFilter = searchParams.platform
  
  // Add filter change handlers (matching brand page pattern)
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
      influencerType: '',
      contentType: '',
      tier: '',
      status: ''
    })
  }

  // Function to determine influencer tier based on followers and engagement
  const getInfluencerTier = (totalFollowers: number, engagementRate: number, influencerType?: string, manualTier?: string) => {
    // Agency Partners don't have tiers
    if (influencerType === 'AGENCY_PARTNER') {
      return null
    }
    
    // Use manual tier if set
    if (manualTier) {
      return manualTier
    }
    
    // Gold: High followers (>500k) OR high engagement (>6%)
    if (totalFollowers > 500000 || engagementRate > 6) {
      return 'GOLD'
    }
    // Silver: Medium followers (100k-500k) OR good engagement (3-6%)
    if (totalFollowers > 100000 || (engagementRate >= 3 && engagementRate <= 6)) {
      return 'SILVER'
    }
    // Default for SIGNED/PARTNERED
    return 'SILVER'
  }

  // Filter options (matching brand page structure)
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
    influencerType: [
      { value: '', label: 'All Types' },
      { value: 'SIGNED', label: 'Signed' },
      { value: 'PARTNERED', label: 'Partnered' },
      { value: 'AGENCY_PARTNER', label: 'Agency Partner' }
    ],
    contentType: [
      { value: '', label: 'All Content Types' },
      { value: 'STANDARD', label: 'Standard' },
      { value: 'UGC', label: 'UGC' },
      { value: 'SEEDING', label: 'Seeding' }
    ],
    tier: [
      { value: '', label: 'All Tiers' },
      { value: 'GOLD', label: 'Gold' },
      { value: 'SILVER', label: 'Silver' }
    ],
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  }

  // Enhanced filtering logic
  const applyFilters = (influencers: any[]) => {
    return influencers.filter(influencer => {
      // Existing tab filter
  if (activeTab === 'ALL') {
        if (!(influencer.influencer_type === 'SIGNED' || 
              influencer.influencer_type === 'PARTNERED')) {
          return false
        }
  } else if (activeTab === 'SIGNED') {
        if (!(influencer.influencer_type === 'SIGNED')) {
          return false
        }
  } else if (activeTab === 'PARTNERED') {
        if (influencer.influencer_type !== 'PARTNERED') {
          return false
        }
  } else if (activeTab === 'MY_CREATORS') {
        // Filter for creators assigned to current user
        if (!influencer.assigned_to || !currentUserId || influencer.assigned_to !== currentUserId) {
          return false
        }
  } else if (activeTab === 'PENDING_ASSIGNMENT') {
        // Filter for users who need assignment
        if (!needsAssignment(influencer)) {
          return false
        }
  } else {
        if (influencer.influencer_type !== activeTab) {
          return false
        }
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = influencer.display_name.toLowerCase().includes(searchLower) ||
                             influencer.first_name?.toLowerCase().includes(searchLower) ||
                             influencer.last_name?.toLowerCase().includes(searchLower) ||
                             (influencer.niches || []).some((niche: string) => niche.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Advanced filters
      const matchesNiche = !rosterFilters.niche || (influencer.niches || []).includes(rosterFilters.niche)
      const matchesPlatform = !rosterFilters.platform || influencer.platforms.includes(rosterFilters.platform as Platform)
      const matchesFollowerRange = !rosterFilters.followerRange || checkFollowerRange(influencer.total_followers, rosterFilters.followerRange)
      const matchesEngagementRange = !rosterFilters.engagementRange || checkEngagementRange(influencer.total_engagement_rate, rosterFilters.engagementRange)
      const matchesLocation = !rosterFilters.location || influencer.location_country === rosterFilters.location
      const matchesInfluencerType = !rosterFilters.influencerType || influencer.influencer_type === rosterFilters.influencerType
      const matchesContentType = !rosterFilters.contentType || influencer.content_type === rosterFilters.contentType
      const matchesTier = !rosterFilters.tier || getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type, influencer.tier) === rosterFilters.tier
      const matchesStatus = !rosterFilters.status || influencer.is_active.toString() === rosterFilters.status

      return matchesNiche && matchesPlatform && matchesFollowerRange && 
             matchesEngagementRange && matchesLocation && matchesInfluencerType && 
             matchesContentType && matchesTier && matchesStatus
    })
  }

  // Check if influencer needs assignment
  const needsAssignment = (influencer: any) => {
    // Pending if content_type is null OR influencer_type is null
    return !influencer.content_type || !influencer.influencer_type
  }

  // Separate function for tab counts that doesn't depend on activeTab
  const applyFiltersForTab = (influencers: any[], tabType: string) => {
    return influencers.filter(influencer => {
      // Tab-specific filter
      if (tabType === 'ALL') {
        if (!(influencer.influencer_type === 'SIGNED' || 
              influencer.influencer_type === 'PARTNERED' ||
              influencer.influencer_type === 'AGENCY_PARTNER')) {
          return false
        }
      } else if (tabType === 'SIGNED') {
        if (!(influencer.influencer_type === 'SIGNED' && !needsAssignment(influencer))) {
          return false
        }
      } else if (tabType === 'PARTNERED') {
        if (influencer.influencer_type !== 'PARTNERED') {
          return false
        }
      } else if (tabType === 'AGENCY_PARTNER') {
        if (!(influencer.influencer_type === 'AGENCY_PARTNER' && !needsAssignment(influencer))) {
          return false
        }
      } else if (tabType === 'PENDING_ASSIGNMENT') {
        if (!needsAssignment(influencer)) {
          return false
        }
      } else if (tabType === 'MY_CREATORS') {
        // Filter for creators assigned to current user
        if (!influencer.assigned_to || !currentUserId || influencer.assigned_to !== currentUserId) {
          return false
        }
      } else {
        if (influencer.influencer_type !== tabType) {
          return false
        }
      }

      // Apply same search and advanced filters as main filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = influencer.display_name.toLowerCase().includes(searchLower) ||
                             influencer.first_name?.toLowerCase().includes(searchLower) ||
                             influencer.last_name?.toLowerCase().includes(searchLower) ||
                             (influencer.niches || []).some((niche: string) => niche.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      const matchesNiche = !rosterFilters.niche || (influencer.niches || []).includes(rosterFilters.niche)
      const matchesPlatform = !rosterFilters.platform || influencer.platforms.includes(rosterFilters.platform as Platform)
      const matchesFollowerRange = !rosterFilters.followerRange || checkFollowerRange(influencer.total_followers, rosterFilters.followerRange)
      const matchesEngagementRange = !rosterFilters.engagementRange || checkEngagementRange(influencer.total_engagement_rate, rosterFilters.engagementRange)
      const matchesLocation = !rosterFilters.location || influencer.location_country === rosterFilters.location
      const matchesInfluencerType = !rosterFilters.influencerType || influencer.influencer_type === rosterFilters.influencerType
      const matchesContentType = !rosterFilters.contentType || influencer.content_type === rosterFilters.contentType
      const matchesTier = !rosterFilters.tier || getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type, influencer.tier) === rosterFilters.tier
      const matchesStatus = !rosterFilters.status || influencer.is_active.toString() === rosterFilters.status

      return matchesNiche && matchesPlatform && matchesFollowerRange && 
             matchesEngagementRange && matchesLocation && matchesInfluencerType && 
             matchesContentType && matchesTier && matchesStatus
    })
  }

  // Helper functions for range checking (matching brand page pattern)
  function checkFollowerRange(followers: number, range: string) {
    switch (range) {
      case 'under-10k': return followers < 10000
      case '10k-50k': return followers >= 10000 && followers <= 50000
      case '50k-100k': return followers >= 50000 && followers <= 100000
      case '100k-500k': return followers >= 100000 && followers <= 500000
      case '500k-1m': return followers >= 500000 && followers <= 1000000
      case 'over-1m': return followers > 1000000
      default: return true
    }
  }

  function checkEngagementRange(engagement: number, range: string) {
    switch (range) {
      case 'under-2': return engagement < 2.0
      case '2-4': return engagement >= 2.0 && engagement <= 4.0
      case '4-6': return engagement >= 4.0 && engagement <= 6.0
      case 'over-6': return engagement > 6.0
      default: return true
    }
  }

  // Apply all filters (memoized to prevent infinite re-renders)
  const filteredInfluencers = React.useMemo(() => {
    return applyFilters(influencers)
  }, [influencers, activeTab, searchQuery, rosterFilters])
  
  // Apply sorting
  const sortedInfluencers = React.useMemo(() => {
    if (!sortConfig.key) return filteredInfluencers

    return [...filteredInfluencers].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a]
      let bValue: any = b[sortConfig.key as keyof typeof b]

      // Handle different data types
      switch (sortConfig.key) {
        case 'display_name':
        case 'first_name':
        case 'last_name':
        case 'location_city':
        case 'location_country':
        case 'influencer_type':
        case 'content_type':
          aValue = String(aValue).toLowerCase()
          bValue = String(bValue).toLowerCase()
          break
        case 'total_followers':
        case 'total_engagement_rate':
        case 'total_avg_views':
          aValue = Number(aValue)
          bValue = Number(bValue)
          break
        case 'niches':
          aValue = Array.isArray(aValue) ? aValue.join(', ').toLowerCase() : ''
          bValue = Array.isArray(bValue) ? bValue.join(', ').toLowerCase() : ''
          break
        case 'platforms':
          aValue = Array.isArray(aValue) ? aValue.length : 0
          bValue = Array.isArray(bValue) ? bValue.length : 0
          break
        case 'is_active':
          aValue = aValue ? 1 : 0
          bValue = bValue ? 1 : 0
          break
        default:
          aValue = String(aValue).toLowerCase()
          bValue = String(bValue).toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredInfluencers, sortConfig])
  
  // Pagination calculations
  const totalInfluencers = sortedInfluencers.length
  const totalPages = Math.ceil(totalInfluencers / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedInfluencers = sortedInfluencers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = (key: string, value: string) => {
    handleRosterFilterChange(key, value)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  // Sort handler
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }

  // Tab change handler with sort reset
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }

  // Mock function to generate detailed influencer data
  const generateDetailedInfluencerData = (basicInfluencer: any): InfluencerDetailView => {
    // Add some mock management data to a few influencers for demonstration
    const mockManagementData = {
      'SC9K2L': {
        assigned_to: 'sarah.manager@stridesocial.com',
        labels: ['High Priority', 'Top Performer'],
        notes: 'Excellent performance on recent campaigns. Very responsive and professional.'
      },
      'MT7B9X': {
        assigned_to: 'mike.lead@stridesocial.com',
        labels: ['Active Campaign', 'Follow Up'],
        notes: 'Currently working on tech product launch. Need to follow up on content delivery timeline.'
      },
      'inf_9': {
        assigned_to: '',
        labels: ['New Contact'],
        notes: 'Recently partnered. Great potential for UGC campaigns.'
      }
    }

    const managementInfo = mockManagementData[basicInfluencer.id as keyof typeof mockManagementData] || {
      assigned_to: '',
      labels: [],
      notes: ''
    }

    return {
      ...basicInfluencer,
      price_per_post: Math.floor(basicInfluencer.total_followers * 0.01),
      last_synced_at: new Date(),
      
      // Add management fields
      assigned_to: managementInfo.assigned_to,
      labels: managementInfo.labels,
      notes: managementInfo.notes,
      
      // Add missing profile properties
      bio: basicInfluencer.bio || `${basicInfluencer.display_name} is a passionate content creator specializing in ${(basicInfluencer.niches || ['lifestyle']).join(', ').toLowerCase()}. Creating authentic content and building meaningful connections with followers.`,
      website_url: basicInfluencer.website_url,
      email: `contact@${basicInfluencer.display_name.toLowerCase().replace(' ', '')}.com`,
      
      // Generate platform details
      platform_details: (basicInfluencer.platforms || []).map((platformObj: any, index: number) => {
        // Handle both string and object platform formats
        const platformName = typeof platformObj === 'string' ? platformObj : (platformObj.platform || 'INSTAGRAM')
        const platformLower = platformName.toLowerCase()
        
        return {
          id: `platform_${basicInfluencer.id}_${index}`,
          influencer_id: basicInfluencer.id,
          platform: platformName,
          username: platformObj.username || `${basicInfluencer.display_name.toLowerCase().replace(' ', '')}${index > 0 ? index + 1 : ''}`,
          followers: platformObj.followers || Math.floor(basicInfluencer.total_followers / basicInfluencer.platform_count),
          following: Math.floor(Math.random() * 2000) + 500,
          engagement_rate: platformObj.engagement_rate || (basicInfluencer.total_engagement_rate + (Math.random() - 0.5)),
          avg_views: platformObj.avg_views || Math.floor(basicInfluencer.total_avg_views / basicInfluencer.platform_count),
          avg_likes: Math.floor((platformObj.avg_views || basicInfluencer.total_avg_views) * 0.1),
          avg_comments: Math.floor((platformObj.avg_views || basicInfluencer.total_avg_views) * 0.02),
          last_post_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          profile_url: platformObj.profile_url || `https://${platformLower}.com/${basicInfluencer.display_name.toLowerCase().replace(' ', '')}`,
          is_verified: platformObj.is_verified || Math.random() > 0.7,
          is_connected: platformObj.is_connected || true,
          created_at: new Date(),
          updated_at: new Date()
        }
      }),
      
      // Generate recent content
      recent_content: Array.from({ length: 6 }, (_, i) => ({
        id: `content_${basicInfluencer.id}_${i}`,
        influencer_platform_id: `platform_${basicInfluencer.id}_0`,
        post_url: `https://example.com/post/${i}`,
        thumbnail_url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=300&fit=crop`,
        caption: [
          'Amazing sunset today! 🌅 #lifestyle #beautiful',
          'New tutorial is live! Check it out 📸',
          'Feeling grateful for this journey ✨',
          'Behind the scenes of today\'s shoot 🎬',
          'Can\'t believe how far we\'ve come! 🚀',
          'Exciting collaboration coming soon... 👀'
        ][i],
        views: Math.floor(Math.random() * 50000) + 10000,
        likes: Math.floor(Math.random() * 5000) + 500,
        comments: Math.floor(Math.random() * 200) + 20,
        shares: Math.floor(Math.random() * 100) + 5,
        posted_at: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      })),
      
      // Generate demographics
      demographics: {
        id: `demo_${basicInfluencer.id}`,
        influencer_platform_id: `platform_${basicInfluencer.id}_0`,
        age_13_17: Math.random() * 10,
        age_18_24: 20 + Math.random() * 20,
        age_25_34: 25 + Math.random() * 20,
        age_35_44: 15 + Math.random() * 15,
        age_45_54: 8 + Math.random() * 10,
        age_55_plus: 2 + Math.random() * 5,
        gender_male: 20 + Math.random() * 40,
        gender_female: 50 + Math.random() * 30,
        gender_other: 1 + Math.random() * 5,
        updated_at: new Date()
      },
      
      // Generate audience locations
      audience_locations: [
        { id: `loc_${basicInfluencer.id}_1`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: basicInfluencer.location_country || 'United States', country_code: 'US', percentage: 40 + Math.random() * 30 },
        { id: `loc_${basicInfluencer.id}_2`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'United Kingdom', country_code: 'GB', percentage: 15 + Math.random() * 15 },
        { id: `loc_${basicInfluencer.id}_3`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'Canada', country_code: 'CA', percentage: 10 + Math.random() * 10 },
        { id: `loc_${basicInfluencer.id}_4`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'Australia', country_code: 'AU', percentage: 5 + Math.random() * 8 }
      ],
      
      // Generate audience languages
      audience_languages: [
        { id: `lang_${basicInfluencer.id}_1`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'English', language_code: 'en', percentage: 75 + Math.random() * 20 },
        { id: `lang_${basicInfluencer.id}_2`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'Spanish', language_code: 'es', percentage: 5 + Math.random() * 10 },
        { id: `lang_${basicInfluencer.id}_3`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'French', language_code: 'fr', percentage: 3 + Math.random() * 7 }
      ],
      
      // Empty campaign participation for now
      campaign_participation: []
    }
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getPlatformBadgeColor = (platform: Platform) => {
    const colors: Record<string, string> = {
      INSTAGRAM: 'bg-pink-100 text-pink-800',
      TIKTOK: 'bg-black text-white',
      YOUTUBE: 'bg-red-100 text-red-800'
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  const handleViewInfluencer = (influencer: any) => {
    console.log('🔍 [DEBUG] handleViewInfluencer called with:', {
      influencer: influencer,
      displayName: influencer?.display_name,
      id: influencer?.id,
      hasInfluencer: !!influencer,
      timestamp: new Date().toISOString()
    })
    
    try {
      console.log('🔍 [DEBUG] Setting selectedInfluencerDetail...')
      setSelectedInfluencerDetail(influencer)
      console.log('🔍 [DEBUG] selectedInfluencerDetail set successfully')
      
      console.log('🔍 [DEBUG] Setting detailPanelOpen to true...')
      setDetailPanelOpen(true)
      console.log('🔍 [DEBUG] detailPanelOpen set successfully')
      
      console.log('🔍 [DEBUG] Calling onPanelStateChange with true...')
      onPanelStateChange?.(true)
      console.log('🔍 [DEBUG] onPanelStateChange called successfully')
      
      console.log('✅ [DEBUG] handleViewInfluencer completed successfully')
    } catch (error) {
      console.error('❌ [DEBUG] Error in handleViewInfluencer:', error)
      console.error('❌ [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    }
  }

  const handleViewDashboardInfo = (influencer: any) => {
    console.log('👤 Viewing dashboard info for:', influencer.display_name)
    // Update URL with influencer ID
    const url = new URL(window.location.href)
    url.searchParams.set('influencer', influencer.id)
    window.history.pushState({}, '', url.toString())
    
    // Close any other panels first
    setDetailPanelOpen(false)
    setSelectedInfluencerDetail(null)
    
    // Open ONLY the dashboard panel
    setSelectedDashboardInfluencer(influencer)
    setDashboardPanelOpen(true)
    onPanelStateChange?.(true)
  }

  const handleClosePanels = () => {
    // Clear URL parameter
    const url = new URL(window.location.href)
    url.searchParams.delete('influencer')
    window.history.replaceState({}, '', url.toString())
    
    setDetailPanelOpen(false)
    setSelectedInfluencerDetail(null)
    setSelectedInfluencer(null)
    setDashboardPanelOpen(false)
    setSelectedDashboardInfluencer(null)
    onPanelStateChange?.(false)
  }

  const handlePlatformSwitch = (platform: string) => {
    setSelectedPlatform(platform)
    // Update URL with new platform if an influencer is selected
    if (selectedInfluencerDetail?.id) {
      updateUrl(selectedInfluencerDetail.id, platform)
    }
  }

  const handleSaveManagement = async (data: Partial<InfluencerDetailView>) => {
    if (!selectedInfluencerDetail) return
    
    setIsLoading(true)
    console.log('🔄 Saving management data to database:', data)
    
    try {
      // Call the real API to update influencer management data
      const response = await fetch(`/api/influencers/${selectedInfluencerDetail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: data.assigned_to || null,
          labels: data.labels || [],
          notes: data.notes || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save management data')
      }

      const result = await response.json()
      console.log('✅ API response:', result)
      
      // Update the influencer in state with the returned data
      setInfluencers(prev => prev.map(inf => {
        if (inf.id === selectedInfluencerDetail.id) {
          return {
            ...inf,
            assigned_to: data.assigned_to || null,
            labels: data.labels || [],
            notes: data.notes || null
          }
        }
        return inf
      }))
      
      // Update the detailed view data
      if (selectedInfluencerDetail) {
        setSelectedInfluencerDetail({
          ...selectedInfluencerDetail,
          assigned_to: data.assigned_to || null,
          labels: data.labels || [],
          notes: data.notes || null
        })
      }
      
      console.log('✅ Management data saved successfully to database!')
      
    } catch (error) {
      console.error('❌ Error saving management data:', error)
      alert(`❌ Error saving management data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditInfluencer = (influencer: any) => {
    setSelectedInfluencer(influencer)
    setEditModalOpen(true)
  }

  const handleAssignInfluencer = (influencer: any) => {
    setSelectedInfluencer(influencer)
    setAssignModalOpen(true)
  }

  const handleSaveAssignment = async (assignmentData: any) => {
    if (!selectedInfluencer) {
      console.error('❌ No selected influencer for assignment')
      throw new Error('No influencer selected')
    }
    
    setIsLoading(true)
    try {
      console.log('🚀 Assigning influencer:', selectedInfluencer.display_name, assignmentData)
      
      const response = await fetch(`/api/influencers/${selectedInfluencer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData)
      })

      console.log('📡 Assignment API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Assignment API error:', response.status, errorData)
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Assignment successful:', result)

      // Refresh the data to show updated influencer
      await loadInfluencers()
      
      // Close the modal
      setAssignModalOpen(false)
      setSelectedInfluencer(null)

    } catch (error) {
      console.error('❌ Assignment failed:', error)
      throw error // Re-throw to let the modal handle the error display
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveInfluencerEdit = async (data: any) => {
    setIsLoading(true)
    console.log('Saving influencer:', data)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the influencer in state - simplified approach to avoid type issues
      setInfluencers(prev => prev.map(inf => {
        if (inf.id === data.id) {
          // Create a safe update that maintains the original type structure
          return {
            ...inf,
            display_name: data.display_name || inf.display_name,
            first_name: data.first_name || inf.first_name,
            last_name: data.last_name || inf.last_name,
            niches: data.niches || inf.niches,
            bio: data.bio || inf.bio || '',
            location_country: data.location_country || inf.location_country,
            location_city: data.location_city || inf.location_city,
            website_url: data.website_url || inf.website_url || '',
            influencer_type: data.influencer_type || inf.influencer_type,
            is_active: data.is_active !== undefined ? data.is_active : inf.is_active,
            total_followers: data.estimated_followers || inf.total_followers,
            total_avg_views: data.average_views || inf.total_avg_views,
          }
        }
        return inf
      }))
      
      const oldType = selectedInfluencer?.influencer_type
      const newType = data.influencer_type
      
      // Show success message and switch to appropriate tab
      if (oldType && newType && oldType !== newType) {
        // Determine which tab to switch to based on the new type
        const getTargetTab = (type: string) => {
          if (type === 'SIGNED') return 'SIGNED'
          if (type === 'PARTNERED') return 'PARTNERED'
          if (type === 'AGENCY_PARTNER') return 'AGENCY_PARTNER'
          return 'ALL'
        }
        const targetTab = getTargetTab(newType)
        
        alert(`✅ Influencer ${data.display_name} updated successfully!\n\n📋 Type changed from ${oldType} to ${newType}.\n🔄 The influencer now appears in the ${targetTab} tab.`)
        setActiveTab(targetTab)
      } else {
        alert(`✅ Influencer ${data.display_name} updated successfully!`)
      }
      
    } catch (error) {
      console.error('Error updating influencer:', error)
      alert('❌ Error updating influencer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInfluencer = async (data: any) => {
    setIsLoading(true)
    console.log('Adding new influencer:', data)
    
    try {
      // Refresh the influencer list from the database to get latest data
      // The AddInfluencerPanel already calls the API, so we just need to refresh
      console.log('Refreshing influencer list from database...')
      await loadInfluencers()
      
      // Switch to the appropriate tab to show the new influencer
      const getTargetTab = (type: string) => {
        if (type === 'SIGNED') return 'SIGNED'
        if (type === 'PARTNERED') return 'PARTNERED'
        if (type === 'AGENCY_PARTNER') return 'AGENCY_PARTNER'
        return 'ALL'
      }
      const targetTab = getTargetTab(data.influencer_type)
      setActiveTab(targetTab)
      
      console.log(`✅ Influencer list refreshed and switched to ${targetTab} tab`)
      
    } catch (error) {
      console.error('Error refreshing influencer list:', error)
      alert('❌ Error refreshing data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInfluencer = async (influencer: any) => {
    if (!window.confirm(`Are you sure you want to delete ${influencer.display_name}?\n\nThis action cannot be undone.`)) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove from state
      setInfluencers(prev => prev.filter(inf => inf.id !== influencer.id))
      
      alert(`✅ ${influencer.display_name} has been deleted successfully.`)
      
    } catch (error) {
      console.error('Error deleting influencer:', error)
      alert('❌ Error deleting influencer. Please try again.')
    } finally {
      setIsLoading(false)
      setDeleteModalOpen(false)
      setSelectedInfluencer(null)
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('✅ Influencer data refreshed successfully!')
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('❌ Error refreshing data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Memoize the panel state change handler to prevent dependency array issues
  const handlePanelStateChange = useCallback((isOpen: boolean) => {
    onPanelStateChange?.(isOpen)
  }, []) // Removed onPanelStateChange from dependencies to prevent infinite loops

  // Track panel state changes for the parent component
  useEffect(() => {
    const isAnyPanelOpen = detailPanelOpen || addModalOpen
    onPanelStateChange?.(isAnyPanelOpen)
  }, [detailPanelOpen, addModalOpen]) // Removed onPanelStateChange from dependencies

  // Platform Icon Component with SVG logos (Only Instagram, YouTube, TikTok)
  const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
    // Safety check to ensure platform is a string
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
        return null // Don't show unsupported platforms
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
        className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/40 transition-colors ${className}`}
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
            className={`w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 placeholder:text-gray-400 font-medium ${(detailPanelOpen || dashboardPanelOpen) ? '' : 'transition-all duration-300'}`}
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

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg whitespace-nowrap"
        >
          <Plus size={16} className="mr-2" />
          Add Influencer
        </button>
        
        <button
          onClick={handleBulkRefreshAnalytics}
          disabled={isRefreshingAnalytics}
          className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-medium disabled:opacity-50"
          title="Refresh Analytics for All Influencers"
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshingAnalytics ? 'animate-spin' : ''}`} />
          {isRefreshingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
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
                                     : key === 'influencerType' ? 'Influencer Type'
                                     : key === 'followerRange' ? 'Followers'
                                     : key === 'engagementRange' ? 'Engagement'
                                     : key.charAt(0).toUpperCase() + key.slice(1)
            
            return (
                      <div key={key} className="flex items-center bg-black text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        <span className="mr-1.5">{displayKey}: {option?.label || value}</span>
              <button
                          onClick={() => handleFilterChange(key, '')}
                          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Filter Grid */}
            <div className="space-y-4">
              {/* Primary Filters Row */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Primary Filters</h4>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Niche</label>
                    <select
                      value={rosterFilters.niche}
                      onChange={(e) => handleFilterChange('niche', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.niche.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Platform</label>
                    <select
                      value={rosterFilters.platform}
                      onChange={(e) => handleFilterChange('platform', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.platform.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Influencer Type</label>
                    <select
                      value={rosterFilters.influencerType}
                      onChange={(e) => handleFilterChange('influencerType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.influencerType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Content Type</label>
                    <select
                      value={rosterFilters.contentType}
                      onChange={(e) => handleFilterChange('contentType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.contentType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Tier</label>
                    <select
                      value={rosterFilters.tier}
                      onChange={(e) => handleFilterChange('tier', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.tier.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Secondary Filters Row */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Advanced Filters</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Followers</label>
                    <select
                      value={rosterFilters.followerRange}
                      onChange={(e) => handleFilterChange('followerRange', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.followerRange.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Engagement Rate</label>
                    <select
                      value={rosterFilters.engagementRange}
                      onChange={(e) => handleFilterChange('engagementRange', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.engagementRange.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Location</label>
                    <select
                      value={rosterFilters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.location.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Status</label>
                    <select
                      value={rosterFilters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {rosterFilterOptions.status.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'ALL', label: 'All Influencers', count: applyFiltersForTab(influencers, 'ALL').length },
            { key: 'MY_CREATORS', label: 'My Creators', count: applyFiltersForTab(influencers, 'MY_CREATORS').length, highlight: true },
            { key: 'PENDING_ASSIGNMENT', label: 'Pending Assignment', count: applyFiltersForTab(influencers, 'PENDING_ASSIGNMENT').length, urgent: true },
            { key: 'SIGNED', label: 'Signed', count: applyFiltersForTab(influencers, 'SIGNED').length },
            { key: 'PARTNERED', label: 'Partnered', count: applyFiltersForTab(influencers, 'PARTNERED').length },
            { key: 'AGENCY_PARTNER', label: 'Agency Partners', count: applyFiltersForTab(influencers, 'AGENCY_PARTNER').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium ${(detailPanelOpen || dashboardPanelOpen) ? '' : 'transition-all duration-200'} ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : tab.urgent && tab.count > 0
                  ? 'text-orange-600 hover:text-orange-700 bg-orange-50'
                  : tab.highlight
                  ? 'text-blue-600 hover:text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="truncate font-bold capitalize">{tab.label}</span>
              <span>({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Influencer Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <SortableHeader sortKey="display_name">Influencer</SortableHeader>
                <SortableHeader sortKey="influencer_type">Type/Agency</SortableHeader>
                <SortableHeader sortKey="content_type">Content Type</SortableHeader>
                <SortableHeader sortKey="platforms">Platforms</SortableHeader>
                <SortableHeader sortKey="niches">Niches</SortableHeader>
                <SortableHeader sortKey="total_followers">Followers</SortableHeader>
                <SortableHeader sortKey="total_engagement_rate">Engagement</SortableHeader>
                <SortableHeader sortKey="total_avg_views">Avg Views</SortableHeader>
                <SortableHeader sortKey="location_city">Location</SortableHeader>
                <SortableHeader sortKey="is_active">Status</SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {isInitialLoading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        </div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedInfluencers.map((influencer) => (
                <tr key={influencer.id} className={`${(detailPanelOpen || dashboardPanelOpen) ? '' : 'hover:bg-white/70 transition-colors duration-150'} ${
                  needsAssignment(influencer) ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                }`}>
                  {/* Influencer Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className={`flex items-center cursor-pointer rounded-lg p-2 -m-2 ${(detailPanelOpen || dashboardPanelOpen) ? '' : 'hover:bg-gray-50 transition-colors duration-200'}`}
                      onClick={() => handleViewDashboardInfo(influencer)}
                      title="Click to view dashboard info"
                    >
                      <div className="flex-shrink-0 h-12 w-12">
                        {influencer.avatar_url ? (
                          <img 
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" 
                            src={influencer.avatar_url} 
                            alt={influencer.display_name}
                            onError={(e) => {
                              console.log('🖼️ Image failed to load:', influencer.avatar_url)
                              // Fallback to default icon
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex')
                            }}
                          />
                        ) : null}
                        <div 
                          className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white shadow-sm text-white font-bold text-lg" 
                          style={influencer.avatar_url ? { display: 'none' } : { display: 'flex' }}
                        >
                          {influencer.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {influencer.display_name}
                          </div>
                          {needsAssignment(influencer) && (
                            <div className="flex items-center space-x-1 text-orange-600" title="Needs assignment">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-medium">Pending</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {influencer.first_name} {influencer.last_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tier/Agency */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(influencer.influencer_type === 'SIGNED' || influencer.influencer_type === 'PARTNERED') ? (
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        influencer.influencer_type === 'SIGNED' 
                          ? getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type, influencer.tier) === 'GOLD'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {influencer.influencer_type === 'SIGNED' ? 'Signed' : 'Partnered'}
                      </span>
                    ) : influencer.influencer_type === 'AGENCY_PARTNER' ? (
                      <span className="text-sm font-medium text-gray-900">
                        {influencer.agency_name || 'Unknown Agency'}
                      </span>
                    ) : null}
                  </td>

                  {/* Content Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {(influencer.platforms || []).filter(Boolean).map((platform: Platform, index: number) => (
                        <div key={`${influencer.id}-${platform}-${index}`} className="flex items-center">
                          <PlatformIcon platform={platform} size={24} />
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Niches */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(influencer.niches || []).slice(0, 2).map((niche: string) => (
                        <span
                          key={niche}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg"
                        >
                          {niche}
                        </span>
                      ))}
                      {(influencer.niches || []).length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                          +{(influencer.niches || []).length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Followers */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_followers)}
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <TrendingUp size={14} className="mr-1 text-gray-400" />
                      {influencer.total_engagement_rate && Number(influencer.total_engagement_rate) > 0 
                        ? (Number(influencer.total_engagement_rate) * 100).toFixed(1) 
                        : '0.0'}%
                    </div>
                  </td>

                  {/* Average Views */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Eye size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_avg_views)}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">{influencer.location_city}</div>
                        <div className="text-xs text-gray-500">{influencer.location_country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      influencer.is_active 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {influencer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      {/* Assign Button - Only for pending users */}
                      {needsAssignment(influencer) && (
                        <button
                          onClick={() => handleAssignInfluencer(influencer)}
                          disabled={isLoading}
                          className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                          title="Assign Influencer Type & Staff Member"
                        >
                          <User size={16} />
                        </button>
                      )}
                      
                      {/* Analytics Button */}
                      <button
                        onClick={(e) => {
                          console.log('🔍 [DEBUG] Analytics button clicked:', {
                            influencer: influencer,
                            displayName: influencer?.display_name,
                            id: influencer?.id,
                            event: e,
                            timestamp: new Date().toISOString()
                          })
                          e.preventDefault()
                          e.stopPropagation()
                          handleViewInfluencer(influencer)
                        }}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                        title="View Analytics & Performance"
                      >
                        <BarChart3 size={16} />
                      </button>
                      
                      {/* Dashboard Info Button */}
                      <button
                        onClick={() => handleViewDashboardInfo(influencer)}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                        title="View Dashboard Info & Account Status"
                      >
                        <User size={16} />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedInfluencer(influencer)
                          setDeleteModalOpen(true)
                        }}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                        title="Delete Influencer"
                      >
                        <Trash2 size={16} />
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
              {searchQuery || Object.values(rosterFilters).some(value => value !== '') 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : `No ${activeTab.toLowerCase()} influencers available.`
              }
            </p>
            {!searchQuery && !Object.values(rosterFilters).some(value => value !== '') && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
              >
                <Users size={16} className="mr-2" />
                Add Your First Influencer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalInfluencers > 0 && (
        <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalInfluencers)} of {totalInfluencers} influencers
            </span>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 transition-all duration-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-black text-white'
                        : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editModalOpen && selectedInfluencer && (
        <EditInfluencerModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedInfluencer(null)
          }}
          influencer={selectedInfluencer}
          onSave={handleSaveInfluencerEdit}
        />
      )}

      {assignModalOpen && selectedInfluencer && (
        <AssignInfluencerModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setSelectedInfluencer(null)
          }}
          influencer={selectedInfluencer}
          onAssign={handleSaveAssignment}
        />
      )}

      {addModalOpen && (
        <AddInfluencerPanel
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddInfluencer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedInfluencer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
                <Trash2 size={24} className="text-red-600" />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Delete Influencer
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>{selectedInfluencer.display_name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setSelectedInfluencer(null)
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm text-gray-700 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteInfluencer(selectedInfluencer)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Panels */}
      {selectedInfluencerDetail && memoizedInfluencer && (
        <div>
          {(() => {
            console.log('🔍 [DEBUG] Rendering InfluencerDetailPanel with:', {
              detailPanelOpen,
              hasSelectedInfluencerDetail: !!selectedInfluencerDetail,
              selectedInfluencerDetailId: selectedInfluencerDetail?.id,
              hasMemoizedInfluencer: !!memoizedInfluencer,
              timestamp: new Date().toISOString()
            })
            return null
          })()}
          <ErrorBoundary>
            <InfluencerDetailPanel
              isOpen={detailPanelOpen}
              onClose={handleClosePanels}
              influencer={memoizedInfluencer}
          selectedPlatform={selectedPlatform as 'instagram' | 'tiktok' | 'youtube'}
          onPlatformSwitch={(platform) => {
            setSelectedPlatform(platform)
            console.log('🔄 Roster platform switched to:', platform)
          }}
        />
          </ErrorBoundary>
        </div>
      )}

      {/* Dashboard Info Panel */}
      <DashboardInfoPanel
        influencer={selectedDashboardInfluencer}
        isOpen={dashboardPanelOpen}
        onClose={handleClosePanels}
      />
    </div>
  )
}

export default function StaffRosterPage() {
  const [isAnyPanelOpen, setIsAnyPanelOpen] = useState(false)

  // Memoize the panel state change handler
  const handlePanelStateChange = useCallback((isOpen: boolean) => {
    setIsAnyPanelOpen(isOpen)
  }, [])

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        
        <main className={`px-4 lg:px-8 pb-8 transition-all duration-300 ${
          isAnyPanelOpen ? 'mr-[400px]' : ''
        }`}>
          <Suspense fallback={<div>Loading...</div>}>
            <InfluencerTableClient 
              searchParams={{}}
              onPanelStateChange={handlePanelStateChange}
            />
          </Suspense>
        </main>
      </div>
    </StaffProtectedRoute>
  )
} 