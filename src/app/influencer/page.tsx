'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InfluencerProtectedRoute } from '../../components/auth/ProtectedRoute'
import { useInfluencerOnboardingCheck } from '../../components/auth/InfluencerOnboardingCheck'

function InfluencerRedirectContent() {
  const router = useRouter()
  const { is_onboarded, loading } = useInfluencerOnboardingCheck()

  useEffect(() => {
    if (!loading && is_onboarded) {
      router.replace('/influencer/campaigns')
    }
  }, [router, is_onboarded, loading])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          {loading ? 'Checking profile...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}

export default function InfluencerRedirect() {
  return (
    <InfluencerProtectedRoute>
      <InfluencerRedirectContent />
    </InfluencerProtectedRoute>
  )
} 