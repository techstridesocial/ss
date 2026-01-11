'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, Filter, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'

// Types
import type { Quotation, SortConfig } from '@/types/brands'

// Hooks
import { useQuotations } from '@/lib/hooks/staff/useBrands'

// Components
import { QuotationsTable } from '@/components/staff/brands/QuotationsTable'

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

function QuotationsPageClient() {
  const { toast } = useToast()
  
  // Data hooks
  const quotations = useQuotations()
  const [isLoading, setIsLoading] = useState(false)
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'requested_at',
    direction: 'desc'
  })
  
  // Panel states
  const [quotationDetailPanelOpen, setQuotationDetailPanelOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false)
  const [campaignQuotation, setCampaignQuotation] = useState<Quotation | null>(null)

  // Reload quotations
  const reloadQuotations = useCallback(() => {
    setIsLoading(true)
    // Trigger a re-fetch by reloading the page (since useQuotations doesn't expose reload)
    window.location.reload()
  }, [])

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

  // Stats
  const stats = useMemo(() => ({
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending_review').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    inProgress: quotations.filter(q => q.status === 'in_progress').length
  }), [quotations])

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleViewQuotation = (id: string) => {
    const quotation = quotations.find(q => q.id === id)
    if (quotation) {
      setSelectedQuotation(quotation)
      setQuotationDetailPanelOpen(true)
    }
  }

  const handleQuotationApproved = () => {
    toast({
      title: 'Quotation Approved',
      description: 'The quotation has been approved and the brand has been notified.',
    })
    setQuotationDetailPanelOpen(false)
    reloadQuotations()
  }

  const handleQuotationRejected = () => {
    toast({
      title: 'Quotation Rejected',
      description: 'The quotation has been rejected.',
    })
    setQuotationDetailPanelOpen(false)
    reloadQuotations()
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh quotations"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
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
          {filteredQuotations.length === 0 ? (
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
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <QuotationsTable
                  quotations={filteredQuotations}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onViewQuotation={handleViewQuotation}
                />
              </table>
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredQuotations.length} of {quotations.length} quotation{quotations.length !== 1 ? 's' : ''}
        </div>
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
          onSendQuoteAction={(pricing: string, notes: string) => {
            // Handle sending quote - this updates the quotation status
            console.log('Sending quote:', { pricing, notes })
            handleQuotationApproved()
          }}
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
          onSuccess={handleCampaignCreated}
        />
      )}

      <Toaster />
    </div>
  )
}

export default function StaffQuotationsPage() {
  return <QuotationsPageClient />
}
