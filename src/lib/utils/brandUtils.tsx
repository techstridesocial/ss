/**
 * Utility functions for brands page
 */

'use client'

import React from 'react'

/**
 * Format number with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Get brand status badge JSX
 */
export function getBrandStatusBadge(status: string): JSX.Element {
  if (status === 'active') {
    return (
      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
      Inactive
    </span>
  )
}

/**
 * Get quotation status badge JSX
 */
export function getQuotationStatusBadge(status: string): JSX.Element {
  switch (status) {
    case 'pending_review':
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending Review
        </span>
      )
    case 'sent':
      return (
        <div className="flex flex-col space-y-1">
          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Sent
          </span>
          <span className="text-xs text-gray-500">Waiting for brand approval</span>
        </div>
      )
    case 'approved':
      return (
        <div className="flex flex-col space-y-1">
          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
          <span className="text-xs text-green-600 font-medium">Ready for influencer contact</span>
        </div>
      )
    case 'rejected':
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      )
    default:
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      )
  }
}
