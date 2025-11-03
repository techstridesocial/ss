'use client'

import React, { useState, useEffect } from 'react'
import { X, Star, Building2, Calendar, DollarSign, Users, CheckCircle, Play, Pause, Edit, TrendingUp, Target, Clock, Package, MessageCircle, ChevronDown, ChevronUp, User, Mail, Phone, Plus, ExternalLink, Tag, Search, Edit3, Save, Trash2, Check, Heart, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'

interface CampaignDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  campaign: any
  onPauseCampaign?: (campaignId: string) => void
  onResumeCampaign?: (campaignId: string) => void
}

// Helper function to format numbers (e.g., 31500 -> 31.5k)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toLocaleString() // Use commas for numbers under 1000
}

// Campaign ID Field Component
interface CampaignIdFieldProps {
  campaignId?: string
  campaignUuid: string
  onUpdate: (newId: string) => void
}

const CampaignIdField = ({ campaignId, campaignUuid, onUpdate }: CampaignIdFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(campaignId || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (inputValue.trim() === campaignId) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onUpdate(inputValue.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating campaign ID:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setInputValue(campaignId || '')
    setIsEditing(false)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
        <Tag size={16} className="mr-2" />
        Campaign ID
      </label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter campaign ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {campaignId || 'No ID set'}
            </span>
            {!campaignId && (
              <span className="text-xs text-gray-500 italic">Click to add</span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit Campaign ID"
          >
            <Edit3 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// Enhanced Section component with animation
const Section = ({ 
  title, 
  children, 
  className = '',
  delay = 0,
  action
}: { 
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
  action?: React.ReactNode
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-8 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

const InfoField = ({
  label,
  value,
  icon,
  type = 'text'
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  type?: 'text' | 'currency' | 'date' | 'percentage'
}) => {
  const renderValue = () => {
    if (type === 'currency' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">${value.toLocaleString()}</span>
    }
    
    if (type === 'date' && value) {
      return <span className="text-gray-900 font-medium">{new Date(value as string).toLocaleDateString()}</span>
    }
    
    if (type === 'percentage' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">{value}%</span>
    }
    
    return <span className="text-gray-900 font-medium">{value}</span>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      </div>
      <div className="text-base leading-relaxed">{renderValue()}</div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-600',
          icon: <Play size={10} />
        }
      case 'PAUSED':
        return {
          label: 'Paused',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-600',
          icon: <Pause size={10} />
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-600',
          icon: <CheckCircle size={10} />
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-600',
          icon: <X size={10} />
        }
      default:
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-600',
          icon: <Clock size={10} />
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${config.className}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full mr-2`}></div>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  )
}

const ProgressBar = ({ current, total, label, color = 'blue' }: { current: number, total: number, label: string, color?: string }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${colorClasses[color as keyof typeof colorClasses]} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const InfluencerCard = ({ influencer }: { influencer: any }) => {
  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-l-green-500 bg-green-50'
      case 'contacted': return 'border-l-yellow-500 bg-yellow-50'
      case 'pending': return 'border-l-gray-500 bg-gray-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getContactStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-600" />
      case 'contacted': return <Mail size={16} className="text-yellow-600" />
      case 'pending': return <Clock size={16} className="text-gray-600" />
      default: return <User size={16} className="text-gray-600" />
    }
  }

  const getContactStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'contacted': return 'Contacted'
      case 'pending': return 'Pending Contact'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`border-l-4 ${getContactStatusColor(influencer.contact_status)} p-4 rounded-r-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getContactStatusIcon(influencer.contact_status)}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{influencer.name}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>{influencer.followers.toLocaleString()} followers</span>
              <span>{influencer.engagement_rate}% engagement</span>
              <span>{influencer.platform}</span>
            </div>
            {influencer.offered_amount && (
              <p className="text-sm text-gray-600 mt-1">Offered: ${influencer.offered_amount.toLocaleString()}</p>
            )}
            {influencer.contact_notes && (
              <p className="text-sm text-gray-700 mt-2 italic">{influencer.contact_notes}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            influencer.contact_status === 'confirmed' ? 'bg-green-100 text-green-800' :
            influencer.contact_status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getContactStatusLabel(influencer.contact_status)}
          </span>
          {influencer.contacted_at && (
            <div className="text-xs text-gray-500 mt-1">
              {influencer.contact_status === 'confirmed' ? 'Confirmed' : 'Contacted'}: {new Date(influencer.contacted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CampaignDetailPanel({ 
  isOpen, 
  onClose, 
  campaign, 
  onPauseCampaign,
  onResumeCampaign
}: CampaignDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'influencers'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddInfluencerModal, setShowAddInfluencerModal] = useState(false)
  const [availableInfluencers, setAvailableInfluencers] = useState<Array<any>>([])
  const [campaignInfluencers, setCampaignInfluencers] = useState<Array<any>>([])
  const [influencersLoading, setInfluencersLoading] = useState(false)
  const [editingInfluencer, setEditingInfluencer] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    contentLinks: [''],
    discountCode: ''
  })
  const [influencerSearchTerm, setInfluencerSearchTerm] = useState('')
  const [addingInfluencer, setAddingInfluencer] = useState<string | null>(null)
  const [editingContentLinks, setEditingContentLinks] = useState<string | null>(null)
  const [contentLinksInput, setContentLinksInput] = useState<string>('')
  const [newLinkInput, setNewLinkInput] = useState<string>('')
  const [addingLinkTo, setAddingLinkTo] = useState<{campaignInfluencerId: string, platform: string} | null>(null)
  const [editingDiscountCode, setEditingDiscountCode] = useState<string | null>(null)
  const [discountCodeInput, setDiscountCodeInput] = useState<string>('')

  // Move useAuth to the top level of the component
  const { getToken } = useAuth()

  console.log('CampaignDetailPanel rendered with:', { isOpen, campaign: campaign?.name })

  // Handle Campaign ID update
  const handleCampaignIdUpdate = async (newCampaignId: string) => {
    if (!campaign?.id) return
    
    setIsLoading(true)
    try {
      const token = await getToken()
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaignId: newCampaignId })
      })
      
      if (response.ok) {
        console.log('✅ Campaign ID updated successfully')
        // Optionally show a success message or refresh the campaign data
      } else {
        console.error('❌ Failed to update campaign ID')
        alert('Failed to update campaign ID. Please try again.')
      }
    } catch (error) {
      console.error('Error updating campaign ID:', error)
      alert('Error updating campaign ID. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Platform detection functions
  const getPlatformFromUrl = (url: string): string => {
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('tiktok.com')) return 'tiktok'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('facebook.com')) return 'facebook'
    return 'unknown'
  }

  const getPlatformIcon = (_platform: string): React.JSX.Element => {
    const iconProps = { className: "w-5 h-5" }
    
    switch(platform) {
      case 'instagram':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="url(#instagram-gradient)">
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#FED373', stopOpacity: 1}} />
                <stop offset="15%" style={{stopColor: '#F15245', stopOpacity: 1}} />
                <stop offset="40%" style={{stopColor: '#D92E7F', stopOpacity: 1}} />
                <stop offset="75%" style={{stopColor: '#9B36B7', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#515ECF', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      case 'tiktok':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#000000"/>
          </svg>
        )
      case 'youtube':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      case 'twitter':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="#1DA1F2">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        )
      case 'linkedin':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      default:
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="#6B7280">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        )
    }
  }

  const getPlatformName = (_platform: string): string => {
    const names = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      unknown: 'Other'
    }
    return names[platform as keyof typeof names] || 'Other'
  }

  const groupLinksByPlatform = (contentLinks: string[]) => {
    return contentLinks.reduce((acc, link) => {
      const platform = getPlatformFromUrl(link)
      if (!acc[platform]) acc[platform] = []
      acc[platform].push(link)
      return acc
    }, {} as Record<string, string[]>)
  }

  const getPrimaryPlatform = (contentLinks: string[]): string => {
    if (!contentLinks || contentLinks.length === 0) return 'unknown'
    
    const platforms = contentLinks.map(link => getPlatformFromUrl(link))
    const platformCounts = platforms.reduce((acc, platform) => {
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Return most common platform
    const platformKeys = Object.keys(platformCounts)
    if (platformKeys.length === 0) return 'unknown'
    
    return platformKeys.reduce((a, b) => 
      (platformCounts[a] || 0) > (platformCounts[b] || 0) ? a : b
    )
  }

  // Fetch campaign influencers and available influencers
  useEffect(() => {
    const fetchInfluencers = async () => {
      if (!isOpen || !campaign) return
      
      setInfluencersLoading(true)
      try {
        const token = await getToken()
        
        if (!token) {
          console.error('❌ No auth token available for fetching influencers')
          setInfluencersLoading(false)
          return
        }

        // Fetch campaign influencers
        console.log('🔄 Initial fetch: Getting campaign influencers for campaign:', campaign.id)
        const campaignInfluencersResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (campaignInfluencersResponse.ok) {
          const campaignInfluencersResult = await campaignInfluencersResponse.json()
          console.log('📊 Initial campaign influencers loaded:', campaignInfluencersResult.data?.influencers)
          setCampaignInfluencers(campaignInfluencersResult.data?.influencers || [])
        } else {
          console.error('❌ Failed to fetch initial campaign influencers:', campaignInfluencersResponse.status)
        }

        // Fetch all available influencers
        const influencersResponse = await fetch('/api/influencers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (influencersResponse.ok) {
          const influencersResult = await influencersResponse.json()
          setAvailableInfluencers(influencersResult.data || [])
        }
      } catch (error) {
        console.error('Error fetching influencers:', error)
      } finally {
        setInfluencersLoading(false)
      }
    }
    
    fetchInfluencers()
  }, [isOpen, campaign, getToken])

  const addInfluencerToCampaign = async (influencerId: string) => {
    setAddingInfluencer(influencerId)
    try {
      const token = await getToken()
      
      if (!token) {
        console.error('❌ No auth token available')
        alert('Authentication required: Please sign in to add influencers to campaigns.')
        return
      }

      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          status: 'accepted'
        })
      })
      
      if (response.ok) {
        const _result = await response.json()
        console.log('✅ Successfully added influencer:', result)
        
        // Refresh the campaign influencers list with a small delay to ensure database consistency
        console.log('🔄 Refreshing campaign influencers list...')
        setTimeout(async () => {
          try {
            const campaignInfluencersResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (campaignInfluencersResponse.ok) {
              const campaignInfluencersResult = await campaignInfluencersResponse.json()
              console.log('📊 Refreshed campaign influencers:', campaignInfluencersResult.data?.influencers)
              setCampaignInfluencers(campaignInfluencersResult.data?.influencers || [])
            } else {
              console.error('❌ Failed to refresh campaign influencers:', campaignInfluencersResponse.status)
            }
          } catch (refreshError) {
            console.error('❌ Error during refresh:', refreshError)
          }
        }, 500) // 500ms delay to ensure database write is complete
        
        setShowAddInfluencerModal(false)
        setInfluencerSearchTerm('') // Clear search when modal closes
      } else {
        console.error('❌ Response not ok:', response.status, response.statusText)
        let errorData = {}
        try {
          errorData = await response.json()
          console.error('❌ Error response data:', errorData)
        } catch (parseError) {
          console.error('❌ Failed to parse error response as JSON:', parseError)
          const textResponse = await response.text()
          console.error('❌ Raw error response:', textResponse)
        }
        
        // Handle authentication errors specifically
        if (response.status === 403) {
          alert('Authentication required: Please sign in to add influencers to campaigns.')
        } else if (response.status === 401) {
          alert('Session expired: Please sign in again to continue.')
        } else {
          const errorMessage = (errorData as any)?.details || (errorData as any)?.error || 'Unknown error';
          if (errorMessage.includes('already added to this campaign')) {
            alert('This influencer is already part of this campaign');
          } else {
            alert(`Failed to add influencer: ${errorMessage}`);
          }
        }
      }
    } catch (error) {
      console.error('Error adding influencer to campaign:', error)
      alert(`Error adding influencer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setAddingInfluencer(null)
    }
  }

  const handleCloseAddInfluencerModal = () => {
    setShowAddInfluencerModal(false)
    setInfluencerSearchTerm('') // Clear search when modal closes
  }

  const handleUpdateContentLinks = async (campaignInfluencerId: string, influencerId: string) => {
    try {
      // Parse the input links (split by newlines or commas)
      const links = contentLinksInput
        .split(/[\n,]/)
        .map(link => link.trim())
        .filter(link => link.length > 0)

      const token = await getToken()
      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          contentLinks: links
        })
      })
      
      if (response.ok) {
        const _result = await response.json()
        console.log('✅ Successfully updated content links:', result)
        
        // Update the local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, contentLinks: links }
              : ci
          )
        )
        
        // Wait a moment for analytics processing, then refresh the specific row with updated analytics
        setTimeout(async () => {
          try {
            console.log('🔄 Refreshing analytics for the updated row...')
            const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              if (data.influencers) {
                // Find the updated influencer and merge analytics
                const updatedInfluencer = data.influencers.find((inf: any) => inf.id === campaignInfluencerId)
                if (updatedInfluencer) {
                  setCampaignInfluencers(prev => 
                    prev.map(ci => 
                      ci.id === campaignInfluencerId 
                        ? { 
                            ...ci, 
                            contentLinks: links,
                            // Update analytics from the refreshed data
                            totalEngagements: updatedInfluencer.totalEngagements,
                            avgEngagementRate: updatedInfluencer.avgEngagementRate,
                            estimatedReach: updatedInfluencer.estimatedReach,
                            totalLikes: updatedInfluencer.totalLikes,
                            totalComments: updatedInfluencer.totalComments,
                            totalViews: updatedInfluencer.totalViews,
                            analyticsUpdatedAt: updatedInfluencer.analyticsUpdatedAt
                          }
                        : ci
                    )
                  )
                  console.log('📊 ANALYTICS REFRESHED FOR THE ROW!')
                }
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing analytics:', error)
          }
        }, 2000) // Wait 2 seconds for analytics processing
        
        // Close the editing mode
        setEditingContentLinks(null)
        setContentLinksInput('')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to update content links:', errorData)
        alert(`Failed to update content links: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating content links:', error)
      alert(`Error updating content links: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleStartEditingContentLinks = (campaignInfluencer: any) => {
    setEditingContentLinks(campaignInfluencer.id)
    setContentLinksInput(
      campaignInfluencer.contentLinks 
        ? campaignInfluencer.contentLinks.join('\n')
        : ''
    )
  }

  const handleCancelEditingContentLinks = () => {
    setEditingContentLinks(null)
    setContentLinksInput('')
  }

  const handleStartAddingLink = (campaignInfluencerId: string, platform: string) => {
    setAddingLinkTo({ campaignInfluencerId, platform })
    setNewLinkInput('')
  }

  const handleCancelAddingLink = () => {
    setAddingLinkTo(null)
    setNewLinkInput('')
  }

  const handleAddSingleLink = async (campaignInfluencerId: string, influencerId: string) => {
    if (!newLinkInput.trim()) return

    try {
      setIsLoading(true)
      console.log('➕ Adding new link:', newLinkInput)
      
      const token = await getToken()
      const currentCampaignInfluencer = campaignInfluencers.find(ci => ci.id === campaignInfluencerId)
      const existingLinks = currentCampaignInfluencer?.contentLinks || []
      const updatedLinks = [...existingLinks, newLinkInput.trim()]

      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          contentLinks: updatedLinks,
          status: currentCampaignInfluencer?.status || 'INVITED'
        })
      })
      
      if (response.ok) {
        console.log('✅ Link added to database! Updating local state...')
        
        // Update only the specific row in the state instead of refetching all data
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, contentLinks: updatedLinks }
              : ci
          )
        )
        
        console.log('⚡ CONTENT LINKS UPDATED LOCALLY!')
        
        // Wait a moment for analytics processing, then refresh the specific row with updated analytics
        setTimeout(async () => {
          try {
            console.log('🔄 Refreshing analytics for the updated row...')
            const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              if (data.influencers) {
                // Find the updated influencer and merge analytics
                const updatedInfluencer = data.influencers.find((inf: any) => inf.id === campaignInfluencerId)
                if (updatedInfluencer) {
                  setCampaignInfluencers(prev => 
                    prev.map(ci => 
                      ci.id === campaignInfluencerId 
                        ? { 
                            ...ci, 
                            contentLinks: updatedLinks,
                            // Update analytics from the refreshed data
                            totalEngagements: updatedInfluencer.totalEngagements,
                            avgEngagementRate: updatedInfluencer.avgEngagementRate,
                            estimatedReach: updatedInfluencer.estimatedReach,
                            totalLikes: updatedInfluencer.totalLikes,
                            totalComments: updatedInfluencer.totalComments,
                            totalViews: updatedInfluencer.totalViews,
                            analyticsUpdatedAt: updatedInfluencer.analyticsUpdatedAt
                          }
                        : ci
                    )
                  )
                  console.log('📊 ANALYTICS REFRESHED FOR THE ROW!')
                }
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing analytics:', error)
          }
        }, 2000) // Wait 2 seconds for analytics processing
        
        // Close the adding mode
        setAddingLinkTo(null)
        setNewLinkInput('')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to add link:', errorData)
        alert(`Failed to add link: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error adding single link:', error)
      alert(`Error adding link: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAllContentLinks = async (campaignInfluencerId: string, influencerId: string) => {
    try {
      setIsLoading(true)
      console.log('🗑️ Clearing ALL content links for influencer:', influencerId)
      
      const token = await getToken()

      // Use the new comprehensive deletion service to clear all content links
      const deleteResponse = await fetch('/api/content-links/delete', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          campaignId: campaign.id,
          deleteAll: true
        })
      })

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        console.log('✅ All content links cleared from all tables:', deleteResult)
        
        // Update local state to reflect the change
        setCampaignInfluencers(prev => prev.map(ci => 
          ci.id === campaignInfluencerId 
            ? { 
                ...ci, 
                contentLinks: [],
                // Reset all analytics to 0 when clearing all links
                totalEngagements: 0,
                avgEngagementRate: 0,
                estimatedReach: 0,
                totalLikes: 0,
                totalComments: 0,
                totalViews: 0
              }
            : ci
        ))

        console.log(`📋 Updated local state - cleared all content links and reset analytics to 0`)
        
        // Wait a moment for backend analytics processing, then refresh with real data
        setTimeout(async () => {
          try {
            console.log('🔄 Refreshing analytics after clearing all links...')
            const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              if (data.influencers) {
                // Find the updated influencer and merge real analytics
                const updatedInfluencer = data.influencers.find((inf: any) => inf.id === campaignInfluencerId)
                if (updatedInfluencer) {
                  setCampaignInfluencers(prev => 
                    prev.map(ci => 
                      ci.id === campaignInfluencerId 
                        ? { 
                            ...ci, 
                            contentLinks: [],
                            // Update with real analytics from backend (should be 0)
                            totalEngagements: updatedInfluencer.totalEngagements,
                            avgEngagementRate: updatedInfluencer.avgEngagementRate,
                            estimatedReach: updatedInfluencer.estimatedReach,
                            totalLikes: updatedInfluencer.totalLikes,
                            totalComments: updatedInfluencer.totalComments,
                            totalViews: updatedInfluencer.totalViews,
                            analyticsUpdatedAt: updatedInfluencer.analyticsUpdatedAt
                          }
                        : ci
                    )
                  )
                  console.log('📊 ANALYTICS REFRESHED AFTER CLEARING ALL LINKS!')
                }
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing analytics after clearing all links:', error)
          }
        }, 1000) // Wait 1 second for backend processing
        
        // Show success message
        if (deleteResult.result.deletedFrom.length > 0) {
          console.log(`✅ Content links cleared from: ${deleteResult.result.deletedFrom.join(', ')}`)
        }
        
        if (deleteResult.result.analyticsReset) {
          console.log('🔄 Backend analytics reset due to clearing all content links')
        }
        
        alert('All content links cleared successfully! Analytics reset to 0.')
      } else {
        const errorData = await deleteResponse.json()
        console.error('❌ Failed to clear content links:', errorData)
        alert(`Failed to clear content links: ${errorData.error || 'Unknown error'}`)
      }

      // Also update the campaign_influencers table for consistency
      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          contentLinks: [],
          status: campaignInfluencers.find(ci => ci.id === campaignInfluencerId)?.status || 'INVITED'
        })
      })
      
      if (response.ok) {
        console.log('✅ All content links cleared from database!')
        
        // Refetch to get updated analytics
        const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers?stats=true&timeline=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          if (data.influencers) {
            setCampaignInfluencers(data.influencers)
            console.log('⚡ ANALYTICS UPDATED AFTER CLEARING ALL LINKS!')
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error clearing all content links:', error)
      alert(`Error clearing content links: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLink = async (campaignInfluencerId: string, influencerId: string, linkToRemove: string) => {
    try {
      setIsLoading(true)
      console.log('🗑️ Deleting link from ALL tables:', linkToRemove)
      
      const token = await getToken()

      // Use the new comprehensive deletion service
      const deleteResponse = await fetch('/api/content-links/delete', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          contentLink: linkToRemove,
          influencerId: influencerId,
          campaignId: campaign.id
        })
      })

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        console.log('✅ Content link deleted from all tables:', deleteResult)
        
        // Update local state to reflect the change
        const currentCampaignInfluencer = campaignInfluencers.find(ci => ci.id === campaignInfluencerId)
        const existingLinks = currentCampaignInfluencer?.contentLinks || []
        const updatedLinks = existingLinks.filter((link: string) => link !== linkToRemove)

        // Update the local state with removed link
        setCampaignInfluencers(prev => prev.map(ci => 
          ci.id === campaignInfluencerId 
            ? { 
                ...ci, 
                contentLinks: updatedLinks,
                // Reset analytics to 0 when links are removed
                totalEngagements: updatedLinks.length === 0 ? 0 : ci.totalEngagements,
                avgEngagementRate: updatedLinks.length === 0 ? 0 : ci.avgEngagementRate,
                estimatedReach: updatedLinks.length === 0 ? 0 : ci.estimatedReach,
                totalLikes: updatedLinks.length === 0 ? 0 : ci.totalLikes,
                totalComments: updatedLinks.length === 0 ? 0 : ci.totalComments,
                totalViews: updatedLinks.length === 0 ? 0 : ci.totalViews
              }
            : ci
        ))

        console.log(`📋 Updated local state - removed link from ${existingLinks.length} to ${updatedLinks.length}`)
        
        if (updatedLinks.length === 0) {
          console.log('🔄 Analytics reset to 0 due to no remaining content links')
        }
        
        // Wait a moment for backend analytics processing, then refresh with real data
        setTimeout(async () => {
          try {
            console.log('🔄 Refreshing analytics after deletion...')
            const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              if (data.influencers) {
                // Find the updated influencer and merge real analytics
                const updatedInfluencer = data.influencers.find((inf: any) => inf.id === campaignInfluencerId)
                if (updatedInfluencer) {
                  setCampaignInfluencers(prev => 
                    prev.map(ci => 
                      ci.id === campaignInfluencerId 
                        ? { 
                            ...ci, 
                            contentLinks: updatedLinks,
                            // Update with real analytics from backend
                            totalEngagements: updatedInfluencer.totalEngagements,
                            avgEngagementRate: updatedInfluencer.avgEngagementRate,
                            estimatedReach: updatedInfluencer.estimatedReach,
                            totalLikes: updatedInfluencer.totalLikes,
                            totalComments: updatedInfluencer.totalComments,
                            totalViews: updatedInfluencer.totalViews,
                            analyticsUpdatedAt: updatedInfluencer.analyticsUpdatedAt
                          }
                        : ci
                    )
                  )
                  console.log('📊 ANALYTICS REFRESHED AFTER DELETION!')
                }
              }
            }
          } catch (error) {
            console.error('❌ Error refreshing analytics after deletion:', error)
          }
        }, 1000) // Wait 1 second for backend processing
        
        // Show success message
        if (deleteResult.result.deletedFrom.length > 0) {
          console.log(`✅ Link deleted from: ${deleteResult.result.deletedFrom.join(', ')}`)
        }
        
        if (deleteResult.result.analyticsReset) {
          console.log('🔄 Backend analytics reset due to no remaining content links')
        }
      } else {
        const errorData = await deleteResponse.json()
        console.error('❌ Failed to delete link:', errorData)
        alert(`Failed to delete link: ${errorData.error || 'Unknown error'}`)
        return
      }

      // Also update the campaign_influencers table for consistency
      // This function is deprecated - using the comprehensive deletion service above instead
      console.log('⚠️ This old removal method should not be called - using comprehensive deletion service instead')
    } catch (error) {
      console.error('❌ Error removing link:', error)
      alert(`Error removing link: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEditingDiscountCode = (campaignInfluencer: any) => {
    setEditingDiscountCode(campaignInfluencer.id)
    setDiscountCodeInput(campaignInfluencer.discountCode || '')
  }

  const handleCancelEditingDiscountCode = () => {
    setEditingDiscountCode(null)
    setDiscountCodeInput('')
  }

  const handleUpdateDiscountCode = async (campaignInfluencerId: string, influencerId: string) => {
    if (!discountCodeInput.trim()) return

    try {
      const token = await getToken()

      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          discountCode: discountCodeInput.trim()
        })
      })
      
      if (response.ok) {
        const _result = await response.json()
        console.log('✅ Successfully updated discount code:', result)
        
        // Update the local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, discountCode: discountCodeInput.trim() }
              : ci
          )
        )
        
        // Close the editing mode
        setEditingDiscountCode(null)
        setDiscountCodeInput('')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to update discount code:', errorData)
        alert(`Failed to update discount code: ${(errorData as any)?.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating discount code:', error)
      alert(`Error updating discount code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


  const handleEditInfluencer = (campaignInfluencer: any) => {
    setEditingInfluencer(campaignInfluencer)
    setEditForm({
      contentLinks: campaignInfluencer.contentLinks || [''],
      discountCode: campaignInfluencer.discountCode || ''
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true)
      console.log('💾 [FRONTEND DEBUG] Starting content links save...')
      console.log('💾 [FRONTEND DEBUG] Campaign ID:', campaign.id)
      console.log('💾 [FRONTEND DEBUG] Influencer ID:', editingInfluencer.influencer_id || editingInfluencer.id)
      console.log('💾 [FRONTEND DEBUG] Original content links:', editForm.contentLinks)
      
      const filteredLinks = editForm.contentLinks.filter(link => link.trim())
      console.log('💾 [FRONTEND DEBUG] Filtered content links:', filteredLinks)
      console.log('💾 [FRONTEND DEBUG] Filtered links count:', filteredLinks.length)
      
      // Update the campaign influencer with content links and discount code
      const token = await getToken()
      console.log('💾 [FRONTEND DEBUG] Auth token obtained:', token ? 'Yes' : 'No')
      
      const requestBody = {
        influencerId: editingInfluencer.influencer_id || editingInfluencer.id,
        contentLinks: filteredLinks,
        discountCode: editForm.discountCode,
        status: editingInfluencer.status
      }
      
      console.log('💾 [FRONTEND DEBUG] Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('💾 [FRONTEND DEBUG] Response status:', response.status)
      console.log('💾 [FRONTEND DEBUG] Response ok:', response.ok)

      if (response.ok) {
        console.log('✅ [FRONTEND DEBUG] Content links saved successfully!')
        
        // Get response data to see what the backend returned
        const responseData = await response.json()
        console.log('✅ [FRONTEND DEBUG] Backend response:', JSON.stringify(responseData, null, 2))
        
        console.log('🔄 [FRONTEND DEBUG] Now fetching updated analytics...')
        
        // CRITICAL: Refetch campaign influencers to get REAL-TIME updated analytics
        const refreshResponse = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        console.log('🔄 [FRONTEND DEBUG] Refresh response status:', refreshResponse.status)
        console.log('🔄 [FRONTEND DEBUG] Refresh response ok:', refreshResponse.ok)
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          console.log('📊 [FRONTEND DEBUG] Fresh analytics data received:', JSON.stringify(refreshData, null, 2))
          
          // FIX: API returns data wrapped in { data: { influencers: [...] } }
          if (refreshData.data && refreshData.data.influencers) {
            console.log('📊 [FRONTEND DEBUG] Found influencers in data.influencers:', refreshData.data.influencers.length)
            setCampaignInfluencers(refreshData.data.influencers)
            console.log('⚡ [FRONTEND DEBUG] ANALYTICS UPDATED INSTANTLY! Updated influencers:', refreshData.data.influencers.length)
            
            // Log the specific influencer we updated
            const updatedInfluencer = refreshData.data.influencers.find((inf: any) => 
              inf.influencer_id === (editingInfluencer.influencer_id || editingInfluencer.id)
            )
            if (updatedInfluencer) {
              console.log('📊 [FRONTEND DEBUG] Updated influencer analytics:', {
                total_engagements: updatedInfluencer.influencer?.total_engagements,
                avg_engagement_rate: updatedInfluencer.influencer?.avg_engagement_rate,
                estimated_reach: updatedInfluencer.influencer?.estimated_reach,
                total_likes: updatedInfluencer.influencer?.total_likes,
                total_comments: updatedInfluencer.influencer?.total_comments,
                total_views: updatedInfluencer.influencer?.total_views
              })
            }
          } else if (refreshData.influencers) {
            // Fallback in case API structure changes
            console.log('📊 [FRONTEND DEBUG] Found influencers in direct property (fallback)')
            setCampaignInfluencers(refreshData.influencers)
            console.log('⚡ [FRONTEND DEBUG] ANALYTICS UPDATED INSTANTLY! (fallback path)')
          } else {
            console.error('❌ [FRONTEND DEBUG] Unexpected response structure:', refreshData)
          }
        } else {
          console.error('❌ [FRONTEND DEBUG] Failed to refresh campaign data:', refreshResponse.status, refreshResponse.statusText)
        }
        
        setShowEditModal(false)
        setEditingInfluencer(null)
      } else {
        console.error('❌ [FRONTEND DEBUG] Failed to save content links:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('❌ [FRONTEND DEBUG] Error response:', errorData)
      }
    } catch (error) {
      console.error('❌ Error updating influencer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addContentLink = () => {
    setEditForm(prev => ({
      ...prev,
      contentLinks: [...prev.contentLinks, '']
    }))
  }

  const removeContentLink = (index: number) => {
    setEditForm(prev => {
      const newLinks = prev.contentLinks.filter((_, i) => i !== index)
      // If we removed the last link, ensure we have at least one empty field
      if (newLinks.length === 0) {
        return { ...prev, contentLinks: [''] }
      }
      return { ...prev, contentLinks: newLinks }
    })
  }

  const updateContentLink = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      contentLinks: prev.contentLinks.map((link, i) => i === index ? value : link)
    }))
  }

  // Format follower count with proper units
  const formatFollowerCount = (followers: number) => {
    if (!followers) return 'No followers data'
    
    if (followers >= 1000000) {
      const millions = (followers / 1000000).toFixed(1)
      return `${millions}M followers`
    } else if (followers >= 1000) {
      const thousands = (followers / 1000).toFixed(0)
      return `${thousands}K followers`
    } else {
      return `${followers.toLocaleString()} followers`
    }
  }

  // Filter available influencers based on search term
  const getFilteredInfluencers = () => {
    if (!influencerSearchTerm.trim()) {
      return availableInfluencers.filter(influencer => 
        !campaignInfluencers.some(ci => ci.influencer_id === influencer.id)
      )
    }

    const searchLower = influencerSearchTerm.toLowerCase()
    return availableInfluencers.filter(influencer => {
      // Check if already in campaign
      if (campaignInfluencers.some(ci => ci.influencer_id === influencer.id)) {
        return false
      }

      // Search in name, display name, niches, and platform
      const name = influencer.display_name || `${influencer.first_name} ${influencer.last_name}`.trim()
      const niches = influencer.niches?.join(' ') || ''
      const platform = influencer.platform || ''

      return name.toLowerCase().includes(searchLower) ||
             niches.toLowerCase().includes(searchLower) ||
             platform.toLowerCase().includes(searchLower)
    })
  }

  if (!campaign) {
    console.log('CampaignDetailPanel: No campaign provided')
    return null
  }

  // Determine if campaign has started (Active, Paused, or Completed campaigns)
  const campaignHasStarted = ['ACTIVE', 'PAUSED', 'COMPLETED'].includes(campaign.status)

  // Mock influencer data for the campaign - in real app this would come from props or API
  const baseInfluencers = [
    {
      id: 'inf_1',
      name: 'Sarah Creator',
      platform: 'Instagram',
      followers: 45000,
      engagement_rate: 4.2,
      contact_status: 'confirmed',
      offered_amount: 1500,
      contacted_at: '2024-01-10T14:30:00Z',
      contact_notes: 'Confirmed participation. Content delivery scheduled for Jan 25th.'
    },
    {
      id: 'inf_2',
      name: 'BeautyByBella',
      platform: 'TikTok',
      followers: 89000,
      engagement_rate: 6.1,
      contact_status: 'confirmed',
      offered_amount: 2200,
      contacted_at: '2024-01-12T09:15:00Z',
      contact_notes: 'Confirmed. Requesting product samples by Jan 20th.'
    },
    {
      id: 'inf_3',
      name: 'TechReviewTom',
      platform: 'YouTube',
      followers: 125000,
      engagement_rate: 3.8,
      contact_status: campaignHasStarted ? 'confirmed' : 'contacted',
      offered_amount: 3000,
      contacted_at: '2024-01-15T11:00:00Z',
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Initial contact made. Awaiting response by Jan 22nd.'
    },
    {
      id: 'inf_4',
      name: 'FitnessLifestyle',
      platform: 'Instagram',
      followers: 67000,
      engagement_rate: 5.3,
      contact_status: campaignHasStarted ? 'confirmed' : 'contacted',
      offered_amount: 1800,
      contacted_at: '2024-01-14T16:45:00Z',
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Sent collaboration proposal. Follow-up scheduled for Jan 21st.'
    },
    {
      id: 'inf_5',
      name: 'WellnessWarrior',
      platform: 'Instagram',
      followers: 34000,
      engagement_rate: 7.2,
      contact_status: campaignHasStarted ? 'confirmed' : 'pending',
      offered_amount: 1200,
      contacted_at: campaignHasStarted ? '2024-01-16T10:30:00Z' : null,
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Identified as potential match. Contact planned for Jan 20th.'
    },
    {
      id: 'inf_6',
      name: 'LifestyleLuxe',
      platform: 'TikTok',
      followers: 112000,
      engagement_rate: 4.9,
      contact_status: campaignHasStarted ? 'confirmed' : 'pending',
      offered_amount: 2500,
      contacted_at: campaignHasStarted ? '2024-01-17T14:00:00Z' : null,
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'On contact list. Outreach scheduled for this week.'
    }
  ]

  const mockInfluencers = baseInfluencers

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      switch (action) {
        case 'pause':
          onPauseCampaign?.(campaign.id)
          break
        case 'resume':
          onResumeCampaign?.(campaign.id)
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
          />
          
          {/* Enhanced Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.6
            }}
            className="fixed right-0 top-0 h-full w-full max-w-5xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
          >
            {/* Enhanced Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{campaign.name}</h2>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-4">{campaign.brand_name}</p>
                    
                    {/* Campaign Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Users size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{campaign.assigned_influencers}</div>
                          <div className="text-xs text-gray-500">Influencers</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <DollarSign size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">${(typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Budget</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{new Date(campaign.end_date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">End Date</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.button>
                </div>

                {/* Tab Navigation */}
                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6">
                    {[
                      { id: 'overview', name: 'Overview', icon: <TrendingUp size={16} /> },
                      { id: 'influencers', name: 'Influencers & Analytics', icon: <Users size={16} /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 10px;
                  border: 2px solid transparent;
                  background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.3);
                  background-clip: content-box;
                }
              `}</style>
              
              <div className="p-6 space-y-8">
                {/* Campaign Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    <Section title="Campaign Details" delay={0.1}>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Brand"
                            value={campaign.brand_name}
                            icon={<Building2 size={18} />}
                          />
                          <InfoField
                            label="Campaign Name"
                            value={campaign.name}
                            icon={<Star size={18} />}
                          />
                          <CampaignIdField
                            campaignId={campaign.campaignId}
                            campaignUuid={campaign.id}
                            onUpdate={handleCampaignIdUpdate}
                          />
                          <InfoField
                            label="Budget"
                            value={typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                          <InfoField
                            label="Start Date"
                            value={campaign.timeline?.startDate || campaign.start_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                          <InfoField
                            label="End Date"
                            value={campaign.timeline?.endDate || campaign.end_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                          {campaign.createdBy && (
                            <InfoField
                              label="Created by"
                              value={`${campaign.createdBy.name} (${campaign.createdBy.email})`}
                              icon={<User size={18} />}
                            />
                          )}
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6">
                          <InfoField
                            label="Description"
                            value={campaign.description}
                            icon={<MessageCircle size={18} />}
                          />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Target size={16} className="mr-2" />
                              Target Niches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_niches?.map((niche: string) => (
                                <span key={niche} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {niche}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Package size={16} className="mr-2" />
                              Target Platforms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_platforms?.map((_platform: string) => (
                                <span key={platform} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {campaign.created_from_quotation && (
                          <div className="border-t border-gray-100 pt-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-center space-x-2">
                                <Star size={16} className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Created from Quotation: {campaign.quotation_id}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Progress Overview" delay={0.2}>
                      <div className="space-y-6">
                        <ProgressBar
                          current={campaign.completed_deliverables}
                          total={campaign.assigned_influencers}
                          label="Deliverables Completed"
                          color="green"
                        />
                        <ProgressBar
                          current={campaign.confirmed_influencers}
                          total={campaign.contacted_influencers}
                          label="Influencers Confirmed"
                          color="yellow"
                        />
                      </div>
                    </Section>
                  </>
                )}

                {/* Influencers Tab */}
                {activeTab === 'influencers' && (
                  <>
                    <Section title={campaignHasStarted ? "Influencer Status Overview" : "Contact Status Overview"} delay={0.1}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {campaignInfluencers.filter(inf => inf.status === 'ACCEPTED' || inf.status === 'CONFIRMED').length}
                          </div>
                          <div className="text-sm text-green-800">{campaignHasStarted ? 'Active Influencers' : 'Confirmed'}</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {campaignInfluencers.filter(inf => inf.status === 'INVITED' || inf.status === 'PENDING').length}
                          </div>
                          <div className="text-sm text-yellow-800">{campaignHasStarted ? 'In Progress' : 'Contacted'}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {campaignInfluencers.filter(inf => inf.status === 'DRAFT' || !inf.status).length}
                          </div>
                          <div className="text-sm text-gray-800">{campaignHasStarted ? 'Not Started' : 'Pending Contact'}</div>
                        </div>
                      </div>
                    </Section>

                    <Section title="Campaign Analytics Summary" delay={0.15}>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        {/* Total Engagements */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Heart size={20} className="text-red-500" />
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            {(() => {
                              const total = campaignInfluencers.reduce((sum, ci) => {
                                const value = ci.totalEngagements || 0;
                                console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Processing influencer ${ci.influencer?.display_name}: totalEngagements = ${ci.totalEngagements}`);
                                return sum + value;
                              }, 0)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Final Total Engagements: ${total}`)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Campaign influencers array:`, campaignInfluencers)
                              return total.toLocaleString() // No k/M suffixes for overall summary
                            })()}
                          </div>
                          <div className="text-sm text-red-800">Total Engagements</div>
                        </div>

                        {/* Average ER% */}
                        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Heart size={20} className="text-pink-500" />
                          </div>
                          <div className="text-2xl font-bold text-pink-600">
                            {(() => {
                              if (campaignInfluencers.length === 0) return '0%'
                              
                              // Calculate campaign-wide engagement rate (not average of individual rates)
                              const totalEngagements = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.totalEngagements || 0)
                              }, 0)
                              
                              const totalViews = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.totalViews || 0)
                              }, 0)
                              
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Avg ER% - Engagements: ${totalEngagements}, Views: ${totalViews}`)
                              
                              if (totalViews === 0) return '0%'
                              
                              const campaignER = (totalEngagements / totalViews) * 100
                              return isNaN(campaignER) ? '0%' : `${campaignER.toFixed(2)}%`
                            })()}
                          </div>
                          <div className="text-sm text-pink-800">Avg ER%</div>
                        </div>

                        {/* Est. Reach */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Users size={20} className="text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {(() => {
                              const total = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.estimatedReach || 0)
                              }, 0)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Est. Reach: ${total}`)
                              return total.toLocaleString() // No k/M suffixes for overall summary
                            })()}
                          </div>
                          <div className="text-sm text-blue-800">Est. Reach</div>
                        </div>

                        {/* Total Likes */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Heart size={20} className="text-red-500" />
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            {(() => {
                              const total = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.totalLikes || 0)
                              }, 0)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Total Likes: ${total}`)
                              return total.toLocaleString() // No k/M suffixes for overall summary
                            })()}
                          </div>
                          <div className="text-sm text-red-800">Total Likes</div>
                        </div>

                        {/* Total Comments */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <MessageCircle size={20} className="text-green-500" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {(() => {
                              const total = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.totalComments || 0)
                              }, 0)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Total Comments: ${total}`)
                              return total.toLocaleString() // No k/M suffixes for overall summary
                            })()}
                          </div>
                          <div className="text-sm text-green-800">Total Comments</div>
                        </div>

                        {/* Total Views */}
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Eye size={20} className="text-purple-500" />
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            {(() => {
                              const total = campaignInfluencers.reduce((sum, ci) => {
                                return sum + (ci.totalViews || 0)
                              }, 0)
                              console.log(`📊 [CAMPAIGN SUMMARY DEBUG] Total Views: ${total}`)
                              return total.toLocaleString() // No k/M suffixes for overall summary
                            })()}
                          </div>
                          <div className="text-sm text-purple-800">Total Views</div>
                        </div>
                      </div>
                    </Section>

                    <Section title="Campaign Influencers" delay={0.2}>
                      <div className="space-y-4">
                        {/* Add Influencer Button */}
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            Influencers ({campaignInfluencers.length})
                          </h3>
                          <button
                            onClick={() => setShowAddInfluencerModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Plus size={16} />
                            Add Influencer
                          </button>
                        </div>

                        {/* Influencers Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Content Links
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Discount Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Engagements
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Avg ER%
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Est. Reach
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Likes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Comments
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Views
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {campaignInfluencers.map((campaignInfluencer) => {
                                const influencer = campaignInfluencer.influencer || campaignInfluencer
                                return (
                                <tr key={influencer.id} className="hover:bg-gray-50">
                                  {/* Name Column */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {influencer.display_name || influencer.name || 'Unknown Influencer'}
                                    </div>
                                  </td>

                                  {/* Content Links Column */}
                                  <td className="px-6 py-4">
                                    <div className="space-y-3">
                                      {campaignInfluencer.contentLinks && campaignInfluencer.contentLinks.length > 0 ? (
                                        <>
                                          {Object.entries(groupLinksByPlatform(campaignInfluencer.contentLinks)).map(([platform, links]) => (
                                            <div key={platform} className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                  {getPlatformIcon(platform)}
                                                  <span className="font-medium">{getPlatformName(platform)}</span>
                                                  <span className="text-gray-400">({links.length})</span>
                                                </div>
                                                <button
                                                  onClick={() => handleStartAddingLink(campaignInfluencer.id, platform)}
                                                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                                                >
                                                  <Plus size={10} />
                                                  Add {getPlatformName(platform)} Link
                                                </button>
                                              </div>
                                              
                                              {/* Adding new link for this platform */}
                                              {addingLinkTo?.campaignInfluencerId === campaignInfluencer.id && addingLinkTo?.platform === platform && (
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                  <input
                                                    type="url"
                                                    value={newLinkInput}
                                                    onChange={(e) => setNewLinkInput(e.target.value)}
                                                    placeholder={`Enter ${getPlatformName(platform)} URL...`}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={() => handleAddSingleLink(campaignInfluencer.id, influencer.id)}
                                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                  >
                                                    <Check size={12} />
                                                  </button>
                                                  <button
                                                    onClick={handleCancelAddingLink}
                                                    className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                                                  >
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              )}
                                              
                                              <div className="space-y-1 ml-4">
                                                {links.map((link: string, index: number) => (
                                                  <div key={index} className="flex items-center gap-2 group">
                                                    <a 
                                                      href={link} 
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm flex-1"
                                                    >
                                                      <ExternalLink size={10} />
                                                      Link {index + 1}
                                                    </a>
                                                    <button
                                                      onClick={() => handleRemoveLink(campaignInfluencer.id, influencer.id, link)}
                                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                                                    >
                                                      <X size={10} />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                          
                                          {/* Add new platform button */}
                                          <div className="pt-2 border-t border-gray-200">
                                            <button
                                              onClick={() => handleStartAddingLink(campaignInfluencer.id, 'auto-detect')}
                                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                            >
                                              <Plus size={10} />
                                              Add Link (Auto-detect Platform)
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="space-y-2">
                                          <span className="text-sm text-gray-400">No content yet</span>
                                          <button
                                            onClick={() => handleStartAddingLink(campaignInfluencer.id, 'auto-detect')}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                          >
                                            <Plus size={10} />
                                            Add First Link
                                          </button>
                                        </div>
                                      )}
                                      
                                      {/* Adding new link with auto-detect */}
                                      {addingLinkTo?.campaignInfluencerId === campaignInfluencer.id && addingLinkTo?.platform === 'auto-detect' && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                          <input
                                            type="url"
                                            value={newLinkInput}
                                            onChange={(e) => setNewLinkInput(e.target.value)}
                                            placeholder="Enter any social media URL..."
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => handleAddSingleLink(campaignInfluencer.id, influencer.id)}
                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                          >
                                            <Check size={12} />
                                          </button>
                                          <button
                                            onClick={handleCancelAddingLink}
                                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Platform Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      {campaignInfluencer.contentLinks && campaignInfluencer.contentLinks.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                          {getPlatformIcon(getPrimaryPlatform(campaignInfluencer.contentLinks))}
                                          <span className="text-sm text-gray-600">
                                            {getPlatformName(getPrimaryPlatform(campaignInfluencer.contentLinks))}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-400">No content</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Discount Code Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      {editingDiscountCode === campaignInfluencer.id ? (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={discountCodeInput}
                                            onChange={(e) => setDiscountCodeInput(e.target.value)}
                                            placeholder="Enter discount code..."
                                            className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => handleUpdateDiscountCode(campaignInfluencer.id, influencer.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                          >
                                            <Check size={12} />
                                          </button>
                                          <button
                                            onClick={handleCancelEditingDiscountCode}
                                            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 group">
                                          <Tag size={14} className="text-gray-400" />
                                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                            {campaignInfluencer.discountCode || (influencer.display_name || influencer.name || 'UNKNOWN').replace(/\s+/g, '').toUpperCase().slice(0, 8) + '20'}
                                          </code>
                                          <button
                                            onClick={() => handleStartEditingDiscountCode(campaignInfluencer)}
                                            className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 p-1"
                                          >
                                            <Edit3 size={10} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Total Engagements Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Heart size={14} className="text-red-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Total Engagements for ${influencer.display_name}:`, {
                                          campaignInfluencer: campaignInfluencer,
                                          totalEngagements: campaignInfluencer.totalEngagements,
                                          totalEngagementsType: typeof campaignInfluencer.totalEngagements,
                                          influencer: influencer,
                                          influencer_total_engagements: influencer.total_engagements,
                                          contentLinks: campaignInfluencer.contentLinks,
                                          contentLinksLength: campaignInfluencer.contentLinks?.length,
                                          platform: campaignInfluencer.contentLinks?.map(link => {
                                            if (link.includes('tiktok.com')) return 'TikTok';
                                            if (link.includes('instagram.com')) return 'Instagram';
                                            if (link.includes('youtube.com')) return 'YouTube';
                                            return 'Unknown';
                                          }),
                                          analyticsUpdatedAt: campaignInfluencer.analyticsUpdatedAt,
                                          hasAnalytics: !!(campaignInfluencer.totalEngagements || campaignInfluencer.totalViews || campaignInfluencer.totalLikes)
                                        })}
                                        {campaignInfluencer.totalEngagements ? formatNumber(campaignInfluencer.totalEngagements) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Avg ER% Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Heart size={14} className="text-red-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Avg ER% for ${influencer.display_name}:`, {
                                          avgEngagementRate: campaignInfluencer.avgEngagementRate,
                                          avgEngagementRateType: typeof campaignInfluencer.avgEngagementRate,
                                          totalEngagements: campaignInfluencer.totalEngagements,
                                          totalViews: campaignInfluencer.totalViews,
                                          calculatedER: campaignInfluencer.totalViews > 0 ? ((campaignInfluencer.totalEngagements || 0) / campaignInfluencer.totalViews * 100).toFixed(2) : '0'
                                        })}
                                        {campaignInfluencer.avgEngagementRate ? `${campaignInfluencer.avgEngagementRate.toFixed(2)}%` : '0%'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Est. Reach Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Users size={14} className="text-blue-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Est. Reach for ${influencer.display_name}:`, {
                                          estimatedReach: campaignInfluencer.estimatedReach,
                                          estimatedReachType: typeof campaignInfluencer.estimatedReach,
                                          totalViews: campaignInfluencer.totalViews,
                                          isSameAsViews: campaignInfluencer.estimatedReach === campaignInfluencer.totalViews
                                        })}
                                        {campaignInfluencer.estimatedReach ? formatNumber(campaignInfluencer.estimatedReach) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Total Likes Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Heart size={14} className="text-red-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Total Likes for ${influencer.display_name}:`, {
                                          totalLikes: campaignInfluencer.totalLikes,
                                          totalLikesType: typeof campaignInfluencer.totalLikes,
                                          contentLinks: campaignInfluencer.contentLinks,
                                          hasTikTok: campaignInfluencer.contentLinks?.some(link => link.includes('tiktok.com')),
                                          hasInstagram: campaignInfluencer.contentLinks?.some(link => link.includes('instagram.com'))
                                        })}
                                        {campaignInfluencer.totalLikes ? formatNumber(campaignInfluencer.totalLikes) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Total Comments Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <MessageCircle size={14} className="text-green-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Total Comments for ${influencer.display_name}:`, {
                                          totalComments: campaignInfluencer.totalComments,
                                          totalCommentsType: typeof campaignInfluencer.totalComments,
                                          platform: campaignInfluencer.contentLinks?.map(link => {
                                            if (link.includes('tiktok.com')) return 'TikTok';
                                            if (link.includes('instagram.com')) return 'Instagram';
                                            return 'Other';
                                          })
                                        })}
                                        {campaignInfluencer.totalComments ? formatNumber(campaignInfluencer.totalComments) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Views Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Eye size={14} className="text-purple-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {console.log(`📊 [ANALYTICS TABLE DEBUG] Total Views for ${influencer.display_name}:`, {
                                          totalViews: campaignInfluencer.totalViews,
                                          totalViewsType: typeof campaignInfluencer.totalViews,
                                          contentLinks: campaignInfluencer.contentLinks,
                                          analyticsUpdatedAt: campaignInfluencer.analyticsUpdatedAt,
                                          timeSinceUpdate: campaignInfluencer.analyticsUpdatedAt ? 
                                            Math.round((Date.now() - new Date(campaignInfluencer.analyticsUpdatedAt).getTime()) / 1000 / 60) + ' minutes ago' : 'never'
                                        })}
                                        {campaignInfluencer.totalViews ? formatNumber(campaignInfluencer.totalViews) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Actions Column */}
                                  <td className="px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => window.open(`/staff/roster/${influencer.id}`, '_blank')}
                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                        title="View detailed analytics and performance"
                                      >
                                        <TrendingUp size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleEditInfluencer(campaignInfluencer)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                        title="Edit content links and discount code"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Remove from campaign"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {campaignInfluencers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No influencers added to this campaign yet.</p>
                            <button
                              onClick={() => setShowAddInfluencerModal(true)}
                              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                            >
                              <Plus size={16} />
                              Add First Influencer
                            </button>
                          </div>
                        )}
                      </div>
                    </Section>
                  </>
                )}

              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {campaign.status === 'ACTIVE' && (
                    <motion.button
                      onClick={() => handleAction('pause')}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause size={16} />
                      <span>Pause Campaign</span>
                    </motion.button>
                  )}
                  
                  {campaign.status === 'PAUSED' && (
                    <motion.button
                      onClick={() => handleAction('resume')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play size={16} />
                      <span>Resume Campaign</span>
                    </motion.button>
                  )}
                  
                  
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}


      {/* Edit Influencer Modal */}
      {showEditModal && editingInfluencer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Influencer Details</h3>
                <p className="text-sm text-gray-600">
                  {editingInfluencer.influencer?.display_name || editingInfluencer.influencer?.name || 'Unknown Influencer'}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Content Links Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Content Links {editForm.contentLinks.length > 0 && editForm.contentLinks.some(link => link.trim()) && `(${editForm.contentLinks.filter(link => link.trim()).length})`}
                  </label>
                  {editForm.contentLinks.length > 0 && editForm.contentLinks.some(link => link.trim()) && (
                    <button
                      onClick={() => setEditForm(prev => ({ ...prev, contentLinks: [''] }))}
                      className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      title="Clear all content links and reset analytics"
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {editForm.contentLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateContentLink(index, e.target.value)}
                        placeholder="https://instagram.com/p/... or https://tiktok.com/..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeContentLink(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete this link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addContentLink}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  >
                    <Plus size={16} />
                    Add another link
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Removing all content links will reset analytics to 0
                </p>
              </div>

              {/* Discount Code Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code
                </label>
                <input
                  type="text"
                  value={editForm.discountCode}
                  onChange={(e) => setEditForm(prev => ({ ...prev, discountCode: e.target.value }))}
                  placeholder="Enter discount code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Influencer Modal */}
      {showAddInfluencerModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4"
          onClick={handleCloseAddInfluencerModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Influencer to Campaign</h3>
                  <p className="text-sm text-gray-600">Select influencers from your roster to add to this campaign</p>
                </div>
                <button
                  onClick={handleCloseAddInfluencerModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search influencers by name, niche, or platform..."
                  value={influencerSearchTerm}
                  onChange={(e) => setInfluencerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {influencersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">Loading influencers...</span>
                </div>
              ) : (
                <>
                  {getFilteredInfluencers().length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {influencerSearchTerm.trim() ? 'No influencers found' : 'No available influencers'}
                      </h3>
                      <p className="text-gray-500">
                        {influencerSearchTerm.trim() 
                          ? `No influencers match "${influencerSearchTerm}". Try a different search term.`
                          : 'All influencers have already been added to this campaign.'
                        }
                      </p>
                      {influencerSearchTerm.trim() && (
                        <button
                          onClick={() => setInfluencerSearchTerm('')}
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Showing {getFilteredInfluencers().length} influencer{getFilteredInfluencers().length !== 1 ? 's' : ''}
                        {influencerSearchTerm.trim() && ` matching "${influencerSearchTerm}"`}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getFilteredInfluencers().map((influencer) => (
                          <div
                            key={influencer.id}
                            className={`p-4 border border-gray-200 rounded-lg transition-colors ${
                              addingInfluencer === influencer.id 
                                ? 'bg-blue-100 border-blue-300 cursor-wait' 
                                : 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                            }`}
                            onClick={() => addingInfluencer !== influencer.id && addInfluencerToCampaign(influencer.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
                                {influencer.display_name?.charAt(0) || influencer.first_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {influencer.display_name || `${influencer.first_name} ${influencer.last_name}`.trim()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatFollowerCount(influencer.total_followers)}
                                </div>
                                {influencer.niches && influencer.niches.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {influencer.niches.slice(0, 2).join(', ')}
                                  </div>
                                )}
                              </div>
                              {addingInfluencer === influencer.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                              ) : (
                                <Plus size={20} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
} 