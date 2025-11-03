'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ModernStaffHeader from '../../../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../../../components/auth/ProtectedRoute'
import InfluencerDetailPanel from '../../../../../components/influencer/InfluencerDetailPanel'
import DashboardInfoPanel from '../../../../../components/influencer/DashboardInfoPanel'
import { InfluencerDetailView } from '../../../../../types/database'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function InfluencerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const influencerId = params.id as string
  
  const [influencer, setInfluencer] = useState<InfluencerDetailView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')

  // Load influencer data
  useEffect(() => {
    const loadInfluencer = async () => {
      if (!influencerId) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/roster/${influencerId}`)
        
        if (response.ok) {
          const _result = await response.json()
          if (result.success) {
            setInfluencer(result.data)
          } else {
            setError(result.error || 'Failed to load influencer')
          }
        } else if (response.status === 404) {
          setError('Influencer not found')
        } else {
          setError('Failed to load influencer')
        }
      } catch (_error) {
        console.error('Error loading influencer:', error)
        setError('Failed to load influencer')
      } finally {
        setIsLoading(false)
      }
    }

    loadInfluencer()
  }, [influencerId])

  const handleBack = () => {
    router.push('/staff/roster')
  }

  if (isLoading) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <ModernStaffHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading influencer...</p>
            </div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }

  if (error || !influencer) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <ModernStaffHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Influencer Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The requested influencer could not be found.'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Roster
              </button>
            </div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <ModernStaffHeader />
        
        {/* Header with back button */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Roster
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{influencer.display_name}</h1>
                <p className="text-sm text-gray-500">Influencer Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics Panel */}
            <div className="lg:col-span-2">
              <InfluencerDetailPanel
                isOpen={true}
                onClose={() => {}} // No close functionality on this page
                influencer={(() => {
                  // Restore COMPLETE Modash analytics from notes field
                  const savedAnalytics = influencer.notes ? 
                    JSON.parse(influencer.notes || '{}') : {}
                  
                  // If we have complete Modash data, use it directly
                  if (savedAnalytics.modash_data && Object.keys(savedAnalytics.modash_data).length > 10) {
                    return {
                      ...savedAnalytics.modash_data,
                      id: influencer.id,
                      displayName: influencer.display_name,
                      name: influencer.display_name,
                      handle: (influencer.display_name || 'creator').toLowerCase().replace(/\s+/g, ''),
                      picture: influencer.avatar_url || savedAnalytics.modash_data.picture,
                      profilePicture: influencer.avatar_url || savedAnalytics.modash_data.profilePicture,
                      isRosterInfluencer: true,
                      rosterId: influencer.id,
                      hasPreservedAnalytics: true,
                      platforms: savedAnalytics.modash_data.platforms || {
                        [selectedPlatform]: {
                          followers: influencer.total_followers,
                          engagement_rate: influencer.total_engagement_rate,
                        }
                      }
                    }
                  }
                  
                  // Fallback for incomplete data
                  return {
                    id: influencer.id,
                    displayName: influencer.display_name,
                    name: influencer.display_name,
                    handle: (influencer.display_name || 'creator').toLowerCase().replace(/\s+/g, ''),
                    picture: influencer.avatar_url,
                    profilePicture: influencer.avatar_url,
                    isRosterInfluencer: true,
                    rosterId: influencer.id,
                    hasPreservedAnalytics: false
                  }
                })()}
                selectedPlatform={selectedPlatform as 'instagram' | 'tiktok' | 'youtube'}
                onPlatformChange={setSelectedPlatform}
              />
            </div>

            {/* Dashboard Info Panel */}
            <div className="lg:col-span-1">
              <DashboardInfoPanel
                influencer={influencer}
                isOpen={true}
                onClose={() => {}} // No close functionality on this page
              />
            </div>
          </div>
        </div>
      </div>
    </StaffProtectedRoute>
  )
}
