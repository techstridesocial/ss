'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'

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

    try {
      const response = await fetch('/api/shortlists')
      if (response.ok) {
        const result = await response.json()
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
          setShortlists(dbShortlists)
        }
      } else {
        // Handle authentication/authorization errors gracefully
        if (response.status === 401 || response.status === 403) {
          // User not authenticated or not authorized - silently fall back to localStorage
          loadFromLocalStorage()
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
      // Fallback to localStorage for backward compatibility
      loadFromLocalStorage()
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

  // Load data when auth is ready
  useEffect(() => {
    if (!isLoaded) return
    
    if (userId) {
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
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
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

    try {
      const response = await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      if (response.ok) {
        const result = await response.json()
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
          setShortlists(prev => [...prev, newShortlist])
          return result.data.id
        }
      }
      throw new Error('Failed to create shortlist')
    } catch (error) {
      console.error('Error creating shortlist:', error)
      // Fallback to local creation
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
        const result = await response.json()
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
    if (id === 'default') return // Prevent deletion of default shortlist
    
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      setShortlists(prev => prev.filter(shortlist => shortlist.id !== id))
      return
    }

    try {
      const response = await fetch(`/api/shortlists?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state
        setShortlists(prev => prev.filter(shortlist => shortlist.id !== id))
      }
    } catch (error) {
      console.error('Error deleting shortlist:', error)
      // Fallback to local deletion
      setShortlists(prev => prev.filter(shortlist => shortlist.id !== id))
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
        const result = await response.json()
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
        }
      }
      throw new Error('Failed to duplicate shortlist')
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