'use client'

import React, { useState } from 'react'
import { Search, Heart, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import InfluencerDetailPanel from '@/components/influencer/InfluencerDetailPanel'
import { CreditCard as CreditCardComponent } from '@/components/credits/CreditDisplay'
import SavedInfluencersTable from '../../../components/staff/SavedInfluencersTable'
import { useToast } from '../../../components/ui/use-toast'
import { Toaster } from '../../../components/ui/toaster'
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'
import { useStaffSavedInfluencers } from '../../../lib/hooks/useStaffSavedInfluencers'
import { Platform, DiscoveryFilters } from './types/discovery'
import { DiscoverySearchInterface } from './components/DiscoverySearchInterface'
import { DiscoveredInfluencersTable } from './components/DiscoveredInfluencersTable'
import { MetricCard } from './components/MetricCard'
import { useDiscoverySearch } from './hooks/useDiscoverySearch'
import { useInfluencerActions } from './hooks/useInfluencerActions'
import { fetchInfluencerProfile } from './services/discoveryService'
import { convertInfluencerToDetailData } from './utils/influencerConverter'

export default function DiscoveryPageClient() {
  const { heartedInfluencers } = useHeartedInfluencers()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram')
  const { saveInfluencer, isInfluencerSaved } = useStaffSavedInfluencers(selectedPlatform)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilters, setCurrentFilters] = useState<DiscoveryFilters>({ platform: selectedPlatform })

  const {
    searchResults,
    isSearching,
    searchError,
    apiWarning,
    handleSearch
  } = useDiscoverySearch(selectedPlatform, searchQuery, currentFilters)

  const {
    detailPanelOpen,
    setDetailPanelOpen,
    detailInfluencer,
    setDetailInfluencer,
    detailCity,
    detailCountry,
    detailLoading,
    handleHeartToggle,
    handleViewProfile
  } = useInfluencerActions(selectedPlatform, saveInfluencer, isInfluencerSaved)

  const handlePlatformSwitch = async (platform: Platform) => {
    setSelectedPlatform(platform)

    if (detailInfluencer) {
      const platformContact = detailInfluencer.contacts?.find((contact) => contact.type === platform)

      if (!platformContact) {
        toast({
          title: "Platform not available",
          description: `No ${platform} contact found for this influencer.`,
          variant: "destructive"
        })
        return
      }

      const contactUrl = platformContact.value
      let platformUserId: string | null = null

      if (contactUrl) {
        if (platform === 'tiktok') {
          const tiktokMatch = contactUrl.match(/\/user\/(\d+)/)
          if (tiktokMatch) {
            platformUserId = tiktokMatch[1] || null
          }
        } else if (platform === 'instagram') {
          const patterns = [
            /\/user\/(\d+)/,
            /\/accounts\/.*\/(\d+)/,
            /instagram\.com\/([a-zA-Z0-9_.]+)/,
            /\/p\/user\/(\d+)/,
            /profile\/(\d+)/
          ]

          for (const pattern of patterns) {
            const match = contactUrl.match(pattern)
            if (match) {
              platformUserId = match[1] || null
              break
            }
          }
        } else if (platform === 'youtube') {
          const youtubeMatch = contactUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/)
          if (youtubeMatch) {
            platformUserId = youtubeMatch[1] || null
          }
        }

        if (!platformUserId) {
          toast({
            title: "Unable to switch platform",
            description: `Could not extract userId from ${platform} contact URL.`,
            variant: "destructive"
          })
          return
        }
      } else {
        toast({
          title: "Unable to switch platform",
          description: `No contact URL found for ${platform}.`,
          variant: "destructive"
        })
        return
      }

      // TypeScript now knows platformUserId is string here
      try {
        const profileData = await fetchInfluencerProfile(platformUserId, platform, {
          includeReport: true,
          includePerformanceData: true,
          searchResultData: {
            username: detailInfluencer.username,
            handle: detailInfluencer.handle,
            followers: detailInfluencer.followers,
            engagement_rate: detailInfluencer.engagement_rate,
            platform: platform,
            profile_picture: detailInfluencer.profile_picture,
            location: detailInfluencer.location,
            verified: detailInfluencer.verified
          }
        })

        const updatedInfluencer = {
          ...detailInfluencer,
          followers: profileData.followers || detailInfluencer.followers,
          engagement_rate: profileData.engagementRate || profileData.engagement_rate || detailInfluencer.engagement_rate,
          engagementRate: profileData.engagementRate || detailInfluencer.engagementRate,
          avgLikes: profileData.avgLikes || detailInfluencer.avgLikes,
          avgComments: profileData.avgComments || detailInfluencer.avgComments,
          profile_picture: profileData.profile_picture || profileData.profilePicture || detailInfluencer.profile_picture,
          profilePicture: profileData.profile_picture || profileData.profilePicture || detailInfluencer.profilePicture,
          recentPosts: profileData.recentPosts || detailInfluencer.recentPosts,
          popularPosts: profileData.popularPosts || detailInfluencer.popularPosts,
          sponsoredPosts: profileData.sponsoredPosts || detailInfluencer.sponsoredPosts,
          audience: profileData.audience || detailInfluencer.audience,
          audience_interests: profileData.audience_interests || detailInfluencer.audience_interests,
          relevant_hashtags: profileData.relevant_hashtags || detailInfluencer.relevant_hashtags,
          brand_partnerships: profileData.brand_partnerships || detailInfluencer.brand_partnerships,
          content_topics: profileData.content_topics || detailInfluencer.content_topics,
          platforms: {
            ...detailInfluencer.platforms,
            [platform]: {
              followers: profileData.followers,
              engagementRate: profileData.engagementRate,
              avgLikes: profileData.avgLikes,
              avgComments: profileData.avgComments,
              avgShares: profileData.avgShares,
              fake_followers_percentage: profileData.fake_followers_percentage,
              credibility: profileData.credibility,
              audience: profileData.audience,
              audience_interests: profileData.audience_interests,
              audience_languages: profileData.audience_languages,
              relevant_hashtags: profileData.relevant_hashtags,
              brand_partnerships: profileData.brand_partnerships,
              content_topics: profileData.content_topics,
              statsByContentType: profileData.statsByContentType,
              topContent: profileData.topContent,
              content_performance: profileData.content_performance,
              profile_picture: profileData.profile_picture || profileData.profilePicture,
              profilePicture: profileData.profile_picture || profileData.profilePicture,
              recentPosts: profileData.recentPosts,
              popularPosts: profileData.popularPosts,
              sponsoredPosts: profileData.sponsoredPosts,
              statHistory: profileData.statHistory,
              paidPostPerformance: profileData.paidPostPerformance,
              ...profileData
            }
          },
          contacts: profileData.contacts || detailInfluencer.contacts || [],
          ...profileData,
          lastUpdated: Date.now(),
          currentPlatform: platform
        }

        setDetailInfluencer(updatedInfluencer)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast({
          title: "Failed to load platform data",
          description: `Failed to load ${platform} data: ${errorMessage}`,
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />

      <main className="px-4 lg:px-6 pb-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CreditCardComponent
            title="Monthly Credits"
            period="monthly"
            icon={<TrendingUp size={20} />}
          />
          <CreditCardComponent
            title="Yearly Credits"
            period="yearly"
            icon={<Calendar size={20} />}
          />
          <MetricCard
            title="Search Mode"
            value={searchQuery.trim() ? 'Exact Match' : 'Discovery'}
            icon={<Search size={20} />}
            trend={searchQuery.trim() ? `Searching: "${searchQuery}"` : 'Browse all influencers'}
          />
        </div>

        {/* API Status Alert */}
        {apiWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Modash API Configuration Required</p>
              <p className="text-sm text-yellow-700 mt-1">{apiWarning}</p>
              <div className="text-xs text-yellow-600 mt-2 space-y-1">
                <p>To activate your Modash API key:</p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li>Visit <a href="https://marketer.modash.io/developer" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">https://marketer.modash.io/developer</a></li>
                  <li>Log in with your Modash account</li>
                  <li>Verify your API key is listed and active</li>
                  <li>Check if Discovery API access is enabled for your plan</li>
                </ol>
                <p className="mt-2">If issues persist, contact support@modash.io with reference to the Discovery API endpoint issues.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {searchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{searchError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              {
                key: 'search',
                label: 'Search',
                icon: Search
              },
              {
                key: 'saved',
                label: 'Saved',
                icon: Heart
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'search' | 'saved')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-bold capitalize">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'search' ? (
          <div className="flex flex-col lg:flex-row gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Left Column - Search Interface */}
            <div className="w-full lg:w-1/3 lg:flex-shrink-0">
              <DiscoverySearchInterface
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                onSearch={handleSearch}
                isLoading={isSearching}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onFiltersChange={setCurrentFilters}
              />
            </div>

            {/* Right Column - Results Table */}
            <div className="flex-1 min-w-0 min-h-0">
              <DiscoveredInfluencersTable
                selectedPlatform={selectedPlatform}
                searchResults={searchResults}
                isLoading={isSearching}
                error={searchError}
                searchQuery={searchQuery}
                onViewProfile={handleViewProfile}
                isInfluencerSaved={isInfluencerSaved}
                handleHeartToggle={handleHeartToggle}
              />
            </div>
          </div>
        ) : (
          /* Saved Tab Content */
          <div className="space-y-6">
            {/* Platform Selector for Saved Tab */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Platform:</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            {/* Saved Influencers Table */}
            <SavedInfluencersTable
              selectedPlatform={selectedPlatform}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </main>

      <InfluencerDetailPanel
        influencer={convertInfluencerToDetailData(detailInfluencer)}
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        selectedPlatform={selectedPlatform}
        onPlatformSwitch={handlePlatformSwitch}
        city={detailCity}
        country={detailCountry}
        loading={detailLoading}
      />

      <Toaster />
    </div>
  )
}
