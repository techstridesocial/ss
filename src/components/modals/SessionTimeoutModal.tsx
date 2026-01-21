'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

interface SessionTimeoutModalProps {
  isOpen: boolean
  timeRemaining: number
  onStaySignedIn: () => void
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function SessionTimeoutModal({
  isOpen,
  timeRemaining,
  onStaySignedIn
}: SessionTimeoutModalProps) {
  const [displayTime, setDisplayTime] = useState(formatTime(timeRemaining))

  useEffect(() => {
    setDisplayTime(formatTime(timeRemaining))
  }, [timeRemaining])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Session Timeout Warning
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    Your session will expire in{' '}
                    <span className="font-mono font-semibold text-orange-600">
                      {displayTime}
                    </span>
                    . Please stay signed in to continue your work.
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onStaySignedIn}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Stay Signed In
                    </button>
                    <button
                      onClick={() => {
                        // Will be handled by the hook's onExpire
                        window.location.href = '/sign-in'
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Wrapper component that integrates session timeout with the modal
 */
export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const { timeRemaining, showWarning, resetTimer } = useSessionTimeout(
    () => {
      setShowModal(true)
    },
    () => {
      setShowModal(false)
      signOut?.().then(() => {
        router.push('/sign-in')
      })
    }
  )

  const handleStaySignedIn = () => {
    resetTimer()
    setShowModal(false)
  }

  return (
    <>
      {children}
      <SessionTimeoutModal
        isOpen={showModal && showWarning}
        timeRemaining={timeRemaining}
        onStaySignedIn={handleStaySignedIn}
      />
    </>
  )
}
