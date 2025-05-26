'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import EditInfluencerModal from '../../../components/modals/EditInfluencerModal'
import AddInfluencerModal from '../../../components/modals/AddInfluencerModal'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import InfluencerManagementPanel from '../../../components/influencer/InfluencerManagementPanel'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { Search, Filter, Eye, Edit, Users, TrendingUp, DollarSign, MapPin, Tag, Trash2, RefreshCw, Globe } from 'lucide-react'

interface InfluencerTableProps {
  searchParams: {
    search?: string
    niche?: string
    platform?: Platform
    page?: string
  }
  onPanelStateChange?: (isAnyPanelOpen: boolean) => void
}

function InfluencerTableClient({ searchParams, onPanelStateChange }: InfluencerTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerDetail, setSelectedInfluencerDetail] = useState<InfluencerDetailView | null>(null)
  const [activeTab, setActiveTab] = useState<'SIGNED' | 'PARTNERED'>('SIGNED')
  const [isLoading, setIsLoading] = useState(false)
  const [managementPanelOpen, setManagementPanelOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
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
  const search = searchParams.search || searchQuery
  const nicheFilter = searchParams.niche
  const platformFilter = searchParams.platform
  
  // Apply filters
  let filteredInfluencers = [...MOCK_INFLUENCERS]
  
  // Filter by influencer type (tab)
  if (activeTab === 'SIGNED') {
    filteredInfluencers = filteredInfluencers.filter(inf => inf.influencer_type === 'GOLD' || inf.influencer_type === 'SILVER')
  } else {
    filteredInfluencers = filteredInfluencers.filter(inf => inf.influencer_type === activeTab)
  }
  
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
      
      // Add missing profile properties
      bio: basicInfluencer.bio || `${basicInfluencer.display_name} is a passionate content creator specializing in ${basicInfluencer.niches.join(', ').toLowerCase()}. Creating authentic content and building meaningful connections with followers.`,
      website_url: basicInfluencer.website_url,
      email: `contact@${basicInfluencer.display_name.toLowerCase().replace(' ', '')}.com`,
      
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
      
      // Generate detailed data with CRM fields
      const detailedData = {
        ...generateDetailedInfluencerData(influencer),
        // Add CRM fields that might be missing
        relationship_status: influencer.relationship_status || 'not_started',
        assigned_to: influencer.assigned_to || null,
        labels: influencer.labels || [],
        notes: influencer.notes || ''
      }
      
      setSelectedInfluencerDetail(detailedData)
      // Set the first platform as default if no platform is selected
      const defaultPlatform = detailedData.platform_details[0]?.platform || ''
      setSelectedPlatform(defaultPlatform)
      
      // Only open detail panel initially, management panel can be opened separately
      setDetailPanelOpen(true)
      setManagementPanelOpen(false) // Start with management panel closed
    } catch (error) {
      console.error('Error loading influencer details:', error)
      alert('❌ Error loading influencer details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePanels = () => {
    setManagementPanelOpen(false)
    setDetailPanelOpen(false)
    setSelectedInfluencerDetail(null)
    setSelectedPlatform('')
  }

  const handleOpenManagementPanel = () => {
    setManagementPanelOpen(true)
  }

  const handlePlatformSwitch = (platform: string) => {
    setSelectedPlatform(platform)
  }

  const handleSaveManagement = (data: Partial<InfluencerDetailView>) => {
    console.log('Saving management data:', data)
    // Here you would typically update the influencer in your database
    alert('✅ Influencer management data saved successfully!')
    handleClosePanels()
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
      
      // Update the influencer in state - simplified approach to avoid type issues
      setInfluencers(prev => prev.map(inf => {
        if (inf.id === data.id) {
          // Create a safe update that maintains the original type structure
          return {
            ...inf,
            display_name: data.display_name || inf.display_name,
            first_name: data.first_name || inf.first_name,
            last_name: data.last_name || inf.last_name,
            niches: data.niches || inf.niches,
            bio: data.bio || inf.bio || '',
            location_country: data.location_country || inf.location_country,
            location_city: data.location_city || inf.location_city,
            website_url: data.website_url || inf.website_url || '',
            influencer_type: data.influencer_type || inf.influencer_type,
            is_active: data.is_active !== undefined ? data.is_active : inf.is_active,
            total_followers: data.estimated_followers || inf.total_followers,
            total_avg_views: data.average_views || inf.total_avg_views,
          }
        }
        return inf
      }))
      
      const oldType = selectedInfluencer?.influencer_type
      const newType = data.influencer_type
      
      // Show success message and switch to appropriate tab
      if (oldType && newType && oldType !== newType) {
        // Determine which tab to switch to based on the new type
        const targetTab = (newType === 'GOLD' || newType === 'SILVER') ? 'SIGNED' : 'PARTNERED'
        
        alert(`✅ Influencer ${data.display_name} updated successfully!\n\n📋 Type changed from ${oldType} to ${newType}.\n🔄 The influencer now appears in the ${targetTab} tab.`)
        setActiveTab(targetTab)
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
        avatar_url: '', // Set to empty string instead of null
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
      const targetTab = (data.influencer_type === 'GOLD' || data.influencer_type === 'SILVER') ? 'SIGNED' : 'PARTNERED'
      setActiveTab(targetTab)
      
      alert(`✅ New influencer ${data.display_name} added successfully!\n\n📁 Added to ${data.influencer_type} category.\n🔄 Switched to ${targetTab} tab.`)
      
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('✅ Influencer data refreshed successfully!')
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('❌ Error refreshing data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Track panel state changes for the parent component
  useEffect(() => {
    const isAnyPanelOpen = detailPanelOpen || managementPanelOpen
    onPanelStateChange?.(isAnyPanelOpen)
  }, [detailPanelOpen, managementPanelOpen, onPanelStateChange])

  // Platform Icon Component with SVG logos
  const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-pink-500" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
      case 'tiktok':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-gray-900" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        )
      case 'youtube':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-red-600" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )
      case 'twitter':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-blue-500" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        )
      case 'linkedin':
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <svg className="text-blue-700" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
            <Globe size={size * 0.8} className="text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search influencers by name, niche, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 text-sm bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 focus:bg-white/80 transition-all duration-300 placeholder:text-gray-400 font-medium"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
        >
          <Users size={16} className="mr-2" />
          Add Influencer
        </button>
        
        <button
          onClick={handleRefreshData}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm text-gray-700 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['SIGNED', 'PARTNERED'] as const).map((tab) => {
            let count = 0
            let displayName = ''
            
            if (tab === 'SIGNED') {
              count = MOCK_INFLUENCERS.filter(inf => inf.influencer_type === 'GOLD' || inf.influencer_type === 'SILVER').length
              displayName = 'Signed'
            } else {
              count = MOCK_INFLUENCERS.filter(inf => inf.influencer_type === tab).length
              displayName = tab.charAt(0) + tab.slice(1).toLowerCase()
            }
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {displayName}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Influencer Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 border-b border-gray-100/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Influencer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platforms</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Niches</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Followers</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Views</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100/60">
              {filteredInfluencers.map((influencer) => (
                <tr key={influencer.id} className="hover:bg-white/70 transition-colors duration-150">
                  {/* Influencer Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {influencer.avatar_url ? (
                          <img 
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" 
                            src={influencer.avatar_url} 
                            alt={influencer.display_name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                            <Users size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {influencer.display_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {influencer.first_name} {influencer.last_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(influencer.influencer_type === 'GOLD' || influencer.influencer_type === 'SILVER') ? (
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        influencer.influencer_type === 'GOLD' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {influencer.influencer_type === 'GOLD' ? 'Gold' : 'Silver'}
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Partnered
                      </span>
                    )}
                  </td>

                  {/* Platforms */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {influencer.platforms.map((platform) => (
                        <div key={platform} className="flex items-center">
                          <PlatformIcon platform={platform} size={24} />
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Niches */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {influencer.niches.slice(0, 2).map((niche) => (
                        <span
                          key={niche}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg"
                        >
                          {niche}
                        </span>
                      ))}
                      {influencer.niches.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                          +{influencer.niches.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Followers */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_followers)}
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <TrendingUp size={14} className="mr-1 text-gray-400" />
                      {influencer.total_engagement_rate.toFixed(1)}%
                    </div>
                  </td>

                  {/* Average Views */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Eye size={14} className="mr-1 text-gray-400" />
                      {formatNumber(influencer.total_avg_views)}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">{influencer.location_city}</div>
                        <div className="text-xs text-gray-500">{influencer.location_country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      influencer.is_active 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {influencer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditInfluencer(influencer)}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Edit Influencer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInfluencer(influencer)
                          setDeleteModalOpen(true)
                        }}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Delete Influencer"
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
          <div className="px-6 py-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-500 mb-4">
              {search || nicheFilter || platformFilter 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : `No ${activeTab.toLowerCase()} influencers available.`
              }
            </p>
            {!search && !nicheFilter && !platformFilter && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
              >
                <Users size={16} className="mr-2" />
                Add Your First Influencer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {editModalOpen && selectedInfluencer && (
        <EditInfluencerModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedInfluencer(null)
          }}
          influencer={selectedInfluencer}
          onSave={handleSaveInfluencerEdit}
        />
      )}

      {addModalOpen && (
        <AddInfluencerModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddInfluencer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedInfluencer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
                <Trash2 size={24} className="text-red-600" />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Delete Influencer
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>{selectedInfluencer.display_name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setSelectedInfluencer(null)
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-white/60 backdrop-blur-md border-0 rounded-2xl shadow-sm text-gray-700 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteInfluencer(selectedInfluencer)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Panels */}
      {selectedInfluencerDetail && (
        <>
          <InfluencerDetailPanel
            isOpen={detailPanelOpen}
            onClose={handleClosePanels}
            influencer={selectedInfluencerDetail}
            selectedPlatform={selectedPlatform}
            onPlatformSwitch={handlePlatformSwitch}
            onOpenManagement={handleOpenManagementPanel}
          />
          
          <InfluencerManagementPanel
            isOpen={managementPanelOpen}
            onClose={() => setManagementPanelOpen(false)}
            influencer={selectedInfluencerDetail}
            onSave={handleSaveManagement}
          />
        </>
      )}
    </div>
  )
}

export default function StaffRosterPage() {
  const [isAnyPanelOpen, setIsAnyPanelOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
      <ModernStaffHeader />
      
      <main className={`px-4 lg:px-8 pb-8 transition-all duration-300 ${
        isAnyPanelOpen ? 'mr-[400px]' : ''
      }`}>
        <InfluencerTableClient 
          searchParams={{}}
          onPanelStateChange={setIsAnyPanelOpen}
        />
      </main>
    </div>
  )
} 