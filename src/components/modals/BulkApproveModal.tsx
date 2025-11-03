'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, FileText, DollarSign } from 'lucide-react'

interface Shortlist {
  id: string
  name: string
  brand_name: string
  influencer_count: number
  estimated_value?: number
}

interface BulkApproveModalProps {
  isOpen: boolean
  onClose: () => void
  selectedShortlists: Shortlist[]
  onApprove: (shortlistIds: string[], notes?: string, priceAdjustment?: number) => Promise<void>
}

export default function BulkApproveModal({
  isOpen,
  onClose,
  selectedShortlists,
  onApprove
}: BulkApproveModalProps) {
  const [approvalNotes, setApprovalNotes] = useState('')
  const [priceAdjustment, setPriceAdjustment] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const totalInfluencers = selectedShortlists.reduce((sum, shortlist) => sum + shortlist.influencer_count, 0)
  const estimatedTotal = selectedShortlists.reduce((sum, shortlist) => sum + (shortlist.estimated_value || 0), 0)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const shortlistIds = selectedShortlists.map(s => s.id)
      await onApprove(shortlistIds, approvalNotes, priceAdjustment)
      setApprovalNotes('')
      setPriceAdjustment(undefined)
      onClose()
    } catch (error) {
      console.error('Error approving shortlists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Approve Shortlists
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Ready to approve {selectedShortlists.length} shortlist{selectedShortlists.length > 1 ? 's' : ''}
                </h3>
                <div className="text-sm text-green-700 mt-1">
                  Total influencers: <strong>{totalInfluencers}</strong>
                  {estimatedTotal > 0 && (
                    <span className="ml-4">
                      Estimated value: <strong>${estimatedTotal.toLocaleString()}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shortlist Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Shortlists:</h3>
            <div className="space-y-2">
              {selectedShortlists.map((shortlist) => (
                <div key={shortlist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{shortlist.name}</div>
                    <div className="text-xs text-gray-500">{shortlist.brand_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">{shortlist.influencer_count} influencers</div>
                    {shortlist.estimated_value && (
                      <div className="text-xs text-gray-500">${shortlist.estimated_value.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Adjustment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <DollarSign size={16} className="mr-1" />
              Price Adjustment (%)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={priceAdjustment || ''}
                onChange={(e) => setPriceAdjustment(parseFloat(e.target.value) || undefined)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="0.1"
              />
              <span className="text-sm text-gray-500">
                Enter positive for increase, negative for discount (e.g., -10 for 10% discount)
              </span>
            </div>
            {priceAdjustment && (
              <div className="mt-2 text-sm">
                {priceAdjustment > 0 ? (
                  <span className="text-green-600">
                    +{priceAdjustment}% increase = ${Math.round(estimatedTotal * (1 + priceAdjustment / 100)).toLocaleString()} total
                  </span>
                ) : (
                  <span className="text-blue-600">
                    {priceAdjustment}% discount = ${Math.round(estimatedTotal * (1 + priceAdjustment / 100)).toLocaleString()} total
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Approval Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText size={16} className="mr-1" />
              Approval Notes (Optional)
            </label>
            <textarea
              rows={4}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about pricing adjustments, special terms, or conditions..."
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Approval Confirmation
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will approve all selected shortlists and notify the respective brands. 
                  Campaign creation and influencer outreach can begin immediately after approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Approve All ({selectedShortlists.length})</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
} 