import React from 'react'
import { StaffProtectedRoute } from '../../components/auth/ProtectedRoute'
import StaffNavigation from '../../components/nav/StaffNavigation'
import { getUserStats } from '../../lib/db/queries/users'
import { getInfluencerStats } from '../../lib/db/queries/influencers'
import { Users, UserCheck, Activity, TrendingUp, Eye, UserPlus } from 'lucide-react'

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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
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
  color: 'blue' | 'green' | 'purple'
}

function QuickActionCard({ title, description, href, icon, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200',
    green: 'hover:bg-green-50 border-green-200',
    purple: 'hover:bg-purple-50 border-purple-200'
  }

  return (
    <a
      href={href}
      className={`block p-4 border-2 border-dashed rounded-lg transition-colors ${colorClasses[color]}`}
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

async function DashboardStats() {
  const [userStats, influencerStats] = await Promise.all([
    getUserStats(),
    getInfluencerStats()
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value={userStats.totalUsers}
        icon={<Users size={24} />}
        trend={`+${userStats.recentUsers} this week`}
        color="blue"
      />
      
      <StatCard
        title="Active Influencers"
        value={influencerStats.activeInfluencers}
        icon={<UserCheck size={24} />}
        trend={`${influencerStats.totalInfluencers} total`}
        color="green"
      />
      
      <StatCard
        title="Avg. Followers"
        value={`${(influencerStats.averageFollowers / 1000).toFixed(1)}K`}
        icon={<TrendingUp size={24} />}
        trend={`${influencerStats.averageEngagement.toFixed(1)}% engagement`}
        color="purple"
      />
      
      <StatCard
        title="Onboarded"
        value={userStats.onboardedUsers}
        icon={<Activity size={24} />}
        trend="Platform ready"
        color="yellow"
      />
    </div>
  )
}

export default function StaffDashboard() {
  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <StaffNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage users, influencers, and campaigns from your central hub
            </p>
          </div>

          {/* Statistics */}
          <React.Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          }>
            <DashboardStats />
          </React.Suspense>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickActionCard
              title="Manage Users"
              description="View, create, and edit user accounts"
              href="/staff/users"
              icon={<Users size={20} className="text-blue-600" />}
              color="blue"
            />
            
            <QuickActionCard
              title="Influencer Rooster"
              description="Browse and manage influencer profiles"
              href="/staff/rooster"
              icon={<Eye size={20} className="text-green-600" />}
              color="green"
            />
            
            <QuickActionCard
              title="Create Campaign"
              description="Set up new influencer campaigns"
              href="/staff/campaigns/new"
              icon={<UserPlus size={20} className="text-purple-600" />}
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New influencer registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Campaign "Summer Collection" created</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Brand shortlist reviewed</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
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
          </div>
        </main>
      </div>
    </StaffProtectedRoute>
  )
} 