// Role-based authentication utilities for Stride Social Dashboard

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRole, ROLE_HIERARCHY, getRoleRedirectPath } from './types'

// Get current user's role from Clerk
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth()
  
  if (!sessionClaims) {
    return null
  }

  // Role should be stored in public metadata - accessing via publicMetadata
  const role = (sessionClaims as { publicMetadata?: { role?: UserRole } })?.publicMetadata?.role as UserRole
  return role || null
}

// Check if user has required role or higher (server-side)
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole) {
    return false
  }

  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if user has exact role (server-side)
export async function hasExactRole(role: UserRole): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  return currentRole === role
}

// Require authentication and redirect if not logged in
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return userId
}

// Require specific role and redirect if unauthorized
export async function requireRole(requiredRole: UserRole): Promise<UserRole> {
  await requireAuth()
  
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole) {
    redirect('/sign-in')
  }
  
  if (!await hasRole(requiredRole)) {
    redirect('/unauthorized')
  }
  
  return currentRole
}

// Require exact role and redirect if unauthorized
export async function requireExactRole(role: UserRole): Promise<UserRole> {
  await requireAuth()
  
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole || currentRole !== role) {
    redirect('/unauthorized')
  }
  
  return currentRole
}

// Require staff or admin access
export async function requireStaffAccess(): Promise<UserRole> {
  const currentRole = await requireRole(UserRole.STAFF)
  
  if (currentRole !== UserRole.STAFF && currentRole !== UserRole.ADMIN) {
    redirect('/unauthorized')
  }
  
  return currentRole
}

// Require admin access
export async function requireAdminAccess(): Promise<UserRole> {
  return await requireExactRole(UserRole.ADMIN)
}

// Get redirect path for current user (server-side)
export async function getCurrentUserRedirectPath(): Promise<string> {
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole) {
    return '/sign-in'
  }
  
  return getRoleRedirectPath(currentRole)
}

// Re-export for convenience
export { UserRole, getRoleRedirectPath } from './types'

// Check if user can access specific portal
export async function canAccessPortal(portal: 'brand' | 'influencer' | 'staff' | 'admin'): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  
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

// Role-based permissions for specific actions
export const PERMISSIONS = {
  // User management
  CREATE_USERS: [UserRole.STAFF, UserRole.ADMIN],
  EDIT_ALL_USERS: [UserRole.ADMIN],
  DELETE_USERS: [UserRole.ADMIN],
  
  // Influencer management
  VIEW_ALL_INFLUENCERS: [UserRole.BRAND, UserRole.STAFF, UserRole.ADMIN],
  EDIT_INFLUENCER_TAGS: [UserRole.STAFF, UserRole.ADMIN],
  SCRAPE_INFLUENCERS: [UserRole.STAFF, UserRole.ADMIN],
  
  // Campaign management
  CREATE_CAMPAIGNS: [UserRole.STAFF, UserRole.ADMIN],
  ASSIGN_CAMPAIGNS: [UserRole.STAFF, UserRole.ADMIN],
  VIEW_ALL_CAMPAIGNS: [UserRole.STAFF, UserRole.ADMIN],
  
  // Financial data
  VIEW_FINANCIAL_DATA: [UserRole.STAFF, UserRole.ADMIN],
  EDIT_FINANCIAL_DATA: [UserRole.ADMIN],
  
  // System settings
  MANAGE_SYSTEM_SETTINGS: [UserRole.ADMIN],
  VIEW_AUDIT_LOGS: [UserRole.ADMIN],
  MANAGE_OAUTH_TOKENS: [UserRole.ADMIN]
}

// Check if current user has specific permission
export async function hasPermission(permission: keyof typeof PERMISSIONS): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole) {
    return false
  }

  return (PERMISSIONS[permission] as UserRole[]).includes(currentRole)
} 