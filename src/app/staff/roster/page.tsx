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
import { ANALYTICS_CACHE_TTL_MS } from '@/constants/analytics'
import { FilterIcon, Plus, RefreshCw, ChevronDown, Eye, TrendingUp, Users, MapPin, BarChart3, User, Trash2, AlertTriangle, Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

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

function parseNotes(rawNotes: unknown): any {
  if (!rawNotes) return null
  if (typeof rawNotes === 'string') {
    try {
      return JSON.parse(rawNotes)
    } catch (error) {
      console.warn('⚠️ Failed to parse roster influencer notes:', error)
      return null
    }
  }
  if (typeof rawNotes === 'object') {
    return rawNotes
  }
  return null
}

function getAnalyticsProgress(influencer: StaffInfluencer) {
  const totalPlatforms = Array.isArray(influencer.platforms)
    ? influencer.platforms.filter(Boolean).length
    : 0

  if (totalPlatforms === 0) {
    return { total: 0, synced: 0 }
  }

  const notesObject = parseNotes(influencer.notes)
  const platformsData = notesObject?.modash_data?.platforms
  if (!platformsData) {
    return { total: totalPlatforms, synced: 0 }
  }

  const synced = influencer.platforms.reduce((count, platform) => {
    if (!platform) return count
    const key = platform.toLowerCase()
    const record = platformsData[key]
    if (!record?.last_refreshed) return count
    const lastRefreshedTime = new Date(record.last_refreshed).getTime()
    if (Number.isNaN(lastRefreshedTime)) return count
    if (Date.now() - lastRefreshedTime <= ANALYTICS_CACHE_TTL_MS) {
      return count + 1
    }
    return count
  }, 0)

  return { total: totalPlatforms, synced }
}

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
const CreateSubmissionListModal = dynamic(() => import('../../../components/staff/CreateSubmissionListModal'), {
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
  const { toast } = useToast()

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
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(false)
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false)
  const [createSubmissionModalOpen, setCreateSubmissionModalOpen] = useState(false)
  const [selectedInfluencerForSubmission, setSelectedInfluencerForSubmission] = useState<StaffInfluencer | null>(null)

  // Filter and search state - MUST be declared before hooks that use them
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')

  const handleCreateSubmissionList = (influencer: StaffInfluencer) => {
    setSelectedInfluencerForSubmission(influencer)
    setCreateSubmissionModalOpen(true)
  }

  const handleAnalyticsNotesUpdate = useCallback((influencerId: string, newNotes: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === influencerId ? { ...inf, notes: newNotes } : inf
    ))

    setSelectedInfluencerForAnalytics(prev => {
      if (prev && prev.id === influencerId) {
        return { ...prev, notes: newNotes }
      }
      return prev
    })

    setSelectedDashboardInfluencer(prev => {
      if (prev && prev.id === influencerId) {
        return { ...prev, notes: newNotes }
      }
      return prev
    })
  }, [setInfluencers, setSelectedInfluencerForAnalytics, setSelectedDashboardInfluencer])

  // Fetch complete influencer analytics when panel opens
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    retry: retryAnalytics
  } = useRosterInfluencerAnalytics(
    selectedInfluencerForAnalytics,
    detailPanelOpen,
    selectedPlatform,
    { onNotesUpdate: handleAnalyticsNotesUpdate }
  )

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

  const handleViewDashboardInfo = async (influencer: StaffInfluencer) => {
    router.replace(pathname, { scroll: false })
    setDetailPanelOpen(false)
    setSelectedInfluencerForAnalytics(null)
    setDashboardPanelOpen(true)
    onPanelStateChange?.(true)
    
    // Fetch fresh data from API to ensure stats and last_login are up to date
    setIsLoadingDashboardData(true)
    try {
      const response = await fetch(`/api/roster/${influencer.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedDashboardInfluencer(result.data)
        } else {
          // Fallback to table data if API fails
          setSelectedDashboardInfluencer(influencer)
        }
      } else {
        // Fallback to table data if API fails
        setSelectedDashboardInfluencer(influencer)
      }
    } catch (error) {
      console.error('Error fetching fresh influencer data:', error)
      // Fallback to table data if API fails
      setSelectedDashboardInfluencer(influencer)
    } finally {
      setIsLoadingDashboardData(false)
    }
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
        toast({
          title: 'Influencer Updated',
          description: `Type changed from ${oldType} to ${newType}. The influencer now appears in the ${targetTab} tab.`,
          variant: 'default'
        })
        setActiveTab(targetTab)
      } else {
        toast({
          title: 'Success',
          description: `${data.display_name} has been updated successfully.`,
          variant: 'default'
        })
      }
      
      setEditModalOpen(false)
      setSelectedInfluencer(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update influencer. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const onSaveAssignment = async (assignmentData: any) => {
    if (!selectedInfluencer) {
      toast({
        title: 'Error',
        description: 'No influencer selected',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await handleSaveAssignment(selectedInfluencer.id, assignmentData)
      
      // Determine target tab based on assigned type
      const targetTab = assignmentData.influencer_type === 'SIGNED' 
        ? 'SIGNED' 
        : assignmentData.influencer_type === 'PARTNERED' 
        ? 'PARTNERED' 
        : assignmentData.influencer_type === 'AGENCY_PARTNER'
        ? 'AGENCY_PARTNER'
        : 'ALL'
      
      toast({
        title: 'Assignment Successful',
        description: `${selectedInfluencer.display_name} has been assigned as ${assignmentData.influencer_type} with ${assignmentData.content_type} content type.`,
        variant: 'default'
      })
      
      setAssignModalOpen(false)
      setSelectedInfluencer(null)
      
      // Switch to appropriate tab after assignment
      setActiveTab(targetTab)
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign influencer. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const onConfirmDelete = async () => {
    if (!selectedInfluencer) return
    
    try {
      await handleDeleteInfluencer(selectedInfluencer)
      toast({
        title: 'Success',
        description: `${selectedInfluencer.display_name} has been deleted successfully.`,
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete influencer. Please try again.',
        variant: 'destructive'
      })
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
      toast({
        title: 'Success',
        description: 'Analytics refreshed successfully!',
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to refresh analytics. Please try again.',
        variant: 'destructive'
      })
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100/80 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search influencers by name, niche, or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRosterFilterOpen(!rosterFilterOpen)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 shadow-sm font-semibold md:w-auto flex items-center gap-2 ${
                Object.values(rosterFilters).filter(value => value !== '').length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/40'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <FilterIcon className="h-4 w-4" />
              Filters
              {Object.values(rosterFilters).filter(value => value !== '').length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full font-bold">
                  {Object.values(rosterFilters).filter(value => value !== '').length}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${rosterFilterOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 flex items-center gap-2 font-bold md:w-auto"
            >
              <Plus size={16} />
              Add Influencer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBulkRefresh}
              disabled={isRefreshingAnalytics}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-60 transition-all duration-300 shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 flex items-center gap-2 font-bold md:w-auto"
              title="Refresh Analytics for All Influencers"
            >
              <RefreshCw size={16} className={isRefreshingAnalytics ? 'animate-spin' : ''} />
              {isRefreshingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
            </motion.button>
          </div>
        </div>
      </motion.div>

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100/80 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Influencers</h3>
            </div>
            <div className="text-sm text-gray-500">
              {totalInfluencers} influencer{totalInfluencers !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-100/50">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                <tr>
                  <RosterSortableHeader sortKey="display_name" sortConfig={sortConfig} onSort={handleSort} className="sticky left-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100/50 border-r-2 border-gray-200/60">Influencer</RosterSortableHeader>
                  <RosterSortableHeader sortKey="influencer_type" sortConfig={sortConfig} onSort={handleSort}>Type/Agency</RosterSortableHeader>
                  <RosterSortableHeader sortKey="content_type" sortConfig={sortConfig} onSort={handleSort}>Content Type</RosterSortableHeader>
                  <RosterSortableHeader sortKey="platforms" sortConfig={sortConfig} onSort={handleSort} className="min-w-[180px]">Platforms</RosterSortableHeader>
                  <RosterSortableHeader sortKey="niches" sortConfig={sortConfig} onSort={handleSort}>Niches</RosterSortableHeader>
                  <RosterSortableHeader sortKey="total_followers" sortConfig={sortConfig} onSort={handleSort}>Followers</RosterSortableHeader>
                  <RosterSortableHeader sortKey="total_engagement_rate" sortConfig={sortConfig} onSort={handleSort}>Engagement</RosterSortableHeader>
                  <RosterSortableHeader sortKey="total_avg_views" sortConfig={sortConfig} onSort={handleSort}>Avg Views</RosterSortableHeader>
                  <RosterSortableHeader sortKey="location_city" sortConfig={sortConfig} onSort={handleSort}>Location</RosterSortableHeader>
                  <RosterSortableHeader sortKey="is_active" sortConfig={sortConfig} onSort={handleSort}>Status</RosterSortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
              {isInitialLoading ? (
                <RosterLoadingSkeleton />
              ) : paginatedInfluencers.map((influencer) => {
                const analyticsProgress = getAnalyticsProgress(influencer)
                const progressLabel = `${analyticsProgress.synced}/${analyticsProgress.total}`
                const allSynced = analyticsProgress.total > 0 && analyticsProgress.synced >= analyticsProgress.total
                
                // Count platforms and extract platform strings
                // Simple: just count how many platforms exist
                const platformStrings: Platform[] = []
                
                if (Array.isArray(influencer.platforms)) {
                  influencer.platforms.forEach((p: any) => {
                    if (!p) return
                    
                    // Extract platform name (handle both object and string formats)
                    const platformName = typeof p === 'object' && p !== null 
                      ? (p.platform || p) 
                      : p
                    
                    if (platformName) {
                      platformStrings.push(platformName as Platform)
                    }
                  })
                }
                
                // Simple count: just how many platforms exist
                const platformCount = platformStrings.length
                const connectionLabel = `${platformCount}/3`

                return (
                <tr key={influencer.id} className={`${(detailPanelOpen || dashboardPanelOpen) ? '' : 'hover:bg-blue-50/30 transition-colors'} ${
                  needsAssignment(influencer) ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                }`}>
                  {/* Influencer Info - Sticky Column */}
                  <td className={`px-6 py-5 whitespace-nowrap sticky left-0 z-10 border-r-2 border-gray-200/60 ${
                    needsAssignment(influencer) ? 'bg-orange-50' : 'bg-white'
                  } ${(detailPanelOpen || dashboardPanelOpen) ? '' : 'hover:bg-blue-50/30'}`}>
                    <div 
                      className={`flex items-center cursor-pointer rounded-lg p-2 -m-2 ${(detailPanelOpen || dashboardPanelOpen) ? '' : 'hover:bg-gray-50 transition-colors duration-200'}`}
                      onClick={() => handleViewDashboardInfo(influencer)}
                      title="Click to view dashboard info"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold text-slate-900">
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
                  <td className="px-6 py-5 whitespace-nowrap">
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
                      <span className="text-sm font-medium text-slate-900">
                        {influencer.agency_name || 'Unknown Agency'}
                      </span>
                    ) : null}
                  </td>

                  {/* Content Type */}
                  <td className="px-6 py-5 whitespace-nowrap">
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
                  <td className="px-6 py-5 whitespace-nowrap min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {platformStrings.map((platform: Platform, index: number) => (
                          <div key={`${influencer.id}-${platform}-${index}`} className="flex items-center">
                            <PlatformIcon platform={platform} size={24} />
                          </div>
                        ))}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full border text-xs font-semibold flex items-center justify-center ${
                          platformCount > 0 ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-600'
                        }`}
                        title={`${platformCount} out of 3 platforms`}
                      >
                        {connectionLabel}
                      </div>
                    </div>
                  </td>

                  {/* Niches */}
                  <td className="px-6 py-5">
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
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-slate-900">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_followers)}
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-slate-900">
                      <TrendingUp size={14} className="mr-1 text-gray-400" />
                      {influencer.total_engagement_rate && Number(influencer.total_engagement_rate) > 0 
                        ? (Number(influencer.total_engagement_rate) * 100).toFixed(1) 
                        : '0.0'}%
                    </div>
                  </td>

                  {/* Average Views */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-slate-900">
                      <Eye size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_avg_views)}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">{influencer.location_city}</div>
                        <div className="text-xs text-gray-500">{influencer.location_country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      influencer.is_active 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {influencer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      {needsAssignment(influencer) && (
                        <Button
                          onClick={() => onAssignInfluencer(influencer)}
                          disabled={actionLoading}
                          variant="ghost"
                          size="icon"
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                          title="Assign Influencer Type & Staff Member"
                        >
                          <User size={16} />
                        </Button>
                      )}
                      
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleViewInfluencer(influencer)
                        }}
                        disabled={actionLoading}
                        variant="ghost"
                        size="icon"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="View Analytics & Performance"
                      >
                        <BarChart3 size={16} />
                      </Button>
                      
                      <Button
                        onClick={() => handleViewDashboardInfo(influencer)}
                        disabled={actionLoading}
                        variant="ghost"
                        size="icon"
                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        title="View Dashboard Info & Account Status"
                      >
                        <Eye size={16} />
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCreateSubmissionList(influencer)
                        }}
                        disabled={actionLoading}
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        title="Create New Submission List"
                      >
                        <Plus size={16} />
                      </Button>
                      
                      <Button
                        onClick={() => onDeleteInfluencer(influencer)}
                        disabled={actionLoading}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Influencer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        </div>
      </motion.div>

        {/* Empty State */}
        {paginatedInfluencers.length === 0 && !isInitialLoading && (
          <RosterEmptyState
            searchQuery={searchQuery}
            hasActiveFilters={Object.values(rosterFilters).some(value => value !== '')}
            activeTab={activeTab}
            onAddClick={() => setAddModalOpen(true)}
          />
        )}

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
          onCloseAction={() => setAddModalOpen(false)}
          onSaveAction={onAddInfluencer}
        />
      )}

      {/* Create Submission List Modal */}
      {createSubmissionModalOpen && selectedInfluencerForSubmission && (
        <CreateSubmissionListModal
          isOpen={createSubmissionModalOpen}
          onClose={() => {
            setCreateSubmissionModalOpen(false)
            setSelectedInfluencerForSubmission(null)
          }}
          initialInfluencer={{
            id: selectedInfluencerForSubmission.id,
            display_name: selectedInfluencerForSubmission.display_name,
            total_followers: selectedInfluencerForSubmission.total_followers,
            total_engagement_rate: selectedInfluencerForSubmission.total_engagement_rate
          }}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setSelectedInfluencer(null)
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-60 transition-all shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 font-bold"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </motion.button>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDetailPanelOpen(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-semibold"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => retryAnalytics()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 font-bold"
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoadingDashboardData ? (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Loading dashboard data...</span>
            </div>
          </div>
        </div>
      ) : (
        <DashboardInfoPanel
          influencer={selectedDashboardInfluencer}
          isOpen={dashboardPanelOpen}
          onClose={handleClosePanels}
        />
      )}
      
      <Toaster />
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

