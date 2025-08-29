'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PremiumSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string | number
  className?: string
}

export const PremiumSection = ({ 
  title, 
  children, 
  defaultOpen = false,
  badge,
  className = ""
}: PremiumSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className={`border-b border-gray-100 last:border-b-0 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 px-6 text-left hover:bg-gray-50/50 transition-all duration-200 focus:outline-none group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight group-hover:text-gray-700 transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {badge}
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </div>
      </button>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.15, delay: 0.05 }
            }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
