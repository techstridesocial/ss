'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatPercentage } from '../utils'

interface FollowerQualityScoreSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const FollowerQualityScoreSection = ({ 
  influencer, 
  selectedPlatform 
}: FollowerQualityScoreSectionProps) => {
  
  // Only show for Instagram
  if (selectedPlatform !== 'instagram') {
    return null
  }

  const audience = influencer.audience || {}
  
  // Extract quality metrics
  const credibility = getMetricValue(audience.credibility, influencer.credibility)
  const notable = getMetricValue(audience.notable, influencer.notable)
  const notableUsers = getMetricValue(audience.notableUsers, influencer.notableUsers) || []
  const audienceLikers = getMetricValue(audience.audienceLikers, influencer.audienceLikers)
  const fake_followers_percentage = getMetricValue(influencer.fake_followers_percentage)

  // Build quality metrics
  const qualityMetrics = []

  // Audience Credibility Score
  if (credibility !== null && credibility !== undefined) {
    const credibilityValue = typeof credibility === 'number' ? credibility : 
                           typeof credibility === 'object' ? credibility.score || credibility.percentage : 0
    
    const quality = credibilityValue > 70 ? 'high' : credibilityValue > 50 ? 'medium' : 'low'
    
    qualityMetrics.push({
      label: 'Credibility',
      value: typeof credibilityValue === 'number' ? `${Math.round(credibilityValue)}` : String(credibilityValue),
      secondaryValue: '/100',
      quality
    })
  }

  // Notable Followers Percentage
  if (notable !== null && notable !== undefined) {
    const notableValue = typeof notable === 'number' ? notable : 
                        typeof notable === 'object' ? notable.percentage || notable.score : 0
    
    const quality = notableValue > 5 ? 'high' : notableValue > 1 ? 'medium' : 'low'
    
    qualityMetrics.push({
      label: 'Notable Followers',
      value: formatPercentage(notableValue),
      quality
    })
  }

  // Active Engagement Quality
  if (audienceLikers !== null && audienceLikers !== undefined) {
    const likersValue = typeof audienceLikers === 'number' ? audienceLikers :
                       typeof audienceLikers === 'object' ? audienceLikers.percentage || audienceLikers.ratio : 0
    
    const quality = likersValue > 15 ? 'high' : likersValue > 8 ? 'medium' : 'low'
    
    qualityMetrics.push({
      label: 'Active Likers',
      value: formatPercentage(likersValue),
      quality
    })
  }

  // Follower Authenticity
  if (fake_followers_percentage !== null && fake_followers_percentage !== undefined) {
    const authenticityValue = 100 - fake_followers_percentage
    const quality = authenticityValue > 90 ? 'high' : authenticityValue > 80 ? 'medium' : 'low'
    
    qualityMetrics.push({
      label: 'Authenticity',
      value: `${Math.round(authenticityValue)}`,
      secondaryValue: '%',
      quality
    })
  }

  // Notable Users Count
  if (notableUsers.length > 0) {
    const quality = notableUsers.length > 50 ? 'high' : notableUsers.length > 10 ? 'medium' : 'low'
    
    qualityMetrics.push({
      label: 'Notable Count',
      value: notableUsers.length,
      secondaryValue: 'users',
      quality
    })
  }

  // Don't render if no quality data available
  if (qualityMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Audience Quality"
      badge={qualityMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={qualityMetrics}
        columns={3}
      />
    </PremiumSection>
  )
}
