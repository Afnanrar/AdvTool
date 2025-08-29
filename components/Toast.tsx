import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

const Toast: React.FC = () => {
    const { notifications, removeNotification } = useNotification();
    
    if (notifications.length === 0) {
        return null;
    }

    const getIcon = (type: string) => {
        switch(type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
            case 'info': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />; // Re-use for info
            default: return null;
        }
    };

    const getColors = (type: string) => {
        switch(type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700/50';
            case 'error': return 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700/50';
            case 'info': return 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700/50';
            default: return 'bg-slate-50 dark:bg-slate-700';
        }
    };
    
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-full max-w-md px-4">
            {notifications.map(notification => (
                 <div
                    key={notification.id}
                    className={`flex items-center justify-between p-3 rounded-lg shadow-lg border animate-fade-in-up w-full ${getColors(notification.type)}`}
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {getIcon(notification.type)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{notification.message}</p>
                        </div>
                    </div>
                    <button onClick={() => removeNotification(notification.id)} className="ml-4 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                        <XCircleIcon className="h-5 w-5 text-slate-400" />
                    </button>
                    <style>{`
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-in-up {
                            animation: fadeInUp 0.5s ease-out forwards;
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
};

export default Toast;