'use client'

import { PremiumSection } from './PremiumSection'

interface PremiumSectionWrapperProps {
  title: string
  children: React.ReactNode
  badge?: string | number
  defaultOpen?: boolean
}

/**
 * Wrapper to apply premium section styling to existing legacy sections
 * This provides a quick way to unify the header design without rewriting entire sections
 */
export const PremiumSectionWrapper = ({ 
  title, 
  children, 
  badge,
  defaultOpen = false 
}: PremiumSectionWrapperProps) => {
  return (
    <PremiumSection 
      title={title}
      badge={badge}
      defaultOpen={defaultOpen}
    >
      <div className="space-y-4">
        {children}
      </div>
    </PremiumSection>
  )
}
