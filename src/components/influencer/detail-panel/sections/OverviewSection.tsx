'use client'

import { 
  Users, AlertTriangle, TrendingUp, Eye, Target, CheckCircle, User, 
  Lock, Video, MessageSquare, Grid, MapPin, Calendar, Globe, Mail, FileText 
} from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface OverviewSectionProps {
  influencer: InfluencerData
  currentPlatformData?: any
}

export const OverviewSection = ({ influencer, currentPlatformData }: OverviewSectionProps) => {
  // 🔍 DEBUG: Log all available fields to see what's missing
  console.log('🔍 OverviewSection - All available fields:', {
    bio: influencer.bio,
    city: influencer.city,
    state: influencer.state,
    country: influencer.country,
    ageGroup: influencer.ageGroup,
    gender: influencer.gender,
    language: influencer.language,
    contacts: influencer.contacts,
    isPrivate: influencer.isPrivate,
    accountType: influencer.accountType,
    isVerified: influencer.isVerified,
    postsCount: influencer.postsCount,
    postsCounts: influencer.postsCounts,
    avgViews: influencer.avgViews,
    avgReelsPlays: influencer.avgReelsPlays,
    allFieldsCount: Object.keys(influencer).length,
    fieldNames: Object.keys(influencer)
  })
  console.log('🔍 OverviewSection received data:', {
    followers: influencer.followers,
    fake_followers_percentage: influencer.fake_followers_percentage,
    fake_followers_quality: influencer.fake_followers_quality,
    currentPlatformData: currentPlatformData,
    profile: influencer.profile,
    demographics: {
      city: influencer.city,
      state: influencer.state,
      country: influencer.country,
      ageGroup: influencer.ageGroup,
      gender: influencer.gender,
      language: influencer.language
    }
  })

  const followersCount = getMetricValue(
    currentPlatformData?.followers, 
    influencer.followers
  )

  const fakeFollowersPercentage = getMetricValue(
    influencer.fake_followers_percentage, 
    influencer.audience?.fake_followers_percentage
  )

  const engagementRate = getMetricValue(
    influencer.engagement_rate,
    influencer.engagementRate
  )

  const estimatedReach = getMetricValue(
    influencer.estimated_reach
  )

  const estimatedImpressions = getMetricValue(
    influencer.estimated_impressions
  )

  const avgLikes = getMetricValue(
    influencer.avgLikes
  )

  // Enhanced data extraction
  const avgViews = getMetricValue(influencer.avgViews)
  const avgReelsPlays = getMetricValue(influencer.avgReelsPlays)
  const avgComments = getMetricValue(influencer.avgComments)
  const postsCount = getMetricValue(
    influencer.postsCount || influencer.postsCounts
  )

  console.log('🔍 Computed overview values:', {
    followersCount,
    fakeFollowersPercentage,
    engagementRate,
    estimatedReach,
    estimatedImpressions,
    avgLikes,
    avgViews,
    avgReelsPlays,
    avgComments,
    postsCount
  })

  return (
    <CollapsibleSection title="Overview" defaultOpen={true}>
      <div className="space-y-3 md:space-y-2">
        <MetricRow
          icon={Users}
          label="Followers"
          value={formatNumber(followersCount)}
          trend={influencer.growth_trends?.follower_growth?.percentage}
        />
        
        {(engagementRate !== undefined && engagementRate !== null) && (
          <MetricRow
            icon={TrendingUp}
            label="Engagement Rate"
            value={formatPercentage(engagementRate)}
            trend={influencer.growth_trends?.engagement_growth?.percentage}
          />
        )}

        {(avgLikes !== undefined && avgLikes !== null && avgLikes > 0) && (
          <MetricRow
            icon={Target}
            label="Avg Likes"
            value={formatNumber(avgLikes)}
            trend={influencer.growth_trends?.likes_growth?.percentage}
          />
        )}

        {(estimatedReach !== undefined && estimatedReach !== null && estimatedReach > 0) && (
          <MetricRow
            icon={Eye}
            label="Estimated Reach"
            value={formatNumber(estimatedReach)}
          />
        )}

        {(estimatedImpressions !== undefined && estimatedImpressions !== null && estimatedImpressions > 0) && (
          <MetricRow
            icon={Eye}
            label="Estimated Impressions"
            value={formatNumber(estimatedImpressions)}
          />
        )}
        
        {(fakeFollowersPercentage !== undefined && fakeFollowersPercentage !== null) && (
          <MetricRow
            icon={AlertTriangle}
            label="Fake followers"
            value={formatPercentage(fakeFollowersPercentage)}
            quality={influencer.fake_followers_quality}
          />
        )}

        {/* 🆕 NEW: PROFILE DETAILS */}
        {influencer.isVerified && (
          <MetricRow
            icon={CheckCircle}
            label="Verification Status"
            value="Verified Account"
            valueClassName="text-blue-600 font-medium"
          />
        )}
        
        {influencer.accountType && (
          <MetricRow
            icon={User}
            label="Account Type"
            value={influencer.accountType}
          />
        )}
        
        {influencer.isPrivate !== undefined && (
          <MetricRow
            icon={Lock}
            label="Privacy"
            value={influencer.isPrivate ? "Private Account" : "Public Account"}
          />
        )}
        
        {/* 🆕 NEW: CONTENT PERFORMANCE */}
        {(avgViews !== undefined && avgViews !== null && avgViews > 0) && (
          <MetricRow
            icon={Eye}
            label="Avg Views"
            value={formatNumber(avgViews)}
          />
        )}
        
        {(avgReelsPlays !== undefined && avgReelsPlays !== null && avgReelsPlays > 0) && (
          <MetricRow
            icon={Video}
            label="Avg Reels Plays"
            value={formatNumber(avgReelsPlays)}
          />
        )}
        
        {(avgComments !== undefined && avgComments !== null && avgComments > 0) && (
          <MetricRow
            icon={MessageSquare}
            label="Avg Comments"
            value={formatNumber(avgComments)}
          />
        )}
        
        {(postsCount !== undefined && postsCount !== null && postsCount > 0) && (
          <MetricRow
            icon={Grid}
            label="Total Posts"
            value={formatNumber(postsCount)}
          />
        )}
        
        {/* 🆕 NEW: DEMOGRAPHICS */}
        {(influencer.city || influencer.state || influencer.country) && (
          <MetricRow
            icon={MapPin}
            label="Location"
            value={[influencer.city, influencer.state, influencer.country].filter(Boolean).join(', ')}
          />
        )}
        
        {influencer.ageGroup && (
          <MetricRow
            icon={Calendar}
            label="Age Group"
            value={influencer.ageGroup}
          />
        )}
        
        {influencer.gender && (
          <MetricRow
            icon={User}
            label="Gender"
            value={influencer.gender}
          />
        )}
        
        {influencer.language && (
          <MetricRow
            icon={Globe}
            label="Primary Language"
            value={influencer.language.name}
          />
        )}
        
        {/* 🆕 NEW: CONTACT INFO */}
        {influencer.contacts && influencer.contacts.length > 0 && (
          <MetricRow
            icon={Mail}
            label="Contact Email"
            value={
              <a 
                href={`mailto:${influencer.contacts[0].value}`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {influencer.contacts[0].value}
              </a>
            }
          />
        )}
        
        {/* 🆕 NEW: ACCOUNT STATUS */}
        {influencer.isPrivate !== undefined && (
          <MetricRow
            icon={Lock}
            label="Account Type"
            value={influencer.isPrivate ? "Private" : "Public"}
          />
        )}
        
        {influencer.accountType && (
          <MetricRow
            icon={User}
            label="Account Category"
            value={influencer.accountType}
          />
        )}
        
        {/* 🆕 NEW: LOCATION DETAILS */}
        {(influencer.city || influencer.state || influencer.country) && (
          <MetricRow
            icon={MapPin}
            label="Location"
            value={[influencer.city, influencer.state, influencer.country].filter(Boolean).join(", ")}
          />
        )}
        
        {/* 🆕 NEW: CONTENT METRICS */}
        {influencer.avgViews > 0 && (
          <MetricRow
            icon={Eye}
            label="Average Views"
            value={formatNumber(influencer.avgViews)}
          />
        )}
        
        {influencer.avgReelsPlays > 0 && (
          <MetricRow
            icon={Video}
            label="Average Reels Plays"
            value={formatNumber(influencer.avgReelsPlays)}
          />
        )}
        
        {/* 🆕 NEW: BIO */}
        {influencer.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Bio</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {influencer.bio}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: BIO */}
        {influencer.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Bio</div>
                <div className="text-sm text-gray-600 leading-relaxed">{influencer.bio}</div>
              </div>
            </div>
          </div>
        )}

        {/* 🆕 NEW: LOCATION (city, state, country) */}
        {(influencer.city || influencer.state || influencer.country) && (
          <MetricRow 
            icon={MapPin} 
            label="Location" 
            value={[influencer.city, influencer.state, influencer.country].filter(Boolean).join(", ")} 
          />
        )}

        {/* 🆕 NEW: MENTIONS */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <Target className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Top Mentions</div>
                <div className="flex flex-wrap gap-2">
                  {influencer.mentions.slice(0, 5).map((mention: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      @{mention.tag || 'Unknown'}
                      {mention.weight && (
                        <span className="ml-1 text-blue-600">
                          {(mention.weight * 100).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}