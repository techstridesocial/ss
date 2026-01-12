'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft, Bug } from 'lucide-react'

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Staff portal error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Error Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Application Error
            </h1>
            <p className="text-gray-600 text-sm">
              An unexpected error occurred in the staff dashboard.
            </p>
          </div>
        </div>

        {/* Error Details */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Bug className="w-4 h-4" />
            Error Details
          </div>
          <p className="text-sm font-mono text-slate-600 break-all">
            {error.message || 'Unknown error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <a
            href="/staff"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </a>
        </div>

        {/* Staff Navigation */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-3">Navigate to:</p>
          <div className="grid grid-cols-4 gap-2">
            <a href="/staff/roster" className="text-xs text-center py-2 px-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              Roster
            </a>
            <a href="/staff/quotations" className="text-xs text-center py-2 px-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              Quotations
            </a>
            <a href="/staff/submissions" className="text-xs text-center py-2 px-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              Submissions
            </a>
            <a href="/staff/brands" className="text-xs text-center py-2 px-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              Brands
            </a>
          </div>
        </div>

        {/* Technical Support */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          For technical assistance, contact the development team.
        </p>
      </div>
    </div>
  )
}
