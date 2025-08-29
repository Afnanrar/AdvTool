

import React, { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, FacebookPage, AppView, SaaSUser, UserStatus, UserPlan, AdminInspectionContext, ConnectedPageInfo, Broadcast, AuthUser, FBPageFromAPI } from './types';
import { useApi } from './hooks/useApi';
import Layout from './components/Layout';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import NavPanel from './components/NavPanel';
import BroadcastBuilder from './components/BroadcastBuilder';
import SettingsPage from './components/SettingsPage';
import PagesDashboard from './components/PagesDashboard';
import AdminDashboard from './components/AdminDashboard';
import InboxIcon from './components/icons/InboxIcon';
import MegaphoneIcon from './components/icons/MegaphoneIcon';
import AuthPage from './components/auth/AuthPage';
import HomePage from './components/HomePage';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Toast from './components/Toast';
import ConfirmationModal from './components/modals/ConfirmationModal';
import { supabase } from './services/supabaseClient';
// Fix: Import Session as a type, as it may be a type-only export causing resolution issues. This should fix related auth client errors.
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

// Add TypeScript declaration for the Facebook SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

// Fix: Removed React.FC to use a more modern and explicit component type definition, which resolves a complex type error on line 56.
const ViewPlaceholder = ({
    icon,
    title,
    text,
    actionText,
    onAction,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
    actionText: string;
    onAction: () => void;
}) => (
    <main className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-900">
        <div className="text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full inline-block mb-4 text-slate-500 dark:text-slate-400">
                {icon}
            </div>
            <h2 className="mt-2 text-lg font-medium">{title}</h2>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-600">{text}</p>
            <button
                onClick={onAction}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                {actionText}
            </button>
        </div>
    </main>
);

const AppContent = () => {
  const { showNotification } = useNotification();
  
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const { 
    pages,
    conversations, 
    setConversations,
    messages,
    agents,
    saasUsers,
    broadcasts,
    setBroadcasts,
    loadingPages,
    loadingConversations,
    loadingMessages, 
    fetchPages,
    fetchConversations,
    fetchMessages,
    fetchAgents,
    fetchSaasUsers,
    fetchUserProfile,
    fetchBroadcasts,
    fetchBroadcastTemplates,
    cancelBroadcast,
    createBroadcast,
    createBroadcastTemplate,
    sendMessage: apiSendMessage,
    markConversationAsRead,
    updateUserCredits,
    updateUserStatus,
    updateUserPlan,
    disconnectPage,
    connectNewPage,
  } = useApi(currentUser?.id);
  
  const [activePage, setActivePage] = useState<FacebookPage | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
    } catch (error) {
        console.warn('Could not access localStorage to get saved theme.', error);
    }
    
    // If no theme is saved or localStorage is unavailable, respect the user's system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // Default to light theme
    return 'light';
  });
  const [view, setView] = useState<AppView>('pages');
  const [pageTitle, setPageTitle] = useState('Pages');
  const [adminInspectionContext, setAdminInspectionContext] = useState<AdminInspectionContext | null>(null);
  const [authView, setAuthView] = useState<'home' | 'auth'>('home');
  const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; confirmButtonClass?: string; } | null>(null);

  // --- Facebook SDK Initialization ---
  useEffect(() => {
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    if (!facebookAppId) {
        console.warn("FACEBOOK_APP_ID environment variable not set. Facebook integration will be disabled.");
        return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId            : facebookAppId,
        cookie           : true,
        xfbml            : true,
        version          : 'v19.0'
      });
    };
  }, []);
  
  // --- Supabase Auth Management ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const setUserProfile = async () => {
        if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            if(profile){
                setCurrentUser(profile);
            } else {
                // This might happen right after signup before profile is created
                // Or if there's an issue. For now, we can create a temporary user object
                setCurrentUser({
                    id: session.user.id,
                    name: session.user.user_metadata.name || session.user.email || 'New User',
                    email: session.user.email || '',
                    avatarUrl: session.user.user_metadata.avatar_url || `https://picsum.photos/seed/${session.user.id}/100/100`,
                });
            }
        } else {
            setCurrentUser(null);
        }
    };
    setUserProfile();
  }, [session, fetchUserProfile]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    try {
        localStorage.setItem('theme', theme);
    } catch(error) {
        console.warn('Could not save theme to localStorage.', error);
    }
  }, [theme]);

  const isSuperAdmin = currentUser?.email === 'admin@admin.com';

  useEffect(() => {
    if (currentUser) {
      fetchPages();
      fetchAgents();
      if (isSuperAdmin) {
        fetchSaasUsers();
      }
    }
  }, [currentUser, fetchPages, fetchAgents, fetchSaasUsers, isSuperAdmin]);

  useEffect(() => {
    if (activePage) {
      fetchConversations(activePage.page_id);
      fetchBroadcasts(activePage.page_id);
    } else {
      setConversations([]);
      setBroadcasts([]);
    }
  }, [activePage, fetchConversations, fetchBroadcasts]);
  
  useEffect(() => {
    if(selectedConversationId) {
        fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);
  
  useEffect(() => {
    setCurrentMessages(messages[selectedConversationId!] || []);
  }, [messages, selectedConversationId]);

  useEffect(() => {
    const conversationsChannel = supabase.channel('conversations-channel')
      .on<Conversation>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `page_id=eq.${activePage?.page_id}` },
        payload => {
            if (payload.eventType === 'INSERT') {
                setConversations(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setConversations(prev => prev.map(c => c.id === payload.new.id ? payload.new : c).sort((a,b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
            }
        }
      )
      .subscribe()
      
    const messagesChannel = supabase.channel('messages-channel')
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversationId}` },
        payload => {
          setCurrentMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [activePage, selectedConversationId, setConversations]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation && conversation.unreadCount > 0) {
        markConversationAsRead(id).then(updatedConversations => setConversations(updatedConversations));
    }
  }, [conversations, markConversationAsRead]);

  const handleSendMessage = useCallback(async (conversationId: string, text: string, tag: string | null) => {
    try {
        const { newMessage, updatedConversations } = await apiSendMessage(conversationId, text, tag);
        setCurrentMessages(prev => [...prev, newMessage]);
        setConversations(updatedConversations);
        setSelectedConversationId(conversationId);
    } catch (error: any) {
        showNotification({ message: `Failed to send message: ${error.message}`, type: 'error' });
    }
  }, [apiSendMessage, showNotification]);

  const handleSetView = (newView: AppView) => {
    setView(newView);
    const titleMap = { 'pages': 'Pages', 'inbox': 'Inbox', 'broadcast': 'Broadcasts', 'settings': 'Settings', 'admin': 'Admin Dashboard' };
    setPageTitle(titleMap[newView]);
  }
  
  const handleSelectPageAndSetView = (page: FacebookPage, newView: 'inbox' | 'broadcast') => {
    setActivePage(page);
    handleSetView(newView);
  }
  
  const handleConfirmAction = (title: string, message: string, onConfirm: () => void, confirmButtonClass?: string) => {
      setConfirmationState({ isOpen: true, title, message, onConfirm, confirmButtonClass });
  };
  
  const handleImpersonate = (user: SaaSUser) => {
    if(!user.connectedPages || user.connectedPages.length === 0){
        showNotification({ message: `${user.name} has no connected pages to view.`, type: 'info' });
        return;
    }
    const pageToView = user.connectedPages[0];
    setAdminInspectionContext({
        user,
        page: pageToView,
        viewing: 'inbox',
    });
    const impersonatedPage: FacebookPage = {
        id: pageToView.id, // This is the page's UUID in our DB
        page_id: 'impersonated_page_id_placeholder', // The actual FB page_id is needed for API calls.
        name: pageToView.name,
        avatarUrl: pageToView.avatarUrl,
        page_access_token: '',
    };
    setActivePage(impersonatedPage);
    // You'll need to adjust API calls to pass the impersonated user's ID
    fetchConversations(impersonatedPage.id, user.id);
    fetchBroadcasts(impersonatedPage.id, user.id);
    setView('inbox');
    setPageTitle('Inbox (Inspecting)');
  };

  const handleViewHistory = (user: SaaSUser, page: ConnectedPageInfo) => {
      setAdminInspectionContext({ user, page, viewing: 'broadcast' });
      const pageToView: FacebookPage = { id: page.id, page_id: 'impersonated_page_id', name: page.name, avatarUrl: page.avatarUrl, page_access_token: '' };
      setActivePage(pageToView);
      fetchBroadcasts(pageToView.id, user.id);
      setView('broadcast');
      setPageTitle('Broadcasts (Inspecting)');
  };

  const handleExitAdminInspection = () => {
    setAdminInspectionContext(null);
    setActivePage(null);
    setView('admin');
    setPageTitle('Admin Dashboard');
  };
  
  const handleDisconnect = async (pageId: string, pageName: string) => {
      handleConfirmAction(
        'Disconnect Page',
        `Are you sure you want to disconnect the page "${pageName}"? This will remove all associated conversations and data.`,
        async () => {
            try {
                await disconnectPage(pageId);
                showNotification({ message: `Successfully disconnected ${pageName}.`, type: 'success' });
                if (activePage?.id === pageId) {
                    setActivePage(null);
                    setView('pages');
                }
            } catch (error: any) {
                showNotification({ message: `Failed to disconnect page: ${error.message}`, type: 'error' });
            } finally {
                setConfirmationState(null);
            }
        },
        'bg-red-600 hover:bg-red-700'
    );
  }
  
  const handleConnectPage = async (pageData: FBPageFromAPI) => {
      try {
          const newPage = await connectNewPage(pageData);
          if (newPage) {
              showNotification({ message: `Successfully connected page: ${newPage.name}`, type: 'success' });
          }
      } catch (error: any) {
           showNotification({ message: `Failed to connect page: ${error.message}`, type: 'error' });
      }
  };

  // --- Render Logic ---
  if (!currentUser) {
    const handleAuthAction = async (action: () => Promise<any>) => {
        try {
            await action();
        } catch(e: any) {
            showNotification({ message: e.error_description || e.message, type: 'error' });
            throw e;
        }
    };
    return authView === 'home' ? (
        <HomePage 
            onNavigateToAuth={() => setAuthView('auth')}
            theme={theme}
            onToggleTheme={toggleTheme}
        />
    ) : (
        <AuthPage 
            onLogin={(email, pass) => handleAuthAction(() => supabase.auth.signInWithPassword({ email, password: pass }))}
            onSignup={(name, email, pass) => handleAuthAction(() => supabase.auth.signUp({ email, password: pass, options: { data: { name }} }))}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigateHome={() => setAuthView('home')}
        />
    );
  }

  if (adminInspectionContext) {
      const { user, page } = adminInspectionContext;
      const impersonatedPage: FacebookPage = {
          id: page.id,
          page_id: 'impersonated_page_id', // Placeholder
          name: page.name,
          avatarUrl: page.avatarUrl,
          page_access_token: '',
      };
       return (
        <Layout 
            theme={theme} 
            onToggleTheme={toggleTheme} 
            pageTitle={pageTitle}
            adminInspectionContext={adminInspectionContext}
            onExitAdminInspection={handleExitAdminInspection}
            currentUser={currentUser}
            onLogout={() => supabase.auth.signOut()}
        >
            <NavPanel currentView={view} onSetView={handleSetView} isSuperAdmin={isSuperAdmin} />
            {view === 'inbox' && (
                <>
                    <ConversationList conversations={conversations} selectedConversationId={selectedConversationId} onSelectConversation={handleSelectConversation} loading={loadingConversations} />
                    <ChatWindow conversation={conversations.find(c => c.id === selectedConversationId)} messages={currentMessages} agents={agents} onSendMessage={(convId, text, tag) => { /* Impersonated send disabled */ }} loading={loadingMessages} />
                </>
            )}
             {view === 'broadcast' && <BroadcastBuilder 
                page={impersonatedPage} 
                broadcasts={broadcasts} 
                onCancelBroadcast={(id) => { /* Impersonated cancel disabled */ }}
                onCreateBroadcast={async () => { /* Impersonated create disabled */ }}
                onCreateTemplate={async () => { /* Impersonated create disabled */ }}
                onFetchTemplates={() => fetchBroadcastTemplates(user.id)}
             />}
             {/* Other views are hidden in inspection mode */}
        </Layout>
    );
  }

  if (!activePage) {
      return (
        <Layout 
            theme={theme} 
            onToggleTheme={toggleTheme} 
            pageTitle={pageTitle}
            adminInspectionContext={null}
            onExitAdminInspection={() => {}}
            currentUser={currentUser}
            onLogout={() => supabase.auth.signOut()}
        >
            <NavPanel currentView={view} onSetView={handleSetView} isSuperAdmin={isSuperAdmin} />
            {view === 'pages' && <PagesDashboard pages={pages} onSelectPage={handleSelectPageAndSetView} onConnectPage={handleConnectPage} loading={loadingPages} />}
            {view === 'settings' && <SettingsPage pages={pages} onDisconnectPage={handleDisconnect} />}
            {view === 'admin' && isSuperAdmin && <AdminDashboard 
                users={saasUsers} 
                onUpdateCredits={updateUserCredits}
                onUpdateStatus={async (ids, status) => { await updateUserStatus(ids, status); await fetchSaasUsers(); }}
                onUpdatePlan={updateUserPlan}
                onImpersonate={handleImpersonate}
                onViewHistory={handleViewHistory}
                onViewPeoples={() => showNotification({ message: "Viewing a user's audience is not yet implemented.", type: 'info' })}
                onConfirmAction={handleConfirmAction}
            />}
            {view === 'inbox' && <ViewPlaceholder icon={<InboxIcon/>} title="Select a page" text="Please choose a page from the Pages dashboard to view its inbox." actionText="Go to Pages" onAction={() => setView('pages')} />}
            {view === 'broadcast' && <ViewPlaceholder icon={<MegaphoneIcon/>} title="Select a page" text="Please choose a page from the Pages dashboard to manage its broadcasts." actionText="Go to Pages" onAction={() => setView('pages')} />}

             {confirmationState?.isOpen && (
                <ConfirmationModal 
                    title={confirmationState.title}
                    message={confirmationState.message}
                    onConfirm={confirmationState.onConfirm}
                    onCancel={() => setConfirmationState(null)}
                    confirmButtonClass={confirmationState.confirmButtonClass}
                />
            )}
        </Layout>
    );
  }

  return (
    <Layout 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        pageTitle={pageTitle}
        adminInspectionContext={adminInspectionContext}
        onExitAdminInspection={handleExitAdminInspection}
        currentUser={currentUser}
        onLogout={() => supabase.auth.signOut()}
    >
      <NavPanel currentView={view} onSetView={handleSetView} isSuperAdmin={isSuperAdmin} />
      {view === 'inbox' && (
        <>
            <ConversationList conversations={conversations} selectedConversationId={selectedConversationId} onSelectConversation={handleSelectConversation} loading={loadingConversations} />
            <ChatWindow conversation={conversations.find(c => c.id === selectedConversationId)} messages={currentMessages} agents={agents} onSendMessage={handleSendMessage} loading={loadingMessages} />
        </>
      )}
      {view === 'broadcast' && <BroadcastBuilder 
            page={activePage} 
            broadcasts={broadcasts} 
            onCancelBroadcast={async (id) => {
                await cancelBroadcast(id);
                showNotification({message: 'Broadcast cancelled.', type: 'info'});
            }}
            onCreateBroadcast={(data) => createBroadcast(activePage.id, data).then(() => {
                showNotification({message: 'Broadcast successfully scheduled!', type: 'success'});
            })}
            onCreateTemplate={async (name, msg) => {
                await createBroadcastTemplate(name, msg);
                showNotification({ message: `Template "${name}" saved successfully.`, type: 'success' });
            }}
            onFetchTemplates={() => fetchBroadcastTemplates()}
        />}
      {view === 'settings' && <SettingsPage pages={pages} onDisconnectPage={handleDisconnect} />}
      {view === 'pages' && <PagesDashboard pages={pages} onSelectPage={handleSelectPageAndSetView} onConnectPage={handleConnectPage} loading={loadingPages} />}
      {view === 'admin' && isSuperAdmin && <AdminDashboard 
            users={saasUsers} 
            onUpdateCredits={updateUserCredits}
            onUpdateStatus={async (ids, status) => { await updateUserStatus(ids, status); await fetchSaasUsers(); }}
            onUpdatePlan={updateUserPlan}
            onImpersonate={handleImpersonate}
            onViewHistory={handleViewHistory}
            onViewPeoples={() => showNotification({ message: "Viewing a user's audience is not yet implemented.", type: 'info' })}
            onConfirmAction={handleConfirmAction}
        />}

       {confirmationState?.isOpen && (
            <ConfirmationModal 
                title={confirmationState.title}
                message={confirmationState.message}
                onConfirm={confirmationState.onConfirm}
                onCancel={() => setConfirmationState(null)}
                confirmButtonClass={confirmationState.confirmButtonClass}
            />
        )}
    </Layout>
  );
};

// Fix: Export the 'App' component so it can be imported and used in index.tsx.
export const App = () => (
  <NotificationProvider>
    <AppContent />
    <Toast />
  </NotificationProvider>
);