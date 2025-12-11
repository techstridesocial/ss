'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Search, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateSubmissionListModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Brand {
  id: string
  company_name: string
}

interface Influencer {
  id: string
  display_name: string
  total_followers?: number
  total_engagement_rate?: number
}

export default function CreateSubmissionListModal({
  isOpen,
  onClose
}: CreateSubmissionListModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInfluencers, setSelectedInfluencers] = useState<Map<string, { influencer: Influencer; price?: number }>>(new Map())
  const [currency, setCurrency] = useState<string>('GBP')
  
  const [formData, setFormData] = useState({
    name: '',
    brand_id: '',
    notes: ''
  })

  const CURRENCIES = [
    { value: 'GBP', label: '£ GBP', symbol: '£' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'CAD', label: 'C$ CAD', symbol: 'C$' },
    { value: 'AUD', label: 'A$ AUD', symbol: 'A$' }
  ]

  useEffect(() => {
    if (isOpen) {
      loadBrands()
      loadInfluencers()
    }
  }, [isOpen])

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const result = await response.json()
        setBrands(result.data || [])
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const loadInfluencers = async () => {
    try {
      const response = await fetch('/api/influencers/light')
      if (response.ok) {
        const result = await response.json()
        setInfluencers(result.data || [])
      }
    } catch (error) {
      console.error('Error loading influencers:', error)
    }
  }

  const handleAddInfluencer = (influencer: Influencer) => {
    if (!selectedInfluencers.has(influencer.id)) {
      setSelectedInfluencers(prev => new Map(prev).set(influencer.id, { influencer }))
    }
  }

  const handleRemoveInfluencer = (influencerId: string) => {
    setSelectedInfluencers(prev => {
      const newMap = new Map(prev)
      newMap.delete(influencerId)
      return newMap
    })
  }

  const handlePriceChange = (influencerId: string, price: number) => {
    setSelectedInfluencers(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(influencerId)
      if (existing) {
        newMap.set(influencerId, { ...existing, price })
      }
      return newMap
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('List name is required')
      return
    }

    if (!formData.brand_id) {
      setError('Please select a brand')
      return
    }

    if (selectedInfluencers.size === 0) {
      setError('Please add at least one influencer')
      return
    }

    setIsSubmitting(true)

    try {
      const influencerIds = Array.from(selectedInfluencers.keys())
      const initialPricing: Record<string, number> = {}
      
      selectedInfluencers.forEach((value, id) => {
        if (value.price) {
          initialPricing[id] = value.price
        }
      })

      const response = await fetch('/api/staff/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          brand_id: formData.brand_id,
          notes: formData.notes,
          influencer_ids: influencerIds,
          initial_pricing: initialPricing,
          currency: currency
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create submission list')
      }

      // Reset form
      setFormData({ name: '', brand_id: '', notes: '' })
      setSelectedInfluencers(new Map())
      setSearchQuery('')
      setCurrency('GBP')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create submission list')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredInfluencers = influencers.filter(inf =>
    inf.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Create Submission List</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* List Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Campaign Creators"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this submission list..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Selected Influencers */}
              {selectedInfluencers.size > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Influencers ({selectedInfluencers.size})
                    </label>
                    {/* Currency Picker */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 font-medium">Currency:</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                      >
                        {CURRENCIES.map(curr => (
                          <option key={curr.value} value={curr.value}>
                            {curr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from(selectedInfluencers.entries()).map(([id, { influencer, price }]) => {
                      const currencySymbol = CURRENCIES.find(c => c.value === currency)?.symbol || '$'
                      return (
                        <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{influencer.display_name}</p>
                            {influencer.total_followers && (
                              <p className="text-sm text-gray-600">
                                {influencer.total_followers.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm font-medium">
                                {currencySymbol}
                              </span>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={price || ''}
                                onChange={(e) => handlePriceChange(id, parseFloat(e.target.value) || 0)}
                                className="w-28 pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveInfluencer(id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add Influencers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Influencers from Roster
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search influencers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredInfluencers
                    .filter(inf => !selectedInfluencers.has(inf.id))
                    .map(influencer => (
                      <button
                        key={influencer.id}
                        type="button"
                        onClick={() => handleAddInfluencer(influencer)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{influencer.display_name}</p>
                          {influencer.total_followers && (
                            <p className="text-sm text-gray-600">
                              {influencer.total_followers.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                        <Plus className="w-5 h-5 text-cyan-600" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

