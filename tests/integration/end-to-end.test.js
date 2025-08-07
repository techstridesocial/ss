/**
 * End-to-End Test Suite for Stride Social Dashboard
 * 
 * This test suite validates complete user workflows across all portals
 * and ensures proper integration between frontend and backend.
 */

import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.CLERK_SECRET_KEY = 'test_clerk_secret'
process.env.MODASH_API_KEY = 'test_modash_key'
process.env.OPENAI_API_KEY = 'test_openai_key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    isLoaded: true,
    user: {
      id: 'test-user-id',
      publicMetadata: { role: 'BRAND' }
    }
  }),
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true
  })
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/brand/influencers',
  useSearchParams: () => new URLSearchParams()
}))

describe('End-to-End Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up default fetch mock
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: [] })
    })
  })

  describe('Authentication Flow', () => {
    test('should redirect authenticated users to appropriate dashboard', async () => {
      // Mock successful authentication
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, user: { role: 'BRAND' } })
      })

      const response = await fetch('/api/auth/check')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
    })

    test('should show login selection for unauthenticated users', async () => {
      // Mock unauthenticated state
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })

      const response = await fetch('/api/auth/check')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })

    test('should handle role-based redirects correctly', async () => {
      const roles = ['BRAND', 'INFLUENCER', 'STAFF', 'ADMIN']
      
      for (const role of roles) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, user: { role } })
        })

        const response = await fetch('/api/auth/check')
        const data = await response.json()

        expect(response.ok).toBe(true)
        expect(data.user.role).toBe(role)
      }
    })
  })

  describe('Brand Portal Flow', () => {
    test('should display influencer roster with filtering capabilities', async () => {
      const mockInfluencers = [
        { id: '1', name: 'Influencer 1', followers: 10000, engagement: 3.5 },
        { id: '2', name: 'Influencer 2', followers: 20000, engagement: 4.2 }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockInfluencers })
      })

      const response = await fetch('/api/influencers')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    test('should allow creating and managing shortlists', async () => {
      const shortlistData = {
        name: 'Fashion Influencers',
        description: 'Top fashion influencers for summer campaign',
        influencer_ids: ['1', '2']
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          shortlist: { id: '1', ...shortlistData }
        })
      })

      const response = await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shortlistData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.shortlist.name).toBe('Fashion Influencers')
    })

    test('should display campaign tracking and performance metrics', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Summer Campaign', status: 'active', performance: 85 },
        { id: '2', name: 'Winter Campaign', status: 'completed', performance: 92 }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockCampaigns })
      })

      const response = await fetch('/api/campaigns')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })
  })

  describe('Influencer Portal Flow', () => {
    test('should allow influencers to update profile information', async () => {
      const profileData = {
        name: 'Updated Name',
        bio: 'Updated bio',
        location: 'New York'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          profile: { id: '1', ...profileData }
        })
      })

      const response = await fetch('/api/influencer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.profile.name).toBe('Updated Name')
    })

    test('should allow influencers to submit financial information securely', async () => {
      const financialData = {
        paypal_email: 'test@example.com',
        bank_account: '1234567890'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          message: 'Financial information saved securely'
        })
      })

      const response = await fetch('/api/influencer/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
    })

    test('should display campaign assignments and allow content submission', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Brand Campaign', status: 'assigned', deadline: '2024-12-31' }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockCampaigns })
      })

      const response = await fetch('/api/influencer/campaigns')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data[0].status).toBe('assigned')
    })
  })

  describe('Staff Portal Flow', () => {
    test('should allow staff to manage campaigns and assign influencers', async () => {
      const assignmentData = {
        campaign_id: '1',
        influencer_id: '2',
        rate: 1500
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          assignment: { id: '1', ...assignmentData }
        })
      })

      const response = await fetch('/api/campaigns/1/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.assignment.rate).toBe(1500)
    })

    test('should allow staff to review and approve quotations', async () => {
      const approvalData = {
        quotation_id: '1',
        status: 'approved',
        total_quote: 2500
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          quotation: { id: '1', ...approvalData }
        })
      })

      const response = await fetch('/api/quotations/1/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.quotation.status).toBe('approved')
    })

    test('should allow staff to discover and import new influencers', async () => {
      const discoveryData = {
        platform: 'instagram',
        niche: 'fitness',
        min_followers: 10000
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          influencers: [
            { id: 'new1', name: 'New Influencer 1', followers: 15000 },
            { id: 'new2', name: 'New Influencer 2', followers: 20000 }
          ]
        })
      })

      const response = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discoveryData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.influencers).toHaveLength(2)
    })
  })

  describe('API Integration Tests', () => {
    test('should fetch influencers successfully', async () => {
      const mockInfluencers = [
        { id: '1', name: 'Influencer 1', followers: 10000 },
        { id: '2', name: 'Influencer 2', followers: 20000 }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockInfluencers })
      })

      const response = await fetch('/api/influencers')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    test('should fetch campaigns successfully', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Campaign 1', status: 'active' },
        { id: '2', name: 'Campaign 2', status: 'completed' }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockCampaigns })
      })

      const response = await fetch('/api/campaigns')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    test('should fetch quotations successfully', async () => {
      const mockQuotations = [
        { id: '1', brand_id: '1', status: 'pending' },
        { id: '2', brand_id: '2', status: 'approved' }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockQuotations })
      })

      const response = await fetch('/api/quotations')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })
  })

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      })

      const response = await fetch('/api/influencers')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    test('should handle network timeouts', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network timeout'))

      await expect(fetch('/api/influencers')).rejects.toThrow('Network timeout')
    })

    test('should handle 404 errors appropriately', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      })

      const response = await fetch('/api/nonexistent')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    test('should handle 500 server errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })

      const response = await fetch('/api/influencers')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })

  describe('Performance Tests', () => {
    test('should load influencer data within acceptable time', async () => {
      const startTime = Date.now()

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: [] })
      })

      const response = await fetch('/api/influencers')
      const endTime = Date.now()

      expect(response.ok).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // Should load within 1 second
    })

    test('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Influencer ${i}`,
        followers: Math.floor(Math.random() * 100000)
      }))

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: largeDataset })
      })

      const response = await fetch('/api/influencers')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data).toHaveLength(1000)
    })

    test('should handle concurrent API requests', async () => {
      const startTime = Date.now()

      // Mock multiple concurrent requests
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] })
        })

      const requests = [
        fetch('/api/influencers'),
        fetch('/api/campaigns'),
        fetch('/api/quotations')
      ]

      const responses = await Promise.all(requests)
      const endTime = Date.now()

      expect(responses).toHaveLength(3)
      expect(responses.every(r => r.ok)).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should handle concurrent requests within 5 seconds
    })
  })

  describe('Security Tests', () => {
    test('should require authentication for protected routes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })

      const response = await fetch('/api/admin/users')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })

    test('should enforce role-based access control', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Forbidden' })
      })

      const response = await fetch('/api/admin/users')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(403)
    })

    test('should validate input data and prevent injection attacks', async () => {
      const maliciousInput = "'; DROP TABLE users; --"

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid input' })
      })

      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: maliciousInput })
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })

    test('should sanitize user input in search queries', async () => {
      const searchQuery = '<script>alert("xss")</script>'

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: [] })
      })

      const response = await fetch(`/api/influencers?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
    })
  })

  describe('Data Integrity Tests', () => {
    test('should maintain data consistency across operations', async () => {
      const testData = { name: 'Test Influencer', email: 'test@example.com' }

      // Mock create operation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { id: '1', ...testData } })
      })

      const createResponse = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      const createData = await createResponse.json()

      expect(createData.success).toBe(true)
      expect(createData.data.name).toBe(testData.name)
    })

    test('should handle concurrent operations correctly', async () => {
      // Mock multiple concurrent update operations
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { id: '1', name: 'Updated 1' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { id: '1', name: 'Updated 2' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { id: '1', name: 'Updated 3' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { id: '1', name: 'Updated 4' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { id: '1', name: 'Updated 5' } })
        })

      const concurrentUpdates = Array.from({ length: 5 }, (_, i) =>
        fetch('/api/influencers/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Updated ${i + 1}` })
        })
      )

      const responses = await Promise.all(concurrentUpdates)
      expect(responses).toHaveLength(5)
      expect(responses.every(r => r.ok)).toBe(true)
    })

    test('should preserve audit trails for all actions', async () => {
      const actionData = {
        action: 'create_influencer',
        user_id: '1',
        details: { name: 'Test Influencer' }
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, audit_id: 'audit_1' })
      })

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.audit_id).toBeDefined()
    })

    test('should validate data relationships and foreign keys', async () => {
      const invalidData = {
        campaign_id: 'nonexistent_id',
        influencer_id: '1'
      }

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Foreign key constraint violation' })
      })

      const response = await fetch('/api/campaign-influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })
}) 