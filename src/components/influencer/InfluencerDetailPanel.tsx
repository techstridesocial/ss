'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, MapPin, Calendar, Bookmark, Mail, Globe, Instagram, Youtube, Video, ChevronDown, Star, Shield, AlertTriangle, Target, Settings, Plus, Minus, Tag, Upload, Edit3, User, Lock } from 'lucide-react'
import { InfluencerDetailView, Platform, ContentType } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

interface InfluencerDetailPanelProps {
  influencer: InfluencerDetailView | null
  isOpen: boolean
  onClose: () => void
  selectedPlatform?: string
  onPlatformSwitch?: (platform: string) => void
  onSave?: (data: Partial<InfluencerDetailView>) => void
}

// Enhanced Button component with perfect visual hierarchy
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

// Enhanced Badge component with better visual weight
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

// Enhanced Progress component with better visual feedback
const Progress = ({ 
  value, 
  className = '', 
  size = 'default',
  showLabel = false,
  label = '',
  color = 'blue'
}: { 
  value: number
  className?: string
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
  label?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}) => {
  const sizes = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-4'
  }

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600'
  }
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">{label}</span>
          <span className="font-bold text-gray-900">{value.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <div 
          className={`${colors[color]} h-full rounded-full transition-all duration-500 ease-out relative`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${colors[color]} opacity-90`} />
        </div>
      </div>
    </div>
  )
}

// Platform Icon Component
const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
  const iconProps = { size, className: "text-current" }
  
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram {...iconProps} />
    case 'youtube':
      return <Youtube {...iconProps} />
    case 'tiktok':
      return <Video {...iconProps} />
    default:
      return <Globe {...iconProps} />
  }
}

// New Stat Card Component for better visual hierarchy
const StatCard = ({ 
  value, 
  label, 
  trend,
  isMain = false,
  variant = 'default'
}: { 
  value: string | number
  label: string
  trend?: { value: number; isPositive: boolean }
  isMain?: boolean
  variant?: 'default' | 'highlight'
}) => {
  return (
    <div className={`text-center ${isMain ? 'p-6' : 'p-4'} ${variant === 'highlight' ? 'bg-blue-50 border-blue-200' : ''} rounded-xl border`}>
      <div className={`font-bold text-gray-900 ${isMain ? 'text-3xl mb-2' : 'text-2xl mb-1'}`}>
        {value}
      </div>
      <div className={`text-gray-600 ${isMain ? 'text-sm' : 'text-xs'} font-medium mb-1`}>
        {label}
      </div>
      {trend && (
        <div className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-500'} font-semibold`}>
          {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  )
}

// New Section Container for consistent spacing
const Section = ({ 
  title, 
  children, 
  action,
  className = '',
  description
}: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  description?: string
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

// New Metric Row for consistent data display
const MetricRow = ({ 
  icon, 
  label, 
  value, 
  subValue,
  trend,
  color = 'gray'
}: {
  icon?: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'gray' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'
}) => {
  const colorClasses = {
    gray: 'text-gray-400',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500'
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center space-x-3">
        {icon && <div className={colorClasses[color]}>{icon}</div>}
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">{value}</div>
        {subValue && (
          <div className={`text-sm ${trend ? (trend.isPositive ? 'text-green-600' : 'text-red-500') : 'text-gray-500'} font-medium`}>
            {trend && (trend.isPositive ? '↗' : '↘')} {subValue}
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Contact Info Component
const ContactInfo = ({ influencer }: { influencer: InfluencerDetailView }) => {
  const hasContact = influencer.email || influencer.website_url
  
  if (!hasContact) return null

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Mail className="w-4 h-4 text-gray-400" />
        <h4 className="text-base font-semibold text-gray-900">Contact Information</h4>
      </div>
      <div className="space-y-2">
        {influencer.email && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{influencer.email}</span>
            <Button size="sm" variant="outline" className="text-xs">
              Contact
            </Button>
          </div>
        )}
        {influencer.website_url && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{influencer.website_url}</span>
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Visit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Audience Interests Component
const AudienceInterests = ({ interests }: { interests: string[] }) => {
  if (!interests || interests.length === 0) return null

  return (
    <Section title="Audience Interests" description="What your audience is passionate about">
      <div className="grid grid-cols-1 gap-3">
        {interests.slice(0, 8).map((interest, index) => (
          <div key={interest} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-800">{interest}</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {(Math.random() * 30 + 10).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// Management Helper Components
const ManagementDropdown = ({ 
  value, 
  options, 
  onChange, 
  placeholder = "Select...",
  disabled = false 
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? options.find(opt => opt.value === value)?.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ManagementInput = ({ 
  value, 
  onChange, 
  placeholder, 
  multiline = false,
  rows = 3 
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
}) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
      />
    )
  }
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
    />
  )
}

export default function InfluencerDetailPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  selectedPlatform, 
  onPlatformSwitch,
  onSave
}: InfluencerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  // Management tab state
  const [relationshipStatus, setRelationshipStatus] = useState('')
  const [assignee, setAssignee] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'content', label: 'Content' },
    { id: 'management', label: 'Management' }
  ]

  // Reset state when panel opens with new influencer
  useEffect(() => {
    if (isOpen && influencer) {
      setActiveTab('overview')
    }
  }, [isOpen, influencer])

  // Initialize management data when influencer changes
  useEffect(() => {
    if (influencer) {
      setRelationshipStatus(influencer.relationship_status || 'not_started')
      setAssignee(influencer.assigned_to || '')
      setLabels(influencer.labels || [])
      setNotes(influencer.notes || '')
    }
  }, [influencer])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  if (!influencer) return null

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const getEngagementRating = (rate: number) => {
    if (rate >= 6) return { label: 'Excellent', color: 'text-green-600', variant: 'success' as const }
    if (rate >= 3) return { label: 'Good', color: 'text-blue-600', variant: 'default' as const }
    if (rate >= 1) return { label: 'Average', color: 'text-yellow-600', variant: 'warning' as const }
    return { label: 'Below Average', color: 'text-red-500', variant: 'danger' as const }
  }

  const getFakeFollowersRating = (percentage: number) => {
    if (percentage <= 15) return { label: 'below average', color: 'text-green-600', variant: 'success' as const }
    if (percentage <= 30) return { label: 'average', color: 'text-yellow-600', variant: 'warning' as const }
    return { label: 'above average', color: 'text-red-500', variant: 'danger' as const }
  }

  const getSelectedPlatformData = () => {
    return influencer.platform_details.find(p => p.platform === selectedPlatform) || influencer.platform_details[0]
  }

  const selectedPlatformData = getSelectedPlatformData()
  const engagementRating = getEngagementRating(selectedPlatformData?.engagement_rate || 0)
  const fakeFollowersRating = getFakeFollowersRating(19.37) // Mock data

  // Mock audience interests - in real implementation this would come from Modash API
  const audienceInterests = [
    'Fashion & Style',
    'Beauty & Skincare',
    'Lifestyle',
    'Travel & Tourism',
    'Food & Cooking',
    'Fitness & Health',
    'Technology',
    'Photography'
  ]

  const getInfluencerTier = (influencer: InfluencerDetailView) => {
    const totalFollowers = influencer.total_followers || 0
    const engagementRate = selectedPlatformData?.engagement_rate || 0
    
    // Check if this is an Agency Partner (they don't have tiers)
    if (influencer.influencer_type === 'AGENCY_PARTNER') {
      return null
    }
    
    // Use manual tier if set
    if (influencer.tier) {
      return { 
        tier: influencer.tier === 'GOLD' ? 'Gold' : 'Silver', 
        variant: influencer.tier === 'GOLD' ? 'warning' as const : 'secondary' as const 
      }
    }
    
    // Calculate tier based on metrics for SIGNED/PARTNERED
    // Gold: High followers (>500k) OR high engagement (>6%)
    if (totalFollowers > 500000 || engagementRate > 6) {
      return { tier: 'Gold', variant: 'warning' as const }
    }
    // Silver: Medium followers (100k-500k) OR good engagement (3-6%)
    if (totalFollowers > 100000 || (engagementRate >= 3 && engagementRate <= 6)) {
      return { tier: 'Silver', variant: 'secondary' as const }
    }
    // Default for SIGNED/PARTNERED
    return { tier: 'Silver', variant: 'secondary' as const }
  }

  const tierInfo = getInfluencerTier(influencer)

  // Management functionality
  const relationshipOptions = [
    { value: 'not_started', label: 'Not started' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in_negotiation', label: 'In negotiation' },
    { value: 'agreed', label: 'Agreed' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' }
  ]

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    { value: 'john_doe', label: 'John Doe' },
    { value: 'jane_smith', label: 'Jane Smith' },
    { value: 'mike_johnson', label: 'Mike Johnson' },
  ]

  const handleManagementSave = () => {
    onSave?.({
      relationship_status: relationshipStatus,
      assigned_to: assignee,
      labels,
      notes
    })
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel('')
    }
  }

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />
          
          {/* Enhanced Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 inset-y-0 w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-y-auto flex flex-col"
          >
            {/* All Content in Scrollable Area */}
            <div className="flex-1 min-h-full">
              {/* Profile Section */}
              <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={influencer.avatar_url || '/default-avatar.png'}
                        alt={influencer.display_name}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                          {influencer.display_name}
                        </h1>
                      </div>
                      <p className="text-gray-600 text-base mb-2">
                        @{selectedPlatformData?.username || 'username'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Creator Account</span>
                        </div>
                        {influencer.location_country && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{influencer.location_country}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Tier and Niche Tags */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        {/* Influencer Tier - only show for SIGNED/PARTNERED */}
                        {tierInfo && (
                          <Badge 
                            variant={tierInfo.variant}
                            size="default"
                            className="font-semibold"
                          >
                            {tierInfo.tier}
                          </Badge>
                        )}
                        
                        {/* Content Type */}
                        <Badge 
                          variant={
                            (influencer.content_type || 'STANDARD') === 'UGC' ? 'success' :
                            (influencer.content_type || 'STANDARD') === 'SEEDING' ? 'warning' : 'orange'
                          }
                          size="default"
                          className="font-semibold"
                        >
                          {(influencer.content_type || 'STANDARD') === 'UGC' ? 'UGC Creator' :
                           (influencer.content_type || 'STANDARD') === 'SEEDING' ? 'Product Seeding' : 'Standard Content'}
                        </Badge>
                        
                        {/* Niche Tags */}
                        {influencer.niches.slice(0, 2).map((niche, index) => (
                          <Badge key={niche} variant="outline" size="default">
                            {niche}
                          </Badge>
                        ))}
                        {influencer.niches.length > 2 && (
                          <Badge variant="outline" size="default">
                            +{influencer.niches.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
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

                {/* Platform Switcher */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Platform Analytics</p>
                  <div className="flex space-x-2">
                    {influencer.platform_details.map(platform => (
                      <button
                        key={platform.platform}
                        onClick={() => onPlatformSwitch?.(platform.platform)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                          selectedPlatform === platform.platform
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <PlatformIcon platform={platform.platform} size={16} />
                        <span className="uppercase text-xs">{platform.platform}</span>
                        <span className="text-xs opacity-75">
                          {formatNumber(platform.followers)}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Platform-specific Bio */}
                  {selectedPlatformData && (
                    <div className="mt-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium text-gray-900">{selectedPlatform} Bio:</span> {
                          // Platform-specific bio - using mock data for now since DB schema doesn't support platform bios yet
                          selectedPlatform === 'INSTAGRAM' 
                            ? `${influencer.display_name} • Fashion & lifestyle content creator based in ${influencer.location_city || 'Birmingham'} 📸✨ #fashion #lifestyle #ootd`
                            : selectedPlatform === 'TIKTOK'
                            ? `Quick outfit ideas & fashion hacks 💫 ${influencer.location_city || 'Birmingham'} based creator | Daily inspo ⬇️`
                            : selectedPlatform === 'YOUTUBE'
                            ? `Weekly fashion hauls, styling tips, and lifestyle vlogs. Helping you find your personal style! New videos every Tuesday ✨`
                            : influencer.bio || `${influencer.display_name} creates authentic content on ${selectedPlatform}`
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Minimalistic Quick Stats for Selected Platform */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {formatNumber(selectedPlatformData?.followers || 0)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Followers</div>
                    <div className="text-xs text-green-600 font-semibold">↗ 2.4%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {selectedPlatformData?.engagement_rate.toFixed(2) || 0}%
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Engagement Rate</div>
                    <div className="text-xs text-green-600 font-semibold">↗ 0.3%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {formatNumber(selectedPlatformData?.avg_views || 0)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Avg Views</div>
                    <div className="text-xs text-red-500 font-semibold">↘ 1.8%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {formatNumber((selectedPlatformData?.avg_views || 0) * 0.85)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Est. Reach</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="px-6 py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                          <div className="space-y-8">
                            {/* Contact Information */}
                            <ContactInfo influencer={influencer} />

                            {/* Performance Metrics */}
                            <Section 
                              title={`${selectedPlatform} Performance Metrics`}
                              description="Key performance indicators for this platform"
                            >
                              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                                <MetricRow
                                  icon={<Users className="w-5 h-5" />}
                                  label="Total Followers"
                                  value={formatNumber(selectedPlatformData?.followers || 0)}
                                  subValue="0.25%"
                                  trend={{ value: 0.25, isPositive: false }}
                                  color="blue"
                                />
                                <MetricRow
                                  icon={<AlertTriangle className="w-5 h-5" />}
                                  label="Fake Followers"
                                  value="19.37%"
                                  subValue={fakeFollowersRating.label}
                                  color={fakeFollowersRating.variant === 'success' ? 'green' : fakeFollowersRating.variant === 'warning' ? 'yellow' : 'red'}
                                />
                                <MetricRow
                                  icon={<TrendingUp className="w-5 h-5" />}
                                  label="Engagement Rate"
                                  value={`${selectedPlatformData?.engagement_rate.toFixed(2) || 0}%`}
                                  subValue={engagementRating.label}
                                  color={engagementRating.variant === 'success' ? 'green' : engagementRating.variant === 'warning' ? 'yellow' : 'blue'}
                                />
                                <MetricRow
                                  icon={<Eye className="w-5 h-5" />}
                                  label="Average Views"
                                  value={formatNumber(selectedPlatformData?.avg_views || 0)}
                                  subValue={selectedPlatform === 'TIKTOK' ? '13.5%' : undefined}
                                  trend={selectedPlatform === 'TIKTOK' ? { value: 13.5, isPositive: true } : undefined}
                                  color="blue"
                                />
                                <MetricRow
                                  icon={<Heart className="w-5 h-5" />}
                                  label="Average Likes"
                                  value={formatNumber(selectedPlatformData?.avg_likes || 0)}
                                  subValue={selectedPlatform === 'TIKTOK' ? '42.5%' : '0.08%'}
                                  trend={selectedPlatform === 'TIKTOK' ? { value: 42.5, isPositive: true } : { value: 0.08, isPositive: false }}
                                  color="red"
                                />
                                {selectedPlatform === 'TIKTOK' && (
                                  <>
                                    <MetricRow
                                      icon={<Bookmark className="w-5 h-5" />}
                                      label="Average Saves"
                                      value="2"
                                      color="purple"
                                    />
                                    <MetricRow
                                      icon={<Calendar className="w-5 h-5" />}
                                      label="New Videos Per Week"
                                      value="0.75"
                                      color="green"
                                    />
                                  </>
                                )}
                                <MetricRow
                                  icon={<Target className="w-5 h-5" />}
                                  label="Estimated Reach"
                                  value={formatNumber((selectedPlatformData?.avg_views || 0) * 0.85)}
                                  subValue="per post"
                                  color="blue"
                                />
                              </div>
                            </Section>

                            {/* Audience Interests */}
                            <AudienceInterests interests={audienceInterests} />
                          </div>
                        )}

                        {/* Performance Tab */}
                        {activeTab === 'performance' && (
                          <div className="space-y-8">
                            {/* Gender Distribution */}
                            {influencer.demographics && (
                              <Section title="Gender Distribution" description="Audience breakdown by gender">
                                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <Progress
                                        value={influencer.demographics.gender_male}
                                        label="Male"
                                        size="lg"
                                        showLabel
                                        color="blue"
                                      />
                                    </div>
                                    <div>
                                      <Progress
                                        value={influencer.demographics.gender_female}
                                        label="Female"
                                        size="lg"
                                        showLabel
                                        color="red"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Section>
                            )}

                            {/* Age Demographics */}
                            {influencer.demographics && (
                              <Section title="Age & Gender Breakdown" description="Detailed demographic analysis by age groups">
                                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                                  <div className="space-y-4">
                                    {[
                                      { label: '45-64', male: 0.61, female: 0.08 },
                                      { label: '35-44', male: 3.89, female: 1.45 },
                                      { label: '25-34', male: 27.64, female: 22.53 },
                                      { label: '18-24', male: 21.20, female: 16.74 },
                                      { label: '13-17', male: 2.39, female: 3.43 }
                                    ].map(age => (
                                      <div key={age.label} className="flex items-center space-x-4">
                                        <div className="w-16 text-sm font-bold text-gray-700 text-right">{age.label}</div>
                                        <div className="flex-1 flex h-8 bg-gray-50 rounded-lg overflow-hidden">
                                          <div className="w-1/2 flex justify-end">
                                            <div 
                                              className="bg-red-400 h-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                                              style={{ width: `${age.female * 3}%` }}
                                            >
                                              {age.female > 2 && `${age.female.toFixed(1)}%`}
                                            </div>
                                          </div>
                                          <div className="w-1/2 flex">
                                            <div 
                                              className="bg-blue-400 h-full flex items-center pl-2 text-white text-xs font-bold"
                                              style={{ width: `${age.male * 3}%` }}
                                            >
                                              {age.male > 2 && `${age.male.toFixed(1)}%`}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="w-20 text-sm text-gray-600 font-medium">
                                          {(age.male + age.female).toFixed(1)}% total
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Section>
                            )}

                            {/* Location & Language */}
                            <div className="space-y-6">
                              <Section title="Top Countries" description="Audience geographic distribution">
                                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                                  {influencer.audience_locations.slice(0, 8).map((location, index) => (
                                    <div key={location.country_code} className="flex justify-between items-center py-2">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                                        <span className="font-medium text-gray-800">{location.country_name}</span>
                                      </div>
                                      <span className="font-bold text-gray-900">{location.percentage.toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </Section>
                              
                              <Section title="Languages" description="Audience language preferences">
                                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                                  {influencer.audience_languages.slice(0, 8).map((language, index) => (
                                    <div key={language.language_code} className="flex justify-between items-center py-2">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                        <span className="font-medium text-gray-800">{language.language_name}</span>
                                      </div>
                                      <span className="font-bold text-gray-900">{language.percentage.toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </Section>
                            </div>

                            {/* Cities Breakdown */}
                            <Section title="Top Cities" description="Most popular cities among audience">
                              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                                <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { city: 'Denpasar', percentage: 55.33 },
                                    { city: 'Jakarta', percentage: 0.87 },
                                    { city: 'Yogyakarta', percentage: 0.33 },
                                    { city: 'Surabaya', percentage: 0.33 },
                                    { city: 'Singapore', percentage: 0.17 },
                                    { city: 'Bangkok', percentage: 0.15 }
                                  ].map((city, index) => (
                                    <div key={city.city} className="flex justify-between items-center py-2">
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                        <span className="font-medium text-gray-800">{city.city}</span>
                                      </div>
                                      <span className="font-bold text-gray-900">{city.percentage}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Section>
                          </div>
                        )}

                        {/* Content Tab */}
                        {activeTab === 'content' && (
                          <div className="space-y-6">
                            <Section
                              title="Recent Content"
                              description="Latest posts and their performance"
                              action={
                                <div className="flex space-x-2">
                                  <Button variant="default" size="sm">Popular</Button>
                                  <Button variant="ghost" size="sm">Recent</Button>
                                  <Button variant="ghost" size="sm">Sponsored</Button>
                                </div>
                              }
                            >
                              <div className="grid grid-cols-2 gap-3">
                                {influencer.recent_content.slice(0, 6).map(content => (
                                  <div key={content.id} className="group cursor-pointer">
                                    <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                      <img
                                        src={content.thumbnail_url || '/placeholder-content.png'}
                                        alt="Content"
                                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      <div className="absolute bottom-3 left-3 right-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 text-sm">
                                            <div className="flex items-center space-x-1">
                                              <Heart className="w-3 h-3" />
                                              <span className="font-bold">{formatNumber(content.likes || 0)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <MessageCircle className="w-3 h-3" />
                                              <span className="font-bold">{content.comments || 0}</span>
                                            </div>
                                            {selectedPlatform === 'TIKTOK' && (
                                              <div className="flex items-center space-x-1">
                                                <Bookmark className="w-3 h-3" />
                                                <span className="font-bold">{Math.floor(Math.random() * 10) + 1}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="absolute top-3 right-3 text-white text-xs bg-black/70 px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                        {content.posted_at ? new Date(content.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Section>
                          </div>
                        )}

                        {/* Management Tab */}
                        {activeTab === 'management' && (
                          <div className="space-y-6">
                            {/* Assignee */}
                            <Section title="Assignee">
                              <ManagementDropdown
                                value={assignee}
                                options={assigneeOptions}
                                onChange={setAssignee}
                                placeholder="Select"
                              />
                            </Section>

                            {/* Emails */}
                            <Section title="Emails" action={<button className="text-blue-600 text-sm font-medium">Unlock</button>}>
                              <p className="text-sm text-gray-500">Unlock the email and start a conversation.</p>
                            </Section>

                            {/* Campaign Setup */}
                            <Section title="Campaign setup">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                  <span className="text-sm text-gray-700">Product shipment</span>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                  <span className="text-sm text-gray-700">Tracking links</span>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                  <span className="text-sm text-gray-700">Discount codes</span>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between py-3">
                                  <span className="text-sm text-gray-700">Affiliate program</span>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </Section>

                            {/* Campaigns */}
                            <Section title="Campaigns" action={<button className="text-blue-600 text-sm font-medium">Add</button>}>
                              <p className="text-sm text-gray-500">Track content, engagements, clicks and real revenue. No creator signup required!</p>
                            </Section>

                            {/* Documents */}
                            <Section title="Documents" action={<button className="text-blue-600 text-sm font-medium">Upload</button>}>
                              <div className="text-center py-6">
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No documents uploaded</p>
                              </div>
                            </Section>

                            {/* Labels */}
                            <Section title="Labels">
                              <div className="space-y-3">
                                <div className="flex space-x-2">
                                  <ManagementInput
                                    value={newLabel}
                                    onChange={setNewLabel}
                                    placeholder="Add labels"
                                  />
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={addLabel}
                                    className="px-3 py-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {labels.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {labels.map(label => (
                                      <div key={label} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                                        <Tag className="w-3 h-3" />
                                        <span>{label}</span>
                                        <button
                                          onClick={() => removeLabel(label)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Section>

                            {/* Notes */}
                            <Section title="Notes">
                              <ManagementInput
                                value={notes}
                                onChange={setNotes}
                                placeholder="Add notes"
                                multiline
                                rows={4}
                              />
                            </Section>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                              <Button
                                variant="default"
                                onClick={handleManagementSave}
                                className="px-6 py-2"
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 