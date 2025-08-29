export interface UserProfile {
  id: string; // Internal UUID
  psid: string; // Page-Scoped ID from Facebook
  name: string;
  avatarUrl: string;
  email: string;
  joinedAt: string;
  notes?: string;
}

export interface Agent {
  id: string;
  name: string;
  avatarUrl: string;
}

export enum MessageTag {
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  POST_PURCHASE_UPDATE = 'POST_PURCHASE_UPDATE',
  CONFIRMED_EVENT_UPDATE = 'CONFIRMED_EVENT_UPDATE',
  HUMAN_AGENT = 'HUMAN_AGENT',
}

export interface FacebookPage {
  id: string; // This is the Supabase row UUID
  page_id: string; // This is the actual Facebook Page ID
  name: string;
  avatarUrl: string;
  // This token is saved to the database but should NOT be used on the client-side after initial connection.
  // We only include it for type consistency with the database row.
  page_access_token: string;
}

// Represents the structure of a page object returned from the FB Graph API
export interface FBPageFromAPI {
  id: string;
  name:string;
  access_token: string;
  picture: {
    data: {
      url: string;
    }
  }
}

export interface Conversation {
  id: string;
  pageId: string;
  userProfile: UserProfile;
  lastMessage: string;
  lastMessageAt: string; 
  unreadCount: number;
  labels: string[];
  assignedAgentId: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'in' | 'out';
  text: string;
  attachments: { type: 'image' | 'file'; url: string }[];
  tag: string | null;
  windowState: 'inside24h' | 'outside24h';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'read';
  createdAt: string;
  sentAt: string | null;
  apiResponse?: any;
}

export type HealthStatus = 'operational' | 'degraded' | 'outage';

export interface SystemHealth {
    facebookApi: HealthStatus;
    webhooks: HealthStatus;
    messageQueue: HealthStatus;
    database: HealthStatus;
}

export interface Broadcast {
  id: string;
  // Fix: Changed pageId to be nullable to accommodate broadcast templates which don't have a pageId.
  pageId: string | null;
  userId: string;
  campaignName: string;
  // Fix: Changed audience to be nullable to support templates, which may not have an audience defined.
  audience: string | null;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed' | 'In Progress' | 'Cancelled';
  progress: number;
  message: string;
  tag: string | null;
  totalRecipients: number;
  sentCount: number;
  // Fix: Changed scheduledAt to be nullable to support draft broadcasts and templates that are not yet scheduled.
  scheduledAt: string | null;
  timeSpent: string | null;
  // Fix: Made `isTemplate` mandatory to align with the non-nullable database column, improving type safety.
  isTemplate: boolean;
  analytics?: {
    openRate: number;
    clickThroughRate: number;
    errors: { code: number; message: string; count: number }[];
  }
}

export interface CannedResponse {
  id: string;
  title: string;
  text: string;
}

// Admin Dashboard Types
export type UserPlan = 'Starter' | 'Growth' | 'Scale' | 'Free';
export type UserStatus = 'Active' | 'Suspended' | 'Trial';

export interface ConnectedPageInfo {
    id: string;
    name: string;
    avatarUrl: string;
    followers: number;
}

export interface SaaSUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    plan: UserPlan;
    messageUsage: number;
    messageQuota: number;
    connectedPagesCount: number;
    connectedPages: ConnectedPageInfo[];
    status: UserStatus;
    joinedDate: string;
    lastActive: string;
    trialEndsAt?: string;
}

export interface AdminInspectionContext {
    user: SaaSUser;
    page: ConnectedPageInfo;
    viewing: 'inbox' | 'broadcast';
}

export type AppView = 'inbox' | 'broadcast' | 'settings' | 'pages' | 'admin';

// Auth Types
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

// Notification System Types
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}