'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

// Hook to get current user's database ID (not Clerk ID)
export function useCurrentUserId(): string | null {
  const { _user } = useUser()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserId = async () => {
      if (!user?.id) {
        setUserId(null)
        setLoading(false)
        return
      }

      try {
        // Call API to get database user ID from Clerk ID
        const response = await fetch('/api/auth/current-user')
        if (response.ok) {
          const data = await response.json()
          setUserId(data.userId)
        } else {
          setUserId(null)
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error)
        setUserId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserId()
  }, [user?.id])

  return userId
}

// Hook to check if loading current user
export function useCurrentUserLoading(): boolean {
  const { _user, isLoaded } = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded])

  return loading
}
