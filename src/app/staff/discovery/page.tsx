'use client'

import React, { useState } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { 
  Search, 
  Download, 
  Users, 
  Target, 
  CreditCard, 
  Globe, 
  TrendingUp, 
  Filter,
  RefreshCw,
  Calendar,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react'

// Mock data for Modash credit usage and discovered influencers
const MOCK_CREDIT_USAGE = {
  monthlyLimit: 3000,
  monthlyUsed: 1247,
  yearlyLimit: 36000,
  yearlyUsed: 8934,
  lastUpdated: '2024-01-20T10:30:00Z',
  rolloverCredits: 425
}

const MOCK_DISCOVERED_INFLUENCERS = [
  {
    id: 'discovered_1',
    display_name: 'HealthyLifeMia',
    instagram_handle: '@healthylifemia',
    followers: 89000,
    engagement_rate: 4.7,
    avg_views: 32000,
    niche: 'Health',
    location: 'United Kingdom',
    verified: true,
    last_post: '2024-01-19',
    estimated_price: 650,
    already_imported: false,
    modash_score: 92
  },
  {
    id: 'discovered_2',
    display_name: 'FashionForwardSam',
    instagram_handle: '@fashionforwardsam',
    followers: 156000,
    engagement_rate: 3.9,
    avg_views: 58000,
    niche: 'Fashion',
    location: 'United States',
    verified: false,
    last_post: '2024-01-20',
    estimated_price: 920,
    already_imported: true,
    modash_score: 88
  },
  {
    id: 'discovered_3',
    display_name: 'TechReviewTom',
    youtube_handle: '@techreviewtom',
    followers: 234000,
    engagement_rate: 5.2,
    avg_views: 125000,
    niche: 'Tech',
    location: 'Canada',
    verified: true,
    last_post: '2024-01-18',
    estimated_price: 1450,
    already_imported: false,
    modash_score: 95
  },
  {
    id: 'discovered_4',
    display_name: 'FitnessWithFiona',
    tiktok_handle: '@fitnesswithfiona',
    followers: 67000,
    engagement_rate: 6.1,
    avg_views: 43000,
    niche: 'Fitness',
    location: 'Australia',
    verified: false,
    last_post: '2024-01-20',
    estimated_price: 480,
    already_imported: false,
    modash_score: 83
  }
]

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getScoreBadge = (score: number) => {
  if (score >= 90) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Excellent</span>
  } else if (score >= 75) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Good</span>
  } else if (score >= 60) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Fair</span>
  } else {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Poor</span>
  }
}

// New Modern Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendUp && <ArrowUpRight size={14} className="text-green-600 mr-1" />}
              <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>{trend}</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  )
}

// New Modern Search Interface
function DiscoverySearchInterface() {
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')

  // Social Media Logo Components
  const InstagramLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )

  const TikTokLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.952-1.153-2.271-1.192-3.338h-3.361v13.713c0 2.054-1.673 3.727-3.727 3.727s-3.727-1.673-3.727-3.727c0-2.054 1.673-3.727 3.727-3.727.337 0 .662.045.969.129V7.539a7.363 7.363 0 0 0-.969-.065c-4.063 0-7.363 3.3-7.363 7.363s3.3 7.363 7.363 7.363 7.363-3.3 7.363-7.363V9.515a9.847 9.847 0 0 0 5.698 1.824V7.976a5.892 5.892 0 0 1-3.201-2.414z"/>
    </svg>
  )

  const YouTubeLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )

  const platforms = [
    { id: 'instagram', name: 'Instagram', logo: <InstagramLogo /> },
    { id: 'tiktok', name: 'TikTok', logo: <TikTokLogo /> },
    { id: 'youtube', name: 'YouTube', logo: <YouTubeLogo /> }
  ] as const

  const renderFilters = () => {
    switch (selectedPlatform) {
      case 'instagram':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <input
                type="text"
                placeholder="beauty, fitness, tech..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Size</option>
                <option>1K - 10K</option>
                <option>10K - 100K</option>
                <option>100K - 1M</option>
                <option>1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Rate</option>
                <option>1% - 3%</option>
                <option>3% - 6%</option>
                <option>6%+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>All Locations</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
          </div>
        )
      case 'tiktok':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <input
                type="text"
                placeholder="dance, comedy, lifestyle..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Size</option>
                <option>1K - 50K</option>
                <option>50K - 500K</option>
                <option>500K - 5M</option>
                <option>5M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avg Views</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Views</option>
                <option>1K - 10K</option>
                <option>10K - 100K</option>
                <option>100K - 1M</option>
                <option>1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>All Locations</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
          </div>
        )
      case 'youtube':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <input
                type="text"
                placeholder="tech reviews, gaming, tutorials..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscribers</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Size</option>
                <option>1K - 10K</option>
                <option>10K - 100K</option>
                <option>100K - 1M</option>
                <option>1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avg Views</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Any Views</option>
                <option>1K - 10K</option>
                <option>10K - 100K</option>
                <option>100K - 1M</option>
                <option>1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>All Locations</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Discover Influencers</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2">
          <Search size={16} />
          <span>Search</span>
        </button>
      </div>

      {/* Platform Selection Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPlatform === platform.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{platform.logo}</span>
              <span className="font-bold capitalize">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Filters */}
      <div className="mb-6">
        {renderFilters()}
      </div>
    </div>
  )
}

// New Modern Influencer Table
function DiscoveredInfluencersTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Discovered Influencers</h3>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2">
              <Download size={16} />
              <span>Import Selected</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {MOCK_DISCOVERED_INFLUENCERS.map((influencer) => (
              <tr key={influencer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    disabled={influencer.already_imported}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {influencer.display_name}
                        {influencer.verified && (
                          <CheckCircle size={14} className="ml-2 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {influencer.instagram_handle || influencer.youtube_handle || influencer.tiktok_handle}
                      </div>
                      {influencer.already_imported && (
                        <div className="text-xs text-green-600 mt-1 font-medium">Already imported</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {influencer.instagram_handle ? 'Instagram' : 
                     influencer.youtube_handle ? 'YouTube' : 
                     influencer.tiktok_handle ? 'TikTok' : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(influencer.followers)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {influencer.engagement_rate}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                    {influencer.niche}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {influencer.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getScoreBadge(influencer.modash_score)}
                  <div className="text-xs text-gray-500 mt-1">{influencer.modash_score}/100</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View Profile">
                      <Eye size={16} />
                    </button>
                    {!influencer.already_imported && (
                      <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors" title="Import">
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DiscoveryPageClient() {
  const scrapingStats = {
    totalDiscovered: 4,
    readyToImport: 3,
    creditsRemaining: 1753
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-6 pb-8 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Discovered Today"
            value={scrapingStats.totalDiscovered}
            icon={<Search size={20} />}
          />
          <MetricCard
            title="Monthly Credit Usage"
            value={`${Math.round((MOCK_CREDIT_USAGE.monthlyUsed / MOCK_CREDIT_USAGE.monthlyLimit) * 100)}%`}
            icon={<TrendingUp size={20} />}
            trend={`${MOCK_CREDIT_USAGE.monthlyUsed.toLocaleString()} / ${MOCK_CREDIT_USAGE.monthlyLimit.toLocaleString()}`}
          />
          <MetricCard
            title="Credits Remaining"
            value={scrapingStats.creditsRemaining.toLocaleString()}
            icon={<CreditCard size={20} />}
            trend="This month"
          />
          <MetricCard
            title="Yearly Credit Usage"
            value={`${Math.round((MOCK_CREDIT_USAGE.yearlyUsed / MOCK_CREDIT_USAGE.yearlyLimit) * 100)}%`}
            icon={<Calendar size={20} />}
            trend={`${MOCK_CREDIT_USAGE.yearlyUsed.toLocaleString()} / ${MOCK_CREDIT_USAGE.yearlyLimit.toLocaleString()}`}
          />
        </div>

        {/* Search Interface */}
        <DiscoverySearchInterface />

        {/* Discovered Influencers */}
        <DiscoveredInfluencersTable />
      </main>
    </div>
  )
}

export default DiscoveryPageClient 