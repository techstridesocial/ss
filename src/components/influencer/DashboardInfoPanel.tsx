'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, User, Mail, Phone, MapPin, Calendar, DollarSign, Users, CheckCircle, AlertTriangle, Clock, Settings, ChevronDown, ChevronUp, Edit3, Save, X as XIcon, Check, CreditCard, Shield, Eye, EyeOff } from 'lucide-react'
import { useUserRole } from '../../lib/auth/hooks'
import { PaymentMethodsSection } from './PaymentMethodsSection'

interface DashboardInfoPanelProps {
  influencer: any
  isOpen: boolean
  onClose: () => void
  onDataUpdate?: (updatedInfluencer: any) => void
}

export default function DashboardInfoPanel({ 
  influencer, 
  isOpen, 
  onClose,
  onDataUpdate
}: DashboardInfoPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    influencer_type: '',
    content_type: '',
    agency_name: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const userRole = useUserRole()
  
  // WhatsApp group link state
  const [isAddingWhatsApp, setIsAddingWhatsApp] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState(influencer?.whatsapp_url || '')
  const [whatsappInput, setWhatsappInput] = useState('')
  const [whatsappSaving, setWhatsappSaving] = useState(false)
  const [whatsappError, setWhatsappError] = useState('')
  
  // Check if user is staff or admin
  const isStaff = userRole === 'STAFF' || userRole === 'ADMIN'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize edit data when influencer changes
  useEffect(() => {
    if (influencer) {
      setEditData({
        influencer_type: influencer.influencer_type || 'SIGNED',
        content_type: influencer.content_type || 'STANDARD',
        agency_name: influencer.agency_name || ''
      })
    }
  }, [influencer])

  // Validate form data
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!editData.influencer_type) {
      errors.influencer_type = 'Influencer type is required'
    }
    
    if (!editData.content_type) {
      errors.content_type = 'Content type is required'
    }
    
    if (editData.influencer_type === 'AGENCY_PARTNER' && !editData.agency_name?.trim()) {
      errors.agency_name = 'Agency name is required for Agency Partner'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditData({
        influencer_type: influencer.influencer_type || 'SIGNED',
        content_type: influencer.content_type || 'STANDARD',
        agency_name: influencer.agency_name || ''
      })
      setValidationErrors({})
      setSaveSuccess(false)
    }
    setIsEditing(!isEditing)
  }

  // Handle save changes
  const handleSave = async () => {
    if (!influencer?.id) return
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSaving(true)
    setSaveSuccess(false)
    setValidationErrors({})
    
    try {
      const response = await fetch(`/api/influencers/${influencer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          influencer_type: editData.influencer_type,
          content_type: editData.content_type,
          agency_name: editData.agency_name
        })
      })

      if (response.ok) {
        // Update the influencer object with new data
        const updatedInfluencer = { ...influencer, ...editData }
        Object.assign(influencer, editData)
        setSaveSuccess(true)
        
        // Notify parent component of data update
        onDataUpdate?.(updatedInfluencer)
        
        // Auto-close edit mode after success
        setTimeout(() => {
          setIsEditing(false)
          setSaveSuccess(false)
        }, 1500)
      } else {
        const errorData = await response.json()
        setValidationErrors({ general: errorData.error || 'Failed to save changes' })
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      setValidationErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle WhatsApp URL save
  const handleWhatsAppSave = async () => {
    if (!influencer?.id) return
    
    // Validate URL
    if (!whatsappInput.trim()) {
      setWhatsappError('Please enter a WhatsApp URL')
      return
    }
    
    // Basic URL validation
    if (!whatsappInput.startsWith('http://') && !whatsappInput.startsWith('https://')) {
      setWhatsappError('Please enter a valid URL starting with http:// or https://')
      return
    }
    
    setWhatsappSaving(true)
    setWhatsappError('')
    
    try {
      const response = await fetch(`/api/influencers/${influencer.id}/whatsapp`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp_url: whatsappInput
        })
      })

      if (response.ok) {
        setWhatsappUrl(whatsappInput)
        influencer.whatsapp_url = whatsappInput
        setIsAddingWhatsApp(false)
        setWhatsappInput('')
        
        // Notify parent component of data update
        onDataUpdate?.({ ...influencer, whatsapp_url: whatsappInput })
      } else {
        const errorData = await response.json()
        setWhatsappError(errorData.error || 'Failed to save WhatsApp URL')
      }
    } catch (error) {
      console.error('Error saving WhatsApp URL:', error)
      setWhatsappError('Network error. Please try again.')
    } finally {
      setWhatsappSaving(false)
    }
  }

  // Handle WhatsApp URL removal
  const handleWhatsAppRemove = async () => {
    if (!influencer?.id) return
    
    setWhatsappSaving(true)
    
    try {
      const response = await fetch(`/api/influencers/${influencer.id}/whatsapp`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setWhatsappUrl('')
        influencer.whatsapp_url = ''
        
        // Notify parent component of data update
        onDataUpdate?.({ ...influencer, whatsapp_url: '' })
      } else {
        const errorData = await response.json()
        setWhatsappError(errorData.error || 'Failed to remove WhatsApp URL')
      }
    } catch (error) {
      console.error('Error removing WhatsApp URL:', error)
      setWhatsappError('Network error. Please try again.')
    } finally {
      setWhatsappSaving(false)
    }
  }

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !influencer) return null

  // Premium Section Component
  const PremiumSection = ({ title, children, defaultOpen = false, badge }: { title: string, children: React.ReactNode, defaultOpen?: boolean, badge?: string | number }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-6 px-6 text-left hover:bg-gray-50/50 transition-all duration-200 focus:outline-none group"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {badge}
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </div>
        </button>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.15, delay: 0.05 }
              }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Premium Metrics Grid Component
  const PremiumMetricsGrid = ({ metrics, columns = 2 }: { metrics: any[], columns?: 2 | 3 | 4 }) => {
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-3', 
      4: 'grid-cols-4'
    }

    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                {metric.label}
              </span>
              {metric.quality && (
                <div className={`w-2 h-2 rounded-full ${
                  metric.quality === 'high' ? 'bg-green-500' : 
                  metric.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              )}
            </div>
            <div className="text-2xl font-semibold text-gray-900 leading-none">
              {metric.value}
            </div>
            {metric.secondaryValue && (
              <div className="text-sm text-gray-500">
                {metric.secondaryValue}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Never'
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-stretch justify-end"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-panel-title"
        >
          <motion.div
            initial={{ x: '100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white shadow-2xl w-full max-w-2xl lg:max-w-3xl h-screen overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
                {/* Merged Header with Profile Info */}
                <div className="bg-white border-b border-gray-100">
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                          {influencer.avatar_url ? (
                            <img 
                              src={influencer.avatar_url} 
                              alt={influencer.display_name}
                              className="w-16 h-16 rounded-2xl object-cover"
                            />
                          ) : (
                            <User size={28} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 id="dashboard-panel-title" className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
                            {influencer.display_name}
                          </h2>
                          <p className="text-gray-500 mt-1">
                            @{influencer.platforms?.[0]?.username || 'username'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              influencer.user_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                              influencer.user_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {influencer.user_status === 'ACTIVE' ? <CheckCircle size={12} className="mr-1" /> :
                               influencer.user_status === 'PENDING' ? <Clock size={12} className="mr-1" /> :
                               <Settings size={12} className="mr-1" />}
                              {influencer.user_status || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {influencer.tier || 'Silver'} Tier
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isStaff && (
                          <button
                            onClick={handleEditToggle}
                            disabled={isSaving}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isEditing 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' 
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={isEditing ? "Cancel editing" : "Edit influencer details"}
                          >
                            {isEditing ? <XIcon size={16} /> : <Edit3 size={16} />}
                            <span className="text-sm font-medium">
                              {isEditing ? 'Cancel' : 'Edit'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Close dashboard panel"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Account Status Section */}
              <PremiumSection title="Account Status" defaultOpen={true} badge="3">
                <PremiumMetricsGrid 
                  metrics={[
                    {
                      label: 'Last Login',
                      value: formatTimeAgo(influencer.last_login),
                      quality: influencer.last_login ? 'high' : 'low'
                    },
                    {
                      label: 'Onboarding',
                      value: influencer.is_onboarded ? 'Complete' : 'Pending',
                      quality: influencer.is_onboarded ? 'high' : 'medium'
                    },
                    {
                      label: 'Platform Connections',
                      value: `${influencer.platforms?.filter((p: any) => p.is_connected).length || 0}/${influencer.platforms?.length || 0}`,
                      quality: (influencer.platforms?.filter((p: any) => p.is_connected).length || 0) > 0 ? 'high' : 'low'
                    }
                  ]}
                  columns={3}
                />
              </PremiumSection>

              {/* Management Section */}
              <PremiumSection title="Management" defaultOpen={true} badge="3">
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Success Message */}
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md"
                        >
                          <Check size={16} className="text-green-600" />
                          <span className="text-sm text-green-700">Changes saved successfully!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* General Error Message */}
                    {validationErrors.general && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle size={16} className="text-red-600" />
                        <span className="text-sm text-red-700">{validationErrors.general}</span>
                      </div>
                    )}
                    
                    {/* Simple Edit Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Influencer Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editData.influencer_type}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, influencer_type: e.target.value }))
                            if (validationErrors.influencer_type) {
                              setValidationErrors(prev => ({ ...prev, influencer_type: '' }))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.influencer_type 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="SIGNED">Signed</option>
                          <option value="PARTNERED">Partnered</option>
                          <option value="AGENCY_PARTNER">Agency Partner</option>
                        </select>
                        {validationErrors.influencer_type && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.influencer_type}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editData.content_type}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, content_type: e.target.value }))
                            if (validationErrors.content_type) {
                              setValidationErrors(prev => ({ ...prev, content_type: '' }))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.content_type 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="STANDARD">Standard</option>
                          <option value="UGC">UGC</option>
                          <option value="SEEDING">Seeding</option>
                        </select>
                        {validationErrors.content_type && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.content_type}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Agency Name - only show for Agency Partner */}
                    {editData.influencer_type === 'AGENCY_PARTNER' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agency Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editData.agency_name}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, agency_name: e.target.value }))
                            if (validationErrors.agency_name) {
                              setValidationErrors(prev => ({ ...prev, agency_name: '' }))
                            }
                          }}
                          placeholder="Enter agency name"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.agency_name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.agency_name && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.agency_name}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Enhanced Save/Cancel Buttons */}
                    <div className="flex items-center space-x-3 pt-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <PremiumMetricsGrid 
                    metrics={[
                      {
                        label: 'Assigned To',
                        value: influencer.assigned_to || 'Unassigned',
                        quality: influencer.assigned_to ? 'high' : 'low'
                      },
                      {
                        label: 'Influencer Type',
                        value: influencer.influencer_type === 'SIGNED' ? 'Signed' :
                               influencer.influencer_type === 'PARTNERED' ? 'Partnered' :
                               influencer.influencer_type === 'AGENCY_PARTNER' ? 'Agency Partner' :
                               'Signed',
                        quality: 'medium'
                      },
                      {
                        label: 'Content Type',
                        value: influencer.content_type === 'STANDARD' ? 'Standard' :
                               influencer.content_type === 'UGC' ? 'UGC' :
                               influencer.content_type === 'SEEDING' ? 'Seeding' :
                               'Standard',
                        quality: 'medium'
                      }
                    ]}
                    columns={3}
                  />
                )}
              </PremiumSection>

              {/* Contact Information Section */}
              <PremiumSection title="Contact Information" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{influencer.email || 'No email provided'}</span>
                  </div>
                  {influencer.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{influencer.phone}</span>
                    </div>
                  )}
                  {influencer.location_city && (
                    <div className="flex items-center space-x-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{influencer.location_city}, {influencer.location_country}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Joined {formatDate(influencer.created_at)}</span>
                  </div>

                  {/* WhatsApp Group Link */}
                  <div className="pt-2 border-t border-gray-100">
                    {whatsappUrl ? (
                      <div className="flex items-center justify-between">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group flex-1"
                        >
                          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <span className="text-sm font-medium text-green-700 group-hover:text-green-800">WhatsApp Group Chat</span>
                          <svg className="w-4 h-4 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {isStaff && (
                          <button
                            onClick={handleWhatsAppRemove}
                            disabled={whatsappSaving}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove WhatsApp link"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ) : isStaff && isAddingWhatsApp ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Group URL
                          </label>
                          <input
                            type="url"
                            value={whatsappInput}
                            onChange={(e) => {
                              setWhatsappInput(e.target.value)
                              if (whatsappError) setWhatsappError('')
                            }}
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                          {whatsappError && (
                            <p className="mt-1 text-xs text-red-600">{whatsappError}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleWhatsAppSave}
                            disabled={whatsappSaving}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
                          >
                            {whatsappSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingWhatsApp(false)
                              setWhatsappInput('')
                              setWhatsappError('')
                            }}
                            disabled={whatsappSaving}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isStaff ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsAddingWhatsApp(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium w-full justify-center"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span>Add WhatsApp Group</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </PremiumSection>

              {/* Campaign History Section */}
              <PremiumSection title="Campaign History" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <DollarSign size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Campaign data will be connected to database</p>
                  </div>
                </div>
              </PremiumSection>

              {/* Payment Methods Section */}
              <PaymentMethodsSection influencer={influencer} />

              {/* Bottom spacing for better scrolling experience */}
              <div className="h-8"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(panel, document.body)
}
