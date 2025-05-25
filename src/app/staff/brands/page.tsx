'use client'

import React, { useState } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import BulkApproveModal from '../../../components/modals/BulkApproveModal'
import AddBrandPanel from '../../../components/brands/AddBrandPanel'
import ViewBrandPanel from '../../../components/brands/ViewBrandPanel'
import { Building2, Eye, FileText, Download, Star, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'

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
  const [selectedShortlists, setSelectedShortlists] = useState<string[]>([])
  const [bulkApproveModalOpen, setBulkApproveModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'clients-list' | 'shortlist'>('clients-list')
  const [brandSearchQuery, setBrandSearchQuery] = useState('')
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('')
  const [quotationDetailModalOpen, setQuotationDetailModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [quotePricing, setQuotePricing] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [addBrandPanelOpen, setAddBrandPanelOpen] = useState(false)
  const [viewBrandPanelOpen, setViewBrandPanelOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)

  const handleSelectShortlist = (shortlistId: string) => {
    setSelectedShortlists(prev => 
      prev.includes(shortlistId) 
        ? prev.filter(id => id !== shortlistId)
        : [...prev, shortlistId]
    )
  }

  const handleBulkApprove = async (shortlistIds: string[], notes?: string, priceAdjustment?: number) => {
    console.log('Bulk approving shortlists:', shortlistIds, notes, priceAdjustment)
    alert(`Successfully approved ${shortlistIds.length} shortlists!`)
    setSelectedShortlists([])
  }

  const handleExportReports = () => {
    alert('Exporting brand reports...')
  }

  const handleViewBrand = (brandId: string) => {
    const brand = MOCK_BRANDS.find(b => b.id === brandId)
    if (brand) {
      setSelectedBrand(brand)
      setViewBrandPanelOpen(true)
    }
  }

  const handleApproveShortlist = (shortlistId: string) => {
    alert(`Approving shortlist ${shortlistId}`)
  }

  const handleRejectShortlist = (shortlistId: string) => {
    alert(`Rejecting shortlist ${shortlistId}`)
  }

  const handleOpenQuotation = (quotation: any) => {
    setSelectedQuotation(quotation)
    setQuotePricing(quotation.total_quote || '')
    setQuoteNotes('')
    setQuotationDetailModalOpen(true)
  }

  const handleSendQuote = () => {
    if (!quotePricing) {
      alert('Please enter pricing before sending quote')
      return
    }
    alert(`Sending quote for $${quotePricing} to ${selectedQuotation?.brand_name}`)
    setQuotationDetailModalOpen(false)
    setSelectedQuotation(null)
    setQuotePricing('')
    setQuoteNotes('')
  }

  const handleAddBrand = () => {
    setAddBrandPanelOpen(true)
  }

  const handleSaveBrand = async (brandData: any) => {
    console.log('Saving brand:', brandData)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate new ID
      const newId = `brand_${Date.now()}`
      
      // Create new brand object
      const newBrand = {
        id: newId,
        company_name: brandData.company_name,
        contact_name: brandData.contact_name,
        email: brandData.email,
        phone: brandData.phone,
        website: brandData.website,
        industry: brandData.industry,
        company_size: brandData.company_size,
        location_country: brandData.location_country,
        location_city: brandData.location_city,
        description: brandData.description,
        budget_range: brandData.budget_range,
        logo_url: null,
        shortlists_count: 0,
        active_campaigns: 0,
        total_spend: 0,
        last_activity: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      
      // Handle user invitations if provided
      if (brandData.brandUsers && brandData.brandUsers.length > 0) {
        console.log('Processing user invitations:', brandData.brandUsers)
        
        // TODO: Implement Clerk invitation system
        const invitationResults = await Promise.allSettled(
          brandData.brandUsers.map(async (user: any) => {
            // This will be replaced with actual Clerk invitation API call
            console.log(`Sending invitation to ${user.email} (${user.firstName} ${user.lastName})`)
            return {
              email: user.email,
              status: 'sent',
              invitationId: `inv_${Date.now()}_${Math.random()}`
            }
          })
        )
        
        const successfulInvites = invitationResults
          .filter(result => result.status === 'fulfilled')
          .length
        
        console.log(`Successfully sent ${successfulInvites} invitation(s)`)
        
        // Show success message with invitation details
        const userMessage = brandData.brandUsers.length === 1 
          ? `User invitation sent to ${brandData.brandUsers[0].email}`
          : `${successfulInvites} user invitations sent successfully`
        
        alert(`✅ Brand "${brandData.company_name}" has been added successfully!\n\n📧 ${userMessage}`)
      } else {
        alert(`✅ Brand "${brandData.company_name}" has been added successfully!`)
      }
      
    } catch (error) {
      console.error('Error saving brand:', error)
      alert('❌ Error adding brand. Please try again.')
      throw error
    }
  }

  const brandStats = {
    totalBrands: MOCK_BRANDS.length,
    activeBrands: MOCK_BRANDS.filter(b => b.status === 'active').length,
    pendingShortlists: MOCK_SHORTLISTS.filter(s => s.status === 'pending_review').length,
    totalRevenue: MOCK_BRANDS.reduce((sum, brand) => sum + brand.total_spend, 0)
  }

  // Filter brands based on search query
  const filteredBrands = MOCK_BRANDS.filter(brand =>
    brand.company_name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  )

  // Filter quotations based on search query
  const filteredQuotations = MOCK_QUOTATION_REQUESTS.filter(quote =>
    quote.brand_name.toLowerCase().includes(quotationSearchQuery.toLowerCase()) ||
    quote.campaign_name.toLowerCase().includes(quotationSearchQuery.toLowerCase())
  )

  // Selected shortlist data for bulk operations
  const selectedShortlistData = MOCK_SHORTLISTS.filter(s => selectedShortlists.includes(s.id))

  // Selected quotation request data for bulk operations
  const selectedQuotationData = MOCK_QUOTATION_REQUESTS.filter(q => selectedShortlists.includes(q.id))

  function QuotationRequestTable() {
    const getStatusBadge = (status: string) => {
      if (status === 'pending_review') {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Review</span>
      }
      if (status === 'sent') {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Sent</span>
      }
      if (status === 'approved') {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
      }
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Rejected</span>
    }

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="px-6 py-5 border-b border-gray-100/60">
          <h2 className="text-lg font-semibold text-gray-900">
            Quotation Requests ({filteredQuotations.length}
            {quotationSearchQuery && filteredQuotations.length !== MOCK_QUOTATION_REQUESTS.length && ` of ${MOCK_QUOTATION_REQUESTS.length}`})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotations.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.brand_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{quote.campaign_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Star size={14} className="mr-1 text-gray-400" />
                      {quote.influencer_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.budget_range}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {quote.status === 'pending_review' && (
                          <button 
                          onClick={() => handleOpenQuotation(quote)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          >
                          Open
                          </button>
                      )}
                      {quote.status === 'sent' && (
                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-md">
                          Awaiting Response
                        </span>
                      )}
                      {quote.status === 'approved' && (
                        <span className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md">
                          Completed
                        </span>
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

  function BrandTable() {
    const getStatusBadge = (status: string) => {
      if (status === 'active') {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
      }
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
    }

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="px-6 py-5 border-b border-gray-100/60">
          <h2 className="text-lg font-semibold text-gray-900">
            Brand Clients ({filteredBrands.length}
            {brandSearchQuery && filteredBrands.length !== MOCK_BRANDS.length && ` of ${MOCK_BRANDS.length}`})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlists</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {brand.logo_url ? (
                          <img className="h-10 w-10 rounded-full" src={brand.logo_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Building2 size={20} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{brand.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{brand.contact_name}</div>
                    <div className="text-sm text-gray-500">{brand.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FileText size={14} className="mr-1 text-gray-400" />
                      {brand.shortlists_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Star size={14} className="mr-1 text-gray-400" />
                      {brand.active_campaigns}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${brand.total_spend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(brand.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewBrand(brand.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download size={16} />
                      </button>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className={`px-4 lg:px-8 pb-8 transition-all duration-300 ${
        addBrandPanelOpen ? 'mr-[32rem]' : viewBrandPanelOpen ? 'mr-[56rem]' : ''
      }`}>
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('clients-list')}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'clients-list'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Clients list
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'clients-list' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {filteredBrands.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shortlist')}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'shortlist'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Quotations
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'shortlist' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {filteredQuotations.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'clients-list' && (
          <div className="mb-8">
            {/* Premium Search Bar and Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleAddBrand}
                className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg whitespace-nowrap"
              >
                <Plus size={16} className="mr-2" />
                Add Brand
              </button>
            </div>
            <BrandTable />
          </div>
        )}
        {activeTab === 'shortlist' && (
          <div className="mb-8">
            {/* Premium Search Bar and Actions for Quotations */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search quotations by brand or campaign..."
                  value={quotationSearchQuery}
                  onChange={(e) => setQuotationSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleAddBrand}
                className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg whitespace-nowrap"
              >
                <Plus size={16} className="mr-2" />
                Add Brand
              </button>
            </div>
            <QuotationRequestTable />
          </div>
        )}
      </main>

      {/* Quotation Detail Modal */}
      {quotationDetailModalOpen && selectedQuotation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-5xl w-full max-h-[95vh]">
            <div className="overflow-hidden rounded-3xl">
              <div className="p-8 overflow-y-auto max-h-[95vh]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Quotation Details</h2>
                  <button
                    onClick={() => setQuotationDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Campaign Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Campaign Information */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                      <h3 className="text-xl font-semibold mb-6 text-gray-900">Campaign Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Brand</label>
                          <p className="text-gray-900">{selectedQuotation.brand_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Campaign</label>
                          <p className="text-gray-900">{selectedQuotation.campaign_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Influencers</label>
                          <p className="text-gray-900">{selectedQuotation.influencer_count}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Duration</label>
                          <p className="text-gray-900">{selectedQuotation.campaign_duration}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-900">{selectedQuotation.description}</p>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Budget Range</label>
                        <p className="text-gray-900">{selectedQuotation.budget_range}</p>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Deliverables</label>
                        <p className="text-gray-900">{selectedQuotation.deliverables.join(", ")}</p>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Target Demographics</label>
                        <p className="text-gray-900">{selectedQuotation.target_demographics}</p>
                      </div>
                      {selectedQuotation.notes && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-500">Brand Notes</label>
                          <p className="text-gray-900">{selectedQuotation.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Influencer Information */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                      <h3 className="text-xl font-semibold mb-6 text-gray-900">Influencer Information</h3>

                      <div className="space-y-3 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {selectedQuotation.influencers.map((influencer: any, index: number) => (
                          <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{influencer.name}</h4>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{influencer.platform}</span>
                                  <span className="text-xs text-gray-500">{influencer.followers} followers</span>
                                  <span className="text-xs text-gray-500">{influencer.engagement} engagement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Quote Pricing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Quote Amount ($)
                        </label>
                        <input
                          type="number"
                          value={quotePricing}
                          onChange={(e) => setQuotePricing(e.target.value)}
                          className="w-full px-6 py-4 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
                          placeholder="Enter total quote amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Internal Notes
                        </label>
                        <textarea
                          value={quoteNotes}
                          onChange={(e) => setQuoteNotes(e.target.value)}
                          rows={3}
                          className="w-full px-6 py-4 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
                          placeholder="Add any internal notes about this quote..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-2">
                    <button
                      onClick={() => setQuotationDetailModalOpen(false)}
                      className="px-8 py-3 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm hover:bg-white/80 transition-all duration-300 text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendQuote}
                      className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
                    >
                      Send Quote to Brand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      <BulkApproveModal
        isOpen={bulkApproveModalOpen}
        onClose={() => setBulkApproveModalOpen(false)}
        selectedShortlists={selectedShortlistData.map(s => ({
          id: s.id,
          name: s.name,
          brand_name: s.brand_name,
          influencer_count: s.influencer_count,
          estimated_value: 1000 * s.influencer_count // Mock estimated value
        }))}
        onApprove={handleBulkApprove}
      />

      {/* Add Brand Panel */}
      <AddBrandPanel
        isOpen={addBrandPanelOpen}
        onClose={() => setAddBrandPanelOpen(false)}
        onSave={handleSaveBrand}
      />

      {/* View Brand Panel */}
      {viewBrandPanelOpen && selectedBrand && (
        <ViewBrandPanel
          isOpen={viewBrandPanelOpen}
          onClose={() => {
            setViewBrandPanelOpen(false)
            setSelectedBrand(null)
          }}
          brand={selectedBrand}
        />
      )}
    </div>
  )
}

export default BrandsPageClient
