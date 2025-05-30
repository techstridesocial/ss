'use client'

import React, { useState } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import CampaignDetailPanel from '../../../components/campaigns/CampaignDetailPanel'
import EditCampaignModal from '../../../components/campaigns/EditCampaignModal'
import ReplaceInfluencersModal from '../../../components/modals/ReplaceInfluencersModal'
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
  ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock data for campaigns
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
    total_invited: 8,
    invitations_accepted: 6,
    invitations_pending: 1,
    invitations_declined: 1,
    created_from_quotation: true,
    quotation_id: 'quote_1'
  },
  {
    id: 'campaign_2',
    name: 'Fitness Equipment Launch',
    brand_name: 'FitGear Pro',
    brand_id: 'brand_2',
    description: 'Product seeding campaign for new home gym equipment',
    status: 'ACTIVE',
    budget: 15000,
    spent: 8750,
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    target_niches: ['Fitness', 'Health'],
    target_platforms: ['YOUTUBE', 'INSTAGRAM'],
    assigned_influencers: 6,
    completed_deliverables: 3,
    pending_payments: 2,
    estimated_reach: 320000,
    actual_reach: 198000,
    engagement_rate: 5.1,
    created_at: '2024-01-13',
    total_invited: 12,
    invitations_accepted: 6,
    invitations_pending: 4,
    invitations_declined: 2,
    created_from_quotation: true,
    quotation_id: 'quote_3'
  },
  {
    id: 'campaign_3',
    name: 'Tech Review Series',
    brand_name: 'TechStart Solutions',
    brand_id: 'brand_3',
    description: 'Software review campaign with tech influencers',
    status: 'PAUSED',
    budget: 8000,
    spent: 3200,
    start_date: '2024-01-05',
    end_date: '2024-02-05',
    target_niches: ['Tech', 'Gaming'],
    target_platforms: ['YOUTUBE', 'TWITTER'],
    assigned_influencers: 4,
    completed_deliverables: 2,
    pending_payments: 1,
    estimated_reach: 180000,
    actual_reach: 95000,
    engagement_rate: 3.8,
    created_at: '2024-01-03',
    total_invited: 6,
    invitations_accepted: 4,
    invitations_pending: 0,
    invitations_declined: 2,
    created_from_quotation: false,
    quotation_id: null
  },
  {
    id: 'campaign_4',
    name: 'Holiday Fashion Haul',
    brand_name: 'Style Collective',
    brand_id: 'brand_4',
    description: 'Holiday season fashion collaboration campaign',
    status: 'COMPLETED',
    budget: 35000,
    spent: 34200,
    start_date: '2023-11-01',
    end_date: '2023-12-31',
    target_niches: ['Fashion', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
    assigned_influencers: 12,
    completed_deliverables: 12,
    pending_payments: 0,
    estimated_reach: 680000,
    actual_reach: 723000,
    engagement_rate: 4.7,
    created_at: '2023-10-25',
    total_invited: 12,
    invitations_accepted: 12,
    invitations_pending: 0,
    invitations_declined: 0,
    created_from_quotation: false,
    quotation_id: null
  }
]

const MOCK_INFLUENCER_ASSIGNMENTS = [
  {
    id: 'assignment_1',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'BeautyByBella',
    influencer_id: 'inf_4',
    status: 'COMPLETED',
    offered_amount: 1500,
    deliverable_due_date: '2024-01-25',
    content_submitted_at: '2024-01-24',
    payment_status: 'PAID'
  },
  {
    id: 'assignment_2',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'Sarah Creator',
    influencer_id: 'inf_1',
    status: 'ACCEPTED',
    offered_amount: 850,
    deliverable_due_date: '2024-01-30',
    content_submitted_at: null,
    payment_status: 'PENDING'
  },
  {
    id: 'assignment_3',
    campaign_id: 'campaign_2',
    campaign_name: 'Fitness Equipment Launch',
    influencer_name: 'FitnessFiona',
    influencer_id: 'inf_3',
    status: 'INVITED',
    offered_amount: 920,
    deliverable_due_date: '2024-02-15',
    content_submitted_at: null,
    payment_status: 'PENDING'
  }
]

// Mock brands data
const MOCK_BRANDS = [
  { id: 'brand_1', company_name: 'Luxe Beauty Co' },
  { id: 'brand_2', company_name: 'FitGear Pro' },
  { id: 'brand_3', company_name: 'TechStart Solutions' },
  { id: 'brand_4', company_name: 'Style Collective' }
]

// Mock campaign invitations data
const MOCK_CAMPAIGN_INVITATIONS = [
  {
    id: 'inv_1',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'Sarah Creator',
    influencer_id: 'inf_1',
    status: 'ACCEPTED',
    offered_amount: 1500,
    invited_at: '2024-01-10T10:00:00Z',
    responded_at: '2024-01-10T14:30:00Z',
    deadline: '2024-02-15T23:59:59Z'
  },
  {
    id: 'inv_2',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'BeautyByBella',
    influencer_id: 'inf_2',
    status: 'PENDING',
    offered_amount: 1200,
    invited_at: '2024-01-10T10:00:00Z',
    responded_at: null,
    deadline: '2024-02-15T23:59:59Z'
  },
  {
    id: 'inv_3',
    campaign_id: 'campaign_2',
    campaign_name: 'Fitness Equipment Launch',
    influencer_name: 'FitnessFiona',
    influencer_id: 'inf_3',
    status: 'DECLINED',
    offered_amount: 920,
    invited_at: '2024-01-15T09:00:00Z',
    responded_at: '2024-01-16T11:00:00Z',
    deadline: '2024-03-01T23:59:59Z',
    decline_reason: 'Schedule conflict with existing brand partnership'
  }
]

// Mock declined influencers data
const MOCK_DECLINED_INFLUENCERS = {
  'campaign_1': [
    {
      id: 'declined_1',
      name: 'InfluencerA',
      decline_reason: 'Schedule conflict with existing brand partnership',
      original_offer: 1200,
      declined_at: '2024-01-12T10:00:00Z'
    }
  ],
  'campaign_2': [
    {
      id: 'declined_2', 
      name: 'InfluencerB',
      decline_reason: 'Rate too low for deliverables required',
      original_offer: 800,
      declined_at: '2024-01-16T15:30:00Z'
    },
    {
      id: 'declined_3',
      name: 'InfluencerC', 
      decline_reason: 'Not interested in this product category',
      original_offer: 950,
      declined_at: '2024-01-18T09:15:00Z'
    }
  ],
  'campaign_3': [
    {
      id: 'declined_4',
      name: 'InfluencerD',
      decline_reason: 'Already have competing brand deal',
      original_offer: 1100,
      declined_at: '2024-01-08T14:20:00Z'
    },
    {
      id: 'declined_5',
      name: 'InfluencerE',
      decline_reason: 'Timeline too tight for quality content creation',
      original_offer: 750,
      declined_at: '2024-01-09T11:45:00Z'
    }
  ]
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
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
  const [activeTab, setActiveTab] = useState<'campaigns' | 'assignments'>('campaigns')
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
  const [replaceInfluencersOpen, setReplaceInfluencersOpen] = useState(false)
  const [selectedCampaignForReplacement, setSelectedCampaignForReplacement] = useState<any>(null)
  
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

  // Assignment filters
  const [assignmentFilters, setAssignmentFilters] = useState({
    status: '',
    paymentStatus: '',
    campaign: '',
    dueDateRange: ''
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

  const assignmentFilterOptions = {
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'INVITED', label: 'Invited' },
      { value: 'ACCEPTED', label: 'Accepted' },
      { value: 'DECLINED', label: 'Declined' },
      { value: 'COMPLETED', label: 'Completed' }
    ],
    paymentStatus: [
      { value: '', label: 'All Payment Statuses' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'PROCESSING', label: 'Processing' },
      { value: 'PAID', label: 'Paid' }
    ],
    campaign: [
      { value: '', label: 'All Campaigns' },
      ...MOCK_CAMPAIGNS.map(campaign => ({
        value: campaign.id,
        label: campaign.name
      }))
    ],
    dueDateRange: [
      { value: '', label: 'All Due Dates' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'due-today', label: 'Due Today' },
      { value: 'due-this-week', label: 'Due This Week' },
      { value: 'due-next-week', label: 'Due Next Week' }
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
    // DISABLED: Campaigns are now only created automatically from approved quotations
    // Manual campaign creation is no longer allowed to ensure data integrity
    showNotification(
      'Campaign Creation Disabled',
      'Campaigns are automatically created when brands approve quotations. Please use the Brands tab to manage quotations instead.',
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

  const handleAssignInfluencer = () => {
    showNotification(
      'Assign Influencer',
      'The influencer assignment modal would open here to select and assign influencers to campaigns.',
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

  const handleProcessPayment = (assignmentId: string) => {
    showNotification(
      'Processing Payment',
      `Payment for assignment ${assignmentId} is being processed.`,
      'info'
    )
  }

  const handleUpdateAssignment = (assignmentId: string) => {
    showNotification(
      'Update Assignment',
      `Assignment status for ${assignmentId} would be updated here.`,
      'info'
    )
  }

  const handleReplaceDeclinedInfluencers = (campaignId: string) => {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaignForReplacement(campaign)
      setReplaceInfluencersOpen(true)
    }
  }

  const handleProcessReplacements = (replacements: { declined_id: string, replacement_id: string }[]) => {
    console.log('Processing replacements:', replacements)
    // In a real app, this would make API calls to:
    // 1. Remove declined influencers from campaign
    // 2. Add replacement influencers 
    // 3. Send new invitations
    // 4. Update campaign metrics
    
    showNotification(
      'Replacements Processed!',
      `Successfully replaced ${replacements.length} declined influencer${replacements.length !== 1 ? 's' : ''} with new selections. Invitations have been sent.`,
      'success'
    )
    
    setReplaceInfluencersOpen(false)
    setSelectedCampaignForReplacement(null)
  }

  const handleProceedWithPartialAcceptance = (campaignId: string) => {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId)
    if (campaign) {
      const acceptanceRate = Math.round((campaign.invitations_accepted / campaign.total_invited) * 100)
      showConfirmation(
        'Launch Campaign',
        `Proceed with ${acceptanceRate}% acceptance rate? This will launch the campaign with ${campaign.invitations_accepted} influencers.`,
        () => {
          showNotification(
            'Campaign Launched!',
            `Campaign launched successfully with ${campaign.invitations_accepted} influencers!`,
            'success'
          )
        },
        'Launch Campaign',
        'Cancel'
      )
    }
  }

  const handleViewInvitations = (campaignId: string) => {
    console.log('Viewing invitations for campaign:', campaignId)
    // Navigate to invitations view or open modal
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

  const applyAssignmentFilters = (assignments: any[]) => {
    return assignments.filter(assignment => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = assignment.influencer_name.toLowerCase().includes(searchLower) ||
                             assignment.campaign_name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Advanced filters
      const matchesStatus = !assignmentFilters.status || assignment.status === assignmentFilters.status
      const matchesPaymentStatus = !assignmentFilters.paymentStatus || assignment.payment_status === assignmentFilters.paymentStatus
      const matchesCampaign = !assignmentFilters.campaign || assignment.campaign_id === assignmentFilters.campaign
      const matchesDueDateRange = !assignmentFilters.dueDateRange || checkDueDateRange(assignment.deliverable_due_date, assignmentFilters.dueDateRange)

      return matchesStatus && matchesPaymentStatus && matchesCampaign && matchesDueDateRange
    })
  }

  // Helper functions for range checking
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
    const today = new Date()
    const campaignStart = new Date(startDate)
    const diffDays = Math.floor((today.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (range) {
      case 'this-week': return Math.abs(diffDays) <= 7
      case 'this-month': return Math.abs(diffDays) <= 30
      case 'last-month': return diffDays >= 30 && diffDays <= 60
      case 'this-quarter': return Math.abs(diffDays) <= 90
      default: return true
    }
  }

  function checkPerformance(campaign: any, range: string) {
    switch (range) {
      case 'high-engagement': return campaign.engagement_rate > 5
      case 'medium-engagement': return campaign.engagement_rate >= 3 && campaign.engagement_rate <= 5
      case 'low-engagement': return campaign.engagement_rate < 3
      case 'over-budget': return campaign.spent > campaign.budget
      case 'under-budget': return campaign.spent < campaign.budget * 0.8
      default: return true
    }
  }

  function checkDueDateRange(dueDate: string, range: string) {
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (range) {
      case 'overdue': return diffDays < 0
      case 'due-today': return diffDays === 0
      case 'due-this-week': return diffDays > 0 && diffDays <= 7
      case 'due-next-week': return diffDays > 7 && diffDays <= 14
      default: return true
    }
  }

  // Apply filters - always calculate both for correct tab counts
  const filteredCampaigns = applyCampaignFilters(MOCK_CAMPAIGNS)
  const filteredAssignments = applyAssignmentFilters(MOCK_INFLUENCER_ASSIGNMENTS)
  
  // Apply sorting
  const sortedData = React.useMemo(() => {
    const dataToSort = activeTab === 'campaigns' ? filteredCampaigns : filteredAssignments
    
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
        case 'influencer_name':
        case 'campaign_name':
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
          break
        case 'budget':
        case 'spent':
        case 'actual_reach':
        case 'engagement_rate':
        case 'offered_amount':
          aValue = Number(aValue || 0)
          bValue = Number(bValue || 0)
          break
        case 'start_date':
        case 'end_date':
        case 'created_at':
        case 'deliverable_due_date':
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
  }, [filteredCampaigns, filteredAssignments, sortConfig, activeTab])
  
  // Handle pagination
  const totalPages = Math.ceil(
    (activeTab === 'campaigns' ? filteredCampaigns.length : filteredAssignments.length) / pageSize
  )
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = sortedData.slice(startIndex, endIndex)

  // Handler functions
  const handleTabChange = (tab: 'campaigns' | 'assignments') => {
    setActiveTab(tab)
    setCurrentPage(1) // Reset to first page when switching tabs
  }

  const handleFilterChange = (key: string, value: string) => {
    if (activeTab === 'campaigns') {
      setCampaignFilters(prev => ({ ...prev, [key]: value }))
    } else {
      setAssignmentFilters(prev => ({ ...prev, [key]: value }))
    }
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
    if (activeTab === 'campaigns') {
      setCampaignFilters({
        status: '',
        brand: '',
        budgetRange: '',
        dateRange: '',
        performance: ''
      })
    } else {
      setAssignmentFilters({
        status: '',
        paymentStatus: '',
        campaign: '',
        dueDateRange: ''
      })
    }
    setCurrentPage(1)
  }

  // Get active filters for the current tab
  const activeFilters = activeTab === 'campaigns' ? campaignFilters : assignmentFilters
  const activeFilterOptions = activeTab === 'campaigns' ? campaignFilterOptions : assignmentFilterOptions
  const activeFilterCount = Object.values(activeFilters).filter(value => value !== '').length

  // Custom Notification Modal Component
  const CustomNotificationModal = () => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle size={48} className="text-green-500" />
        case 'error':
          return <XCircle size={48} className="text-red-500" />
        case 'warning':
          return <Clock size={48} className="text-orange-500" />
        default:
          return <Megaphone size={48} className="text-blue-500" />
      }
    }

    const getColors = () => {
      switch (notification.type) {
        case 'success':
          return {
            bg: 'from-green-50 to-emerald-50',
            border: 'border-green-200',
            button: 'bg-green-600 hover:bg-green-700'
          }
        case 'error':
          return {
            bg: 'from-red-50 to-rose-50',
            border: 'border-red-200',
            button: 'bg-red-600 hover:bg-red-700'
          }
        case 'warning':
          return {
            bg: 'from-orange-50 to-amber-50',
            border: 'border-orange-200',
            button: 'bg-orange-600 hover:bg-orange-700'
          }
        default:
          return {
            bg: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200',
            button: 'bg-blue-600 hover:bg-blue-700'
          }
      }
    }

    const colors = getColors()

    return (
      <AnimatePresence>
        {notification.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
              onClick={notification.onCancel}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl shadow-2xl border ${colors.border} w-full max-w-md overflow-hidden`}>
                {/* Header */}
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    {getIcon()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {notification.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-white/60 border-t border-gray-200/60">
                  <div className="flex justify-center space-x-3">
                    {notification.onConfirm && notification.cancelText && (
                      <button
                        onClick={notification.onCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                      >
                        {notification.cancelText}
                      </button>
                    )}
                    <button
                      onClick={notification.onConfirm || notification.onCancel}
                      className={`px-6 py-3 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl ${colors.button}`}
                    >
                      {notification.confirmText}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
              Campaigns ({activeTab === 'campaigns' ? paginatedData.length : 0})
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invitations</th>
                <SortableHeader sortKey="actual_reach">Performance</SortableHeader>
                <SortableHeader sortKey="end_date">Timeline</SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {(activeTab === 'campaigns' ? paginatedData : []).map((campaign: any) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Invitation Tracking */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-900 font-medium">{campaign.invitations_accepted} / {campaign.total_invited}</span>
                        <span className="text-xs text-green-600 font-medium">
                          {Math.round((campaign.invitations_accepted / campaign.total_invited) * 100)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(campaign.invitations_accepted / campaign.total_invited) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          {campaign.invitations_pending > 0 && (
                            <span className="text-yellow-600">
                              {campaign.invitations_pending} pending
                            </span>
                          )}
                          {campaign.invitations_declined > 0 && (
                            <span className="text-red-600">
                              {campaign.invitations_declined} declined
                            </span>
                          )}
                        </div>
                        {campaign.created_from_quotation && (
                          <span className="text-blue-600 text-xs">From Quote</span>
                        )}
                      </div>
                      
                      {/* Show deliverables completion */}
                      <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                        {campaign.completed_deliverables}/{campaign.assigned_influencers} deliverables completed
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.actual_reach.toLocaleString()} reach</div>
                    <div className="text-sm text-gray-500">{campaign.engagement_rate}% engagement</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      {/* Primary Actions Row */}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewInvitations(campaign.id)}
                          className="text-blue-600 hover:text-blue-900" 
                          title="View Invitations"
                        >
                          <Users size={16} />
                        </button>
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
                      
                      {/* Invitation Management Actions */}
                      {(campaign.invitations_pending > 0 || campaign.invitations_declined > 0) && (
                        <div className="flex flex-col space-y-1">
                          {campaign.invitations_declined > 0 && (
                            <button
                              onClick={() => handleReplaceDeclinedInfluencers(campaign.id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              title="Replace Declined Influencers"
                            >
                              Replace {campaign.invitations_declined} declined
                            </button>
                          )}
                          {campaign.invitations_accepted > 0 && (
                            <button
                              onClick={() => handleProceedWithPartialAcceptance(campaign.id)}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              title="Launch with Current Acceptances"
                            >
                              Launch with {campaign.invitations_accepted}
                            </button>
                          )}
                        </div>
                      )}
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

  function InfluencerAssignmentTable() {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        INVITED: { class: 'bg-yellow-100 text-yellow-800' },
        ACCEPTED: { class: 'bg-blue-100 text-blue-800' },
        DECLINED: { class: 'bg-red-100 text-red-800' },
        COMPLETED: { class: 'bg-green-100 text-green-800' }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {status}
        </span>
      )
    }

    const getPaymentBadge = (status: string) => {
      const statusConfig = {
        PENDING: { class: 'bg-yellow-100 text-yellow-800' },
        PAID: { class: 'bg-green-100 text-green-800' },
        PROCESSING: { class: 'bg-blue-100 text-blue-800' }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {status}
        </span>
      )
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
              Influencer Assignments ({activeTab === 'assignments' ? paginatedData.length : 0})
            </h2>
            <button 
              onClick={handleAssignInfluencer}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2"
            >
              <Target size={16} />
              <span>Assign Influencer</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <SortableHeader sortKey="influencer_name">Influencer</SortableHeader>
                <SortableHeader sortKey="campaign_name">Campaign</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="offered_amount">Amount</SortableHeader>
                <SortableHeader sortKey="deliverable_due_date">Due Date</SortableHeader>
                <SortableHeader sortKey="payment_status">Payment</SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {(activeTab === 'assignments' ? paginatedData : []).map((assignment: any) => (
                <tr key={assignment.id} className="hover:bg-white/70 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.influencer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.campaign_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${assignment.offered_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(assignment.deliverable_due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(assignment.payment_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCampaign(assignment.id)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleUpdateAssignment(assignment.id)}
                        className="text-green-600 hover:text-green-900" 
                        title="Update Status"
                      >
                        <Edit size={16} />
                      </button>
                      {assignment.payment_status === 'PENDING' && assignment.status === 'COMPLETED' && (
                        <button 
                          onClick={() => handleProcessPayment(assignment.id)}
                          className="text-purple-600 hover:text-purple-900" 
                          title="Process Payment"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: 'campaigns', label: 'Campaigns', count: filteredCampaigns.length },
              { key: 'assignments', label: 'Assignments', count: filteredAssignments.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as 'campaigns' | 'assignments')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="font-bold capitalize">{tab.label}</span>
                <span>({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={activeTab === 'campaigns' ? 'Search campaigns...' : 'Search assignments...'}
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
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(activeFilters).map(([key, value]) => {
                      if (!value) return null
                      const option = activeFilterOptions[key as keyof typeof activeFilterOptions]?.find((opt: any) => opt.value === value)
                      const displayKey = key === 'budgetRange' ? 'Budget'
                                       : key === 'dateRange' ? 'Date Range'
                                       : key === 'paymentStatus' ? 'Payment'
                                       : key === 'dueDateRange' ? 'Due Date'
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(activeFilterOptions).map(([key, options]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 capitalize">
                      {key === 'budgetRange' ? 'Budget Range'
                       : key === 'dateRange' ? 'Date Range'
                       : key === 'paymentStatus' ? 'Payment Status'
                       : key === 'dueDateRange' ? 'Due Date Range'
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

        {/* Data Content */}
        {activeTab === 'campaigns' ? (
          <CampaignTable />
        ) : (
          <InfluencerAssignmentTable />
        )}

        {/* Pagination Controls */}
        {(activeTab === 'campaigns' ? filteredCampaigns.length : filteredAssignments.length) > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, (activeTab === 'campaigns' ? filteredCampaigns.length : filteredAssignments.length))} of {activeTab === 'campaigns' ? filteredCampaigns.length : filteredAssignments.length} {activeTab}
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
        onEditCampaign={handleEditCampaign}
        onPauseCampaign={handlePauseCampaign}
        onResumeCampaign={handleResumeCampaign}
        onViewInvitations={handleViewInvitations}
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

      {/* Replace Influencers Modal */}
      <ReplaceInfluencersModal
        isOpen={replaceInfluencersOpen}
        onClose={() => {
          setReplaceInfluencersOpen(false)
          setSelectedCampaignForReplacement(null)
        }}
        campaign={selectedCampaignForReplacement}
        declinedInfluencers={selectedCampaignForReplacement ? (MOCK_DECLINED_INFLUENCERS[selectedCampaignForReplacement.id as keyof typeof MOCK_DECLINED_INFLUENCERS] || []) : []}
        onReplace={handleProcessReplacements}
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