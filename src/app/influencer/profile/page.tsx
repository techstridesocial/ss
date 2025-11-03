'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { useUser } from '@clerk/nextjs'
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Instagram,
  Youtube,
  Music,
  CheckCircle,
  XCircle,
  AlertCircle,
  LinkIcon,
  Users,
  TrendingUp,
  Eye
} from 'lucide-react'

interface ProfileFormData {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  bio: string
  website: string
  location: string
  niches: string[]
}

interface ConnectedAccount {
  platform: 'instagram' | 'tiktok' | 'youtube'
  username: string
  followers: number
  isConnected: boolean
  lastSync: string | null
  profileUrl: string | null
}

const AVAILABLE_NICHES = [
  'Beauty & Makeup',
  'Fashion & Style',
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Lifestyle',
  'Technology',
  'Gaming',
  'Photography',
  'Art & Design',
  'Music',
  'Education',
  'Comedy & Entertainment',
  'Business & Finance',
  'Parenting & Family'
]

export default function InfluencerProfile() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    location: '',
    niches: []
  })

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Load user data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (isLoaded && user) {
        try {
          setIsLoadingProfile(true)
          
          // Load profile data from API
          const response = await fetch('/api/influencer/profile')
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              const _profile = data.data
              
              // Update profile form data
              setProfileData({
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                displayName: profile.display_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                bio: profile.bio || '',
                website: '',
                location: profile.location_country || '',
                niches: profile.niches || []
              })
              
              // Update connected accounts
              if (profile.connected_accounts) {
                setConnectedAccounts(profile.connected_accounts.map((acc: any) => ({
                  platform: acc.platform,
                  username: acc.username || '@your_handle',
                  followers: acc.followers || 0,
                  isConnected: acc.is_connected || false,
                  lastSync: acc.last_sync,
                  profileUrl: null
                })))
              }
            }
          } else {
            console.error('Failed to load profile data')
            // Fallback to Clerk user data
            setProfileData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              displayName: user.fullName || '',
              email: user.primaryEmailAddress?.emailAddress || '',
              phone: user.phoneNumbers?.[0]?.phoneNumber || '',
              bio: '',
              website: '',
              location: '',
              niches: []
            })
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          // Fallback to Clerk user data
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            displayName: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: user.phoneNumbers?.[0]?.phoneNumber || '',
            bio: '',
            website: '',
            location: '',
            niches: []
          })
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }

    loadProfileData()
  }, [isLoaded, user])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save profile data to API
      const response = await fetch('/api/influencer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          display_name: profileData.displayName,
          bio: profileData.bio,
          phone: profileData.phone,
          location_country: profileData.location,
          location_city: '',
          niches: profileData.niches
        })
      })

      if (response.ok) {
        setIsEditing(false)
        // Reload profile data to get updated information
        const loadResponse = await fetch('/api/influencer/profile')
        if (loadResponse.ok) {
          const data = await loadResponse.json()
          if (data.success && data.data) {
            const _profile = data.data
            setProfileData(prev => ({
              ...prev,
              firstName: profile.first_name || prev.firstName,
              lastName: profile.last_name || prev.lastName,
              displayName: profile.display_name || prev.displayName,
              bio: profile.bio || prev.bio,
              phone: profile.phone || prev.phone,
              location: profile.location_country || prev.location,
              niches: profile.niches || prev.niches
            }))
          }
        }
        // Show success message
      } else {
        console.error('Failed to save profile')
        // Show error message
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      // Show error message
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original data
    if (isLoaded && user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        bio: '',
        website: '',
        location: '',
        niches: []
      })
    }
    setIsEditing(false)
  }

  const toggleNiche = (niche: string) => {
    setProfileData(prev => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }))
  }

  const getPlatformIcon = (_platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-5 w-5" />
      case 'tiktok': return <Music className="h-5 w-5" />
      case 'youtube': return <Youtube className="h-5 w-5" />
      default: return <LinkIcon className="h-5 w-5" />
    }
  }

  const getStatusIcon = (isConnected: boolean) => {
    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-gray-400" />
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <button 
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    onClick={() => document.getElementById('profile-photo-upload')?.click()}
                  >
                    <Camera className="h-3 w-3 text-white" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profile-photo-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          // Upload to Clerk user profile
                          const formData = new FormData()
                          formData.append('file', file)
                          
                          const response = await fetch('/api/upload-profile-image', {
                            method: 'POST',
                            body: formData
                          })
                          
                          if (response.ok) {
                            console.log('✅ Profile image updated in Clerk')
                            // Force a page refresh to show the new image
                            window.location.reload()
                          } else {
                            console.error('Failed to update profile image')
                          }
                        } catch (error) {
                          console.error('Error updating profile image:', error)
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.displayName || 'Your Name'}
                  </h2>
                  <p className="text-gray-600">{profileData.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-600 mr-1" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(connectedAccounts.reduce((sum, acc) => sum + acc.followers, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Followers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <LinkIcon className="h-5 w-5 text-green-600 mr-1" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {connectedAccounts.filter(acc => acc.isConnected).length}
                </p>
                <p className="text-sm text-gray-600">Connected Accounts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-1" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.firstName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.lastName || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How you want to be shown to brands"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.displayName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <p className="text-gray-900">{profileData.email}</p>
                  <p className="text-xs text-gray-500">Email cannot be changed here</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://your-website.com"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.website ? (
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profileData.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell brands about yourself and your content style..."
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Niches & Social Media */}
            <div className="space-y-8">
              {/* Content Niches */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Niches</h3>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">Select the niches that best describe your content:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_NICHES.map((niche) => (
                        <button
                          key={niche}
                          onClick={() => toggleNiche(niche)}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                            ${profileData.niches.includes(niche)
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }
                          `}
                        >
                          {niche}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {profileData.niches.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.niches.map((niche) => (
                          <span
                            key={niche}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No niches selected</p>
                    )}
                  </div>
                )}
              </div>

              {/* Connected Social Media Accounts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                
                <div className="space-y-4">
                  {connectedAccounts.map((account) => (
                    <div key={account.platform} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          account.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                          account.platform === 'tiktok' ? 'bg-gray-900 text-white' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {getPlatformIcon(account.platform)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{account.platform}</h4>
                          <p className="text-sm text-gray-600">
                            {account.isConnected ? account.username : 'Not connected'}
                          </p>
                          {account.isConnected && (
                            <p className="text-xs text-gray-500">
                              {formatNumber(account.followers)} followers
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(account.isConnected)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-blue-800">Why connect your accounts?</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Connecting your social media accounts helps brands discover you, view your authentic metrics, and makes you eligible for more campaign opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
} 