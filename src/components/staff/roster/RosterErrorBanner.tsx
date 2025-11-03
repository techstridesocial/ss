/**
 * Roster Error Banner Component
 */

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface RosterErrorBannerProps {
  error: string
  onRetry: () => void
}

export function RosterErrorBanner({ error, onRetry }: RosterErrorBannerProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
        <div>
          <h3 className="text-sm font-semibold text-red-800">Failed to Load Influencers</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

