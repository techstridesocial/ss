// Role-based authentication utilities for Stride Social Dashboard

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// User roles enum matching database schema
export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER_SIGNED = 'INFLUENCER_SIGNED', 
  INFLUENCER_PARTNERED = 'INFLUENCER_PARTNERED',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.BRAND]: 1,
  [UserRole.INFLUENCER_PARTNERED]: 2,
  [UserRole.INFLUENCER_SIGNED]: 3,
  [UserRole.STAFF]: 4,
  [UserRole.ADMIN]: 5
}

// Get current user's role from Clerk
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth()
  
  if (!sessionClaims) {
    return null
  }

  // Role should be stored in public metadata - accessing via publicMetadata
  const role = (sessionClaims as any)?.publicMetadata?.role as UserRole
  return role || null
}

// Check if user has required role or higher
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  
  if (!currentRole) {
    return false
  }

  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if user has exact role
export async function hasExactRole(role: UserRole): Promise<boolean> {
  const currentRole = await getCurrentUserRole()
  return currentRole === role
}

// Require authentication and redirect if not authenticated
export async function requireAuth(): Promise<void> {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
}

// Require specific role and redirect if insufficient permissions
export async function requireRole(requiredRole: UserRole): Promise<void> {
  await requireAuth()
  
  const hasPermission = await hasRole(requiredRole)
  
  if (!hasPermission) {
    redirect('/unauthorized')
  }
}

// Get user role redirect path based on role
export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
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