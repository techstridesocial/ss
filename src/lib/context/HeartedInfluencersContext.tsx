'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

interface HeartedInfluencersContextType {
  heartedInfluencers: HeartedInfluencer[]
  addHeartedInfluencer: (influencer: HeartedInfluencer) => void
  removeHeartedInfluencer: (id: string) => void
  isInfluencerHearted: (id: string) => boolean
  clearHeartedInfluencers: () => void
}

const HeartedInfluencersContext = createContext<HeartedInfluencersContextType | undefined>(undefined)

export function HeartedInfluencersProvider({ children }: { children: ReactNode }) {
  const [heartedInfluencers, setHeartedInfluencers] = useState<HeartedInfluencer[]>([])

  // Load hearted influencers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('heartedInfluencers')
    if (saved) {
      try {
        setHeartedInfluencers(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse hearted influencers from localStorage:', error)
      }
    }
  }, [])

  // Save to localStorage whenever hearted influencers change
  useEffect(() => {
    localStorage.setItem('heartedInfluencers', JSON.stringify(heartedInfluencers))
  }, [heartedInfluencers])

  const addHeartedInfluencer = (influencer: HeartedInfluencer) => {
    setHeartedInfluencers(prev => {
      // Check if influencer already exists
      const exists = prev.some(inf => inf.id === influencer.id)
      if (exists) {
        return prev
      }
      return [...prev, influencer]
    })
  }

  const removeHeartedInfluencer = (id: string) => {
    setHeartedInfluencers(prev => prev.filter(inf => inf.id !== id))
  }

  const isInfluencerHearted = (id: string) => {
    return heartedInfluencers.some(inf => inf.id === id)
  }

  const clearHeartedInfluencers = () => {
    setHeartedInfluencers([])
  }

  return (
    <HeartedInfluencersContext.Provider value={{
      heartedInfluencers,
      addHeartedInfluencer,
      removeHeartedInfluencer,
      isInfluencerHearted,
      clearHeartedInfluencers
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