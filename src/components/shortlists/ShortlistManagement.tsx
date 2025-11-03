'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Save, 
  X, 
  FolderPlus,
  AlertTriangle
} from 'lucide-react'
import { useHeartedInfluencers, Shortlist } from '../../lib/context/HeartedInfluencersContext'

// Create New Shortlist Modal
export function CreateShortlistModal({ 
  isOpen, 
  onClose, 
  onCreateSuccess 
}: { 
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (shortlistId: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createShortlist } = useHeartedInfluencers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const newShortlistId = await createShortlist(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      onCreateSuccess?.(newShortlistId)
      onClose()
    } catch (error) {
      console.error('Error creating shortlist:', error)
      // Keep the form open so user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderPlus size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Shortlist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shortlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Campaign Creators"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={100}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this shortlist..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Shortlist
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Edit Shortlist Modal
export function EditShortlistModal({ 
  shortlist,
  isOpen, 
  onClose 
}: { 
  shortlist: Shortlist | null
  isOpen: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateShortlist } = useHeartedInfluencers()

  // Initialize form when shortlist changes
  React.useEffect(() => {
    if (shortlist) {
      setName(shortlist.name)
      setDescription(shortlist.description || '')
    }
  }, [shortlist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shortlist || !name.trim()) return

    setIsSubmitting(true)
    try {
      await updateShortlist(shortlist.id, {
        name: name.trim(),
        description: description.trim() || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error updating shortlist:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !shortlist) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Edit3 size={20} className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Shortlist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shortlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Campaign Creators"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                maxLength={100}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this shortlist..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Duplicate Shortlist Modal
export function DuplicateShortlistModal({ 
  shortlist,
  isOpen, 
  onClose,
  onDuplicateSuccess
}: { 
  shortlist: Shortlist | null
  isOpen: boolean
  onClose: () => void
  onDuplicateSuccess?: (newShortlistId: string) => void
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { duplicateShortlist } = useHeartedInfluencers()

  // Initialize form when shortlist changes
  React.useEffect(() => {
    if (shortlist) {
      setName(`${shortlist.name} (Copy)`)
    }
  }, [shortlist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shortlist || !name.trim()) return

    setIsSubmitting(true)
    try {
      const newShortlistId = await duplicateShortlist(shortlist.id, name.trim())
      onDuplicateSuccess?.(newShortlistId)
      onClose()
    } catch (error) {
      console.error('Error duplicating shortlist:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !shortlist) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Copy size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Duplicate Shortlist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              This will create a copy of <strong>{shortlist.name}</strong> with all {shortlist.influencers.length} influencer(s).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Shortlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Campaign Creators (Copy)"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Duplicate Shortlist
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Delete Shortlist Confirmation Modal
export function DeleteShortlistModal({ 
  shortlist,
  isOpen, 
  onClose,
  onDeleteConfirm
}: { 
  shortlist: Shortlist | null
  isOpen: boolean
  onClose: () => void
  onDeleteConfirm?: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { deleteShortlist } = useHeartedInfluencers()

  const handleDelete = async () => {
    if (!shortlist) return

    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteShortlist(shortlist.id)
      onDeleteConfirm?.()
      onClose()
    } catch (error) {
      console.error('Error deleting shortlist:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete shortlist')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !shortlist) return null

  const isDefaultShortlist = shortlist.id === 'default'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Shortlist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {isDefaultShortlist ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Cannot delete default shortlist.</strong> This is your main shortlist that cannot be removed. You can rename it or clear its contents instead.
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Are you sure you want to delete "{shortlist.name}"?</strong>
                </p>
                <p className="text-xs text-red-600">
                  This action cannot be undone. All {shortlist.influencers.length} influencer(s) in this shortlist will be permanently removed from it.
                </p>
              </div>

              {deleteError && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {deleteError}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Shortlist
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
