'use client'

import React, { useState } from 'react'
import StaffNavigation from '../../../components/nav/StaffNavigation'
import CreateCampaignModal from '../../../components/modals/CreateCampaignModal'
import { 
  Megaphone, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  Eye,
  Edit,
  Plus,
  Target,
  TrendingUp,
  Package
} from 'lucide-react'

// Mock data for campaigns
const MOCK_CAMPAIGNS = [
  {
    id: 'campaign_1',
    name: 'Summer Beauty Collection',
    brand_name: 'Luxe Beauty Co',
    brand_id: 'brand_1',
    description: 'Launch campaign for new summer makeup line targeting Gen Z',
    status: 'ACTIVE',
    budget: 25000,
    spent: 12400,
    start_date: '2024-01-10',
    end_date: '2024-02-28',
    target_niches: ['Beauty', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK'],
    assigned_influencers: 8,
    completed_deliverables: 5,
    pending_payments: 3,
    estimated_reach: 450000,
    actual_reach: 289000,
    engagement_rate: 4.2,
    created_at: '2024-01-08'
  },
  {
    id: 'campaign_2',
    name: 'Fitness Equipment Launch',
    brand_name: 'FitGear Pro',
    brand_id: 'brand_2',
    description: 'Product seeding campaign for new home gym equipment',
    status: 'ACTIVE',
    budget: 15000,
    spent: 8750,
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    target_niches: ['Fitness', 'Health'],
    target_platforms: ['YOUTUBE', 'INSTAGRAM'],
    assigned_influencers: 6,
    completed_deliverables: 3,
    pending_payments: 2,
    estimated_reach: 320000,
    actual_reach: 198000,
    engagement_rate: 5.1,
    created_at: '2024-01-13'
  },
  {
    id: 'campaign_3',
    name: 'Tech Review Series',
    brand_name: 'TechStart Solutions',
    brand_id: 'brand_3',
    description: 'Software review campaign with tech influencers',
    status: 'PAUSED',
    budget: 8000,
    spent: 3200,
    start_date: '2024-01-05',
    end_date: '2024-02-05',
    target_niches: ['Tech', 'Gaming'],
    target_platforms: ['YOUTUBE', 'TWITTER'],
    assigned_influencers: 4,
    completed_deliverables: 2,
    pending_payments: 1,
    estimated_reach: 180000,
    actual_reach: 95000,
    engagement_rate: 3.8,
    created_at: '2024-01-03'
  },
  {
    id: 'campaign_4',
    name: 'Holiday Fashion Haul',
    brand_name: 'Style Collective',
    brand_id: 'brand_4',
    description: 'Holiday season fashion collaboration campaign',
    status: 'COMPLETED',
    budget: 35000,
    spent: 34200,
    start_date: '2023-11-01',
    end_date: '2023-12-31',
    target_niches: ['Fashion', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
    assigned_influencers: 12,
    completed_deliverables: 12,
    pending_payments: 0,
    estimated_reach: 680000,
    actual_reach: 723000,
    engagement_rate: 4.7,
    created_at: '2023-10-25'
  }
]

const MOCK_INFLUENCER_ASSIGNMENTS = [
  {
    id: 'assignment_1',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'BeautyByBella',
    influencer_id: 'inf_4',
    status: 'COMPLETED',
    offered_amount: 1500,
    deliverable_due_date: '2024-01-25',
    content_submitted_at: '2024-01-24',
    payment_status: 'PAID'
  },
  {
    id: 'assignment_2',
    campaign_id: 'campaign_1',
    campaign_name: 'Summer Beauty Collection',
    influencer_name: 'Sarah Creator',
    influencer_id: 'inf_1',
    status: 'ACCEPTED',
    offered_amount: 850,
    deliverable_due_date: '2024-01-30',
    content_submitted_at: null,
    payment_status: 'PENDING'
  },
  {
    id: 'assignment_3',
    campaign_id: 'campaign_2',
    campaign_name: 'Fitness Equipment Launch',
    influencer_name: 'FitnessFiona',
    influencer_id: 'inf_3',
    status: 'INVITED',
    offered_amount: 920,
    deliverable_due_date: '2024-02-15',
    content_submitted_at: null,
    payment_status: 'PENDING'
  }
]

// Mock brands data
const MOCK_BRANDS = [
  { id: 'brand_1', company_name: 'Luxe Beauty Co' },
  { id: 'brand_2', company_name: 'FitGear Pro' },
  { id: 'brand_3', company_name: 'TechStart Solutions' },
  { id: 'brand_4', company_name: 'Style Collective' }
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
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

function CampaignsPageClient() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleCreateCampaign = async (campaignData: any) => {
    console.log('Creating campaign:', campaignData)
    // In real app, this would make an API call
    alert(`Campaign "${campaignData.name}" created successfully!`)
  }

  const handleExportReport = () => {
    alert('Exporting campaign report...')
  }

  const handleAssignInfluencer = () => {
    alert('Opening influencer assignment modal...')
  }

  const handleViewCampaign = (campaignId: string) => {
    alert(`Viewing campaign details for ${campaignId}`)
  }

  const handleEditCampaign = (campaignId: string) => {
    alert(`Editing campaign ${campaignId}`)
  }

  const handlePauseCampaign = (campaignId: string) => {
    alert(`Pausing campaign ${campaignId}`)
  }

  const handleResumeCampaign = (campaignId: string) => {
    alert(`Resuming campaign ${campaignId}`)
  }

  const handleProcessPayment = (assignmentId: string) => {
    alert(`Processing payment for assignment ${assignmentId}`)
  }

  const handleUpdateAssignment = (assignmentId: string) => {
    alert(`Updating assignment status for ${assignmentId}`)
  }

  function CampaignTable() {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        ACTIVE: { 
          icon: <Play size={10} className="mr-1" />, 
          class: 'bg-green-100 text-green-800' 
        },
        PAUSED: { 
          icon: <Pause size={10} className="mr-1" />, 
          class: 'bg-yellow-100 text-yellow-800' 
        },
        COMPLETED: { 
          icon: <CheckCircle size={10} className="mr-1" />, 
          class: 'bg-blue-100 text-blue-800' 
        },
        CANCELLED: { 
          icon: <XCircle size={10} className="mr-1" />, 
          class: 'bg-red-100 text-red-800' 
        },
        DRAFT: { 
          icon: <Clock size={10} className="mr-1" />, 
          class: 'bg-gray-100 text-gray-800' 
        }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {config.icon}
          {status}
        </span>
      )
    }

    const getProgressPercentage = (spent: number, budget: number) => {
      return Math.round((spent / budget) * 100)
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Campaigns ({MOCK_CAMPAIGNS.length})</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Campaign</span>
              </button>
              <button 
                onClick={handleExportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_CAMPAIGNS.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.description}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.target_niches.map((niche) => (
                        <span key={niche} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {niche}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.brand_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getProgressPercentage(campaign.spent, campaign.budget)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getProgressPercentage(campaign.spent, campaign.budget)}% used</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {campaign.assigned_influencers}
                    </div>
                    <div className="text-xs text-gray-500">
                      {campaign.completed_deliverables}/{campaign.assigned_influencers} completed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.actual_reach.toLocaleString()} reach</div>
                    <div className="text-sm text-gray-500">{campaign.engagement_rate}% engagement</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditCampaign(campaign.id)}
                        className="text-green-600 hover:text-green-900" 
                        title="Edit Campaign"
                      >
                        <Edit size={16} />
                      </button>
                      {campaign.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handlePauseCampaign(campaign.id)}
                          className="text-yellow-600 hover:text-yellow-900" 
                          title="Pause Campaign"
                        >
                          <Pause size={16} />
                        </button>
                      )}
                      {campaign.status === 'PAUSED' && (
                        <button 
                          onClick={() => handleResumeCampaign(campaign.id)}
                          className="text-green-600 hover:text-green-900" 
                          title="Resume Campaign"
                        >
                          <Play size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function InfluencerAssignmentTable() {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        INVITED: { class: 'bg-yellow-100 text-yellow-800' },
        ACCEPTED: { class: 'bg-blue-100 text-blue-800' },
        DECLINED: { class: 'bg-red-100 text-red-800' },
        COMPLETED: { class: 'bg-green-100 text-green-800' }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {status}
        </span>
      )
    }

    const getPaymentBadge = (status: string) => {
      const statusConfig = {
        PENDING: { class: 'bg-yellow-100 text-yellow-800' },
        PAID: { class: 'bg-green-100 text-green-800' },
        PROCESSING: { class: 'bg-blue-100 text-blue-800' }
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
          {status}
        </span>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Influencer Assignments ({MOCK_INFLUENCER_ASSIGNMENTS.length})</h2>
            <button 
              onClick={handleAssignInfluencer}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2"
            >
              <Target size={16} />
              <span>Assign Influencer</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_INFLUENCER_ASSIGNMENTS.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.influencer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.campaign_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${assignment.offered_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(assignment.deliverable_due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(assignment.payment_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCampaign(assignment.id)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleUpdateAssignment(assignment.id)}
                        className="text-green-600 hover:text-green-900" 
                        title="Update Status"
                      >
                        <Edit size={16} />
                      </button>
                      {assignment.payment_status === 'PENDING' && assignment.status === 'COMPLETED' && (
                        <button 
                          onClick={() => handleProcessPayment(assignment.id)}
                          className="text-purple-600 hover:text-purple-900" 
                          title="Process Payment"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const campaignStats = {
    activeCampaigns: MOCK_CAMPAIGNS.filter(c => c.status === 'ACTIVE').length,
    totalBudget: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.spent, 0),
    totalReach: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.actual_reach, 0),
    avgEngagement: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.engagement_rate, 0) / MOCK_CAMPAIGNS.length,
    pendingDeliverables: MOCK_CAMPAIGNS.reduce((sum, c) => sum + (c.assigned_influencers - c.completed_deliverables), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and track influencer marketing campaigns
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Campaigns"
            value={campaignStats.activeCampaigns}
            icon={<Megaphone size={24} />}
            color="blue"
          />
          <StatCard
            title="Total Budget"
            value={`$${campaignStats.totalBudget.toLocaleString()}`}
            icon={<DollarSign size={24} />}
            color="green"
            trend={`$${campaignStats.totalSpent.toLocaleString()} spent`}
          />
          <StatCard
            title="Total Reach"
            value={`${(campaignStats.totalReach / 1000000).toFixed(1)}M`}
            icon={<TrendingUp size={24} />}
            color="purple"
            trend={`${campaignStats.avgEngagement.toFixed(1)}% avg engagement`}
          />
          <StatCard
            title="Pending Deliverables"
            value={campaignStats.pendingDeliverables}
            icon={<Package size={24} />}
            color="yellow"
          />
        </div>

        {/* Campaign Table */}
        <div className="mb-8">
          <CampaignTable />
        </div>

        {/* Influencer Assignments */}
        <div className="mb-8">
          <InfluencerAssignmentTable />
        </div>
      </main>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateCampaign}
        brands={MOCK_BRANDS}
      />
    </div>
  )
}

// Server component wrapper for authentication
export default function CampaignsPage() {
  return <CampaignsPageClient />
} 