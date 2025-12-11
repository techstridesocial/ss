/**
 * React Query Configuration
 * Centralized query client setup for API caching and state management
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create a new QueryClient instance with optimized defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests once
      retry: 1,
      
      // Don't refetch on window focus in production (can enable for dev)
      refetchOnWindowFocus: false,
      
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    }
  }
})

/**
 * Query key factories for consistent cache management
 */
export const queryKeys = {
  // Influencers
  influencers: {
    all: ['influencers'] as const,
    light: () => ['influencers', 'light'] as const,
    detail: (id: string) => ['influencers', 'detail', id] as const,
    analytics: (id: string, platform: string, username?: string) => ['influencers', 'analytics', id, platform, username || ''] as const,
  },
  
  // Brands
  brands: {
    all: ['brands'] as const,
    detail: (id: string) => ['brands', 'detail', id] as const,
    shortlists: (brandId: string) => ['brands', 'shortlists', brandId] as const,
  },
  
  // Campaigns
  campaigns: {
    all: ['campaigns'] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
    influencers: (campaignId: string) => ['campaigns', 'influencers', campaignId] as const,
  },
  
  // Quotations
  quotations: {
    all: ['quotations'] as const,
    detail: (id: string) => ['quotations', 'detail', id] as const,
    byBrand: (brandId: string) => ['quotations', 'brand', brandId] as const,
  },
  
  // Invoices
  invoices: {
    all: (status?: string) => ['invoices', { status }] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    summary: () => ['invoices', 'summary'] as const,
  },
  
  // Discovery
  discovery: {
    search: (platform: string, query: string, filters: any) => 
      ['discovery', 'search', platform, query, filters] as const,
    profile: (userId: string, platform: string) => 
      ['discovery', 'profile', userId, platform] as const,
  },
  
  // Staff
  staff: {
    all: ['staff', 'members'] as const,
    member: (id: string) => ['staff', 'member', id] as const,
  },
  
  // Credits
  credits: {
    balance: () => ['credits', 'balance'] as const,
  }
}

/**
 * Utility function to invalidate related queries
 * Useful after mutations to refresh dependent data
 */
export const invalidateQueries = {
  influencers: () => queryClient.invalidateQueries({ queryKey: queryKeys.influencers.all }),
  brands: () => queryClient.invalidateQueries({ queryKey: queryKeys.brands.all }),
  campaigns: () => queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all }),
  quotations: () => queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all }),
  invoices: () => queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all() }),
  credits: () => queryClient.invalidateQueries({ queryKey: queryKeys.credits.balance() }),
}

