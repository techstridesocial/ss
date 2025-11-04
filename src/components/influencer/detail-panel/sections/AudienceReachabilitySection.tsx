'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatPercentage } from '../utils'

interface AudienceReachabilitySectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const AudienceReachabilitySection = ({ 
  influencer, 
  selectedPlatform 
}: AudienceReachabilitySectionProps) => {
  
  // Only show for Instagram and TikTok (not YouTube yet)
  if (selectedPlatform === 'youtube') {
    return null
  }

  const audience = (influencer.audience || {}) as any
  
  // Extract reachability and targeting data
  const audienceReachability = getMetricValue(audience.audienceReachability, (influencer as any).audienceReachability)
  const audienceTypes = getMetricValue(audience.audienceTypes, (influencer as any).audienceTypes) || []
  const geoCities = getMetricValue(audience.geoCities, (influencer as any).geoCities) || []

  // Build reachability metrics
  const reachabilityMetrics = []

  // Audience Reachability Score
  if (audienceReachability) {
    let reachabilityValue = audienceReachability
    let quality = 'medium'
    
    if (typeof audienceReachability === 'number') {
      reachabilityValue = Math.round(audienceReachability)
      quality = audienceReachability > 70 ? 'high' : audienceReachability > 40 ? 'medium' : 'low'
    } else if (typeof audienceReachability === 'object' && audienceReachability.score) {
      reachabilityValue = Math.round(audienceReachability.score)
      quality = audienceReachability.score > 70 ? 'high' : audienceReachability.score > 40 ? 'medium' : 'low'
    }
    
    reachabilityMetrics.push({
      label: 'Reachability',
      value: reachabilityValue,
      secondaryValue: '/100',
      quality
    })
  }

  // Primary Audience Type
  if (audienceTypes.length > 0) {
    const topType = audienceTypes[0]
    const typeName = typeof topType === 'string' ? topType : 
                    topType.name || topType.type || 'Mixed'
    const typeWeight = typeof topType === 'object' ? topType.weight || 0 : 0
    const quality = typeWeight > 0.6 ? 'high' : typeWeight > 0.3 ? 'medium' : 'low'
    
    reachabilityMetrics.push({
      label: 'Primary Type',
      value: String(typeName),
      secondaryValue: typeWeight > 0 ? formatPercentage(typeWeight) : '',
      quality
    })
  }

  // Geographic Reach (Cities)
  if (geoCities.length > 0) {
    const quality = geoCities.length > 100 ? 'high' : geoCities.length > 25 ? 'medium' : 'low'
    
    reachabilityMetrics.push({
      label: 'City Reach',
      value: geoCities.length,
      secondaryValue: 'cities',
      quality
    })
  }

  // Audience Type Diversity
  if (audienceTypes.length > 1) {
    const quality = audienceTypes.length > 5 ? 'high' : audienceTypes.length > 3 ? 'medium' : 'low'
    
    reachabilityMetrics.push({
      label: 'Type Diversity',
      value: audienceTypes.length,
      secondaryValue: 'types',
      quality
    })
  }

  // Don't render if no reachability data available
  if (reachabilityMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Audience Reachability"
      badge={reachabilityMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={reachabilityMetrics as any}
        columns={2}
      />
    </PremiumSection>
  )
}
