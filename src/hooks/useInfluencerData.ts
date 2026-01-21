/**
 * React Query hooks for influencer dashboard data
 * Provides caching to prevent slow page loads between navigation
 */

import { useQuery } from '@tanstack/react-query'

// Query keys for influencer data
export const influencerQueryKeys = {
  campaigns: ['influencer', 'campaigns'] as const,
  invitations: ['influencer', 'invitations'] as const,
  stats: ['influencer', 'stats'] as const,
  payments: ['influencer', 'payments'] as const,
  invoices: ['influencer', 'invoices'] as const,
  profile: ['influencer', 'profile'] as const,
}

// Fetcher functions
async function fetchCampaigns() {
  const response = await fetch('/api/influencer/campaigns')
  if (!response.ok) throw new Error('Failed to fetch campaigns')
  return response.json()
}

async function fetchInvitations() {
  const response = await fetch('/api/influencer/invitations')
  if (!response.ok) throw new Error('Failed to fetch invitations')
  return response.json()
}

async function fetchStats() {
  const response = await fetch('/api/influencer/stats')
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

async function fetchPayments() {
  const response = await fetch('/api/influencer/payments')
  if (!response.ok) throw new Error('Failed to fetch payments')
  return response.json()
}

async function fetchInvoices() {
  const response = await fetch('/api/influencer/invoices')
  if (!response.ok) throw new Error('Failed to fetch invoices')
  return response.json()
}

async function fetchProfile() {
  const response = await fetch('/api/influencer/profile')
  if (!response.ok) throw new Error('Failed to fetch profile')
  return response.json()
}

/**
 * Hook for fetching influencer campaigns
 * Data is cached for 5 minutes and shown instantly on navigation
 */
export function useInfluencerCampaigns() {
  return useQuery({
    queryKey: influencerQueryKeys.campaigns,
    queryFn: fetchCampaigns,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook for fetching influencer invitations
 */
export function useInfluencerInvitations() {
  return useQuery({
    queryKey: influencerQueryKeys.invitations,
    queryFn: fetchInvitations,
    staleTime: 2 * 60 * 1000, // 2 minutes (invitations change more frequently)
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching influencer stats
 */
export function useInfluencerStats() {
  return useQuery({
    queryKey: influencerQueryKeys.stats,
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching payment data
 */
export function useInfluencerPayments() {
  return useQuery({
    queryKey: influencerQueryKeys.payments,
    queryFn: fetchPayments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching invoices
 */
export function useInfluencerInvoices() {
  return useQuery({
    queryKey: influencerQueryKeys.invoices,
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook for fetching profile data
 */
export function useInfluencerProfile() {
  return useQuery({
    queryKey: influencerQueryKeys.profile,
    queryFn: fetchProfile,
    staleTime: 10 * 60 * 1000, // Profile changes infrequently
    gcTime: 15 * 60 * 1000,
  })
}
