'use client'

import React, { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { UserRole } from '../../lib/auth/roles'
import { useUserRole, useCanAccessPortal } from '../../lib/auth/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPortal?: 'brand' | 'influencer' | 'staff' | 'admin'
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPortal
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser()
  const userRole = useUserRole()
  const router = useRouter()
  const canAccessPortal = useCanAccessPortal(requiredPortal || 'brand')

  useEffect(() => {
    if (!isLoaded) return // Wait for Clerk to load
    
    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    // Check role-based access
    if (requiredRole && userRole !== requiredRole) {
      router.push('/unauthorized')
      return
    }

    // Check portal-based access
    if (requiredPortal && !canAccessPortal) {
      router.push('/unauthorized')
      return
    }

  }, [isLoaded, isSignedIn, userRole, requiredRole, requiredPortal, canAccessPortal, router])

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isSignedIn || (requiredRole && userRole !== requiredRole) || (requiredPortal && !canAccessPortal)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific portals
export function BrandProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="brand">
      {children}
    </ProtectedRoute>
  )
}

export function InfluencerProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="influencer">
      {children}
    </ProtectedRoute>
  )
}

export function StaffProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="staff">
      {children}
    </ProtectedRoute>
  )
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPortal="admin">
      {children}
    </ProtectedRoute>
  )
} 