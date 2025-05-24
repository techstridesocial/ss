'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, Plus, Minus, Mail, Lock, Upload, Edit3, User, Users, Tag, MessageSquare, Settings, Instagram, Youtube, Video, Globe } from 'lucide-react'
import { InfluencerDetailView, Platform } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

interface InfluencerManagementPanelProps {
  influencer: InfluencerDetailView | null
  isOpen: boolean
  onClose: () => void
  onSave?: (data: Partial<InfluencerDetailView>) => void
  onPlatformSwitch?: (platform: string) => void
  selectedPlatform?: string
}

// Platform Icon Component
const PlatformIcon = ({ platform, size = 16 }: { platform: string, size?: number }) => {
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

// Dropdown Component
const Dropdown = ({ 
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

// Input Component
const Input = ({ 
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

// Section Component
const Section = ({ 
  title, 
  children, 
  collapsible = false,
  defaultOpen = true,
  action
}: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  action?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className={`flex items-center justify-between py-4 px-6 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {action}
          {collapsible && (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function InfluencerManagementPanel({ 
  influencer, 
  isOpen, 
  onClose, 
  onSave, 
  onPlatformSwitch,
  selectedPlatform 
}: InfluencerManagementPanelProps) {
  const [relationshipStatus, setRelationshipStatus] = useState('')
  const [assignee, setAssignee] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [newLabel, setNewLabel] = useState('')

  // Initialize data when influencer changes
  useEffect(() => {
    if (influencer) {
      setRelationshipStatus(influencer.relationship_status || 'not_started')
      setAssignee(influencer.assigned_to || '')
      setLabels(influencer.labels || [])
      setNotes(influencer.notes || '')
    }
  }, [influencer])

  if (!influencer) return null

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

  const handleSave = () => {
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

  const handlePlatformClick = (platform: string) => {
    onPlatformSwitch?.(platform)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
          
          {/* Management Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-[42rem] top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Relationship</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Assignee */}
              <Section title="Assignee">
                <Dropdown
                  value={assignee}
                  options={assigneeOptions}
                  onChange={setAssignee}
                  placeholder="Select"
                />
              </Section>

              {/* Profiles */}
              <Section title="Profiles" action={<button className="text-blue-600 text-sm font-medium">Edit</button>}>
                <div className="space-y-3">
                  {influencer.platform_details.map(platform => (
                    <div 
                      key={platform.id}
                      onClick={() => handlePlatformClick(platform.platform)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedPlatform === platform.platform 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={influencer.avatar_url || '/default-avatar.png'} 
                            alt={platform.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">@{platform.username}</span>
                            {platform.is_verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{(platform.followers / 1000).toFixed(1)}k followers</span>
                            <span>•</span>
                            <span>{platform.engagement_rate.toFixed(2)}% ER</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform={platform.platform} size={16} />
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Emails */}
              <Section title="Emails" action={<button className="text-blue-600 text-sm font-medium">Unlock</button>}>
                <p className="text-sm text-gray-500">Unlock the email and start a conversation.</p>
              </Section>

              {/* Campaign Setup */}
              <Section title="Campaign setup" collapsible defaultOpen={false}>
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
                    <Input
                      value={newLabel}
                      onChange={setNewLabel}
                      placeholder="Add labels"
                    />
                    <button
                      onClick={addLabel}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
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
                <Input
                  value={notes}
                  onChange={setNotes}
                  placeholder="Add notes"
                  multiline
                  rows={4}
                />
              </Section>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 