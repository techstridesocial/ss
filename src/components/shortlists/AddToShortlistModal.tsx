'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Plus, 
  Check, 
  X, 
  FolderPlus,
  Users,
  Search
} from 'lucide-react'
import { useHeartedInfluencers, HeartedInfluencer, Shortlist } from '../../lib/context/HeartedInfluencersContext'

interface AddToShortlistModalProps {
  influencer: HeartedInfluencer
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddToShortlistModal({ 
  influencer, 
  isOpen, 
  onClose, 
  onSuccess 
}: AddToShortlistModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newShortlistName, setNewShortlistName] = useState('')
  const [newShortlistDescription, setNewShortlistDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [addingToShortlists, setAddingToShortlists] = useState<Set<string>>(new Set())

  const { 
    shortlists, 
    createShortlist, 
    addInfluencerToShortlist, 
    removeInfluencerFromShortlist,
    isInfluencerInShortlist 
  } = useHeartedInfluencers()

  // Filter shortlists based on search
  const filteredShortlists = shortlists.filter(shortlist =>
    shortlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shortlist.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddToShortlist = async (shortlistId: string) => {
    setAddingToShortlists(prev => new Set([...prev, shortlistId]))
    
    try {
      if (isInfluencerInShortlist(shortlistId, influencer.id)) {
        await removeInfluencerFromShortlist(shortlistId, influencer.id)
      } else {
        await addInfluencerToShortlist(shortlistId, influencer)
      }
      
      // Brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      setAddingToShortlists(prev => {
        const newSet = new Set(prev)
        newSet.delete(shortlistId)
        return newSet
      })
    }
  }

  const handleCreateNewShortlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShortlistName.trim()) return

    setIsCreating(true)
    try {
      const newShortlistId = await createShortlist(
        newShortlistName.trim(), 
        newShortlistDescription.trim() || undefined
      )
      
      // Add influencer to the new shortlist
      await addInfluencerToShortlist(newShortlistId, influencer)
      
      // Reset form
      setNewShortlistName('')
      setNewShortlistDescription('')
      setShowCreateNew(false)
      
      onSuccess?.()
      
      // Brief delay before closing
      setTimeout(() => {
        onClose()
      }, 500)
    } finally {
      setIsCreating(false)
    }
  }

  const handleQuickAdd = () => {
    // Add to default shortlist quickly
    const defaultShortlist = shortlists.find(s => s.id === 'default')
    if (defaultShortlist) {
      handleAddToShortlist('default')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 400)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart size={20} className="text-pink-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Add to Shortlist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Influencer Preview */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {influencer.profilePicture ? (
              <img 
                src={influencer.profilePicture} 
                alt={influencer.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users size={20} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{influencer.displayName}</p>
              <p className="text-sm text-gray-500">@{influencer.username}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Add Option */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={handleQuickAdd}
              className="w-full p-3 bg-pink-50 hover:bg-pink-100 border-2 border-dashed border-pink-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-pink-700 font-medium"
            >
              <Heart size={16} />
              Quick Add to Default Shortlist
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search shortlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Shortlists List */}
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {filteredShortlists.length > 0 ? (
              filteredShortlists.map((shortlist) => {
                const isInShortlist = isInfluencerInShortlist(shortlist.id, influencer.id)
                const isAdding = addingToShortlists.has(shortlist.id)
                
                return (
                  <motion.button
                    key={shortlist.id}
                    onClick={() => handleAddToShortlist(shortlist.id)}
                    disabled={isAdding}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isInShortlist
                        ? 'border-pink-200 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: isAdding ? 1 : 1.02 }}
                    whileTap={{ scale: isAdding ? 1 : 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{shortlist.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {shortlist.influencers.length}
                          </span>
                        </div>
                        {shortlist.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {shortlist.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-shrink-0">
                        {isAdding ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
                        ) : isInShortlist ? (
                          <Check size={16} className="text-pink-600" />
                        ) : (
                          <Plus size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderPlus size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No shortlists found</p>
              </div>
            )}
          </div>

          {/* Create New Shortlist Section */}
          <div className="p-4 border-t border-gray-100">
            {!showCreateNew ? (
              <button
                onClick={() => setShowCreateNew(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
              >
                <FolderPlus size={16} />
                Create New Shortlist
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleCreateNewShortlist}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Shortlist name..."
                  value={newShortlistName}
                  onChange={(e) => setNewShortlistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                  maxLength={100}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)..."
                  value={newShortlistDescription}
                  onChange={(e) => setNewShortlistDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  maxLength={500}
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateNew(false)
                      setNewShortlistName('')
                      setNewShortlistDescription('')
                    }}
                    className="flex-1 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newShortlistName.trim() || isCreating}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        Create & Add
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
