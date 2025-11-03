'use client'

import React, { useState, useEffect } from 'react'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import { useUser, useClerk } from '@clerk/nextjs'
import { Building2, Mail, Phone, Globe, MapPin, Edit3, Save, X, Camera, User, Calendar, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

interface BrandProfile {
  id: string
  company_name: string
  industry: string
  website_url: string
  description: string
  logo_url: string
  company_size: string
  annual_budget_range: string
  preferred_niches: string[]
  preferred_regions: string[]
  created_at: Date
}

interface BrandContact {
  id: string
  name: string
  email: string
  role: string
  phone: string
  is_primary: boolean
}

export default function BrandProfilePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Mock brand profile data - in real app this would come from API
  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    id: 'brand_1',
    company_name: 'Luxe Beauty Co.',
    industry: 'Beauty & Cosmetics',
    website_url: 'https://luxebeauty.com',
    description: 'Premium beauty brand focused on sustainable, cruelty-free cosmetics for the modern consumer. We create products that enhance natural beauty while being environmentally conscious.',
    logo_url: '',
    company_size: 'Medium (50-200 employees)',
    annual_budget_range: '$50K - $100K',
    preferred_niches: ['Beauty', 'Skincare', 'Lifestyle', 'Sustainability'],
    preferred_regions: ['United Kingdom', 'Europe', 'North America'],
    created_at: new Date('2024-01-15')
  })

  const [brandContact, setBrandContact] = useState<BrandContact>({
    id: 'contact_1',
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Brand Manager',
    email: user?.primaryEmailAddress?.emailAddress || '',
    role: 'Marketing Manager',
    phone: '+44 20 1234 5678',
    is_primary: true
  })

  // Form state for editing
  const [editForm, setEditForm] = useState(brandProfile)
  const [editContact, setEditContact] = useState(brandContact)

  // Industry options
  const industryOptions = [
    'Beauty & Cosmetics',
    'Fashion & Apparel', 
    'Health & Fitness',
    'Food & Beverage',
    'Technology',
    'Travel & Tourism',
    'Home & Garden',
    'Automotive',
    'Entertainment',
    'Education',
    'Finance',
    'Other'
  ]

  // Company size options
  const companySizeOptions = [
    'Startup (1-10 employees)',
    'Small (11-50 employees)',
    'Medium (51-200 employees)',
    'Large (201-1000 employees)',
    'Enterprise (1000+ employees)'
  ]

  // Budget range options
  const budgetRangeOptions = [
    'Under $10K',
    '$10K - $25K',
    '$25K - $50K',
    '$50K - $100K',
    '$100K - $250K',
    '$250K - $500K',
    '$500K+'
  ]

  // Available niches
  const availableNiches = [
    'Beauty', 'Fashion', 'Lifestyle', 'Fitness', 'Health', 'Travel', 'Food',
    'Technology', 'Gaming', 'Music', 'Art', 'Photography', 'Parenting',
    'Business', 'Finance', 'Education', 'Sustainability', 'Home Decor'
  ]

  // Available regions
  const availableRegions = [
    'United Kingdom', 'Europe', 'North America', 'Asia Pacific', 'Latin America',
    'Middle East', 'Africa', 'Australia', 'Global'
  ]

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In real app, this would make API calls to update brand profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setBrandProfile(editForm)
      setBrandContact(editContact)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm(brandProfile)
    setEditContact(brandContact)
    setIsEditing(false)
  }

  const handleNicheToggle = (niche: string) => {
    setEditForm(prev => ({
      ...prev,
      preferred_niches: prev.preferred_niches.includes(niche)
        ? prev.preferred_niches.filter(n => n !== niche)
        : [...prev.preferred_niches, niche]
    }))
  }

  const handleRegionToggle = (region: string) => {
    setEditForm(prev => ({
      ...prev,
      preferred_regions: prev.preferred_regions.includes(region)
        ? prev.preferred_regions.filter(r => r !== region)
        : [...prev.preferred_regions, region]
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In real app, this would upload to Vercel Blob or similar service
      const reader = new FileReader()
      reader.onload = (e) => {
        const _result = e.target?.result as string
        setLogoPreview(result)
        setEditForm(prev => ({ ...prev, logo_url: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <BrandProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernBrandHeader />
        
        <div className="px-4 lg:px-8 py-8">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Profile</h1>
              <p className="text-gray-600 mt-1">Manage your brand information and preferences</p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg disabled:opacity-50"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Company Information */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Company Details Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                </div>

                {/* Company Logo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {/* Logo Preview */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {(logoPreview || brandProfile.logo_url) ? (
                        <img 
                          src={logoPreview || brandProfile.logo_url} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 size={24} className="text-gray-400" />
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Camera size={16} />
                          Upload Logo
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{brandProfile.company_name}</p>
                    )}
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    {isEditing ? (
                      <select
                        value={editForm.industry}
                        onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {industryOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-3">{brandProfile.industry}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.website_url}
                        onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <a 
                        href={brandProfile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 py-3 inline-flex items-center gap-2"
                      >
                        {brandProfile.website_url}
                        <Globe size={16} />
                      </a>
                    )}
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    {isEditing ? (
                      <select
                        value={editForm.company_size}
                        onChange={(e) => setEditForm({...editForm, company_size: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {companySizeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-3">{brandProfile.company_size}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your company..."
                    />
                  ) : (
                    <p className="text-gray-900 py-3 leading-relaxed">{brandProfile.description}</p>
                  )}
                </div>
              </div>

              {/* Campaign Preferences Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase size={20} className="text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Campaign Preferences</h2>
                </div>

                {/* Annual Budget Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Marketing Budget</label>
                  {isEditing ? (
                    <select
                      value={editForm.annual_budget_range}
                      onChange={(e) => setEditForm({...editForm, annual_budget_range: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {budgetRangeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{brandProfile.annual_budget_range}</p>
                  )}
                </div>

                {/* Preferred Niches */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Content Niches</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableNiches.map(niche => (
                        <label key={niche} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.preferred_niches.includes(niche)}
                            onChange={() => handleNicheToggle(niche)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{niche}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.preferred_niches.map(niche => (
                        <span key={niche} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {niche}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Regions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Target Regions</label>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableRegions.map(region => (
                        <label key={region} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.preferred_regions.includes(region)}
                            onChange={() => handleRegionToggle(region)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{region}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.preferred_regions.map(region => (
                        <span key={region} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {region}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Account Info */}
            <div className="space-y-6">
              
              {/* Primary Contact Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Primary Contact</h2>
                </div>

                <div className="space-y-4">
                  {/* Contact Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editContact.name}
                        onChange={(e) => setEditContact({...editContact, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{brandContact.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-2 py-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-900">{brandContact.email}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editContact.role}
                        onChange={(e) => setEditContact({...editContact, role: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Marketing Manager"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{brandContact.role}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editContact.phone}
                        onChange={(e) => setEditContact({...editContact, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+44 20 1234 5678"
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-3">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-900">{brandContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar size={20} className="text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">{brandProfile.created_at.toLocaleDateString('en-GB', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Brand Client
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </BrandProtectedRoute>
  )
} 