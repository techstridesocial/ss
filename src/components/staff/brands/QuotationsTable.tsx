/**
 * Quotations table component
 */

'use client'

import { Eye, Users, Calendar } from 'lucide-react'
import type { Quotation, SortConfig } from '@/types/brands'
import { SortableHeader } from './SortableHeader'
import { getQuotationStatusBadge } from '@/lib/utils/brandUtils'

interface QuotationsTableProps {
  quotations: Quotation[]
  sortConfig: SortConfig
  onSort: (key: string) => void
  onViewQuotation: (id: string) => void
}

export function QuotationsTable({
  quotations,
  sortConfig,
  onSort,
  onViewQuotation
}: QuotationsTableProps) {
  return (
    <>
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
        <tr>
          <SortableHeader sortKey="brand_name" sortConfig={sortConfig} onSort={onSort}>
            Brand
          </SortableHeader>
          <SortableHeader sortKey="campaign_name" sortConfig={sortConfig} onSort={onSort}>
            Campaign
          </SortableHeader>
          <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={onSort}>
            Status
          </SortableHeader>
          <SortableHeader sortKey="influencer_count" sortConfig={sortConfig} onSort={onSort}>
            Influencers
          </SortableHeader>
          <SortableHeader sortKey="budget_range" sortConfig={sortConfig} onSort={onSort}>
            Budget
          </SortableHeader>
          <SortableHeader sortKey="requested_at" sortConfig={sortConfig} onSort={onSort}>
            Requested
          </SortableHeader>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {quotations.map((quotation) => (
          <tr key={quotation.id} className="hover:bg-blue-50/30 transition-colors">
            {/* Brand Name */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-semibold text-gray-900">{quotation.brand_name}</div>
            </td>

            {/* Campaign */}
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">{quotation.campaign_name}</div>
              <div className="text-xs text-gray-500 mt-1">{quotation.description}</div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
              {getQuotationStatusBadge(quotation.status)}
            </td>

            {/* Influencers */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm font-semibold text-gray-900">
                <Users size={14} className="mr-1 text-gray-400" />
                {quotation.influencer_count}
              </div>
            </td>

            {/* Budget */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{quotation.budget_range}</div>
              {quotation.total_quote && (
                <div className="text-xs text-green-600 font-medium">Quoted: {quotation.total_quote}</div>
              )}
              {quotation.status === 'approved' && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-orange-600 font-medium">Ready for contact</span>
                </div>
              )}
            </td>

            {/* Requested */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={12} className="mr-1" />
                {new Date(quotation.requested_at).toLocaleDateString()}
              </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => onViewQuotation(quotation.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

