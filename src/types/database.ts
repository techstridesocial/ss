// =============================================
// Database Types for Stride Social Dashboard
// =============================================

export type UserRole = 
  | 'BRAND' 
  | 'INFLUENCER_SIGNED' 
  | 'INFLUENCER_PARTNERED' 
  | 'STAFF' 
  | 'ADMIN';

export type Platform = 
  | 'INSTAGRAM' 
  | 'TIKTOK' 
  | 'YOUTUBE' 
  | 'TWITCH' 
  | 'TWITTER' 
  | 'LINKEDIN';

export type InfluencerTier = 
  | 'GOLD' 
  | 'SILVER' 
  | 'PARTNERED' 
  | 'BRONZE';

export type CampaignStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type ParticipationStatus = 
  | 'INVITED' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'COMPLETED' 
  | 'PAID';

export type ContentType = 
  | 'STANDARD' 
  | 'UGC' 
  | 'SEEDING';

// =============================================
// Core User Tables
// =============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location_country: string | null;
  location_city: string | null;
  bio: string | null;
  website_url: string | null;
  is_onboarded: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

// =============================================
// Influencer Tables
// =============================================

export interface Influencer {
  id: string;
  user_id: string;
  display_name: string;
  niches: string[];
  content_type: ContentType;
  tier?: 'GOLD' | 'SILVER';
  total_followers: number;
  total_engagement_rate: number | null;
  total_avg_views: number;
  estimated_promotion_views: number;
  price_per_post: number | null;
  is_active: boolean;
  last_synced_at: Date | null;
  
  // Tier-based update tracking
  modash_last_updated: Date | null;
  modash_update_priority: number;
  auto_update_enabled: boolean;
  
  // CRM & Workflow Management
  relationship_status: string | null;
  assigned_to: string | null;
  labels: string[];
  notes: string | null;
  
  created_at: Date;
  updated_at: Date;
}

export interface InfluencerPlatform {
  id: string;
  influencer_id: string;
  platform: Platform;
  username: string;
  followers: number;
  following: number;
  engagement_rate: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  last_post_date: Date | null;
  profile_url: string | null;
  is_verified: boolean;
  is_connected: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface InfluencerContent {
  id: string;
  influencer_platform_id: string;
  post_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  posted_at: Date;
  created_at: Date;
}

export interface AudienceDemographics {
  id: string;
  influencer_platform_id: string;
  age_13_17: number;
  age_18_24: number;
  age_25_34: number;
  age_35_44: number;
  age_45_54: number;
  age_55_plus: number;
  gender_male: number;
  gender_female: number;
  gender_other: number;
  updated_at: Date;
}

export interface AudienceLocation {
  id: string;
  influencer_platform_id: string;
  country_name: string;
  country_code: string;
  percentage: number;
}

export interface AudienceLanguage {
  id: string;
  influencer_platform_id: string;
  language_name: string;
  language_code: string;
  percentage: number;
}

// =============================================
// Brand Tables
// =============================================

export interface Brand {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  website_url: string | null;
  description: string | null;
  logo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BrandContact {
  id: string;
  brand_id: string;
  name: string;
  email: string;
  role: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: Date;
}

// =============================================
// Campaign Tables
// =============================================

export interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  budget: number | null;
  start_date: Date | null;
  end_date: Date | null;
  status: CampaignStatus;
  requirements: string | null;
  deliverables: string | null;
  target_niches: string[];
  target_platforms: Platform[];
  created_at: Date;
  updated_at: Date;
}

export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: ParticipationStatus;
  offered_amount: number | null;
  negotiated_amount: number | null;
  deliverable_due_date: Date | null;
  content_submitted_at: Date | null;
  payment_released_at: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// =============================================
// Shortlist Tables
// =============================================

export interface Shortlist {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ShortlistInfluencer {
  id: string;
  shortlist_id: string;
  influencer_id: string;
  notes: string | null;
  rating: number | null;
  added_by: string;
  created_at: Date;
}

// =============================================
// Financial Tables
// =============================================

export interface Payment {
  id: string;
  influencer_id: string;
  campaign_influencer_id: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  payment_details_encrypted: string | null;
  status: string;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// =============================================
// OAuth Tables
// =============================================

export interface OauthToken {
  id: string;
  user_id: string;
  platform: Platform;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: Date | null;
  scope: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// =============================================
// Tracking Links Table
// =============================================

export interface TrackingLink {
  id: string;
  influencer_id: string;
  short_io_link_id: string;
  short_url: string;
  original_url: string;
  title: string | null;
  clicks: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

// =============================================
// Joined/Enriched Types for Display
// =============================================

export interface InfluencerWithProfile {
  // Influencer data
  id: string;
  user_id: string;
  display_name: string;
  niches: string[];
  content_type: ContentType;
  tier?: 'GOLD' | 'SILVER';
  influencer_type: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER';
  total_followers: number;
  total_engagement_rate: number;
  total_avg_views: number;
  estimated_promotion_views: number;
  price_per_post: number | null;
  is_active: boolean;
  
  // CRM & Workflow Management
  relationship_status: string | null;
  assigned_to: string | null;
  labels: string[];
  notes: string | null;
  
  // Profile data
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location_country: string | null;
  location_city: string | null;
  bio: string | null;
  website_url: string | null;
  email: string | null;
  
  // Platform data
  platforms: Platform[];
  platform_count: number;
}

export interface InfluencerDetailView extends InfluencerWithProfile {
  // Detailed platform information
  platform_details: InfluencerPlatform[];
  
  // Recent content
  recent_content: InfluencerContent[];
  
  // Demographics (aggregated or per platform)
  demographics: AudienceDemographics | null;
  audience_locations: AudienceLocation[];
  audience_languages: AudienceLanguage[];
  
  // Campaign history
  campaign_participation: CampaignInfluencer[];
}

export interface UserWithProfile extends User {
  profile: UserProfile | null;
  influencer?: Influencer | null;
  brand?: Brand | null;
}

// =============================================
// Query Filter Types
// =============================================

export interface InfluencerFilters {
  search?: string;
  niches?: string[];
  platforms?: Platform[];
  follower_min?: number;
  follower_max?: number;
  engagement_min?: number;
  engagement_max?: number;
  location_countries?: string[];
  is_active?: boolean;
  price_min?: number;
  price_max?: number;
}

export interface UserFilters {
  search?: string;
  roles?: UserRole[];
  is_onboarded?: boolean;
  location_countries?: string[];
}

// =============================================
// API Response Types
// =============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
 