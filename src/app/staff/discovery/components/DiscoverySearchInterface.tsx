'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw } from 'lucide-react'
import MinMaxSelector from '@/components/filters/MinMaxSelector'
import FollowersGrowthSelector from '@/components/filters/FollowersGrowthSelector'
import TotalLikesGrowthSelector from '@/components/filters/TotalLikesGrowthSelector'
import ViewsGrowthSelector from '@/components/filters/ViewsGrowthSelector'
import CategorySelector from '@/components/filters/CategorySelector'
import CustomDropdown from '@/components/filters/CustomDropdown'
import MultiSelectDropdown from '@/components/filters/MultiSelectDropdown'
import AutocompleteInput from '@/components/filters/AutocompleteInput'
import MultiAutocompleteInput from '@/components/filters/MultiAutocompleteInput'
import ToggleFilter from '@/components/filters/ToggleFilter'
import { FOLLOWER_VIEW_OPTIONS } from '@/constants/filterOptions'
import { Platform, DiscoveryFilters, ExpandedSections } from '../types/discovery'
import { parseFollowerValue } from '../utils/validation'
import { getPerformanceOptions, getContentOptions, getAccountOptions, InstagramLogo, TikTokLogo, YouTubeLogo } from '../utils/platformHelpers'
import { CollapsibleSectionHeader, sectionVariants } from './CollapsibleSectionHeader'
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  LANGUAGE_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
  LAST_POSTED_OPTIONS,
  SHARES_SAVES_OPTIONS
} from '../utils/constants'

export interface DiscoverySearchInterfaceProps {
  selectedPlatform: Platform
  setSelectedPlatform: React.Dispatch<React.SetStateAction<Platform>>
  onSearch?: () => void
  isLoading?: boolean
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  onFiltersChange?: (filters: DiscoveryFilters) => void
}

export function DiscoverySearchInterface({
  selectedPlatform,
  setSelectedPlatform,
  onSearch,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  onFiltersChange
}: DiscoverySearchInterfaceProps) {
  const [locationTarget, setLocationTarget] = useState<'creator' | 'audience'>('creator')
  const [genderTarget, setGenderTarget] = useState<'creator' | 'audience'>('creator')
  const [ageTarget, setAgeTarget] = useState<'creator' | 'audience'>('creator')
  const [languageTarget, setLanguageTarget] = useState<'creator' | 'audience'>('creator')

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    demographics: false,
    performance: false,
    content: false,
    account: false
  })

  // Performance filter states
  const [followersMin, setFollowersMin] = useState('')
  const [followersMax, setFollowersMax] = useState('')
  const [growthPercentage, setGrowthPercentage] = useState('')
  const [growthPeriod, setGrowthPeriod] = useState('')
  const [engagement, setEngagement] = useState('')
  const [viewsMin, setViewsMin] = useState('')
  const [viewsMax, setViewsMax] = useState('')

  // TikTok-specific performance states
  const [likesGrowthPercentage, setLikesGrowthPercentage] = useState('')
  const [likesGrowthPeriod, setLikesGrowthPeriod] = useState('')
  const [sharesMin, setSharesMin] = useState('')
  const [sharesMax, setSharesMax] = useState('')
  const [savesMin, setSavesMin] = useState('')
  const [savesMax, setSavesMax] = useState('')

  // YouTube-specific performance states
  const [viewsGrowthPercentage, setViewsGrowthPercentage] = useState('')
  const [viewsGrowthPeriod, setViewsGrowthPeriod] = useState('')

  const [hideProfilesInRoster, setHideProfilesInRoster] = useState(false)

  // Content filter states
  const [contentCategoriesTarget, setContentCategoriesTarget] = useState<'creator' | 'audience'>('creator')
  const [selectedContentCategories, setSelectedContentCategories] = useState<string[]>([])
  const [hashtags, setHashtags] = useState('')
  const [mentions, setMentions] = useState('')
  const [captions, setCaptions] = useState('')
  const [collaborations, setCollaborations] = useState('')
  const [hasSponsoredPosts, setHasSponsoredPosts] = useState(false)

  // YouTube-specific content states
  const [topics, setTopics] = useState('')
  const [transcript, setTranscript] = useState('')

  // Demographics filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')

  // Account filter states
  const [bio, setBio] = useState('')
  const [description, setDescription] = useState('')
  const [accountType, setAccountType] = useState('')
  const [selectedSocials, setSelectedSocials] = useState<string[]>([])
  const [fakeFollowers, setFakeFollowers] = useState('')
  const [lastPosted, setLastPosted] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const getCurrentFilters = (): DiscoveryFilters => {
    const filters: DiscoveryFilters = {
      platform: selectedPlatform
    }

    // Performance filters
    if (followersMin || followersMax) {
      if (followersMin) filters.followersMin = parseFollowerValue(followersMin)
      if (followersMax) filters.followersMax = parseFollowerValue(followersMax)
    }

    if (engagement) {
      const match = engagement.match(/greater_than_(\d+(?:\.\d+)?)/)
      if (match && match[1]) {
        filters.engagementRate = parseFloat(match[1])
      }
    }

    if (viewsMin || viewsMax) {
      if (viewsMin) filters.avgViewsMin = parseFollowerValue(viewsMin)
      if (viewsMax) filters.avgViewsMax = parseFollowerValue(viewsMax)
    }

    // Content filters
    if (bio?.trim()) filters.bio = bio.trim()
    if (hashtags?.trim()) filters.hashtags = hashtags.trim()
    if (mentions?.trim()) filters.mentions = mentions.trim()
    if (captions?.trim()) filters.captions = captions.trim()
    if (topics?.trim()) filters.topics = topics.trim()
    if (transcript?.trim()) filters.transcript = transcript.trim()
    if (collaborations?.trim()) filters.collaborations = collaborations.trim()
    if (selectedContentCategories.length > 0) filters.selectedContentCategories = selectedContentCategories

    // Demographics
    if (selectedLocations.length > 0) filters.selectedLocations = selectedLocations
    if (selectedGender) filters.selectedGender = selectedGender
    if (selectedAge) filters.selectedAge = selectedAge
    if (selectedLanguage) filters.selectedLanguage = selectedLanguage

    // Account filters
    if (accountType) filters.accountType = accountType
    if (selectedSocials.length > 0) filters.selectedSocials = selectedSocials
    if (fakeFollowers) filters.fakeFollowers = fakeFollowers
    if (lastPosted) filters.lastPosted = lastPosted
    if (verifiedOnly) filters.verifiedOnly = verifiedOnly

    // Search options
    if (hideProfilesInRoster) filters.hideProfilesInRoster = hideProfilesInRoster

    return filters
  }

  useEffect(() => {
    if (onFiltersChange) {
      const filters = getCurrentFilters()
      onFiltersChange(filters)
    }
  }, [
    selectedPlatform, followersMin, followersMax, engagement, viewsMin, viewsMax,
    bio, hashtags, mentions, captions, topics, transcript, collaborations,
    selectedContentCategories, selectedLocations, selectedGender, selectedAge,
    selectedLanguage, accountType, selectedSocials, fakeFollowers, lastPosted,
    verifiedOnly, hideProfilesInRoster, onFiltersChange
  ])

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const platforms = [
    { id: 'instagram' as Platform, name: 'Instagram', logo: <InstagramLogo /> },
    { id: 'tiktok' as Platform, name: 'TikTok', logo: <TikTokLogo /> },
    { id: 'youtube' as Platform, name: 'YouTube', logo: <YouTubeLogo /> }
  ] as const

  const performanceOptions = getPerformanceOptions(selectedPlatform)
  const contentOptions = getContentOptions(selectedPlatform)
  const accountOptions = getAccountOptions(selectedPlatform)

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Discover Influencers</h3>
      </div>

      {/* Platform Selection Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedPlatform === platform.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{platform.logo}</span>
              <span className="font-bold capitalize">{platform.name}</span>
              {isLoading && selectedPlatform === platform.id && (
                <div className="ml-1 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Search Influencers
            </label>
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchQueryChange?.(e.target.value)}
                  placeholder="Search by username (e.g., cristiano)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onSearch?.()
                    }
                  }}
                />
              </div>
              <button
                onClick={onSearch}
                disabled={!onSearch || isLoading}
                className="px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-r-xl border border-l-0 border-black hover:border-gray-800 disabled:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter an Instagram, TikTok, or YouTube username to find specific influencers
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHideProfilesInRoster(!hideProfilesInRoster)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hideProfilesInRoster ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">Hide Profiles in Roster</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hideProfilesInRoster ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label className="text-sm font-medium text-gray-700">Hide Profiles in Roster</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="mb-8">
        <CollapsibleSectionHeader
          title="Demographics"
          isExpanded={expandedSections.demographics}
          onToggle={() => toggleSection('demographics')}
          className="mb-4"
        />
        <AnimatePresence initial={false}>
          {expandedSections.demographics && (
            <motion.div
              id="demographics-content"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => setLocationTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            locationTarget === 'creator'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button
                          onClick={() => setLocationTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            locationTarget === 'audience'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <MultiAutocompleteInput
                        selectedValues={selectedLocations}
                        onChange={setSelectedLocations}
                        placeholder="Type to search locations (e.g., London, New York, Tokyo)..."
                        apiEndpoint="/api/discovery/locations"
                        additionalParams={{ platform: selectedPlatform }}
                        maxSelections={5}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => setGenderTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            genderTarget === 'creator'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button
                          onClick={() => setGenderTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            genderTarget === 'audience'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <CustomDropdown
                        value={selectedGender}
                        onChange={setSelectedGender}
                        options={GENDER_OPTIONS}
                        placeholder="Any Gender"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => setAgeTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            ageTarget === 'creator'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button
                          onClick={() => setAgeTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            ageTarget === 'audience'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <CustomDropdown
                        value={selectedAge}
                        onChange={setSelectedAge}
                        options={AGE_OPTIONS}
                        placeholder="Any Age"
                      />
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => setLanguageTarget('creator')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            languageTarget === 'creator'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Creator
                        </button>
                        <button
                          onClick={() => setLanguageTarget('audience')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            languageTarget === 'audience'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Audience
                        </button>
                      </div>
                      <AutocompleteInput
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        placeholder="Search languages..."
                        apiEndpoint="/api/discovery/languages"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Filter Sections */}
      <div className="space-y-4">
        <div className="border-t border-gray-200"></div>

        {/* Performance Filters */}
        <div className="mb-4">
          <CollapsibleSectionHeader
            title="Performance"
            isExpanded={expandedSections.performance}
            onToggle={() => toggleSection('performance')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.performance && (
              <motion.div
                id="performance-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <MinMaxSelector
                      label={performanceOptions.followersLabel}
                      minValue={followersMin}
                      maxValue={followersMax}
                      onMinChange={setFollowersMin}
                      onMaxChange={setFollowersMax}
                      options={FOLLOWER_VIEW_OPTIONS}
                      placeholder="Any"
                    />

                    <FollowersGrowthSelector
                      growthPercentage={growthPercentage}
                      growthPeriod={growthPeriod}
                      onGrowthPercentageChange={setGrowthPercentage}
                      onGrowthPeriodChange={setGrowthPeriod}
                      label={selectedPlatform === 'youtube' ? 'Subscribers Growth' : 'Followers Growth'}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Engagement</label>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Rate</label>
                          <CustomDropdown
                            value={engagement}
                            onChange={setEngagement}
                            options={performanceOptions.engagement}
                            placeholder="Any Engagement"
                          />
                        </div>
                      </div>
                    </div>

                    <MinMaxSelector
                      label={performanceOptions.viewsLabel}
                      minValue={viewsMin}
                      maxValue={viewsMax}
                      onMinChange={setViewsMin}
                      onMaxChange={setViewsMax}
                      options={FOLLOWER_VIEW_OPTIONS}
                      placeholder="Any"
                    />

                    {selectedPlatform === 'youtube' && (
                      <ViewsGrowthSelector
                        growthPercentage={viewsGrowthPercentage}
                        growthPeriod={viewsGrowthPeriod}
                        onGrowthPercentageChange={setViewsGrowthPercentage}
                        onGrowthPeriodChange={setViewsGrowthPeriod}
                      />
                    )}

                    {selectedPlatform === 'tiktok' && (
                      <>
                        <TotalLikesGrowthSelector
                          growthPercentage={likesGrowthPercentage}
                          growthPeriod={likesGrowthPeriod}
                          onGrowthPercentageChange={setLikesGrowthPercentage}
                          onGrowthPeriodChange={setLikesGrowthPeriod}
                        />
                        <MinMaxSelector
                          label="Shares"
                          minValue={sharesMin}
                          maxValue={sharesMax}
                          onMinChange={setSharesMin}
                          onMaxChange={setSharesMax}
                          options={SHARES_SAVES_OPTIONS}
                          placeholder="Any"
                        />
                        <MinMaxSelector
                          label="Saves"
                          minValue={savesMin}
                          maxValue={savesMax}
                          onMinChange={setSavesMin}
                          onMaxChange={setSavesMax}
                          options={SHARES_SAVES_OPTIONS}
                          placeholder="Any"
                        />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Content Filters */}
        <div className="mb-4">
          <CollapsibleSectionHeader
            title="Content"
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection('content')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.content && (
              <motion.div
                id="content-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {selectedPlatform === 'tiktok' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <AutocompleteInput
                        value={hashtags}
                        onChange={setHashtags}
                        placeholder={`Search ${contentOptions.hashtags.toLowerCase()}...`}
                        apiEndpoint="/api/discovery/hashtags"
                        label={contentOptions.hashtags}
                      />
                      <AutocompleteInput
                        value={topics}
                        onChange={setTopics}
                        placeholder="Search interests..."
                        apiEndpoint="/api/discovery/interests"
                        label="Interests"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{contentOptions.mentions}</label>
                        <input
                          type="text"
                          value={mentions}
                          onChange={(e) => setMentions(e.target.value)}
                          placeholder="Search mentions..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{contentOptions.captions}</label>
                        <input
                          type="text"
                          value={captions}
                          onChange={(e) => setCaptions(e.target.value)}
                          placeholder={`Search ${contentOptions.captions.toLowerCase()}...`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                    </div>
                  ) : selectedPlatform === 'youtube' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <AutocompleteInput
                        value={topics}
                        onChange={setTopics}
                        placeholder="Search topics..."
                        apiEndpoint="/api/discovery/topics"
                        label={contentOptions.topics}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{contentOptions.transcript}</label>
                        <input
                          type="text"
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          placeholder="Search transcript..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <CategorySelector
                        selectedCategories={selectedContentCategories}
                        onCategoriesChange={setSelectedContentCategories}
                        target={contentCategoriesTarget}
                        onTargetChange={setContentCategoriesTarget}
                      />
                      <AutocompleteInput
                        value={hashtags}
                        onChange={setHashtags}
                        placeholder={`Search ${contentOptions.hashtags.toLowerCase()}...`}
                        apiEndpoint="/api/discovery/hashtags"
                        label={contentOptions.hashtags}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{contentOptions.captions}</label>
                        <input
                          type="text"
                          value={captions}
                          onChange={(e) => setCaptions(e.target.value)}
                          placeholder={`Search ${contentOptions.captions.toLowerCase()}...`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <AutocompleteInput
                        value={collaborations}
                        onChange={setCollaborations}
                        placeholder="Search brand partnerships..."
                        apiEndpoint="/api/discovery/partnerships"
                        label={contentOptions.collaborations}
                      />
                      <ToggleFilter
                        label="Sponsored Content"
                        checked={hasSponsoredPosts}
                        onChange={setHasSponsoredPosts}
                        description="Has sponsored posts"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Account Filters */}
        <div className="mb-8">
          <CollapsibleSectionHeader
            title="Account"
            isExpanded={expandedSections.account}
            onToggle={() => toggleSection('account')}
            className="mb-4"
          />
          <AnimatePresence initial={false}>
            {expandedSections.account && (
              <motion.div
                id="account-content"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {selectedPlatform === 'tiktok' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <input
                          type="text"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Search bio content..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <CustomDropdown
                          value={lastPosted}
                          onChange={setLastPosted}
                          options={LAST_POSTED_OPTIONS}
                          placeholder="Any Time"
                        />
                      </div>
                      <ToggleFilter
                        label={accountOptions.verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${accountOptions.verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  ) : selectedPlatform === 'youtube' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Search description content..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <CustomDropdown
                          value={lastPosted}
                          onChange={setLastPosted}
                          options={LAST_POSTED_OPTIONS}
                          placeholder="Any Time"
                        />
                      </div>
                      <ToggleFilter
                        label={accountOptions.verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${accountOptions.verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <input
                          type="text"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Search bio content..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <CustomDropdown
                          value={accountType}
                          onChange={setAccountType}
                          options={accountOptions.accountTypes}
                          placeholder="Any Type"
                        />
                      </div>
                      <MultiSelectDropdown
                        label="Socials"
                        selectedValues={selectedSocials}
                        onChange={setSelectedSocials}
                        options={SOCIAL_PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fake Followers</label>
                        <CustomDropdown
                          value={fakeFollowers}
                          onChange={setFakeFollowers}
                          options={accountOptions.fakeFollowers}
                          placeholder="Any Amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Posted</label>
                        <CustomDropdown
                          value={lastPosted}
                          onChange={setLastPosted}
                          options={LAST_POSTED_OPTIONS}
                          placeholder="Any Time"
                        />
                      </div>
                      <ToggleFilter
                        label={accountOptions.verifiedLabel}
                        checked={verifiedOnly}
                        onChange={setVerifiedOnly}
                        description={`Show only ${accountOptions.verifiedLabel.toLowerCase()} creators`}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onSearch}
          disabled={!onSearch || isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Search className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Searching...' : 'Search Influencers'}
        </button>
      </div>
    </div>
  )
}

