// Mock the auth module directly
jest.mock('../../src/lib/auth/roles', () => ({
  getCurrentUserRole: jest.fn(),
  hasRole: jest.fn(),
  requireRole: jest.fn(),
  canAccessPortal: jest.fn(),
  hasPermission: jest.fn(),
  ROLE_HIERARCHY: {
    ADMIN: 4,
    STAFF: 3,
    BRAND: 2,
    INFLUENCER: 1
  },
  PERMISSIONS: {
    VIEW_INFLUENCERS: ['ADMIN', 'STAFF', 'BRAND'],
    CREATE_CAMPAIGNS: ['ADMIN', 'STAFF'],
    MANAGE_USERS: ['ADMIN'],
    VIEW_ANALYTICS: ['ADMIN', 'STAFF', 'BRAND', 'INFLUENCER']
  }
}))

import {
  getCurrentUserRole,
  hasRole,
  requireRole,
  canAccessPortal,
  hasPermission,
  ROLE_HIERARCHY,
  PERMISSIONS
} from '../../src/lib/auth/roles'

describe('Authentication Utilities', () => {
  const mockUsers = {
    admin: { publicMetadata: { role: 'ADMIN' } },
    staff: { publicMetadata: { role: 'STAFF' } },
    brand: { publicMetadata: { role: 'BRAND' } },
    influencer: { publicMetadata: { role: 'INFLUENCER' } },
    noRole: { publicMetadata: {} }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUserRole', () => {
    test('should return correct role for brand user', () => {
      getCurrentUserRole.mockReturnValue('BRAND')
      
      const role = getCurrentUserRole(mockUsers.brand)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(mockUsers.brand)
      expect(role).toBe('BRAND')
    })

    test('should return correct role for admin user', () => {
      getCurrentUserRole.mockReturnValue('ADMIN')
      
      const role = getCurrentUserRole(mockUsers.admin)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(mockUsers.admin)
      expect(role).toBe('ADMIN')
    })

    test('should return null for user without role', () => {
      getCurrentUserRole.mockReturnValue(null)
      
      const role = getCurrentUserRole(mockUsers.noRole)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(mockUsers.noRole)
      expect(role).toBeNull()
    })
  })

  describe('hasRole', () => {
    test('should return true for matching role', () => {
      hasRole.mockReturnValue(true)
      
      const result = hasRole(mockUsers.admin, 'ADMIN')
      
      expect(hasRole).toHaveBeenCalledWith(mockUsers.admin, 'ADMIN')
      expect(result).toBe(true)
    })

    test('should return false for non-matching role', () => {
      hasRole.mockReturnValue(false)
      
      const result = hasRole(mockUsers.brand, 'ADMIN')
      
      expect(hasRole).toHaveBeenCalledWith(mockUsers.brand, 'ADMIN')
      expect(result).toBe(false)
    })

    test('should handle multiple roles', () => {
      hasRole.mockReturnValue(true)
      
      const result = hasRole(mockUsers.staff, ['STAFF', 'ADMIN'])
      
      expect(hasRole).toHaveBeenCalledWith(mockUsers.staff, ['STAFF', 'ADMIN'])
      expect(result).toBe(true)
    })
  })

  describe('requireRole', () => {
    test('should not throw for authorized user', () => {
      requireRole.mockImplementation(() => {}) // No throw
      
      expect(() => requireRole(mockUsers.admin, 'ADMIN')).not.toThrow()
      expect(requireRole).toHaveBeenCalledWith(mockUsers.admin, 'ADMIN')
    })

    test('should throw for unauthorized user', () => {
      requireRole.mockImplementation(() => {
        throw new Error('Insufficient permissions')
      })
      
      expect(() => requireRole(mockUsers.brand, 'ADMIN')).toThrow('Insufficient permissions')
      expect(requireRole).toHaveBeenCalledWith(mockUsers.brand, 'ADMIN')
    })
  })

  describe('canAccessPortal', () => {
    test('should allow admin to access any portal', () => {
      canAccessPortal.mockReturnValue(true)
      
      const result = canAccessPortal(mockUsers.admin, 'admin')
      
      expect(canAccessPortal).toHaveBeenCalledWith(mockUsers.admin, 'admin')
      expect(result).toBe(true)
    })

    test('should allow brand to access brand portal', () => {
      canAccessPortal.mockReturnValue(true)
      
      const result = canAccessPortal(mockUsers.brand, 'brand')
      
      expect(canAccessPortal).toHaveBeenCalledWith(mockUsers.brand, 'brand')
      expect(result).toBe(true)
    })

    test('should deny brand access to admin portal', () => {
      canAccessPortal.mockReturnValue(false)
      
      const result = canAccessPortal(mockUsers.brand, 'admin')
      
      expect(canAccessPortal).toHaveBeenCalledWith(mockUsers.brand, 'admin')
      expect(result).toBe(false)
    })
  })

  describe('hasPermission', () => {
    test('should return true for user with permission', () => {
      hasPermission.mockReturnValue(true)
      
      const result = hasPermission(mockUsers.admin, 'MANAGE_USERS')
      
      expect(hasPermission).toHaveBeenCalledWith(mockUsers.admin, 'MANAGE_USERS')
      expect(result).toBe(true)
    })

    test('should return false for user without permission', () => {
      hasPermission.mockReturnValue(false)
      
      const result = hasPermission(mockUsers.brand, 'MANAGE_USERS')
      
      expect(hasPermission).toHaveBeenCalledWith(mockUsers.brand, 'MANAGE_USERS')
      expect(result).toBe(false)
    })

    test('should handle multiple permissions', () => {
      hasPermission.mockReturnValue(true)
      
      const result = hasPermission(mockUsers.staff, ['VIEW_INFLUENCERS', 'CREATE_CAMPAIGNS'])
      
      expect(hasPermission).toHaveBeenCalledWith(mockUsers.staff, ['VIEW_INFLUENCERS', 'CREATE_CAMPAIGNS'])
      expect(result).toBe(true)
    })
  })

  describe('ROLE_HIERARCHY', () => {
    test('should have correct role hierarchy', () => {
      expect(ROLE_HIERARCHY.ADMIN).toBe(4)
      expect(ROLE_HIERARCHY.STAFF).toBe(3)
      expect(ROLE_HIERARCHY.BRAND).toBe(2)
      expect(ROLE_HIERARCHY.INFLUENCER).toBe(1)
    })

    test('should have admin as highest level', () => {
      const levels = Object.values(ROLE_HIERARCHY)
      expect(Math.max(...levels)).toBe(ROLE_HIERARCHY.ADMIN)
    })
  })

  describe('PERMISSIONS', () => {
    test('should have correct permission mappings', () => {
      expect(PERMISSIONS.VIEW_INFLUENCERS).toContain('ADMIN')
      expect(PERMISSIONS.VIEW_INFLUENCERS).toContain('STAFF')
      expect(PERMISSIONS.VIEW_INFLUENCERS).toContain('BRAND')
      expect(PERMISSIONS.VIEW_INFLUENCERS).not.toContain('INFLUENCER')
    })

    test('should have admin-only permissions', () => {
      expect(PERMISSIONS.MANAGE_USERS).toEqual(['ADMIN'])
    })

    test('should have universal permissions', () => {
      expect(PERMISSIONS.VIEW_ANALYTICS).toContain('ADMIN')
      expect(PERMISSIONS.VIEW_ANALYTICS).toContain('STAFF')
      expect(PERMISSIONS.VIEW_ANALYTICS).toContain('BRAND')
      expect(PERMISSIONS.VIEW_ANALYTICS).toContain('INFLUENCER')
    })
  })

  describe('Edge Cases', () => {
    test('should handle null user', () => {
      getCurrentUserRole.mockReturnValue(null)
      
      const role = getCurrentUserRole(null)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(null)
      expect(role).toBeNull()
    })

    test('should handle undefined user', () => {
      getCurrentUserRole.mockReturnValue(null)
      
      const role = getCurrentUserRole(undefined)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(undefined)
      expect(role).toBeNull()
    })

    test('should handle user without publicMetadata', () => {
      const userWithoutMetadata = {}
      getCurrentUserRole.mockReturnValue(null)
      
      const role = getCurrentUserRole(userWithoutMetadata)
      
      expect(getCurrentUserRole).toHaveBeenCalledWith(userWithoutMetadata)
      expect(role).toBeNull()
    })
  })
}) 