'use client'

import React, { useState, useEffect } from 'react'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Download, 
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InvoiceDetailModal from '../../../components/staff/InvoiceDetailModal'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  creator_name: string
  brand_name: string
  content_description: string
  content_link: string
  agreed_price: number
  currency: string
  vat_amount: number
  total_amount: number
  status: 'DRAFT' | 'SENT' | 'VERIFIED' | 'DELAYED' | 'PAID' | 'VOIDED'
  staff_notes?: string
  pdf_path?: string
  created_at: string
  influencer_name: string
  campaign_name: string
}

interface InvoiceSummary {
  total_invoices: number
  sent_count: number
  verified_count: number
  paid_count: number
  delayed_count: number
  total_paid: number
  pending_amount: number
}

export default function StaffFinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<InvoiceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  
  // Bulk operations state
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  
  // Advanced filtering state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter)
      
      const response = await fetch(`/api/staff/invoices?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (invoiceId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/staff/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          staff_notes: notes
        })
      })

      if (response.ok) {
        fetchInvoices() // Refresh the list
        setShowInvoiceModal(false)
        setSelectedInvoice(null)
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
    }
  }

  // Bulk operations functions
  const handleSelectInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices)
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId)
    } else {
      newSelected.add(invoiceId)
    }
    setSelectedInvoices(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(invoice => invoice.id)))
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedInvoices.size === 0) return

    setIsBulkUpdating(true)
    try {
      const response = await fetch('/api/staff/invoices/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceIds: Array.from(selectedInvoices),
          status: bulkStatus,
          staff_notes: bulkNotes
        })
      })

      if (response.ok) {
        fetchInvoices()
        setSelectedInvoices(new Set())
        setShowBulkModal(false)
        setBulkStatus('')
        setBulkNotes('')
      }
    } catch (error) {
      console.error('Error updating bulk status:', error)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-blue-600 bg-blue-100'
      case 'VERIFIED': return 'text-green-600 bg-green-100'
      case 'DELAYED': return 'text-orange-600 bg-orange-100'
      case 'PAID': return 'text-green-600 bg-green-100'
      case 'VOIDED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <Clock className="h-4 w-4" />
      case 'VERIFIED': return <CheckCircle className="h-4 w-4" />
      case 'DELAYED': return <AlertTriangle className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'VOIDED': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === 'ALL' || invoice.status === statusFilter
    const matchesBrand = brandFilter === '' || invoice.brand_name.toLowerCase().includes(brandFilter.toLowerCase())
    
    // Date range filtering
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (new Date(invoice.invoice_date) >= new Date(dateRange.start) && 
       new Date(invoice.invoice_date) <= new Date(dateRange.end))
    
    // Amount range filtering
    const matchesAmountRange = !amountRange.min || !amountRange.max ||
      (Number(invoice.total_amount) >= Number(amountRange.min) && 
       Number(invoice.total_amount) <= Number(amountRange.max))
    
    return matchesSearch && matchesStatus && matchesBrand && matchesDateRange && matchesAmountRange
  })

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        
        <main className="px-4 lg:px-8 pb-8">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold">{summary?.total_invoices || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                      <p className="text-2xl font-bold text-orange-600">£{summary?.pending_amount ? Number(summary.pending_amount).toFixed(2) : '0.00'}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-600">£{summary?.total_paid ? Number(summary.total_paid).toFixed(2) : '0.00'}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                      <p className="text-2xl font-bold">{summary?.paid_count || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search invoices, creators, or brands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="VOIDED">Voided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="md:w-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button
                  onClick={fetchInvoices}
                  variant="outline"
                  className="md:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min Amount"
                        value={amountRange.min}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max Amount"
                        value={amountRange.max}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Filter</label>
                    <Input
                      placeholder="Filter by brand name"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setDateRange({ start: '', end: '' })
                      setAmountRange({ min: '', max: '' })
                      setBrandFilter('')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoice Management
                </CardTitle>
                {selectedInvoices.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedInvoices.size} selected
                    </span>
                    <Button
                      onClick={() => setShowBulkModal(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Bulk Actions
                    </Button>
                    <Button
                      onClick={() => setSelectedInvoices(new Set())}
                      variant="outline"
                      size="sm"
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter 
                      ? 'No invoices match your current filters.' 
                      : 'No invoices have been submitted yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.has(invoice.id)}
                              onChange={() => handleSelectInvoice(invoice.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoice_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(invoice.invoice_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.creator_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.influencer_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.brand_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.content_description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.currency} {Number(invoice.total_amount).toFixed(2)}
                            </div>
                            {invoice.vat_amount > 0 && (
                              <div className="text-sm text-gray-500">
                                (incl. {invoice.currency} {Number(invoice.vat_amount).toFixed(2)} VAT)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              <span className="ml-1">{invoice.status}</span>
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setShowInvoiceModal(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Detail Modal */}
          <InvoiceDetailModal
            isOpen={showInvoiceModal}
            onClose={() => {
              setShowInvoiceModal(false)
              setSelectedInvoice(null)
            }}
            invoice={selectedInvoice}
            onStatusUpdate={handleStatusUpdate}
          />

          {/* Bulk Operations Modal */}
          {showBulkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBulkModal(false)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Bulk Status Update
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Update status for {selectedInvoices.size} selected invoices
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <Select value={bulkStatus} onValueChange={setBulkStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VERIFIED">Verified</SelectItem>
                          <SelectItem value="DELAYED">Delayed</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="VOIDED">Voided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff Notes (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                        placeholder="Add notes for this bulk update..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        onClick={() => setShowBulkModal(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkStatusUpdate}
                        disabled={!bulkStatus || isBulkUpdating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isBulkUpdating ? 'Updating...' : 'Update Status'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </StaffProtectedRoute>
  )
}
