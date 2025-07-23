'use client'

import { useEffect, ReactNode } from 'react'
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
  const { isLoaded, isSignedIn } = useUser()
  const userRole = useUserRole()
  const router = useRouter()
  const canAccessPortal = useCanAccessPortal(requiredPortal || 'brand')

  useEffect(() => {
    if (!isLoaded) return // Wait for Clerk to load
    
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

    // Check portal-based access
    if (requiredPortal && !canAccessPortal) {
      router.replace('/unauthorized')
      return
    }

  }, [isLoaded, isSignedIn, userRole, requiredRole, requiredPortal, canAccessPortal, router])

  // Show minimal loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  // Show minimal loading while redirecting
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
  return (
    <ProtectedRoute requiredPortal="brand">
      {children}
    </ProtectedRoute>
  )
}

export function InfluencerProtectedRoute({ children }: { children: ReactNode }) {
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