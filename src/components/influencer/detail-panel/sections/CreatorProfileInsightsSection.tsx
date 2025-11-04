'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue } from '../utils'

interface CreatorProfileInsightsSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const CreatorProfileInsightsSection = ({ 
  influencer, 
  selectedPlatform 
}: CreatorProfileInsightsSectionProps) => {
  
  // Only show for Instagram and TikTok (not YouTube yet)
  if (selectedPlatform === 'youtube') {
    return null
  }

  // Extract profile insight data (platform-aware)
  const accountType = getMetricValue(influencer.accountType)
  const ageGroup = getMetricValue(influencer.ageGroup) 
  const language = getMetricValue(influencer.language)
  const isPrivate = getMetricValue(influencer.isPrivate)
  const bio = getMetricValue(influencer.bio)
  const postsCount = getMetricValue(influencer.postsCount)
  const totalLikes = getMetricValue(influencer.totalLikes) // TikTok-specific
  const isVerified = getMetricValue(influencer.isVerified)

  // Build profile insights metrics
  const profileMetrics = []

  // Account Type (Instagram) or Verification Status (TikTok)
  if (selectedPlatform === 'instagram' && accountType) {
    const typeLabel = typeof accountType === 'string' ? accountType : accountType.name || 'Unknown'
    const quality = typeLabel.toLowerCase() === 'creator' || typeLabel.toLowerCase() === 'business' ? 'high' : 'medium'
    
    profileMetrics.push({
      label: 'Account Type',
      value: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
      quality
    })
  } else if (selectedPlatform === 'tiktok' && typeof isVerified === 'boolean') {
    profileMetrics.push({
      label: 'Verification',
      value: isVerified ? 'Verified' : 'Unverified',
      quality: isVerified ? 'high' : 'medium'
    })
  }

  // Age Group (Instagram only)
  if (selectedPlatform === 'instagram' && ageGroup) {
    const ageValue = typeof ageGroup === 'string' ? ageGroup : ageGroup.range || ageGroup.code || 'Unknown'
    profileMetrics.push({
      label: 'Age Group',
      value: ageValue,
      quality: 'medium'
    })
  }

  // Primary Language (Instagram only)
  if (selectedPlatform === 'instagram' && language) {
    const langValue = typeof language === 'string' ? language : 
                     language.name || language.code || 'Unknown'
    profileMetrics.push({
      label: 'Language',
      value: langValue,
      quality: 'medium'
    })
  }

  // Total Likes (TikTok only)
  if (selectedPlatform === 'tiktok' && totalLikes && typeof totalLikes === 'number') {
    const quality = totalLikes > 10000000 ? 'high' : totalLikes > 1000000 ? 'medium' : 'low'
    profileMetrics.push({
      label: 'Total Likes',
      value: (totalLikes / 1000000).toFixed(1),
      secondaryValue: 'M likes',
      quality
    })
  }

  // Account Privacy
  if (typeof isPrivate === 'boolean') {
    profileMetrics.push({
      label: 'Visibility',
      value: isPrivate ? 'Private' : 'Public',
      quality: isPrivate ? 'low' : 'high'
    })
  }

  // Content Volume
  if (postsCount && typeof postsCount === 'number') {
    const quality = postsCount > 1000 ? 'high' : postsCount > 100 ? 'medium' : 'low'
    profileMetrics.push({
      label: 'Content Volume',
      value: postsCount.toLocaleString(),
      secondaryValue: 'posts',
      quality
    })
  }

  // Bio Optimization
  if (bio && typeof bio === 'string') {
    const bioLength = bio.length
    const quality = bioLength > 100 ? 'high' : bioLength > 50 ? 'medium' : 'low'
    profileMetrics.push({
      label: 'Bio Length',
      value: bioLength,
      secondaryValue: 'characters',
      quality
    })
  }

  // Don't render if no data available
  if (profileMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Profile Classification"
      badge={profileMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={profileMetrics as any}
        columns={3}
      />
    </PremiumSection>
  )
}
