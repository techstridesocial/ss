'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink, MapPin, Shield, Instagram, Youtube, Video, Globe } from 'lucide-react'
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  if (!mounted || !influencer) return null

  // Check if this is a multi-platform creator
  const isMultiPlatform = influencer.platforms && Object.keys(influencer.platforms).length > 1

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-y-auto flex flex-col"
          >
            <div className="flex-1 min-h-full">
              {/* Profile Section */}
              <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={influencer.profilePicture || influencer.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName || influencer.display_name || influencer.username)}&background=random&size=150&color=fff`}
                        alt={influencer.displayName || influencer.display_name || influencer.username}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName || influencer.display_name || influencer.username)}&background=random&size=150&color=fff`;
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                          {influencer.displayName || influencer.display_name || influencer.username}
                        </h1>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Creator Account</span>
                        </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                          {loading ? (
                            <span className="text-gray-400">Loading location...</span>
                          ) : (
                            <span>
                              {city || influencer.location || 'Unknown City'}, {country || 'Unknown Country'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Platform Tags */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
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
                            Verified
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

                {/* Platform-Specific Info */}
                {isMultiPlatform ? (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">All Platforms</h3>
                    <div className="space-y-3">
                      {Object.entries(influencer.platforms).map(([platform, data]: [string, any]) => (
                        <div key={platform} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <PlatformIcon platform={platform} size={20} />
                            <div>
                              <div className="font-medium text-gray-900">
                                @{data.username}
                  </div>
                              <div className="text-sm text-gray-500">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </div>
                </div>
                    </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatNumber(data.followers)}
                  </div>
                            <div className="text-sm text-gray-500">
                              {(data.engagement_rate * 100).toFixed(1)}% eng.
                    </div>
                  </div>
                    </div>
                  ))}
                </div>
                      </div>
                    ) : (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <PlatformIcon platform={influencer.platform || selectedPlatform || 'instagram'} size={16} />
                      <span className="font-medium text-gray-900">
                        {((influencer.platform || selectedPlatform || 'instagram').charAt(0).toUpperCase() + (influencer.platform || selectedPlatform || 'instagram').slice(1))} Profile
                      </span>
                              </div>
                    
                    {influencer.bio && (
                      <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {influencer.bio}
                        </p>
                          </div>
                        )}
                                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {formatNumber(influencer.totalFollowers || influencer.followers || 0)}
                                            </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {isMultiPlatform ? 'Total Followers' : 'Followers'}
                                          </div>
                                            </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {((influencer.averageEngagement || influencer.engagement_rate || 0) * 100).toFixed(1)}%
                                          </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {isMultiPlatform ? 'Avg Engagement' : 'Engagement'}
                                        </div>
                                        </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {influencer.verified ? 'Yes' : 'No'}
                                      </div>
                    <div className="text-xs text-gray-500 font-medium">Verified</div>
                                  </div>
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

              {/* Discovery Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Discovery Information</h3>
                                          <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Creator ID</span>
                    <span className="font-medium text-gray-900">{influencer.creatorId || influencer.userId}</span>
                                              </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platforms</span>
                    <span className="font-medium text-gray-900">
                      {isMultiPlatform ? Object.keys(influencer.platforms).join(', ') : (influencer.platform || selectedPlatform || 'Instagram')}
                                                </span>
                                                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discovery Score</span>
                    <span className="font-medium text-gray-900">{influencer.score || 'N/A'}</span>
                                                </div>
                                              </div>
                                            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
} 