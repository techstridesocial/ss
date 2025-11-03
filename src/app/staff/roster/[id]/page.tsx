import React from 'react'
import { requireStaffAccess } from '../../../../lib/auth/roles'
import ModernStaffHeader from '../../../../components/nav/ModernStaffHeader'
import { notFound } from 'next/navigation'
import { getInfluencerById } from '../../../../lib/db/queries/influencers'
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share, 
  MapPin, 
  Calendar,
  DollarSign,
  CheckCircle,
  Edit,
  Settings,
  Globe,
  Target,
  BarChart3,
  Cake,
  User2
} from 'lucide-react'

// Type definition for influencer detail page
type InfluencerDetailPageData = {
  id: string
  display_name: string
  first_name: string
  last_name: string
  avatar_url: string | null
  bio: string
  location_country: string
  location_city: string
  website_url: string
  niches: string[]
  total_followers: number
  total_engagement_rate: number
  total_avg_views: number
  estimated_promotion_views: number
  price_per_post: number
  is_active: boolean
  last_synced_at: string
  platforms: Array<{
    id: string
    platform: string
    username: string
    followers: number
    following: number
    engagement_rate: number
    avg_views: number
    avg_likes: number
    avg_comments: number
    last_post_date: string
    profile_url: string
    is_verified: boolean
    is_connected: boolean
  }>
  recent_content: Array<{
    id: string
    platform: string
    post_url: string
    thumbnail_url: string | null
    caption: string
    views: number
    likes: number
    comments: number
    shares: number
    posted_at: string
  }>
  demographics: {
    age_13_17: number
    age_18_24: number
    age_25_34: number
    age_35_44: number
    age_45_54: number
    age_55_plus: number
    gender_male: number
    gender_female: number
    gender_other: number
  }
  audience_locations: Array<{
    country_name: string
    country_code: string
    percentage: number
  }>
  audience_languages: Array<{
    language_name: string
    language_code: string
    percentage: number
  }>
}

interface PageProps {
  params: Promise<{ id: string }>
}

function InfluencerHeader({ influencer }: { influencer: InfluencerDetailPageData }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {influencer.avatar_url ? (
            <img
              className="h-24 w-24 rounded-full border-4 border-gray-100"
              src={influencer.avatar_url}
              alt={influencer.display_name}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-100">
              <span className="text-2xl font-bold text-gray-600">
                {influencer.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{influencer.display_name}</h1>
            {influencer.platforms.some(p => p.is_verified) && (
              <CheckCircle size={24} className="text-blue-500" />
            )}
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              influencer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {influencer.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="text-lg text-gray-600 mb-2">
            {influencer.first_name} {influencer.last_name}
          </div>

          {influencer.bio && (
            <p className="text-gray-700 mb-4 max-w-3xl">{influencer.bio}</p>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(influencer.total_followers)}</div>
              <div className="text-sm text-gray-600">Total Followers</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{influencer.total_engagement_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(influencer.total_avg_views)}</div>
              <div className="text-sm text-gray-600">Avg Views</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">${influencer.price_per_post}</div>
              <div className="text-sm text-gray-600">Per Post</div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500">
            {influencer.location_country && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {influencer.location_city}, {influencer.location_country}
              </div>
            )}
            {influencer.website_url && (
              <div className="flex items-center">
                <Globe size={14} className="mr-1" />
                <a href={influencer.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              Last synced: {new Date(influencer.last_synced_at).toLocaleDateString()}
            </div>
          </div>

          {/* Niches */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(influencer.niches || []).map((niche) => (
              <span key={niche} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Target size={12} className="mr-1" />
                {niche}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function PlatformTabs({ influencer }: { influencer: InfluencerDetailPageData }) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE'>('all')

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPlatformData = () => {
    if (activeTab === 'all') {
      return {
        followers: influencer.total_followers,
        engagement_rate: influencer.total_engagement_rate,
        avg_views: influencer.total_avg_views,
        content: influencer.recent_content
      }
    }
    
    const platform = influencer.platforms.find((p: InfluencerDetailPageData['platforms'][0]) => p.platform === activeTab)
    if (!platform) return null
    
    return {
      followers: platform.followers,
      engagement_rate: platform.engagement_rate,
      avg_views: platform.avg_views,
      content: influencer.recent_content.filter((c: InfluencerDetailPageData['recent_content'][0]) => c.platform === activeTab)
    }
  }

  const platformData = getPlatformData()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Platforms
          </button>
          {influencer.platforms.map((platform: InfluencerDetailPageData['platforms'][0]) => (
            <button
              key={platform.platform}
              onClick={() => setActiveTab(platform.platform as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === platform.platform
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{platform.platform}</span>
              {platform.is_verified && <CheckCircle size={14} className="text-blue-500" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {platformData && (
        <div className="p-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(platformData.followers)}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{platformData.engagement_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Eye size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(platformData.avg_views)}</div>
              <div className="text-sm text-gray-600">Average Views</div>
            </div>
          </div>

          {/* Platform-specific Details */}
          {activeTab !== 'all' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {influencer.platforms.filter((p: InfluencerDetailPageData['platforms'][0]) => p.platform === activeTab).map((platform: InfluencerDetailPageData['platforms'][0]) => (
                  <React.Fragment key={platform.id}>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{formatNumber(platform.following)}</div>
                      <div className="text-xs text-gray-600">Following</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{formatNumber(platform.avg_likes)}</div>
                      <div className="text-xs text-gray-600">Avg Likes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{formatNumber(platform.avg_comments)}</div>
                      <div className="text-xs text-gray-600">Avg Comments</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {platform.last_post_date ? new Date(platform.last_post_date).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Last Post</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Recent Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformData.content.map((content: InfluencerDetailPageData['recent_content'][0]) => (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {content.platform}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(content.posted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{content.caption}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {formatNumber(content.views || 0)}
                    </div>
                    <div className="flex items-center">
                      <Heart size={14} className="mr-1" />
                      {formatNumber(content.likes || 0)}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      {formatNumber(content.comments || 0)}
                    </div>
                    {content.shares && (
                      <div className="flex items-center">
                        <Share size={14} className="mr-1" />
                        {formatNumber(content.shares)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DemographicsSection({ influencer }: { influencer: InfluencerDetailPageData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Age & Gender Demographics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <User2 size={20} className="mr-2" />
          Audience Demographics
        </h3>
        
        {/* Age Breakdown */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Age Distribution</h4>
          <div className="space-y-3">
            {[
              { label: '13-17', value: influencer.demographics.age_13_17 },
              { label: '18-24', value: influencer.demographics.age_18_24 },
              { label: '25-34', value: influencer.demographics.age_25_34 },
              { label: '35-44', value: influencer.demographics.age_35_44 },
              { label: '45-54', value: influencer.demographics.age_45_54 },
              { label: '55+', value: influencer.demographics.age_55_plus }
            ].map((age) => (
              <div key={age.label} className="flex items-center">
                <div className="w-12 text-sm text-gray-600">{age.label}</div>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${age.value}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{age.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Gender Distribution</h4>
          <div className="space-y-3">
            {[
              { label: 'Female', value: influencer.demographics.gender_female, color: 'bg-pink-500' },
              { label: 'Male', value: influencer.demographics.gender_male, color: 'bg-blue-500' },
              { label: 'Other', value: influencer.demographics.gender_other, color: 'bg-purple-500' }
            ].map((gender) => (
              <div key={gender.label} className="flex items-center">
                <div className="w-16 text-sm text-gray-600">{gender.label}</div>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`${gender.color} h-2 rounded-full`}
                    style={{ width: `${gender.value}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{gender.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location & Language */}
      <div className="space-y-6">
        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2" />
            Top Locations
          </h3>
          <div className="space-y-3">
            {influencer.audience_locations.slice(0, 5).map((location: InfluencerDetailPageData['audience_locations'][0]) => (
              <div key={location.country_code} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{location.country_name}</div>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{location.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Languages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe size={20} className="mr-2" />
            Top Languages
          </h3>
          <div className="space-y-3">
            {influencer.audience_languages.slice(0, 4).map((language: InfluencerDetailPageData['audience_languages'][0]) => (
              <div key={language.language_code} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{language.language_name}</div>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${language.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{language.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EstimatedReach({ influencer }: { influencer: InfluencerDetailPageData }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 size={20} className="mr-2" />
        Estimated Campaign Reach
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(influencer.estimated_promotion_views)}</div>
          <div className="text-sm text-gray-600">Estimated Views</div>
          <div className="text-xs text-gray-500 mt-1">85% of avg views</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatNumber(Math.floor(influencer.estimated_promotion_views * (influencer.total_engagement_rate / 100)))}</div>
          <div className="text-sm text-gray-600">Expected Engagements</div>
          <div className="text-xs text-gray-500 mt-1">Based on {influencer.total_engagement_rate.toFixed(1)}% rate</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">${influencer.price_per_post}</div>
          <div className="text-sm text-gray-600">Cost Per Post</div>
          <div className="text-xs text-gray-500 mt-1">Estimated pricing</div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> These estimates are based on historical performance data and may vary depending on content type, timing, and audience engagement.
        </p>
      </div>
    </div>
  )
}

export default async function InfluencerDetailPage({ params }: PageProps) {
  // Check staff access
  await requireStaffAccess()
  
  const { id } = await params
  
  if (!id) {
    notFound()
  }

  // Fetch influencer data from database
  const influencerDetail = await getInfluencerById(id)

  if (!influencerDetail) {
    notFound()
  }

  // Transform InfluencerDetailView to match expected structure
  const influencer: InfluencerDetailPageData = {
    id: influencerDetail.id,
    display_name: influencerDetail.display_name || '',
    first_name: influencerDetail.first_name || '',
    last_name: influencerDetail.last_name || '',
    avatar_url: influencerDetail.avatar_url,
    bio: influencerDetail.bio || '',
    location_country: influencerDetail.location_country || '',
    location_city: influencerDetail.location_city || '',
    website_url: influencerDetail.website_url || '',
    niches: influencerDetail.niches || [],
    total_followers: influencerDetail.total_followers || 0,
    total_engagement_rate: influencerDetail.total_engagement_rate || 0,
    total_avg_views: influencerDetail.total_avg_views || 0,
    estimated_promotion_views: influencerDetail.estimated_promotion_views || 0,
    price_per_post: influencerDetail.price_per_post || 0,
    is_active: influencerDetail.is_active || false,
    last_synced_at: (influencerDetail as any).updated_at ? new Date((influencerDetail as any).updated_at).toISOString() : new Date().toISOString(),
    platforms: (influencerDetail.platform_details || []).map((p: any, idx: number) => ({
      id: p.id || `platform_${idx}`,
      platform: p.platform || 'INSTAGRAM',
      username: p.username || '',
      followers: p.followers || 0,
      following: p.following || 0,
      engagement_rate: p.engagement_rate || 0,
      avg_views: p.avg_views || 0,
      avg_likes: p.avg_likes || 0,
      avg_comments: p.avg_comments || 0,
      last_post_date: p.last_post_date?.toISOString() || new Date().toISOString(),
      profile_url: p.profile_url || '',
      is_verified: p.is_verified || false,
      is_connected: p.is_connected || false
    })),
    recent_content: (influencerDetail.recent_content || []).map((c: any) => ({
      id: c.id,
      platform: c.platform || 'INSTAGRAM',
      post_url: c.post_url || '',
      thumbnail_url: c.thumbnail_url,
      caption: c.caption || '',
      views: c.views || 0,
      likes: c.likes || 0,
      comments: c.comments || 0,
      shares: c.shares || 0,
      posted_at: c.posted_at?.toISOString() || new Date().toISOString()
    })),
    demographics: influencerDetail.demographics ? {
      age_13_17: influencerDetail.demographics.age_13_17 || 0,
      age_18_24: influencerDetail.demographics.age_18_24 || 0,
      age_25_34: influencerDetail.demographics.age_25_34 || 0,
      age_35_44: influencerDetail.demographics.age_35_44 || 0,
      age_45_54: influencerDetail.demographics.age_45_54 || 0,
      age_55_plus: influencerDetail.demographics.age_55_plus || 0,
      gender_male: influencerDetail.demographics.gender_male || 0,
      gender_female: influencerDetail.demographics.gender_female || 0,
      gender_other: influencerDetail.demographics.gender_other || 0
    } : {
      age_13_17: 0,
      age_18_24: 0,
      age_25_34: 0,
      age_35_44: 0,
      age_45_54: 0,
      age_55_plus: 0,
      gender_male: 0,
      gender_female: 0,
      gender_other: 0
    },
    audience_locations: (influencerDetail.audience_locations || []).map((l: any) => ({
      country_name: l.country_name || '',
      country_code: l.country_code || '',
      percentage: l.percentage || 0
    })),
    audience_languages: (influencerDetail.audience_languages || []).map((l: any) => ({
      language_name: l.language_name || '',
      language_code: l.language_code || '',
      percentage: l.percentage || 0
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/staff/roster" className="hover:text-gray-700 flex items-center">
              <ArrowLeft size={16} className="mr-1" />
              Back to Influencer Roster
            </a>
          </nav>
        </div>

        {/* Page Content */}
        <div className="space-y-8">
          <InfluencerHeader influencer={influencer} />
          <PlatformTabs influencer={influencer} />
          <DemographicsSection influencer={influencer} />
          <EstimatedReach influencer={influencer} />
        </div>
      </main>
    </div>
  )
} 