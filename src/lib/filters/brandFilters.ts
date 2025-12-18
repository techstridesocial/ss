/**
 * Brand and Quotation filtering logic
 * Contains all filter helper functions and filter application logic
 */

import type { Brand, Quotation, BrandFilters, QuotationFilters } from '@/types/brands'

// Helper functions for range checking
export function checkSpendRange(spend: number, range: string): boolean {
  switch (range) {
    case 'under-5k': return spend < 5000
    case '5k-15k': return spend >= 5000 && spend <= 15000
    case '15k-25k': return spend >= 15000 && spend <= 25000
    case 'over-25k': return spend > 25000
    default: return true
  }
}

export function checkCampaignCount(count: number, range: string): boolean {
  switch (range) {
    case '0': return count === 0
    case '1-2': return count >= 1 && count <= 2
    case '3-5': return count >= 3 && count <= 5
    case 'over-5': return count > 5
    default: return true
  }
}

export function checkLastActivity(activity: string, range: string): boolean {
  const today = new Date()
  const activityDate = new Date(activity)
  const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
  
  switch (range) {
    case 'today': return diffDays === 0
    case 'week': return diffDays <= 7
    case 'month': return diffDays <= 30
    case 'older': return diffDays > 30
    default: return true
  }
}

export function checkBudgetRange(budgetRange: string, filterRange: string): boolean {
  const extractBudgetValue = (range: string): number => {
    const match = range.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
    return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
  }
  
  const budgetValue = extractBudgetValue(budgetRange)
  
  switch (filterRange) {
    case 'under-10k': return budgetValue < 10000
    case '10k-20k': return budgetValue >= 10000 && budgetValue <= 20000
    case 'over-20k': return budgetValue > 20000
    default: return true
  }
}

export function checkInfluencerCount(count: number, range: string): boolean {
  switch (range) {
    case 'under-5': return count < 5
    case '5-10': return count >= 5 && count <= 10
    case 'over-10': return count > 10
    default: return true
  }
}

export function checkDuration(duration: string, range: string): boolean {
  const weeks = parseInt(duration) || 0
  
  switch (range) {
    case '1-2': return weeks >= 1 && weeks <= 2
    case '3-4': return weeks >= 3 && weeks <= 4
    case 'over-4': return weeks > 4
    default: return true
  }
}

/**
 * Apply brand filters to a list of brands
 */
export function applyBrandFilters(
  brands: Brand[],
  filters: BrandFilters,
  searchQuery: string,
  currentUserId: string | null
): Brand[] {
  return brands.filter(brand => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = brand.company_name.toLowerCase().includes(searchLower) ||
                           brand.contact_name.toLowerCase().includes(searchLower) ||
                           brand.email.toLowerCase().includes(searchLower) ||
                           brand.industry.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Advanced filters
    const matchesIndustry = !filters.industry || brand.industry === filters.industry
    const matchesStatus = !filters.status || brand.status === filters.status
    const matchesSpendRange = !filters.spendRange || checkSpendRange(brand.total_spend, filters.spendRange)
    const matchesCampaignCount = !filters.campaignCount || checkCampaignCount(brand.active_campaigns, filters.campaignCount)
    const matchesLastActivity = !filters.lastActivity || checkLastActivity(brand.last_activity, filters.lastActivity)
    
    // Assignment filter
    const matchesAssignment = (() => {
      if (!filters.assignment) return true
      
      switch (filters.assignment) {
        case 'assigned_to_me':
          if (!currentUserId) return false
          return brand.assigned_staff_id && brand.assigned_staff_id === currentUserId
        case 'unassigned':
          return !brand.assigned_staff_id
        case 'assigned_to_others':
          if (!currentUserId) return false
          return brand.assigned_staff_id && brand.assigned_staff_id !== currentUserId
        default:
          return true
      }
    })()

    return matchesIndustry && matchesStatus && matchesSpendRange && matchesCampaignCount && matchesLastActivity && matchesAssignment
  })
}

/**
 * Apply quotation filters to a list of quotations
 */
export function applyQuotationFilters(
  quotations: Quotation[],
  filters: QuotationFilters,
  searchQuery: string
): Quotation[] {
  return quotations.filter(quotation => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = quotation.brand_name.toLowerCase().includes(searchLower) ||
                           quotation.campaign_name.toLowerCase().includes(searchLower) ||
                           quotation.description.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Advanced filters
    const matchesStatus = !filters.status || quotation.status === filters.status
    const matchesBudgetRange = !filters.budgetRange || checkBudgetRange(quotation.budget_range, filters.budgetRange)
    const matchesInfluencerCount = !filters.influencerCount || checkInfluencerCount(quotation.influencer_count, filters.influencerCount)
    const matchesDuration = !filters.duration || checkDuration(quotation.campaign_duration, filters.duration)
    const matchesBrand = !filters.brand || quotation.brand_id === filters.brand

    return matchesStatus && matchesBudgetRange && matchesInfluencerCount && matchesDuration && matchesBrand
  })
}

