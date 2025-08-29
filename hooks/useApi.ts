import { useState, useCallback } from 'react';
import { Conversation, Message, Agent, FacebookPage, SaaSUser, UserStatus, UserPlan, Broadcast, AuthUser, FBPageFromAPI } from '../types';
import { MOCK_AGENTS } from '../constants'; // Agents can remain constant for now
// Fix: Import the snake_case row type from the client to use in the mapping function.
// Fix: Imported `ConnectedPageInfoRow` to strongly type the `map` function.
import { supabase, SaaSUserViewRow, ConnectedPageInfoRow } from '../services/supabaseClient';

// This is a helper function for making API calls to your new backend.
// You will need to create these backend endpoints (e.g., as Supabase Edge Functions).
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Construct the full URL to the Supabase Edge Function
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is not set in environment variables.");
    }
    const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${endpoint}`;

    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;

    if (!token) {
        throw new Error("User not authenticated.");
    }

    const response = await fetch(functionUrl, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey, // Supabase Edge Functions require the anon key
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'API request failed with no JSON response.' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    return response.json();
};

const CONVERSATION_SELECT_QUERY = `
    id,
    pageId: page_id,
    userProfile: user_profiles!inner(id, psid, name, avatarUrl: avatar_url, email, joinedAt: joined_at, notes),
    lastMessage: last_message,
    lastMessageAt: last_message_at,
    unreadCount: unread_count,
    labels,
    assignedAgentId: assigned_agent_id
`;

// Fix: Add a mapping function to convert snake_case data from the saas_users_view to the camelCase SaaSUser type used in the application.
// Fix: Correctly type the `user` parameter to `SaaSUserViewRow` instead of `any`.
const mapSaaSUserViewToSaaSUser = (user: SaaSUserViewRow): SaaSUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    plan: user.plan,
    messageUsage: user.message_usage,
    messageQuota: user.message_quota,
    connectedPagesCount: user.connected_pages_count,
    // Fix: Used the imported `ConnectedPageInfoRow` type to correctly type the parameter `p`.
    connectedPages: (user.connected_pages || []).map((p: ConnectedPageInfoRow) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatar_url,
        followers: p.followers,
    })),
    status: user.status,
    joinedDate: user.joined_date,
    lastActive: user.last_active,
    trialEndsAt: user.trial_ends_at,
});


export const useApi = (userId?: string) => {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saasUsers, setSaasUsers] = useState<SaaSUser[]>([]);

  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // --- Data Fetching (These can remain direct Supabase calls for non-sensitive data) ---

  const fetchUserProfile = useCallback(async (id: string): Promise<AuthUser | null> => {
    const { data, error } = await supabase.from('saas_users').select('id, name, email, avatar_url').eq('id', id).single();
    if (error || !data) {
        console.error("Error fetching user profile:", error?.message);
        return null;
    }
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url
    };
  }, []);

  const fetchPages = useCallback(async () => {
    if (!userId) return;
    setLoadingPages(true);
    const { data, error } = await supabase.from('pages').select('id, page_id, name, avatar_url').eq('user_id', userId);
    if (error) {
        console.error("Error fetching pages:", error.message);
    } else {
        const mappedData = (data || []).map(p => ({
            id: p.id,
            page_id: p.page_id,
            name: p.name,
            avatarUrl: p.avatar_url,
            page_access_token: '' // IMPORTANT: Token is NEVER sent to client
        }));
        setPages(mappedData);
    }
    setLoadingPages(false);
  }, [userId]);

  const fetchConversations = useCallback(async (pageId: string, uid: string = userId!) => {
    if (!uid) return;
    setLoadingConversations(true);
    // Fetch the 50 most recent conversations
    const { data, error } = await supabase.from('conversations')
        .select(CONVERSATION_SELECT_QUERY)
        .eq('page_id', pageId)
        .eq('user_id', uid)
        .order('last_message_at', { ascending: false })
        .range(0, 49); // Add range for pagination
    
    if (error) console.error("Error fetching conversations:", error.message);
    else setConversations((data as any) || []);
    setLoadingConversations(false);
  }, [userId]);

  const fetchMessages = useCallback(async (conversationId: string, uid: string = userId!) => {
    if (!uid) return;
    setLoadingMessages(true);
    // Fetch the last 100 messages by ordering descending and applying a range
    const { data, error } = await supabase.from('messages').select(`
        id, conversationId: conversation_id, direction, text, attachments, tag, 
        windowState: window_state, status, createdAt: created_at, sentAt: sent_at, apiResponse: api_response
    `).eq('conversation_id', conversationId)
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .range(0, 99);
      
    if (error) console.error("Error fetching messages:", error.message);
    else {
        // Reverse the array to display in chronological order (oldest first)
        const sortedMessages = (data as any)?.reverse() || [];
        setMessages(prev => ({ ...prev, [conversationId]: sortedMessages }));
    }
    setLoadingMessages(false);
  }, [userId]);

  const fetchBroadcasts = useCallback(async (pageId: string, uid: string = userId!) => {
    if (!uid) return;
    const { data, error } = await supabase.from('broadcasts').select('*').eq('page_id', pageId).eq('user_id', uid).eq('is_template', false);
    if (error) {
        console.error("Error fetching broadcasts:", error.message);
        return;
    }
    setBroadcasts((data || []).map((b: any) => ({
        id: b.id, pageId: b.page_id, userId: b.user_id, campaignName: b.campaign_name, audience: b.audience,
        status: b.status, progress: b.progress, message: b.message, tag: b.tag, totalRecipients: b.total_recipients,
        sentCount: b.sent_count, scheduledAt: b.scheduled_at, timeSpent: b.time_spent, isTemplate: b.is_template, analytics: b.analytics,
    })));
  }, [userId]);
  
  const fetchBroadcastTemplates = useCallback(async (uid: string = userId!): Promise<Broadcast[]> => {
    if(!uid) return [];
    const { data, error } = await supabase.from('broadcasts').select('*').eq('user_id', uid).eq('is_template', true);
    if (error) {
        console.error("Error fetching templates:", error.message);
        return [];
    }
    return (data || []).map((b: any) => ({
        id: b.id, pageId: b.page_id, userId: b.user_id, campaignName: b.campaign_name, audience: b.audience,
        status: b.status, progress: b.progress, message: b.message, tag: b.tag, totalRecipients: b.total_recipients,
        sentCount: b.sent_count, scheduledAt: b.scheduled_at, timeSpent: b.time_spent, isTemplate: b.is_template, analytics: b.analytics,
    })) || [];
  }, [userId]);

  const fetchAgents = useCallback(async () => setAgents(MOCK_AGENTS), []);
  const fetchSaasUsers = useCallback(async () => {
    const { data, error } = await supabase.from('saas_users_view').select('*'); // Use the view
    if (error) console.error("Error fetching saas users:", error.message);
// Fix: Use the mapping function to correctly transform snake_case data from the view to the camelCase SaaSUser type.
    else setSaasUsers((data || []).map(mapSaaSUserViewToSaaSUser));
  }, []);

  // --- Data Mutation (These now call the backend API for security) ---

  const sendMessage = useCallback(async (conversationId: string, text: string, tag: string | null, uid: string = userId!): Promise<{ newMessage: Message, updatedConversations: Conversation[] }> => {
    const data = await apiFetch('send-message', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text, tag })
    });
    
    const { data: allConvos, error: allConvosError } = await supabase
        .from('conversations').select(CONVERSATION_SELECT_QUERY).eq('user_id', uid).eq('page_id', data.pageId).order('last_message_at', { ascending: false });

    if(allConvosError) throw allConvosError;
    
    return { newMessage: data.newMessage, updatedConversations: (allConvos as any) || [] };
  }, [userId]);
  
  const markConversationAsRead = useCallback(async (conversationId: string, uid: string = userId!): Promise<Conversation[]> => {
    await supabase.from('messages').update({ status: 'read' }).eq('conversation_id', conversationId).eq('direction', 'in').eq('user_id', uid);

    const { data: updatedConv, error: convError } = await supabase.from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)
        .select(CONVERSATION_SELECT_QUERY)
        .single();
        
    if(convError || !updatedConv) throw convError || new Error("Conversation update failed");

    const updatedList = conversations.map(c => c.id === conversationId ? (updatedConv as any) : c);
    setConversations(updatedList);
    return updatedList;
  }, [userId, conversations]);

  const connectNewPage = useCallback(async (pageData: FBPageFromAPI): Promise<FacebookPage | null> => {
    const newPage = await apiFetch('connect-page', {
        method: 'POST',
        body: JSON.stringify(pageData),
    });
    await fetchPages();
    return newPage;
  }, [fetchPages]);

  const disconnectPage = useCallback(async (pageId: string) => {
    await apiFetch('disconnect-page', {
        method: 'POST',
        body: JSON.stringify({ pageId }),
    });
    await fetchPages();
  }, [fetchPages]);
  
  const createBroadcast = useCallback(async (pageId: string, broadcastData: Omit<Broadcast, 'id' | 'pageId' | 'status' | 'progress' | 'totalRecipients' | 'sentCount' | 'timeSpent' | 'userId' | 'isTemplate' | 'analytics'>, uid: string = userId!) => {
    await apiFetch('create-broadcast', {
        method: 'POST',
        body: JSON.stringify({ pageId, ...broadcastData }),
    });
    await fetchBroadcasts(pageId, uid);
    // The App.tsx component expects an array, but we can just refetch and let state handle the update.
    const updatedBroadcasts = await supabase.from('broadcasts').select('*').eq('page_id', pageId).eq('user_id', uid).eq('is_template', false);
    if (updatedBroadcasts.error) throw updatedBroadcasts.error;
    return (updatedBroadcasts.data || []).map((b: any) => ({
        id: b.id, pageId: b.page_id, userId: b.user_id, campaignName: b.campaign_name, audience: b.audience, status: b.status, progress: b.progress, message: b.message, tag: b.tag, totalRecipients: b.total_recipients, sentCount: b.sent_count, scheduledAt: b.scheduled_at, timeSpent: b.time_spent, isTemplate: b.is_template, analytics: b.analytics,
    }));
  }, [userId, fetchBroadcasts]);

  const cancelBroadcast = useCallback(async (broadcastId: string, uid: string = userId!) => {
    const { data: broadcastToCancel, error: fetchError } = await supabase.from('broadcasts').select('page_id').eq('id', broadcastId).single();
    if (fetchError || !broadcastToCancel) throw fetchError || new Error("Broadcast not found");

    await apiFetch('cancel-broadcast', { method: 'POST', body: JSON.stringify({ broadcastId }) });
    
    await fetchBroadcasts(broadcastToCancel.page_id, uid);
     const updatedBroadcasts = await supabase.from('broadcasts').select('*').eq('page_id', broadcastToCancel.page_id).eq('user_id', uid).eq('is_template', false);
    if (updatedBroadcasts.error) throw updatedBroadcasts.error;
    return (updatedBroadcasts.data || []).map((b: any) => ({
        id: b.id, pageId: b.page_id, userId: b.user_id, campaignName: b.campaign_name, audience: b.audience, status: b.status, progress: b.progress, message: b.message, tag: b.tag, totalRecipients: b.total_recipients, sentCount: b.sent_count, scheduledAt: b.scheduled_at, timeSpent: b.time_spent, isTemplate: b.is_template, analytics: b.analytics,
    }));
  }, [userId, fetchBroadcasts]);
  
   const createBroadcastTemplate = useCallback(async (campaignName: string, message: string) => {
    if(!userId) return;
    await apiFetch('create-broadcast-template', {
      method: 'POST',
      body: JSON.stringify({ campaignName, message }),
    });
  }, [userId]);

  // --- Admin Functions (Can remain as RPC calls as they are admin-only and use SECURITY DEFINER) ---
  const updateUserCredits = useCallback(async (targetUserId: string, creditsToAdd: number): Promise<SaaSUser> => {
    const { error } = await supabase.rpc('add_message_quota', { user_id_in: targetUserId, credits_to_add: creditsToAdd });
    if (error) throw error;
    await fetchSaasUsers();
    const { data, error: userError } = await supabase.from('saas_users_view').select('*').eq('id', targetUserId).single();
    if(userError || !data) throw userError || new Error("User not found after update");
// Fix: Use the mapping function to correctly transform snake_case data from the view to the camelCase SaaSUser type.
    return mapSaaSUserViewToSaaSUser(data);
  }, [fetchSaasUsers]);

  const updateUserStatus = useCallback(async (targetUserIds: string[], status: UserStatus) => {
    // RLS on saas_users prevents users from changing their own status, but admin can.
    // However, it's better to create a SECURITY DEFINER function for this in a real scenario.
    // For now, assuming admin has a bypass rule or is using the service_role key on a backend.
    // A direct call is acceptable for this prototype's admin panel.
    const { error } = await supabase.from('saas_users').update({ status }).in('id', targetUserIds);
    if (error) throw error;
    await fetchSaasUsers();
  }, [fetchSaasUsers]);

  const updateUserPlan = useCallback(async (targetUserId: string, plan: UserPlan): Promise<SaaSUser | undefined> => {
    const { error } = await supabase.rpc('change_user_plan', { user_id_in: targetUserId, new_plan: plan });
    if (error) throw error;
    await fetchSaasUsers();
    const { data, error: userError } = await supabase.from('saas_users_view').select('*').eq('id', targetUserId).single();
    if(userError || !data) throw userError || new Error("User not found after update");
// Fix: Use the mapping function to correctly transform snake_case data from the view to the camelCase SaaSUser type.
    return mapSaaSUserViewToSaaSUser(data);
  }, [fetchSaasUsers]);


  return {
    pages,
    conversations,
    setConversations,
    messages,
    broadcasts,
    setBroadcasts,
    agents,
    saasUsers,
    loadingPages,
    loadingConversations,
    loadingMessages,
    fetchUserProfile,
    fetchPages,
    fetchConversations,
    fetchMessages,
    fetchBroadcasts,
    fetchBroadcastTemplates,
    fetchAgents,
    fetchSaasUsers,
    sendMessage,
    markConversationAsRead,
    connectNewPage,
    disconnectPage,
    createBroadcast,
    cancelBroadcast,
    createBroadcastTemplate,
    updateUserCredits,
    updateUserStatus,
    updateUserPlan,
  };
};
