'use client'

// Client-side authentication hooks for React components

import { useUser } from '@clerk/nextjs'
import { UserRole } from './roles'

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

  const ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.BRAND]: 1,
    [UserRole.INFLUENCER_PARTNERED]: 2,
    [UserRole.INFLUENCER_SIGNED]: 3,
    [UserRole.STAFF]: 4,
    [UserRole.ADMIN]: 5
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

  switch (currentRole) {
    case UserRole.BRAND:
      return '/brand'
    case UserRole.INFLUENCER_SIGNED:
    case UserRole.INFLUENCER_PARTNERED:
      return '/influencer'
    case UserRole.STAFF:
      return '/staff'
    case UserRole.ADMIN:
      return '/admin'
    default:
      return '/sign-in'
  }
}

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.BRAND]: 'Brand',
  [UserRole.INFLUENCER_SIGNED]: 'Influencer (Signed)',
  [UserRole.INFLUENCER_PARTNERED]: 'Influencer (Partnered)',
  [UserRole.STAFF]: 'Staff',
  [UserRole.ADMIN]: 'Admin'
}

// Get display name for role
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role]
} 