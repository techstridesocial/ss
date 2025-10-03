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
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type ParticipationStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'CONTENT_SUBMITTED' | 'COMPLETED' | 'PAID';

// Content submission types
export type ContentSubmissionStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface ContentSubmission {
  id: string;
  campaignInfluencerId: string;
  contentUrl: string;
  contentType: string;
  platform: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  title?: string;
  description?: string;
  caption?: string;
  hashtags?: string[];
  status: ContentSubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  screenshotUrl?: string;
  shortLinkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSubmissionWithDetails extends ContentSubmission {
  influencer: {
    id: string;
    displayName: string;
    profileImageUrl?: string;
  };
  campaign: {
    id: string;
    name: string;
    brand: string;
  };
  reviewer?: {
    id: string;
    name: string;
  };
  qualityScore?: number;
  performanceMetrics?: {
    engagementRate: number;
    reachEstimate: number;
    viralityScore: number;
  };
}

export interface ContentQualityMetrics {
  contentScore: number;
  engagementScore: number;
  brandAlignmentScore: number;
  technicalQualityScore: number;
  overallScore: number;
  recommendations: string[];
}

export interface ContentSubmissionStats {
  totalSubmissions: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  revisionRequestedCount: number;
  averageQualityScore: number;
  topPerformingContent: ContentSubmissionWithDetails[];
}

export interface Campaign {
  id: string;
  campaignId?: string; // Manual campaign ID for external tracking
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
  paidCount?: number;
  paymentPendingCount?: number;
  createdBy?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignInfluencer {
  id: string;
  campaignId: string;
  influencerId: string;
  status: ParticipationStatus;
  appliedAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  contentSubmittedAt?: Date;
  paidAt?: Date;
  notes?: string;
  rate?: number;
  deadline?: Date;
  productShipped?: boolean;
  contentPosted?: boolean;
  paymentReleased?: boolean;
  paymentStatus?: 'PENDING' | 'PAID';
  paymentDate?: Date;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormError[];
  success: boolean;
} 