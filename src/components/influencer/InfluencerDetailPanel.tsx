'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, MapPin, Calendar, Bookmark, BookmarkPlus } from 'lucide-react'
import { InfluencerDetailView, Platform } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

interface InfluencerDetailPanelProps {
  influencer: InfluencerDetailView | null
  isOpen: boolean
  onClose: () => void
  onSave?: (influencerId: string) => void
  onAddToShortlist?: (influencerId: string) => void
}

// Simple Button component replacement
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '' 
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm'
  className?: string
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm'
  }
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// Simple Badge component replacement
const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Simple Progress component replacement
const Progress = ({ value, className = '' }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div 
        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default function InfluencerDetailPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  onSave, 
  onAddToShortlist 
}: InfluencerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaved, setIsSaved] = useState(false)

  // Reset tab when opening new influencer
  useEffect(() => {
    if (isOpen && influencer) {
      setActiveTab('overview')
    }
  }, [isOpen, influencer?.id])

  if (!influencer) return null

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(influencer.id)
  }

  const handleAddToShortlist = () => {
    onAddToShortlist?.(influencer.id)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const getEngagementRating = (rate: number) => {
    if (rate >= 6) return { label: 'Excellent', color: 'text-green-600' }
    if (rate >= 3) return { label: 'Good', color: 'text-blue-600' }
    if (rate >= 1) return { label: 'Average', color: 'text-yellow-600' }
    return { label: 'Below Average', color: 'text-red-600' }
  }

  const getFakeFollowersRating = (percentage: number) => {
    if (percentage <= 15) return { label: 'below average', color: 'text-green-600' }
    if (percentage <= 30) return { label: 'average', color: 'text-yellow-600' }
    return { label: 'above average', color: 'text-red-600' }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'audience', label: 'Audience' },
    { id: 'content', label: 'Content' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={influencer.avatar_url || '/default-avatar.png'}
                    alt={influencer.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{influencer.display_name}</h2>
                      <div className="flex items-center space-x-1">
                        {influencer.platform_details.map(platform => (
                          <Badge key={platform.platform} variant="secondary" className="text-xs">
                            {platform.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">@{influencer.platform_details[0]?.username || 'username'}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Creator account</span>
                      {influencer.location_country && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{influencer.location_country}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center space-x-2"
                  >
                    {isSaved ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open full report
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(influencer.total_followers)}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{influencer.total_engagement_rate.toFixed(2)}%</div>
                  <div className="text-sm text-gray-500">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(influencer.total_avg_views)}</div>
                  <div className="text-sm text-gray-500">Avg Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(influencer.estimated_promotion_views)}</div>
                  <div className="text-sm text-gray-500">Est. Promotion Views</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Growth Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Growth</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Followers</Button>
                        <Button variant="ghost" size="sm">Likes</Button>
                      </div>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Growth chart would be displayed here</p>
                        <p className="text-sm">Data from Modash API</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Followers</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(influencer.total_followers)}</div>
                          <div className="text-sm text-red-500">↓ 0.25%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <span className="w-5 h-5 flex items-center justify-center text-yellow-500">⚠</span>
                          <span className="text-gray-700">Fake followers</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">19.37%</div>
                          <div className={`text-sm ${getFakeFollowersRating(19.37).color}`}>
                            {getFakeFollowersRating(19.37).label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Engagement Rate</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{influencer.total_engagement_rate.toFixed(2)}%</div>
                          <div className={`text-sm ${getEngagementRating(influencer.total_engagement_rate).color}`}>
                            {getEngagementRating(influencer.total_engagement_rate).label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Estimated impressions</span>
                        </div>
                        <div className="font-semibold">{formatNumber(influencer.total_avg_views * 1.2)}</div>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Estimated reach</span>
                        </div>
                        <div className="font-semibold">{formatNumber(influencer.total_avg_views * 0.8)}</div>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Average likes</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(influencer.total_avg_views * 0.15)}</div>
                          <div className="text-sm text-red-500">↓ 0.08%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Platform-specific performance */}
                  {influencer.platform_details.map(platform => (
                    <div key={platform.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">{platform.platform}</Badge>
                          <span className="font-medium">@{platform.username}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(platform.followers)}</div>
                          <div className="text-sm text-gray-500">followers</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Engagement Rate</div>
                          <div className="font-semibold">{platform.engagement_rate.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg Views</div>
                          <div className="font-semibold">{formatNumber(platform.avg_views)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg Likes</div>
                          <div className="font-semibold">{formatNumber(platform.avg_likes)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Audience Tab */}
              {activeTab === 'audience' && (
                <div className="space-y-6">
                  {/* Gender Distribution */}
                  {influencer.demographics && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Gender</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Male</span>
                            <span>{influencer.demographics.gender_male.toFixed(2)}%</span>
                          </div>
                          <Progress value={influencer.demographics.gender_male} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Female</span>
                            <span>{influencer.demographics.gender_female.toFixed(2)}%</span>
                          </div>
                          <Progress value={influencer.demographics.gender_female} className="h-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Age & Gender */}
                  {influencer.demographics && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Age & Gender</h3>
                      <div className="space-y-2">
                        {[
                          { label: '45-64', male: 0.61, female: 0.08 },
                          { label: '35-44', male: 3.89, female: 1.45 },
                          { label: '25-34', male: 27.64, female: 22.53 },
                          { label: '18-24', male: 21.20, female: 16.74 },
                          { label: '13-17', male: 2.39, female: 3.43 }
                        ].map(age => (
                          <div key={age.label} className="flex items-center space-x-3 text-sm">
                            <div className="w-12 text-right">{age.label}</div>
                            <div className="flex-1 flex">
                              <div className="w-1/2 flex justify-end pr-1">
                                <div 
                                  className="bg-red-400 h-4 flex items-center justify-end pr-1 text-white text-xs"
                                  style={{ width: `${age.female * 2}%` }}
                                >
                                  {age.female > 3 && `${age.female.toFixed(2)}%`}
                                </div>
                              </div>
                              <div className="w-1/2 flex pl-1">
                                <div 
                                  className="bg-blue-400 h-4 flex items-center pl-1 text-white text-xs"
                                  style={{ width: `${age.male * 2}%` }}
                                >
                                  {age.male > 3 && `${age.male.toFixed(2)}%`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Countries & Cities */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Countries</h3>
                      <div className="space-y-2">
                        {influencer.audience_locations.slice(0, 5).map(location => (
                          <div key={location.country_code} className="flex justify-between text-sm">
                            <span>{location.country_name}</span>
                            <span>{location.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Cities</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Denpasar</span>
                          <span>55.37%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Jakarta</span>
                          <span>0.87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Yogyakarta</span>
                          <span>0.33%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Languages</h3>
                    <div className="space-y-2">
                      {influencer.audience_languages.slice(0, 5).map(language => (
                        <div key={language.language_code} className="flex justify-between text-sm">
                          <span>{language.language_name}</span>
                          <span>{language.percentage.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Content</h3>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">Popular</Button>
                      <Button variant="ghost" size="sm">Sponsored</Button>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {influencer.recent_content.slice(0, 8).map(content => (
                      <div key={content.id} className="relative group cursor-pointer">
                        <img
                          src={content.thumbnail_url || '/placeholder-content.png'}
                          alt="Content"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                        <div className="absolute bottom-2 left-2 text-white text-xs">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{formatNumber(content.likes || 0)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{content.comments || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                          {content.posted_at ? new Date(content.posted_at).toLocaleDateString() : 'Date unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 flex justify-between items-center bg-gray-50">
              <div className="flex space-x-2">
                <Badge variant="secondary">{influencer.niches[0] || 'Lifestyle'}</Badge>
                {influencer.niches[1] && <Badge variant="outline">{influencer.niches[1]}</Badge>}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleAddToShortlist}>
                  Add to Shortlist
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 