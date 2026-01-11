/**
 * Hook for fetching and managing brands data
 */

import { useState, useEffect, useCallback } from 'react'
import type { Brand, StaffMember, Quotation } from '@/types/brands'

interface ApiBrandData {
  id: string
  company_name: string
  industry?: string
  logo_url?: string | null
  updated_at?: string
  created_at?: string
  assigned_staff_id?: string | null
  assigned_staff_name?: string | null
  shortlists_count?: number
  active_campaigns?: number
  total_spend?: number
  user?: {
    email?: string
    profile?: {
      first_name?: string
      last_name?: string
    }
  }
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadBrands = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const response = await fetch('/api/brands')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Transform API data to match UI expectations
          const transformedBrands: Brand[] = result.data.map((brand: ApiBrandData) => ({
            id: brand.id,
            company_name: brand.company_name || 'Unknown Company',
            contact_name: brand.user?.profile ? 
              `${brand.user.profile.first_name || ''} ${brand.user.profile.last_name || ''}`.trim() : 
              'Unknown Contact',
            email: brand.user?.email || 'no-email@example.com',
            industry: brand.industry || 'Unknown',
            logo_url: brand.logo_url || null,
            shortlists_count: brand.shortlists_count || 0,
            active_campaigns: brand.active_campaigns || 0,
            total_spend: brand.total_spend || 0,
            last_activity: brand.updated_at || brand.created_at || new Date().toISOString(),
            status: 'active',
            assigned_staff_id: brand.assigned_staff_id || null,
            assigned_staff_name: brand.assigned_staff_name || null
          }))
          setBrands(transformedBrands)
        } else {
          setLoadError('Failed to load brands')
        }
      } else {
        setLoadError(`Error ${response.status}: Failed to fetch brands`)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  return {
    brands,
    isLoading,
    loadError,
    reloadBrands: loadBrands
  }
}

export function useStaffMembers() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])

  useEffect(() => {
    const loadStaffMembers = async () => {
      try {
        const response = await fetch('/api/staff/members')
        if (response.ok) {
          const result = await response.json()
          setStaffMembers(result.data || [])
        }
      } catch (error) {
        console.error('Error loading staff members:', error)
      }
    }

    loadStaffMembers()
  }, [])

  return staffMembers
}

interface ApiQuotation {
  id: string
  brandName?: string
  brand_name?: string
  campaignDescription?: string
  campaign_name?: string
  description?: string
  budget?: number
  status?: string
  submittedAt?: string
  requested_at?: string
  createdAt?: string
  created_at?: string
  notes?: string
  influencers?: unknown[]
  influencer_count?: number
  budget_range?: string
  timeline?: string
  campaign_duration?: string
  targetAudience?: string
  target_demographics?: string
  deliverables?: string[]
  total_quote?: string
  quoted_at?: string
  approved_at?: string
  brand_id?: string
}

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const response = await fetch('/api/quotations')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.quotations) {
            // Transform API response to match StaffQuotation interface
            const transformedQuotations: Quotation[] = result.quotations.map((q: ApiQuotation) => ({
              id: q.id,
              brand_id: q.brand_id || '',
              brand_name: q.brandName || q.brand_name || 'Unknown Brand',
              campaign_name: q.campaignDescription || q.campaign_name || q.description || 'Untitled Campaign',
              description: q.campaignDescription || q.description || '',
              influencer_count: q.influencers?.length || q.influencer_count || 0,
              status: (q.status?.toLowerCase() || 'pending_review') as 'pending_review' | 'sent' | 'approved' | 'rejected',
              requested_at: q.submittedAt || q.requested_at || q.createdAt || q.created_at || new Date().toISOString(),
              quoted_at: q.quoted_at,
              approved_at: q.approved_at,
              total_quote: q.total_quote || (q.budget ? `$${q.budget.toLocaleString()}` : undefined),
              budget_range: q.budget_range || (q.budget ? `$${q.budget.toLocaleString()}` : 'TBD'),
              campaign_duration: q.campaign_duration || q.timeline || '',
              deliverables: q.deliverables || [],
              target_demographics: q.target_demographics || q.targetAudience || '',
              notes: q.notes,
              influencers: Array.isArray(q.influencers) ? q.influencers.map((inf: unknown) => {
                const influencer = inf as Record<string, unknown>
                return {
                  name: String(influencer.name || influencer.influencerName || 'Unknown'),
                  platform: String(influencer.platform || 'instagram'),
                  followers: String(influencer.followers || '0'),
                  engagement: String(influencer.engagement || influencer.engagementRate || '0%'),
                  contact_status: (influencer.contact_status as 'pending' | 'confirmed' | 'declined') || 'pending'
                }
              }) : []
            }))
            setQuotations(transformedQuotations)
          }
        }
      } catch (error) {
        console.error('Error loading quotations:', error)
      }
    }

    loadQuotations()
  }, [])

  return quotations
}

