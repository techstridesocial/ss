/**
 * Brand-related TypeScript interfaces and types
 * Used by staff brands page and related components
 */

import type { StaffQuotation } from './staff'

// Brand interface for UI display
export interface Brand {
  id: string
  company_name: string
  contact_name: string
  email: string
  industry: string
  logo_url: string | null
  shortlists_count: number
  active_campaigns: number
  total_spend: number
  last_activity: string
  status: string
  assigned_staff_id: string | null
  assigned_staff_name: string | null
}

// Staff member interface
export interface StaffMember {
  id: string
  fullName: string
  email: string
}

// Quotation type - using StaffQuotation from types
export type Quotation = StaffQuotation

// Brand creation data
export interface BrandData {
  user_id: string
  company_name: string
  industry?: string
  website_url?: string
  logo_url?: string
}

// Campaign creation data
export interface CampaignData {
  name: string
  brand: string
  description: string
  status?: string
  timeline?: {
    startDate?: string
    endDate?: string
    applicationDeadline?: string
    contentDeadline?: string
  }
  budget?: {
    total?: number
    perInfluencer?: number
  }
  requirements?: {
    minFollowers?: number
    maxFollowers?: number
    minEngagement?: number
    platforms?: string[]
    demographics?: Record<string, unknown>
    contentGuidelines?: string
  }
  deliverables?: string[]
  selectedInfluencers?: Array<string | { id?: string; influencerId?: string }>
  quotation_id?: string
  confirmed_influencers?: Array<{
    contact_status?: 'pending' | 'confirmed' | 'declined'
    [key: string]: unknown
  }>
  total_budget?: string
  created_from_quotation?: boolean
  created_at?: string
}

// Quotation influencer type
export interface QuotationInfluencer {
  name: string
  platform: string
  followers: string
  engagement: string
  contact_status?: 'pending' | 'confirmed' | 'declined'
}

// API response types
export interface ApiError {
  error: string
  message?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter types
export interface BrandFilters {
  industry: string
  status: string
  spendRange: string
  campaignCount: string
  lastActivity: string
  assignment: string
}

export interface QuotationFilters {
  status: string
  budgetRange: string
  influencerCount: string
  duration: string
  brand: string
}

// Sort configuration
export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

// Filter option type
export interface FilterOption {
  value: string
  label: string
}

// Filter options structure
export interface BrandFilterOptions {
  industry: FilterOption[]
  status: FilterOption[]
  spendRange: FilterOption[]
  campaignCount: FilterOption[]
  lastActivity: FilterOption[]
  assignment: FilterOption[]
}

export interface QuotationFilterOptions {
  status: FilterOption[]
  budgetRange: FilterOption[]
  influencerCount: FilterOption[]
  duration: FilterOption[]
  brand: FilterOption[]
}

