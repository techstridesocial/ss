'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Loader2, TrendingUp, Tag, MapPin, Globe, User, Users } from 'lucide-react'

interface InfluencerData {
  id: string
  display_name: string
  first_name?: string
  last_name?: string
  bio?: string
  location_country?: string
  location_city?: string
  website_url?: string
  niches: string[]
  influencer_type: 'GOLD' | 'SILVER' | 'PARTNERED'
  average_views?: number
  is_active: boolean
}

interface EditInfluencerModalProps {
  influencer: InfluencerData | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: InfluencerData) => Promise<void>
}

const AVAILABLE_NICHES = [
  'Tech', 'Lifestyle', 'Product review', 'Home', 'Gaming', 'AI', 'Web',
  'Education', 'Food', 'Fitness', 'Cleaning', 'Adventure', 'Travel', 
  'Family', 'Sports', 'Entertainment', 'Music', 'Fashion', 'Beauty', 'Health'
]

export default function EditInfluencerModal({ 
  influencer, 
  isOpen, 
  onClose, 
  onSave 
}: EditInfluencerModalProps) {
  const [formData, setFormData] = useState<InfluencerData>(() => {
    if (!influencer) {
      return {
        id: '',
        display_name: '',
        niches: [],
        influencer_type: 'SILVER',
        is_active: true
      }
    }
    return influencer
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNiches, setSelectedNiches] = useState<string[]>(() => {
    return influencer?.niches || []
  })

  // Update form data when influencer changes
  useEffect(() => {
    if (influencer) {
      setFormData(influencer)
      setSelectedNiches(influencer.niches)
    }
  }, [influencer])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave({ ...formData, niches: selectedNiches })
      onClose()
    } catch (_error) {
      console.error('Error saving influencer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    )
  }

  if (!isOpen || !influencer) return null

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
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Influencer: {formData.display_name}
          </h2>
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
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Influencer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Users size={16} className="mr-1" />
              Influencer Type
            </label>
            <select
              value={formData.influencer_type}
              onChange={(e) => setFormData({ ...formData, influencer_type: e.target.value as 'GOLD' | 'SILVER' | 'PARTNERED' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GOLD">GOLD</option>
              <option value="SILVER">SILVER</option>
              <option value="PARTNERED">PARTNERED</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Changing this will move the influencer to the corresponding tab in the roster
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the influencer..."
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin size={16} className="mr-1" />
                Country
              </label>
              <input
                type="text"
                value={formData.location_country || ''}
                onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., United Kingdom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.location_city || ''}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., London"
              />
            </div>
          </div>

          {/* Website & Average Views */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe size={16} className="mr-1" />
                Website URL
              </label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                Average Views
              </label>
              <input
                type="number"
                value={formData.average_views || ''}
                onChange={(e) => setFormData({ ...formData, average_views: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="45000"
              />
            </div>
          </div>

          {/* Niches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Tag size={16} className="mr-1" />
              Niches ({selectedNiches.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {AVAILABLE_NICHES.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    selectedNiches.includes(niche)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
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
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
} 