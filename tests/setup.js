/**
 * Test Setup File
 * 
 * Global configuration and mocks for Jest tests
 */

// Global test setup for Jest
import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for Node test envs
import { TextEncoder, TextDecoder } from 'util'
// @ts-ignore
global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    pathname: '/brand/influencers',
    query: {},
    asPath: '/brand/influencers',
    route: '/brand/influencers'
  }),
  usePathname: () => '/brand/influencers',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => null,
  redirect: () => null
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      publicMetadata: { role: 'brand' }
    }
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn().mockResolvedValue('test-token')
  }),
  SignInButton: ({ children }) => <button>{children}</button>,
  SignUpButton: ({ children }) => <button>{children}</button>,
  UserButton: () => <div>User Menu</div>,
  ClerkProvider: ({ children }) => <div>{children}</div>,
  SignedIn: ({ children }) => <div>{children}</div>,
  SignedOut: ({ children }) => null,
  RedirectToSignIn: () => null
}))

// Mock fetch API with comprehensive responses
global.fetch = jest.fn((url) => {
  // Mock influencers API
  if (url.includes('/api/influencers')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        influencers: [
          {
            id: 1,
            name: 'Sarah Fashion',
            niche: 'fashion',
            platforms: ['instagram'],
            followers_count: 150000,
            engagement_rate: 4.2,
            average_views: 12000,
            location: 'US',
            profile_picture: '/profile1.jpg',
            verified: true
          },
          {
            id: 2,
            name: 'Mike Tech',
            niche: 'technology',
            platforms: ['youtube', 'instagram'],
            followers_count: 89000,
            engagement_rate: 3.8,
            average_views: 8500,
            location: 'UK',
            profile_picture: '/profile2.jpg',
            verified: false
          },
          {
            id: 3,
            name: 'Emma Beauty',
            niche: 'beauty',
            platforms: ['tiktok', 'instagram'],
            followers_count: 230000,
            engagement_rate: 5.1,
            average_views: 18000,
            location: 'CA',
            profile_picture: '/profile3.jpg',
            verified: true
          }
        ],
        total: 3,
        pages: 1
      })
    })
  }
  
  // Mock campaigns API
  if (url.includes('/api/campaigns')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        campaigns: [
          {
            id: 1,
            name: 'Summer Fashion Campaign',
            status: 'active',
            influencers_count: 5,
            budget: 10000
          }
        ]
      })
    })
  }
  
  // Mock quotations API
  if (url.includes('/api/quotations')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        quotation: { id: 1, status: 'pending' }
      })
    })
  }
  
  // Default successful response
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === 'hearted-influencers') {
      return JSON.stringify([])
    }
    return null
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock FileReader for file upload tests
global.FileReader = class {
  constructor() {
    this.readAsDataURL = jest.fn((file) => {
      this.result = 'data:image/png;base64,mock-base64-string'
      this.onload && this.onload()
    })
  }
}

// Mock window.URL for file handling
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock react components that might cause issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Heart: () => <span>♥</span>,
  HeartOff: () => <span>♡</span>,
  Search: () => <span>🔍</span>,
  Filter: () => <span>📊</span>,
  X: () => <span>✕</span>,
  ChevronDown: () => <span>▼</span>,
  Plus: () => <span>+</span>,
  Edit: () => <span>✏️</span>,
  Save: () => <span>💾</span>,
  Upload: () => <span>📤</span>,
  User: () => <span>👤</span>,
  Settings: () => <span>⚙️</span>,
  LogOut: () => <span>🚪</span>,
  Menu: () => <span>☰</span>
}))

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockImplementation((key) => {
    if (key === 'hearted-influencers') {
      return JSON.stringify([])
    }
    return null
  })
})

// Reset all mocks after each test
afterEach(() => {
  jest.restoreAllMocks()
}) 