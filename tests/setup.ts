import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'test-user-id' }),
  clerkClient: () => ({
    users: {
      getUser: () => Promise.resolve({
        id: 'test-user-id',
        publicMetadata: { role: 'STAFF' },
      }),
    },
  }),
  clerkMiddleware: (handler) => handler,
  createRouteMatcher: () => () => false,
}))

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'test-user-id', emailAddresses: [{ emailAddress: 'test@example.com' }] },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: ({ children }) => children,
}))

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_123'
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_123'
