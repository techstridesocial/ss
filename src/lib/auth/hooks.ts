'use client'

// Client-side authentication hooks for React components

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole, ROLE_HIERARCHY, ROLE_DISPLAY_NAMES, getRoleDisplayName, getRoleRedirectPath } from './types'

// Get current user's role on client side
export function useUserRole(): UserRole | null {
  const { user } = useUser()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setLoading(false)
        return
      }

      // For staff/admin users, check publicMetadata first since they might not be in database yet
      const metadataRole = user.publicMetadata?.role as UserRole
      if (metadataRole === 'STAFF' || metadataRole === 'ADMIN') {
        console.log('🔑 Staff/Admin user detected, using publicMetadata role:', metadataRole)
        setRole(metadataRole)
        setLoading(false)
        return
      }

      try {
        // Try to get role from database instead of publicMetadata
        const response = await fetch('/api/auth/current-user')
        if (response.ok) {
          const data = await response.json()
          setRole(data.role)
        } else if (response.status === 404) {
          // User doesn't exist in database yet (new signup) - use publicMetadata or null
          setRole(metadataRole || null)
        } else {
          // Other errors - fallback to publicMetadata
          setRole(metadataRole || null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        // Fallback to publicMetadata
        setRole(metadataRole || null)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [user])

  return role
}

// Check if user has specific role on client side
export function useHasRole(requiredRole: UserRole): boolean {
  const currentRole = useUserRole()
  
  if (!currentRole) {
    return false
  }

  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if user has exact role on client side
export function useHasExactRole(role: UserRole): boolean {
  const currentRole = useUserRole()
  return currentRole === role
}

// Check if user can access specific portal on client side
export function useCanAccessPortal(portal: 'brand' | 'influencer' | 'staff' | 'admin'): boolean {
  const currentRole = useUserRole()
  
  if (!currentRole) {
    return false
  }

  switch (portal) {
    case 'brand':
      return currentRole === UserRole.BRAND
    case 'influencer':
      return currentRole === UserRole.INFLUENCER_SIGNED || currentRole === UserRole.INFLUENCER_PARTNERED
    case 'staff':
      return currentRole === UserRole.STAFF || currentRole === UserRole.ADMIN
    case 'admin':
      return currentRole === UserRole.ADMIN
    default:
      return false
  }
}

// Get redirect path for current user
export function useUserRedirectPath(): string {
  const currentRole = useUserRole()
  
  if (!currentRole) {
    return '/sign-in'
  }

  return getRoleRedirectPath(currentRole)
}

// Export for convenience
export { getRoleDisplayName, ROLE_DISPLAY_NAMES } 