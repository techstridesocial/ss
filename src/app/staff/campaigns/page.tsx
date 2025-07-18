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
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Campaign } from '@/types'

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
    status: '',
    brand: '',
    platform: '',
    niche: '',
    budgetRange: '',
    dateRange: '',
    performance: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

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

  const handleExportReport = () => {
    showNotificationModal('Export', 'Campaign report exported successfully', 'success')
  }

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDetailPanel(true)
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

  const applyCampaignFilters = (campaigns: Campaign[]) => {
    return campaigns.filter(campaign => {
      // Status filter
      if (filters.status && campaign.status !== filters.status) return false
      
      // Brand filter
      if (filters.brand && !campaign.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false
      
      // Platform filter
      if (filters.platform && !campaign.requirements.platforms.includes(filters.platform)) return false
      
      // Search term
      if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !campaign.brand.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      return true
    })
  }

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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      brand: '',
      platform: '',
      niche: '',
      budgetRange: '',
      dateRange: '',
      performance: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Calculate dashboard stats
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
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

  const filteredCampaigns = applyCampaignFilters(campaigns)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ModernStaffHeader />
      
      <div className="p-4 lg:p-6 pt-0">
        <div className="px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
            <p className="text-gray-600">Manage and track all influencer campaigns</p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Campaign
            </button>
            <button
              onClick={handleExportReport}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Package size={20} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Campaigns"
            value={totalCampaigns}
            icon={<Megaphone size={24} />}
            color="blue"
          />
          <StatCard
            title="Active Campaigns"
            value={activeCampaigns}
            icon={<Play size={24} />}
            color="green"
          />
          <StatCard
            title="Total Budget"
            value={`£${totalBudget.toLocaleString()}`}
            icon={<DollarSign size={24} />}
            color="purple"
          />
          <StatCard
            title="Total Influencers"
            value={totalInfluencers}
            icon={<Users size={24} />}
            color="yellow"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FilterIcon size={20} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Filter by brand..."
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Influencers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{campaign.brand}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      £{campaign.budget.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.totalInfluencers}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(campaign.timeline.startDate).toLocaleDateString()} - {new Date(campaign.timeline.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
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
          
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No campaigns found</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedCampaign && (
          <CampaignDetailPanel
            isOpen={showDetailPanel}
            campaign={selectedCampaign}
            onClose={() => setShowDetailPanel(false)}
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
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateCampaign}
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