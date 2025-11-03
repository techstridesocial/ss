/**
 * useRosterActions Hook
 * Handles all CRUD operations for roster influencers
 */

import { useState } from 'react'
import { StaffInfluencer } from '@/types/staff'

interface UseRosterActionsProps {
  onRefresh: () => Promise<void>
  onInfluencersUpdate: (updater: (prev: StaffInfluencer[]) => StaffInfluencer[]) => void
}

export function useRosterActions({ onRefresh, onInfluencersUpdate }: UseRosterActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveInfluencerEdit = async (data: Partial<StaffInfluencer> & { id: string }) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/influencers/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: data.display_name,
          first_name: data.first_name,
          last_name: data.last_name,
          niches: data.niches,
          bio: data.bio,
          location_country: data.location_country,
          location_city: data.location_city,
          website_url: data.website_url,
          influencer_type: data.influencer_type,
          is_active: data.is_active,
          total_followers: data.total_followers,
          total_avg_views: data.total_avg_views,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update influencer')
      }

      const result = await response.json()
      
      // Update local state
      onInfluencersUpdate(prev => prev.map(inf => 
        inf.id === data.id ? { ...inf, ...result.data } : inf
      ))
      
      return result.data
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInfluencer = async (influencer: StaffInfluencer) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/influencers/${influencer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete influencer')
      }
      
      // Remove from state
      onInfluencersUpdate(prev => prev.filter(inf => inf.id !== influencer.id))
      
      return true
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAssignment = async (influencerId: string, assignmentData: Partial<StaffInfluencer>) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/influencers/${influencerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      await response.json()
      
      // Refresh data
      await onRefresh()
      
      return true
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveManagement = async (influencerId: string, data: { assigned_to?: string | null; labels?: string[]; notes?: string | null }) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/influencers/${influencerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: data.assigned_to || null,
          labels: data.labels || [],
          notes: data.notes || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save management data')
      }

      await response.json()
      
      // Update local state
      onInfluencersUpdate(prev => prev.map(inf => 
        inf.id === influencerId ? { ...inf, ...data } : inf
      ))
      
      return true
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkRefreshAnalytics = async () => {
    try {
      const response = await fetch('/api/roster/bulk-refresh-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        await response.json()
        await onRefresh()
        return true
      } else {
        throw new Error('Failed to refresh analytics')
      }
    } catch (error) {
      throw error
    }
  }

  return {
    isLoading,
    handleSaveInfluencerEdit,
    handleDeleteInfluencer,
    handleSaveAssignment,
    handleSaveManagement,
    handleBulkRefreshAnalytics
  }
}

