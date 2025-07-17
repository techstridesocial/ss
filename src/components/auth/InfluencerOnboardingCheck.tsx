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
      if (!isLoaded || !user) {
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
          setStatus({
            is_onboarded: data.is_onboarded,
            loading: false
          })

          // Redirect to onboarding if not completed
          if (!data.is_onboarded && !window.location.pathname.includes('/onboarding')) {
            router.push('/influencer/onboarding')
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