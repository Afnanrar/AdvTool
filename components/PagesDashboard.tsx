import React, { useState } from 'react';
import { FacebookPage, FBPageFromAPI } from '../types';
import InboxIcon from './icons/InboxIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import SkeletonLoader from './SkeletonLoader';

interface PagesDashboardProps {
  pages: FacebookPage[];
  onSelectPage: (page: FacebookPage, view: 'inbox' | 'broadcast') => void;
  onConnectPage: (pageData: FBPageFromAPI) => Promise<void>;
  loading: boolean;
}

const PageStat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

const PagesDashboard: React.FC<PagesDashboardProps> = ({ pages, onSelectPage, onConnectPage, loading }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [fbPages, setFbPages] = useState<FBPageFromAPI[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiateFacebookConnection = () => {
    setError(null);
    setIsConnecting(true);

    if (!window.FB) {
        setError("Facebook SDK not loaded. Please ensure FACEBOOK_APP_ID is set and there are no ad blockers.");
        setIsConnecting(false);
        return;
    }

    window.FB.login((response: any) => {
      if (response.authResponse) {
        window.FB.api('/me/accounts?fields=id,name,access_token,picture.type(large)', (pageResponse: any) => {
          if (pageResponse && !pageResponse.error) {
            setFbPages(pageResponse.data);
          } else {
            setError(pageResponse.error?.message || 'Could not fetch your pages.');
          }
          setIsConnecting(false);
        });
      } else {
        setError('Facebook login failed. Please try again.');
        setIsConnecting(false);
      }
    }, { scope: 'pages_show_list,pages_manage_metadata,pages_messaging' });
  };
  
  const handleConnectSelectedPage = async (pageData: FBPageFromAPI) => {
      setIsConnecting(true);
      await onConnectPage(pageData);
      setFbPages(null); // Reset view after connecting
      setIsConnecting(false);
  };
  
  const renderPageSelection = () => (
    <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Select a Page to Connect</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            The following pages were found on your Facebook account. Choose one to connect to the platform.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <div className="space-y-3">
            {fbPages && fbPages.length > 0 ? (
                fbPages.map(page => {
                    const isAlreadyConnected = pages.some(p => p.page_id === page.id);
                    return (
                        <div key={page.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg">
                            <div className="flex items-center">
                                <img src={page.picture.data.url} alt={page.name} className="w-10 h-10 rounded-md mr-3" />
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{page.name}</span>
                            </div>
                            <button
                                onClick={() => handleConnectSelectedPage(page)}
                                disabled={isConnecting || isAlreadyConnected}
                                className="px-3 py-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               {isAlreadyConnected ? 'Connected' : (isConnecting ? 'Connecting...' : 'Connect')}
                            </button>
                        </div>
                    );
                })
            ) : (
                 <p className="text-center p-4 text-slate-500 dark:text-slate-400">No manageable pages found on this Facebook account.</p>
            )}
        </div>
        <button onClick={() => setFbPages(null)} className="mt-4 text-sm text-slate-500 hover:underline">Cancel</button>
    </div>
  );

  const renderDashboard = () => {
    if (loading) {
        return <SkeletonLoader type="pageCards" />;
    }
    
    return (
      <>
        {pages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(page => (
                  <div key={page.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-5 flex flex-col justify-between">
                    <div className="flex items-center mb-4">
                      <img src={page.avatarUrl} alt={page.name} className="w-12 h-12 rounded-md mr-4" />
                      <div>
                        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{page.name}</h2>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full">Connected</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-slate-200 dark:border-slate-700/50">
                        <PageStat value={Math.floor(Math.random() * 20 + 5).toString()} label="New Leads (24h)" />
                        <PageStat value={Math.floor(Math.random() * 50 + 10).toString()} label="Open Conversations" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => onSelectPage(page, 'inbox')}
                        className="flex items-center justify-center space-x-2 w-full p-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md transition-colors"
                      >
                        <InboxIcon />
                        <span>View Inbox</span>
                      </button>
                      <button
                        onClick={() => onSelectPage(page, 'broadcast')}
                        className="flex items-center justify-center space-x-2 w-full p-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md transition-colors"
                      >
                        <MegaphoneIcon />
                        <span>Broadcasts</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
                <div className="text-center max-w-lg p-8 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                     <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                     </div>
                    <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">Welcome to Messenger Inbox!</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        You're just one step away from managing all your Facebook conversations. Connect your first page to get started.
                    </p>
                    <button 
                        onClick={initiateFacebookConnection}
                        disabled={isConnecting}
                        className="mt-6 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Your First Facebook Page'}
                    </button>
                    {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
                </div>
            </div>
          )}
      </>
    );
  };

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pages</h1>
        {!fbPages && pages.length > 0 && (
             <button 
                onClick={initiateFacebookConnection}
                disabled={isConnecting}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-75 disabled:cursor-not-allowed"
            >
               {isConnecting ? 'Connecting...' : 'Connect New Page'}
            </button>
        )}
      </div>
      
      {fbPages ? renderPageSelection() : renderDashboard()}
    </main>
  );
};

export default PagesDashboard;