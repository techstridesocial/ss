'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatNumber, formatPercentage } from '../utils'

interface CompetitiveBenchmarkingSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const CompetitiveBenchmarkingSection = ({ 
  influencer, 
  selectedPlatform 
}: CompetitiveBenchmarkingSectionProps) => {
  
  // Only show for Instagram
  if (selectedPlatform !== 'instagram') {
    return null
  }

  const audience = influencer.audience || {}
  
  // Extract competitive data
  const lookalikes = getMetricValue(influencer.lookalikes) || []
  const audienceLookalikes = getMetricValue(audience.audienceLookalikes, influencer.audienceLookalikes) || []

  // Build competitive metrics
  const competitiveMetrics = []

  // Similar Creators Count
  if (lookalikes.length > 0) {
    competitiveMetrics.push({
      label: 'Similar Creators',
      value: lookalikes.length,
      secondaryValue: 'found',
      quality: lookalikes.length > 10 ? 'high' : lookalikes.length > 5 ? 'medium' : 'low'
    })
  }

  // Audience Overlap Count
  if (audienceLookalikes.length > 0) {
    competitiveMetrics.push({
      label: 'Audience Overlap',
      value: audienceLookalikes.length,
      secondaryValue: 'creators',
      quality: audienceLookalikes.length > 20 ? 'high' : audienceLookalikes.length > 10 ? 'medium' : 'low'
    })
  }

  // Competitive Position Analysis
  if (lookalikes.length > 0) {
    const avgFollowers = lookalikes.reduce((sum: number, comp: any) => sum + (comp.followers || 0), 0) / lookalikes.length
    
    if (influencer.followers && avgFollowers > 0) {
      const followerRatio = influencer.followers / avgFollowers
      const position = followerRatio > 1.2 ? 'Above Avg' : followerRatio < 0.8 ? 'Below Avg' : 'Average'
      const quality = followerRatio > 1.2 ? 'high' : followerRatio < 0.8 ? 'low' : 'medium'
      
      competitiveMetrics.push({
        label: 'Size Position',
        value: position,
        secondaryValue: `${Math.round(followerRatio * 100)}%`,
        quality
      })
    }

    // Engagement comparison
    const avgEngagement = lookalikes.reduce((sum: number, comp: any) => sum + (comp.engagementRate || comp.engagement_rate || 0), 0) / lookalikes.length
    
    if (influencer.engagement_rate && avgEngagement > 0) {
      const engagementRatio = influencer.engagement_rate / avgEngagement
      const performance = engagementRatio > 1.2 ? 'Above Avg' : engagementRatio < 0.8 ? 'Below Avg' : 'Average'
      const quality = engagementRatio > 1.2 ? 'high' : engagementRatio < 0.8 ? 'low' : 'medium'
      
      competitiveMetrics.push({
        label: 'Engagement vs Peers',
        value: performance,
        secondaryValue: `${Math.round(engagementRatio * 100)}%`,
        quality
      })
    }
  }

  // Market Saturation
  if (lookalikes.length > 0 && audienceLookalikes.length > 0) {
    const saturation = (audienceLookalikes.length / lookalikes.length) * 100
    const level = saturation > 50 ? 'High' : saturation > 25 ? 'Medium' : 'Low'
    const quality = saturation > 50 ? 'low' : saturation > 25 ? 'medium' : 'high'
    
    competitiveMetrics.push({
      label: 'Market Saturation',
      value: level,
      secondaryValue: `${Math.round(saturation)}%`,
      quality
    })
  }

  // Don't render if no competitive data available
  if (competitiveMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Competitive Analysis"
      badge={competitiveMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={competitiveMetrics}
        columns={3}
      />
    </PremiumSection>
  )
}
