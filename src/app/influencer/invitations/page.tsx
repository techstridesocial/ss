'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  FileText,
  Building2,
  AlertCircle,
  Sparkles,
  Send,
  MessageSquare
} from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'

interface Invitation {
  id: string
  campaignId: string
  campaignName: string
  brandName: string
  brandLogo: string | null
  description: string | null
  compensation: number | null
  deliverables: string[]
  contentGuidelines: string | null
  timeline: {
    startDate: string | null
    endDate: string | null
    contentDeadline: string | null
  }
  status: string
  sentAt: string
  responseDeadline: string | null
  message: string | null
}

export default function InfluencerInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([])
  const [respondedInvitations, setRespondedInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  const { toast } = useToast()

  const loadInvitations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/influencer/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
        setPendingInvitations(data.pending || [])
        setRespondedInvitations(data.responded || [])
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])

  const handleResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    setIsResponding(true)
    try {
      const res = await fetch('/api/campaign-invitations/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          response,
          message: responseMessage
        })
      })

      if (res.ok) {
        toast({
          title: response === 'accepted' ? 'Invitation Accepted!' : 'Invitation Declined',
          description: response === 'accepted' 
            ? 'You have joined the campaign. Check your campaigns page for details.'
            : 'You have declined this campaign invitation.',
        })
        setSelectedInvitation(null)
        setResponseMessage('')
        loadInvitations()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to respond')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to respond to invitation',
        variant: 'destructive'
      })
    } finally {
      setIsResponding(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(dateStr)
  }

  const InvitationCard = ({ invitation, isPending }: { invitation: Invitation; isPending: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
      className={`
        bg-white rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer
        ${isPending 
          ? 'border-purple-200 hover:border-purple-300 shadow-lg shadow-purple-500/5' 
          : 'border-gray-200 hover:border-gray-300 shadow-md'
        }
      `}
      onClick={() => isPending && setSelectedInvitation(invitation)}
    >
      {/* Status Bar */}
      <div className={`h-1 ${
        invitation.status === 'sent' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
        invitation.status === 'accepted' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
        'bg-gradient-to-r from-gray-400 to-gray-500'
      }`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Brand Logo/Avatar */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
              {invitation.brandLogo ? (
                <img 
                  src={invitation.brandLogo} 
                  alt={invitation.brandName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-7 h-7 text-purple-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                {invitation.campaignName}
              </h3>
              <p className="text-sm text-gray-500">{invitation.brandName}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`
            px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5
            ${invitation.status === 'sent' 
              ? 'bg-purple-100 text-purple-700' 
              : invitation.status === 'accepted'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {invitation.status === 'sent' && <Mail className="w-3 h-3" />}
            {invitation.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
            {invitation.status === 'declined' && <XCircle className="w-3 h-3" />}
            {invitation.status === 'sent' ? 'Pending' : 
             invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
          </span>
        </div>

        {/* Description Preview */}
        {invitation.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {invitation.description}
          </p>
        )}

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          {invitation.compensation && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                {formatCurrency(invitation.compensation)}
              </span>
            </div>
          )}
          
          {invitation.timeline.contentDeadline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Due {formatDate(invitation.timeline.contentDeadline)}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {getTimeAgo(invitation.sentAt)}
            </span>
          </div>
        </div>

        {/* Deliverables Preview */}
        {invitation.deliverables && invitation.deliverables.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {invitation.deliverables.slice(0, 3).map((deliverable: string, index: number) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
              >
                {typeof deliverable === 'string' ? deliverable : JSON.stringify(deliverable)}
              </span>
            ))}
            {invitation.deliverables.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                +{invitation.deliverables.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        {isPending && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
            <span className="text-sm font-medium text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details & Respond
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <InfluencerProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernInfluencerHeader />
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-500">Loading invitations...</p>
            </div>
          </div>
        </div>
      </InfluencerProtectedRoute>
    )
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-8 pb-12 pt-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/80">Pending</span>
              </div>
              <p className="text-4xl font-bold">{pendingInvitations.length}</p>
              <p className="text-sm text-white/70 mt-1">Awaiting your response</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Accepted</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {invitations.filter(i => i.status === 'accepted').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Campaigns joined</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-500">Declined</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {invitations.filter(i => i.status === 'declined').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Opportunities passed</p>
            </motion.div>
          </div>

          {/* Pending Invitations Section */}
          {pendingInvitations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">New Opportunities</h2>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {pendingInvitations.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pendingInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <InvitationCard invitation={invitation} isPending={true} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Past Responses Section */}
          {respondedInvitations.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Past Responses</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {respondedInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <InvitationCard invitation={invitation} isPending={false} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {invitations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No invitations yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When brands invite you to campaigns, they&apos;ll appear here. Keep creating great content!
              </p>
            </motion.div>
          )}
        </div>

        {/* Invitation Detail Modal */}
        <AnimatePresence>
          {selectedInvitation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedInvitation(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      {selectedInvitation.brandLogo ? (
                        <img 
                          src={selectedInvitation.brandLogo} 
                          alt={selectedInvitation.brandName}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedInvitation.campaignName}
                      </h2>
                      <p className="text-gray-500">{selectedInvitation.brandName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedInvitation(null)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Compensation</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatCurrency(selectedInvitation.compensation)}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Content Deadline</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700">
                        {formatDate(selectedInvitation.timeline.contentDeadline)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedInvitation.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Campaign Brief
                      </h3>
                      <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                        {selectedInvitation.description}
                      </p>
                    </div>
                  )}

                  {/* Deliverables */}
                  {selectedInvitation.deliverables && selectedInvitation.deliverables.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Deliverables
                      </h3>
                      <ul className="space-y-2">
                        {selectedInvitation.deliverables.map((deliverable: string, index: number) => (
                          <li 
                            key={index}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {typeof deliverable === 'string' ? deliverable : JSON.stringify(deliverable)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content Guidelines */}
                  {selectedInvitation.contentGuidelines && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Content Guidelines
                      </h3>
                      <p className="text-gray-600 bg-amber-50 border border-amber-100 rounded-xl p-4">
                        {selectedInvitation.contentGuidelines}
                      </p>
                    </div>
                  )}

                  {/* Response Message */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message to Brand (Optional)
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Add a message with your response..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(selectedInvitation.id, 'declined')}
                    disabled={isResponding}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(selectedInvitation.id, 'accepted')}
                    disabled={isResponding}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isResponding ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Accept Campaign
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </InfluencerProtectedRoute>
  )
}
