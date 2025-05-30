'use client'

import { useState, useEffect } from 'react'
import { X, Star, Building2, Calendar, DollarSign, Users, CheckCircle, Send, FileText, Tag, Target, TrendingUp, User, Edit, ExternalLink, Megaphone, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuotationDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  quotation: any
  onSendQuote: (pricing: string, notes: string) => void
  onCreateCampaign?: (quotationId: string) => void
}

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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/60 ${className}`}
    >
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {action}
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
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
  type?: 'text' | 'email' | 'url' | 'phone'
}) => {
  const renderValue = () => {
    if (type === 'url' && value) {
      return (
        <a 
          href={value as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
        >
          {value}
        </a>
      )
    }
    
    if (type === 'email' && value) {
      return (
        <a 
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
        >
          {value}
        </a>
      )
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

const InfluencerPricingCard = ({
  influencer,
  index,
  pricing,
  onPricingChange,
  isEditable
}: {
  influencer: any
  index: number
  pricing: string
  onPricingChange: (value: string) => void
  isEditable: boolean
}) => {
  // Function to construct social media URL
  const getSocialMediaUrl = (platform: string, username: string) => {
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '')
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${cleanUsername}`
      case 'tiktok':
        return `https://tiktok.com/@${cleanUsername}`
      case 'youtube':
        return `https://youtube.com/@${cleanUsername}`
      case 'twitter':
        return `https://twitter.com/${cleanUsername}`
      case 'linkedin':
        return `https://linkedin.com/in/${cleanUsername}`
      default:
        return '#'
    }
  }

  // Platform icon mapping
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
      case 'tiktok':
        return (
          <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        )
      case 'youtube':
        return (
          <div className="w-5 h-5 bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )
      case 'twitter':
        return (
          <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        )
      case 'linkedin':
        return (
          <div className="w-5 h-5 bg-blue-700 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-5 h-5 bg-gray-500 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )
    }
  }

  const handleOpenProfile = () => {
    const url = getSocialMediaUrl(influencer.platform, influencer.name)
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Name and Stats */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Platform Icon */}
            <div className="flex-shrink-0">
              {getPlatformIcon(influencer.platform)}
            </div>
            
            {/* Name with External Link */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <h4 className="font-semibold text-gray-900 text-sm">{influencer.name}</h4>
              <button
                onClick={handleOpenProfile}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded hover:bg-gray-100"
                title={`Open ${influencer.name} on ${influencer.platform}`}
              >
                <ExternalLink size={12} />
              </button>
            </div>
            
            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users size={12} className="text-gray-400" />
                <span className="font-medium">{influencer.followers}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp size={12} className="text-gray-400" />
                <span className="font-medium">{influencer.engagement}</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Pricing */}
          <div className="flex-shrink-0 ml-4">
            {isEditable ? (
              <div className="flex items-center space-x-2 w-32">
                <span className="text-sm font-semibold text-gray-900">$</span>
                <input
                  type="number"
                  value={pricing}
                  onChange={(e) => onPricingChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/20 focus:border-black/30 transition-all duration-200 placeholder:text-gray-400 font-medium text-sm"
                  placeholder="0"
                />
              </div>
            ) : (
              pricing && (
                <div className="bg-green-50 border border-green-200 rounded-md px-3 py-1.5">
                  <span className="font-bold text-green-900 text-sm">${pricing}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_review':
        return {
          label: 'Pending Review',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-600'
        }
      case 'sent':
        return {
          label: 'Sent',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-600'
        }
      case 'approved':
        return {
          label: 'Approved',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-600'
        }
      default:
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-600'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${config.className}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full mr-2`}></div>
      {config.label}
    </span>
  )
}

export default function QuotationDetailPanel({ isOpen, onClose, quotation, onSendQuote, onCreateCampaign }: QuotationDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'campaign_info' | 'influencers'>('campaign_info')
  const [influencerPricing, setInfluencerPricing] = useState<{[key: number]: string}>({})
  const [useCustomTotal, setUseCustomTotal] = useState(false)
  const [customQuoteTotal, setCustomQuoteTotal] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)

  // Initialize pricing from existing data or empty
  useEffect(() => {
    if (quotation) {
      const initialPricing: {[key: number]: string} = {}
      quotation.influencers?.forEach((_: any, index: number) => {
        initialPricing[index] = ''
      })
      setInfluencerPricing(initialPricing)
      
      if (quotation.total_quote) {
        setCustomQuoteTotal(quotation.total_quote.replace('$', ''))
        setUseCustomTotal(true)
      }
    }
  }, [quotation])

  // Calculate total from individual prices
  const calculatedTotal = Object.values(influencerPricing)
    .filter(price => price && !isNaN(parseFloat(price)))
    .reduce((sum, price) => sum + parseFloat(price), 0)

  const finalTotal = useCustomTotal ? customQuoteTotal : calculatedTotal.toString()

  const handleInfluencerPricingChange = (index: number, value: string) => {
    setInfluencerPricing(prev => ({
      ...prev,
      [index]: value
    }))
  }

  const handleSendQuote = async () => {
    const totalToUse = useCustomTotal ? customQuoteTotal : calculatedTotal.toString()
    
    if (!totalToUse || parseFloat(totalToUse) <= 0) {
      alert('Please enter valid pricing before sending quote')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSendQuote(totalToUse, quoteNotes)
      onClose()
    } catch (error) {
      console.error('Error sending quote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    // DISABLED: Campaigns are now automatically created when quotations are approved
    // This function is no longer used as the flow is fully automated
    console.log('Campaign creation is now automatic when quotations are approved')
  }

  if (!quotation) return null

  const isEditable = quotation.status === 'pending_review'

  return (
    <AnimatePresence>
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
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
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
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <Building2 size={32} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{quotation.campaign_name}</h2>
                        <StatusBadge status={quotation.status} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-2">{quotation.brand_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{quotation.influencer_count} influencers</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{quotation.campaign_duration}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={14} />
                          <span>{quotation.budget_range}</span>
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
                <div className="mt-6 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'campaign_info', label: 'Campaign Information' },
                      { id: 'influencers', label: 'Selected Influencers' }
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
                {/* Campaign Information Tab */}
                {activeTab === 'campaign_info' && (
                  <>
                    <Section title="Campaign Details" delay={0.1}>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Brand"
                            value={quotation.brand_name}
                            icon={<Building2 size={18} />}
                          />
                          <InfoField
                            label="Campaign Name"
                            value={quotation.campaign_name}
                            icon={<Tag size={18} />}
                          />
                          <InfoField
                            label="Influencer Count"
                            value={quotation.influencer_count}
                            icon={<Users size={18} />}
                          />
                          <InfoField
                            label="Duration"
                            value={quotation.campaign_duration}
                            icon={<Calendar size={18} />}
                          />
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-6">
                            <InfoField
                              label="Description"
                              value={quotation.description}
                              icon={<FileText size={18} />}
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <InfoField
                                label="Budget Range"
                                value={quotation.budget_range}
                                icon={<DollarSign size={18} />}
                              />
                              <InfoField
                                label="Target Demographics"
                                value={quotation.target_demographics}
                                icon={<User size={18} />}
                              />
                            </div>
                            <InfoField
                              label="Deliverables"
                              value={quotation.deliverables.join(", ")}
                              icon={<Target size={18} />}
                            />
                            {quotation.notes && (
                              <div className="border-t border-gray-100 pt-6">
                                <InfoField
                                  label="Brand Notes"
                                  value={quotation.notes}
                                  icon={<FileText size={18} />}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Section>

                    {/* Internal Notes */}
                    {isEditable && (
                      <Section title="Internal Notes" delay={0.2}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Add internal notes about this quotation
                          </label>
                          <textarea
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all duration-300 placeholder:text-gray-400 font-medium resize-none"
                            placeholder="Add any internal notes about this quote..."
                          />
                        </div>
                      </Section>
                    )}
                  </>
                )}

                {/* Selected Influencers Tab */}
                {activeTab === 'influencers' && (
                  <>
                    <Section title={`Influencer Pricing (${quotation.influencers.length})`} delay={0.1}>
                      {isEditable && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-800 font-medium">
                              Progress: {Object.values(influencerPricing).filter(price => price && !isNaN(parseFloat(price))).length} of {quotation.influencers.length} priced
                            </span>
                            <div className="text-blue-600">
                              {Math.round((Object.values(influencerPricing).filter(price => price && !isNaN(parseFloat(price))).length / quotation.influencers.length) * 100)}% complete
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        {quotation.influencers.map((influencer: any, index: number) => (
                          <InfluencerPricingCard
                            key={index}
                            influencer={influencer}
                            index={index}
                            pricing={influencerPricing[index] || ''}
                            onPricingChange={(value) => handleInfluencerPricingChange(index, value)}
                            isEditable={isEditable}
                          />
                        ))}
                      </div>
                    </Section>

                    {/* Pricing Summary */}
                    {isEditable && (
                      <Section title="Quote Total" delay={0.2}>
                        <div className="space-y-8">
                          {/* Calculated Total */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-semibold text-blue-900">Calculated Total</span>
                              <span className="text-3xl font-bold text-blue-900">${calculatedTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-blue-700">Sum of all individual influencer prices</p>
                          </div>

                          {/* Custom Total Option */}
                          <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-start space-x-4 mb-6">
                              <input
                                type="checkbox"
                                id="useCustomTotal"
                                checked={useCustomTotal}
                                onChange={(e) => setUseCustomTotal(e.target.checked)}
                                className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded mt-0.5"
                              />
                              <div className="flex-1">
                                <label htmlFor="useCustomTotal" className="text-base font-medium text-gray-900 cursor-pointer">
                                  Use custom final quotation amount
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  Override the calculated total with a custom amount
                                </p>
                              </div>
                            </div>

                            {useCustomTotal && (
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Final Quotation Amount
                                </label>
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl font-bold text-gray-900">$</span>
                                  <input
                                    type="number"
                                    value={customQuoteTotal}
                                    onChange={(e) => setCustomQuoteTotal(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all duration-300 placeholder:text-gray-400 font-medium text-lg"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Final Total */}
                          <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold">Final Quote Total</span>
                              <span className="text-4xl font-bold">${parseFloat(finalTotal || '0').toFixed(2)}</span>
                            </div>
                            <p className="text-gray-300 text-sm mt-2">
                              {useCustomTotal ? 'Custom amount' : 'Calculated from individual prices'}
                            </p>
                          </div>
                        </div>
                      </Section>
                    )}
                  </>
                )}

                {/* Quote Status Info for completed quotes */}
                {!isEditable && (
                  <Section title="Quote Status" delay={0.3}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {quotation.quoted_at && (
                        <InfoField
                          label="Quoted Date"
                          value={new Date(quotation.quoted_at).toLocaleDateString()}
                          icon={<Calendar size={18} />}
                        />
                      )}
                      {quotation.approved_at && (
                        <InfoField
                          label="Approved Date"
                          value={new Date(quotation.approved_at).toLocaleDateString()}
                          icon={<CheckCircle size={18} />}
                        />
                      )}
                      {quotation.total_quote && (
                        <InfoField
                          label="Final Quote Amount"
                          value={`$${quotation.total_quote}`}
                          icon={<DollarSign size={18} />}
                        />
                      )}
                    </div>
                    
                    {/* Campaign Creation Section for Approved Quotes */}
                    {quotation.status === 'approved' && (
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-green-900 flex items-center mb-2">
                                <Megaphone size={20} className="mr-2" />
                                Campaign Created Automatically
                              </h4>
                              <p className="text-sm text-green-700 mb-4">
                                When this quotation was approved by the brand, a campaign was automatically created and 
                                all selected influencers were invited to participate.
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-green-600">
                                <div className="flex items-center">
                                  <Users size={16} className="mr-1" />
                                  <span>{quotation.influencer_count} influencers invited</span>
                                </div>
                                <div className="flex items-center">
                                  <DollarSign size={16} className="mr-1" />
                                  <span>${quotation.total_quote} approved budget</span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle size={16} className="mr-1" />
                                  <span>Campaign active</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Section>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditable && (
              <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-8">
                <div className="flex justify-end space-x-4">
                  <motion.button
                    onClick={onClose}
                    className="px-8 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSendQuote}
                    disabled={isLoading || !finalTotal || parseFloat(finalTotal) <= 0}
                    className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:opacity-60 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                    whileHover={{ scale: isLoading || !finalTotal || parseFloat(finalTotal) <= 0 ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading || !finalTotal || parseFloat(finalTotal) <= 0 ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Quote to Brand</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 