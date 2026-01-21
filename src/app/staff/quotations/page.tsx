'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'

// Types
import type { Quotation, SortConfig } from '@/types/brands'

// Hooks
import { useQuotations } from '@/lib/hooks/staff/useBrands'

// Components
import { QuotationsTable } from '@/components/staff/brands/QuotationsTable'
import { Pagination } from '@/components/ui/Pagination'
import { ResponsiveTable } from '@/components/ui/ResponsiveTable'

// Lazy load the detail panel
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

const RejectQuotationModal = dynamic(() => import('@/components/modals/RejectQuotationModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

function QuotationsPageClient() {
  const { toast } = useToast()
  
  // Data hooks
  const { quotations, isLoading: quotationsLoading, reloadQuotations } = useQuotations()
  const [isLoading, setIsLoading] = useState(false)
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'requested_at',
    direction: 'desc'
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Panel states
  const [quotationDetailPanelOpen, setQuotationDetailPanelOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false)
  const [campaignQuotation, setCampaignQuotation] = useState<Quotation | null>(null)
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [quotationToReject, setQuotationToReject] = useState<Quotation | null>(null)


  // Filter and sort quotations
  const filteredQuotations = useMemo(() => {
    let filtered = [...quotations]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(q => 
        q.brand_name?.toLowerCase().includes(query) ||
        q.campaign_name?.toLowerCase().includes(query) ||
        q.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Quotation]
        const bValue = b[sortConfig.key as keyof Quotation]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        let comparison = 0
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }
        
        return sortConfig.direction === 'desc' ? -comparison : comparison
      })
    }
    
    return filtered
  }, [quotations, searchQuery, statusFilter, sortConfig])

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuotations.length / pageSize)
  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredQuotations.slice(startIndex, startIndex + pageSize)
  }, [filteredQuotations, currentPage, pageSize])

  // Stats
  const stats = useMemo(() => ({
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending_review').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    inProgress: quotations.filter(q => q.status === 'pending_review' || q.status === 'sent').length
  }), [quotations])

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1) // Reset to first page on sort
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page on page size change
  }

  const handleViewQuotation = (id: string) => {
    const quotation = quotations.find(q => q.id === id)
    if (quotation) {
      setSelectedQuotation(quotation)
      setQuotationDetailPanelOpen(true)
    }
  }

  // Send quote to brand - updates status to SENT
  const handleSendQuote = async (pricing: string, notes: string) => {
    if (!selectedQuotation) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: selectedQuotation.id,
          status: 'SENT',
          final_price: parseFloat(pricing),
          notes: notes
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send quote')
      }
      
      toast({
        title: 'Quote Sent Successfully',
        description: `Quote for $${parseFloat(pricing).toLocaleString()} has been sent to the brand.`,
      })
      setQuotationDetailPanelOpen(false)
      setSelectedQuotation(null)
      reloadQuotations()
    } catch (error) {
      console.error('Error sending quote:', error)
      toast({
        title: 'Error',
        description: 'Failed to send quote. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Approve quotation - updates status to APPROVED
  const handleApproveQuotation = async (quotation: Quotation) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotation.id,
          status: 'APPROVED'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve quotation')
      }
      
      toast({
        title: 'Quotation Approved',
        description: `The quotation for "${quotation.brand_name}" has been approved.`,
      })
      setQuotationDetailPanelOpen(false)
      setSelectedQuotation(null)
      reloadQuotations()
    } catch (error) {
      console.error('Error approving quotation:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve quotation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Open rejection modal instead of directly rejecting
  const handleOpenRejectModal = (quotation: Quotation) => {
    setQuotationToReject(quotation)
    setShowRejectModal(true)
    setQuotationDetailPanelOpen(false)
  }

  // Reject quotation - updates status to REJECTED
  const handleRejectQuotation = async (reason: string, notifyBrand: boolean) => {
    if (!quotationToReject) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotationToReject.id,
          status: 'REJECTED',
          notes: reason,
          notifyBrand
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to reject quotation')
      }
      
      toast({
        title: 'Quotation Rejected',
        description: 'The quotation has been rejected.' + (notifyBrand ? ' The brand has been notified.' : ''),
      })
      setShowRejectModal(false)
      setQuotationToReject(null)
      setSelectedQuotation(null)
      reloadQuotations()
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject quotation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = (quotation: Quotation) => {
    setCampaignQuotation(quotation)
    setShowCreateCampaignModal(true)
    setQuotationDetailPanelOpen(false)
  }

  const handleCampaignCreated = () => {
    toast({
      title: 'Campaign Created',
      description: 'The campaign has been created successfully from the quotation.',
    })
    setShowCreateCampaignModal(false)
    setCampaignQuotation(null)
    reloadQuotations()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-6 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-blue-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-green-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-red-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={reloadQuotations}
                disabled={isLoading || quotationsLoading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh quotations"
              >
                <RefreshCw className={`w-5 h-5 ${(isLoading || quotationsLoading) ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quotations Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {quotationsLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Quotations</h3>
              <p className="text-gray-500">Please wait while we fetch your quotation requests...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotations Found</h3>
              <p className="text-gray-500">
                {quotations.length === 0 
                  ? 'No quotation requests have been submitted yet.'
                  : 'No quotations match your current filters.'}
              </p>
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full">
                <QuotationsTable
                  quotations={paginatedQuotations}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onViewQuotation={handleViewQuotation}
                  onRejectQuotation={handleOpenRejectModal}
                  onApproveQuotation={handleApproveQuotation}
                />
              </table>
            </ResponsiveTable>
          )}
        </motion.div>

        {/* Pagination */}
        {!quotationsLoading && filteredQuotations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredQuotations.length}
            itemLabel="quotations"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50]}
          />
        )}
      </main>

      {/* Quotation Detail Panel */}
      {selectedQuotation && (
        <QuotationDetailPanel
          isOpen={quotationDetailPanelOpen}
          quotation={selectedQuotation}
          onCloseAction={() => {
            setQuotationDetailPanelOpen(false)
            setSelectedQuotation(null)
          }}
          onSendQuoteAction={handleSendQuote}
          onCreateCampaign={() => handleCreateCampaign(selectedQuotation)}
        />
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaignModal && campaignQuotation && (
        <CreateCampaignFromQuotationModal
          isOpen={showCreateCampaignModal}
          onClose={() => {
            setShowCreateCampaignModal(false)
            setCampaignQuotation(null)
          }}
          quotation={campaignQuotation}
          onSave={handleCampaignCreated}
        />
      )}

      {/* Reject Quotation Modal */}
      {quotationToReject && (
        <RejectQuotationModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setQuotationToReject(null)
          }}
          onConfirm={handleRejectQuotation}
          quotationDetails={{
            brandName: quotationToReject.brand_name,
            campaignName: quotationToReject.campaign_name
          }}
          isLoading={isLoading}
        />
      )}

      <Toaster />
    </div>
  )
}

export default function StaffQuotationsPage() {
  return <QuotationsPageClient />
}
