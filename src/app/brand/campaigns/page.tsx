'use client'

import React, { useState, useCallback, Suspense } from 'react'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'
import { 
  Plus, 
  Eye, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Target,
  Heart,
  Send,
  FileText,
  TrendingUp,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  Edit,
  Trash2
} from 'lucide-react'

// Mock campaign data - in real app this would come from API
const mockCampaigns = [
  {
    id: 'camp_1',
    name: 'Summer Collection Launch',
    description: 'Promote our new summer fashion collection with lifestyle content',
    status: 'ACTIVE',
    quotation_status: 'APPROVED',
    budget_min: 5000,
    budget_max: 10000,
    timeline: '2 weeks',
    created_at: '2024-01-15',
    target_deliverables: ['1 Instagram Post', '3 Instagram Stories', '1 TikTok Video'],
    influencers_invited: 5,
    influencers_accepted: 4,
    influencers_declined: 1,
    content_delivered: 2,
    payments_completed: 1,
    brand_notes: 'Focus on lifestyle and outdoor activities'
  },
  {
    id: 'camp_2', 
    name: 'Product Review Campaign',
    description: 'Authentic reviews of our new skincare line',
    status: 'PENDING_QUOTATION',
    quotation_status: 'PENDING',
    budget_min: 2000,
    budget_max: 4000,
    timeline: '3 weeks',
    created_at: '2024-01-20',
    target_deliverables: ['1 Instagram Post', '1 YouTube Review'],
    influencers_invited: 0,
    influencers_accepted: 0,
    influencers_declined: 0,
    content_delivered: 0,
    payments_completed: 0,
    brand_notes: 'Must include before/after content'
  },
  {
    id: 'camp_3',
    name: 'Holiday Promotion',
    description: 'Christmas holiday themed content showcasing gift ideas',
    status: 'COMPLETED',
    quotation_status: 'APPROVED',
    budget_min: 8000,
    budget_max: 12000,
    timeline: '1 week',
    created_at: '2024-01-10',
    target_deliverables: ['2 Instagram Posts', '5 Instagram Stories', '1 TikTok Video'],
    influencers_invited: 8,
    influencers_accepted: 7,
    influencers_declined: 1,
    content_delivered: 7,
    payments_completed: 7,
    brand_notes: 'Holiday aesthetic with family-friendly content'
  }
]

// Helper function to get status color and icon
const getStatusInfo = (status: string, quotationStatus: string) => {
  if (status === 'COMPLETED') {
    return {
      color: 'text-green-600 bg-green-100',
      icon: CheckCircle,
      label: 'Completed'
    }
  } else if (status === 'ACTIVE') {
    return {
      color: 'text-blue-600 bg-blue-100',
      icon: Play,
      label: 'Active'
    }
  } else if (quotationStatus === 'PENDING') {
    return {
      color: 'text-orange-600 bg-orange-100',
      icon: Clock,
      label: 'Pending Quotation'
    }
  } else if (quotationStatus === 'REJECTED') {
    return {
      color: 'text-red-600 bg-red-100',
      icon: XCircle,
      label: 'Quotation Rejected'
    }
  } else {
    return {
      color: 'text-gray-600 bg-gray-100',
      icon: AlertCircle,
      label: 'Draft'
    }
  }
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Platform Icon Component (reused from other pages)
const PlatformIcon = ({ platform, size = 16 }: { platform: string, size?: number }) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg className="text-pink-500" style={{ width: size, height: size }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'tiktok':
      return (
        <svg className="text-gray-900" style={{ width: size, height: size }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    case 'youtube':
      return (
        <svg className="text-red-600" style={{ width: size, height: size }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    default:
      return null
  }
}

function CampaignsPageClient() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [shortlistSearchQuery, setShortlistSearchQuery] = useState('')
  
  // Campaign creation form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    budget_min: '',
    budget_max: '',
    timeline: '',
    deliverables: [] as string[],
    brand_notes: ''
  })

  const { heartedInfluencers } = useHeartedInfluencers()

  // Filter shortlisted influencers based on search
  const filteredHeartedInfluencers = heartedInfluencers.filter(influencer =>
    influencer.displayName.toLowerCase().includes(shortlistSearchQuery.toLowerCase()) ||
    influencer.niches?.some(niche => niche.toLowerCase().includes(shortlistSearchQuery.toLowerCase()))
  )

  // Filter campaigns based on active tab and search
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'ALL') return matchesSearch
    if (activeTab === 'ACTIVE') return matchesSearch && campaign.status === 'ACTIVE'
    if (activeTab === 'PENDING') return matchesSearch && campaign.quotation_status === 'PENDING'
    if (activeTab === 'COMPLETED') return matchesSearch && campaign.status === 'COMPLETED'
    
    return matchesSearch
  })

  // Pagination
  const totalCampaigns = filteredCampaigns.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalCampaigns / pageSize)

  // Handle campaign form changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setCampaignForm(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle deliverable changes
  const handleDeliverableChange = useCallback((deliverable: string, checked: boolean) => {
    setCampaignForm(prev => ({
      ...prev,
      deliverables: checked 
        ? [...prev.deliverables, deliverable]
        : prev.deliverables.filter(d => d !== deliverable)
    }))
  }, [])

  // Handle influencer selection
  const handleInfluencerSelection = useCallback((influencerId: string, selected: boolean) => {
    setSelectedInfluencers(prev => 
      selected 
        ? [...prev, influencerId]
        : prev.filter(id => id !== influencerId)
    )
  }, [])

  // Submit campaign for quotation
  const handleSubmitCampaign = useCallback(() => {
    // In real app, this would call an API
    console.log('Submitting campaign for quotation:', {
      ...campaignForm,
      selectedInfluencers
    })
    
    // Reset form and close modal
    setCampaignForm({
      name: '',
      description: '',
      budget_min: '',
      budget_max: '',
      timeline: '',
      deliverables: [],
      brand_notes: ''
    })
    setSelectedInfluencers([])
    setIsCreateModalOpen(false)
    
    // Show success message
    setToast({ 
      message: 'Campaign submitted for quotation! You will receive a response within 24 hours.', 
      type: 'success' 
    })
    
    // Clear toast after 5 seconds
    setTimeout(() => setToast(null), 5000)
  }, [campaignForm, selectedInfluencers])

  // Clear search and filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setActiveTab('ALL')
    setCurrentPage(1)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Create campaigns and track their progress</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
        >
          <Plus size={16} className="mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{mockCampaigns.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {mockCampaigns.filter(c => c.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-2xl">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {mockCampaigns.filter(c => c.quotation_status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-2xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Shortlisted</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{heartedInfluencers.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-2xl">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search campaigns by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-300"
          />
        </div>
        
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 hover:bg-white transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-1">
        <div className="flex space-x-1">
          {(['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'] as const).map((tab) => {
            const count = tab === 'ALL' ? mockCampaigns.length :
                         tab === 'ACTIVE' ? mockCampaigns.filter(c => c.status === 'ACTIVE').length :
                         tab === 'PENDING' ? mockCampaigns.filter(c => c.quotation_status === 'PENDING').length :
                         mockCampaigns.filter(c => c.status === 'COMPLETED').length

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">Campaign</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Budget</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Timeline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {paginatedCampaigns.map((campaign) => {
                const statusInfo = getStatusInfo(campaign.status, campaign.quotation_status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <tr key={campaign.id} className="hover:bg-white/70 transition-colors duration-150">
                    {/* Campaign Info */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{campaign.name}</div>
                        <div className="text-sm text-gray-500 truncate">{campaign.description}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {campaign.target_deliverables.slice(0, 2).map((deliverable, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                              {deliverable}
                            </span>
                          ))}
                          {campaign.target_deliverables.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                              +{campaign.target_deliverables.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Budget */}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign size={14} className="mr-1 text-gray-400" />
                        ${campaign.budget_min.toLocaleString()} - ${campaign.budget_max.toLocaleString()}
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        {campaign.timeline}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4">
                      {campaign.status === 'ACTIVE' ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Participation</span>
                            <span>{Math.round((campaign.influencers_accepted / campaign.influencers_invited) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(campaign.influencers_accepted / campaign.influencers_invited) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedCampaigns.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || activeTab !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first campaign to start collaborating with influencers.'
              }
            </p>
            {!searchQuery && activeTab === 'ALL' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Campaign
              </button>
            )}
            {(searchQuery || activeTab !== 'ALL') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCampaigns > 0 && (
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalCampaigns)} of {totalCampaigns} campaigns
            </span>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
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
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                if (pageNum > totalPages) return null
                
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

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
              <p className="text-gray-600 mt-1">Submit a campaign brief for quotation</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Campaign Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Collection Launch"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={campaignForm.budget_min}
                          onChange={(e) => handleFormChange('budget_min', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <label className="block text-xs text-gray-600 mt-1">Minimum Budget</label>
                    </div>
                    <div>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={campaignForm.budget_max}
                          onChange={(e) => handleFormChange('budget_max', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <label className="block text-xs text-gray-600 mt-1">Maximum Budget</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                  <select
                    value={campaignForm.timeline}
                    onChange={(e) => handleFormChange('timeline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 weeks">3 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2+ months">2+ months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Description</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your campaign goals, target audience, and key messages..."
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Desired Deliverables</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Instagram Post',
                    'Instagram Stories',
                    'Instagram Reels',
                    'TikTok Video',
                    'YouTube Video',
                    'YouTube Shorts',
                    'Blog Post',
                    'Product Review'
                  ].map((deliverable) => (
                    <label key={deliverable} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={campaignForm.deliverables.includes(deliverable)}
                        onChange={(e) => handleDeliverableChange(deliverable, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{deliverable}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={campaignForm.brand_notes}
                  onChange={(e) => handleFormChange('brand_notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific requirements, brand guidelines, or preferences..."
                />
              </div>

              {/* Influencer Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Influencers from Shortlist ({heartedInfluencers.length} available)
                  </label>
                  {heartedInfluencers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search shortlisted influencers..."
                        value={shortlistSearchQuery}
                        onChange={(e) => setShortlistSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
                
                {heartedInfluencers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No influencers in your shortlist yet.</p>
                    <a href="/brand/influencers" className="text-blue-600 hover:underline">
                      Browse influencers to add to your shortlist
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {filteredHeartedInfluencers.map((influencer) => (
                      <div key={influencer.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedInfluencers.includes(influencer.id)}
                          onChange={(e) => handleInfluencerSelection(influencer.id, e.target.checked)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          {influencer.profilePicture ? (
                            <img
                              src={influencer.profilePicture}
                              alt={influencer.displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users size={20} className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{influencer.displayName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <PlatformIcon platform={influencer.platform} size={14} />
                              <span className="text-xs text-gray-500">{influencer.followers.toLocaleString()} followers</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredHeartedInfluencers.length === 0 && shortlistSearchQuery && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <p>No influencers match your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCampaign}
                disabled={!campaignForm.name || !campaignForm.description || selectedInfluencers.length === 0}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={20} />
                Submit for Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
          } animate-in slide-in-from-bottom duration-300`}>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <div>
                <p className="font-medium">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BrandCampaignsPage() {
  return (
    <BrandProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernBrandHeader />
        
                 <div className="px-4 lg:px-8 py-8">
           <Suspense fallback={<div>Loading...</div>}>
             <CampaignsPageClient />
           </Suspense>
         </div>

      </div>
    </BrandProtectedRoute>
  )
} 