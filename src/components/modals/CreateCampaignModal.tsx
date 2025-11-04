'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Loader2, Calendar, DollarSign, Target, Users, Globe } from 'lucide-react'

interface CampaignData {
  name: string
  brand_id: string
  description: string
  budget: number
  start_date: string
  end_date: string
  target_niches: string[]
  target_platforms: string[]
  target_location?: string
  campaign_type: 'SEEDING' | 'SPONSORED' | 'COLLABORATION'
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CampaignData) => Promise<void>
  brands: Array<{ id: string; company_name: string }>
}

const AVAILABLE_NICHES = [
  'Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Health', 'Food', 'Travel',
  'Tech', 'Gaming', 'Photography', 'Art', 'Music', 'Comedy', 'Education',
  'Business', 'Finance', 'Parenting', 'Pets', 'Sports', 'Entertainment'
]

const PLATFORMS = [
  'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITCH', 'TWITTER', 'LINKEDIN'
]

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onSave,
  brands 
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignData>({
    name: '',
    brand_id: '',
    description: '',
    budget: 0,
    start_date: '',
    end_date: '',
    target_niches: [],
    target_platforms: [],
    target_location: '',
    campaign_type: 'SPONSORED'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required'
    if (!formData.brand_id) newErrors.brand_id = 'Please select a brand'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.budget <= 0) newErrors.budget = 'Budget must be greater than 0'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.end_date) newErrors.end_date = 'End date is required'
    if (formData.target_niches.length === 0) newErrors.target_niches = 'Select at least one niche'
    if (formData.target_platforms.length === 0) newErrors.target_platforms = 'Select at least one platform'
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onSave(formData)
      setFormData({
        name: '',
        brand_id: '',
        description: '',
        budget: 0,
        start_date: '',
        end_date: '',
        target_niches: [],
        target_platforms: [],
        target_location: '',
        campaign_type: 'SPONSORED'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNiche = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      target_niches: prev.target_niches.includes(niche)
        ? prev.target_niches.filter(n => n !== niche)
        : [...prev.target_niches, niche]
    }))
  }

  const togglePlatform = (_platform: string) => {
    setFormData(prev => ({
      ...prev,
      target_platforms: prev.target_platforms.includes(_platform)
        ? prev.target_platforms.filter(p => p !== _platform)
        : [...prev.target_platforms, _platform]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Summer Beauty Campaign"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Client *
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.brand_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a brand...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.company_name}
                  </option>
                ))}
              </select>
              {errors.brand_id && <p className="text-red-500 text-xs mt-1">{errors.brand_id}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the campaign objectives, deliverables, and key messaging..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Budget & Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign size={16} className="mr-1" />
                Total Budget *
              </label>
              <input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.budget ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="15000"
              />
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <select
                value={formData.campaign_type}
                onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SPONSORED">Sponsored Content</option>
                <option value="SEEDING">Product Seeding</option>
                <option value="COLLABORATION">Brand Collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe size={16} className="mr-1" />
                Target Location
              </label>
              <input
                type="text"
                value={formData.target_location || ''}
                onChange={(e) => setFormData({ ...formData, target_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="United Kingdom"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar size={16} className="mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar size={16} className="mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Target Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Target size={16} className="mr-1" />
              Target Platforms * ({formData.target_platforms.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    formData.target_platforms.includes(platform)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
            {errors.target_platforms && <p className="text-red-500 text-xs mt-1">{errors.target_platforms}</p>}
          </div>

          {/* Target Niches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Target size={16} className="mr-1" />
              Target Niches * ({formData.target_niches.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AVAILABLE_NICHES.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    formData.target_niches.includes(niche)
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
            {errors.target_niches && <p className="text-red-500 text-xs mt-1">{errors.target_niches}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{isLoading ? 'Creating...' : 'Create Campaign'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
} 