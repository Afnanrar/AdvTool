import React from 'react';
import { AdminInspectionContext } from '../types';

interface AdminInspectionBannerProps {
    context: AdminInspectionContext;
    onExit: () => void;
}

const AdminInspectionBanner: React.FC<AdminInspectionBannerProps> = ({ context, onExit }) => {
    const { user, page, viewing } = context;

    const viewingText = viewing === 'inbox' ? 'conversations' : 'broadcast history';
    
    return (
        <div className="w-full bg-yellow-400/20 dark:bg-yellow-900/30 border-t border-b border-yellow-400/50 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>
                    <span className="font-semibold">Admin Inspection Mode:</span> Viewing {viewingText} for <span className="font-bold">{user.name}</span> on page <span className="font-bold">{page.name}</span>.
                </p>
            </div>
            <button
                onClick={onExit}
                className="px-3 py-1 text-xs font-medium bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-100 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-800"
            >
                Return to Admin Dashboard
            </button>
        </div>
    );
};

export default AdminInspectionBanner;