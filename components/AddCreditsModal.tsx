import React, { useState } from 'react';
import { SaaSUser } from '../types';
import XCircleIcon from './icons/XCircleIcon';

interface AddCreditsModalProps {
    user: SaaSUser;
    onClose: () => void;
    onConfirm: (userId: string, creditsToAdd: number) => void;
}

const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ user, onClose, onConfirm }) => {
    const [credits, setCredits] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        const creditsToAdd = parseInt(credits, 10);
        if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
            alert("Please enter a valid, positive number of credits.");
            return;
        }
        setIsLoading(true);
        await onConfirm(user.id, creditsToAdd);
        setIsLoading(false);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add Messaging Credits</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <p><strong>User:</strong> {user.name} ({user.email})</p>
                        <p><strong>Current Plan:</strong> {user.plan}</p>
                        <p><strong>Current Quota:</strong> {user.messageQuota.toLocaleString()} messages</p>
                    </div>
                    <div>
                        <label htmlFor="credits" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Credits to Add
                        </label>
                        <input 
                            type="number" 
                            id="credits"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 100000"
                            min="1"
                        />
                    </div>
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
                        disabled={isLoading || !credits}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Adding...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCreditsModal;