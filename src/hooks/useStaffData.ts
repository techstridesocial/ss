/**
 * React Query hooks for staff dashboard data
 * Provides caching to prevent slow page loads between navigation
 */

import { useQuery } from '@tanstack/react-query'

// Query keys for staff data
export const staffQueryKeys = {
  roster: ['staff', 'roster'] as const,
  campaigns: ['staff', 'campaigns'] as const,
  invoices: (status?: string) => ['staff', 'invoices', status || 'all'] as const,
  contentReview: (status?: string) => ['staff', 'content-review', status || 'all'] as const,
  quotations: ['staff', 'quotations'] as const,
  brands: ['staff', 'brands'] as const,
  profile: ['staff', 'profile'] as const,
  submissions: ['staff', 'submissions'] as const,
  finances: ['staff', 'finances'] as const,
  staffMembers: ['staff', 'members'] as const,
}

// Fetcher functions
async function fetchRoster() {
  const response = await fetch('/api/roster')
  if (!response.ok) throw new Error('Failed to fetch roster')
  return response.json()
}

async function fetchCampaigns() {
  const response = await fetch('/api/campaigns')
  if (!response.ok) throw new Error('Failed to fetch campaigns')
  return response.json()
}

async function fetchInvoices(status?: string) {
  const params = new URLSearchParams()
  if (status && status !== 'all') {
    params.append('status', status)
  }
  const response = await fetch(`/api/staff/invoices?${params}`)
  if (!response.ok) throw new Error('Failed to fetch invoices')
  return response.json()
}

async function fetchContentReview(status?: string) {
  const params = new URLSearchParams()
  if (status && status !== 'all') {
    params.append('status', status)
  }
  const response = await fetch(`/api/staff/content-submissions?${params}`)
  if (!response.ok) throw new Error('Failed to fetch content submissions')
  return response.json()
}

async function fetchQuotations() {
  const response = await fetch('/api/quotations')
  if (!response.ok) throw new Error('Failed to fetch quotations')
  return response.json()
}

async function fetchBrands() {
  const response = await fetch('/api/brands')
  if (!response.ok) throw new Error('Failed to fetch brands')
  return response.json()
}

async function fetchStaffProfile() {
  const response = await fetch('/api/staff/profile')
  if (!response.ok) throw new Error('Failed to fetch profile')
  return response.json()
}

async function fetchSubmissions() {
  const response = await fetch('/api/staff/submissions')
  if (!response.ok) throw new Error('Failed to fetch submissions')
  return response.json()
}

async function fetchFinances() {
  const response = await fetch('/api/staff/invoices')
  if (!response.ok) throw new Error('Failed to fetch finances')
  return response.json()
}

async function fetchStaffMembers() {
  const response = await fetch('/api/staff/members')
  if (!response.ok) throw new Error('Failed to fetch staff members')
  return response.json()
}

/**
 * Hook for fetching roster data
 * Data is cached for 5 minutes and shown instantly on navigation
 */
export function useStaffRoster() {
  return useQuery({
    queryKey: staffQueryKeys.roster,
    queryFn: fetchRoster,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook for fetching campaigns
 */
export function useStaffCampaigns() {
  return useQuery({
    queryKey: staffQueryKeys.campaigns,
    queryFn: fetchCampaigns,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching invoices
 */
export function useStaffInvoices(status?: string) {
  return useQuery({
    queryKey: staffQueryKeys.invoices(status),
    queryFn: () => fetchInvoices(status),
    staleTime: 3 * 60 * 1000, // 3 minutes (invoices update more frequently)
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching content submissions for review
 */
export function useStaffContentReview(status?: string) {
  return useQuery({
    queryKey: staffQueryKeys.contentReview(status),
    queryFn: () => fetchContentReview(status),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching quotations
 */
export function useStaffQuotations() {
  return useQuery({
    queryKey: staffQueryKeys.quotations,
    queryFn: fetchQuotations,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching brands
 */
export function useStaffBrands() {
  return useQuery({
    queryKey: staffQueryKeys.brands,
    queryFn: fetchBrands,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching staff profile
 */
export function useStaffProfile() {
  return useQuery({
    queryKey: staffQueryKeys.profile,
    queryFn: fetchStaffProfile,
    staleTime: 10 * 60 * 1000, // Profile changes infrequently
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * Hook for fetching submissions
 */
export function useStaffSubmissions() {
  return useQuery({
    queryKey: staffQueryKeys.submissions,
    queryFn: fetchSubmissions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching finances
 */
export function useStaffFinances() {
  return useQuery({
    queryKey: staffQueryKeys.finances,
    queryFn: fetchFinances,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching staff members
 */
export function useStaffMembers() {
  return useQuery({
    queryKey: staffQueryKeys.staffMembers,
    queryFn: fetchStaffMembers,
    staleTime: 10 * 60 * 1000, // Staff members change infrequently
    gcTime: 15 * 60 * 1000,
  })
}
