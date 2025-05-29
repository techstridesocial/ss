'use client'

import React, { useState } from 'react'
import { InfluencerProtectedRoute } from '../../components/auth/ProtectedRoute'
import CampaignInvitationCard from '../../components/influencer/CampaignInvitationCard'
import { Bell, CheckCircle, Clock, XCircle } from 'lucide-react'

// Mock campaign invitations for the influencer
const MOCK_INVITATIONS = [
  {
    id: 'inv_1',
    campaign_name: 'Summer Beauty Collection',
    brand_name: 'Luxe Beauty Co',
    description: 'Join our summer campaign featuring natural beauty products perfect for the season. Create authentic content showcasing your daily routine with our new makeup line.',
    offered_amount: 1500,
    deadline: '2024-02-15T23:59:59Z',
    deliverables: ['Instagram Posts', 'Stories', 'Reels'],
    invitation_message: 'Hi! We love your authentic beauty content and would be thrilled to collaborate with you on our summer campaign.',
    invited_at: '2024-01-10T10:00:00Z',
    expires_at: '2024-01-25T23:59:59Z'
  },
  {
    id: 'inv_2',
    campaign_name: 'Fitness Equipment Launch',
    brand_name: 'FitGear Pro',
    description: 'Help us launch our new home gym equipment line by creating engaging workout content that showcases the versatility and quality of our products.',
    offered_amount: 920,
    deadline: '2024-03-01T23:59:59Z',
    deliverables: ['Instagram Posts', 'YouTube Review', 'Stories'],
    invited_at: '2024-01-15T09:00:00Z',
    expires_at: '2024-01-30T23:59:59Z'
  }
]

export default function InfluencerDashboard() {
  const [invitations, setInvitations] = useState(MOCK_INVITATIONS)

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch('/api/campaign-invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          response: 'accept'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      // Remove accepted invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      alert('Campaign invitation accepted successfully! 🎉')

    } catch (error) {
      console.error('Error accepting invitation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to accept invitation: ${errorMessage}`)
    }
  }

  const handleDeclineInvitation = async (invitationId: string, reason: string) => {
    try {
      const response = await fetch('/api/campaign-invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          response: 'decline',
          declineReason: reason
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to decline invitation')
      }

      // Remove declined invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      alert('Campaign invitation declined.')

    } catch (error) {
      console.error('Error declining invitation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to decline invitation: ${errorMessage}`)
    }
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Influencer Dashboard</h1>
          
          {/* Campaign Invitations Section */}
          {invitations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <Bell size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Campaign Invitations</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                  {invitations.length} pending
                </span>
              </div>
              
              <div className="space-y-6">
                {invitations.map((invitation) => (
                  <CampaignInvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Active campaigns</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Platforms</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Connected accounts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">£0</p>
              <p className="text-sm text-gray-600">Total earned</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="block w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded">
                📱 Connect Social Accounts
              </button>
              <button className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded">
                📊 View Performance
              </button>
              <button className="block w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded">
                💰 Payment Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
} 