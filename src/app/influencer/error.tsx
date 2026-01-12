'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft, Heart } from 'lucide-react'

export default function InfluencerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Influencer portal error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center border border-white/50">
        {/* Error Icon with Gradient */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We hit a small bump, but your profile and campaigns are all safe!
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-gray-50/80 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-mono text-gray-500 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/influencer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>

        {/* Encouragement */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Your content is making an impact</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
