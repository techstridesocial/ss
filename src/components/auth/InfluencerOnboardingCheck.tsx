'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface OnboardingStatus {
  is_onboarded: boolean
  loading: boolean
  error?: string
}

export function useInfluencerOnboardingCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<OnboardingStatus>({
    is_onboarded: true, // Default to true to avoid flashing
    loading: true
  })

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Wait for Clerk to fully load
      if (!isLoaded) {
        return
      }

      if (!user) {
        setStatus({ is_onboarded: true, loading: false })
        return
      }

      // Only check for influencer users
      const role = user.publicMetadata?.role as string
      if (!['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(role)) {
        setStatus({ is_onboarded: true, loading: false })
        return
      }

      try {
        const response = await fetch('/api/influencer/onboarding-status')
        if (response.ok) {
          const data = await response.json()
          
          // Set status first
          setStatus({
            is_onboarded: data.is_onboarded,
            loading: false
          })

          // Then handle redirect if needed
          if (!data.is_onboarded && !window.location.pathname.includes('/onboarding')) {
            // Use replace to avoid history stack issues
            router.replace('/influencer/onboarding')
          }
        } else {
          setStatus({ is_onboarded: true, loading: false })
        }
      } catch (error) {
        console.error('Failed to check influencer onboarding status:', error)
        setStatus({
          is_onboarded: true,
          loading: false,
          error: 'Failed to check onboarding status'
        })
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, router])

  return status
}

export default function InfluencerOnboardingCheck({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser()
  const status = useInfluencerOnboardingCheck()

  // Don't show loading if Clerk isn't loaded yet (ProtectedRoute handles this)
  if (!isLoaded) {
    return null
  }

  // Only show our loading state if we're actually checking onboarding
  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Setting up your creator portal...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 