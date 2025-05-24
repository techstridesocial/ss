'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { requireStaffAccess } from '../../../lib/auth/roles'
import StaffNavigation from '../../../components/nav/StaffNavigation'
import EditInfluencerModal from '../../../components/modals/EditInfluencerModal'
import AddInfluencerModal from '../../../components/modals/AddInfluencerModal'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { Search, Filter, Eye, Edit, Users, TrendingUp, DollarSign, MapPin, Tag, Trash2, RefreshCw } from 'lucide-react'

interface InfluencerTableProps {
  searchParams: {
    search?: string
    niche?: string
    platform?: Platform
    page?: string
  }
}

function InfluencerTableClient({ searchParams }: InfluencerTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerDetail, setSelectedInfluencerDetail] = useState<InfluencerDetailView | null>(null)
  const [activeTab, setActiveTab] = useState<'GOLD' | 'SILVER' | 'PARTNERED'>('GOLD')
  const [isLoading, setIsLoading] = useState(false)
  const [influencers, setInfluencers] = useState(() => {
    // Initialize with mock data - in real app this would load from API
    const INITIAL_INFLUENCERS = [
      {
        id: 'inf_1',
        user_id: 'user_3',
        display_name: 'Sarah Creator',
        niches: ['Lifestyle', 'Fashion'],
        total_followers: 125000,
        total_engagement_rate: 3.8,
        total_avg_views: 45000,
        estimated_promotion_views: 38250,
        influencer_type: 'GOLD',
        is_active: true,
        first_name: 'Sarah',
        last_name: 'Creator',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        location_country: 'United Kingdom',
        location_city: 'Birmingham',
        bio: 'Fashion and lifestyle content creator based in Birmingham',
        website_url: 'https://sarahcreator.com',
        average_views: 45000,
        platforms: ['INSTAGRAM' as Platform, 'TIKTOK' as Platform],
        platform_count: 2
      },
      {
        id: 'inf_2',
        user_id: 'user_4',
        display_name: 'Mike Tech',
        niches: ['Tech', 'Gaming'],
        total_followers: 89000,
        total_engagement_rate: 4.2,
        total_avg_views: 32000,
        estimated_promotion_views: 27200,
        influencer_type: 'SILVER',
        is_active: true,
        first_name: 'Mike',
        last_name: 'Content',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        location_country: 'United States',
        location_city: 'New York',
        bio: 'Tech reviews and gaming content',
        website_url: 'https://miketech.com',
        average_views: 32000,
        platforms: ['YOUTUBE' as Platform],
        platform_count: 1
      },
      {
        id: 'inf_3',
        user_id: 'user_6',
        display_name: 'FitnessFiona',
        niches: ['Fitness', 'Health'],
        total_followers: 156000,
        total_engagement_rate: 5.1,
        total_avg_views: 62000,
        estimated_promotion_views: 52700,
        influencer_type: 'GOLD',
        is_active: true,
        first_name: 'Fiona',
        last_name: 'Fit',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        location_country: 'Australia',
        location_city: 'Sydney',
        bio: 'Fitness coach and healthy lifestyle advocate',
        website_url: 'https://fitnessfiona.com',
        average_views: 62000,
        platforms: ['INSTAGRAM' as Platform, 'YOUTUBE' as Platform],
        platform_count: 2
      },
      {
        id: 'inf_4',
        user_id: 'user_7',
        display_name: 'BeautyByBella',
        niches: ['Beauty'],
        total_followers: 234000,
        total_engagement_rate: 3.6,
        total_avg_views: 78000,
        estimated_promotion_views: 66300,
        influencer_type: 'PARTNERED',
        is_active: true,
        first_name: 'Bella',
        last_name: 'Beauty',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        location_country: 'United Kingdom',
        location_city: 'London',
        bio: 'Beauty enthusiast and makeup tutorials',
        website_url: 'https://beautybybella.com',
        average_views: 78000,
        platforms: ['INSTAGRAM' as Platform, 'TIKTOK' as Platform, 'YOUTUBE' as Platform],
        platform_count: 3
      },
      {
        id: 'inf_5',
        user_id: 'user_8',
        display_name: 'TravelWithTom',
        niches: ['Travel', 'Lifestyle'],
        total_followers: 67000,
        total_engagement_rate: 2.9,
        total_avg_views: 25000,
        estimated_promotion_views: 21250,
        influencer_type: 'SILVER',
        is_active: false,
        first_name: 'Tom',
        last_name: 'Explorer',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        location_country: 'Canada',
        location_city: 'Toronto',
        bio: 'Travel blogger exploring the world one city at a time',
        website_url: 'https://travelwithtom.com',
        average_views: 25000,
        platforms: ['INSTAGRAM' as Platform],
        platform_count: 1
      }
    ]
    return INITIAL_INFLUENCERS
  })

  // Define the influencer type for consistency
  type InfluencerType = typeof influencers[0]

  // Mock data for now - in real app this would come from props
  const MOCK_INFLUENCERS = influencers

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const nicheFilter = searchParams.niche
  const platformFilter = searchParams.platform
  
  // Apply filters
  let filteredInfluencers = [...MOCK_INFLUENCERS]
  
  // Filter by influencer type (tab)
  filteredInfluencers = filteredInfluencers.filter(inf => inf.influencer_type === activeTab)
  
  if (search) {
    const searchLower = search.toLowerCase()
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.display_name.toLowerCase().includes(searchLower) ||
      inf.first_name?.toLowerCase().includes(searchLower) ||
      inf.last_name?.toLowerCase().includes(searchLower) ||
      inf.niches.some(niche => niche.toLowerCase().includes(searchLower))
    )
  }
  
  if (nicheFilter) {
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.niches.includes(nicheFilter)
    )
  }
  
  if (platformFilter) {
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.platforms.includes(platformFilter as Platform)
    )
  }

  const total = filteredInfluencers.length
  const totalPages = Math.ceil(total / 20)

  // Mock function to generate detailed influencer data
  const generateDetailedInfluencerData = (basicInfluencer: any): InfluencerDetailView => {
    return {
      ...basicInfluencer,
      price_per_post: Math.floor(basicInfluencer.total_followers * 0.01),
      last_synced_at: new Date(),
      
      // Generate platform details
      platform_details: basicInfluencer.platforms.map((platform: Platform, index: number) => ({
        id: `platform_${basicInfluencer.id}_${index}`,
        influencer_id: basicInfluencer.id,
        platform,
        username: `${basicInfluencer.display_name.toLowerCase().replace(' ', '')}${index > 0 ? index + 1 : ''}`,
        followers: Math.floor(basicInfluencer.total_followers / basicInfluencer.platform_count),
        following: Math.floor(Math.random() * 2000) + 500,
        engagement_rate: basicInfluencer.total_engagement_rate + (Math.random() - 0.5),
        avg_views: Math.floor(basicInfluencer.total_avg_views / basicInfluencer.platform_count),
        avg_likes: Math.floor(basicInfluencer.total_avg_views * 0.1),
        avg_comments: Math.floor(basicInfluencer.total_avg_views * 0.02),
        last_post_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        profile_url: `https://${platform.toLowerCase()}.com/${basicInfluencer.display_name.toLowerCase().replace(' ', '')}`,
        is_verified: Math.random() > 0.7,
        is_connected: true,
        created_at: new Date(),
        updated_at: new Date()
      })),
      
      // Generate recent content
      recent_content: Array.from({ length: 6 }, (_, i) => ({
        id: `content_${basicInfluencer.id}_${i}`,
        influencer_platform_id: `platform_${basicInfluencer.id}_0`,
        post_url: `https://example.com/post/${i}`,
        thumbnail_url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=300&fit=crop`,
        caption: [
          'Amazing sunset today! 🌅 #lifestyle #beautiful',
          'New tutorial is live! Check it out 📸',
          'Feeling grateful for this journey ✨',
          'Behind the scenes of today\'s shoot 🎬',
          'Can\'t believe how far we\'ve come! 🚀',
          'Exciting collaboration coming soon... 👀'
        ][i],
        views: Math.floor(Math.random() * 50000) + 10000,
        likes: Math.floor(Math.random() * 5000) + 500,
        comments: Math.floor(Math.random() * 200) + 20,
        shares: Math.floor(Math.random() * 100) + 5,
        posted_at: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      })),
      
      // Generate demographics
      demographics: {
        id: `demo_${basicInfluencer.id}`,
        influencer_platform_id: `platform_${basicInfluencer.id}_0`,
        age_13_17: Math.random() * 10,
        age_18_24: 20 + Math.random() * 20,
        age_25_34: 25 + Math.random() * 20,
        age_35_44: 15 + Math.random() * 15,
        age_45_54: 8 + Math.random() * 10,
        age_55_plus: 2 + Math.random() * 5,
        gender_male: 20 + Math.random() * 40,
        gender_female: 50 + Math.random() * 30,
        gender_other: 1 + Math.random() * 5,
        updated_at: new Date()
      },
      
      // Generate audience locations
      audience_locations: [
        { id: `loc_${basicInfluencer.id}_1`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: basicInfluencer.location_country || 'United States', country_code: 'US', percentage: 40 + Math.random() * 30 },
        { id: `loc_${basicInfluencer.id}_2`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'United Kingdom', country_code: 'GB', percentage: 15 + Math.random() * 15 },
        { id: `loc_${basicInfluencer.id}_3`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'Canada', country_code: 'CA', percentage: 10 + Math.random() * 10 },
        { id: `loc_${basicInfluencer.id}_4`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, country_name: 'Australia', country_code: 'AU', percentage: 5 + Math.random() * 8 }
      ],
      
      // Generate audience languages
      audience_languages: [
        { id: `lang_${basicInfluencer.id}_1`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'English', language_code: 'en', percentage: 75 + Math.random() * 20 },
        { id: `lang_${basicInfluencer.id}_2`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'Spanish', language_code: 'es', percentage: 5 + Math.random() * 10 },
        { id: `lang_${basicInfluencer.id}_3`, influencer_platform_id: `platform_${basicInfluencer.id}_0`, language_name: 'French', language_code: 'fr', percentage: 3 + Math.random() * 7 }
      ],
      
      // Empty campaign participation for now
      campaign_participation: []
    }
  }

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

  const handleViewInfluencer = async (influencer: any) => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate detailed data
      const detailedData = generateDetailedInfluencerData(influencer)
      setSelectedInfluencerDetail(detailedData)
      setDetailPanelOpen(true)
    } catch (error) {
      console.error('Error loading influencer details:', error)
      alert('❌ Error loading influencer details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveInfluencer = (influencerId: string) => {
    console.log('Saving influencer to favorites:', influencerId)
    alert('✅ Influencer saved to your favorites!')
  }

  const handleAddToShortlist = (influencerId: string) => {
    console.log('Adding influencer to shortlist:', influencerId)
    alert('✅ Influencer added to shortlist!')
  }

  const handleEditInfluencer = (influencer: any) => {
    setSelectedInfluencer(influencer)
    setEditModalOpen(true)
  }

  const handleSaveInfluencerEdit = async (data: any) => {
    setIsLoading(true)
    console.log('Saving influencer:', data)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the influencer in state
      setInfluencers(prev => prev.map(inf => 
        inf.id === data.id 
          ? { 
              ...inf, 
              // Update specific fields only
              display_name: data.display_name || inf.display_name,
              first_name: data.first_name || inf.first_name,
              last_name: data.last_name || inf.last_name,
              niches: data.niches || inf.niches,
              bio: data.bio || inf.bio,
              location_country: data.location_country || inf.location_country,
              location_city: data.location_city || inf.location_city,
              website_url: data.website_url || inf.website_url,
              influencer_type: data.influencer_type || inf.influencer_type,
              is_active: data.is_active !== undefined ? data.is_active : inf.is_active,
              // Update calculated fields
              total_followers: data.estimated_followers || inf.total_followers,
              total_avg_views: data.average_views || inf.total_avg_views,
              platforms: [
                ...(data.instagram_username ? ['INSTAGRAM' as Platform] : []),
                ...(data.tiktok_username ? ['TIKTOK' as Platform] : []),
                ...(data.youtube_username ? ['YOUTUBE' as Platform] : [])
              ],
              platform_count: [
                data.instagram_username,
                data.tiktok_username, 
                data.youtube_username
              ].filter(Boolean).length
            }
          : inf
      ))
      
      const oldType = selectedInfluencer?.influencer_type
      const newType = data.influencer_type
      
      // Show success message
      if (oldType && newType && oldType !== newType) {
        alert(`✅ Influencer ${data.display_name} updated successfully!\n\n📋 Type changed from ${oldType} to ${newType}.\n🔄 The influencer now appears in the ${newType} tab.`)
        // Switch to the new tab to show the updated influencer
        setActiveTab(newType)
      } else {
        alert(`✅ Influencer ${data.display_name} updated successfully!`)
      }
      
    } catch (error) {
      console.error('Error updating influencer:', error)
      alert('❌ Error updating influencer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInfluencer = async (data: any) => {
    setIsLoading(true)
    console.log('Adding new influencer:', data)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate new ID
      const newId = `inf_${Date.now()}`
      
      // Calculate platform data
      const platforms = [
        ...(data.instagram_username ? ['INSTAGRAM' as Platform] : []),
        ...(data.tiktok_username ? ['TIKTOK' as Platform] : []),
        ...(data.youtube_username ? ['YOUTUBE' as Platform] : [])
      ]
      
      // Create new influencer object
      const newInfluencer = {
        id: newId,
        user_id: `user_${Date.now()}`,
        display_name: data.display_name,
        niches: data.niches,
        total_followers: data.estimated_followers || 0,
        total_engagement_rate: 3.5, // Default engagement rate
        total_avg_views: data.average_views || 0,
        estimated_promotion_views: Math.floor((data.average_views || 0) * 0.85),
        influencer_type: data.influencer_type,
        is_active: true,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: null,
        location_country: data.location_country || '',
        location_city: data.location_city || '',
        bio: data.bio || '',
        website_url: data.website_url || '',
        average_views: data.average_views || 0,
        platforms,
        platform_count: platforms.length
      }
      
      // Add to state
      setInfluencers(prev => [...prev, newInfluencer])
      
      // Switch to the appropriate tab to show the new influencer
      setActiveTab(data.influencer_type)
      
      alert(`✅ New influencer ${data.display_name} added successfully!\n\n📁 Added to ${data.influencer_type} category.\n🔄 Switched to ${data.influencer_type} tab.`)
      
    } catch (error) {
      console.error('Error adding influencer:', error)
      alert('❌ Error adding influencer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInfluencer = async (influencer: any) => {
    if (!window.confirm(`Are you sure you want to delete ${influencer.display_name}?\n\nThis action cannot be undone.`)) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove from state
      setInfluencers(prev => prev.filter(inf => inf.id !== influencer.id))
      
      alert(`✅ ${influencer.display_name} has been deleted successfully.`)
      
    } catch (error) {
      console.error('Error deleting influencer:', error)
      alert('❌ Error deleting influencer. Please try again.')
    } finally {
      setIsLoading(false)
      setDeleteModalOpen(false)
      setSelectedInfluencer(null)
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would refetch data from API
      // For now, just show a success message
      alert('✅ Data refreshed successfully!')
      
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('❌ Error refreshing data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportFromModash = () => {
    alert('Opening Modash import interface...')
  }

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['GOLD', 'SILVER', 'PARTNERED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()} Influencers
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {influencers.filter(inf => inf.influencer_type === tab).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Influencer Rooster ({total})
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={handleRefreshData}
                disabled={isLoading}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center space-x-1"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button 
                onClick={handleImportFromModash}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? 'Processing...' : 'Import from Modash'}
              </button>
              <button 
                onClick={() => setAddModalOpen(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? 'Processing...' : 'Add Influencer'}
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
                  Avg Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInfluencers.map((influencer) => (
                <tr key={influencer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {influencer.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
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
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(platform)}`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-semibold">{formatNumber(influencer.total_followers)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-semibold">{influencer.total_engagement_rate.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-semibold">{formatNumber(influencer.total_avg_views)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {influencer.niches.slice(0, 2).map((niche) => (
                        <span
                          key={niche}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {niche}
                        </span>
                      ))}
                      {influencer.niches.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{influencer.niches.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {influencer.location_city}, {influencer.location_country}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or import from Modash</p>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <InfluencerDetailPanel
        influencer={selectedInfluencerDetail}
        isOpen={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false)
          setSelectedInfluencerDetail(null)
        }}
        onSave={handleSaveInfluencer}
        onAddToShortlist={handleAddToShortlist}
      />

      {/* Modals */}
        <EditInfluencerModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedInfluencer(null)
          }}
        onSave={handleSaveInfluencerEdit}
        influencer={selectedInfluencer}
        />

      <AddInfluencerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddInfluencer}
      />
    </>
  )
}

function InfluencerRoosterPageClient({
  searchParams
}: {
  searchParams: { search?: string; niche?: string; platform?: Platform; page?: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Influencer Rooster</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize your influencer network with detailed analytics and performance metrics.
          </p>
        </div>

        <InfluencerTableClient searchParams={searchParams} />
          </div>
    </div>
  )
}

export default function InfluencerRoosterPage({
  searchParams: searchParamsPromise
}: {
  searchParams: Promise<{ search?: string; niche?: string; platform?: Platform; page?: string }>
}) {
  const [searchParams, setSearchParams] = React.useState<{ search?: string; niche?: string; platform?: Platform; page?: string }>({})

  React.useEffect(() => {
    searchParamsPromise.then(setSearchParams)
  }, [searchParamsPromise])

  return <InfluencerRoosterPageClient searchParams={searchParams} />
} 