'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink, MapPin, Shield, Instagram, Youtube, Video, Globe, Users, Heart, MessageCircle, Eye, TrendingUp, Calendar, UserCheck, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InfluencerDetailPanelProps {
  influencer: any | null
  isOpen: boolean
  onClose: () => void
  selectedPlatform?: string
  onPlatformSwitch?: (platform: string) => void
  onSave?: (data: any) => void
  city?: string
  country?: string
  loading?: boolean
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '',
  disabled = false
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'success'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  disabled?: boolean
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
    outline: 'border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
  }
  const sizes = {
    default: 'h-11 px-6 py-2.5 text-sm',
    sm: 'h-9 px-4 py-2 text-sm',
    lg: 'h-12 px-8 py-3 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'default',
  className = ''
}: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'orange'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}) => {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border border-blue-200',
    secondary: 'bg-gray-50 text-gray-700 border border-gray-200',
    outline: 'border-2 border-gray-300 bg-white text-gray-700',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200'
  }
  
  const sizes = {
    default: 'px-3 py-1.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    lg: 'px-4 py-2 text-sm'
  }
  
  return (
    <span className={`inline-flex items-center rounded-lg font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
  switch (platform?.toLowerCase()) {
    case 'instagram':
      return <Instagram size={size} />
    case 'youtube':
      return <Youtube size={size} />
    case 'tiktok':
      return <Video size={size} />
    default:
      return <Globe size={size} />
  }
}

export default function InfluencerDetailPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  selectedPlatform, 
  onPlatformSwitch,
  onSave,
  city,
  country,
  loading
}: InfluencerDetailPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen || !influencer) return null

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Check if this is a multi-platform influencer
  const isMultiPlatform = influencer.platforms && Object.keys(influencer.platforms).length > 1
  
  // Get current platform data
  const currentPlatformData = isMultiPlatform 
    ? influencer.platforms?.[selectedPlatform || 'instagram'] || Object.values(influencer.platforms)[0]
    : influencer

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[9999] w-full max-w-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={influencer.profilePicture || influencer.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName || influencer.display_name || influencer.username)}&background=random&size=150&color=fff`} 
                      alt={influencer.displayName || influencer.display_name || influencer.username}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName || influencer.display_name || influencer.username)}&background=random&size=150&color=fff`;
                      }}
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {influencer.displayName || influencer.display_name || influencer.username}
                      </h2>
                      <div className="flex items-center space-x-2 mb-2">
                        {loading ? (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Loading location...</span>
                          </div>
                        ) : (city || country) ? (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {city && country ? `${city}, ${country}` : city || country}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isMultiPlatform ? (
                          Object.keys(influencer.platforms).map((platform) => (
                            <Badge key={platform} variant="success" size="default" className="font-semibold">
                              {platform.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="success" size="default" className="font-semibold">
                            {(influencer.platform || selectedPlatform || 'INSTAGRAM').toUpperCase()}
                          </Badge>
                        )}
                        
                        {influencer.verified && (
                          <Badge variant="default" size="default" className="font-semibold">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}

                        {influencer.isPrivate && (
                          <Badge variant="secondary" size="default" className="font-semibold">
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {influencer.bio && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {influencer.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Followers</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatNumber(currentPlatformData?.followers || influencer.followers || 0)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatPercentage(currentPlatformData?.engagement_rate || influencer.engagement_rate || 0)}
                    </div>
                  </div>

                  {(influencer.avgViews || currentPlatformData?.avgViews) && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Avg Views</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatNumber(influencer.avgViews || currentPlatformData?.avgViews || 0)}
                      </div>
                    </div>
                  )}

                  {(influencer.postCount || influencer.postsCounts) && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Posts</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900">
                        {formatNumber(influencer.postCount || influencer.postsCounts || 0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Engagement Details */}
              {(influencer.avgLikes || influencer.avgComments) && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {influencer.avgLikes && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-gray-900">Avg Likes</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(influencer.avgLikes)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.avgComments && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-gray-900">Avg Comments</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(influencer.avgComments)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demographics */}
              {influencer.audience && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Demographics</h3>
                  
                  {/* Gender Distribution */}
                  {influencer.audience.gender && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Gender Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(influencer.audience.gender).map(([gender, percentage]: [string, any]) => (
                          <div key={gender} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{gender}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Age Distribution */}
                  {influencer.audience.ageRanges && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Age Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(influencer.audience.ageRanges).map(([age, percentage]: [string, any]) => (
                          <div key={age} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{age}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Locations */}
                  {influencer.audience.locations && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Top Audience Locations</h4>
                      <div className="space-y-2">
                        {influencer.audience.locations.slice(0, 5).map((location: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{location.country}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{ width: `${location.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10">
                                {location.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {influencer.audience.languages && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Top Languages</h4>
                      <div className="space-y-2">
                        {influencer.audience.languages.slice(0, 3).map((lang: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{lang.language}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ width: `${lang.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10">
                                {lang.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Information */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Creator ID</span>
                    <span className="font-medium text-gray-900">{influencer.creatorId || influencer.userId}</span>
                  </div>
                  
                  {influencer.accountType && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Type</span>
                      <Badge variant="secondary" className="capitalize">
                        {influencer.accountType}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verified</span>
                    <Badge variant={influencer.verified ? "success" : "secondary"}>
                      {influencer.verified ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {influencer.country && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Country</span>
                      <span className="font-medium text-gray-900">{influencer.country}</span>
                    </div>
                  )}

                  {influencer.ageGroup && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Age Group</span>
                      <span className="font-medium text-gray-900">{influencer.ageGroup}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platforms</span>
                    <span className="font-medium text-gray-900">
                      {isMultiPlatform ? Object.keys(influencer.platforms).join(', ') : (influencer.platform || selectedPlatform || 'Instagram')}
                    </span>
                  </div>
                  
                  {influencer.score && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discovery Score</span>
                      <Badge variant="default" className="font-semibold">
                        {influencer.score}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* External Links */}
              {isMultiPlatform ? (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Links</h3>
                  <div className="space-y-2">
                    {Object.entries(influencer.platforms).map(([platform, data]: [string, any]) => (
                      data.url && (
                        <a
                          key={platform}
                          href={data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <PlatformIcon platform={platform} size={16} />
                          <span>View on {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              ) : influencer.url && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Link</h3>
                  <a
                    href={influencer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on {((influencer.platform || selectedPlatform || 'instagram').charAt(0).toUpperCase() + (influencer.platform || selectedPlatform || 'instagram').slice(1))}</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
} 