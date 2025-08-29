import React, { useState } from 'react';
import { SaaSUser, UserPlan } from '../types';
import XCircleIcon from './icons/XCircleIcon';

interface ChangePlanModalProps {
    user: SaaSUser;
    onClose: () => void;
    onConfirm: (userId: string, newPlan: UserPlan) => void;
}

const ALL_PLANS: UserPlan[] = ['Free', 'Starter', 'Growth', 'Scale'];

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ user, onClose, onConfirm }) => {
    const [selectedPlan, setSelectedPlan] = useState<UserPlan>(user.plan);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (selectedPlan === user.plan) {
            alert("Please select a different plan.");
            return;
        }
        setIsLoading(true);
        await onConfirm(user.id, selectedPlan);
        setIsLoading(false);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Change User Plan</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4 text-sm">
                        <p><strong>User:</strong> {user.name}</p>
                        <p><strong>Current Plan:</strong> <span className="font-semibold">{user.plan}</span></p>
                    </div>
                    <div>
                        <label htmlFor="plan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            New Plan
                        </label>
                        <select 
                            id="plan"
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value as UserPlan)}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                           {ALL_PLANS.map(plan => (
                               <option key={plan} value={plan}>{plan}</option>
                           ))}
                        </select>
                    </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Changing the plan will also update the user's message quota to the default for that tier.
                    </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedPlan === user.plan}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Updating...' : 'Confirm Change'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePlanModal;