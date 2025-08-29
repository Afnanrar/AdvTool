import React, { useState, useMemo } from 'react';
import { SaaSUser, UserPlan, UserStatus, ConnectedPageInfo } from '../types';
import XCircleIcon from './icons/XCircleIcon';

// --- Local Sub-components ---
const StatusChip: React.FC<{ status: UserStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusMap = {
        Active: `${baseClasses} bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300`,
        Suspended: `${baseClasses} bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300`,
        Trial: `${baseClasses} bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300`,
    };
    return <span className={statusMap[status]}>{status}</span>;
};

const PlanChip: React.FC<{ plan: UserPlan }> = ({ plan }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-md inline-block";
    const planMap = {
        Starter: `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`,
        Growth: `${baseClasses} bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300`,
        Scale: `${baseClasses} bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300`,
        Free: `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`,
    };
    return <span className={planMap[plan]}>{plan}</span>;
}

const UsageBar: React.FC<{ usage: number, quota: number }> = ({ usage, quota }) => {
    const percent = quota > 0 ? (usage / quota) * 100 : 0;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
                className={`h-2 rounded-full ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-yellow-500' : 'bg-blue-600'}`} 
                style={{ width: `${Math.min(percent, 100)}%` }}
            ></div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div>{children}</div>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
            isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
    >
        {label}
    </button>
);


// --- Main Component ---
interface UserDetailsModalProps {
    user: SaaSUser;
    onClose: () => void;
    onAddCredits: () => void;
    onOpenChangePlan: () => void;
    onUpdateStatus: (userId: string, status: UserStatus) => void;
    onImpersonate: (user: SaaSUser) => void;
    onSeeHistory: (user: SaaSUser, page: ConnectedPageInfo) => void;
    onSeePeoples: (user: SaaSUser, page: ConnectedPageInfo) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    user,
    onClose,
    onAddCredits,
    onOpenChangePlan,
    onUpdateStatus,
    onImpersonate,
    onSeeHistory,
    onSeePeoples
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'actions'>('overview');
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const trialDaysRemaining = useMemo(() => {
        if (user.status !== 'Trial' || !user.trialEndsAt) return null;
        const now = new Date();
        const endDate = new Date(user.trialEndsAt);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [user.status, user.trialEndsAt]);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                 <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">User Information</h4>
                                 <DetailRow label="Status"><StatusChip status={user.status} /></DetailRow>
                                 <DetailRow label="Joined Date">{new Date(user.joinedDate).toLocaleDateString()}</DetailRow>
                                 <DetailRow label="Last Active">{new Date(user.lastActive).toLocaleDateString()}</DetailRow>
                            </div>
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Subscription & Usage</h4>
                                <DetailRow label="Current Plan">
                                    <div className="flex items-center space-x-2">
                                        <PlanChip plan={user.plan} />
                                        <button onClick={onOpenChangePlan} className="text-xs text-blue-500 hover:underline">Change</button>
                                    </div>
                                </DetailRow>
                                <div className="py-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Message Usage</span>
                                        <button onClick={onAddCredits} className="text-xs text-blue-500 hover:underline">+ Add Credits</button>
                                    </div>
                                    <UsageBar usage={user.messageUsage} quota={user.messageQuota} />
                                    <p className="text-xs text-right mt-1 text-slate-500 dark:text-slate-400">{user.messageUsage.toLocaleString()} / {user.messageQuota.toLocaleString()}</p>
                                </div>
                             </div>
                        </div>
                        {user.status === 'Trial' && trialDaysRemaining !== null && (
                            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-center">
                                <p className="font-semibold text-blue-600 dark:text-blue-300">
                                    Trial Ends In: <span className="text-lg">{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}</span>
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'pages':
                return (
                     <div>
                        {user.connectedPages.length > 0 ? (
                            <div className="space-y-3">
                                {user.connectedPages.map(page => (
                                    <div key={page.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={page.avatarUrl} alt={page.name} className="w-10 h-10 rounded-md"/>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{page.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{page.followers.toLocaleString()} followers</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => onSeeHistory(user, page)} className="px-3 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">See History</button>
                                            <button onClick={() => onSeePeoples(user, page)} className="px-3 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">See Peoples</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400">This user has not connected any pages yet.</p>
                            </div>
                        )}
                    </div>
                );
            case 'actions':
                return (
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <div className="space-y-3">
                             {(user.status === 'Active' || user.status === 'Trial') && (
                                <button
                                    onClick={() => onUpdateStatus(user.id, 'Suspended')}
                                    className="w-full text-left px-4 py-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded-md"
                                >
                                    Suspend User
                                </button>
                            )}
                            {user.status === 'Suspended' && (
                                <button
                                    onClick={() => onUpdateStatus(user.id, 'Active')}
                                    className="w-full text-left px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 rounded-md"
                                >
                                    Reactivate User
                                </button>
                            )}
                            <button
                                onClick={() => onImpersonate(user)}
                                className="w-full text-left px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
                            >
                                Impersonate User
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{user.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isValidEmail(user.email) ? user.email : <i className="text-red-500">Invalid or missing email</i>}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="px-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton label={`Pages (${user.connectedPages.length})`} isActive={activeTab === 'pages'} onClick={() => setActiveTab('pages')} />
                        <TabButton label="Admin Actions" isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg flex justify-end flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;