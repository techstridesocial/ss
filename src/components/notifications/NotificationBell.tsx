'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useRealtimeNotifications } from '@/lib/hooks/useRealtimeNotifications'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Use real-time notifications hook
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications()

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    await markAllAsRead()
    setIsMarkingAll(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'QUOTE_SUBMITTED':
        return '💰'
      case 'INVOICE_SUBMITTED':
        return '📄'
      case 'CAMPAIGN_ASSIGNED':
        return '🎯'
      case 'BRAND_ASSIGNED':
        return '🏢'
      default:
        return '🔔'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
          {/* Connection indicator */}
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isConnected ? 'Real-time updates active' : 'Connecting...'}
          />
        </button>
      </div>

      {/* Notification Dropdown */}
      {isOpen && isClient && createPortal(
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {isConnected ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Wifi size={12} />
                    <span>Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <WifiOff size={12} />
                    <span>Connecting</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAll}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    {isMarkingAll ? 'Marking...' : 'Mark all read'}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                      notification.is_read 
                        ? 'border-l-transparent' 
                        : 'border-l-blue-500 bg-blue-50'
                    }`}
                    onClick={() => !notification.is_read && markAsRead([notification.id])}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // In a real app, this would navigate to a full notifications page
                }}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </motion.div>,
        document.body
      )}

      {/* Overlay for closing dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
