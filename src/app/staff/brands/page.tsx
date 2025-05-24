// 'use client' removed

import React, { useState } from 'react'
import { requireStaffAccess } from '../../../lib/auth/roles'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import BulkApproveModal from '../../../components/modals/BulkApproveModal'
import { Building2, Eye, FileText, Download, Star, Clock, CheckCircle, XCircle } from 'lucide-react'

// Mock data for brands and their shortlists
const MOCK_BRANDS = [
  {
    id: 'brand_1',
    company_name: 'Luxe Beauty Co',
    contact_name: 'Sarah Johnson',
    email: 'sarah@luxebeauty.com',
    industry: 'Beauty & Cosmetics',
    logo_url: null,
    shortlists_count: 3,
    active_campaigns: 2,
    total_spend: 15420,
    last_activity: '2024-01-15',
    status: 'active'
  },
  {
    id: 'brand_2',
    company_name: 'FitGear Pro',
    contact_name: 'Mike Chen',
    email: 'mike@fitgearpro.com',
    industry: 'Fitness & Sports',
    logo_url: null,
    shortlists_count: 2,
    active_campaigns: 1,
    total_spend: 8750,
    last_activity: '2024-01-14',
    status: 'active'
  },
  {
    id: 'brand_3',
    company_name: 'TechStart Solutions',
    contact_name: 'Emily Rodriguez',
    email: 'emily@techstart.io',
    industry: 'Technology',
    logo_url: null,
    shortlists_count: 1,
    active_campaigns: 0,
    total_spend: 3200,
    last_activity: '2024-01-10',
    status: 'inactive'
  }
]

const MOCK_SHORTLISTS = [
  {
    id: 'shortlist_1',
    brand_id: 'brand_1',
    brand_name: 'Luxe Beauty Co',
    name: 'Summer Campaign Influencers',
    description: 'Beauty influencers for summer product launch',
    influencer_count: 8,
    status: 'pending_review',
    created_at: '2024-01-15',
    notes: 'Focus on micro-influencers with high engagement'
  },
  {
    id: 'shortlist_2',
    brand_id: 'brand_1',
    name: 'Holiday Season Campaign',
    brand_name: 'Luxe Beauty Co',
    description: 'Holiday makeup collection promotion',
    influencer_count: 12,
    status: 'approved',
    created_at: '2024-01-12',
    notes: 'Approved with pricing adjustments'
  },
  {
    id: 'shortlist_3',
    brand_id: 'brand_2',
    brand_name: 'FitGear Pro',
    name: 'Fitness Equipment Launch',
    description: 'New product line introduction',
    influencer_count: 6,
    status: 'pending_review',
    created_at: '2024-01-14',
    notes: 'Waiting for budget confirmation'
  }
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function BrandsPageClient() {
  const [selectedShortlists, setSelectedShortlists] = useState<string[]>([])
  const [bulkApproveModalOpen, setBulkApproveModalOpen] = useState(false)

  const handleSelectShortlist = (shortlistId: string) => {
    setSelectedShortlists(prev => 
      prev.includes(shortlistId) 
        ? prev.filter(id => id !== shortlistId)
        : [...prev, shortlistId]
    )
  }

  const handleBulkApprove = async (shortlistIds: string[], notes?: string, priceAdjustment?: number) => {
    console.log('Bulk approving shortlists:', shortlistIds, notes, priceAdjustment)
    alert(`Successfully approved ${shortlistIds.length} shortlists!`)
    setSelectedShortlists([])
  }

  const handleExportReports = () => {
    alert('Exporting brand reports...')
  }

  const handleViewBrand = (brandId: string) => {
    alert(`Viewing brand details for ${brandId}`)
  }

  const handleApproveShortlist = (shortlistId: string) => {
    alert(`Approving shortlist ${shortlistId}`)
  }

  const handleRejectShortlist = (shortlistId: string) => {
    alert(`Rejecting shortlist ${shortlistId}`)
  }

  const brandStats = {
    totalBrands: MOCK_BRANDS.length,
    activeBrands: MOCK_BRANDS.filter(b => b.status === 'active').length,
    pendingShortlists: MOCK_SHORTLISTS.filter(s => s.status === 'pending_review').length,
    totalRevenue: MOCK_BRANDS.reduce((sum, brand) => sum + brand.total_spend, 0)
  }

  function ShortlistReviewTable() {
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'pending_review':
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              <Clock size={10} className="mr-1" />
              Pending Review
            </span>
          )
        case 'approved':
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              <CheckCircle size={10} className="mr-1" />
              Approved
            </span>
          )
        case 'rejected':
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              <XCircle size={10} className="mr-1" />
              Rejected
            </span>
          )
        default:
          return null
      }
    }

    const selectedShortlistData = MOCK_SHORTLISTS.filter(s => selectedShortlists.includes(s.id))

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Shortlist Reviews ({MOCK_SHORTLISTS.length})</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setBulkApproveModalOpen(true)}
                disabled={selectedShortlists.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Bulk Approve ({selectedShortlists.length})
              </button>
              <button 
                onClick={handleExportReports}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Export Reports
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pendingIds = MOCK_SHORTLISTS.filter(s => s.status === 'pending_review').map(s => s.id)
                        setSelectedShortlists(pendingIds)
                      } else {
                        setSelectedShortlists([])
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_SHORTLISTS.map((shortlist) => (
                <tr key={shortlist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedShortlists.includes(shortlist.id)}
                      onChange={() => handleSelectShortlist(shortlist.id)}
                      disabled={shortlist.status !== 'pending_review'}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{shortlist.name}</div>
                    <div className="text-sm text-gray-500">{shortlist.description}</div>
                    {shortlist.notes && (
                      <div className="text-xs text-blue-600 mt-1">Note: {shortlist.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shortlist.brand_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Star size={14} className="mr-1 text-gray-400" />
                      {shortlist.influencer_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(shortlist.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shortlist.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="Review">
                        <Eye size={16} />
                      </button>
                      {shortlist.status === 'pending_review' && (
                        <>
                          <button 
                            onClick={() => handleApproveShortlist(shortlist.id)}
                            className="text-green-600 hover:text-green-900" 
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleRejectShortlist(shortlist.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="text-purple-600 hover:text-purple-900" title="Export">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Approve Modal */}
        <BulkApproveModal
          isOpen={bulkApproveModalOpen}
          onClose={() => setBulkApproveModalOpen(false)}
          selectedShortlists={selectedShortlistData.map(s => ({
            id: s.id,
            name: s.name,
            brand_name: s.brand_name,
            influencer_count: s.influencer_count,
            estimated_value: 1000 * s.influencer_count // Mock estimated value
          }))}
          onApprove={handleBulkApprove}
        />
      </div>
    )
  }

  function BrandTable() {
    const getStatusBadge = (status: string) => {
      if (status === 'active') {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
      }
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Brand Clients ({MOCK_BRANDS.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlists</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_BRANDS.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {brand.logo_url ? (
                          <img className="h-10 w-10 rounded-full" src={brand.logo_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Building2 size={20} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{brand.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{brand.contact_name}</div>
                    <div className="text-sm text-gray-500">{brand.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FileText size={14} className="mr-1 text-gray-400" />
                      {brand.shortlists_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Star size={14} className="mr-1 text-gray-400" />
                      {brand.active_campaigns}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${brand.total_spend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(brand.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewBrand(brand.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download size={16} />
                      </button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-2">
            Manage brand clients, review shortlists, and generate reports
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Brands"
            value={brandStats.totalBrands}
            icon={<Building2 size={24} />}
            color="blue"
          />
          <StatCard
            title="Active Brands"
            value={brandStats.activeBrands}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <StatCard
            title="Pending Reviews"
            value={brandStats.pendingShortlists}
            icon={<Clock size={24} />}
            color="yellow"
          />
          <StatCard
            title="Total Revenue"
            value={`$${brandStats.totalRevenue.toLocaleString()}`}
            icon={<Star size={24} />}
            color="purple"
          />
        </div>

        {/* Shortlist Reviews (Priority) */}
        <div className="mb-8">
          <ShortlistReviewTable />
        </div>

        {/* Brand Table */}
        <div className="mb-8">
          <BrandTable />
        </div>
      </main>
    </div>
  )
}

// Server component wrapper for authentication
export default async function StaffBrandsPage() {
  await requireStaffAccess()
  return <BrandsPageClient />
} 