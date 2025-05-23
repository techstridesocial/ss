'use client'

// Client-side authentication hooks for React components

import { useUser } from '@clerk/nextjs'
import { UserRole, ROLE_HIERARCHY, ROLE_DISPLAY_NAMES, getRoleDisplayName, getRoleRedirectPath } from './types'

// Get current user's role on client side
export function useUserRole(): UserRole | null {
  const { user } = useUser()
  
  if (!user) {
    return null
  }

  // Role stored in public metadata
  const role = user.publicMetadata?.role as UserRole
  return role || null
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