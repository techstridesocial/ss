import React from 'react'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import StaffNavigation from '../../../components/nav/StaffNavigation'
import { getInfluencers } from '../../../lib/db/queries/influencers'
import { Platform } from '../../../types/database'
import { Search, Filter, Eye, Edit, Users, TrendingUp, DollarSign, MapPin, Tag } from 'lucide-react'

interface InfluencerTableProps {
  searchParams: {
    search?: string
    niche?: string
    platform?: Platform
    page?: string
  }
}

async function InfluencerTable({ searchParams }: InfluencerTableProps) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const nicheFilter = searchParams.niche
  const platformFilter = searchParams.platform
  
  const filters = {
    search: search || undefined,
    niches: nicheFilter ? [nicheFilter] : undefined,
    platforms: platformFilter ? [platformFilter] : undefined,
    is_active: true // Only show active influencers by default
  }
  
  const { data: influencers, total, totalPages } = await getInfluencers(filters, page, 20)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getPlatformBadgeColor = (platform: Platform) => {
    const colors = {
      INSTAGRAM: 'bg-pink-100 text-pink-800',
      TIKTOK: 'bg-black text-white',
      YOUTUBE: 'bg-red-100 text-red-800',
      TWITCH: 'bg-purple-100 text-purple-800',
      TWITTER: 'bg-blue-100 text-blue-800',
      LINKEDIN: 'bg-blue-100 text-blue-800'
    }
    return colors[platform]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Influencer Rooster ({total})
          </h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
              Import from Modash
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Add Influencer
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Influencer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platforms
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niches
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {influencers.map((influencer) => (
              <tr key={influencer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {influencer.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={influencer.avatar_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {influencer.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {influencer.display_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {influencer.first_name && influencer.last_name 
                          ? `${influencer.first_name} ${influencer.last_name}`
                          : 'No real name set'
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {influencer.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getPlatformBadgeColor(platform)}`}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users size={14} className="mr-1 text-gray-400" />
                    {formatNumber(influencer.total_followers)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <TrendingUp size={14} className="mr-1 text-gray-400" />
                    {influencer.total_engagement_rate.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {influencer.niches.slice(0, 2).map((niche) => (
                      <span
                        key={niche}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag size={10} className="mr-1" />
                        {niche}
                      </span>
                    ))}
                    {influencer.niches.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{influencer.niches.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {influencer.location_country ? (
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {influencer.location_country}
                      {influencer.location_city && `, ${influencer.location_city}`}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {influencer.price_per_post ? (
                    <div className="flex items-center">
                      <DollarSign size={12} className="mr-1 text-green-600" />
                      ${influencer.price_per_post}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              {page > 1 && (
                <a
                  href={`/staff/rooster?page=${page - 1}${search ? `&search=${search}` : ''}${nicheFilter ? `&niche=${nicheFilter}` : ''}${platformFilter ? `&platform=${platformFilter}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/staff/rooster?page=${page + 1}${search ? `&search=${search}` : ''}${nicheFilter ? `&niche=${nicheFilter}` : ''}${platformFilter ? `&platform=${platformFilter}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {influencers.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No influencers found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or import from Modash</p>
        </div>
      )}
    </div>
  )
}

export default function InfluencerRoosterPage({
  searchParams
}: {
  searchParams: { search?: string; niche?: string; platform?: Platform; page?: string }
}) {
  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <StaffNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Influencer Rooster</h1>
            <p className="text-gray-600 mt-2">
              Manage and browse all influencers in the network
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <form method="get" className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search}
                    placeholder="Search influencers by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchParams.niche && (
                    <input type="hidden" name="niche" value={searchParams.niche} />
                  )}
                  {searchParams.platform && (
                    <input type="hidden" name="platform" value={searchParams.platform} />
                  )}
                </form>
              </div>

              {/* Niche Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  name="niche"
                  defaultValue={searchParams.niche || ''}
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) {
                      url.searchParams.set('niche', e.target.value)
                    } else {
                      url.searchParams.delete('niche')
                    }
                    url.searchParams.delete('page')
                    window.location.href = url.toString()
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Niches</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Tech">Tech</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              {/* Platform Filter */}
              <div className="flex items-center space-x-2">
                <select
                  name="platform"
                  defaultValue={searchParams.platform || ''}
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) {
                      url.searchParams.set('platform', e.target.value)
                    } else {
                      url.searchParams.delete('platform')
                    }
                    url.searchParams.delete('page')
                    window.location.href = url.toString()
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Platforms</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="TWITCH">Twitch</option>
                  <option value="TWITTER">Twitter</option>
                  <option value="LINKEDIN">LinkedIn</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchParams.search || searchParams.niche || searchParams.platform) && (
                <a
                  href="/staff/rooster"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </a>
              )}
            </div>
          </div>

          {/* Influencer Table */}
          <React.Suspense fallback={
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <InfluencerTable searchParams={searchParams} />
          </React.Suspense>
        </main>
      </div>
    </StaffProtectedRoute>
  )
} 