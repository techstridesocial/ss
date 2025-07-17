import React from 'react'
import { BrandProtectedRoute } from '../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../components/nav/ModernBrandHeader'
import BrandOnboardingCheck from '../../components/auth/BrandOnboardingCheck'

export default function BrandDashboard() {
  return (
    <BrandProtectedRoute>
      <BrandOnboardingCheck>
        <div className="min-h-screen bg-gray-50">
        <ModernBrandHeader />
        
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Influencers</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Total discovered</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Shortlists</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Saved selections</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Active campaigns</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded">
                🔍 Discover Influencers
              </button>
              <button className="block w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded">
                📝 Create Shortlist
              </button>
              <button className="block w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded">
                🚀 Launch Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
      </BrandOnboardingCheck>
    </BrandProtectedRoute>
  )
} 