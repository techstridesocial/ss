'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue } from '../utils'

interface BrandAffinitySectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const BrandAffinitySection = ({ 
  influencer, 
  selectedPlatform 
}: BrandAffinitySectionProps) => {
  
  // Only show for Instagram and TikTok (not YouTube yet)
  if (selectedPlatform === 'youtube') {
    return null
  }

  const audience = influencer.audience || {}
  
  // Extract brand affinity data
  const profileBrandAffinity = getMetricValue((influencer as any).brandAffinity) || []
  const audienceBrandAffinity = getMetricValue((audience as any).brandAffinity, (influencer.audience as any)?.brandAffinity) || []

  // Build brand affinity metrics
  const brandMetrics = []

  // Creator Brand Connections
  if (profileBrandAffinity.length > 0) {
    const quality = profileBrandAffinity.length > 10 ? 'high' : profileBrandAffinity.length > 5 ? 'medium' : 'low'
    
    brandMetrics.push({
      label: 'Creator Brands',
      value: profileBrandAffinity.length,
      secondaryValue: 'connected',
      quality
    })
  }

  // Audience Brand Preferences
  if (audienceBrandAffinity.length > 0) {
    const quality = audienceBrandAffinity.length > 15 ? 'high' : audienceBrandAffinity.length > 8 ? 'medium' : 'low'
    
    brandMetrics.push({
      label: 'Audience Brands',
      value: audienceBrandAffinity.length,
      secondaryValue: 'preferred',
      quality
    })
  }

  // Top Creator Brand (if available)
  if (profileBrandAffinity.length > 0) {
    const topBrand = profileBrandAffinity[0]
    const brandName = typeof topBrand === 'string' ? topBrand : 
                     topBrand.name || topBrand.brand || 'Unknown'
    const affinity = typeof topBrand === 'object' ? topBrand.affinity || topBrand.score || 0 : 0
    
    if (brandName !== 'Unknown') {
      brandMetrics.push({
        label: 'Top Creator Brand',
        value: String(brandName),
        secondaryValue: affinity > 0 ? `${Math.round(affinity * 100)}%` : '',
        quality: affinity > 0.7 ? 'high' : affinity > 0.4 ? 'medium' : 'low'
      })
    }
  }

  // Top Audience Brand (if available)
  if (audienceBrandAffinity.length > 0) {
    const topAudienceBrand = audienceBrandAffinity[0]
    const brandName = typeof topAudienceBrand === 'string' ? topAudienceBrand : 
                     topAudienceBrand.name || topAudienceBrand.brand || 'Unknown'
    const preference = typeof topAudienceBrand === 'object' ? topAudienceBrand.preference || topAudienceBrand.score || 0 : 0
    
    if (brandName !== 'Unknown') {
      brandMetrics.push({
        label: 'Top Audience Brand',
        value: String(brandName),
        secondaryValue: preference > 0 ? `${Math.round(preference * 100)}%` : '',
        quality: preference > 0.7 ? 'high' : preference > 0.4 ? 'medium' : 'low'
      })
    }
  }

  // Brand Alignment Score
  if (profileBrandAffinity.length > 0 && audienceBrandAffinity.length > 0) {
    // Simple alignment calculation
    const alignment = Math.min(profileBrandAffinity.length / 10, audienceBrandAffinity.length / 15)
    const alignmentScore = Math.round(alignment * 100)
    const quality = alignmentScore > 70 ? 'high' : alignmentScore > 40 ? 'medium' : 'low'
    
    brandMetrics.push({
      label: 'Brand Alignment',
      value: alignmentScore,
      secondaryValue: '/100',
      quality
    })
  }

  // Don't render if no brand affinity data available
  if (brandMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Brand Affinity"
      badge={brandMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={brandMetrics as any}
        columns={3}
      />
    </PremiumSection>
  )
}
