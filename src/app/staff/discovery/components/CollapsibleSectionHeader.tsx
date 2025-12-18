import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export interface CollapsibleSectionHeaderProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function CollapsibleSectionHeader({
  title,
  isExpanded,
  onToggle,
  className = ""
}: CollapsibleSectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-expanded={isExpanded}
      aria-controls={`${title.toLowerCase()}-content`}
    >
      <h4 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
        {title}
      </h4>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="text-gray-500 group-hover:text-gray-700"
      >
        <ChevronDown size={20} />
      </motion.div>
    </button>
  )
}

export const sectionVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden'
  },
  visible: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: {
      height: { duration: 0.3, ease: 'easeInOut' },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: 0.1 },
      height: { duration: 0.3, ease: 'easeInOut', delay: 0.1 }
    }
  }
}

