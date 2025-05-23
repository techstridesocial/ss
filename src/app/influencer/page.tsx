import React from 'react'
import { InfluencerProtectedRoute } from '../../components/auth/ProtectedRoute'

export default function InfluencerDashboard() {
  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Influencer Dashboard</h1>
          
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