/**
 * Brands table component
 */

'use client'

import { Eye, Download, Mail, FileText, Star, DollarSign } from 'lucide-react'
import type { Brand, StaffMember, SortConfig } from '@/types/brands'
import { SortableHeader } from './SortableHeader'
import { formatNumber, getBrandStatusBadge } from '@/lib/utils/brandUtils'

interface BrandsTableProps {
  brands: Brand[]
  staffMembers: StaffMember[]
  sortConfig: SortConfig
  onSort: (key: string) => void
  onViewBrand: (id: string) => void
  onAssignBrand: (brandId: string, staffId: string) => void
  assignmentLoading: string | null
}

export function BrandsTable({
  brands,
  staffMembers,
  sortConfig,
  onSort,
  onViewBrand,
  onAssignBrand,
  assignmentLoading
}: BrandsTableProps) {
  return (
    <>
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
        <tr>
          <SortableHeader sortKey="company_name" sortConfig={sortConfig} onSort={onSort}>
            Brand
          </SortableHeader>
          <SortableHeader sortKey="contact_name" sortConfig={sortConfig} onSort={onSort}>
            Contact
          </SortableHeader>
          <SortableHeader sortKey="industry" sortConfig={sortConfig} onSort={onSort}>
            Industry
          </SortableHeader>
          <SortableHeader sortKey="shortlists_count" sortConfig={sortConfig} onSort={onSort}>
            Shortlists
          </SortableHeader>
          <SortableHeader sortKey="active_campaigns" sortConfig={sortConfig} onSort={onSort}>
            Campaigns
          </SortableHeader>
          <SortableHeader sortKey="total_spend" sortConfig={sortConfig} onSort={onSort}>
            Total Spend
          </SortableHeader>
          <SortableHeader sortKey="assigned_staff_name" sortConfig={sortConfig} onSort={onSort}>
            Assigned To
          </SortableHeader>
          <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={onSort}>
            Status
          </SortableHeader>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {brands.map((brand) => (
          <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors">
            {/* Brand Info */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-semibold text-gray-900">{brand.company_name}</div>
            </td>

            {/* Contact */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{brand.contact_name}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <Mail size={12} className="mr-1" />
                {brand.email}
              </div>
            </td>

            {/* Industry */}
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                {brand.industry}
              </span>
            </td>

            {/* Shortlists */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm font-semibold text-gray-900">
                <FileText size={14} className="mr-1 text-gray-400" />
                {brand.shortlists_count}
              </div>
            </td>

            {/* Campaigns */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm font-semibold text-gray-900">
                <Star size={14} className="mr-1 text-gray-400" />
                {brand.active_campaigns}
              </div>
            </td>

            {/* Total Spend */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm font-semibold text-gray-900">
                <DollarSign size={14} className="mr-1 text-gray-400" />
                {formatNumber(brand.total_spend)}
              </div>
            </td>

            {/* Assigned To */}
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={brand.assigned_staff_id || ''}
                onChange={(e) => onAssignBrand(brand.id, e.target.value)}
                disabled={assignmentLoading === brand.id}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
              {assignmentLoading === brand.id && (
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-600 mr-1"></div>
                  Updating...
                </div>
              )}
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
              {getBrandStatusBadge(brand.status)}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onViewBrand(brand.id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View Brand"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Download Report"
                >
                  <Download size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}
