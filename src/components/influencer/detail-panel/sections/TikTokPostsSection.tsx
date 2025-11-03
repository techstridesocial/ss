'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Eye, Calendar, ExternalLink, Play, Maximize2 } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { ContentGridModal } from '../components/ContentGridModal'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface TikTokPostsSectionProps {
  influencer: InfluencerData
}

export const TikTokPostsSection = ({ influencer }: TikTokPostsSectionProps) => {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<{ posts: any[], title: string }>({ posts: [], title: '' })

  const recentPosts = influencer.recentPosts || []
  const popularPosts = influencer.popularPosts || []
  
  // 🚨 DEBUG: Log actual post data to see what we're getting
  console.log('🚨 TikTok Posts Debug:', {
    recentPostsCount: recentPosts.length,
    popularPostsCount: popularPosts.length,
    recentPostSample: recentPosts[0],
    popularPostSample: popularPosts[0],
    recentPostKeys: recentPosts[0] ? Object.keys(recentPosts[0]) : 'no posts',
    popularPostKeys: popularPosts[0] ? Object.keys(popularPosts[0]) : 'no posts'
  })
  
  const hasAnyPosts = recentPosts.length > 0 || popularPosts.length > 0
  
  if (!hasAnyPosts) {
    return (
      <CollapsibleSection title="Recent & Popular Content">
        <div className="text-gray-500 text-sm italic">
          No recent or popular content data available
        </div>
      </CollapsibleSection>
    )
  }

  const openModal = (posts: any[], title: string) => {
    setModalContent({ posts, title })
    setShowModal(true)
  }

  const PostCard = ({ post, type }: { post: any, type: 'recent' | 'popular' }) => {
    // Debug: Log the post structure to see what image fields are available
    console.log(`🖼️ ${type} Post Debug:`, {
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
                   post.coverImage || post.cover_image || post.photoUrl || post.photo_url
    
    // Enhanced debug for image URL resolution
    console.log(`🖼️ Image URL Debug for ${type}:`, {
      foundImageUrl: !!imageUrl,
      imageUrl: imageUrl,
      hasUrl: !!post.url,
      url: post.url
    })
    
    const handlePlayClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent opening the modal
      if (post.url) {
        window.open(post.url, '_blank', 'noopener,noreferrer')
      }
    }
    
    return (
      <div 
        className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => openModal([post], `${type === 'recent' ? 'Recent' : 'Popular'} Content`)}
      >
        {/* Large Image as Main Focus */}
        <div className="relative aspect-[9/16] bg-gray-100">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt="Content preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
                             {/* Video Play Overlay */}
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                 <button
                   onClick={handlePlayClick}
                   className="bg-white bg-opacity-90 rounded-full p-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-opacity-100 hover:scale-110"
                   title={post.url ? "Play video on TikTok" : "No video URL available"}
                   disabled={!post.url}
                 >
                   <Play className="w-8 h-8 text-gray-800" />
                 </button>
               </div>
              {/* Expand Icon */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </>
                      ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
                <div className="text-center">
                  <div className="bg-white bg-opacity-90 rounded-full p-4 mb-3 shadow-lg">
                    <Play className="w-12 h-12 text-pink-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">TikTok Video</span>
                  <div className="text-xs text-gray-500 mt-1">Tap to view</div>
                </div>
              </div>
            )}

          {/* Performance Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black bg-opacity-75 backdrop-blur-sm rounded-xl p-3 text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatNumber(post.views || 0)}
                </span>
                <span className="flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  {formatNumber(post.likes || 0)}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {formatNumber(post.comments || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4">
          {post.text && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-relaxed">
              {post.text}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {post.created ? new Date(post.created).toLocaleDateString() : 'Date unknown'}
            </div>
                         {post.url && (
               <a
                 href={post.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="flex items-center text-xs text-blue-600 group-hover:text-blue-800 hover:underline"
               >
                 <ExternalLink className="w-3 h-3 mr-1" />
                 View
               </a>
             )}
          </div>
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
                <h4 className="text-lg font-semibold text-gray-900">Popular Posts</h4>
                {popularPosts.length > 2 && (
                  <button
                    onClick={() => openModal(popularPosts, 'Popular Content')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    View All ({popularPosts.length})
                    <Maximize2 className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
              
              {/* 2-Grid Layout for Popular Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularPosts.slice(0, 2).map((post, index) => (
                  <PostCard key={`popular-${index}`} post={post} type="popular" />
                ))}
              </div>
              
              {popularPosts.length > 2 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => openModal(popularPosts, 'Popular Content')}
                    className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    View {popularPosts.length - 2} More Popular Posts
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
                {recentPosts.slice(0, 2).map((post, index) => (
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

          {/* Enhanced Performance Summary */}
          {(recentPosts.length > 0 || popularPosts.length > 0) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Content Performance Overview
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentPosts.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Recent Content</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Avg Views</span>
                        <span className="font-semibold text-blue-600">
                          {formatNumber(recentPosts.reduce((sum, post) => sum + (post.views || 0), 0) / recentPosts.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Avg Likes</span>
                        <span className="font-semibold text-red-500">
                          {formatNumber(recentPosts.reduce((sum, post) => sum + (post.likes || 0), 0) / recentPosts.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {popularPosts.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Popular Content</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Avg Views</span>
                        <span className="font-semibold text-blue-600">
                          {formatNumber(popularPosts.reduce((sum, post) => sum + (post.views || 0), 0) / popularPosts.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Avg Likes</span>
                        <span className="font-semibold text-red-500">
                          {formatNumber(popularPosts.reduce((sum, post) => sum + (post.likes || 0), 0) / popularPosts.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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