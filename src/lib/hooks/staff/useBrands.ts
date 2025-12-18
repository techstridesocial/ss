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

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const response = await fetch('/api/quotations')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.quotations) {
            setQuotations(result.quotations)
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

