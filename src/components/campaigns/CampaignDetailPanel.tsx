'use client'

import { useState, useEffect } from 'react'
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
  return num.toString()
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
  const [activeTab, setActiveTab] = useState<'overview' | 'influencers' | 'analytics'>('overview')
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

  const getPlatformIcon = (platform: string): string => {
    const icons = {
      instagram: '📷',
      tiktok: '📱',
      youtube: '📺',
      twitter: '🐦',
      linkedin: '💼',
      facebook: '📘',
      unknown: '🌐'
    }
    return icons[platform as keyof typeof icons] || '🌐'
  }

  const getPlatformName = (platform: string): string => {
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
        const result = await response.json()
        console.log('✅ Successfully added influencer:', result)
        
        // Refresh the campaign influencers list
        console.log('🔄 Refreshing campaign influencers list...')
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
        const result = await response.json()
        console.log('✅ Successfully updated content links:', result)
        
        // Update the local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, contentLinks: links }
              : ci
          )
        )
        
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
          contentLinks: updatedLinks
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Successfully added single link:', result)
        
        // Update the local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, contentLinks: updatedLinks }
              : ci
          )
        )
        
        // Close the adding mode
        setAddingLinkTo(null)
        setNewLinkInput('')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to add link:', errorData)
        alert(`Failed to add link: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding single link:', error)
      alert(`Error adding link: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRemoveLink = async (campaignInfluencerId: string, influencerId: string, linkToRemove: string) => {
    try {
      const token = await getToken()
      const currentCampaignInfluencer = campaignInfluencers.find(ci => ci.id === campaignInfluencerId)
      const existingLinks = currentCampaignInfluencer?.contentLinks || []
      const updatedLinks = existingLinks.filter((link: string) => link !== linkToRemove)

      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          influencerId: influencerId,
          contentLinks: updatedLinks
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Successfully removed link:', result)
        
        // Update the local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === campaignInfluencerId 
              ? { ...ci, contentLinks: updatedLinks }
              : ci
          )
        )
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to remove link:', errorData)
        alert(`Failed to remove link: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error removing link:', error)
      alert(`Error removing link: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        const result = await response.json()
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
      // Update the campaign influencer with content links and discount code
      const token = await getToken()
      const response = await fetch(`/api/campaigns/${campaign.id}/influencers`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          influencerId: editingInfluencer.influencer_id || editingInfluencer.id,
          contentLinks: editForm.contentLinks.filter(link => link.trim()),
          discountCode: editForm.discountCode,
          status: editingInfluencer.status
        })
      })

      if (response.ok) {
        // Update local state
        setCampaignInfluencers(prev => 
          prev.map(ci => 
            ci.id === editingInfluencer.id 
              ? { ...ci, contentLinks: editForm.contentLinks, discountCode: editForm.discountCode }
              : ci
          )
        )
        setShowEditModal(false)
        setEditingInfluencer(null)
      }
    } catch (error) {
      console.error('Error updating influencer:', error)
    }
  }

  const addContentLink = () => {
    setEditForm(prev => ({
      ...prev,
      contentLinks: [...prev.contentLinks, '']
    }))
  }

  const removeContentLink = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      contentLinks: prev.contentLinks.filter((_, i) => i !== index)
    }))
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
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-2">{campaign.brand_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{campaign.assigned_influencers} influencers</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={14} />
                          <span>${(typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget).toLocaleString()} budget</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                        {campaign.createdBy && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span>Created by: {campaign.createdBy.name || campaign.createdBy.display_name || 'Staff Member'}</span>
                            </div>
                          </>
                        )}
                        {!campaign.createdBy && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span>Created by: Staff Member</span>
                            </div>
                          </>
                        )}
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
                <div className="mt-6 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {                    [
                      { id: 'overview', label: 'Campaign Overview' },
                      { id: 'influencers', label: 'Influencers & Status' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
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
              
              <div className="p-8 space-y-10">
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
                          <InfoField
                            label="Budget"
                            value={typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                          <InfoField
                            label="Spent"
                            value={campaign.spent || 0}
                            type="currency"
                            icon={<TrendingUp size={18} />}
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
                              {campaign.target_platforms?.map((platform: string) => (
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
                          current={campaign.spent}
                          total={typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget}
                          label="Budget Usage"
                          color="blue"
                        />
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
                            {mockInfluencers.filter(inf => inf.contact_status === 'confirmed').length}
                          </div>
                          <div className="text-sm text-green-800">{campaignHasStarted ? 'Active Influencers' : 'Confirmed'}</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {mockInfluencers.filter(inf => inf.contact_status === 'contacted').length}
                          </div>
                          <div className="text-sm text-yellow-800">{campaignHasStarted ? 'In Progress' : 'Contacted'}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {mockInfluencers.filter(inf => inf.contact_status === 'pending').length}
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
                                const inf = ci.influencer || ci
                                return sum + (inf.total_engagements || 0)
                              }, 0)
                              return total > 0 ? formatNumber(total) : '0'
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
                              const avgRate = campaignInfluencers.reduce((sum, ci) => {
                                const inf = ci.influencer || ci
                                return sum + (inf.avg_engagement_rate || 0)
                              }, 0) / campaignInfluencers.length
                              return isNaN(avgRate) ? '0%' : `${(avgRate * 100).toFixed(2)}%`
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
                                const inf = ci.influencer || ci
                                return sum + (inf.estimated_reach || 0)
                              }, 0)
                              return total > 0 ? formatNumber(total) : '0'
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
                                const inf = ci.influencer || ci
                                return sum + (inf.total_likes || 0)
                              }, 0)
                              return total > 0 ? formatNumber(total) : '0'
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
                                const inf = ci.influencer || ci
                                return sum + (inf.total_comments || 0)
                              }, 0)
                              return total > 0 ? formatNumber(total) : '0'
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
                                const inf = ci.influencer || ci
                                return sum + (inf.total_views || 0)
                              }, 0)
                              return total > 0 ? formatNumber(total) : '0'
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
                                                  <span>{getPlatformIcon(platform)}</span>
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
                                          <span className="text-lg">{getPlatformIcon(getPrimaryPlatform(campaignInfluencer.contentLinks))}</span>
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
                                        {influencer.total_engagements ? formatNumber(influencer.total_engagements) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Avg ER% Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Heart size={14} className="text-red-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {influencer.avg_engagement_rate ? `${(influencer.avg_engagement_rate * 100).toFixed(2)}%` : '0%'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Est. Reach Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Users size={14} className="text-blue-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {influencer.estimated_reach ? formatNumber(influencer.estimated_reach) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Total Likes Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Heart size={14} className="text-red-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {influencer.total_likes ? formatNumber(influencer.total_likes) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Total Comments Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <MessageCircle size={14} className="text-green-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {influencer.total_comments ? formatNumber(influencer.total_comments) : '0'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Views Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Eye size={14} className="text-purple-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {influencer.total_views ? formatNumber(influencer.total_views) : '0'}
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Links
                </label>
                <div className="space-y-3">
                  {editForm.contentLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateContentLink(index, e.target.value)}
                        placeholder="https://instagram.com/p/..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editForm.contentLinks.length > 1 && (
                        <button
                          onClick={() => removeContentLink(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addContentLink}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add another link
                  </button>
                </div>
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