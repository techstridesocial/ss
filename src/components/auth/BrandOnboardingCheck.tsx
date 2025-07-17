'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

interface OnboardingStatus {
  is_onboarded: boolean
  loading: boolean
  error?: string
}

export function useBrandOnboardingCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<OnboardingStatus>({
    is_onboarded: true, // Default to true to avoid flashing
    loading: true
  })

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!isLoaded || !user) {
        setStatus({ is_onboarded: true, loading: false })
        return
      }

      // Only check for brand users
      const role = user.publicMetadata?.role as string
      if (role !== 'BRAND') {
        setStatus({ is_onboarded: true, loading: false })
        return
      }

      try {
        const response = await fetch('/api/brand/onboarding-status')
        if (response.ok) {
          const data = await response.json()
          setStatus({
            is_onboarded: data.is_onboarded,
            loading: false
          })

          // Redirect to onboarding if not completed
          if (!data.is_onboarded && !window.location.pathname.includes('/onboarding')) {
            router.push('/brand/onboarding')
          }
        } else {
          setStatus({ is_onboarded: true, loading: false })
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
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

export default function BrandOnboardingCheck({ children }: { children: React.ReactNode }) {
  const status = useBrandOnboardingCheck()

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
} 