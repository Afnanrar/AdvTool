



import { createClient } from '@supabase/supabase-js'
import { UserPlan, UserStatus } from '../types';

// These are populated by Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "Supabase environment variables not found. " +
        "The app is running in a disconnected state with placeholder credentials. " +
        "Please provide SUPABASE_URL and SUPABASE_ANON_KEY to connect to the database."
    );
}

// Fix: Define explicit Row types with snake_case properties to match the database schema.
// This resolves incorrect type inference (e.g., 'never') in hooks using the Supabase client.
type PageRow = { id: string, page_id: string, name: string, avatar_url: string, page_access_token: string, user_id: string };
type ConversationRow = { id: string, page_id: string, user_id: string, user_profile_id: string, last_message: string, last_message_at: string, unread_count: number, labels: string[], assigned_agent_id: string | null };
type MessageRow = { id: string, conversation_id: string, direction: 'in' | 'out', text: string, attachments: { type: 'image' | 'file'; url: string }[], tag: string | null, window_state: 'inside24h' | 'outside24h', status: 'queued' | 'sent' | 'delivered' | 'failed' | 'read', created_at: string, sent_at: string | null, api_response?: any, user_id: string };
// Fix: Changed page_id to be nullable to correctly match the database schema where templates do not have a page_id. This was the root cause of the 'never' type inference issue.
// Fix: Made 'is_template' non-optional to match database schema and resolve type conflicts.
// Fix: Made `audience` and `scheduled_at` nullable to support templates, which may not have these properties. This was the root cause of the 'never' type inference error.
type BroadcastRow = { id: string, page_id: string | null, user_id: string, campaign_name: string, audience: string | null, status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed' | 'In Progress' | 'Cancelled', progress: number, message: string, tag: string | null, total_recipients: number, sent_count: number, scheduled_at: string | null, time_spent: string | null, is_template: boolean, analytics?: { openRate: number; clickThroughRate: number; errors: { code: number; message: string; count: number }[] } };
type SaaSUserRow = { id: string, name: string, email: string, avatar_url: string, plan: UserPlan, message_usage: number, message_quota: number, status: UserStatus, joined_date: string, last_active: string, trial_ends_at?: string };
// Fix: Added the 'psid' column to match the updated database schema, which is required for messaging.
type UserProfileRow = { id: string, psid: string, name: string, avatar_url: string, email: string, joined_at: string, notes?: string };
// Fix: Define row types for the saas_users_view with snake_case properties to match the database view schema. This is the root cause of the 'never' type issue.
// Fix: Exported `ConnectedPageInfoRow` to be used for type-safe mapping in other files.
export type ConnectedPageInfoRow = { id: string; name: string; avatar_url: string; followers: number; };
export type SaaSUserViewRow = {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    plan: UserPlan;
    message_usage: number;
    message_quota: number;
    connected_pages_count: number;
    connected_pages: ConnectedPageInfoRow[];
    status: UserStatus;
    joined_date: string;
    last_active: string;
    trial_ends_at?: string;
};


interface Database {
  public: {
    Tables: {
      pages: {
        Row: PageRow;
        Insert: { name: string; avatar_url: string; user_id: string; page_id: string; page_access_token: string; };
        // FIX: Made the Update type more restrictive. The previous `Partial<Omit<PageRow, 'id'>>` was too permissive and was the likely cause of the cascading 'never' type inference failure. An update should not change immutable identifiers like user_id or page_id.
        Update: Partial<Omit<PageRow, 'id' | 'user_id' | 'page_id'>>;
      };
      conversations: {
        Row: ConversationRow;
        // Fix: Made several properties optional in the Insert type to match database defaults
        // and prevent a global type inference failure. The previous Omit<...> type was too strict.
        Insert: { 
            page_id: string;
            user_id: string;
            user_profile_id: string;
            last_message?: string;
            last_message_at?: string;
            unread_count?: number;
            labels?: string[];
            assigned_agent_id?: string | null;
        };
        // Fix: Broadened the Update type to be consistent with the Row type, omitting immutable keys.
        // This resolves the Supabase client's 'never' type inference failure.
        Update: Partial<Omit<ConversationRow, 'id' | 'page_id' | 'user_id' | 'user_profile_id'>>;
      };
      messages: {
        Row: MessageRow;
        // Fix: Added 'status' and optional 'api_response' to the Insert type to accurately reflect the data being inserted by edge functions. This mismatch was the likely cause of the cascading 'never' type inference failures.
        Insert: {
          conversation_id: string;
          text: string;
          tag: string | null;
          direction: 'in' | 'out';
          user_id: string;
          status: 'queued' | 'sent' | 'delivered' | 'failed' | 'read';
          api_response?: any;
        };
        Update: Partial<{ status: 'queued' | 'sent' | 'delivered' | 'failed' | 'read' }>;
      };
      broadcasts: {
        Row: BroadcastRow;
        Insert: {
          campaign_name: string;
          message: string;
          is_template: boolean;
          user_id: string;
          // Fix: Corrected the type of page_id to be nullable to match the Row type and the database schema, resolving the 'never' type inference issue.
          page_id?: string | null;
          // Fix: Changed `audience` and `scheduled_at` to be nullable to match the updated Row type, resolving the primary type inference error.
          audience?: string | null;
          tag?: string | null;
          scheduled_at?: string | null;
          // Fix: Added 'status' to the Insert type. Its absence was causing a global type inference failure for the Supabase client, leading to 'never' types.
          status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed' | 'In Progress' | 'Cancelled';
          // Fix: Added total_recipients to match usage in create-broadcast function.
          total_recipients?: number;
        };
        // Fix: Expanded Update type to include all fields modified by background functions.
        Update: Partial<{ status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed' | 'In Progress' | 'Cancelled', progress: number, sent_count: number, time_spent: string | null }>;
      };
      saas_users: {
        Row: SaaSUserRow;
        // Fix: Corrected the Insert type to be less strict. The previous `Omit` type was incorrect as the `id` is not auto-generated and other fields have defaults. This mismatch was the root cause of the global type inference failure.
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string;
          plan?: UserPlan;
          message_usage?: number;
          message_quota?: number;
          status?: UserStatus;
          joined_date?: string;
          last_active?: string;
          trial_ends_at?: string | null;
        };
        // Fix: Broadened the Update type to be consistent with the Row type, omitting immutable keys like id and email.
        // This resolves the Supabase client's 'never' type inference failure.
        Update: Partial<Omit<SaaSUserRow, 'id' | 'email' | 'joined_date'>>;
      },
      user_profiles: {
// Fix: Replaced `any` with a concrete type definition to ensure correct type inference for the entire Database object.
        Row: UserProfileRow; 
        // Fix: Changed Insert type from Partial<Omit<...>> to Omit<...>.
        // This correctly defines that all fields (except the generated id) are required for an insert operation,
        // which resolves a cascade of 'never' type inference errors throughout the application.
        Insert: Omit<UserProfileRow, 'id'>;
        Update: Partial<Omit<UserProfileRow, 'id'>>;
      }
    };
    Views: {
      saas_users_view: {
// Fix: Replaced the direct import of the camelCase SaaSUser type with the correctly defined snake_case SaaSUserViewRow type. This corrects the Supabase client's type inference.
        Row: SaaSUserViewRow;
      }
    },
    Functions: {
      add_message_quota: {
        Args: { user_id_in: string; credits_to_add: number };
        Returns: undefined;
      };
      change_user_plan: {
        Args: { user_id_in: string; new_plan: UserPlan };
        Returns: undefined;
      };
    };
  };
}


export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder.anon.key'
);