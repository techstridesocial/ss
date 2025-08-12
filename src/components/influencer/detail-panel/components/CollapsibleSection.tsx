'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CollapsibleSectionProps } from '../types'

export const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = false 
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 sm:py-5 px-4 sm:px-6 text-left hover:bg-gray-50/80 transition-all duration-200 focus:outline-none focus:bg-gray-50/80 group"
        aria-expanded={isOpen}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight leading-tight group-hover:text-gray-700 transition-colors">
          {title}
        </h3>
        <div className="flex-shrink-0 ml-4">
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
            id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
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
            <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1">
              <div className="space-y-3 sm:space-y-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}