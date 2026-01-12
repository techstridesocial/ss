'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  ExternalLink,
  ChevronRight,
  X,
  AlertCircle,
  Download,
  CreditCard,
  Loader2,
  Building2
} from 'lucide-react'
import { useToast } from '../../../components/ui/use-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  creatorName: string
  creatorEmail: string | null
  campaignReference: string
  brandName: string
  contentDescription: string
  contentLink: string
  agreedPrice: number
  currency: string
  vatRequired: boolean
  vatAmount: number
  totalAmount: number
  status: string
  staffNotes: string | null
  influencer?: {
    id: string
    username: string
    profileImage: string | null
    email: string | null
  }
  campaign?: {
    id: string
    name: string
    brand: string | null
  }
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  verified: number
  paid: number
  voided: number
  totalValue: number
  paidValue: number
}

export default function StaffInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/staff/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, searchQuery, toast])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const handleAction = async (action: string) => {
    if (!selectedInvoice) return
    
    if ((action === 'reject' || action === 'delay') && !actionNotes.trim()) {
      toast({
        title: 'Required',
        description: `Please provide a reason for ${action === 'reject' ? 'rejection' : 'delay'}`,
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/staff/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: actionNotes
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: data.message || `Invoice ${action}ed successfully`,
        })
        setSelectedInvoice(null)
        setActionNotes('')
        loadInvoices()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update invoice')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update invoice',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <FileText className="w-3 h-3" /> },
      SENT: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" /> },
      VERIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className="w-3 h-3" /> },
      DELAYED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <AlertCircle className="w-3 h-3" /> },
      PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <DollarSign className="w-3 h-3" /> },
      VOIDED: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" /> }
    }
    const config = configs[status] || configs.DRAFT
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    )
  }

  // Pagination
  const totalPages = Math.ceil(invoices.length / pageSize)
  const paginatedInvoices = invoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-8 pb-12 pt-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">Verified</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.verified}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Paid</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{stats.paid}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Total Value</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Paid Value</span>
              </div>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.paidValue)}</p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="SENT">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="DELAYED">Delayed</option>
                <option value="PAID">Paid</option>
                <option value="VOIDED">Voided</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-gray-500">Loading invoices...</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No invoices found</h3>
              <p className="text-gray-500">No invoices match your current filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Creator</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">{formatDate(invoice.invoiceDate)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {invoice.influencer?.profileImage ? (
                                <img 
                                  src={invoice.influencer.profileImage} 
                                  alt={invoice.creatorName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{invoice.creatorName}</p>
                              <p className="text-xs text-gray-500">@{invoice.influencer?.username || 'unknown'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{invoice.brandName}</p>
                              <p className="text-xs text-gray-500">{invoice.campaignReference}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                          {invoice.vatRequired && (
                            <p className="text-xs text-gray-500">inc. VAT {formatCurrency(invoice.vatAmount, invoice.currency)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Review
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={invoices.length}
                  itemLabel="invoices"
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h2>
                  <p className="text-sm text-gray-500">Invoice Review</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedInvoice.status)}
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Creator & Campaign Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Creator</span>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedInvoice.creatorName}</p>
                    {selectedInvoice.creatorEmail && (
                      <p className="text-sm text-gray-500">{selectedInvoice.creatorEmail}</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Campaign</span>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedInvoice.brandName}</p>
                    <p className="text-sm text-gray-500">{selectedInvoice.campaignReference}</p>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Payment Details</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agreed Price</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(selectedInvoice.agreedPrice, selectedInvoice.currency)}</span>
                    </div>
                    {selectedInvoice.vatRequired && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT (20%)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedInvoice.vatAmount, selectedInvoice.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-emerald-200">
                      <span className="font-semibold text-emerald-800">Total</span>
                      <span className="font-bold text-emerald-800 text-lg">{formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Content</span>
                  </div>
                  <p className="text-gray-900 mb-3">{selectedInvoice.contentDescription}</p>
                  <a
                    href={selectedInvoice.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Content
                  </a>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Invoice Date</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.invoiceDate)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Due Date</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Staff Notes */}
                {selectedInvoice.staffNotes && (
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Staff Notes</span>
                    </div>
                    <p className="text-gray-900">{selectedInvoice.staffNotes}</p>
                  </div>
                )}

                {/* Action Notes Input */}
                {selectedInvoice.status === 'SENT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (required for reject/delay)
                    </label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes for this action..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
                {selectedInvoice.contentLink && (
                  <a
                    href={selectedInvoice.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Content
                  </a>
                )}
                
                {selectedInvoice.status === 'SENT' && (
                  <>
                    <button
                      onClick={() => handleAction('delay')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      Delay
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                  </>
                )}

                {selectedInvoice.status === 'VERIFIED' && (
                  <button
                    onClick={() => handleAction('pay')}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                    Mark as Paid
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
