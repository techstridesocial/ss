/**
 * Hook for managing brand and quotation filter state
 */

import { useState, useMemo } from 'react'
import type { BrandFilters, QuotationFilters, Brand, Quotation, FilterOption, BrandFilterOptions, QuotationFilterOptions } from '@/types/brands'
import { applyBrandFilters, applyQuotationFilters } from '@/lib/filters/brandFilters'

const DEFAULT_BRAND_FILTERS: BrandFilters = {
  industry: '',
  status: '',
  spendRange: '',
  campaignCount: '',
  lastActivity: '',
  assignment: ''
}

const DEFAULT_QUOTATION_FILTERS: QuotationFilters = {
  status: '',
  budgetRange: '',
  influencerCount: '',
  duration: '',
  brand: ''
}

export function useBrandFilters(brands: Brand[], quotations: Quotation[], currentUserId: string | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilters, setBrandFilters] = useState<BrandFilters>(DEFAULT_BRAND_FILTERS)
  const [quotationFilters, setQuotationFilters] = useState<QuotationFilters>(DEFAULT_QUOTATION_FILTERS)

  // Filter options
  const brandFilterOptions: BrandFilterOptions = useMemo(() => ({
    industry: [
      { value: '', label: 'All Industries' },
      { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
      { value: 'Fitness & Sports', label: 'Fitness & Sports' },
      { value: 'Technology', label: 'Technology' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Sustainability', label: 'Sustainability' },
      { value: 'Food & Beverage', label: 'Food & Beverage' },
      { value: 'Marketing Agency', label: 'Marketing Agency' }
    ],
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    spendRange: [
      { value: '', label: 'All Spend Ranges' },
      { value: 'under-5k', label: 'Under $5,000' },
      { value: '5k-15k', label: '$5,000 - $15,000' },
      { value: '15k-25k', label: '$15,000 - $25,000' },
      { value: 'over-25k', label: 'Over $25,000' }
    ],
    campaignCount: [
      { value: '', label: 'All Campaign Counts' },
      { value: '0', label: 'No Campaigns' },
      { value: '1-2', label: '1-2 Campaigns' },
      { value: '3-5', label: '3-5 Campaigns' },
      { value: 'over-5', label: 'Over 5 Campaigns' }
    ],
    lastActivity: [
      { value: '', label: 'All Activity' },
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'older', label: 'Older' }
    ],
    assignment: [
      { value: '', label: 'All Assignments' },
      { value: 'assigned_to_me', label: 'Assigned to Me' },
      { value: 'unassigned', label: 'Unassigned' },
      { value: 'assigned_to_others', label: 'Assigned to Others' }
    ]
  }), [])

  const quotationFilterOptions: QuotationFilterOptions = useMemo(() => ({
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'pending_review', label: 'Pending Review' },
      { value: 'sent', label: 'Sent' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ],
    budgetRange: [
      { value: '', label: 'All Budget Ranges' },
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-20k', label: '$10,000 - $20,000' },
      { value: 'over-20k', label: 'Over $20,000' }
    ],
    influencerCount: [
      { value: '', label: 'All Influencer Counts' },
      { value: 'under-5', label: 'Under 5' },
      { value: '5-10', label: '5-10' },
      { value: 'over-10', label: 'Over 10' }
    ],
    duration: [
      { value: '', label: 'All Durations' },
      { value: '1-2', label: '1-2 weeks' },
      { value: '3-4', label: '3-4 weeks' },
      { value: 'over-4', label: 'Over 4 weeks' }
    ],
    brand: [
      { value: '', label: 'All Brands' },
      ...brands.map(brand => ({
        value: brand.id,
        label: brand.company_name
      }))
    ]
  }), [brands])

  // Apply filters
  const filteredBrands = useMemo(
    () => applyBrandFilters(brands, brandFilters, searchQuery, currentUserId),
    [brands, brandFilters, searchQuery, currentUserId]
  )

  const filteredQuotations = useMemo(
    () => applyQuotationFilters(quotations, quotationFilters, searchQuery),
    [quotations, quotationFilters, searchQuery]
  )

  const handleFilterChange = (key: keyof BrandFilters | keyof QuotationFilters, value: string, isQuotation: boolean) => {
    if (isQuotation) {
      setQuotationFilters(prev => ({ ...prev, [key]: value }))
    } else {
      setBrandFilters(prev => ({ ...prev, [key]: value }))
    }
  }

  const clearFilters = (isQuotation: boolean) => {
    if (isQuotation) {
      setQuotationFilters(DEFAULT_QUOTATION_FILTERS)
    } else {
      setBrandFilters(DEFAULT_BRAND_FILTERS)
    }
  }

  const activeFilterCount = useMemo(() => {
    const activeFilters = brandFilters
    return Object.values(activeFilters).filter(value => value !== '').length
  }, [brandFilters])

  return {
    searchQuery,
    setSearchQuery,
    brandFilters,
    quotationFilters,
    brandFilterOptions,
    quotationFilterOptions,
    filteredBrands,
    filteredQuotations,
    handleFilterChange,
    clearFilters,
    activeFilterCount
  }
}
