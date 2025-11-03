'use client'

import React, { useEffect, ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUserRole, useCanAccessPortal } from '../../lib/auth/hooks'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  requiredPortal?: 'brand' | 'influencer' | 'staff' | 'admin'
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPortal
}: ProtectedRouteProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const userRole = useUserRole()
  const router = useRouter()
  const canAccessPortal = useCanAccessPortal(requiredPortal || 'brand')
  const [roleLoading, setRoleLoading] = React.useState(true)

  // Check if role is still loading
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If we already have a role (from public metadata), don't wait at all
      if (userRole) {
        setRoleLoading(false)
        return
      }
      
      // For ALL users, check public metadata immediately to avoid access denied flash
      const userRoleFromMetadata = user?.publicMetadata?.role
      if (userRoleFromMetadata) {
        console.log('🔑 User role detected from metadata:', userRoleFromMetadata)
        setRoleLoading(false)
        return
      }
      
      // Only wait if no role in metadata (very rare case)
      const timer = setTimeout(() => {
        setRoleLoading(false)
      }, 50) // Minimal delay
      
      return () => clearTimeout(timer)
    } else {
      setRoleLoading(false)
    }
  }, [isLoaded, isSignedIn, userRole, user])

  useEffect(() => {
    if (!isLoaded || roleLoading) return // Wait for Clerk and role to load
    
    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    // Check role-based access
    if (requiredRole && userRole !== requiredRole) {
      router.replace('/unauthorized')
      return
    }

    // Check portal-based access, but allow onboarding pages for users without roles
    if (requiredPortal && !canAccessPortal && !window.location.pathname.includes('/onboarding')) {
      router.replace('/unauthorized')
      return
    }

  }, [isLoaded, isSignedIn, userRole, requiredRole, requiredPortal, canAccessPortal, router, roleLoading])

  // Show loading state while Clerk is initializing or role is loading
  if (!isLoaded || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn || (requiredRole && userRole !== requiredRole) || (requiredPortal && !canAccessPortal)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Specific protected route components for each portal
export function BrandProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [onboardingStatus, setOnboardingStatus] = useState<{
    is_onboarded: boolean
    loading: boolean
    error?: string
  }>({
    is_onboarded: true, // Default to true to avoid flashing
    loading: true
  })

  // Check onboarding status for brands
  useEffect(() => {
    async function checkOnboardingStatus() {
      // Wait for Clerk to fully load
      if (!isLoaded) {
        return
      }

      if (!user) {
        setOnboardingStatus({ is_onboarded: true, loading: false })
        return
      }

      // Only check for brand users or users without a role (new signups)
      const role = user.publicMetadata?.role as string
      if (role && role !== 'BRAND') {
        setOnboardingStatus({ is_onboarded: true, loading: false })
        return
      }

      try {
        const response = await fetch('/api/onboarding-status')
        if (response.ok) {
          const data = await response.json()
          
          // Set status first
          setOnboardingStatus({
            is_onboarded: data.is_onboarded,
            loading: false
          })

          // Then handle redirect if needed
          if (!data.is_onboarded && !window.location.pathname.includes('/onboarding')) {
            // Use replace to avoid history stack issues
            router.replace('/brand/onboarding')
          }
        } else if (response.status === 404) {
          // User doesn't exist in database yet (new signup) - allow onboarding
          setOnboardingStatus({ 
            is_onboarded: false, 
            loading: false 
          })
        } else {
          setOnboardingStatus({ is_onboarded: true, loading: false })
        }
      } catch (_error) {
        console.error('Failed to check brand onboarding status:', error)
        // For new users, assume they need onboarding
        setOnboardingStatus({
          is_onboarded: false,
          loading: false,
          error: 'Failed to check onboarding status'
        })
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, router])

  // Show loading while checking onboarding
  if (onboardingStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  // Show loading while redirecting to onboarding (but not if already on onboarding page)
  if (!onboardingStatus.is_onboarded && !window.location.pathname.includes('/onboarding')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPortal="brand">
      {children}
    </ProtectedRoute>
  )
}

export function InfluencerProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [onboardingStatus, setOnboardingStatus] = useState<{
    is_onboarded: boolean
    loading: boolean
    error?: string
  }>({
    is_onboarded: true, // Default to true to avoid flashing
    loading: true
  })

  // Check onboarding status for influencers
  useEffect(() => {
    async function checkOnboardingStatus() {
      // Wait for Clerk to fully load
      if (!isLoaded) {
        return
      }

      if (!user) {
        setOnboardingStatus({ is_onboarded: true, loading: false })
        return
      }

      // Only check for influencer users or users without a role (new signups)
      const role = user.publicMetadata?.role as string
      if (role && !['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(role)) {
        setOnboardingStatus({ is_onboarded: true, loading: false })
        return
      }

      try {
        const response = await fetch('/api/onboarding-status')
        if (response.ok) {
          const data = await response.json()
          
          // Set status first
          setOnboardingStatus({
            is_onboarded: data.is_onboarded,
            loading: false
          })

          // Then handle redirect if needed
          if (!data.is_onboarded && !window.location.pathname.includes('/onboarding')) {
            // Use replace to avoid history stack issues
            router.replace('/influencer/onboarding')
          }
        } else if (response.status === 404) {
          // User doesn't exist in database yet (new signup) - allow onboarding
          setOnboardingStatus({ 
            is_onboarded: false, 
            loading: false 
          })
        } else {
          setOnboardingStatus({ is_onboarded: true, loading: false })
        }
      } catch (_error) {
        console.error('Failed to check influencer onboarding status:', error)
        // For new users, assume they need onboarding
        setOnboardingStatus({
          is_onboarded: false,
          loading: false,
          error: 'Failed to check onboarding status'
        })
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, router])

  // Show loading while checking onboarding
  if (onboardingStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  // Show loading while redirecting to onboarding (but not if already on onboarding page)
  if (!onboardingStatus.is_onboarded && !window.location.pathname.includes('/onboarding')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPortal="influencer">
      {children}
    </ProtectedRoute>
  )
}

export function StaffProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="staff">
      {children}
    </ProtectedRoute>
  )
}

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="admin">
      {children}
    </ProtectedRoute>
  )
} 