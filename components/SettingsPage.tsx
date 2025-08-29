import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FacebookPage } from '../types';

interface SettingsPageProps {
    pages: FacebookPage[];
    onDisconnectPage: (pageId: string, pageName: string) => void;
}

const PlanCard: React.FC<{name: string, price: number, messages: string, features: string[], onChoosePlan: (plan: string) => void, current?: boolean}> = 
({ name, price, messages, features, onChoosePlan, current=false}) => (
    <div className={`p-6 rounded-lg border ${current ? 'border-blue-500 bg-blue-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'}`}>
        <h3 className={`font-bold text-lg ${current ? 'text-blue-500' : ''}`}>{name}</h3>
        <p className="text-2xl font-bold mt-2">${price}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span></p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{messages} messages</p>
        <ul className="mt-4 space-y-2 text-sm">
            {features.map(f => <li key={f} className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {f}</li>)}
        </ul>
        <button 
            onClick={() => onChoosePlan(name)}
            disabled={current} 
            className="w-full mt-6 py-2 px-4 rounded-md font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600"
        >
            {current ? 'Current Plan' : 'Choose Plan'}
        </button>
    </div>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ pages, onDisconnectPage }) => {
    const { showNotification } = useNotification();

    const usage = 345678;
    const quota = 800000;
    const usagePercent = (usage / quota) * 100;

    const handleAction = (message: string) => {
        showNotification({ message, type: 'info' });
    };

    return (
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Settings</h1>

            <div className="space-y-8 max-w-5xl mx-auto w-full">
                {/* Current Plan & Usage */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-lg font-semibold mb-4">My Plan & Usage</h2>
                    <div className="flex items-center justify-between">
                        <p>You are currently on the <span className="font-bold text-blue-500">Growth</span> plan.</p>
                         <button 
                            onClick={() => handleAction('Redirecting to external billing portal...')}
                            className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">
                            Manage Subscription
                        </button>
                    </div>
                     <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
                            <span>Messages Sent</span>
                            <span>{usage.toLocaleString()} / {quota.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${usagePercent}%`}}></div>
                        </div>
                    </div>
                </div>
                
                {/* Available Plans */}
                 <div>
                    <h2 className="text-lg font-semibold mb-4 text-center">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <PlanCard name="Starter" price={25} messages="800,000" features={['2 Facebook Pages', 'Inbox Management', 'Basic Broadcasts']} onChoosePlan={(plan) => handleAction(`Switching to ${plan} plan.`)} />
                       <PlanCard name="Growth" price={50} messages="2,000,000" features={['5 Facebook Pages', 'Advanced Broadcasts', 'User Labeling']} current onChoosePlan={(plan) => handleAction(`Switching to ${plan} plan.`)} />
                       <PlanCard name="Scale" price={250} messages="7,000,000" features={['Unlimited Pages', 'Massive Labeling', 'Priority Support']} onChoosePlan={(plan) => handleAction(`Switching to ${plan} plan.`)} />
                    </div>
                </div>

                {/* Connected Pages */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Connected Pages</h2>
                        <button 
                            onClick={() => handleAction('Opening Facebook authentication to connect a new page...')}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md">
                           Connect New Page
                        </button>
                    </div>
                    <ul className="space-y-3">
                        {pages.map(page => (
                            <li key={page.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <span className="font-medium">{page.name}</span>
                                <button 
                                    onClick={() => onDisconnectPage(page.id, page.name)}
                                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold">
                                    Disconnect
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
