'use client'

import { Heart, Eye } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatPercentage, hasPaidOrganicData } from '../utils'

interface PaidOrganicSectionProps {
  influencer: InfluencerData
}

export const PaidOrganicSection = ({ influencer }: PaidOrganicSectionProps) => {
  if (!hasPaidOrganicData(influencer)) {
    return null
  }

  const paidEngagement = influencer.paid_vs_organic?.paid_engagement_rate
  const organicEngagement = influencer.paid_vs_organic?.organic_engagement_rate

  return (
    <CollapsibleSection title="Paid vs Organic">
      <div className="space-y-1">
        {paidEngagement && (
          <MetricRow
            icon={Heart}
            label="Paid engagement"
            value={formatPercentage(paidEngagement)}
          />
        )}
        
        {organicEngagement && (
          <MetricRow
            icon={Eye}
            label="Paid views"
            value={formatPercentage(organicEngagement)}
          />
        )}
      </div>
    </CollapsibleSection>
  )
}