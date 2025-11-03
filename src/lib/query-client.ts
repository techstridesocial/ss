import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for most queries
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Refetch on mount if data is stale
      refetchOnMount: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// Query keys for consistent cache management
export const queryKeys = {
  influencers: {
    all: ['influencers'] as const,
    list: (filters?: Record<string, any>) => ['influencers', 'list', filters] as const,
    detail: (id: string) => ['influencers', 'detail', id] as const,
    light: () => ['influencers', 'light'] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    list: (filters?: Record<string, any>) => ['campaigns', 'list', filters] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
    influencers: (id: string) => ['campaigns', id, 'influencers'] as const,
  },
  stats: {
    influencer: (id?: string) => ['stats', 'influencer', id] as const,
  },
  credits: {
    usage: () => ['credits', 'usage'] as const,
  },
  discovery: {
    search: (params: Record<string, any>) => ['discovery', 'search', params] as const,
    profile: (userId: string, platform: string) => ['discovery', 'profile', userId, platform] as const,
  },
  shortlists: {
    all: ['shortlists'] as const,
    list: () => ['shortlists', 'list'] as const,
    detail: (id: string) => ['shortlists', 'detail', id] as const,
  },
  quotations: {
    all: ['quotations'] as const,
    list: () => ['quotations', 'list'] as const,
    detail: (id: string) => ['quotations', 'detail', id] as const,
  },
}

