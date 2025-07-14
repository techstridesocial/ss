'use client'

import React, { useState } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import CampaignDetailPanel from '../../../components/campaigns/CampaignDetailPanel'
import EditCampaignModal from '../../../components/campaigns/EditCampaignModal'
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
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock data for campaigns - removed invitation tracking fields
const MOCK_CAMPAIGNS = [
  {
    id: 'campaign_1',
    name: 'Summer Beauty Collection',
    brand_name: 'Luxe Beauty Co',
    brand_id: 'brand_1',
    description: 'Launch campaign for new summer makeup line targeting Gen Z',
    status: 'ACTIVE',
    budget: 25000,
    spent: 12400,
    start_date: '2024-01-10',
    end_date: '2024-02-28',
    target_niches: ['Beauty', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK'],
    assigned_influencers: 8,
    completed_deliverables: 5,
    pending_payments: 3,
    estimated_reach: 450000,
    actual_reach: 289000,
    engagement_rate: 4.2,
    created_at: '2024-01-08',
    created_from_quotation: true,
    quotation_id: 'quote_1',
    confirmed_influencers: 6,
    contacted_influencers: 8
  },
  {
    id: 'campaign_2',
    name: 'Sustainable Fashion Week',
    brand_name: 'EcoWear Plus',
    brand_id: 'brand_2',
    description: 'Eco-friendly clothing line promotion with focus on sustainability messaging',
    status: 'PAUSED',
    budget: 15000,
    spent: 7200,
    start_date: '2024-02-01',
    end_date: '2024-03-15',
    target_niches: ['Fashion', 'Sustainability'],
    target_platforms: ['INSTAGRAM', 'YOUTUBE'],
    assigned_influencers: 6,
    completed_deliverables: 2,
    pending_payments: 1,
    estimated_reach: 300000,
    actual_reach: 145000,
    engagement_rate: 3.8,
    created_at: '2024-01-20',
    created_from_quotation: true,
    quotation_id: 'quote_2',
    confirmed_influencers: 4,
    contacted_influencers: 6
  },
  {
    id: 'campaign_3',
    name: 'Tech Innovation Showcase',
    brand_name: 'NextGen Devices',
    brand_id: 'brand_3',
    description: 'Product launch for new smart home devices targeting tech enthusiasts',
    status: 'COMPLETED',
    budget: 35000,
    spent: 33500,
    start_date: '2024-01-05',
    end_date: '2024-02-20',
    target_niches: ['Tech', 'Lifestyle'],
    target_platforms: ['YOUTUBE', 'TIKTOK'],
    assigned_influencers: 10,
    completed_deliverables: 10,
    pending_payments: 0,
    estimated_reach: 600000,
    actual_reach: 567000,
    engagement_rate: 5.1,
    created_at: '2024-01-02',
    created_from_quotation: false,
    quotation_id: null,
    confirmed_influencers: 10,
    contacted_influencers: 10
  },
  {
    id: 'campaign_4',
    name: 'Wellness Journey',
    brand_name: 'MindBody Wellness',
    brand_id: 'brand_4',
    description: 'Mental health and wellness app promotion targeting wellness enthusiasts',
    status: 'ACTIVE',
    budget: 20000,
    spent: 8900,
    start_date: '2024-02-10',
    end_date: '2024-03-25',
    target_niches: ['Health', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'YOUTUBE'],
    assigned_influencers: 8,
    completed_deliverables: 3,
    pending_payments: 2,
    estimated_reach: 400000,
    actual_reach: 178000,
    engagement_rate: 4.7,
    created_at: '2024-02-05',
    created_from_quotation: true,
    quotation_id: 'quote_3',
    confirmed_influencers: 8,
    contacted_influencers: 8
  }
]

// Mock brands data
const MOCK_BRANDS = [
  { id: 'brand_1', company_name: 'Luxe Beauty Co' },
  { id: 'brand_2', company_name: 'EcoWear Plus' },
  { id: 'brand_3', company_name: 'NextGen Devices' },
  { id: 'brand_4', company_name: 'MindBody Wellness' }
]

// Mock campaign invitations data
const MOCK_CAMPAIGN_INVITATIONS = [
  {
    id: 'inv_1',
    campaign_id: 'campaign_1',
    influencer_id: 'inf_1',
    influencer_name: 'Sarah Creator',
    status: 'ACCEPTED',
    offered_amount: 1500,
    created_at: '2024-01-10T10:00:00Z',
    responded_at: '2024-01-10T14:30:00Z'
  },
  {
    id: 'inv_2',
    campaign_id: 'campaign_1',
    influencer_id: 'inf_2',
    influencer_name: 'BeautyByBella',
    status: 'PENDING',
    offered_amount: 1200,
    created_at: '2024-01-10T10:00:00Z',
    responded_at: null
  }
]

// Mock declined influencers for replacement functionality
const MOCK_DECLINED_INFLUENCERS = {
  campaign_1: [
    { id: 'inf_declined_1', name: 'FashionFiona', reason: 'Schedule conflict' }
  ]
}

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
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function CampaignsPageClient() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })
  
  // Modal states
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false)
  const [editCampaignOpen, setEditCampaignOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  
  // Custom notification states
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'info' | 'warning' | 'error'
    onConfirm?: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })
  
  // Campaign filters
  const [campaignFilters, setCampaignFilters] = useState({
    status: '',
    brand: '',
    budgetRange: '',
    dateRange: '',
    performance: ''
  })

  // Filter options
  const campaignFilterOptions = {
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'PAUSED', label: 'Paused' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'DRAFT', label: 'Draft' }
    ],
    brand: [
      { value: '', label: 'All Brands' },
      ...MOCK_BRANDS.map(brand => ({
        value: brand.id,
        label: brand.company_name
      }))
    ],
    budgetRange: [
      { value: '', label: 'All Budget Ranges' },
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-25k', label: '$10,000 - $25,000' },
      { value: '25k-50k', label: '$25,000 - $50,000' },
      { value: 'over-50k', label: 'Over $50,000' }
    ],
    dateRange: [
      { value: '', label: 'All Dates' },
      { value: 'this-week', label: 'This Week' },
      { value: 'this-month', label: 'This Month' },
      { value: 'last-month', label: 'Last Month' },
      { value: 'this-quarter', label: 'This Quarter' }
    ],
    performance: [
      { value: '', label: 'All Performance' },
      { value: 'high-engagement', label: 'High Engagement (>5%)' },
      { value: 'medium-engagement', label: 'Medium Engagement (3-5%)' },
      { value: 'low-engagement', label: 'Low Engagement (<3%)' },
      { value: 'over-budget', label: 'Over Budget' },
      { value: 'under-budget', label: 'Under Budget' }
    ]
  }

  // Notification helpers
  const showNotification = (
    title: string, 
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel: () => setNotification(prev => ({ ...prev, isOpen: false })),
      confirmText: confirmText || 'OK',
      cancelText: cancelText || 'Cancel'
    })
  }

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: 'warning',
      onConfirm: () => {
        onConfirm()
        setNotification(prev => ({ ...prev, isOpen: false }))
      },
      onCancel: () => setNotification(prev => ({ ...prev, isOpen: false })),
      confirmText,
      cancelText
    })
  }

  const handleCreateCampaign = async (campaignData?: any) => {
    // Manual campaign creation is now allowed again
    // This can be used for campaigns created from approved quotations with confirmed influencers
    showNotification(
      'Campaign Creation',
      'Campaign creation modal would open here. Staff can create campaigns manually after influencer confirmations.',
      'info'
    )
  }

  const handleExportReport = () => {
    showNotification(
      'Export Started',
      'Your campaign report is being generated. You will receive a download link shortly.',
      'info'
    )
  }

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign)
    setCampaignDetailOpen(true)
  }

  const handleEditCampaign = (campaignId: string) => {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setEditCampaignOpen(true)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    console.log('Pausing campaign:', campaignId)
    // API call to pause campaign
  }

  const handleResumeCampaign = async (campaignId: string) => {
    console.log('Resuming campaign:', campaignId)
    // API call to resume campaign
  }

  const handleSaveCampaign = async (campaignData: any) => {
    // In real app, this would make an API call
    console.log('Saving campaign:', campaignData)
    // Update mock data or refresh from API
    setEditCampaignOpen(false)
    setSelectedCampaign(null)
  }

  // Filtering logic
  const applyCampaignFilters = (campaigns: any[]) => {
    return campaigns.filter(campaign => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = campaign.name.toLowerCase().includes(searchLower) ||
                             campaign.brand_name.toLowerCase().includes(searchLower) ||
                             campaign.description.toLowerCase().includes(searchLower) ||
                             campaign.target_niches.some((niche: string) => niche.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Advanced filters
      const matchesStatus = !campaignFilters.status || campaign.status === campaignFilters.status
      const matchesBrand = !campaignFilters.brand || campaign.brand_id === campaignFilters.brand
      const matchesBudgetRange = !campaignFilters.budgetRange || checkBudgetRange(campaign.budget, campaignFilters.budgetRange)
      const matchesDateRange = !campaignFilters.dateRange || checkDateRange(campaign.start_date, campaignFilters.dateRange)
      const matchesPerformance = !campaignFilters.performance || checkPerformance(campaign, campaignFilters.performance)

      return matchesStatus && matchesBrand && matchesBudgetRange && matchesDateRange && matchesPerformance
    })
  }

  function checkBudgetRange(budget: number, range: string) {
    switch (range) {
      case 'under-10k': return budget < 10000
      case '10k-25k': return budget >= 10000 && budget <= 25000
      case '25k-50k': return budget >= 25000 && budget <= 50000
      case 'over-50k': return budget > 50000
      default: return true
    }
  }

  function checkDateRange(startDate: string, range: string) {
    const campaignStart = new Date(startDate)
    const now = new Date()
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    switch (range) {
      case 'this-week': return campaignStart >= thisWeekStart
      case 'this-month': return campaignStart >= thisMonthStart
      case 'last-month': 
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return campaignStart >= lastMonthStart && campaignStart <= lastMonthEnd
      default: return true
    }
  }

  function checkPerformance(campaign: any, range: string) {
    const engagementRate = campaign.engagement_rate
    const budgetUsage = (campaign.spent / campaign.budget) * 100
    
    switch (range) {
      case 'high-engagement': return engagementRate > 5
      case 'medium-engagement': return engagementRate >= 3 && engagementRate <= 5
      case 'low-engagement': return engagementRate < 3
      case 'over-budget': return budgetUsage > 100
      case 'under-budget': return budgetUsage < 80
      default: return true
    }
  }

  // Apply filtering
  const filteredCampaigns = applyCampaignFilters(MOCK_CAMPAIGNS)
  
  // Apply sorting
  const sortedData = React.useMemo(() => {
    const dataToSort = filteredCampaigns
    
    if (!sortConfig.key) return dataToSort

    return [...dataToSort].sort((a: any, b: any) => {
      let aValue: any = a[sortConfig.key as string]
      let bValue: any = b[sortConfig.key as string]

      // Handle different data types based on column
      switch (sortConfig.key) {
        case 'name':
        case 'brand_name':
        case 'description':
        case 'status':
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
          break
        case 'budget':
        case 'spent':
        case 'actual_reach':
        case 'engagement_rate':
          aValue = Number(aValue || 0)
          bValue = Number(bValue || 0)
          break
        case 'start_date':
        case 'end_date':
        case 'created_at':
          aValue = new Date(aValue || 0).getTime()
          bValue = new Date(bValue || 0).getTime()
          break
        default:
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredCampaigns, sortConfig])
  
  // Handle pagination
  const totalPages = Math.ceil(filteredCampaigns.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = sortedData.slice(startIndex, endIndex)

  // Handler functions
  const handleFilterChange = (key: string, value: string) => {
    setCampaignFilters(prev => ({ ...prev, [key]: value }))
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
  }

  const clearFilters = () => {
    setCampaignFilters({
      status: '',
      brand: '',
      budgetRange: '',
      dateRange: '',
      performance: ''
    })
    setCurrentPage(1)
  }

  // Get active filters for the current tab
  const activeFilters = campaignFilters
  const activeFilterOptions = campaignFilterOptions
  const activeFilterCount = Object.values(activeFilters).filter(value => value !== '').length

  // Custom notification modal component
  const CustomNotificationModal = () => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success': return <CheckCircle size={24} className="text-green-600" />
        case 'error': return <XCircle size={24} className="text-red-600" />
        case 'warning': return <AlertCircle size={24} className="text-yellow-600" />
        default: return <Clock size={24} className="text-blue-600" />
      }
    }

    const getColors = () => {
      switch (notification.type) {
        case 'success': return 'border-green-200 bg-green-50'
        case 'error': return 'border-red-200 bg-red-50'
        case 'warning': return 'border-yellow-200 bg-yellow-50'
        default: return 'border-blue-200 bg-blue-50'
      }
    }

    if (!notification.isOpen) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border-2 ${getColors()}`}>
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {getIcon()}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              {notification.onConfirm && (
                <>
                  <button
                    onClick={notification.onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {notification.cancelText}
                  </button>
                  <button
                    onClick={notification.onConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {notification.confirmText}
                  </button>
                </>
              )}
              {!notification.onConfirm && (
                <button
                  onClick={notification.onCancel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {notification.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function CampaignTable() {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        ACTIVE: { 
          icon: <Play size={10} className="mr-1" />, 
          class: 'bg-green-100 text-green-800' 
        },
        PAUSED: { 
          icon: <Pause size={10} className="mr-1" />, 
          class: 'bg-yellow-100 text-yellow-800' 
        },
        COMPLETED: { 
          icon: <CheckCircle size={10} className="mr-1" />, 
          class: 'bg-blue-100 text-blue-800' 
        },
        CANCELLED: { 
          icon: <XCircle size={10} className="mr-1" />, 
          class: 'bg-red-100 text-red-800' 
        },
        DRAFT: { 
          icon: <Clock size={10} className="mr-1" />, 
          class: 'bg-gray-100 text-gray-800' 
        }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {config.icon}
          {status}
        </span>
      )
    }

    const getProgressPercentage = (spent: number, budget: number) => {
      return Math.round((spent / budget) * 100)
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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="px-6 py-4 border-b border-gray-100/60">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaigns ({paginatedData.length})
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={handleExportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <SortableHeader sortKey="name">Campaign</SortableHeader>
                <SortableHeader sortKey="brand_name">Brand</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="budget">Budget</SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Influencer Status</th>
                <SortableHeader sortKey="actual_reach">Performance</SortableHeader>
                <SortableHeader sortKey="end_date">Timeline</SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {paginatedData.map((campaign: any) => (
                <tr key={campaign.id} className="hover:bg-white/70 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.description}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.target_niches.map((niche: string) => (
                        <span key={niche} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {niche}
                        </span>
                      ))}
                    </div>
                    {campaign.created_from_quotation && (
                      <div className="text-xs text-blue-600 mt-1">
                        From Quotation: {campaign.quotation_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.brand_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getProgressPercentage(campaign.spent, campaign.budget)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getProgressPercentage(campaign.spent, campaign.budget)}% used</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(() => {
                      const campaignHasStarted = ['ACTIVE', 'PAUSED', 'COMPLETED'].includes(campaign.status)
                      const totalInfluencers = campaign.contacted_influencers
                      const confirmedInfluencers = campaignHasStarted ? totalInfluencers : campaign.confirmed_influencers
                      
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{campaignHasStarted ? 'Active:' : 'Confirmed:'}</span>
                            <span className="text-gray-900 font-medium">{confirmedInfluencers} / {totalInfluencers}</span>
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${(confirmedInfluencers / totalInfluencers) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((confirmedInfluencers / totalInfluencers) * 100)}% {campaignHasStarted ? 'active' : 'confirmed'}
                          </div>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-gray-900 font-medium">
                      {(campaign.actual_reach / 1000000).toFixed(1)}M reach
                    </div>
                    <div className="text-gray-500">
                      {campaign.engagement_rate}% engagement
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {campaign.completed_deliverables} / {campaign.assigned_influencers} delivered
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(campaign.start_date).toLocaleDateString()}</div>
                    <div className="text-xs">to {new Date(campaign.end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      {/* Primary Actions Row */}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewCampaign(campaign)}
                          className="text-gray-600 hover:text-gray-900" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="text-green-600 hover:text-green-900" 
                          title="Edit Campaign"
                        >
                          <Edit size={16} />
                        </button>
                        {campaign.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="text-yellow-600 hover:text-yellow-900" 
                            title="Pause Campaign"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <button 
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className="text-green-600 hover:text-green-900" 
                            title="Resume Campaign"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const campaignStats = {
    activeCampaigns: MOCK_CAMPAIGNS.filter(c => c.status === 'ACTIVE').length,
    totalBudget: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.spent, 0),
    totalReach: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.actual_reach, 0),
    avgEngagement: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.engagement_rate, 0) / MOCK_CAMPAIGNS.length,
    pendingDeliverables: MOCK_CAMPAIGNS.reduce((sum, c) => sum + (c.assigned_influencers - c.completed_deliverables), 0)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-8 pb-8">
        {/* Search Bar and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search campaigns..."
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
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border transition-all duration-300 font-medium ${
              activeFilterCount > 0
                ? 'bg-black text-white border-black'
                : 'bg-white/60 backdrop-blur-md border-gray-200 hover:bg-white/80 text-gray-700'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-semibold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/40 mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="p-4">
              {/* Active Filters Chips */}
              {activeFilterCount > 0 && (
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Filters</h4>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, value]) => {
                      if (!value) return null
                      const option = (activeFilterOptions as any)[key]?.find((opt: any) => opt.value === value)
                      return (
                        <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                          {option?.label || value}
                          <button
                            onClick={() => handleFilterChange(key, '')}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Filter Options */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(activeFilterOptions).map(([key, options]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 capitalize">
                      {key === 'budgetRange' ? 'Budget Range'
                       : key === 'dateRange' ? 'Date Range'
                       : key}
                    </label>
                    <select
                      value={activeFilters[key as keyof typeof activeFilters]}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                    >
                      {(options as any[]).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics - only show when no search/filters active */}
        {!searchQuery && activeFilterCount === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Campaigns"
              value={campaignStats.activeCampaigns}
              icon={<Megaphone size={24} />}
              color="blue"
            />
            <StatCard
              title="Total Budget"
              value={`$${campaignStats.totalBudget.toLocaleString()}`}
              icon={<DollarSign size={24} />}
              color="green"
              trend={`$${campaignStats.totalSpent.toLocaleString()} spent`}
            />
            <StatCard
              title="Total Reach"
              value={`${(campaignStats.totalReach / 1000000).toFixed(1)}M`}
              icon={<TrendingUp size={24} />}
              color="purple"
              trend={`${campaignStats.avgEngagement.toFixed(1)}% avg engagement`}
            />
            <StatCard
              title="Pending Deliverables"
              value={campaignStats.pendingDeliverables}
              icon={<Package size={24} />}
              color="yellow"
            />
          </div>
        )}

        {/* Campaign Table */}
        <CampaignTable />

        {/* Pagination Controls */}
        {filteredCampaigns.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
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
      </main>

      {/* Campaign Detail Panel */}
      <CampaignDetailPanel
        isOpen={campaignDetailOpen}
        onClose={() => {
          setCampaignDetailOpen(false)
          setSelectedCampaign(null)
        }}
        campaign={selectedCampaign}
        onPauseCampaign={handlePauseCampaign}
        onResumeCampaign={handleResumeCampaign}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        isOpen={editCampaignOpen}
        onClose={() => {
          setEditCampaignOpen(false)
          setSelectedCampaign(null)
        }}
        campaign={selectedCampaign}
        onSave={handleSaveCampaign}
      />

      {/* Custom Notification Modal */}
      <CustomNotificationModal />
    </div>
  )
}

// Server component wrapper for authentication
export default function CampaignsPage() {
  return <CampaignsPageClient />
} 