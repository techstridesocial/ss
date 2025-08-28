'use client'

import { 
  Users, AlertTriangle, TrendingUp, Eye as EyeIcon, Target, CheckCircle, User, 
  Lock, Video, MessageSquare, Grid, MapPin, Calendar, Globe, Mail, FileText, Heart 
} from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface OverviewSectionProps {
  influencer: InfluencerData
  currentPlatformData?: any
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const OverviewSection = ({ influencer, currentPlatformData, selectedPlatform }: OverviewSectionProps) => {


  const followersCount = getMetricValue(
    currentPlatformData?.followers, 
    influencer.followers
  )

  // ❌ CONDITIONAL: fake_followers_percentage may not be available in YouTube API
  const fakeFollowersPercentage = selectedPlatform !== 'youtube' ? getMetricValue(
    influencer.fake_followers_percentage, 
    influencer.audience?.fake_followers_percentage
  ) : null

  const engagementRate = getMetricValue(
    currentPlatformData?.engagement_rate || currentPlatformData?.engagementRate,
    influencer.engagement_rate || influencer.engagementRate
  )

  // ❌ REMOVED: estimated_reach and estimated_impressions not available in YouTube API
  const estimatedReach = selectedPlatform !== 'youtube' ? getMetricValue(
    influencer.estimated_reach
  ) : null

  const estimatedImpressions = selectedPlatform !== 'youtube' ? getMetricValue(
    influencer.estimated_impressions
  ) : null

  const avgLikes = getMetricValue(
    currentPlatformData?.avgLikes,
    influencer.avgLikes
  )

  // Enhanced data extraction with platform-specific prioritization
  const avgViews = getMetricValue(
    currentPlatformData?.avgViews,
    influencer.avgViews
  )
  // ❌ REMOVED: avgReelsPlays not available in YouTube API (Instagram-specific)
  const avgReelsPlays = selectedPlatform !== 'youtube' ? getMetricValue(
    currentPlatformData?.avgReelsPlays,
    influencer.avgReelsPlays
  ) : null
  const avgComments = getMetricValue(
    currentPlatformData?.avgComments,
    influencer.avgComments
  )
  const postsCount = getMetricValue(
    influencer.postsCount || influencer.postsCounts
  )

  // YouTube-specific metrics
  const totalViews = getMetricValue(
    currentPlatformData?.totalViews,
    influencer.totalViews
  )
  const handle = getMetricValue(
    currentPlatformData?.handle,
    influencer.handle
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
    postsCount,
    totalViews,
    handle
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

        {/* ❌ HIDDEN FOR YOUTUBE: estimated_reach not available in YouTube API */}
        {selectedPlatform !== 'youtube' && (estimatedReach !== undefined && estimatedReach !== null && estimatedReach > 0) && (
          <MetricRow
            icon={EyeIcon}
            label="Estimated Reach"
            value={formatNumber(estimatedReach)}
          />
        )}

        {/* ❌ HIDDEN FOR YOUTUBE: estimated_impressions not available in YouTube API */}
        {selectedPlatform !== 'youtube' && (estimatedImpressions !== undefined && estimatedImpressions !== null && estimatedImpressions > 0) && (
          <MetricRow
            icon={EyeIcon}
            label="Estimated Impressions"
            value={formatNumber(estimatedImpressions)}
          />
        )}

        {/* TikTok-specific additional stats */}
        {influencer.engagements && (
          <MetricRow
            icon={Heart}
            label="Total Engagements"
            value={formatNumber(influencer.engagements)}
          />
        )}

        {influencer.totalLikes && (
          <MetricRow
            icon={Heart}
            label="Total Likes"
            value={formatNumber(influencer.totalLikes)}
          />
        )}

        {influencer.postsCount && (
          <MetricRow
            icon={Grid}
            label="Posts Count"
            value={formatNumber(influencer.postsCount)}
          />
        )}

        {/* ❌ REMOVED: Duplicate field - this is covered by avgViews above */}
        
        {/* ❌ HIDDEN FOR YOUTUBE: fake_followers_percentage not available in YouTube API */}
        {selectedPlatform !== 'youtube' && (fakeFollowersPercentage !== undefined && fakeFollowersPercentage !== null) && (
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
            icon={EyeIcon}
            label={selectedPlatform === 'youtube' ? 'Avg Video Views' : 'Avg Views'}
            value={formatNumber(avgViews)}
          />
        )}
        
        {/* ❌ HIDDEN FOR YOUTUBE: avgReelsPlays not available in YouTube API (Instagram-specific) */}
        {selectedPlatform !== 'youtube' && (avgReelsPlays !== undefined && avgReelsPlays !== null && avgReelsPlays > 0) && (
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
            label={selectedPlatform === 'youtube' ? 'Total Videos' : 'Total Posts'}
            value={formatNumber(postsCount)}
          />
        )}

        {/* YouTube-specific metrics */}
        {selectedPlatform === 'youtube' && (totalViews !== undefined && totalViews !== null && totalViews > 0) && (
          <MetricRow
            icon={EyeIcon}
            label="Total Channel Views"
            value={formatNumber(totalViews)}
          />
        )}

        {selectedPlatform === 'youtube' && handle && (
          <MetricRow
            icon={Globe}
            label="Channel Handle"
            value={`@${handle}`}
          />
        )}
        
        {/* 🔧 STREAMLINED: Personal Information (NO DUPLICATES) */}
        {(influencer.city || influencer.state || influencer.country) && (
          <MetricRow
            icon={MapPin}
            label="Location"
            value={[influencer.city, influencer.state, influencer.country].filter(Boolean).join(', ')}
          />
        )}
        
        {influencer.gender && (
          <MetricRow
            icon={User}
            label="Gender"
            value={influencer.gender}
          />
        )}
        
        {influencer.ageGroup && (
          <MetricRow
            icon={Calendar}
            label="Age Group"
            value={influencer.ageGroup}
          />
        )}
        
        {influencer.language && (
          <MetricRow
            icon={Globe}
            label="Primary Language"
            value={influencer.language.name}
          />
        )}
        
        {/* Social Media Platforms moved to header for interactive platform switching */}
        
        {/* 🔧 STREAMLINED: Bio and Description */}
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

        {/* 🎯 YOUTUBE: Channel Description (separate from bio) */}
        {selectedPlatform === 'youtube' && (influencer as any).description && (influencer as any).description !== influencer.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Channel Description</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {(influencer as any).description}
                </div>
              </div>
            </div>
          </div>
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