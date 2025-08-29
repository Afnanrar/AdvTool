import React, { useState, useMemo } from 'react';
import { SaaSUser, UserStatus, UserPlan, ConnectedPageInfo } from '../types';
import { UserManagementTable } from './UserManagementTable';
import AddCreditsModal from './AddCreditsModal';
import ChangePlanModal from './ChangePlanModal';
import UserDetailsModal from './UserDetailsModal';
import StatCard from './StatCard';
import UsersIcon from './icons/UsersIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import AreaChart from './AreaChart';
import DoughnutChart from './DoughnutChart';
import { useNotification } from '../contexts/NotificationContext';

interface AdminDashboardProps {
    users: SaaSUser[];
    onUpdateCredits: (userId: string, creditsToAdd: number) => Promise<SaaSUser>;
    onUpdateStatus: (userIds: string[], status: UserStatus) => Promise<void>;
    onUpdatePlan: (userId: string, plan: UserPlan) => Promise<SaaSUser | undefined>;
    onImpersonate: (user: SaaSUser) => void;
    onViewHistory: (user: SaaSUser, page: ConnectedPageInfo) => void;
    onViewPeoples: (user: SaaSUser, page: ConnectedPageInfo) => void;
    onConfirmAction: (title: string, message: string, onConfirm: () => void, confirmButtonClass?: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, onUpdateCredits, onUpdateStatus, onUpdatePlan, 
    onImpersonate, onViewHistory, onViewPeoples, onConfirmAction,
}) => {
    const { showNotification } = useNotification();
    const [managedUser, setManagedUser] = useState<SaaSUser | null>(null);
    const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);
    const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState<UserPlan | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    const kpiData = useMemo(() => {
        const activeUsers = users.filter(u => u.status === 'Active');
        const totalMessages = users.reduce((acc, user) => acc + user.messageUsage, 0);
        const calculateMrr = (currentUsers: SaaSUser[]): number => {
            const planPrices: Record<UserPlan, number> = { 'Starter': 25, 'Growth': 50, 'Scale': 250, 'Free': 0 };
            return currentUsers.reduce((acc, user) => user.status === 'Active' ? acc + (planPrices[user.plan] || 0) : acc, 0);
        };
        
        const weeklySignupsData = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(); day.setDate(day.getDate() - (6 - i));
            const count = users.filter(u => new Date(u.joinedDate).toDateString() === day.toDateString()).length;
            return { name: day.toLocaleDateString('en-US', { weekday: 'short' }), value: count };
        });

        const planDistribution = users.reduce((acc, user) => {
            acc[user.plan] = (acc[user.plan] || 0) + 1;
            return acc;
        }, {} as Record<UserPlan, number>);
        
        const planChartData = Object.entries(planDistribution).map(([name, value]) => ({ name: name as UserPlan, value }));

        return {
            totalActiveUsers: activeUsers.length,
            mrr: calculateMrr(users),
            totalMessagesSent: totalMessages,
            avgMessagesPerUser: users.length > 0 ? Math.round(totalMessages / users.length) : 0,
            weeklySignupsData,
            planChartData
        };
    }, [users]);
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (planFilter === 'all' || user.plan === planFilter) &&
            (statusFilter === 'all' || user.status === statusFilter)
        );
    }, [users, searchTerm, planFilter, statusFilter]);
    
    const handleManageUser = (user: SaaSUser) => setManagedUser(user);
    const handleCloseUserDetails = () => setManagedUser(null);
    const handleOpenAddCredits = () => setIsAddCreditsModalOpen(true);
    const handleCloseAddCredits = () => setIsAddCreditsModalOpen(false);
    const handleOpenChangePlan = () => setIsChangePlanModalOpen(true);
    const handleCloseChangePlan = () => setIsChangePlanModalOpen(false);

    const handleConfirmCredits = async (userId: string, credits: number) => {
        try {
            const updatedUser = await onUpdateCredits(userId, credits);
            setManagedUser(updatedUser);
            showNotification({ message: `Added ${credits.toLocaleString()} credits.`, type: 'success'});
            handleCloseAddCredits();
        } catch(error) { showNotification({ message: "Could not update credits.", type: 'error'}); }
    };
    
    const handleConfirmPlanChange = async (userId: string, plan: UserPlan) => {
         try {
            const updatedUser = await onUpdatePlan(userId, plan);
            if (updatedUser) {
              setManagedUser(updatedUser);
            }
            handleCloseChangePlan();
        } catch(error) {}
    };

    const handleBulkUpdateStatus = (status: UserStatus) => {
      if (selectedUserIds.size === 0) return;
      const userCount = selectedUserIds.size;
      const isSuspension = status === 'Suspended';
      onConfirmAction(
        `${status} ${userCount} User${userCount > 1 ? 's' : ''}`,
        `Are you sure you want to set the status to "${status}" for ${userCount} selected user${userCount > 1 ? 's' : ''}?`,
        () => {
            onUpdateStatus(Array.from(selectedUserIds), status).finally(() => setSelectedUserIds(new Set()));
        },
        isSuspension ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
      );
    };
    
    const handleExport = () => {
        showNotification({ message: `Exporting ${filteredUsers.length} users to CSV.`, type: 'info' });
        // In a real app, this would trigger a download.
    };

    return (
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 p-6">
            {managedUser && (
                <>
                    <UserDetailsModal user={managedUser} onClose={handleCloseUserDetails} onAddCredits={handleOpenAddCredits}
                        onOpenChangePlan={handleOpenChangePlan} 
                        onUpdateStatus={(id, status) => {
                             onConfirmAction(
                                `${status} User`,
                                `Are you sure you want to ${status.toLowerCase()} ${managedUser.name}?`,
                                () => onUpdateStatus([id], status),
                                status === 'Suspended' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                            )
                        }}
                        onImpersonate={onImpersonate}
                        onSeeHistory={onViewHistory} onSeePeoples={onViewPeoples}
                    />
                    {isAddCreditsModalOpen && <AddCreditsModal user={managedUser} onClose={handleCloseAddCredits} onConfirm={handleConfirmCredits} />}
                    {isChangePlanModalOpen && <ChangePlanModal user={managedUser} onClose={handleCloseChangePlan} onConfirm={handleConfirmPlanChange} />}
                </>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard icon={<UsersIcon />} title="Total Active Users" value={kpiData.totalActiveUsers} change={5.2} />
                <StatCard icon={<CurrencyDollarIcon />} title="Monthly Recurring Revenue" value={`$${kpiData.mrr.toLocaleString()}`} change={2.1} />
                <StatCard icon={<ChatBubbleLeftRightIcon />} title="Total Messages Sent" value={kpiData.totalMessagesSent.toLocaleString()} change={10.8} />
                <StatCard icon={<ChatBubbleLeftRightIcon />} title="Avg. Messages / User" value={kpiData.avgMessagesPerUser.toLocaleString()} change={-1.5} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                 <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">New Users This Week</h3>
                    <div className="h-64"><AreaChart data={kpiData.weeklySignupsData} /></div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                     <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Users by Plan</h3>
                    <div className="h-64"><DoughnutChart data={kpiData.planChartData} /></div>
                </div>
            </div>
            
             <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                 <div className="flex items-center space-x-4 flex-grow">
                    <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value as UserPlan | 'all')} className="bg-slate-100 dark:bg-slate-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Plans</option><option value="Free">Free</option><option value="Starter">Starter</option><option value="Growth">Growth</option><option value="Scale">Scale</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')} className="bg-slate-100 dark:bg-slate-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Statuses</option><option value="Active">Active</option><option value="Suspended">Suspended</option><option value="Trial">Trial</option>
                    </select>
                </div>
                <button onClick={handleExport} className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">Export CSV</button>
            </div>

            <UserManagementTable users={filteredUsers} onManageUser={handleManageUser}
                selectedUserIds={selectedUserIds} setSelectedUserIds={setSelectedUserIds} onBulkUpdateStatus={handleBulkUpdateStatus}
            />
        </main>
    );
};

export default AdminDashboard;
