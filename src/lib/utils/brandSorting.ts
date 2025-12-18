/**
 * Sorting utilities for brands and quotations
 */

import type { Brand, Quotation, SortConfig } from '@/types/brands'

export function sortBrandsAndQuotations(
  data: (Brand | Quotation)[],
  sortConfig: SortConfig
): (Brand | Quotation)[] {
  if (!sortConfig.key) return data

  return [...data].sort((a, b) => {
    const aKey = sortConfig.key as keyof (Brand | Quotation)
    const bKey = sortConfig.key as keyof (Brand | Quotation)
    let aValue: unknown = a[aKey]
    let bValue: unknown = b[bKey]

    // Handle different data types based on column
    switch (sortConfig.key) {
      case 'company_name':
      case 'contact_name':
      case 'email':
      case 'industry':
      case 'status':
      case 'brand_name':
      case 'campaign_name':
      case 'description':
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
        break
      case 'shortlists_count':
      case 'active_campaigns':
      case 'total_spend':
      case 'influencer_count':
        aValue = Number(aValue || 0)
        bValue = Number(bValue || 0)
        break
      case 'last_activity':
      case 'requested_at':
      case 'quoted_at':
      case 'approved_at':
        aValue = new Date(String(aValue || 0)).getTime()
        bValue = new Date(String(bValue || 0)).getTime()
        break
      case 'budget_range':
        // Extract numeric value from budget range
        const extractBudgetForSort = (range: unknown): number => {
          const rangeStr = String(range || '')
          const match = rangeStr.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
          return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
        }
        aValue = extractBudgetForSort(aValue)
        bValue = extractBudgetForSort(bValue)
        break
      case 'total_quote':
        // Extract numeric value from quote
        const extractQuoteForSort = (quote: unknown): number => {
          const quoteStr = String(quote || '')
          if (!quoteStr) return 0
          const match = quoteStr.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
          return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
        }
        aValue = extractQuoteForSort(aValue)
        bValue = extractQuoteForSort(bValue)
        break
      default:
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
    }

    // Type-safe comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
    } else {
      const aStr = String(aValue || '')
      const bStr = String(bValue || '')
      if (aStr < bStr) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aStr > bStr) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
    }
    return 0
  })
}

