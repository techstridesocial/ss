'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Eye, Download, CheckCircle, AlertTriangle, Clock, DollarSign, Calendar, User, Building, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface InvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: {
    id: string
    invoice_number: string
    invoice_date: string
    due_date: string
    creator_name: string
    creator_address?: string
    creator_email?: string
    creator_phone?: string
    campaign_reference: string
    brand_name: string
    content_description: string
    content_link: string
    agreed_price: number
    currency: string
    vat_required: boolean
    vat_rate: number
    vat_amount: number
    total_amount: number
    status: 'DRAFT' | 'SENT' | 'VERIFIED' | 'DELAYED' | 'PAID' | 'VOIDED'
    staff_notes?: string
    payment_terms: string
    created_at: string
    influencer_name: string
    campaign_name: string
  } | null
  onStatusUpdate: (invoiceId: string, newStatus: string, notes?: string) => void
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onStatusUpdate
}: InvoiceDetailModalProps) {
  const [newStatus, setNewStatus] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  if (!invoice) return null

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

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === invoice.status) return

    setIsUpdating(true)
    try {
      await onStatusUpdate(invoice.id, newStatus, staffNotes)
      setNewStatus('')
      setStaffNotes('')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Invoice Details</h2>
                <p className="text-sm text-gray-600">{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(invoice.content_link, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Invoice Details */}
              <div className="space-y-6">
                {/* Invoice Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Invoice #:</span>
                      <p className="text-gray-900">{invoice.invoice_number}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <p className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Due Date:</span>
                      <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Reference:</span>
                      <p className="text-gray-900">{invoice.campaign_reference}</p>
                    </div>
                  </div>
                </div>

                {/* Creator Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{invoice.creator_name}</p>
                    </div>
                    {invoice.creator_email && (
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{invoice.creator_email}</p>
                      </div>
                    )}
                    {invoice.creator_phone && (
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-900">{invoice.creator_phone}</p>
                      </div>
                    )}
                    {invoice.creator_address && (
                      <div>
                        <span className="font-medium text-gray-600">Address:</span>
                        <p className="text-gray-900">{invoice.creator_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Brand:</span>
                      <p className="text-gray-900">{invoice.brand_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Content:</span>
                      <p className="text-gray-900">{invoice.content_description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Link:</span>
                      <a 
                        href={invoice.content_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Content
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Financial Details & Status Management */}
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{invoice.currency} {Number(invoice.agreed_price).toFixed(2)}</span>
                    </div>
                    {invoice.vat_required && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VAT ({invoice.vat_rate}%):</span>
                        <span className="font-medium">{invoice.currency} {Number(invoice.vat_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>{invoice.currency} {Number(invoice.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                  <div className="flex items-center space-x-3">
                    <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-2">{invoice.status}</span>
                    </Badge>
                  </div>
                  {invoice.staff_notes && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-600">Staff Notes:</span>
                      <p className="text-sm text-gray-900 mt-1">{invoice.staff_notes}</p>
                    </div>
                  )}
                </div>

                {/* Status Update */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SENT">Sent</SelectItem>
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
                      <Textarea
                        value={staffNotes}
                        onChange={(e) => setStaffNotes(e.target.value)}
                        placeholder="Add notes about this status change..."
                        rows={3}
                      />
                    </div>
                    
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={!newStatus || newStatus === invoice.status || isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
