'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

interface HeartedInfluencer {
  id: string
  displayName: string
  username: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  followers: number
  engagement_rate: number
  profilePicture?: string
  niches?: string[]
  location?: string
  bio?: string
  // Add any other relevant fields from discovery results
}

interface Shortlist {
  id: string
  name: string
  description?: string
  influencers: HeartedInfluencer[]
  createdAt: Date
  updatedAt: Date
}

interface HeartedInfluencersContextType {
  // Legacy single shortlist support (for backward compatibility)
  heartedInfluencers: HeartedInfluencer[]
  addHeartedInfluencer: (influencer: HeartedInfluencer) => void
  removeHeartedInfluencer: (id: string) => void
  isInfluencerHearted: (id: string) => boolean
  clearHeartedInfluencers: () => void
  
  // Multi-shortlist support
  shortlists: Shortlist[]
  isLoading: boolean
  createShortlist: (name: string, description?: string) => Promise<string>
  updateShortlist: (id: string, updates: Partial<Pick<Shortlist, 'name' | 'description'>>) => Promise<void>
  deleteShortlist: (id: string) => Promise<void>
  duplicateShortlist: (id: string, newName: string) => Promise<string>
  addInfluencerToShortlist: (shortlistId: string, influencer: HeartedInfluencer) => Promise<void>
  removeInfluencerFromShortlist: (shortlistId: string, influencerId: string) => Promise<void>
  getInfluencerShortlists: (influencerId: string) => Shortlist[]
  isInfluencerInShortlist: (shortlistId: string, influencerId: string) => boolean
}

const HeartedInfluencersContext = createContext<HeartedInfluencersContextType | undefined>(undefined)

export function HeartedInfluencersProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const [heartedInfluencers, setHeartedInfluencers] = useState<HeartedInfluencer[]>([])
  const [shortlists, setShortlists] = useState<Shortlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load shortlists from database when user is authenticated
  const loadShortlists = async () => {
    if (!userId) {
      setShortlists([])
      setIsLoading(false)
      return
    }

    // Only load shortlists for brand users
    const userRole = user?.publicMetadata?.role as string
    if (userRole !== 'BRAND') {
      console.log('👤 Non-brand user detected, skipping shortlists load')
      setShortlists([])
      setIsLoading(false)
      return
    }

    try {
      console.log('📥 Loading shortlists from API...')
      const response = await fetch('/api/shortlists')
      console.log('📡 API response status:', response.status)
      
      if (response.ok) {
        const _result = await response.json()
        console.log('📦 API result:', result)
        
        if (result.success) {
          // Convert database format to context format
          const dbShortlists = result.data.map((shortlist: any) => ({
            id: shortlist.id,
            name: shortlist.name,
            description: shortlist.description,
            influencers: shortlist.influencers.map((inf: any) => ({
              id: inf.id,
              displayName: inf.display_name,
              username: inf.username || inf.display_name,
              platform: inf.platform as 'instagram' | 'tiktok' | 'youtube',
              followers: inf.followers || 0,
              engagement_rate: inf.engagement_rate || 0,
              profilePicture: inf.profile_picture,
              niches: inf.niches || [],
              location: inf.location || '',
              bio: inf.bio || ''
            })),
            createdAt: new Date(shortlist.created_at),
            updatedAt: new Date(shortlist.updated_at)
          }))
          console.log(`✅ Loaded ${dbShortlists.length} shortlists from database:`, dbShortlists.map((s: any) => ({ id: s.id, name: s.name })))
          setShortlists(dbShortlists)
        }
      } else {
        // Handle authentication/authorization errors gracefully
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          // User not authenticated, not authorized, or doesn't exist yet (new signup)
          console.log('👤 User not found or no permission - setting empty shortlists')
          setShortlists([])
        } else {
          // Handle server errors gracefully - could be brand not onboarded
          console.log('Loading shortlists from localStorage due to server response:', response.status)
          // Fallback to localStorage for backward compatibility
          loadFromLocalStorage()
        }
      }
    } catch (error) {
      // Only log actual errors, not expected authentication failures
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Unexpected error loading shortlists:', error)
      }
      // For new users, just set empty state instead of loading from localStorage
      console.log('👤 Setting empty shortlists due to error (likely new user)')
      setShortlists([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback: Load from localStorage (backward compatibility)
  const loadFromLocalStorage = () => {
    try {
      // Load legacy hearted influencers
      const savedHearted = localStorage.getItem('heartedInfluencers')
      if (savedHearted) {
        setHeartedInfluencers(JSON.parse(savedHearted))
      }

      // Load shortlists
      const savedShortlists = localStorage.getItem('brandShortlists')
      if (savedShortlists) {
        const parsed = JSON.parse(savedShortlists)
        setShortlists(parsed.map((shortlist: any) => ({
          ...shortlist,
          createdAt: new Date(shortlist.createdAt),
          updatedAt: new Date(shortlist.updatedAt)
        })))
      } else {
        // Create default shortlist if none exist
        const defaultShortlist: Shortlist = {
          id: 'default',
          name: 'My Shortlist',
          description: 'Default shortlist for saved influencers',
          influencers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setShortlists([defaultShortlist])
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
  }

  // Migrate localStorage shortlists to database
  const migrateLocalStorageToDatabase = async () => {
    if (!userId) return

    try {
      const savedShortlists = localStorage.getItem('brandShortlists')
      if (!savedShortlists) return

      const localShortlists = JSON.parse(savedShortlists)
      console.log('🔄 Found localStorage shortlists, migrating to database...', localShortlists.length)

      for (const localShortlist of localShortlists) {
        try {
          // Create shortlist in database
          const newShortlistId = await createShortlist(
            localShortlist.name,
            localShortlist.description
          )

          // Add all influencers to the new shortlist
          for (const influencer of localShortlist.influencers) {
            await addInfluencerToShortlist(newShortlistId, influencer)
          }

          console.log(`✅ Migrated shortlist: ${localShortlist.name}`)
        } catch (error) {
          console.error(`❌ Failed to migrate shortlist: ${localShortlist.name}`, error)
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('brandShortlists')
      console.log('✅ Migration complete, localStorage cleared')

      // Reload shortlists from database
      await loadShortlists()
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  // Load data when auth is ready
  useEffect(() => {
    if (!isLoaded) return
    
    if (userId) {
      // FORCE: For authenticated users, ALWAYS clear localStorage first
      console.log('🚨 AUTHENTICATED USER: Clearing localStorage and loading from database ONLY')
      
      // Clear localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.removeItem('brandShortlists')
        console.log('🗑️ localStorage cleared for authenticated user')
      }
      
      // ONLY load from database
      loadShortlists()
    } else {
      // Load legacy data for non-authenticated users
      loadFromLocalStorage()
      setIsLoading(false)
    }
  }, [isLoaded, userId])

  // Save legacy hearted influencers to localStorage (backward compatibility)
  useEffect(() => {
    if (!userId) {
      localStorage.setItem('heartedInfluencers', JSON.stringify(heartedInfluencers))
    }
  }, [heartedInfluencers, userId])

  // Save shortlists to localStorage for non-authenticated users (backward compatibility)
  useEffect(() => {
    if (!userId) {
      localStorage.setItem('brandShortlists', JSON.stringify(shortlists))
    }
  }, [shortlists, userId])

  // Legacy functions for backward compatibility
  const addHeartedInfluencer = (influencer: HeartedInfluencer) => {
    setHeartedInfluencers(prev => {
      const exists = prev.some(inf => inf.id === influencer.id)
      if (exists) return prev
      return [...prev, influencer]
    })
    
    // Also add to default shortlist
    const defaultShortlist = shortlists.find(s => s.id === 'default')
    if (defaultShortlist) {
      addInfluencerToShortlist('default', influencer)
    }
  }

  const removeHeartedInfluencer = (id: string) => {
    setHeartedInfluencers(prev => prev.filter(inf => inf.id !== id))
    
    // Also remove from all shortlists
    setShortlists(prev => prev.map(shortlist => ({
      ...shortlist,
      influencers: shortlist.influencers.filter(inf => inf.id !== id),
      updatedAt: new Date()
    })))
  }

  const isInfluencerHearted = (id: string) => {
    return heartedInfluencers.some(inf => inf.id === id) || 
           shortlists.some(shortlist => shortlist.influencers.some(inf => inf.id === id))
  }

  const clearHeartedInfluencers = () => {
    setHeartedInfluencers([])
    setShortlists(prev => prev.map(shortlist => ({
      ...shortlist,
      influencers: [],
      updatedAt: new Date()
    })))
  }

  // Multi-shortlist functions
  const createShortlist = async (name: string, description?: string): Promise<string> => {
    console.log('🆕 Creating shortlist:', { name, description, userId: !!userId })
    
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      console.log('📦 Creating in localStorage (no userId)')
      const id = `shortlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newShortlist: Shortlist = {
        id,
        name,
        description,
        influencers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setShortlists(prev => [...prev, newShortlist])
      return id
    }

    console.log('🌐 Creating in database (authenticated user)')
    try {
      console.log('📤 Sending POST request to /api/shortlists')
      const response = await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      console.log('📥 Response status:', response.status, response.ok)

      if (response.ok) {
        const _result = await response.json()
        console.log('✅ API response:', result)
        if (result.success) {
          // Add to local state
          const newShortlist: Shortlist = {
            id: result.data.id,
            name: result.data.name,
            description: result.data.description,
            influencers: [],
            createdAt: new Date(result.data.created_at),
            updatedAt: new Date(result.data.updated_at)
          }
          console.log('📊 Adding to local state:', newShortlist)
          setShortlists(prev => {
            const updated = [...prev, newShortlist]
            console.log('📊 Updated shortlists count:', updated.length)
            return updated
          })
          console.log('🎉 Shortlist created successfully:', result.data.id)
          return result.data.id
        }
      } else {
        const errorData = await response.json()
        console.error('❌ API error response:', errorData)
        throw new Error(`API Error: ${errorData.error || 'Unknown error'}`)
      }
      throw new Error('Failed to create shortlist')
    } catch (error) {
      console.error('🚨 CRITICAL ERROR creating shortlist:', error)
      console.error('🚨 API failed for authenticated user - NO FALLBACK TO LOCALSTORAGE!')
      
      // NEVER fallback to localStorage for authenticated users
      throw new Error(`Database shortlist creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateShortlist = async (id: string, updates: Partial<Pick<Shortlist, 'name' | 'description'>>) => {
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === id 
          ? { ...shortlist, ...updates, updatedAt: new Date() }
          : shortlist
      ))
      return
    }

    try {
      const response = await fetch('/api/shortlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (response.ok) {
        const _result = await response.json()
        if (result.success) {
          // Update local state
          setShortlists(prev => prev.map(shortlist => 
            shortlist.id === id 
              ? { 
                  ...shortlist, 
                  name: result.data.name,
                  description: result.data.description,
                  updatedAt: new Date(result.data.updated_at)
                }
              : shortlist
          ))
        }
      }
    } catch (error) {
      console.error('Error updating shortlist:', error)
      // Fallback to local update
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === id 
          ? { ...shortlist, ...updates, updatedAt: new Date() }
          : shortlist
      ))
    }
  }

  const deleteShortlist = async (id: string) => {
    console.log('🗑️ Deleting shortlist:', id)
    if (id === 'default') {
      console.log('❌ Cannot delete default shortlist')
      return // Prevent deletion of default shortlist
    }
    
    // FORCE: If user is authenticated, NEVER use localStorage
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      console.log('📦 Deleting from localStorage')
      setShortlists(prev => prev.filter(shortlist => shortlist.id !== id))
      return
    }

    // CRITICAL: Check if trying to delete localStorage shortlist with database user
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('🚨 CRITICAL: Trying to delete localStorage shortlist with database user!')
      console.error('🚨 This means localStorage was not cleared!')
      console.error('🚨 Shortlist ID:', id)
      alert('ERROR: You are still using browser cache data!\n\nClick "Switch to Database" button first!')
      return
    }

    try {
      console.log('🌐 Calling DELETE API for shortlist:', id)
      const response = await fetch(`/api/shortlists?id=${id}`, {
        method: 'DELETE'
      })

      console.log('📥 API response:', response.status, response.ok)
      
      if (response.ok) {
        const _result = await response.json()
        console.log('✅ Delete successful, updating local state')
        // Remove from local state
        setShortlists(prev => {
          const filtered = prev.filter(shortlist => shortlist.id !== id)
          console.log('📊 Shortlists after delete:', filtered.length, 'remaining')
          return filtered
        })
      } else {
        let errorMessage = 'Failed to delete shortlist'
        try {
          const error = await response.json()
          console.error('❌ Delete failed:', error)
          errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('💥 Error deleting shortlist:', error)
      // Don't fallback to local deletion on API error - let user know something went wrong
      throw error
    }
  }

  const duplicateShortlist = async (id: string, newName: string): Promise<string> => {
    const sourceShortlist = shortlists.find(s => s.id === id)
    if (!sourceShortlist) return ''
    
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      const newId = `shortlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const duplicatedShortlist: Shortlist = {
        id: newId,
        name: newName,
        description: sourceShortlist.description,
        influencers: [...sourceShortlist.influencers],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setShortlists(prev => [...prev, duplicatedShortlist])
      return newId
    }

    try {
      const response = await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          description: sourceShortlist.description,
          duplicate_from: id 
        })
      })

      if (response.ok) {
        const _result = await response.json()
        console.log('Duplicate API response:', result)
        if (result.success) {
          // Add to local state
          const newShortlist: Shortlist = {
            id: result.data.id,
            name: result.data.name,
            description: result.data.description,
            influencers: result.data.influencers || [],
            createdAt: new Date(result.data.created_at),
            updatedAt: new Date(result.data.updated_at)
          }
          setShortlists(prev => [...prev, newShortlist])
          return result.data.id
        } else {
          console.error('API returned success: false:', result.error)
          throw new Error(result.error || 'Failed to duplicate shortlist')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API error response:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to duplicate shortlist')
      }
    } catch (error) {
      console.error('Error duplicating shortlist:', error)
      // Fallback to local duplication
      const newId = `shortlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const duplicatedShortlist: Shortlist = {
        id: newId,
        name: newName,
        description: sourceShortlist.description,
        influencers: [...sourceShortlist.influencers],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setShortlists(prev => [...prev, duplicatedShortlist])
      return newId
    }
  }

  const addInfluencerToShortlist = async (shortlistId: string, influencer: HeartedInfluencer) => {
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === shortlistId
          ? {
              ...shortlist,
              influencers: shortlist.influencers.some(inf => inf.id === influencer.id)
                ? shortlist.influencers
                : [...shortlist.influencers, influencer],
              updatedAt: new Date()
            }
          : shortlist
      ))
      return
    }

    try {
      const response = await fetch('/api/shortlists/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shortlist_id: shortlistId, 
          influencer_id: influencer.id 
        })
      })

      if (response.ok) {
        // Update local state
        setShortlists(prev => prev.map(shortlist => 
          shortlist.id === shortlistId
            ? {
                ...shortlist,
                influencers: shortlist.influencers.some(inf => inf.id === influencer.id)
                  ? shortlist.influencers
                  : [...shortlist.influencers, influencer],
                updatedAt: new Date()
              }
            : shortlist
        ))
      }
    } catch (error) {
      console.error('Error adding influencer to shortlist:', error)
      // Fallback to local addition
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === shortlistId
          ? {
              ...shortlist,
              influencers: shortlist.influencers.some(inf => inf.id === influencer.id)
                ? shortlist.influencers
                : [...shortlist.influencers, influencer],
              updatedAt: new Date()
            }
          : shortlist
      ))
    }
  }

  const removeInfluencerFromShortlist = async (shortlistId: string, influencerId: string) => {
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === shortlistId
          ? {
              ...shortlist,
              influencers: shortlist.influencers.filter(inf => inf.id !== influencerId),
              updatedAt: new Date()
            }
          : shortlist
      ))
      return
    }

    try {
      const response = await fetch(`/api/shortlists/influencers?shortlist_id=${shortlistId}&influencer_id=${influencerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Update local state
        setShortlists(prev => prev.map(shortlist => 
          shortlist.id === shortlistId
            ? {
                ...shortlist,
                influencers: shortlist.influencers.filter(inf => inf.id !== influencerId),
                updatedAt: new Date()
              }
            : shortlist
        ))
      }
    } catch (error) {
      console.error('Error removing influencer from shortlist:', error)
      // Fallback to local removal
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === shortlistId
          ? {
              ...shortlist,
              influencers: shortlist.influencers.filter(inf => inf.id !== influencerId),
              updatedAt: new Date()
            }
          : shortlist
      ))
    }
  }

  const getInfluencerShortlists = (influencerId: string): Shortlist[] => {
    return shortlists.filter(shortlist => 
      shortlist.influencers.some(inf => inf.id === influencerId)
    )
  }

  const isInfluencerInShortlist = (shortlistId: string, influencerId: string): boolean => {
    const shortlist = shortlists.find(s => s.id === shortlistId)
    return shortlist ? shortlist.influencers.some(inf => inf.id === influencerId) : false
  }

  return (
    <HeartedInfluencersContext.Provider value={{
      // Legacy support
      heartedInfluencers,
      addHeartedInfluencer,
      removeHeartedInfluencer,
      isInfluencerHearted,
      clearHeartedInfluencers,
      
      // Multi-shortlist support
      shortlists,
      isLoading,
      createShortlist,
      updateShortlist,
      deleteShortlist,
      duplicateShortlist,
      addInfluencerToShortlist,
      removeInfluencerFromShortlist,
      getInfluencerShortlists,
      isInfluencerInShortlist
    }}>
      {children}
    </HeartedInfluencersContext.Provider>
  )
}

export function useHeartedInfluencers() {
  const context = useContext(HeartedInfluencersContext)
  if (context === undefined) {
    throw new Error('useHeartedInfluencers must be used within a HeartedInfluencersProvider')
  }
  return context
}

// Export types for external use
export type { HeartedInfluencer, Shortlist } 