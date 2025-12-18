import React from 'react'
import { getBrandLogo, getBrandColor } from '@/components/icons/BrandLogos'
import { Platform, PerformanceOptions, ContentOptions, AccountOptions } from '../types/discovery'

/**
 * Gets platform icon JSX component
 */
export const getPlatformIconJSX = (platformType: string) => {
  return getBrandLogo(platformType, "w-4 h-4")
}

/**
 * Gets platform color class
 */
export const getPlatformColor = (platformType: string) => {
  return getBrandColor(platformType)
}

/**
 * Platform logo components
 */
export const InstagramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export const TikTokLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export const YouTubeLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

/**
 * Gets platform-specific performance filter options
 */
export const getPerformanceOptions = (selectedPlatform: Platform): PerformanceOptions => {
  switch (selectedPlatform) {
    case 'youtube':
      return {
        followersLabel: 'Subscribers',
        viewsLabel: 'Video Views',
        engagement: [
          { value: '', label: 'Any Engagement' },
          { value: 'greater_than_0.5', label: '≥ 0.5%' },
          { value: 'greater_than_1', label: '≥ 1%' },
          { value: 'greater_than_2', label: '≥ 2%' },
          { value: 'greater_than_3', label: '≥ 3%' },
          { value: 'greater_than_4', label: '≥ 4%' },
          { value: 'greater_than_5', label: '≥ 5%' }
        ]
      }
    case 'tiktok':
      return {
        followersLabel: 'Followers',
        viewsLabel: 'Views',
        engagement: [
          { value: '', label: 'Any Engagement' },
          { value: 'greater_than_2', label: '≥ 2%' },
          { value: 'greater_than_5', label: '≥ 5%' },
          { value: 'greater_than_8', label: '≥ 8%' },
          { value: 'greater_than_10', label: '≥ 10%' },
          { value: 'greater_than_15', label: '≥ 15%' },
          { value: 'greater_than_20', label: '≥ 20%' }
        ]
      }
    default: // instagram
      return {
        followersLabel: 'Followers',
        viewsLabel: 'Views',
        engagement: [
          { value: '', label: 'Any Engagement' },
          { value: 'hidden_likes', label: 'Hidden likes' },
          { value: 'greater_than_0.5', label: '≥ 0.5%' },
          { value: 'greater_than_1', label: '≥ 1%' },
          { value: '2_average', label: '≥ 2% (average)' },
          { value: '3', label: '≥ 3%' },
          { value: '4', label: '≥ 4%' },
          { value: '5', label: '≥ 5%' },
          { value: '6', label: '≥ 6%' },
          { value: '7', label: '≥ 7%' },
          { value: '8', label: '≥ 8%' },
          { value: '9', label: '≥ 9%' },
          { value: '10', label: '≥ 10%' }
        ]
      }
  }
}

/**
 * Gets platform-specific content filter options
 */
export const getContentOptions = (selectedPlatform: Platform): ContentOptions => {
  switch (selectedPlatform) {
    case 'youtube':
      return {
        categories: [
          { value: 'gaming', label: 'Gaming' },
          { value: 'tech_reviews', label: 'Tech Reviews' },
          { value: 'tutorials', label: 'Tutorials' },
          { value: 'vlogs', label: 'Vlogs' },
          { value: 'music', label: 'Music' },
          { value: 'entertainment', label: 'Entertainment' },
          { value: 'education', label: 'Education' },
          { value: 'cooking', label: 'Cooking' },
          { value: 'fitness', label: 'Fitness' },
          { value: 'beauty', label: 'Beauty' },
          { value: 'travel', label: 'Travel' },
          { value: 'business', label: 'Business' },
          { value: 'lifestyle', label: 'Lifestyle' },
          { value: 'comedy', label: 'Comedy' },
          { value: 'news', label: 'News' }
        ],
        hashtags: 'Video Tags',
        captions: 'Video Descriptions',
        collaborations: 'Channel Collaborations',
        topics: 'Topics',
        transcript: 'Transcript'
      }
    case 'tiktok':
      return {
        categories: [
          { value: 'dance', label: 'Dance' },
          { value: 'comedy', label: 'Comedy' },
          { value: 'beauty', label: 'Beauty' },
          { value: 'fashion', label: 'Fashion' },
          { value: 'food', label: 'Food' },
          { value: 'pets', label: 'Pets' },
          { value: 'diy_crafts', label: 'DIY & Crafts' },
          { value: 'fitness', label: 'Fitness' },
          { value: 'travel', label: 'Travel' },
          { value: 'music', label: 'Music' },
          { value: 'lifestyle', label: 'Lifestyle' },
          { value: 'education', label: 'Education' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'tech', label: 'Tech' },
          { value: 'business', label: 'Business' }
        ],
        hashtags: 'TikTok Hashtags',
        mentions: 'Mentions',
        captions: 'Video Captions',
        collaborations: 'TikTok Collaborations'
      }
    default: // instagram
      return {
        categories: [
          { value: 'television_film', label: 'Television & film' },
          { value: 'music', label: 'Music' },
          { value: 'shopping_retail', label: 'Shopping & retail' },
          { value: 'entertainment_pop_culture', label: 'Entertainment & pop culture' },
          { value: 'family_relationships', label: 'Family & relationships' },
          { value: 'fitness_yoga', label: 'Fitness & yoga' },
          { value: 'food_cooking', label: 'Food & cooking' },
          { value: 'beauty_makeup', label: 'Beauty & makeup' },
          { value: 'fashion_outfits', label: 'Fashion & outfits' },
          { value: 'photography_art', label: 'Photography & art' },
          { value: 'travel_tourism', label: 'Travel & tourism' },
          { value: 'business_entrepreneurship', label: 'Business & entrepreneurship' },
          { value: 'sports', label: 'Sports' },
          { value: 'wellness_mindfulness', label: 'Wellness & mindfulness' },
          { value: 'home_garden', label: 'Home & garden' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'books_literature', label: 'Books & literature' },
          { value: 'cars_motorcycles', label: 'Cars & motorcycles' },
          { value: 'diy_crafts', label: 'DIY & crafts' },
          { value: 'animals_pets', label: 'Animals & pets' },
          { value: 'technology', label: 'Technology' },
          { value: 'science_nature', label: 'Science & nature' },
          { value: 'news_politics', label: 'News & politics' },
          { value: 'activism_causes', label: 'Activism & causes' },
          { value: 'health_medicine', label: 'Health & medicine' },
          { value: 'education_learning', label: 'Education & learning' },
          { value: 'finance_investing', label: 'Finance & investing' },
          { value: 'other', label: 'Other' }
        ],
        hashtags: 'Hashtags',
        captions: 'Captions',
        collaborations: 'Brand Collaborations'
      }
  }
}

/**
 * Gets platform-specific account filter options
 */
export const getAccountOptions = (selectedPlatform: Platform): AccountOptions => {
  switch (selectedPlatform) {
    case 'youtube':
      return {
        accountTypes: [
          { value: '', label: 'Any Type' },
          { value: 'personal', label: 'Personal' },
          { value: 'brand', label: 'Brand' },
          { value: 'music', label: 'Music' },
          { value: 'gaming', label: 'Gaming' }
        ],
        verifiedLabel: 'YouTube Verified',
        fakeFollowers: [
          { value: '', label: 'Any Amount' },
          { value: '10', label: '≤ 10%' },
          { value: '20', label: '≤ 20%' },
          { value: '30', label: '≤ 30%' }
        ]
      }
    case 'tiktok':
      return {
        accountTypes: [
          { value: '', label: 'Any Type' },
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' }
        ],
        verifiedLabel: 'TikTok Verified',
        fakeFollowers: [
          { value: '', label: 'Any Amount' },
          { value: '15', label: '≤ 15%' },
          { value: '25', label: '≤ 25%' },
          { value: '40', label: '≤ 40%' }
        ]
      }
    default: // instagram
      return {
        accountTypes: [
          { value: '', label: 'Any Type' },
          { value: 'regular', label: 'Regular' },
          { value: 'business', label: 'Business' },
          { value: 'creator', label: 'Creator' }
        ],
        verifiedLabel: 'Instagram Verified',
        fakeFollowers: [
          { value: '', label: 'Any Amount' },
          { value: '25', label: '≤ 25%' },
          { value: '35', label: '≤ 35%' },
          { value: '50', label: '≤ 50%' }
        ]
      }
  }
}

