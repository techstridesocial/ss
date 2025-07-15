// =============================================
// Core Types for Stride Social Dashboard
// =============================================

export type UserRole = 
  | 'BRAND' 
  | 'INFLUENCER_SIGNED' 
  | 'INFLUENCER_PARTNERED' 
  | 'STAFF' 
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  isOnboarded: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  requiresRole?: UserRole[];
}

// Campaign types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  description: string;
  goals: string[];
  timeline: {
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    contentDeadline: string;
  };
  budget: {
    total: number;
    perInfluencer: number;
  };
  requirements: {
    minFollowers: number;
    maxFollowers: number;
    minEngagement: number;
    platforms: string[];
    demographics: Record<string, unknown>;
    contentGuidelines: string;
  };
  deliverables: string[];
  totalInfluencers: number;
  acceptedCount: number;
  pendingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignInfluencer {
  id: string;
  campaignId: string;
  influencerId: string;
  status: string;
  appliedAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  contentSubmittedAt?: Date;
  paidAt?: Date;
  notes?: string;
  rate?: number;
  influencer?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImageUrl?: string;
    niche: string;
    tier: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignInvitation {
  id: string;
  campaignId: string;
  influencerId: string;
  email: string;
  status: string;
  sentAt: Date;
  respondedAt?: Date;
  response?: string;
  campaignName?: string;
  influencer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    profileImageUrl?: string;
    niche: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form state types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormError[];
  success: boolean;
} 