'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUserId } from '@/lib/auth/current-user'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { Building2, Eye, FileText, Plus, FilterIcon, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react'

// Types
import type { Brand, Quotation, BrandData, CampaignData, QuotationInfluencer, ApiError, ApiResponse, SortConfig } from '@/types/brands'

// Hooks
import { useBrands, useStaffMembers, useQuotations } from '@/lib/hooks/staff/useBrands'
import { useBrandFilters } from '@/lib/hooks/staff/useBrandFilters'

// Components
import { StatCard } from '@/components/staff/brands/StatCard'
import { FilterPanel } from '@/components/staff/brands/FilterPanel'
import { BrandsTable } from '@/components/staff/brands/BrandsTable'
import { QuotationsTable } from '@/components/staff/brands/QuotationsTable'

// Utils
import { sortBrandsAndQuotations } from '@/lib/utils/brandSorting'

// Lazy load heavy modal and panel components
const AddBrandPanel = dynamic(() => import('@/components/brands/AddBrandPanel'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

const ViewBrandPanel = dynamic(() => import('@/components/brands/ViewBrandPanel'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

const QuotationDetailPanel = dynamic(() => import('@/components/brands/QuotationDetailPanel'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

const CreateCampaignFromQuotationModal = dynamic(() => import('@/components/campaigns/CreateCampaignFromQuotationModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

function BrandsPageClient() {
  const router = useRouter()
  const currentUserId = useCurrentUserId()
  const { toast } = useToast()
  
  // Data hooks
  const { brands, isLoading, loadError, reloadBrands } = useBrands()
  const staffMembers = useStaffMembers()
  const quotations = useQuotations()
  
  // Filter hook
  const {
    searchQuery,
    setSearchQuery,
    brandFilters,
    quotationFilters,
    brandFilterOptions,
    quotationFilterOptions,
    filteredBrands,
    filteredQuotations,
    handleFilterChange: handleFilterChangeBase,
    clearFilters: clearFiltersBase,
    activeFilterCount
  } = useBrandFilters(brands, quotations, currentUserId)
  
  // UI state
  const [activeTab, setActiveTab] = useState<'clients' | 'quotations'>('clients')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  })
  const [assignmentLoading, setAssignmentLoading] = useState<string | null>(null)
  
  // Panel states
  const [addBrandPanelOpen, setAddBrandPanelOpen] = useState(false)
  const [viewBrandPanelOpen, setViewBrandPanelOpen] = useState(false)
  const [quotationDetailPanelOpen, setQuotationDetailPanelOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false)
  const [campaignQuotation, setCampaignQuotation] = useState<Quotation | null>(null)

  // Apply sorting
  const sortedData = useMemo(() => {
    const dataToSort = activeTab === 'clients' ? filteredBrands : filteredQuotations
    return sortBrandsAndQuotations(dataToSort, sortConfig)
  }, [filteredBrands, filteredQuotations, sortConfig, activeTab])
  
  // Pagination calculations
  const totalItems = sortedData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = sortedData.slice(startIndex, endIndex)

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    handleFilterChangeBase(key as keyof typeof activeFilters, value, activeTab === 'quotations')
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

  const handleTabChange = (tab: 'clients' | 'quotations') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery('')
    setFilterOpen(false)
    setSortConfig({ key: null, direction: 'asc' })
  }

  const clearFilters = () => {
    clearFiltersBase(activeTab === 'quotations')
    setCurrentPage(1)
  }

  const handleAddBrand = () => {
    setAddBrandPanelOpen(true)
  }

  const handleViewBrand = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId)
    setSelectedBrand(brand || null)
    setViewBrandPanelOpen(true)
  }

  const handleViewQuotation = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    setSelectedQuotation(quotation || null)
    setQuotationDetailPanelOpen(true)
  }

  const handleSaveBrand = async (brandData: BrandData) => {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData)
      })
      
      if (response.ok) {
        const result: ApiResponse<Brand> = await response.json()
        toast({
          title: 'Success',
          description: `Brand "${brandData.company_name}" created successfully!`,
        })
        setAddBrandPanelOpen(false)
        reloadBrands()
      } else {
        const error: ApiError = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCampaign = async (campaignData: CampaignData) => {
    try {
      const campaignWithQuotation: CampaignData = {
        ...campaignData,
        quotation_id: campaignQuotation?.id,
        confirmed_influencers: campaignQuotation?.influencers?.filter((inf: QuotationInfluencer) => inf.contact_status === 'confirmed') || [],
        total_budget: campaignQuotation?.total_quote,
        created_from_quotation: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignWithQuotation)
      })
      
      if (response.ok) {
        const result: ApiResponse<unknown> = await response.json()
        if (result.success) {
          setShowCreateCampaignModal(false)
          setCampaignQuotation(null)
          toast({
            title: 'Success',
            description: `Campaign "${campaignData.name}" created successfully! Redirecting to campaigns page...`,
          })
          router.push('/staff/campaigns')
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to create campaign',
            variant: 'destructive',
          })
        }
      } else {
        const error: ApiError = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create campaign',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleOpenCampaignModal = (quotation: Quotation) => {
    setCampaignQuotation(quotation)
    setShowCreateCampaignModal(true)
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
        if ('notes' in selectedQuotation) {
          (selectedQuotation as Quotation & { notes?: string }).notes = notes
        }
      }

      closePanels()
      toast({
        title: 'Success',
        description: `Quotation sent successfully to ${selectedQuotation.brand_name}! They will receive the quote via email.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: 'Error',
        description: `Failed to send quotation: ${errorMessage}`,
        variant: 'destructive',
      })
    }
  }

  const handleAssignBrand = async (brandId: string, staffId: string) => {
    setAssignmentLoading(brandId)
    
    try {
      const response = await fetch(`/api/brands/${brandId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_staff_id: staffId || null })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update local state - we'll need to reload brands to get updated data
        reloadBrands()
        
        const staff = staffMembers.find(s => s.id === staffId)
        const brand = brands.find(b => b.id === brandId)
        
        if (staffId) {
          toast({
            title: 'Success',
            description: `${brand?.company_name} assigned to ${staff?.fullName}`,
          })
        } else {
          toast({
            title: 'Success',
            description: `Assignment removed from ${brand?.company_name}`,
          })
        }
      } else {
        const error: ApiError = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update assignment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setAssignmentLoading(null)
    }
  }

  const closePanels = () => {
    setAddBrandPanelOpen(false)
    setViewBrandPanelOpen(false)
    setQuotationDetailPanelOpen(false)
    setSelectedBrand(null)
    setSelectedQuotation(null)
  }

  // Loading state
  if (isLoading && brands.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        <main className="px-4 lg:px-8 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading brands...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        <main className="px-4 lg:px-8 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle size={32} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Brands</h3>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <button
                onClick={reloadBrands}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw size={16} className="mr-2" />
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const activeFilters = activeTab === 'clients' ? brandFilters : quotationFilters
  const activeFilterOptions = activeTab === 'clients' ? brandFilterOptions : quotationFilterOptions

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
            <FilterIcon size={16} />
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
        <FilterPanel
          isOpen={filterOpen}
          activeTab={activeTab}
          activeFilters={activeFilters}
          activeFilterOptions={activeFilterOptions}
          activeFilterCount={activeFilterCount}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
            
        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100/80 overflow-hidden"
        >
          <div className="overflow-x-auto rounded-xl border border-gray-100/50">
            <table className="w-full">
              {activeTab === 'clients' ? (
                <BrandsTable
                  brands={paginatedData as Brand[]}
                  staffMembers={staffMembers}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onViewBrand={handleViewBrand}
                  onAssignBrand={handleAssignBrand}
                  assignmentLoading={assignmentLoading}
                />
              ) : (
                <QuotationsTable
                  quotations={paginatedData as Quotation[]}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onViewQuotation={handleViewQuotation}
                />
              )}
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
        </motion.div>

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
            onCreateCampaign={() => handleOpenCampaignModal(selectedQuotation)}
          />
        )}

        {/* Create Campaign Modal */}
        <CreateCampaignFromQuotationModal
          isOpen={showCreateCampaignModal}
          onClose={() => {
            setShowCreateCampaignModal(false)
            setCampaignQuotation(null)
          }}
          onSave={handleCreateCampaign}
          quotation={campaignQuotation}
        />
      </main>
      <Toaster />
    </div>
  )
}

export default function StaffBrandsPage() {
  return <BrandsPageClient />
}
