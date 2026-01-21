'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveTableProps {
  children: ReactNode
  className?: string
}

/**
 * Wrapper component that makes tables horizontally scrollable on mobile devices
 * while maintaining full width on larger screens
 */
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 sm:mx-0', className)}>
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        {children}
      </div>
    </div>
  )
}
