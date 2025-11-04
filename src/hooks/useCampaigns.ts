import { useState, useEffect, useCallback } from 'react'
// Toast functionality temporarily disabled
// import { useToast } from '@/components/ui/toast'

export interface Campaign {
  id: string
  name: string
  brand_name: string
  brand_id: string
  description: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT'
  budget: number
  spent: number
  start_date: string
  end_date: string
  target_niches: string[]
  target_platforms: string[]
  assigned_influencers: number
  completed_deliverables: number
  pending_payments: number
  estimated_reach: number
  actual_reach: number
  engagement_rate: number
  created_at: string
  updated_at: string
  total_invited: number
  invitations_accepted: number
  invitations_pending: number
  invitations_declined: number
  created_from_quotation: boolean
  quotation_id: string | null
}

export interface CampaignsResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UseCampaignsOptions {
  page?: number
  limit?: number
  status?: string
  brand?: string
  search?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const { addToast } = useToast()
  const addToast = (msg: any) => console.log('Toast:', msg.title, msg.message)

  const {
    page = 1,
    limit = 20,
    status,
    brand,
    search,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(brand && { brand }),
        ...(search && { search })
      })

      const response = await fetch(`/api/campaigns?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`)
      }

      const data: CampaignsResponse = await response.json()
      setCampaigns(data.campaigns)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns'
      setError(errorMessage)
      
      if (!silent) {
        addToast({
          type: 'error',
          title: 'Error',
          message: errorMessage
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, limit, status, brand, search, addToast])

  const refreshCampaigns = useCallback(() => {
    fetchCampaigns(true)
  }, [fetchCampaigns])

  const createCampaign = useCallback(async (campaignData: Partial<Campaign>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.statusText}`)
      }

      const result = await response.json()
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Campaign created successfully'
      })

      await fetchCampaigns()
      return result.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.statusText}`)
      }

      const result = await response.json()
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Campaign updated successfully'
      })

      await fetchCampaigns()
      return result.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  const deleteCampaign = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete campaign: ${response.statusText}`)
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Campaign deleted successfully'
      })

      await fetchCampaigns()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  const duplicateCampaign = useCallback(async (
    id: string, 
    options: {
      name?: string
      copyInfluencers?: boolean
      copySettings?: boolean
      resetMetrics?: boolean
      newStartDate?: string
      newEndDate?: string
    }
  ) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`Failed to duplicate campaign: ${response.statusText}`)
      }

      const result = await response.json()
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Campaign duplicated successfully'
      })

      await fetchCampaigns()
      return result.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate campaign'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  const bulkUpdateCampaigns = useCallback(async (campaignIds: string[], updates: Partial<Campaign>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds, updates })
      })

      if (!response.ok) {
        throw new Error(`Failed to update campaigns: ${response.statusText}`)
      }

      const result = await response.json()
      
      addToast({
        type: 'success',
        title: 'Success',
        message: result.message
      })

      await fetchCampaigns()
      return result.campaigns
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaigns'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  const bulkDeleteCampaigns = useCallback(async (campaignIds: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns?ids=${campaignIds.join(',')}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete campaigns: ${response.statusText}`)
      }

      const result = await response.json()
      
      addToast({
        type: 'success',
        title: 'Success',
        message: result.message
      })

      await fetchCampaigns()
      return result.deletedCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaigns'
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchCampaigns])

  // Initial fetch
  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshCampaigns()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshCampaigns])

  return {
    campaigns,
    pagination,
    loading,
    error,
    refreshCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    bulkUpdateCampaigns,
    bulkDeleteCampaigns
  }
} 