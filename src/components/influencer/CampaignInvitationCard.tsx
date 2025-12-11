'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  User
} from 'lucide-react'

interface CampaignInvitationCardProps {
  invitation: {
    id: string
    campaign_name: string
    brand_name: string
    description: string
    offered_amount: number
    deadline: string
    deliverables: string[]
    invitation_message?: string
    invited_at: string
    expires_at?: string
  }
  onAcceptAction: (invitationId: string) => void
  onDeclineAction: (invitationId: string, reason: string) => void
}

export default function CampaignInvitationCard({ 
  invitation, 
  onAcceptAction, 
  onDeclineAction 
}: CampaignInvitationCardProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      await onAcceptAction(invitation.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for declining.',
        variant: 'destructive'
      })
      return
    }
    
    setIsProcessing(true)
    try {
      await onDeclineAction(invitation.id, declineReason)
    } finally {
      setIsProcessing(false)
      setShowDeclineForm(false)
      setDeclineReason('')
    }
  }

  const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date()
  const timeUntilDeadline = new Date(invitation.deadline).getTime() - new Date().getTime()
  const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {invitation.campaign_name}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <User size={14} className="mr-1" />
                <span>{invitation.brand_name}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${invitation.offered_amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">compensation</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{invitation.description}</p>
        </div>

        {/* Campaign Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Deadline */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar size={20} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Content Deadline</div>
              <div className="text-sm text-gray-600">
                {new Date(invitation.deadline).toLocaleDateString()}
                {daysUntilDeadline > 0 && (
                  <span className="ml-2 text-xs text-orange-600">
                    ({daysUntilDeadline} days left)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Invited Date */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock size={20} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Invited</div>
              <div className="text-sm text-gray-600">
                {new Date(invitation.invited_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target size={18} className="text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-900">Deliverables Required</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {invitation.deliverables.map((deliverable, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {deliverable}
              </span>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        {invitation.invitation_message && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageCircle size={18} className="text-amber-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-900 mb-1">Message from Brand</div>
                <p className="text-sm text-amber-800">{invitation.invitation_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expire Warning */}
        {invitation.expires_at && !isExpired && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <strong>⏰ Invitation expires:</strong> {new Date(invitation.expires_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        {isExpired ? (
          <div className="text-center py-4">
            <span className="text-gray-500 font-medium">This invitation has expired</span>
          </div>
        ) : showDeclineForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you declining this invitation?
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                placeholder="Please provide a brief reason..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isProcessing || !declineReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:opacity-60 transition-colors font-medium flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <XCircle size={16} className="mr-2" />
                    Confirm Decline
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeclineForm(true)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-all duration-300 font-medium flex items-center justify-center"
            >
              <XCircle size={18} className="mr-2" />
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:opacity-60 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Accept Campaign
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
} 