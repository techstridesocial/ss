'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink, TrendingUp, Users, Eye, Heart, MessageCircle, MapPin, Calendar, Bookmark, Mail, Globe, Instagram, Youtube, Video, ChevronDown, Shield, AlertTriangle, Target, Settings, Plus, Tag, Edit3, Hash } from 'lucide-react'
import { InfluencerDetailView } from '@/types/database'
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
  const [activeTab, setActiveTab] = useState('management')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure we're on the client side before rendering portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Management tab state
  const [assignee, setAssignee] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [newLabel, setNewLabel] = useState('')
  
  // Internal Pricing state
  const [pricing, setPricing] = useState({
    instagram_post: { our_cost: '', client_rate: '' },
    instagram_reel: { our_cost: '', client_rate: '' },
    instagram_story: { our_cost: '', client_rate: '' },
    tiktok_post: { our_cost: '', client_rate: '' },
    youtube_video: { our_cost: '', client_rate: '' },
    youtube_short: { our_cost: '', client_rate: '' },
    package_deal: { our_cost: '', client_rate: '' },
    notes: ''
  })
  const [pricingHasUnsavedChanges, setPricingHasUnsavedChanges] = useState(false)
  const [originalPricing, setOriginalPricing] = useState({
    instagram_post: { our_cost: '', client_rate: '' },
    instagram_reel: { our_cost: '', client_rate: '' },
    instagram_story: { our_cost: '', client_rate: '' },
    tiktok_post: { our_cost: '', client_rate: '' },
    youtube_video: { our_cost: '', client_rate: '' },
    youtube_short: { our_cost: '', client_rate: '' },
    package_deal: { our_cost: '', client_rate: '' },
    notes: ''
  })
  
  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    assignee: '',
    labels: [] as string[],
    notes,
    pricing: {
      instagram_post: { our_cost: '', client_rate: '' },
      instagram_reel: { our_cost: '', client_rate: '' },
      instagram_story: { our_cost: '', client_rate: '' },
      tiktok_post: { our_cost: '', client_rate: '' },
      youtube_video: { our_cost: '', client_rate: '' },
      youtube_short: { our_cost: '', client_rate: '' },
      package_deal: { our_cost: '', client_rate: '' },
      notes: ''
    }
  })
  
  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  
  const [staffMembers, setStaffMembers] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Unassigned' }
  ])
  const [trackingLinks, setTrackingLinks] = useState<Array<{
    shortUrl: string
    originalUrl: string
    title: string
    clicks: number
    createdAt: string
    linkId: string
  }>>([])
  const [showAddLinkForm, setShowAddLinkForm] = useState(false)
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [linkSettingsOpen, setLinkSettingsOpen] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [editLinkTitle, setEditLinkTitle] = useState('')
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info'
    message: string
  }>>([])
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    linkId: string | null
    linkTitle: string | null
  }>({
    isOpen: false,
    linkId: null,
    linkTitle: null
  })

  // Tracking links functions - moved above useEffect to avoid initialization issues
  const fetchTrackingLinks = async () => {
    if (!influencer) return
    
    try {
      const response = await fetch(`/api/short-links?influencerId=${influencer.id}`)
      if (response.ok) {
        const data = await response.json()
        setTrackingLinks(data.links || [])
      } else {
        console.error('Failed to fetch tracking links')
      }
    } catch (error) {
      console.error('Error fetching tracking links:', error)
    }
  }

  const createTrackingLink = async () => {
    if (!influencer || !newLinkUrl.trim()) return

    setIsCreatingLink(true)
    try {
      const response = await fetch('/api/short-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: newLinkUrl.trim(),
          title: newLinkTitle.trim() || undefined,
          influencerId: influencer.id
        })
      })

      if (response.ok) {
        const newLink = await response.json()
        setTrackingLinks(prev => [newLink, ...prev])
        setNewLinkUrl('')
        setNewLinkTitle('')
        setShowAddLinkForm(false)
        showNotification('success', 'Tracking link created successfully!')
      } else {
        const errorData = await response.json()
        showNotification('error', `Failed to create tracking link: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating tracking link:', error)
      showNotification('error', 'Error creating tracking link. Please try again.')
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleAddLinkClick = () => {
    setShowAddLinkForm(true)
  }

  const handleCancelAddLink = () => {
    setShowAddLinkForm(false)
    setNewLinkUrl('')
    setNewLinkTitle('')
  }

  // Delete tracking link
  const deleteTrackingLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/short-links?linkId=${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTrackingLinks(prev => prev.filter(link => link.linkId !== linkId))
        setLinkSettingsOpen(null)
        showNotification('success', 'Link deleted successfully!')
      } else {
        const errorData = await response.json()
        showNotification('error', `Failed to delete link: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting link:', error)
      showNotification('error', 'Error deleting link. Please try again.')
    }
  }

  // Edit tracking link
  const saveEditLink = async (linkId: string) => {
    try {
      const response = await fetch('/api/short-links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          title: editLinkTitle
        })
      })

      if (response.ok) {
        const updatedLink = await response.json()
        setTrackingLinks(prev => prev.map(link => 
          link.linkId === linkId ? { ...link, title: updatedLink.title } : link
        ))
        setEditingLink(null)
        setEditLinkTitle('')
        showNotification('success', 'Link updated successfully!')
      } else {
        const errorData = await response.json()
        showNotification('error', `Failed to update link: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating link:', error)
      showNotification('error', 'Error updating link. Please try again.')
    }
  }

  const startEditLink = (link: any) => {
    setEditingLink(link.linkId)
    setEditLinkTitle(link.title || '')
    setLinkSettingsOpen(null)
  }

  // Notification helpers
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, type, message }])
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    }, 4000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  // Delete confirmation helpers
  const openDeleteConfirmation = (linkId: string, linkTitle: string | null) => {
    setDeleteConfirmation({
      isOpen: true,
      linkId,
      linkTitle
    })
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      linkId: null,
      linkTitle: null
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.linkId) {
      await deleteTrackingLink(deleteConfirmation.linkId)
      closeDeleteConfirmation()
    }
  }

  // Improved copy function with fallback
  const copyToClipboard = async (text: string, buttonElement: HTMLButtonElement) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        showCopySuccess(buttonElement)
        return
      }
      
      // Fallback method
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      if (document.execCommand('copy')) {
        showCopySuccess(buttonElement)
      } else {
        throw new Error('Copy command failed')
      }
      
      document.body.removeChild(textArea)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Show error feedback
      const originalColor = buttonElement.style.color
      buttonElement.style.color = '#EF4444'
      buttonElement.title = 'Copy failed'
      setTimeout(() => {
        buttonElement.style.color = originalColor
        buttonElement.title = 'Copy link'
      }, 2000)
    }
  }

  const showCopySuccess = (buttonElement: HTMLButtonElement) => {
    const originalColor = buttonElement.style.color
    const originalTitle = buttonElement.title
    buttonElement.style.color = '#10B981'
    buttonElement.title = 'Copied!'
    setTimeout(() => {
      buttonElement.style.color = originalColor
      buttonElement.title = originalTitle
    }, 2000)
  }

  const tabs = [
    { id: 'management', label: 'Management' },
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'content', label: 'Content' },
    { id: 'pricing', label: 'Internal Pricing' }
  ]

  // Reset state when panel opens with new influencer
  useEffect(() => {
    if (isOpen && influencer) {
      setActiveTab('management')
    }
  }, [isOpen, influencer])

  // Initialize management data when influencer changes
  useEffect(() => {
    if (influencer) {
      const initialAssignee = influencer.assigned_to || ''
      const initialLabels = influencer.labels || []
      const initialNotes = influencer.notes || ''
      
      setAssignee(initialAssignee)
      setLabels(initialLabels)
      setNotes(initialNotes)
      
      // Set original values for change tracking
      setOriginalValues({
        assignee,
        labels: [...labels],
        notes,
        pricing: {
          instagram_post: { our_cost: '', client_rate: '' },
          instagram_reel: { our_cost: '', client_rate: '' },
          instagram_story: { our_cost: '', client_rate: '' },
          tiktok_post: { our_cost: '', client_rate: '' },
          youtube_video: { our_cost: '', client_rate: '' },
          youtube_short: { our_cost: '', client_rate: '' },
          package_deal: { our_cost: '', client_rate: '' },
          notes: ''
        }
      })
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false)
    }
  }, [influencer])

  // Track changes to management fields
  useEffect(() => {
    if (!influencer) return
    
    const hasChanges = 
      assignee !== originalValues.assignee ||
      notes !== originalValues.notes ||
      JSON.stringify(labels.sort()) !== JSON.stringify(originalValues.labels.sort())
    
    setHasUnsavedChanges(hasChanges)
  }, [assignee, labels, notes, originalValues, influencer])

  // Track changes to pricing fields
  useEffect(() => {
    if (!influencer) return
    
    const hasPricingChanges = JSON.stringify(pricing) !== JSON.stringify(originalPricing)
    setPricingHasUnsavedChanges(hasPricingChanges)
  }, [pricing, originalPricing, influencer])

  // Fetch staff members from Clerk
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        console.log('Fetching staff members from API...')
        const response = await fetch('/api/staff-members')
        console.log('API response status:', response.status)
        
        if (response.ok) {
          const staff = await response.json()
          console.log('Fetched staff members:', staff)
          setStaffMembers(staff)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch staff members:', response.status, errorText)
          // Fallback to mock data for development
          const fallbackStaff = [
            { value: '', label: 'Unassigned' },
            { value: 'sarah_thompson', label: 'Sarah Thompson - Talent Manager' },
            { value: 'james_wilson', label: 'James Wilson - Campaign Lead' },
            { value: 'emily_davis', label: 'Emily Davis - Content Strategist' },
            { value: 'alex_morgan', label: 'Alex Morgan - Partnership Manager' },
            { value: 'charlie_brown', label: 'Charlie Brown - Creative Director' },
          ]
          setStaffMembers(fallbackStaff)
        }
        
      } catch (error) {
        console.error('Error fetching staff members:', error)
        // Fallback to mock data for development
        const fallbackStaff = [
          { value: '', label: 'Unassigned' },
          { value: 'sarah_thompson', label: 'Sarah Thompson - Talent Manager' },
          { value: 'james_wilson', label: 'James Wilson - Campaign Lead' },
          { value: 'emily_davis', label: 'Emily Davis - Content Strategist' },
          { value: 'alex_morgan', label: 'Alex Morgan - Partnership Manager' },
          { value: 'charlie_brown', label: 'Charlie Brown - Creative Director' },
        ]
        setStaffMembers(fallbackStaff)
      }
    }

    fetchStaffMembers()
  }, [])

  // Fetch tracking links when influencer changes
  useEffect(() => {
    if (influencer) {
      fetchTrackingLinks()
    }
  }, [influencer])

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close settings dropdown if clicking outside
      if (linkSettingsOpen && !(event.target as Element).closest('.relative')) {
        setLinkSettingsOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [linkSettingsOpen])

  // Close dropdowns when delete confirmation opens
  useEffect(() => {
    if (deleteConfirmation.isOpen) {
      setLinkSettingsOpen(null)
    }
  }, [deleteConfirmation.isOpen])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  if (!influencer || !mounted) return null

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
  const handleManagementSave = () => {
    onSave?.({
      assigned_to: assignee,
      labels,
      notes
    })
    
    // Update original values after successful save
    setOriginalValues({
      assignee,
      labels: [...labels],
      notes,
      pricing: {
        instagram_post: { our_cost: '', client_rate: '' },
        instagram_reel: { our_cost: '', client_rate: '' },
        instagram_story: { our_cost: '', client_rate: '' },
        tiktok_post: { our_cost: '', client_rate: '' },
        youtube_video: { our_cost: '', client_rate: '' },
        youtube_short: { our_cost: '', client_rate: '' },
        package_deal: { our_cost: '', client_rate: '' },
        notes: ''
      }
    })
    setHasUnsavedChanges(false)
  }

  // Close confirmation handlers
  const handleCloseAttempt = () => {
    if ((hasUnsavedChanges && activeTab === 'management') || (pricingHasUnsavedChanges && activeTab === 'pricing')) {
      setShowCloseConfirmation(true)
    } else {
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false)
    onClose()
  }

  const handleSaveAndClose = () => {
    if (activeTab === 'management') {
      handleManagementSave()
    } else if (activeTab === 'pricing') {
      handlePricingSave()
    }
    setShowCloseConfirmation(false)
    onClose()
  }

  const handleCancelClose = () => {
    setShowCloseConfirmation(false)
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

  // Pricing helper functions
  const handlePricingChange = (platform: string, field: 'our_cost' | 'client_rate', value: string) => {
    setPricing(prev => ({
      ...prev,
      [platform]: {
        ...(prev as any)[platform],
        [field]: value
      }
    }))
  }

  const handlePricingNotesChange = (value: string) => {
    setPricing(prev => ({ ...prev, notes: value }))
  }

  const handlePricingSave = () => {
    // In a real implementation, this would save to the database
    onSave?.({
      ...(pricing as any)
    })
    
    // Update original values after successful save
    setOriginalPricing(pricing)
    setPricingHasUnsavedChanges(false)
    
    showNotification('success', 'Internal pricing updated successfully!')
  }

  // Custom Notification Component
  const NotificationToast = ({ notification }: { notification: { id: string, type: 'success' | 'error' | 'info', message: string } }) => {
    const variants = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800', 
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    const icons = {
      success: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.3 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        className={`flex items-center p-4 border rounded-xl shadow-lg backdrop-blur-sm ${variants[notification.type]}`}
      >
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => removeNotification(notification.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Custom Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!deleteConfirmation.isOpen) return null

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDeleteConfirmation}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Tracking Link</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this tracking link?
              </p>
              {deleteConfirmation.linkTitle && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{deleteConfirmation.linkTitle}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={closeDeleteConfirmation}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Link
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  // Use createPortal to render directly to document.body, bypassing all parent containers
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseAttempt}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />
          
          {/* Notification Container */}
          <div className="fixed top-4 right-4 z-[80] space-y-2 max-w-md">
            <AnimatePresence>
              {notifications.map(notification => (
                <NotificationToast key={notification.id} notification={notification} />
              ))}
            </AnimatePresence>
          </div>
          
          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal />
          
          {/* Close Confirmation Modal */}
          {showCloseConfirmation && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCancelClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Unsaved Changes</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        You have unsaved changes in the {activeTab === 'pricing' ? 'pricing' : 'management'} tab
                      </p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="mb-8">
                    <p className="text-base text-gray-700 leading-relaxed">
                      Would you like to save your changes before closing?
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleConfirmClose}
                      className="flex-1 h-11"
                    >
                      Discard Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancelClose}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveAndClose}
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                    >
                      Save & Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Enhanced Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-y-auto flex flex-col"
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
                      onClick={handleCloseAttempt}
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
                                options={staffMembers}
                                onChange={setAssignee}
                                placeholder="Select"
                              />
                            </Section>

                            {/* Tracking Links */}
                            <Section title="Tracking Links">
                              <div className="space-y-4">
                                {/* Tracking Links Header */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Campaign tracking links</span>
                                  <button
                                    onClick={handleAddLinkClick}
                                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Link</span>
                                  </button>
                                </div>

                                {/* Add Link Form */}
                                {showAddLinkForm && (
                                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Original URL *
                                        </label>
                                        <ManagementInput
                                          value={newLinkUrl}
                                          onChange={setNewLinkUrl}
                                          placeholder="https://example.com/product"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Title (optional)
                                        </label>
                                        <ManagementInput
                                          value={newLinkTitle}
                                          onChange={setNewLinkTitle}
                                          placeholder="Product link for campaign"
                                        />
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={createTrackingLink}
                                          disabled={!newLinkUrl.trim() || isCreatingLink}
                                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          {isCreatingLink ? 'Creating...' : 'Create Link'}
                                        </button>
                                        <button
                                          onClick={handleCancelAddLink}
                                          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Existing Tracking Links */}
                                {trackingLinks.length > 0 ? (
                                  <div className="space-y-2">
                                    {trackingLinks.map((link) => (
                                      <div key={link.linkId} className="border border-gray-200 rounded-lg p-3 bg-white">
                                        {editingLink === link.linkId ? (
                                          /* Edit Mode */
                                          <div className="space-y-3">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Short URL (read-only)
                                              </label>
                                              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                                                {link.shortUrl}
                                              </div>
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Original URL (read-only)
                                              </label>
                                              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-600 truncate">
                                                {link.originalUrl}
                                              </div>
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Title
                                              </label>
                                              <ManagementInput
                                                value={editLinkTitle}
                                                onChange={setEditLinkTitle}
                                                placeholder="Add a title for this link"
                                              />
                                            </div>
                                            <div className="flex space-x-2">
                                              <button
                                                onClick={() => saveEditLink(link.linkId)}
                                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingLink(null)
                                                  setEditLinkTitle('')
                                                }}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          /* View Mode */
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-blue-600 truncate">
                                                  {link.shortUrl}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={(event) => {
                                                      copyToClipboard(link.shortUrl, event.currentTarget as HTMLButtonElement)
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Copy link"
                                                  >
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                                    </svg>
                                                  </button>
                                                  <button
                                                    onClick={() => window.open(`https://app.short.io/links/${link.linkId}`, '_blank')}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View analytics"
                                                  >
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                                                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                                                    </svg>
                                                  </button>
                                                  {/* Settings Dropdown */}
                                                  <div className="relative">
                                                    <button
                                                      onClick={() => setLinkSettingsOpen(linkSettingsOpen === link.linkId ? null : link.linkId)}
                                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                      title="Settings"
                                                    >
                                                      <Settings className="w-3 h-3" />
                                                    </button>
                                                    
                                                    <AnimatePresence>
                                                      {linkSettingsOpen === link.linkId && (
                                                        <motion.div
                                                          initial={{ opacity: 0, y: -10 }}
                                                          animate={{ opacity: 1, y: 0 }}
                                                          exit={{ opacity: 0, y: -10 }}
                                                          transition={{ duration: 0.15 }}
                                                          className="absolute right-0 top-6 z-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                                                        >
                                                          <button
                                                            onClick={() => startEditLink(link)}
                                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                          >
                                                            <Edit3 className="w-3 h-3" />
                                                            <span>Edit</span>
                                                          </button>
                                                          <button
                                                            onClick={() => openDeleteConfirmation(link.linkId, link.title)}
                                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                          >
                                                            <X className="w-3 h-3" />
                                                            <span>Delete</span>
                                                          </button>
                                                        </motion.div>
                                                      )}
                                                    </AnimatePresence>
                                                  </div>
                                                </div>
                                              </div>
                                              <p className="text-xs text-gray-500 truncate" title={link.originalUrl}>
                                                → {link.originalUrl}
                                              </p>
                                              {link.title && (
                                                <p className="text-xs text-gray-600 mt-1">{link.title}</p>
                                              )}
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-gray-500">
                                              <span className="font-medium">{link.clicks} clicks</span>
                                              <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : !showAddLinkForm && (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    No tracking links created yet
                                  </div>
                                )}
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
                                variant={hasUnsavedChanges ? "default" : "ghost"}
                                onClick={handleManagementSave}
                                className={`px-6 py-2 ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : ''}`}
                              >
                                {hasUnsavedChanges && (
                                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                                )}
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Internal Pricing Tab */}
                        {activeTab === 'pricing' && (
                          <div className="p-6 space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Internal Pricing</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Manage internal cost basis and client rates for this creator across all platforms.
                              </p>
                            </div>

                            {/* Instagram Pricing */}
                            <Section title="Instagram" description="Pricing for Instagram content">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Instagram Post */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                                    Instagram Post
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.instagram_post.our_cost}
                                        onChange={(value) => handlePricingChange('instagram_post', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.instagram_post.client_rate}
                                        onChange={(value) => handlePricingChange('instagram_post', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Instagram Reel */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                                    Instagram Reel
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.instagram_reel.our_cost}
                                        onChange={(value) => handlePricingChange('instagram_reel', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.instagram_reel.client_rate}
                                        onChange={(value) => handlePricingChange('instagram_reel', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Instagram Story */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                                    Instagram Story
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.instagram_story.our_cost}
                                        onChange={(value) => handlePricingChange('instagram_story', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.instagram_story.client_rate}
                                        onChange={(value) => handlePricingChange('instagram_story', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Section>

                            {/* TikTok Pricing */}
                            <Section title="TikTok" description="Pricing for TikTok content">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Hash className="w-4 h-4 mr-2 text-black" />
                                    TikTok Video
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.tiktok_post.our_cost}
                                        onChange={(value) => handlePricingChange('tiktok_post', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.tiktok_post.client_rate}
                                        onChange={(value) => handlePricingChange('tiktok_post', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Section>

                            {/* YouTube Pricing */}
                            <Section title="YouTube" description="Pricing for YouTube content">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* YouTube Video */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Youtube className="w-4 h-4 mr-2 text-red-500" />
                                    YouTube Video
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.youtube_video.our_cost}
                                        onChange={(value) => handlePricingChange('youtube_video', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.youtube_video.client_rate}
                                        onChange={(value) => handlePricingChange('youtube_video', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* YouTube Short */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Youtube className="w-4 h-4 mr-2 text-red-500" />
                                    YouTube Short
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.youtube_short.our_cost}
                                        onChange={(value) => handlePricingChange('youtube_short', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.youtube_short.client_rate}
                                        onChange={(value) => handlePricingChange('youtube_short', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Section>

                            {/* Package Deal */}
                            <Section title="Package Deals" description="Special package pricing">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                                    Multi-Platform Package
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Our Cost</label>
                                      <ManagementInput
                                        value={pricing.package_deal.our_cost}
                                        onChange={(value) => handlePricingChange('package_deal', 'our_cost', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Rate</label>
                                      <ManagementInput
                                        value={pricing.package_deal.client_rate}
                                        onChange={(value) => handlePricingChange('package_deal', 'client_rate', value)}
                                        placeholder="£0.00"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Section>

                            {/* Pricing Notes */}
                            <Section title="Pricing Notes" description="Internal notes about pricing strategy">
                              <ManagementInput
                                value={pricing.notes}
                                onChange={handlePricingNotesChange}
                                placeholder="Add any special notes about pricing, negotiation history, or restrictions..."
                                multiline
                                rows={4}
                              />
                            </Section>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                              <Button
                                variant={pricingHasUnsavedChanges ? "default" : "ghost"}
                                onClick={handlePricingSave}
                                className={`px-6 py-2 ${pricingHasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : ''}`}
                              >
                                {pricingHasUnsavedChanges && (
                                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                                )}
                                Save Pricing
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
    </AnimatePresence>,
    document.body
  )
} 