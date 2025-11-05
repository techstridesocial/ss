'use client'

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useCurrentUserId } from '@/lib/auth/current-user'
import ErrorBoundary from '../../../components/debug/ErrorBoundary'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { StaffInfluencer, RosterFilters } from '../../../types/staff'
import { FilterIcon, Plus, RefreshCw, ChevronDown, Eye, TrendingUp, Users, MapPin, BarChart3, User, Trash2, AlertTriangle } from 'lucide-react'

// Import from separate files to avoid circular dependency issues during bundling
import {
  PlatformIcon,
  RosterSortableHeader,
  RosterPagination,
  RosterEmptyState,
  RosterLoadingSkeleton,
  RosterErrorBanner,
  RosterFilterPanel
} from '../../../components/staff/roster/ui'

import {
  useRosterData,
  useRosterActions,
  useRosterInfluencerAnalytics
} from '../../../components/staff/roster/hooks'

import {
  transformInfluencerForDetailPanel,
  formatNumber,
  getInfluencerTier,
  checkFollowerRange,
  checkEngagementRange,
  needsAssignment
} from '../../../components/staff/roster/utils'

// Lazy load heavy modal components
const EditInfluencerModal = dynamic(() => import('../../../components/modals/EditInfluencerModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})
const AssignInfluencerModal = dynamic(() => import('../../../components/modals/AssignInfluencerModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})
const AddInfluencerPanel = dynamic(() => import('../../../components/influencer/AddInfluencerPanel'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})
const InfluencerDetailPanel = dynamic(() => import('../../../components/influencer/InfluencerDetailPanel'), {
  ssr: false,
  loading: () => <div>Loading analytics...</div>
})
const DashboardInfoPanel = dynamic(() => import('../../../components/influencer/DashboardInfoPanel'), {
  ssr: false,
  loading: () => <div>Loading dashboard...</div>
})

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
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const pathname = usePathname()

  // Use extracted hooks
  const { 
    influencers, 
    setInfluencers,
    isInitialLoading, 
    loadError, 
    loadInfluencers,
    refreshInfluencers 
  } = useRosterData()

  const { 
    isLoading: actionLoading,
    handleSaveInfluencerEdit,
    handleDeleteInfluencer,
    handleSaveAssignment,
    handleSaveManagement,
    handleBulkRefreshAnalytics
  } = useRosterActions({
    onRefresh: loadInfluencers,
    onInfluencersUpdate: setInfluencers
  })

  // Modal and panel state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<StaffInfluencer | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerForAnalytics, setSelectedInfluencerForAnalytics] = useState<StaffInfluencer | null>(null)
  const [dashboardPanelOpen, setDashboardPanelOpen] = useState(false)
  const [selectedDashboardInfluencer, setSelectedDashboardInfluencer] = useState<StaffInfluencer | null>(null)
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false)

  // Filter and search state - MUST be declared before hooks that use them
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')

  // Fetch complete influencer analytics when panel opens
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    retry: retryAnalytics
  } = useRosterInfluencerAnalytics(selectedInfluencerForAnalytics, detailPanelOpen, selectedPlatform)

  // Additional filter and search state
  const [activeTab, setActiveTab] = useState<'ALL' | 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER' | 'PENDING_ASSIGNMENT' | 'MY_CREATORS'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [rosterFilters, setRosterFilters] = useState<RosterFilters>({
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

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })

  // URL state management - always keep URL clean, just staff/roster
  const updateUrl = () => {
    router.replace(pathname, { scroll: false })
  }

  // No longer reading any URL parameters - URL stays clean as staff/roster

  // Filter handlers
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

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }

  // Apply filters
  const applyFilters = (influencers: StaffInfluencer[]) => {
    return influencers.filter(influencer => {
      // Tab filter
  if (activeTab === 'ALL') {
        if (!(influencer.influencer_type === 'SIGNED' || influencer.influencer_type === 'PARTNERED')) return false
  } else if (activeTab === 'SIGNED') {
        if (!(influencer.influencer_type === 'SIGNED')) return false
  } else if (activeTab === 'PARTNERED') {
        if (influencer.influencer_type !== 'PARTNERED') return false
  } else if (activeTab === 'MY_CREATORS') {
        if (!influencer.assigned_to || !currentUserId || influencer.assigned_to !== currentUserId) return false
  } else if (activeTab === 'PENDING_ASSIGNMENT') {
        if (!needsAssignment(influencer)) return false
  } else {
        if (influencer.influencer_type !== activeTab) return false
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
      const matchesPlatform = !rosterFilters.platform || (Array.isArray(influencer.platforms) && influencer.platforms.includes(rosterFilters.platform as Platform))
      const matchesFollowerRange = !rosterFilters.followerRange || checkFollowerRange(influencer.total_followers, rosterFilters.followerRange)
      const matchesEngagementRange = !rosterFilters.engagementRange || checkEngagementRange(influencer.total_engagement_rate, rosterFilters.engagementRange)
      const matchesLocation = !rosterFilters.location || influencer.location_country === rosterFilters.location
      const matchesInfluencerType = !rosterFilters.influencerType || influencer.influencer_type === rosterFilters.influencerType
      const matchesContentType = !rosterFilters.contentType || influencer.content_type === rosterFilters.contentType
      const matchesTier = !rosterFilters.tier || getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type || '', influencer.tier || '') === rosterFilters.tier
      const matchesStatus = !rosterFilters.status || influencer.is_active.toString() === rosterFilters.status

      return matchesNiche && matchesPlatform && matchesFollowerRange && 
             matchesEngagementRange && matchesLocation && matchesInfluencerType && 
             matchesContentType && matchesTier && matchesStatus
    })
  }

  // Calculate tab counts
  const tabCounts = React.useMemo(() => {
    const counts = {
      ALL: 0,
      SIGNED: 0,
      PARTNERED: 0,
      AGENCY_PARTNER: 0,
      PENDING_ASSIGNMENT: 0,
      MY_CREATORS: 0
    }

    influencers.forEach(influencer => {
      let matchesFilters = true
      
      // Apply search and filters for counting
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        matchesFilters = influencer.display_name.toLowerCase().includes(searchLower) ||
                        influencer.first_name?.toLowerCase().includes(searchLower) ||
                        influencer.last_name?.toLowerCase().includes(searchLower) ||
                        (influencer.niches || []).some((niche: string) => niche.toLowerCase().includes(searchLower))
      }

      if (matchesFilters && rosterFilters.niche) {
        matchesFilters = (influencer.niches || []).includes(rosterFilters.niche)
      }
      if (matchesFilters && rosterFilters.platform) {
        matchesFilters = Array.isArray(influencer.platforms) && influencer.platforms.includes(rosterFilters.platform as Platform)
      }
      if (matchesFilters && rosterFilters.followerRange) {
        matchesFilters = checkFollowerRange(influencer.total_followers, rosterFilters.followerRange)
      }
      if (matchesFilters && rosterFilters.engagementRange) {
        matchesFilters = checkEngagementRange(influencer.total_engagement_rate, rosterFilters.engagementRange)
      }
      if (matchesFilters && rosterFilters.location) {
        matchesFilters = influencer.location_country === rosterFilters.location
      }
      if (matchesFilters && rosterFilters.influencerType) {
        matchesFilters = influencer.influencer_type === rosterFilters.influencerType
      }
      if (matchesFilters && rosterFilters.contentType) {
        matchesFilters = influencer.content_type === rosterFilters.contentType
      }
      if (matchesFilters && rosterFilters.tier) {
        matchesFilters = getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type || '', influencer.tier || '') === rosterFilters.tier
      }
      if (matchesFilters && rosterFilters.status) {
        matchesFilters = influencer.is_active.toString() === rosterFilters.status
      }

      if (!matchesFilters) return

      const isPending = needsAssignment(influencer)
      
      if (influencer.influencer_type === 'SIGNED' || influencer.influencer_type === 'PARTNERED' || influencer.influencer_type === 'AGENCY_PARTNER') {
        counts.ALL++
      }
      if (influencer.influencer_type === 'SIGNED' && !isPending) counts.SIGNED++
      if (influencer.influencer_type === 'PARTNERED') counts.PARTNERED++
      if (influencer.influencer_type === 'AGENCY_PARTNER' && !isPending) counts.AGENCY_PARTNER++
      if (isPending) counts.PENDING_ASSIGNMENT++
      if (influencer.assigned_to && currentUserId && influencer.assigned_to === currentUserId) counts.MY_CREATORS++
    })

    return counts
  }, [influencers, searchQuery, rosterFilters, currentUserId])

  // Apply filters, sorting, pagination
  const filteredInfluencers = React.useMemo(() => applyFilters(influencers), [influencers, activeTab, searchQuery, rosterFilters])
  
  const sortedInfluencers = React.useMemo(() => {
    if (!sortConfig.key) return filteredInfluencers

    return [...filteredInfluencers].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof StaffInfluencer]
      let bValue = b[sortConfig.key as keyof StaffInfluencer]

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

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredInfluencers, sortConfig])
  
  const totalInfluencers = sortedInfluencers.length
  const totalPages = Math.ceil(totalInfluencers / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedInfluencers = sortedInfluencers.slice(startIndex, endIndex)

  // Panel handlers
  const handleViewInfluencer = (influencer: StaffInfluencer) => {
    // Set the influencer to fetch analytics for
    setSelectedInfluencerForAnalytics(influencer)
    setDetailPanelOpen(true)
    onPanelStateChange?.(true)
    // Keep URL clean - just staff/roster
    updateUrl()
  }

  const handleViewDashboardInfo = (influencer: StaffInfluencer) => {
    router.replace(pathname, { scroll: false })
    setDetailPanelOpen(false)
    setSelectedInfluencerForAnalytics(null)
    setSelectedDashboardInfluencer(influencer)
    setDashboardPanelOpen(true)
    onPanelStateChange?.(true)
  }

  const handleClosePanels = () => {
    router.replace(pathname, { scroll: false })
    setDetailPanelOpen(false)
    setSelectedInfluencerForAnalytics(null)
    setSelectedInfluencer(null)
    setDashboardPanelOpen(false)
    setSelectedDashboardInfluencer(null)
    onPanelStateChange?.(false)
  }

  const handlePlatformSwitch = (platform: string) => {
    setSelectedPlatform(platform)
    // Don't update URL - keep it clean
  }

  // CRUD handlers with extracted actions
  const onEditInfluencer = (influencer: StaffInfluencer) => {
    setSelectedInfluencer(influencer)
    setEditModalOpen(true)
  }

  const onAssignInfluencer = (influencer: StaffInfluencer) => {
    setSelectedInfluencer(influencer)
    setAssignModalOpen(true)
  }

  const onDeleteInfluencer = (influencer: StaffInfluencer) => {
    setSelectedInfluencer(influencer)
    setDeleteModalOpen(true)
  }

  const onSaveEdit = async (data: any) => {
    try {
      await handleSaveInfluencerEdit(data)
      
      const oldType = selectedInfluencer?.influencer_type
      const newType = data.influencer_type
      
      if (oldType && newType && oldType !== newType) {
        const targetTab = newType === 'SIGNED' ? 'SIGNED' : newType === 'PARTNERED' ? 'PARTNERED' : newType === 'AGENCY_PARTNER' ? 'AGENCY_PARTNER' : 'ALL'
        alert(`✅ Influencer ${data.display_name} updated successfully!\n\n📋 Type changed from ${oldType} to ${newType}.\n🔄 The influencer now appears in the ${targetTab} tab.`)
        setActiveTab(targetTab)
      } else {
        alert(`✅ Influencer ${data.display_name} updated successfully!`)
      }
      
      setEditModalOpen(false)
      setSelectedInfluencer(null)
    } catch (error) {
      alert(`❌ Error updating influencer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const onSaveAssignment = async (assignmentData: any) => {
    if (!selectedInfluencer) throw new Error('No influencer selected')
    
    try {
      await handleSaveAssignment(selectedInfluencer.id, assignmentData)
      setAssignModalOpen(false)
      setSelectedInfluencer(null)
    } catch (error) {
      throw error
    }
  }

  const onConfirmDelete = async () => {
    if (!selectedInfluencer) return
    
    try {
      await handleDeleteInfluencer(selectedInfluencer)
      alert(`✅ ${selectedInfluencer.display_name} has been deleted successfully.`)
    } catch (error) {
      alert(`❌ Error deleting influencer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleteModalOpen(false)
      setSelectedInfluencer(null)
    }
  }

  const onAddInfluencer = async (data: any) => {
    await loadInfluencers()
    const targetTab = data.influencer_type === 'SIGNED' ? 'SIGNED' : data.influencer_type === 'PARTNERED' ? 'PARTNERED' : data.influencer_type === 'AGENCY_PARTNER' ? 'AGENCY_PARTNER' : 'ALL'
    setActiveTab(targetTab)
  }

  const onBulkRefresh = async () => {
    setIsRefreshingAnalytics(true)
    try {
      await handleBulkRefreshAnalytics()
      alert('✅ Analytics refreshed successfully!')
    } catch (error) {
      alert(`Failed to refresh analytics: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsRefreshingAnalytics(false)
    }
  }

  const onSaveManagement = async (data: any) => {
    if (!selectedInfluencerForAnalytics) return
    
    try {
      await handleSaveManagement(selectedInfluencerForAnalytics.id, data)
      
      // Refresh the analytics data to show updated management info
      retryAnalytics()
    } catch (error) {
      alert(`❌ Error saving management data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Track panel state
  useEffect(() => {
    const isAnyPanelOpen = detailPanelOpen || addModalOpen
    onPanelStateChange?.(isAnyPanelOpen)
  }, [detailPanelOpen, addModalOpen])

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
          onClick={onBulkRefresh}
          disabled={isRefreshingAnalytics}
          className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-medium disabled:opacity-50"
          title="Refresh Analytics for All Influencers"
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshingAnalytics ? 'animate-spin' : ''}`} />
          {isRefreshingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>

      {/* Filter Panel */}
      <RosterFilterPanel
        filters={rosterFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearRosterFilters}
        isOpen={rosterFilterOpen}
      />

      {/* Error Banner */}
      {loadError && (
        <RosterErrorBanner 
          error={loadError} 
          onRetry={loadInfluencers} 
        />
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'ALL', label: 'All Influencers', count: tabCounts.ALL },
            { key: 'MY_CREATORS', label: 'My Creators', count: tabCounts.MY_CREATORS, highlight: true },
            { key: 'PENDING_ASSIGNMENT', label: 'Pending Assignment', count: tabCounts.PENDING_ASSIGNMENT, urgent: true },
            { key: 'SIGNED', label: 'Signed', count: tabCounts.SIGNED },
            { key: 'PARTNERED', label: 'Partnered', count: tabCounts.PARTNERED },
            { key: 'AGENCY_PARTNER', label: 'Agency Partners', count: tabCounts.AGENCY_PARTNER }
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
                <RosterSortableHeader sortKey="display_name" sortConfig={sortConfig} onSort={handleSort}>Influencer</RosterSortableHeader>
                <RosterSortableHeader sortKey="influencer_type" sortConfig={sortConfig} onSort={handleSort}>Type/Agency</RosterSortableHeader>
                <RosterSortableHeader sortKey="content_type" sortConfig={sortConfig} onSort={handleSort}>Content Type</RosterSortableHeader>
                <RosterSortableHeader sortKey="platforms" sortConfig={sortConfig} onSort={handleSort}>Platforms</RosterSortableHeader>
                <RosterSortableHeader sortKey="niches" sortConfig={sortConfig} onSort={handleSort}>Niches</RosterSortableHeader>
                <RosterSortableHeader sortKey="total_followers" sortConfig={sortConfig} onSort={handleSort}>Followers</RosterSortableHeader>
                <RosterSortableHeader sortKey="total_engagement_rate" sortConfig={sortConfig} onSort={handleSort}>Engagement</RosterSortableHeader>
                <RosterSortableHeader sortKey="total_avg_views" sortConfig={sortConfig} onSort={handleSort}>Avg Views</RosterSortableHeader>
                <RosterSortableHeader sortKey="location_city" sortConfig={sortConfig} onSort={handleSort}>Location</RosterSortableHeader>
                <RosterSortableHeader sortKey="is_active" sortConfig={sortConfig} onSort={handleSort}>Status</RosterSortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {isInitialLoading ? (
                <RosterLoadingSkeleton />
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
                          ? getInfluencerTier(influencer.total_followers, influencer.total_engagement_rate, influencer.influencer_type || '', influencer.tier || '') === 'GOLD'
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
                      {(Array.isArray(influencer.platforms) ? influencer.platforms : []).filter(Boolean).map((platform: Platform, index: number) => (
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
                        <span key={niche} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
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
                      {needsAssignment(influencer) && (
                        <button
                          onClick={() => onAssignInfluencer(influencer)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                          title="Assign Influencer Type & Staff Member"
                        >
                          <User size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleViewInfluencer(influencer)
                        }}
                        disabled={actionLoading}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                        title="View Analytics & Performance"
                      >
                        <BarChart3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleViewDashboardInfo(influencer)}
                        disabled={actionLoading}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                        title="View Dashboard Info & Account Status"
                      >
                        <User size={16} />
                      </button>
                      
                      <button
                        onClick={() => onDeleteInfluencer(influencer)}
                        disabled={actionLoading}
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
        {paginatedInfluencers.length === 0 && !isInitialLoading && (
          <RosterEmptyState
            searchQuery={searchQuery}
            hasActiveFilters={Object.values(rosterFilters).some(value => value !== '')}
            activeTab={activeTab}
            onAddClick={() => setAddModalOpen(true)}
          />
        )}
      </div>

      {/* Pagination */}
      <RosterPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalInfluencers}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modals */}
      {editModalOpen && selectedInfluencer && (
        <EditInfluencerModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedInfluencer(null)
          }}
          influencer={selectedInfluencer as any}
          onSave={onSaveEdit}
        />
      )}

      {assignModalOpen && selectedInfluencer && (
        <AssignInfluencerModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setSelectedInfluencer(null)
          }}
          influencer={selectedInfluencer as any}
          onAssign={onSaveAssignment}
        />
      )}

      {addModalOpen && (
        <AddInfluencerPanel
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={onAddInfluencer}
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
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm text-gray-700 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Panel - Always render when open, use fallback data if analytics not loaded yet */}
      {detailPanelOpen && selectedInfluencerForAnalytics && (
        <div>
          <ErrorBoundary>
            <InfluencerDetailPanel
              isOpen={detailPanelOpen}
              onClose={() => {
                setDetailPanelOpen(false)
                setSelectedInfluencerForAnalytics(null)
              }}
              influencer={analyticsData || selectedInfluencerForAnalytics}
          selectedPlatform={selectedPlatform as 'instagram' | 'tiktok' | 'youtube'}
              onPlatformSwitch={handlePlatformSwitch}
              loading={analyticsLoading}
        />
          </ErrorBoundary>
        </div>
      )}

      {/* Show loading state while fetching analytics */}
      {detailPanelOpen && analyticsLoading && !analyticsData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-gray-700">Loading analytics...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Show error state if analytics fetch failed */}
      {detailPanelOpen && analyticsError && !analyticsData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Failed to Load Analytics</h3>
              <p className="text-sm text-gray-600">{analyticsError}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDetailPanelOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => retryAnalytics()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

