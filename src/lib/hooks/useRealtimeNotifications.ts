'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_type?: string
  related_id?: string
  related_data?: {
    brand_name?: string
    campaign_name?: string
  }
}

interface SSEMessage {
  type: 'connected' | 'notification' | 'heartbeat'
  notifications?: Notification[]
  unreadCount?: number
  message?: string
  timestamp: string
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  error: string | null
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Fetch initial notifications via REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data || [])
        setUnreadCount(result.unreadCount || 0)
        setError(null)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource('/api/notifications/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('SSE connection established')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data)
          
          if (data.type === 'connected') {
            console.log('SSE connected:', data.message)
          } else if (data.type === 'notification' && data.notifications && data.notifications.length > 0) {
            // Add new notifications to the list
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n.id))
              const newNotifications = data.notifications!.filter(n => !existingIds.has(n.id))
              
              // Show toast for each new notification
              newNotifications.forEach(notification => {
                toast({
                  title: notification.title,
                  description: notification.message,
                })
              })
              
              return [...newNotifications, ...prev]
            })
          }
          
          // Update unread count
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount)
          }
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError)
        }
      }

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err)
        setIsConnected(false)
        
        eventSource.close()
        eventSourceRef.current = null

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++
          
          console.log(`Attempting SSE reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE()
          }, delay)
        } else {
          setError('Connection lost. Please refresh the page.')
        }
      }
    } catch (err) {
      console.error('Error creating SSE connection:', err)
      setIsConnected(false)
      setError('Failed to establish real-time connection')
    }
  }, [toast])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [])

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  // Initialize on mount
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications()
    
    // Connect to SSE stream
    connectSSE()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [fetchNotifications, connectSSE])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  }
}

export default useRealtimeNotifications
