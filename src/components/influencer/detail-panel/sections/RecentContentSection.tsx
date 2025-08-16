'use client'

import { useState } from 'react'
import { ExternalLink, Heart, MessageCircle, Eye, Calendar, Hash, Play, Maximize2 } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { ContentGridModal } from '../components/ContentGridModal'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface RecentContentSectionProps {
  influencer: InfluencerData
}

export const RecentContentSection = ({ influencer }: RecentContentSectionProps) => {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<{ posts: any[], title: string }>({ posts: [], title: '' })
  
  const recentPosts = (influencer as any).recentPosts || []
  const popularPosts = (influencer as any).popularPosts || []
  
  const hasContent = recentPosts.length > 0 || popularPosts.length > 0

  if (!hasContent) {
    return null
  }

  const openModal = (posts: any[], title: string) => {
    setModalContent({ posts, title })
    setShowModal(true)
  }

  const PostCard = ({ post, type, isPopular = false }: { post: any, type: 'recent' | 'popular', isPopular?: boolean }) => {
    // Debug: Log the post structure to see what image fields are available
    console.log(`🖼️ ${type} Post Debug (General):`, {
      postKeys: Object.keys(post),
      thumbnail: post.thumbnail,
      picture: post.picture,
      image: post.image,
      cover: post.cover,
      url: post.url,
      media_url: post.media_url,
      fullPost: post
    })
    
    // Try different possible image field names from Modash API
    const imageUrl = post.thumbnail || post.picture || post.image || post.cover || 
                     post.previewUrl || post.preview_url || post.thumbnailUrl || post.thumbnail_url ||
                     post.imageUrl || post.image_url || post.mediaUrl || post.media_url || 
                     post.coverImage || post.cover_image || post.photoUrl || post.photo_url ||
                     post.url
    
    const handlePlayClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent opening the modal
      if (post.url) {
        window.open(post.url, '_blank', 'noopener,noreferrer')
      }
    }
    
    return (
      <div 
        className={`group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
          isPopular 
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200' 
            : 'bg-white border border-gray-200'
        }`}
        onClick={() => openModal([post], `${type === 'recent' ? 'Recent' : 'Top Performing'} Content`)}
      >
        {/* Large Image as Main Focus */}
        <div className={`relative aspect-square ${
          isPopular ? 'bg-gradient-to-br from-yellow-100 to-orange-100' : 'bg-gray-100'
        }`}>
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={`${type} post preview`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Play/View Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={handlePlayClick}
                  className={`rounded-full p-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:scale-110 ${
                    isPopular ? 'bg-yellow-400 bg-opacity-90 hover:bg-opacity-100' : 'bg-white bg-opacity-90 hover:bg-opacity-100'
                  }`}
                  title={post.url ? "Play video" : "No video URL available"}
                  disabled={!post.url}
                >
                  <Play className="w-8 h-8 text-gray-800" />
                </button>
              </div>
              {/* Expand Icon */}
              <div className={`absolute top-3 right-3 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isPopular ? 'bg-orange-500 bg-opacity-80' : 'bg-black bg-opacity-50'
              }`}>
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
              {/* Content Type Badge for YouTube */}
              {post.type && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold capitalize">
                  {post.type === 'video' ? 'VIDEO' : post.type === 'short' ? 'SHORT' : post.type === 'stream' ? 'LIVE' : post.type.toUpperCase()}
                </div>
              )}
              
              {/* Popular Badge */}
              {isPopular && !post.type && (
                <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  TOP
                </div>
              )}
              
              {/* Both badges for popular YouTube content */}
              {isPopular && post.type && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  TOP
                </div>
              )}
            </>
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              isPopular ? 'bg-gradient-to-br from-yellow-100 to-orange-200' : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <div className="text-center">
                <Play className={`w-12 h-12 mx-auto mb-2 ${
                  isPopular ? 'text-orange-400' : 'text-gray-400'
                }`} />
                <span className={`text-sm ${
                  isPopular ? 'text-orange-600 font-medium' : 'text-gray-500'
                }`}>
                  {isPopular ? 'Top Content' : 'No preview available'}
                </span>
              </div>
            </div>
          )}

          {/* Performance Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className={`backdrop-blur-sm rounded-xl p-3 text-white ${
              isPopular ? 'bg-orange-600 bg-opacity-90' : 'bg-black bg-opacity-75'
            }`}>
              <div className="flex items-center justify-between text-xs">
                {post.views !== undefined && (
                  <span className={`flex items-center ${isPopular ? 'font-semibold' : ''}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    {formatNumber(post.views)}
                  </span>
                )}
                {post.likes !== undefined && (
                  <span className={`flex items-center ${isPopular ? 'font-semibold' : ''}`}>
                    <Heart className="w-3 h-3 mr-1" />
                    {formatNumber(post.likes)}
                  </span>
                )}
                {post.comments !== undefined && (
                  <span className={`flex items-center ${isPopular ? 'font-semibold' : ''}`}>
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {formatNumber(post.comments)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 bg-white">
          {/* YouTube Video Title */}
          {post.title && (
            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-relaxed">
              {post.title}
            </h4>
          )}
          
          {/* Post Description/Text */}
          {post.text && !post.title && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-relaxed">
              {post.text}
            </p>
          )}
          
          {/* Show text as description if we have both title and text */}
          {post.text && post.title && (
            <p className="text-xs text-gray-600 line-clamp-1 mb-3 leading-relaxed">
              {post.text}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {post.created ? new Date(post.created).toLocaleDateString() : 'Unknown date'}
            </div>
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center text-xs hover:underline ${
                  isPopular ? 'text-orange-600 group-hover:text-orange-800' : 'text-blue-600 group-hover:text-blue-800'
                }`}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </a>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              <Hash className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600">
                {post.hashtags.slice(0, 3).join(' ')}
              </span>
            </div>
          )}

          {/* Popular Content Indicator */}
          {isPopular && (
            <div className="mt-2 text-xs text-orange-600 font-medium">
              High Performance Content
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <CollapsibleSection title="Recent & Popular Content" defaultOpen={false}>
        <div className="space-y-8">
          
          {/* Popular Posts */}
          {popularPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Top Performing Posts</h4>
                {popularPosts.length > 2 && (
                  <button
                    onClick={() => openModal(popularPosts, 'Top Performing Content')}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                  >
                    View All ({popularPosts.length})
                    <Maximize2 className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
              
              {/* 2-Grid Layout for Popular Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularPosts.slice(0, 2).map((post: any, index: number) => (
                  <PostCard key={`popular-${index}`} post={post} type="popular" isPopular={true} />
                ))}
              </div>
              
              {popularPosts.length > 2 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => openModal(popularPosts, 'Top Performing Content')}
                    className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    View {popularPosts.length - 2} More Top Posts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Posts */}
          {recentPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Recent Posts</h4>
                {recentPosts.length > 2 && (
                  <button
                    onClick={() => openModal(recentPosts, 'Recent Content')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    View All ({recentPosts.length})
                    <Maximize2 className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
              
              {/* 2-Grid Layout for Recent Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentPosts.slice(0, 2).map((post: any, index: number) => (
                  <PostCard key={`recent-${index}`} post={post} type="recent" />
                ))}
              </div>
              
              {recentPosts.length > 2 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => openModal(recentPosts, 'Recent Content')}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    View {recentPosts.length - 2} More Recent Posts
                  </button>
                </div>
              )}
            </div>
          )}
          
        </div>
      </CollapsibleSection>

      {/* Content Grid Modal */}
      <ContentGridModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        posts={modalContent.posts}
        title={modalContent.title}
      />
    </>
  )
}