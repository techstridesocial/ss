'use client'

import React from 'react'
import { BarChart3, TrendingUp, Video, Image, ExternalLink } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface ContentAnalyticsSectionProps {
  influencer: InfluencerData
}

export const ContentAnalyticsSection = ({ influencer }: ContentAnalyticsSectionProps) => {
  const recentPosts = influencer.recentPosts || []
  const popularPosts = influencer.popularPosts || []
  const statsByContentType = influencer.statsByContentType || {}
  
  // Check if we have any content data
  const hasAnyData = recentPosts.length > 0 || popularPosts.length > 0 || 
    Object.keys(statsByContentType).length > 0
  
  if (!hasAnyData) {
    return null
  }
  
  return (
    <CollapsibleSection title="Content Analytics & Performance" defaultOpen={false}>
      <div className="space-y-5 md:space-y-4">
        
        {/* 🆕 NEW: CONTENT TYPE PERFORMANCE */}
        {Object.keys(statsByContentType).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance by Content Type</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statsByContentType).map(([type, stats]: [string, any]) => (
                <div key={type} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900 capitalize mb-2">{type}</div>
                  {stats.avgLikes && (
                    <div className="text-xs text-gray-600">
                      Avg Likes: {formatNumber(stats.avgLikes)}
                    </div>
                  )}
                  {stats.avgViews && (
                    <div className="text-xs text-gray-600">
                      Avg Views: {formatNumber(stats.avgViews)}
                    </div>
                  )}
                  {stats.avgComments && (
                    <div className="text-xs text-gray-600">
                      Avg Comments: {formatNumber(stats.avgComments)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: RECENT POSTS */}
        {recentPosts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Posts</h4>
            <div className="space-y-2">
              {recentPosts.slice(0, 5).map((post: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white border rounded-lg">
                  <div className="flex-1">
                    {post.text && (
                      <div className="text-sm text-gray-800 mb-2 line-clamp-3">
                        {post.text}
                      </div>
                    )}
                    
                    {/* Post metrics */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {post.likes > 0 && <span>{formatNumber(post.likes)} likes</span>}
                      {post.comments > 0 && <span>{formatNumber(post.comments)} comments</span>}
                      {post.views > 0 && <span>{formatNumber(post.views)} views</span>}
                      {post.created && <span>{new Date(post.created).toLocaleDateString()}</span>}
                    </div>
                    
                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.slice(0, 5).map((hashtag: string, hIndex: number) => (
                          <span key={hIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Brand mentions */}
                    {post.mentions && post.mentions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.mentions.slice(0, 3).map((mention: string, mIndex: number) => (
                          <span key={mIndex} className="px-1 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                            @{mention}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Post link */}
                  {post.url && (
                    <a 
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: TOP PERFORMING POSTS */}
        {popularPosts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Posts</h4>
            <div className="space-y-3">
              {popularPosts.slice(0, 3).map((post: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg">
                  {/* Thumbnail */}
                  {post.thumbnail && (
                    <img 
                      src={post.thumbnail} 
                      alt="Top post"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    {post.text && (
                      <div className="text-sm text-gray-800 mb-2 line-clamp-2">
                        {post.text}
                      </div>
                    )}
                    
                    {/* Performance metrics */}
                    <div className="flex items-center space-x-4 text-sm">
                      {post.likes > 0 && (
                        <span className="text-red-600 font-medium">
                          ❤️ {formatNumber(post.likes)}
                        </span>
                      )}
                      {post.views > 0 && (
                        <span className="text-blue-600 font-medium">
                          👁️ {formatNumber(post.views)}
                        </span>
                      )}
                      {post.comments > 0 && (
                        <span className="text-green-600 font-medium">
                          💬 {formatNumber(post.comments)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {post.created && new Date(post.created).toLocaleDateString()}
                      {post.type && ` • ${post.type}`}
                    </div>
                  </div>
                  
                  {/* Post link */}
                  {post.url && (
                    <a 
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 text-xs font-medium flex items-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}