'use client'

import React, { useState, useEffect } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import CampaignDetailPanel from '../../../components/campaigns/CampaignDetailPanel'
import EditCampaignModal from '../../../components/campaigns/EditCampaignModal'
import CreateCampaignModal from '../../../components/campaigns/CreateCampaignModal'
import { 
  Megaphone, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  Eye,
  Edit,
  Plus,
  Target,
  TrendingUp,
  Package,
  FilterIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Campaign } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// StatCard component for dashboard metrics
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function CampaignsPageClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'info' | 'warning' | 'error',
    onConfirm: null as (() => void) | null,
    confirmText: '',
    cancelText: ''
  })

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    brand: '',
    platform: 'all',
    niche: '',
    budgetRange: '',
    dateRange: '',
    performance: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter function - MUST be defined before useMemo
  const applyCampaignFilters = (campaigns: Campaign[]) => {
    return campaigns.filter(campaign => {
      // Status filter
      if (filters.status && filters.status !== 'all' && campaign.status.toLowerCase() !== filters.status.toLowerCase()) return false
      
      // Brand filter
      if (filters.brand && !campaign.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false
      
      // Platform filter
      if (filters.platform && filters.platform !== 'all' && !campaign.requirements.platforms.includes(filters.platform)) return false
      
      // Search term
      if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !campaign.brand.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      return true
    })
  }

  // Apply sorting - MUST be called unconditionally (Rules of Hooks)
  const sortedCampaigns = React.useMemo(() => {
    const filteredCampaigns = applyCampaignFilters(campaigns)
    
    if (!sortConfig.key) return filteredCampaigns

    return [...filteredCampaigns].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a]
      let bValue: any = b[sortConfig.key as keyof typeof b]

      // Handle nested properties
      if (sortConfig.key === 'brand_name') {
        aValue = typeof a.brand === 'string' ? a.brand : (a.brand as any)?.name || ''
        bValue = typeof b.brand === 'string' ? b.brand : (b.brand as any)?.name || ''
      } else if (sortConfig.key === 'budget') {
        aValue = parseFloat(a.budget?.total?.toString() || '0')
        bValue = parseFloat(b.budget?.total?.toString() || '0')
      } else if (sortConfig.key === 'influencer_count') {
        aValue = a.totalInfluencers || 0
        bValue = b.totalInfluencers || 0
      }

      // Handle date sorting
      if (sortConfig.key && (sortConfig.key.includes('_at') || sortConfig.key === 'start_date' || sortConfig.key === 'end_date')) {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [campaigns, sortConfig, filters, searchTerm])

  // Pagination calculations
  const totalCampaigns = sortedCampaigns.length
  const totalPages = Math.ceil(totalCampaigns / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex)

  // Fetch campaigns from API
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns')
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      if (data.success) {
        setCampaigns(data.campaigns)
      } else {
        throw new Error(data.error || 'Failed to fetch campaigns')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const showNotificationModal = (
    title: string, 
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setNotificationConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || null,
      confirmText: confirmText || 'OK',
      cancelText: cancelText || 'Cancel'
    })
    setShowNotification(true)
  }

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showNotificationModal(title, message, 'warning', onConfirm, confirmText, cancelText)
  }

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      if (response.ok) {
        showNotificationModal('Success', 'Campaign created successfully', 'success')
        fetchCampaigns() // Refresh the list
      } else {
        const error = await response.json()
        showNotificationModal('Error', error.error || 'Failed to create campaign', 'error')
      }
    } catch (error) {
      showNotificationModal('Error', 'Failed to create campaign', 'error')
    }
  }


  const handleViewCampaign = (campaign: Campaign) => {
    console.log('handleViewCampaign called with:', campaign)
    setSelectedCampaign(campaign)
    setShowDetailPanel(true)
    console.log('Panel should be open now, showDetailPanel:', true)
  }

  const handleEditCampaign = (campaignId: string) => {
    setEditingCampaignId(campaignId)
    setShowEditModal(true)
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' })
      })
      
      if (response.ok) {
        showNotificationModal('Success', 'Campaign paused successfully', 'success')
        fetchCampaigns()
      } else {
        showNotificationModal('Error', 'Failed to pause campaign', 'error')
      }
    } catch (error) {
      showNotificationModal('Error', 'Failed to pause campaign', 'error')
    }
  }

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })
      
      if (response.ok) {
        showNotificationModal('Success', 'Campaign resumed successfully', 'success')
        fetchCampaigns()
      } else {
        showNotificationModal('Error', 'Failed to resume campaign', 'error')
      }
    } catch (error) {
      showNotificationModal('Error', 'Failed to resume campaign', 'error')
    }
  }

  const handleSaveCampaign = async (campaignData: any) => {
    if (!editingCampaignId) return
    
    try {
      const response = await fetch(`/api/campaigns/${editingCampaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      if (response.ok) {
        showNotificationModal('Success', 'Campaign updated successfully', 'success')
        setShowEditModal(false)
        setEditingCampaignId(null)
        fetchCampaigns()
      } else {
        showNotificationModal('Error', 'Failed to update campaign', 'error')
      }
    } catch (error) {
      showNotificationModal('Error', 'Failed to update campaign', 'error')
    }
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      brand: '',
      platform: 'all',
      niche: '',
      budgetRange: '',
      dateRange: '',
      performance: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Calculate dashboard stats
  const totalCampaignsCount = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.total, 0)
  const totalInfluencers = campaigns.reduce((sum, c) => sum + c.totalInfluencers, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernStaffHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernStaffHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  // Sort handler
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ModernStaffHeader />
      
      <div className="p-4 lg:p-6 pt-0">
        <div className="px-4 lg:px-8 py-8">
        {/* Header - Redesigned */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Campaigns</h1>
            <p className="text-slate-600">Manage and track all influencer campaigns</p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Create Campaign
            </button>
          </div>
        </div>

        {/* Stats Cards - Redesigned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{totalCampaigns}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Megaphone size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{activeCampaigns}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Play size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900">£{totalBudget.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-violet-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Influencers</p>
                <p className="text-2xl font-bold text-slate-900">{totalInfluencers}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Same as Finances Page */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search campaigns, brands, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={filters.platform} onValueChange={(value) => handleFilterChange('platform', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="md:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button
                onClick={fetchCampaigns}
                variant="outline"
                className="md:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Filter</label>
                  <Input
                    placeholder="Filter by brand name"
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Show per page</label>
                  <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Table - Same as Finances Page */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaigns</CardTitle>
              <div className="text-sm text-gray-500">
                {totalCampaigns} campaign{totalCampaigns !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Campaign</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('brand_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Brand</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'brand_name' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'brand_name' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'status' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('budget')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Budget</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'budget' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'budget' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('influencer_count')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Influencers</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'influencer_count' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'influencer_count' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Timeline</span>
                        <div className="flex flex-col">
                          <ChevronUp size={12} className={`${sortConfig.key === 'start_date' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown size={12} className={`${sortConfig.key === 'start_date' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 mb-1">{campaign.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{campaign.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-900">{campaign.brand}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        campaign.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-900">
                        £{campaign.budget.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-900">
                        {campaign.totalInfluencers}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs text-slate-600">
                        <div>{new Date(campaign.timeline.startDate).toLocaleDateString()}</div>
                        <div className="text-slate-400">to</div>
                        <div>{new Date(campaign.timeline.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewCampaign(campaign)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Campaign"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit size={16} />
                        </button>
                        {campaign.status === 'ACTIVE' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Pause Campaign"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <button
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Resume Campaign"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCampaigns > 0 && (
              <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalCampaigns)} of {totalCampaigns} campaigns
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 transition-all duration-300"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
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
                              ? 'bg-blue-600 text-white shadow-lg'
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
            
            {totalCampaigns === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or create a new campaign</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Campaign
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedCampaign && (
          <CampaignDetailPanel
            isOpen={showDetailPanel}
            campaign={selectedCampaign}
            onClose={() => {
              console.log('Closing campaign detail panel')
              setShowDetailPanel(false)
            }}
            onPauseCampaign={handlePauseCampaign}
            onResumeCampaign={handleResumeCampaign}
          />
        )}
      </AnimatePresence>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCampaignModal
            isOpen={showCreateModal}
            onCloseAction={() => setShowCreateModal(false)}
            onSaveAction={handleCreateCampaign}
          />
        )}
      </AnimatePresence>

      {/* Edit Campaign Modal */}
      <AnimatePresence>
        {showEditModal && editingCampaignId && (
          <EditCampaignModal
            isOpen={showEditModal}
            campaign={campaigns.find(c => c.id === editingCampaignId) || {}}
            onClose={() => {
              setShowEditModal(false)
              setEditingCampaignId(null)
            }}
            onSave={handleSaveCampaign}
          />
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={24} className="text-blue-500" />
                <h3 className="text-lg font-semibold">{notificationConfig.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{notificationConfig.message}</p>
              <div className="flex justify-end gap-3">
                {notificationConfig.onConfirm && (
                  <button
                    onClick={() => {
                      notificationConfig.onConfirm?.()
                      setShowNotification(false)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {notificationConfig.confirmText}
                  </button>
                )}
                <button
                  onClick={() => setShowNotification(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {notificationConfig.cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      </div>
  )
}

export default function CampaignsPage() {
  return <CampaignsPageClient />
} 