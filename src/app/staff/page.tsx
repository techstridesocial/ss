import React from 'react'
import { StaffProtectedRoute } from '../../components/auth/ProtectedRoute'

export default function StaffDashboard() {
  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Staff Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Total users</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Influencers</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Active influencers</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Active campaigns</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Brands</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
              <p className="text-sm text-gray-600">Active brands</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded">
                👥 Manage Users
              </button>
              <button className="text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded">
                🎭 Manage Influencers
              </button>
              <button className="text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded">
                🚀 Manage Campaigns
              </button>
              <button className="text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded">
                🏢 Import from Modash
              </button>
            </div>
          </div>
        </div>
      </div>
    </StaffProtectedRoute>
  )
} 