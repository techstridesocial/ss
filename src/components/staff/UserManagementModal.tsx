'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, Trash2 } from 'lucide-react'
import { UserRole } from '@/types/database'

interface Invitation {
  id: string
  email: string
  role: UserRole
  status: 'pending' | 'accepted' | 'revoked'
  createdAt: string
  expiresAt: string
  acceptedAt?: string
  invitedBy?: string
  invitedAt?: string
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'invited' | 'accepted' | 'declined'>('all')
  const [activeTab, setActiveTab] = useState<'invitations' | 'users'>('invitations')

  // No mock data - using real API calls

  useEffect(() => {
    if (isOpen) {
      fetchInvitations()
      fetchUsers()
    }
  }, [isOpen])

  const fetchInvitations = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/staff/invitations')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitations')
      }
      setInvitations(data.invitations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/staff/users')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/staff/invitations/${invitationId}`, {
        method: 'POST'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation')
      }
      await fetchInvitations() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/staff/invitations/${invitationId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel invitation')
      }
      await fetchInvitations() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'BRAND':
        return 'Brand'
      case 'INFLUENCER_SIGNED':
        return 'Signed Influencer'
      case 'INFLUENCER_PARTNERED':
        return 'Partnered Influencer'
      case 'STAFF':
        return 'Team Member'
      case 'ADMIN':
        return 'Admin'
      default:
        return role
    }
  }

  const filteredInvitations = invitations.filter(invitation => {
    if (filter === 'all') return true
    return invitation.status === filter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">Manage invitations and registered users</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('invitations')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'invitations'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Invitations ({invitations.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'users'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Users ({users.length})
              </button>
            </div>
          </div>

          {/* Filters - Only show for invitations tab */}
          {activeTab === 'invitations' && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <div className="flex space-x-1">
                    {[
                      { value: 'all', label: 'All', count: filteredInvitations.length },
                      { value: 'invited', label: 'Invited', count: filteredInvitations.filter(i => i.status === 'invited').length },
                      { value: 'accepted', label: 'Accepted', count: filteredInvitations.filter(i => i.status === 'accepted').length },
                      { value: 'declined', label: 'Declined', count: filteredInvitations.filter(i => i.status === 'declined').length }
                    ].map((filterOption) => (
                      <button
                        key={filterOption.value}
                        onClick={() => setFilter(filterOption.value as any)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          filter === filterOption.value
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {filterOption.label} ({filterOption.count})
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={fetchInvitations}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : activeTab === 'invitations' ? (
              // Invitations Tab
              filteredInvitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">No invitations found</p>
                  <p className="text-sm text-gray-600">No invitations match the current filter</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <div className="divide-y divide-gray-200">
                    {filteredInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{invitation.email}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                                {invitation.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Role: {getRoleDisplayName(invitation.role)}</span>
                              <span>Sent: {formatDate(invitation.createdAt)}</span>
                              {invitation.acceptedAt && (
                                <span>Accepted: {formatDate(invitation.acceptedAt)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {invitation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResendInvitation(invitation.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Resend invitation"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Cancel invitation"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              // Users Tab
              users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">No users found</p>
                  <p className="text-sm text-gray-600">No users have registered yet</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.profile?.avatar_url ? (
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={user.profile.avatar_url}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.email.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.profile?.first_name && user.profile?.last_name
                                    ? `${user.profile.first_name} ${user.profile.last_name}`
                                    : 'No name set'
                                  }
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getRoleDisplayName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profile?.is_onboarded ? (
                                <>
                                  <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                                  <span className="text-sm text-green-600">Onboarded</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                                  <span className="text-sm text-yellow-600">Pending</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.profile?.location_country ? (
                              <div>
                                {user.profile.location_country}
                                {user.profile.location_city && `, ${user.profile.location_city}`}
                              </div>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {activeTab === 'invitations' 
                  ? `${filteredInvitations.length} invitation${filteredInvitations.length !== 1 ? 's' : ''} found`
                  : `${users.length} user${users.length !== 1 ? 's' : ''} found`
                }
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
