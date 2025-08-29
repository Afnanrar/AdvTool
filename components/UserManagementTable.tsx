

import React, { useRef, useEffect } from 'react';
import { SaaSUser, UserPlan, UserStatus } from '../types';

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


interface UserManagementTableProps {
    users: SaaSUser[];
    onManageUser: (user: SaaSUser) => void;
    selectedUserIds: Set<string>;
    setSelectedUserIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    onBulkUpdateStatus: (status: UserStatus) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ 
    users, 
    onManageUser,
    selectedUserIds,
    setSelectedUserIds,
    onBulkUpdateStatus
}) => {
    
    // Fix: Use a ref to set the indeterminate property on the checkbox imperatively.
    const selectAllRef = useRef<HTMLInputElement>(null);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUserIds(new Set(users.map(u => u.id)));
        } else {
            setSelectedUserIds(new Set());
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
        const newSet = new Set(selectedUserIds);
        if (e.target.checked) {
            newSet.add(userId);
        } else {
            newSet.delete(userId);
        }
        setSelectedUserIds(newSet);
    };

    const numSelected = selectedUserIds.size;
    const numUsers = users.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = numSelected > 0 && numSelected < numUsers;
        }
    }, [numSelected, numUsers]);


    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
            {numSelected > 0 && (
                <div className="mb-4 p-3 bg-blue-500/10 rounded-md flex items-center justify-between">
                     <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{numSelected} user{numSelected > 1 ? 's' : ''} selected</span>
                     <div className="flex items-center space-x-2">
                        <span className="text-sm">Bulk Actions:</span>
                        <select
                            onChange={(e) => onBulkUpdateStatus(e.target.value as UserStatus)}
                            value="" // Uncontrolled to just trigger action
                            className="bg-slate-100 dark:bg-slate-800 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Action</option>
                            <option value="Active">Set to Active</option>
                            <option value="Suspended">Set to Suspended</option>
                        </select>
                     </div>
                </div>
            )}
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50">
                    <tr>
                        <th scope="col" className="p-4">
                            <input type="checkbox"
                                ref={selectAllRef}
                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                                checked={numSelected === numUsers && numUsers > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th scope="col" className="px-6 py-3">User</th>
                        <th scope="col" className="px-6 py-3">Plan</th>
                        <th scope="col" className="px-6 py-3 w-48">Message Usage</th>
                        <th scope="col" className="px-6 py-3 text-center">Pages</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Last Active</th>
                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                            <td className="w-4 p-4">
                                <input type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                                    checked={selectedUserIds.has(user.id)}
                                    onChange={(e) => handleSelectOne(e, user.id)}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <div className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</div>
                                        <div className="text-slate-500 dark:text-slate-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><PlanChip plan={user.plan} /></td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <UsageBar usage={user.messageUsage} quota={user.messageQuota} />
                                    <span className="text-xs mt-1">{user.messageUsage.toLocaleString()} / {user.messageQuota.toLocaleString()}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-200">{user.connectedPagesCount}</td>
                            <td className="px-6 py-4"><StatusChip status={user.status} /></td>
                            <td className="px-6 py-4">{new Date(user.lastActive).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => onManageUser(user)}
                                    className="px-3 py-1 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
                                >
                                    Manage
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};