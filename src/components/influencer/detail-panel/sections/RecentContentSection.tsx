'use client'

import { ExternalLink, Heart, MessageCircle, Eye, Calendar, Hash } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface RecentContentSectionProps {
  influencer: InfluencerData
}

export const RecentContentSection = ({ influencer }: RecentContentSectionProps) => {
  const recentPosts = (influencer as any).recentPosts || []
  const popularPosts = (influencer as any).popularPosts || []
  
  const hasContent = recentPosts.length > 0 || popularPosts.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <CollapsibleSection title="Recent & Popular Content" defaultOpen={false}>
      <div className="space-y-6">
        
        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Posts</h4>
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{post.created ? new Date(post.created).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="View post"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  {post.text && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {post.text}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {post.likes !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                      )}
                      {post.comments !== undefined && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                      )}
                    </div>
                    
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Hash className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">
                          {post.hashtags.slice(0, 2).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Posts */}
        {popularPosts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Posts</h4>
            <div className="space-y-3">
              {popularPosts.slice(0, 3).map((post: any, index: number) => (
                <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    {post.thumbnail && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.thumbnail}
                          alt="Post thumbnail"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{post.created ? new Date(post.created).toLocaleDateString() : 'Unknown'}</span>
                          {post.type && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {post.type}
                            </span>
                          )}
                        </div>
                        {post.url && (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="View post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      {post.text && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {post.text}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        {post.views !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span className="font-medium">{formatNumber(post.views)} views</span>
                          </div>
                        )}
                        {post.likes !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span className="font-medium">{formatNumber(post.likes)} likes</span>
                          </div>
                        )}
                        {post.comments !== undefined && (
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span className="font-medium">{formatNumber(post.comments)} comments</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}