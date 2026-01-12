'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Mail, XCircle } from 'lucide-react'

interface RejectQuotationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, notifyBrand: boolean) => void
  quotationDetails?: {
    brandName?: string
    campaignName?: string
  }
  isLoading?: boolean
}

export function RejectQuotationModal({
  isOpen,
  onClose,
  onConfirm,
  quotationDetails,
  isLoading = false
}: RejectQuotationModalProps) {
  const [reason, setReason] = useState('')
  const [notifyBrand, setNotifyBrand] = useState(true)

  const handleSubmit = () => {
    if (!reason.trim()) return
    onConfirm(reason.trim(), notifyBrand)
  }

  const handleClose = () => {
    if (!isLoading) {
      setReason('')
      setNotifyBrand(true)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Reject Quotation</h2>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Quotation Info */}
                {quotationDetails && (quotationDetails.brandName || quotationDetails.campaignName) && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-600">
                      You are about to reject the quotation for:
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {quotationDetails.brandName}
                      {quotationDetails.campaignName && ` - ${quotationDetails.campaignName}`}
                    </p>
                  </div>
                )}

                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this quotation..."
                    rows={4}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    This reason will be recorded and may be shared with the brand.
                  </p>
                </div>

                {/* Notify Brand Checkbox */}
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifyBrand}
                    onChange={(e) => setNotifyBrand(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Notify brand via email
                    </span>
                  </div>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!reason.trim() || isLoading}
                  whileHover={{ scale: reason.trim() && !isLoading ? 1.02 : 1 }}
                  whileTap={{ scale: reason.trim() && !isLoading ? 0.98 : 1 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Reject Quotation</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default RejectQuotationModal
