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