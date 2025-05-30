'use client'

import React, { useState } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import BulkApproveModal from '@/components/modals/BulkApproveModal'
import AddBrandPanel from '@/components/brands/AddBrandPanel'
import ViewBrandPanel from '@/components/brands/ViewBrandPanel'
import QuotationDetailPanel from '@/components/brands/QuotationDetailPanel'
import { Building2, Eye, FileText, Download, Star, Clock, CheckCircle, XCircle, Plus, Filter, ChevronDown, Mail, DollarSign, Users, Calendar, ChevronUp } from 'lucide-react'

// Mock data for brands and their shortlists
const MOCK_BRANDS = [
  {
    id: 'brand_1',
    company_name: 'Luxe Beauty Co',
    contact_name: 'Sarah Johnson',
    email: 'sarah@luxebeauty.com',
    industry: 'Beauty & Cosmetics',
    logo_url: null,
    shortlists_count: 3,
    active_campaigns: 2,
    total_spend: 15420,
    last_activity: '2024-01-15',
    status: 'active'
  },
  {
    id: 'brand_2',
    company_name: 'FitGear Pro',
    contact_name: 'Mike Chen',
    email: 'mike@fitgearpro.com',
    industry: 'Fitness & Sports',
    logo_url: null,
    shortlists_count: 2,
    active_campaigns: 1,
    total_spend: 8750,
    last_activity: '2024-01-14',
    status: 'active'
  },
  {
    id: 'brand_3',
    company_name: 'TechStart Solutions',
    contact_name: 'Emily Rodriguez',
    email: 'emily@techstart.io',
    industry: 'Technology',
    logo_url: null,
    shortlists_count: 1,
    active_campaigns: 0,
    total_spend: 3200,
    last_activity: '2024-01-10',
    status: 'inactive'
  }
]

const MOCK_SHORTLISTS = [
  {
    id: 'shortlist_1',
    brand_id: 'brand_1',
    brand_name: 'Luxe Beauty Co',
    name: 'Summer Campaign Influencers',
    description: 'Beauty influencers for summer product launch',
    influencer_count: 8,
    status: 'pending_review',
    created_at: '2024-01-15',
    notes: 'Focus on micro-influencers with high engagement'
  },
  {
    id: 'shortlist_2',
    brand_id: 'brand_1',
    name: 'Holiday Season Campaign',
    brand_name: 'Luxe Beauty Co',
    description: 'Holiday makeup collection promotion',
    influencer_count: 12,
    status: 'approved',
    created_at: '2024-01-12',
    notes: 'Approved with pricing adjustments'
  },
  {
    id: 'shortlist_3',
    brand_id: 'brand_2',
    brand_name: 'FitGear Pro',
    name: 'Fitness Equipment Launch',
    description: 'New product line introduction',
    influencer_count: 6,
    status: 'pending_review',
    created_at: '2024-01-14',
    notes: 'Waiting for budget confirmation'
  }
]

const MOCK_QUOTATION_REQUESTS = [
  {
    id: 'quote_1',
    brand_id: 'brand_1',
    brand_name: 'Luxe Beauty Co',
    campaign_name: 'Summer Beauty Collection Launch',
    description: 'Micro-influencer campaign for new summer makeup line',
    influencer_count: 8,
    status: 'pending_review',
    requested_at: '2024-01-15T10:30:00Z',
    budget_range: '$5,000 - $8,000',
    campaign_duration: '2 weeks',
    deliverables: ['Instagram Posts', 'Stories', 'Reels'],
    target_demographics: 'Women 18-35, Beauty enthusiasts',
    notes: 'Focus on authentic, lifestyle content showcasing summer looks',
    influencers: [
      { name: '@beautybyjenna', platform: 'Instagram', followers: '45.2K', engagement: '4.8%' },
      { name: '@makeupguru_sarah', platform: 'Instagram', followers: '38.7K', engagement: '5.2%' },
      { name: '@glowwithgrace', platform: 'Instagram', followers: '52.1K', engagement: '4.1%' },
      { name: '@skincarequeen', platform: 'Instagram', followers: '41.3K', engagement: '4.9%' },
      { name: '@beautyvibes_official', platform: 'Instagram', followers: '47.8K', engagement: '4.6%' },
      { name: '@naturalglow_amy', platform: 'Instagram', followers: '39.4K', engagement: '5.1%' },
      { name: '@makeup_maven', platform: 'Instagram', followers: '44.9K', engagement: '4.7%' },
      { name: '@radiant_rachel', platform: 'Instagram', followers: '43.2K', engagement: '4.8%' }
    ]
  },
  {
    id: 'quote_2',
    brand_id: 'brand_1',
    brand_name: 'Luxe Beauty Co',
    campaign_name: 'Holiday Glam Campaign',
    description: 'Premium influencers for holiday makeup collection',
    influencer_count: 5,
    status: 'sent',
    requested_at: '2024-01-12T14:20:00Z',
    quoted_at: '2024-01-13T09:15:00Z',
    total_quote: '$12,500',
    budget_range: '$10,000 - $15,000',
    campaign_duration: '3 weeks',
    deliverables: ['Instagram Posts', 'Stories', 'YouTube Tutorials'],
    target_demographics: 'Women 25-45, Premium beauty market',
    notes: 'Holiday-themed content with elegant styling',
    influencers: [
      { name: '@luxe_lifestyle', platform: 'Instagram', followers: '78.4K', engagement: '3.9%' },
      { name: '@elegant_emma', platform: 'Instagram', followers: '82.1K', engagement: '4.2%' },
      { name: '@premium_beauty', platform: 'YouTube', followers: '156K', engagement: '3.7%' },
      { name: '@sophisticated_sarah', platform: 'Instagram', followers: '69.3K', engagement: '4.5%' },
      { name: '@chic_cosmetics', platform: 'Instagram', followers: '71.8K', engagement: '4.1%' }
    ]
  },
  {
    id: 'quote_3',
    brand_id: 'brand_2',
    brand_name: 'FitGear Pro',
    campaign_name: 'New Year Fitness Challenge',
    description: 'Fitness influencers for equipment launch',
    influencer_count: 12,
    status: 'approved',
    requested_at: '2024-01-10T11:45:00Z',
    quoted_at: '2024-01-11T16:30:00Z',
    approved_at: '2024-01-12T10:00:00Z',
    total_quote: '$18,750',
    budget_range: '$15,000 - $20,000',
    campaign_duration: '4 weeks',
    deliverables: ['Instagram Posts', 'Stories', 'TikTok Videos', 'Blog Reviews'],
    target_demographics: 'Fitness enthusiasts 20-40, Active lifestyle',
    notes: 'Equipment demonstrations and workout integration required',
    influencers: [
      { name: '@fitnessmotivation', platform: 'Instagram', followers: '125K', engagement: '5.8%' },
      { name: '@strongandsculpted', platform: 'TikTok', followers: '89.2K', engagement: '7.2%' },
      { name: '@gymlife_guru', platform: 'Instagram', followers: '94.7K', engagement: '6.1%' },
      { name: '@activelifestyle', platform: 'Instagram', followers: '78.3K', engagement: '5.9%' },
      { name: '@workoutwith_me', platform: 'TikTok', followers: '112K', engagement: '6.8%' },
      { name: '@fitness_fanatic', platform: 'Instagram', followers: '103K', engagement: '5.4%' },
      { name: '@getstrong_daily', platform: 'Instagram', followers: '87.9K', engagement: '6.3%' },
      { name: '@flexandfitness', platform: 'TikTok', followers: '76.5K', engagement: '7.1%' },
      { name: '@powerlift_pro', platform: 'Instagram', followers: '91.2K', engagement: '5.7%' },
      { name: '@cardio_queen', platform: 'Instagram', followers: '85.6K', engagement: '6.0%' },
      { name: '@musclebuilding', platform: 'Instagram', followers: '98.4K', engagement: '5.5%' },
      { name: '@hiit_with_hannah', platform: 'TikTok', followers: '82.7K', engagement: '6.9%' }
    ]
  },
  {
    id: 'quote_4',
    brand_id: 'brand_3',
    brand_name: 'TechStart Solutions',
    campaign_name: 'SaaS Product Launch',
    description: 'Tech influencers for software platform launch',
    influencer_count: 6,
    status: 'pending_review',
    requested_at: '2024-01-14T16:15:00Z',
    budget_range: '$8,000 - $12,000',
    campaign_duration: '3 weeks',
    deliverables: ['LinkedIn Posts', 'YouTube Reviews', 'Twitter Threads'],
    target_demographics: 'Business professionals 25-50, Tech industry',
    notes: 'B2B focused content highlighting productivity benefits',
    influencers: [
      { name: '@tech_entrepreneur', platform: 'LinkedIn', followers: '45.8K', engagement: '3.2%' },
      { name: '@startup_advisor', platform: 'LinkedIn', followers: '52.3K', engagement: '3.8%' },
      { name: '@business_growth', platform: 'YouTube', followers: '187K', engagement: '2.9%' },
      { name: '@productivity_pro', platform: 'LinkedIn', followers: '38.7K', engagement: '4.1%' },
      { name: '@saas_specialist', platform: 'Twitter', followers: '29.4K', engagement: '4.5%' },
      { name: '@digital_nomad_ceo', platform: 'LinkedIn', followers: '41.2K', engagement: '3.6%' }
    ]
  }
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function BrandsPageClient() {
  const [activeTab, setActiveTab] = useState<'clients' | 'quotations'>('clients')
  const [isLoading, setIsLoading] = useState(false)
  
  // Panel states
  const [addBrandPanelOpen, setAddBrandPanelOpen] = useState(false)
  const [viewBrandPanelOpen, setViewBrandPanelOpen] = useState(false)
  const [quotationDetailPanelOpen, setQuotationDetailPanelOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  
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
  
  // Brand filters
  const [brandFilters, setBrandFilters] = useState({
      industry: '',
      status: '',
      spendRange: '',
    campaignCount: '',
    lastActivity: ''
    })

  // Quotation filters
  const [quotationFilters, setQuotationFilters] = useState({
      status: '',
      budgetRange: '',
    influencerCount: '',
    duration: '',
    brand: ''
    })

  // Filter options
  const brandFilterOptions = {
    industry: [
      { value: '', label: 'All Industries' },
      { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
      { value: 'Fitness & Sports', label: 'Fitness & Sports' },
      { value: 'Technology', label: 'Technology' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Sustainability', label: 'Sustainability' },
      { value: 'Food & Beverage', label: 'Food & Beverage' },
      { value: 'Marketing Agency', label: 'Marketing Agency' }
    ],
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    spendRange: [
      { value: '', label: 'All Spend Ranges' },
      { value: 'under-5k', label: 'Under $5,000' },
      { value: '5k-15k', label: '$5,000 - $15,000' },
      { value: '15k-25k', label: '$15,000 - $25,000' },
      { value: 'over-25k', label: 'Over $25,000' }
    ],
    campaignCount: [
      { value: '', label: 'All Campaign Counts' },
      { value: '0', label: 'No Campaigns' },
      { value: '1-2', label: '1-2 Campaigns' },
      { value: '3-5', label: '3-5 Campaigns' },
      { value: 'over-5', label: 'Over 5 Campaigns' }
    ],
    lastActivity: [
      { value: '', label: 'All Activity' },
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'older', label: 'Older' }
    ]
  }

  const quotationFilterOptions = {
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'pending_review', label: 'Pending Review' },
      { value: 'sent', label: 'Sent' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ],
    budgetRange: [
      { value: '', label: 'All Budget Ranges' },
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-20k', label: '$10,000 - $20,000' },
      { value: 'over-20k', label: 'Over $20,000' }
    ],
    influencerCount: [
      { value: '', label: 'All Influencer Counts' },
      { value: 'under-5', label: 'Under 5' },
      { value: '5-10', label: '5-10' },
      { value: 'over-10', label: 'Over 10' }
    ],
    duration: [
      { value: '', label: 'All Durations' },
      { value: '1-2', label: '1-2 weeks' },
      { value: '3-4', label: '3-4 weeks' },
      { value: 'over-4', label: 'Over 4 weeks' }
    ],
    brand: [
      { value: '', label: 'All Brands' },
      ...MOCK_BRANDS.map(brand => ({
        value: brand.id,
        label: brand.company_name
      }))
    ]
  }

  // Filtering logic
  const applyBrandFilters = (brands: any[]) => {
    return brands.filter(brand => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = brand.company_name.toLowerCase().includes(searchLower) ||
                             brand.contact_name.toLowerCase().includes(searchLower) ||
                             brand.email.toLowerCase().includes(searchLower) ||
                             brand.industry.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Advanced filters
    const matchesIndustry = !brandFilters.industry || brand.industry === brandFilters.industry
    const matchesStatus = !brandFilters.status || brand.status === brandFilters.status
    const matchesSpendRange = !brandFilters.spendRange || checkSpendRange(brand.total_spend, brandFilters.spendRange)
    const matchesCampaignCount = !brandFilters.campaignCount || checkCampaignCount(brand.active_campaigns, brandFilters.campaignCount)
      const matchesLastActivity = !brandFilters.lastActivity || checkLastActivity(brand.last_activity, brandFilters.lastActivity)

      return matchesIndustry && matchesStatus && matchesSpendRange && matchesCampaignCount && matchesLastActivity
    })
  }

  const applyQuotationFilters = (quotations: any[]) => {
    return quotations.filter(quotation => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = quotation.brand_name.toLowerCase().includes(searchLower) ||
                             quotation.campaign_name.toLowerCase().includes(searchLower) ||
                             quotation.description.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Advanced filters
      const matchesStatus = !quotationFilters.status || quotation.status === quotationFilters.status
      const matchesBudgetRange = !quotationFilters.budgetRange || checkBudgetRange(quotation.budget_range, quotationFilters.budgetRange)
      const matchesInfluencerCount = !quotationFilters.influencerCount || checkInfluencerCount(quotation.influencer_count, quotationFilters.influencerCount)
      const matchesDuration = !quotationFilters.duration || checkDuration(quotation.campaign_duration, quotationFilters.duration)
      const matchesBrand = !quotationFilters.brand || quotation.brand_id === quotationFilters.brand

      return matchesStatus && matchesBudgetRange && matchesInfluencerCount && matchesDuration && matchesBrand
    })
  }

  // Helper functions for range checking
  function checkSpendRange(spend: number, range: string) {
    switch (range) {
      case 'under-5k': return spend < 5000
      case '5k-15k': return spend >= 5000 && spend <= 15000
      case '15k-25k': return spend >= 15000 && spend <= 25000
      case 'over-25k': return spend > 25000
      default: return true
    }
  }

  function checkCampaignCount(count: number, range: string) {
    switch (range) {
      case '0': return count === 0
      case '1-2': return count >= 1 && count <= 2
      case '3-5': return count >= 3 && count <= 5
      case 'over-5': return count > 5
      default: return true
    }
  }

  function checkLastActivity(activity: string, range: string) {
    const today = new Date()
    const activityDate = new Date(activity)
    const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (range) {
      case 'today': return diffDays === 0
      case 'week': return diffDays <= 7
      case 'month': return diffDays <= 30
      case 'older': return diffDays > 30
      default: return true
    }
  }

  function checkBudgetRange(budgetRange: string, filterRange: string) {
    const extractBudgetValue = (range: string) => {
      const match = range.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
      return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
    }
    
    const budgetValue = extractBudgetValue(budgetRange)
    
    switch (filterRange) {
      case 'under-10k': return budgetValue < 10000
      case '10k-20k': return budgetValue >= 10000 && budgetValue <= 20000
      case 'over-20k': return budgetValue > 20000
      default: return true
    }
  }

  function checkInfluencerCount(count: number, range: string) {
    switch (range) {
      case 'under-5': return count < 5
      case '5-10': return count >= 5 && count <= 10
      case 'over-10': return count > 10
      default: return true
    }
  }

  function checkDuration(duration: string, range: string) {
    const weeks = parseInt(duration) || 0
    
    switch (range) {
      case '1-2': return weeks >= 1 && weeks <= 2
      case '3-4': return weeks >= 3 && weeks <= 4
      case 'over-4': return weeks > 4
      default: return true
    }
  }

  // Apply filters - always calculate both for correct tab counts
  const filteredBrands = applyBrandFilters(MOCK_BRANDS)
  const filteredQuotations = applyQuotationFilters(MOCK_QUOTATION_REQUESTS)
  
  // Apply sorting
  const sortedData = React.useMemo(() => {
    const dataToSort = activeTab === 'clients' ? filteredBrands : filteredQuotations
    
    if (!sortConfig.key) return dataToSort

    return [...dataToSort].sort((a: any, b: any) => {
      let aValue: any = a[sortConfig.key as string]
      let bValue: any = b[sortConfig.key as string]

      // Handle different data types based on column
      switch (sortConfig.key) {
        case 'company_name':
        case 'contact_name':
        case 'email':
        case 'industry':
        case 'status':
        case 'brand_name':
        case 'campaign_name':
        case 'description':
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
          break
        case 'shortlists_count':
        case 'active_campaigns':
        case 'total_spend':
        case 'influencer_count':
          aValue = Number(aValue || 0)
          bValue = Number(bValue || 0)
          break
        case 'last_activity':
        case 'requested_at':
        case 'quoted_at':
        case 'approved_at':
          aValue = new Date(aValue || 0).getTime()
          bValue = new Date(bValue || 0).getTime()
          break
        case 'budget_range':
          // Extract numeric value from budget range
          const extractBudgetForSort = (range: string) => {
            const match = range.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
            return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
          }
          aValue = extractBudgetForSort(aValue || '')
          bValue = extractBudgetForSort(bValue || '')
          break
        case 'total_quote':
          // Extract numeric value from quote
          const extractQuoteForSort = (quote: string) => {
            if (!quote) return 0
            const match = quote.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
            return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
          }
          aValue = extractQuoteForSort(aValue || '')
          bValue = extractQuoteForSort(bValue || '')
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
  }, [filteredBrands, filteredQuotations, sortConfig, activeTab])
  
  // Pagination calculations
  const currentData = sortedData
  const totalItems = currentData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = currentData.slice(startIndex, endIndex)

  // Handler functions
  const handleFilterChange = (key: string, value: string) => {
    if (activeTab === 'clients') {
      setBrandFilters(prev => ({ ...prev, [key]: value }))
    } else {
      setQuotationFilters(prev => ({ ...prev, [key]: value }))
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
    setCurrentPage(1)
  }

  const handleTabChange = (tab: 'clients' | 'quotations') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery('')
    setFilterOpen(false)
    setSortConfig({ key: null, direction: 'asc' })
  }

  const clearFilters = () => {
    if (activeTab === 'clients') {
      setBrandFilters({
        industry: '',
        status: '',
        spendRange: '',
        campaignCount: '',
        lastActivity: ''
      })
    } else {
      setQuotationFilters({
        status: '',
        budgetRange: '',
        influencerCount: '',
        duration: '',
        brand: ''
      })
    }
    setCurrentPage(1)
  }

  // Get active filters for the current tab
  const activeFilters = activeTab === 'clients' ? brandFilters : quotationFilters
  const activeFilterOptions = activeTab === 'clients' ? brandFilterOptions : quotationFilterOptions
  const activeFilterCount = Object.values(activeFilters).filter(value => value !== '').length

  const handleAddBrand = () => {
    setAddBrandPanelOpen(true)
  }

  const handleViewBrand = (brandId: string) => {
    const brand = MOCK_BRANDS.find(b => b.id === brandId)
    setSelectedBrand(brand)
    setViewBrandPanelOpen(true)
  }

  const handleViewQuotation = (quotationId: string) => {
    const quotation = MOCK_QUOTATION_REQUESTS.find(q => q.id === quotationId)
    setSelectedQuotation(quotation)
    setQuotationDetailPanelOpen(true)
  }

  const handleSaveBrand = async (brandData: any) => {
    console.log('Saving brand:', brandData)
    // Mock save operation
    const newBrand = {
      ...brandData,
      id: `brand_${Date.now()}`,
      shortlists_count: 0,
      active_campaigns: 0,
      total_spend: 0,
      last_activity: new Date().toISOString().split('T')[0],
      status: 'active'
    }
    // In real app, this would call an API
    alert(`Brand "${brandData.company_name}" saved successfully!`)
    setAddBrandPanelOpen(false)
  }

  const handleCreateCampaign = async (quotationId: string) => {
    // NOTE: Campaigns are now automatically created when quotations are approved
    // This function is kept for backward compatibility but should not be called
    console.log('Campaign creation is now automatic when quotations are approved')
  }

  const handleSendQuote = async (pricing: string, notes: string) => {
    try {
      if (!selectedQuotation) {
        throw new Error('No quotation selected')
      }

      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotationId: selectedQuotation.id,
          status: 'SENT',
          final_price: parseFloat(pricing),
          notes: notes
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send quotation')
      }

      // Update the local quotation data
      if (selectedQuotation) {
        selectedQuotation.status = 'sent'
        selectedQuotation.total_quote = `$${pricing}`
        selectedQuotation.quoted_at = new Date().toISOString()
        selectedQuotation.quote_notes = notes
      }

      // Success - close panels and show success message
      closePanels()
      alert(`Quotation sent successfully to ${selectedQuotation.brand_name}! They will receive the quote via email.`)
      
    } catch (error) {
      console.error('Error sending quotation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to send quotation: ${errorMessage}`)
    }
  }

  const closePanels = () => {
    setAddBrandPanelOpen(false)
    setViewBrandPanelOpen(false)
    setQuotationDetailPanelOpen(false)
    setSelectedBrand(null)
    setSelectedQuotation(null)
  }

  // Format number helper
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // Status badge helpers
  const getBrandStatusBadge = (status: string) => {
      if (status === 'active') {
      return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
    }
    return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
  }

  const getQuotationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Review</span>
      case 'sent':
        return (
          <div className="flex flex-col space-y-1">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Sent</span>
            <span className="text-xs text-gray-500">Waiting for brand approval</span>
          </div>
        )
      case 'approved':
        return (
          <div className="flex flex-col space-y-1">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
            <span className="text-xs text-green-600 font-medium">Converted to campaign</span>
          </div>
        )
      case 'rejected':
        return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
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
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className={`px-4 lg:px-8 pb-8 transition-all duration-300 ${
        addBrandPanelOpen || viewBrandPanelOpen || quotationDetailPanelOpen ? 'mr-[400px]' : ''
      }`}>
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: 'clients', label: 'Clients List', count: filteredBrands.length },
              { key: 'quotations', label: 'Quotations', count: filteredQuotations.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as 'clients' | 'quotations')}
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
              placeholder={activeTab === 'clients' ? 'Search brands...' : 'Search quotations...'}
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

          {activeTab === 'clients' && (
              <button
                onClick={handleAddBrand}
                className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg whitespace-nowrap"
              >
                <Plus size={16} className="mr-2" />
                Add Brand
              </button>
          )}
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
                      const displayKey = key === 'spendRange' ? 'Spend Range'
                                       : key === 'campaignCount' ? 'Campaigns'
                                       : key === 'lastActivity' ? 'Activity'
                                       : key === 'budgetRange' ? 'Budget'
                                       : key === 'influencerCount' ? 'Influencers'
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
                      {key === 'spendRange' ? 'Spend Range' 
                       : key === 'campaignCount' ? 'Campaigns'
                       : key === 'lastActivity' ? 'Last Activity'
                       : key === 'budgetRange' ? 'Budget Range'
                       : key === 'influencerCount' ? 'Influencers'
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
            
        {/* Data Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60 border-b border-gray-100/60">
                <tr>
                  {activeTab === 'clients' ? (
                    <>
                      <SortableHeader sortKey="company_name">Brand</SortableHeader>
                      <SortableHeader sortKey="contact_name">Contact</SortableHeader>
                      <SortableHeader sortKey="industry">Industry</SortableHeader>
                      <SortableHeader sortKey="shortlists_count">Shortlists</SortableHeader>
                      <SortableHeader sortKey="active_campaigns">Campaigns</SortableHeader>
                      <SortableHeader sortKey="total_spend">Total Spend</SortableHeader>
                      <SortableHeader sortKey="status">Status</SortableHeader>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </>
                  ) : (
                    <>
                      <SortableHeader sortKey="brand_name">Brand</SortableHeader>
                      <SortableHeader sortKey="campaign_name">Campaign</SortableHeader>
                      <SortableHeader sortKey="status">Status</SortableHeader>
                      <SortableHeader sortKey="influencer_count">Influencers</SortableHeader>
                      <SortableHeader sortKey="budget_range">Budget</SortableHeader>
                      <SortableHeader sortKey="requested_at">Requested</SortableHeader>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100/60">
                {paginatedData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/70 transition-colors duration-150">
                    {activeTab === 'clients' ? (
                      <>
                        {/* Brand Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {item.logo_url ? (
                                <img className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" src={item.logo_url} alt="" />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                  <Building2 size={20} className="text-gray-500" />
          </div>
        )}
                </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{item.company_name}</div>
              </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.contact_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {item.email}
                          </div>
                        </td>

                        {/* Industry */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                            {item.industry}
                          </span>
                        </td>

                        {/* Shortlists */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <FileText size={14} className="mr-1 text-gray-400" />
                            {item.shortlists_count}
                          </div>
                        </td>

                        {/* Campaigns */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <Star size={14} className="mr-1 text-gray-400" />
                            {item.active_campaigns}
                          </div>
                        </td>

                        {/* Total Spend */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <DollarSign size={14} className="mr-1 text-gray-400" />
                            {formatNumber(item.total_spend)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getBrandStatusBadge(item.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
              <button
                              onClick={() => handleViewBrand(item.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Brand"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Download Report"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Brand Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{item.brand_name}</div>
                        </td>

                        {/* Campaign */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.campaign_name}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getQuotationStatusBadge(item.status)}
                        </td>

                        {/* Influencers */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <Users size={14} className="mr-1 text-gray-400" />
                            {item.influencer_count}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.budget_range}</div>
                          {item.total_quote && (
                            <div className="text-xs text-green-600 font-medium">Quoted: {item.total_quote}</div>
                          )}
                          {item.status === 'approved' && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                              <span className="text-xs text-purple-600 font-medium">Converted to campaign</span>
                            </div>
                          )}
                        </td>

                        {/* Requested */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={12} className="mr-1" />
                            {new Date(item.requested_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewQuotation(item.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
              </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedData.length === 0 && (
            <div className="px-6 py-12 text-center">
              {activeTab === 'clients' ? (
                <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              ) : (
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab === 'clients' ? 'brands' : 'quotations'} found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || activeFilterCount > 0
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : `No ${activeTab === 'clients' ? 'brand clients' : 'quotation requests'} available.`
                }
              </p>
              {!searchQuery && activeFilterCount === 0 && activeTab === 'clients' && (
              <button
                onClick={handleAddBrand}
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
              >
                  <Building2 size={16} className="mr-2" />
                  Add Your First Brand
              </button>
              )}
            </div>
          )}
            </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} {activeTab === 'clients' ? 'brands' : 'quotations'}
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
            
        {/* Side Panels */}
        {addBrandPanelOpen && (
      <AddBrandPanel
        isOpen={addBrandPanelOpen}
            onClose={closePanels}
        onSave={handleSaveBrand}
      />
        )}

      {viewBrandPanelOpen && selectedBrand && (
        <ViewBrandPanel
          isOpen={viewBrandPanelOpen}
            onClose={closePanels}
          brand={selectedBrand}
        />
      )}

        {quotationDetailPanelOpen && selectedQuotation && (
          <QuotationDetailPanel
            isOpen={quotationDetailPanelOpen}
            onClose={closePanels}
            quotation={selectedQuotation}
            onSendQuote={handleSendQuote}
            onCreateCampaign={handleCreateCampaign}
          />
        )}
      </main>
    </div>
  )
}

export default function StaffBrandsPage() {
  return <BrandsPageClient />
}
