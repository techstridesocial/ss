'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, getMetricValue } from '../utils'

interface PremiumProfileSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const PremiumProfileSection = ({ influencer, selectedPlatform }: PremiumProfileSectionProps) => {
  
  // Extract profile information
  const isVerified = getMetricValue(influencer.isVerified, influencer.verified)
  const isPrivate = getMetricValue(influencer.isPrivate, influencer.private)
  const accountType = getMetricValue(influencer.accountType, influencer.account_type)
  const postsCount = getMetricValue(influencer.postsCount, (influencer as any).posts_count || (influencer as any).totalPosts)
  const ageGroup = getMetricValue(influencer.ageGroup, (influencer as any).age_group)
  const bio = getMetricValue(influencer.bio, influencer.description || (influencer as any).biography)
  
  // Location information
  const city = getMetricValue(influencer.city, influencer.location?.city)
  const state = getMetricValue(influencer.state, influencer.location?.state)
  const country = getMetricValue(influencer.country, influencer.location?.country)
  
  // Build profile metrics
  const profileMetrics = []
  
  // Verification & Privacy Status
  if (isVerified !== null) {
    profileMetrics.push({
      label: 'Verification Status',
      value: isVerified ? 'Verified' : 'Not Verified',
      quality: isVerified ? 'high' : 'medium'
    })
  }
  
  if (isPrivate !== null) {
    profileMetrics.push({
      label: 'Account Privacy',
      value: isPrivate ? 'Private' : 'Public',
      quality: isPrivate ? 'low' : 'high'
    })
  }
  
  // Account Type
  if (accountType) {
    const formattedAccountType = typeof accountType === 'string' 
      ? accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()
      : String(accountType)
    
    profileMetrics.push({
      label: 'Account Type',
      value: formattedAccountType,
      quality: accountType === 'business' || accountType === 'BUSINESS' ? 'high' : 'medium'
    })
  }
  
  // Content Volume
  if (postsCount) {
    const contentLabel = selectedPlatform === 'youtube' ? 'Videos' : 
                         selectedPlatform === 'tiktok' ? 'Videos' : 'Posts'
    
    profileMetrics.push({
      label: `Total ${contentLabel}`,
      value: formatNumber(postsCount),
      quality: postsCount > 1000 ? 'high' : postsCount > 100 ? 'medium' : 'low'
    })
  }
  
  // Age Group
  if (ageGroup) {
    profileMetrics.push({
      label: 'Creator Age Group',
      value: String(ageGroup),
      quality: 'medium'
    })
  }
  
  // Build location string
  let locationString = ''
  if (city && state && country) {
    locationString = `${city}, ${state}, ${country}`
  } else if (city && country) {
    locationString = `${city}, ${country}`
  } else if (state && country) {
    locationString = `${state}, ${country}`
  } else if (country) {
    locationString = String(country)
  }
  
  if (locationString) {
    profileMetrics.push({
      label: 'Location',
      value: locationString,
      quality: 'medium'
    })
  }
  
  // If no profile data available, don't render the section
  if (profileMetrics.length === 0 && !bio) {
    return null
  }
  
  return (
    <PremiumSection 
      title="Creator Profile"
      badge={profileMetrics.length + (bio ? 1 : 0)}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Profile Metrics */}
        {profileMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Profile Details
            </h4>
            <PremiumMetricsGrid 
              metrics={profileMetrics}
              columns={2}
            />
          </div>
        )}
        
        {/* Bio/Description */}
        {bio && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Bio
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {String(bio)}
              </p>
            </div>
          </div>
        )}
        
        {/* Platform-Specific Insights */}
        {selectedPlatform === 'instagram' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Instagram Insights
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {isVerified && (
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-blue-600 font-semibold">✓ Verified</div>
                  <div className="text-xs text-blue-500">Authentic Creator</div>
                </div>
              )}
              
              {accountType === 'business' && (
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-green-600 font-semibold">Business Account</div>
                  <div className="text-xs text-green-500">Professional Profile</div>
                </div>
              )}
              
              {postsCount && postsCount > 500 && (
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-purple-600 font-semibold">High Volume</div>
                  <div className="text-xs text-purple-500">Active Creator</div>
                </div>
              )}
              
              {!isPrivate && (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-gray-600 font-semibold">Public Access</div>
                  <div className="text-xs text-gray-500">Open Collaboration</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
