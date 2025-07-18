import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '../../lib/auth/roles'
import { redirect } from 'next/navigation'
import ModernStaffHeader from '../../components/nav/ModernStaffHeader'
import { Users, UserCheck, Activity, TrendingUp, Eye, UserPlus, Plus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function QuickActionCard({ title, description, href, icon, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200',
    green: 'hover:bg-green-50 border-green-200',
    purple: 'hover:bg-purple-50 border-purple-200',
    orange: 'hover:bg-orange-50 border-orange-200'
  }

  return (
    <a
      href={href}
      className={`block p-4 border-2 border-dashed rounded-xl transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  )
}

export default async function StaffDashboard() {
  try {
    // Check authentication first
    const { userId } = await auth()
    
    if (!userId) {
      redirect('/sign-in')
    }

    // Get user role
    const userRole = await getCurrentUserRole()
    console.log('Staff Dashboard - User Role:', userRole)
    
    // Allow staff and admin roles
    if (!userRole || (userRole !== 'STAFF' && userRole !== 'ADMIN')) {
      console.log('Staff Dashboard - Access denied. User role:', userRole)
      redirect('/unauthorized')
    }

    // Mock data for testing
    const mockUserStats = {
      totalUsers: 247,
      recentUsers: 12,
      onboardedUsers: 198
    }

    const mockInfluencerStats = {
      activeInfluencers: 145,
      totalInfluencers: 189,
      averageFollowers: 125000,
      averageEngagement: 3.2
    }

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        
        <main className="px-4 lg:px-8 pb-8">

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={mockUserStats.totalUsers}
              icon={<Users size={24} />}
              trend={`+${mockUserStats.recentUsers} this week`}
              color="blue"
            />
            
            <StatCard
              title="Active Influencers"
              value={mockInfluencerStats.activeInfluencers}
              icon={<UserCheck size={24} />}
              trend={`${mockInfluencerStats.totalInfluencers} total`}
              color="green"
            />
            
            <StatCard
              title="Avg. Followers"
              value={`${(mockInfluencerStats.averageFollowers / 1000).toFixed(1)}K`}
              icon={<TrendingUp size={24} />}
              trend={`${mockInfluencerStats.averageEngagement.toFixed(1)}% engagement`}
              color="purple"
            />
            
            <StatCard
              title="Onboarded"
              value={mockUserStats.onboardedUsers}
              icon={<Activity size={24} />}
              trend="Platform ready"
              color="yellow"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickActionCard
              title="Add New User"
              description="Register brand or influencer"
              href="/staff/users"
              icon={<UserPlus size={20} />}
              color="blue"
            />
            
            <QuickActionCard
              title="Create Campaign"
              description="Set up new influencer campaign"
              href="/staff/campaigns"
              icon={<Plus size={20} />}
              color="green"
            />
            
            <QuickActionCard
              title="Discover Influencers"
              description="Find new talent via Modash"
              href="/staff/discovery"
              icon={<Eye size={20} />}
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New brand registered: TechStyle Co.</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Campaign "Summer Launch" created</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">15 new influencers discovered</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Modash sync completed</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Staff Dashboard Error:', error)
    
    // Return an error page for debugging
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold text-red-600 mb-4">Staff Dashboard Error</h1>
          <p className="text-gray-700 mb-4">
            There was an error loading the staff dashboard. This might be due to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Your account doesn't have a staff role assigned</li>
            <li>Database connection issues</li>
            <li>Authentication configuration problems</li>
          </ul>
          <div className="space-y-3">
            <a 
              href="/dashboard" 
              className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </a>
            <a 
              href="/sign-in" 
              className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Sign In Again
            </a>
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }
} 