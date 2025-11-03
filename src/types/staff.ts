/**
 * Staff Dashboard TypeScript Interfaces
 * Centralized type definitions for staff-facing components
 */

import { Platform, UserRole } from './database'

// ============================================================================
// INFLUENCER TYPES
// ============================================================================

export interface StaffInfluencer {
  id: string
  display_name: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  niches: string[]
  platforms: Platform[]
  platform_count: number
  total_followers: number
  total_engagement_rate: number
  total_avg_views: number
  location_city?: string | null
  location_country?: string | null
  influencer_type?: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER' | null
  content_type?: 'STANDARD' | 'UGC' | 'SEEDING' | null
  tier?: 'GOLD' | 'SILVER' | null
  is_active: boolean
  assigned_to?: string | null
  labels?: string[]
  notes?: string | null
  website_url?: string | null
  agency_name?: string | null
  created_at?: string
  updated_at?: string
}

export interface PlatformDetail {
  id: string
  influencer_id: string
  platform: Platform
  username: string
  followers: number
  following?: number
  engagement_rate: number
  avg_views?: number
  avg_likes?: number
  avg_comments?: number
  last_post_date?: Date | string
  profile_url?: string
  is_verified: boolean
  is_connected: boolean
  created_at: Date | string
  updated_at: Date | string
}

// ============================================================================
// BRAND TYPES
// ============================================================================

export interface StaffBrand {
  id: string
  company_name: string
  contact_name: string
  email: string
  industry: string
  logo_url?: string | null
  shortlists_count: number
  active_campaigns: number
  total_spend: number
  last_activity: string
  status: 'active' | 'inactive'
  assigned_staff_id?: string | null
  assigned_staff_name?: string | null
  created_at?: string
  updated_at?: string
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export interface StaffCampaign {
  id: string
  name: string
  campaignId?: string
  description: string
  brand: string
  brand_id?: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  budget: {
    total: number
    spent?: number
    remaining?: number
  }
  timeline: {
    startDate: string
    endDate: string
  }
  requirements: {
    platforms: string[]
    contentTypes?: string[]
    deliverables?: string[]
  }
  totalInfluencers: number
  assignedStaff?: {
    id: string
    name: string
    email: string
  } | null
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

// ============================================================================
// QUOTATION TYPES
// ============================================================================

export interface StaffQuotation {
  id: string
  brand_id: string
  brand_name: string
  campaign_name: string
  description: string
  influencer_count: number
  status: 'pending_review' | 'sent' | 'approved' | 'rejected'
  requested_at: string
  quoted_at?: string
  approved_at?: string
  total_quote?: string
  budget_range: string
  campaign_duration: string
  deliverables: string[]
  target_demographics: string
  notes?: string
  influencers: Array<{
    name: string
    platform: string
    followers: string
    engagement: string
    contact_status?: 'pending' | 'confirmed' | 'declined'
  }>
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface StaffInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  creator_name: string
  brand_name: string
  content_description: string
  content_link: string
  agreed_price: number
  currency: string
  vat_amount: number
  total_amount: number
  status: 'DRAFT' | 'SENT' | 'VERIFIED' | 'DELAYED' | 'PAID' | 'VOIDED'
  staff_notes?: string
  pdf_path?: string
  created_at: string
  influencer_name: string
  campaign_name: string
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface RosterFilters {
  niche: string
  platform: string
  followerRange: string
  engagementRange: string
  location: string
  influencerType: string
  contentType: string
  tier: string
  status: string
}

export interface BrandFilters {
  industry: string
  status: string
  spendRange: string
  campaignCount: string
  lastActivity: string
  assignment: string
}

export interface CampaignFilters {
  status: string
  brand: string
  platform: string
  niche: string
  budgetRange: string
  startDate: string
  endDate: string
  timelineStatus: string
  performance: string
  assignment: string
}

export interface QuotationFilters {
  status: string
  budgetRange: string
  influencerCount: string
  duration: string
  brand: string
}

// ============================================================================
// PAGINATION & SORTING TYPES
// ============================================================================

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
}

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface FilterOption {
  value: string
  label: string
}

export interface FilterOptions {
  [key: string]: FilterOption[]
}

// ============================================================================
// STAFF MEMBER TYPES
// ============================================================================

export interface StaffMember {
  id: string
  fullName: string
  name?: string
  email: string
  role: UserRole
  avatar_url?: string | null
  created_at?: string
}

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================

export interface AssignmentData {
  influencer_type?: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
  content_type?: 'STANDARD' | 'UGC' | 'SEEDING'
  assigned_to?: string | null
  tier?: 'GOLD' | 'SILVER' | null
  agency_name?: string | null
}

// ============================================================================
// ANALYTICS & STATS TYPES
// ============================================================================

export interface InvoiceSummary {
  total_invoices: number
  sent_count: number
  verified_count: number
  paid_count: number
  delayed_count: number
  total_paid: number
  pending_amount: number
}

export interface ContentStats {
  totalSubmissions: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  revisionRequestedCount: number
  averageQualityScore: number
}

