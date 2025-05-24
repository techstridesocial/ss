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
  Clock
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

const MOCK_IMPORT_HISTORY = [
  {
    id: 'import_1',
    date: '2024-01-20',
    search_query: 'Beauty influencers UK',
    results_found: 45,
    imported_count: 12,
    credits_used: 45,
    status: 'completed',
    niches_targeted: ['Beauty', 'Skincare']
  },
  {
    id: 'import_2',
    date: '2024-01-18',
    search_query: 'Fitness micro-influencers',
    results_found: 67,
    imported_count: 23,
    credits_used: 67,
    status: 'completed',
    niches_targeted: ['Fitness', 'Health']
  },
  {
    id: 'import_3',
    date: '2024-01-15',
    search_query: 'Tech reviewers YouTube',
    results_found: 28,
    imported_count: 8,
    credits_used: 28,
    status: 'completed',
    niches_targeted: ['Tech', 'Gaming']
  }
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function CreditUsageCard() {
  const monthlyPercentage = Math.round((MOCK_CREDIT_USAGE.monthlyUsed / MOCK_CREDIT_USAGE.monthlyLimit) * 100)
  const yearlyPercentage = Math.round((MOCK_CREDIT_USAGE.yearlyUsed / MOCK_CREDIT_USAGE.yearlyLimit) * 100)
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Modash Credit Usage</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={14} className="mr-1" />
          Last updated: {new Date(MOCK_CREDIT_USAGE.lastUpdated).toLocaleDateString()}
        </div>
      </div>
      
      {/* Monthly Usage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
          <span className="text-sm text-gray-500">
            {MOCK_CREDIT_USAGE.monthlyUsed.toLocaleString()} / {MOCK_CREDIT_USAGE.monthlyLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${monthlyPercentage > 80 ? 'bg-red-500' : monthlyPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${monthlyPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{monthlyPercentage}% used</div>
      </div>

      {/* Yearly Usage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Yearly Usage</span>
          <span className="text-sm text-gray-500">
            {MOCK_CREDIT_USAGE.yearlyUsed.toLocaleString()} / {MOCK_CREDIT_USAGE.yearlyLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${yearlyPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{yearlyPercentage}% used</div>
      </div>

      {/* Rollover Credits */}
      <div className="bg-green-50 p-3 rounded-lg">
        <div className="flex items-center">
          <CheckCircle size={16} className="text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            {MOCK_CREDIT_USAGE.rolloverCredits} rollover credits available
          </span>
        </div>
      </div>
    </div>
  )
}

function ModashSearchInterface() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Discover New Influencers</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh API</span>
        </button>
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              placeholder="beauty, fitness, tech..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="">Any Location</option>
              <option value="uk">United Kingdom</option>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
          </div>

          {/* Follower Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="">Any Size</option>
              <option value="1000-10000">1K - 10K (Nano)</option>
              <option value="10000-100000">10K - 100K (Micro)</option>
              <option value="100000-1000000">100K - 1M (Macro)</option>
              <option value="1000000+">1M+ (Mega)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Engagement Rate</label>
              <input
                type="number"
                placeholder="3.0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price Range</label>
              <input
                type="number"
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Search size={16} />
                <span>Search Modash</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center">
          <AlertCircle size={16} className="text-yellow-600 mr-2" />
          <span className="text-sm text-yellow-800">
            Estimated cost: <strong>50-100 credits</strong> based on search criteria
          </span>
        </div>
      </div>
    </div>
  )
}

function DiscoveredInfluencersTable() {
  const getScoreBadge = (score: number) => {
    if (score >= 90) return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Excellent</span>
    if (score >= 80) return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Good</span>
    if (score >= 70) return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Fair</span>
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Poor</span>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Discovered Influencers ({MOCK_DISCOVERED_INFLUENCERS.length})</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-2">
              <Download size={16} />
              <span>Bulk Import</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_DISCOVERED_INFLUENCERS.map((influencer) => (
              <tr key={influencer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    disabled={influencer.already_imported}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {influencer.display_name}
                        {influencer.verified && (
                          <CheckCircle size={14} className="ml-1 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {influencer.instagram_handle || influencer.youtube_handle || influencer.tiktok_handle}
                      </div>
                      {influencer.already_imported && (
                        <div className="text-xs text-green-600 mt-1">Already imported</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                    {influencer.instagram_handle ? 'Instagram' : 
                     influencer.youtube_handle ? 'YouTube' : 
                     influencer.tiktok_handle ? 'TikTok' : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users size={14} className="mr-1 text-gray-400" />
                    {formatNumber(influencer.followers)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <TrendingUp size={14} className="mr-1 text-gray-400" />
                    {influencer.engagement_rate}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {influencer.niche}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Globe size={12} className="mr-1" />
                    {influencer.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getScoreBadge(influencer.modash_score)}
                  <div className="text-xs text-gray-500 mt-1">{influencer.modash_score}/100</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" title="View Profile">
                      <Eye size={16} />
                    </button>
                    {!influencer.already_imported && (
                      <button className="text-green-600 hover:text-green-900" title="Import">
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

function ImportHistoryTable() {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { class: 'bg-green-100 text-green-800', text: 'Completed' },
      in_progress: { class: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      failed: { class: 'bg-red-100 text-red-800', text: 'Failed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Import History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Query</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imported</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_IMPORT_HISTORY.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.search_query}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.niches_targeted.map((niche) => (
                      <span key={niche} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {niche}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.results_found}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.imported_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.credits_used}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScrapingPageClient() {
  const scrapingStats = {
    totalDiscovered: MOCK_DISCOVERED_INFLUENCERS.length,
    readyToImport: MOCK_DISCOVERED_INFLUENCERS.filter(i => !i.already_imported).length,
    creditsRemaining: MOCK_CREDIT_USAGE.monthlyLimit - MOCK_CREDIT_USAGE.monthlyUsed,
    lastScrapeDate: '2024-01-20'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-8 pb-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Discovered Today"
            value={scrapingStats.totalDiscovered}
            icon={<Search size={24} />}
            color="blue"
          />
          <StatCard
            title="Ready to Import"
            value={scrapingStats.readyToImport}
            icon={<Download size={24} />}
            color="green"
          />
          <StatCard
            title="Credits Remaining"
            value={scrapingStats.creditsRemaining}
            icon={<CreditCard size={24} />}
            color="purple"
            trend="This month"
          />
          <StatCard
            title="Last Scrape"
            value="Today"
            icon={<RefreshCw size={24} />}
            color="yellow"
          />
        </div>

        {/* Credit Usage Card */}
        <div className="mb-8">
          <CreditUsageCard />
        </div>

        {/* Search Interface */}
        <div className="mb-8">
          <ModashSearchInterface />
        </div>

        {/* Discovered Influencers */}
        <div className="mb-8">
          <DiscoveredInfluencersTable />
        </div>

        {/* Import History */}
        <div className="mb-8">
          <ImportHistoryTable />
        </div>
      </main>
    </div>
  )
}

export default ScrapingPageClient 