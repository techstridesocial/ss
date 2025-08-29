'use client'

import { useState } from 'react'
import { PremiumSection } from '../components/PremiumSection'
import { PremiumContentCard } from '../components/PremiumContentCard'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface PremiumContentSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
  contentType?: 'recent' | 'popular' | 'videos' | 'posts'
}

export const PremiumContentSection = ({ 
  influencer, 
  selectedPlatform,
  contentType = 'recent'
}: PremiumContentSectionProps) => {
  const [showAll, setShowAll] = useState(false)

  // Get content based on platform and type
  const getContent = () => {
    switch (contentType) {
      case 'recent':
        return (influencer as any).recentPosts || (influencer as any).recentVideos || []
      case 'popular':
        return (influencer as any).popularPosts || (influencer as any).topContent || []
      case 'videos':
        if (selectedPlatform === 'tiktok') {
          // TikTok videos are usually in recentPosts
          return (influencer as any).recentPosts || []
        }
        if (selectedPlatform === 'youtube') {
          // YouTube videos could be in recentVideos or recentPosts
          return (influencer as any).recentVideos || (influencer as any).recentPosts || []
        }
        return (influencer as any).recentPosts || []
      case 'posts':
        return (influencer as any).recentPosts || []
      default:
        return (influencer as any).recentPosts || []
    }
  }

  const content = getContent()
  const displayContent = showAll ? content : content.slice(0, 6)

  if (!content || content.length === 0) {
    return null
  }

  const getSectionTitle = () => {
    const platformName = selectedPlatform ? 
      selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 
      'Platform'
    
    switch (contentType) {
      case 'recent': 
        return selectedPlatform === 'youtube' ? 'Recent Videos' :
               selectedPlatform === 'tiktok' ? 'Recent Videos' : 'Recent Posts'
      case 'popular': 
        return selectedPlatform === 'youtube' ? 'Top Performing Videos' :
               selectedPlatform === 'tiktok' ? 'Top Performing Videos' : 'Top Performing Posts'
      case 'videos': 
        return `${platformName} Videos`
      case 'posts':
        return `${platformName} Posts`
      default: 
        return `${platformName} Content`
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return ''
    }
  }

  const getContentMetrics = (post: any) => {
    const metrics = []
    
    // Platform-specific metrics
    if (selectedPlatform === 'youtube') {
      if (post.views) metrics.push({ label: 'Views', value: formatNumber(post.views), color: 'blue' })
      if (post.likes) metrics.push({ label: 'Likes', value: formatNumber(post.likes), color: 'red' })
      if (post.comments) metrics.push({ label: 'Comments', value: formatNumber(post.comments) })
    } else if (selectedPlatform === 'tiktok') {
      if (post.views) metrics.push({ label: 'Views', value: formatNumber(post.views), color: 'blue' })
      if (post.likes) metrics.push({ label: 'Likes', value: formatNumber(post.likes), color: 'red' })
      if (post.shares) metrics.push({ label: 'Shares', value: formatNumber(post.shares) })
    } else { // Instagram
      if (post.likes) metrics.push({ label: 'Likes', value: formatNumber(post.likes), color: 'red' })
      if (post.comments) metrics.push({ label: 'Comments', value: formatNumber(post.comments) })
      if (post.views) metrics.push({ label: 'Views', value: formatNumber(post.views), color: 'blue' })
    }
    
    return metrics.slice(0, 3) // Max 3 metrics per card
  }

  const getImageUrl = (post: any) => {
    return post.thumbnail || post.picture || post.image || post.cover || 
           post.previewUrl || post.preview_url || post.thumbnailUrl || 
           post.thumbnail_url || post.imageUrl || post.image_url
  }

  return (
    <PremiumSection 
      title={getSectionTitle()}
      badge={content.length}
      defaultOpen={contentType === 'recent' || contentType === 'popular'}
    >
      <div className="space-y-6">
        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayContent.map((post: any, index: number) => (
            <PremiumContentCard
              key={index}
              imageUrl={getImageUrl(post)}
              title={post.title || post.caption || post.description}
              url={post.url || post.link}
              metrics={getContentMetrics(post)}
              date={post.created_at ? formatDate(post.created_at) : undefined}
              isVideo={selectedPlatform === 'youtube' || selectedPlatform === 'tiktok'}
            />
          ))}
        </div>

        {/* Show More Button */}
        {content.length > 6 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              {showAll ? 'Show Less' : `Show All ${content.length} Items`}
            </button>
          </div>
        )}

        {/* Content Summary */}
        {content.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {content.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total {selectedPlatform === 'youtube' ? 'Videos' : 'Posts'}
                </div>
              </div>
              
              {/* Calculate and show averages */}
              {(() => {
                const totalLikes = content.reduce((sum: number, post: any) => sum + (post.likes || 0), 0)
                const avgLikes = totalLikes / content.length
                
                if (avgLikes > 0) {
                  return (
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(avgLikes)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Likes</div>
                    </div>
                  )
                }
                return null
              })()}

              {(() => {
                const totalViews = content.reduce((sum: number, post: any) => sum + (post.views || 0), 0)
                const avgViews = totalViews / content.length
                
                if (avgViews > 0) {
                  return (
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(avgViews)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Views</div>
                    </div>
                  )
                }
                return null
              })()}

              {(() => {
                const postsWithComments = content.filter((post: any) => post.comments > 0)
                const totalComments = postsWithComments.reduce((sum: number, post: any) => sum + post.comments, 0)
                const avgComments = postsWithComments.length > 0 ? totalComments / postsWithComments.length : 0
                
                if (avgComments > 0) {
                  return (
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(avgComments)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Comments</div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
