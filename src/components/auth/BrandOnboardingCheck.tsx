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
    is_onboarded: false, // Default to false to be safe
    loading: true
  })

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Wait for Clerk to fully load
      if (!isLoaded) {
        return
      }

      if (!user) {
        setStatus({ is_onboarded: false, loading: false })
        return
      }

      // Only check for brand users
      const role = user.publicMetadata?.role as string
      if (role !== 'BRAND') {
        setStatus({ is_onboarded: true, loading: false })
        return
      }

      // Add a small delay to ensure authentication is fully established
      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        const response = await fetch('/api/brand/onboarding-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies for authentication
        })
        
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
            router.replace('/brand/onboarding')
          }
        } else if (response.status === 401) {
          // User is not authenticated - this is expected during loading
          console.log('User not authenticated yet, waiting for Clerk to load...')
          setStatus({ 
            is_onboarded: false, 
            loading: true // Keep loading until user is authenticated
          })
          
          // Retry after a short delay
          setTimeout(() => {
            if (user && isLoaded) {
              checkOnboardingStatus()
            }
          }, 1000)
        } else {
          // Handle other API errors - don't assume user is onboarded
          console.error('API error:', response.status, response.statusText)
          setStatus({ 
            is_onboarded: false, 
            loading: false,
            error: `API error: ${response.status}`
          })
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        setStatus({
          is_onboarded: false, // Default to false on error
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
  const { isLoaded } = useUser()
  const status = useBrandOnboardingCheck()

  // Don't show loading if Clerk isn't loaded yet (ProtectedRoute handles this)
  if (!isLoaded) {
    return null
  }

  // Only show our loading state if we're actually checking onboarding
  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Setting up your dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 