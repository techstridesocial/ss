// Shared authentication types for both client and server components

// User roles enum matching database schema
export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER_SIGNED = 'INFLUENCER_SIGNED', 
  INFLUENCER_PARTNERED = 'INFLUENCER_PARTNERED',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.BRAND]: 1,
  [UserRole.INFLUENCER_PARTNERED]: 2,
  [UserRole.INFLUENCER_SIGNED]: 3,
  [UserRole.STAFF]: 4,
  [UserRole.ADMIN]: 5
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

// Get redirect path for role
export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case UserRole.BRAND:
      return '/brand/influencers'
    case UserRole.INFLUENCER_SIGNED:
    case UserRole.INFLUENCER_PARTNERED:
      return '/influencer/campaigns'
    case UserRole.STAFF:
      return '/staff/roster'
    case UserRole.ADMIN:
      return '/admin'
    default:
      return '/sign-in'
  }
} 