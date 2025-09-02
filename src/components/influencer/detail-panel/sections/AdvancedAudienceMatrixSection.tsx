'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatPercentage } from '../utils'

interface AdvancedAudienceMatrixSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const AdvancedAudienceMatrixSection = ({ 
  influencer, 
  selectedPlatform 
}: AdvancedAudienceMatrixSectionProps) => {
  
  // Only show for Instagram
  if (selectedPlatform !== 'instagram') {
    return null
  }

  const audience = influencer.audience || {}
  
  // Extract demographic data
  const genders = getMetricValue(audience.genders, influencer.genders) || []
  const ages = getMetricValue(audience.ages, influencer.ages) || []
  const ethnicities = getMetricValue(audience.ethnicities, influencer.ethnicities) || []
  const geoStates = getMetricValue(audience.geoStates, influencer.geoStates) || []

  // Build demographic metrics
  const demographicMetrics = []

  // Top gender
  if (genders.length > 0) {
    const topGender = genders[0]
    demographicMetrics.push({
      label: 'Primary Gender',
      value: topGender.code === 'MALE' ? 'Male' : 'Female',
      secondaryValue: formatPercentage(topGender.weight),
      quality: topGender.weight > 0.6 ? 'high' : 'medium'
    })
  }

  // Top age group
  if (ages.length > 0) {
    const topAge = ages[0]
    demographicMetrics.push({
      label: 'Primary Age',
      value: topAge.code,
      secondaryValue: formatPercentage(topAge.weight),
      quality: topAge.weight > 0.3 ? 'high' : 'medium'
    })
  }

  // Ethnic diversity
  if (ethnicities.length > 0) {
    demographicMetrics.push({
      label: 'Ethnic Groups',
      value: ethnicities.length,
      secondaryValue: 'groups',
      quality: ethnicities.length > 5 ? 'high' : ethnicities.length > 2 ? 'medium' : 'low'
    })
  }

  // Geographic diversity
  if (geoStates.length > 0) {
    demographicMetrics.push({
      label: 'States/Regions',
      value: geoStates.length,
      secondaryValue: 'regions',
      quality: geoStates.length > 20 ? 'high' : geoStates.length > 10 ? 'medium' : 'low'
    })
  }

  // Don't render if no data available
  if (demographicMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Demographic Breakdown"
      badge={demographicMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={demographicMetrics}
        columns={2}
      />
    </PremiumSection>
  )
}
