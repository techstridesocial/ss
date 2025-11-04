'use client'

import { useState } from 'react'
import { X, Heart, MessageCircle, Eye, Calendar, ExternalLink, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { formatNumber } from '../utils'

interface Post {
  thumbnail?: string
  text?: string
  likes?: number
  comments?: number
  views?: number
  created?: string
  url?: string
}

interface ContentGridModalProps {
  isOpen: boolean
  onClose: () => void
  posts: Post[]
  title: string
}

export const ContentGridModal = ({ isOpen, onClose, posts, title }: ContentGridModalProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  if (!isOpen || posts.length === 0) return null

  const selectedPost = posts[selectedIndex] as any

  const handlePlayClick = () => {
    if (selectedPost && selectedPost.url) {
      window.open(selectedPost.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {selectedIndex + 1} of {posts.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[600px]">
          
          {/* Left Side - Large Image */}
          <div className="flex-1 relative bg-gray-100 group">
            {selectedPost && (selectedPost.thumbnail || selectedPost.picture || selectedPost.image || selectedPost.cover || 
             selectedPost.previewUrl || selectedPost.preview_url || selectedPost.thumbnailUrl || selectedPost.thumbnail_url ||
             selectedPost.imageUrl || selectedPost.image_url || selectedPost.mediaUrl || selectedPost.media_url || 
             selectedPost.coverImage || selectedPost.cover_image || selectedPost.photoUrl || selectedPost.photo_url ||
             selectedPost.url) ? (
              <>
                <img
                  src={selectedPost.thumbnail || selectedPost.picture || selectedPost.image || selectedPost.cover || 
                       selectedPost.previewUrl || selectedPost.preview_url || selectedPost.thumbnailUrl || selectedPost.thumbnail_url ||
                       selectedPost.imageUrl || selectedPost.image_url || selectedPost.mediaUrl || selectedPost.media_url || 
                       selectedPost.coverImage || selectedPost.cover_image || selectedPost.photoUrl || selectedPost.photo_url ||
                       selectedPost.url}
                  alt="Content preview"
                  className="w-full h-full object-cover"
                />
                {/* Play Button Overlay */}
                {selectedPost.url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePlayClick}
                      className="bg-black bg-opacity-60 text-white rounded-full p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-80 hover:scale-110"
                      title="Play video"
                    >
                      <Play className="w-12 h-12" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-gray-500 text-lg">No image available</div>
              </div>
            )}
            
            {/* Navigation Arrows */}
            {posts.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Right Side - Content Details */}
          <div className="w-80 flex flex-col">
            
            {/* Content Text */}
            <div className="p-6 flex-1 overflow-y-auto">
              {selectedPost.text && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Content</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedPost.text}</p>
                </div>
              )}

              {/* Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Likes</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(selectedPost.likes || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Comments</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(selectedPost.comments || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Views</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(selectedPost.views || 0)}
                    </span>
                  </div>
                </div>

                {/* Engagement Rate */}
                {selectedPost.likes && selectedPost.views && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((selectedPost.likes / selectedPost.views) * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-700">Engagement Rate</div>
                    </div>
                  </div>
                )}

                {/* Date and Link */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {selectedPost.created && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedPost.created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  
                  {selectedPost.url && (
                    <a
                      href={selectedPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original Post
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Thumbnail Navigation */}
        {posts.length > 1 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2 overflow-x-auto">
                {posts.map((post: any, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIndex === index 
                      ? 'border-blue-500 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {post.thumbnail || post.picture || post.image || post.cover || 
                   post.previewUrl || post.preview_url || post.thumbnailUrl || post.thumbnail_url ||
                   post.imageUrl || post.image_url || post.mediaUrl || post.media_url || 
                   post.coverImage || post.cover_image || post.photoUrl || post.photo_url ||
                   post.url ? (
                    <img
                      src={post.thumbnail || post.picture || post.image || post.cover || 
                           post.previewUrl || post.preview_url || post.thumbnailUrl || post.thumbnail_url ||
                           post.imageUrl || post.image_url || post.mediaUrl || post.media_url || 
                           post.coverImage || post.cover_image || post.photoUrl || post.photo_url ||
                           post.url}
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}