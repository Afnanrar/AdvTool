import React, { useState, useEffect } from 'react';
import { Broadcast } from '../types';
import BroadcastDetailsModal from './modals/BroadcastDetailsModal';
import { useNotification } from '../contexts/NotificationContext';

interface BroadcastHistoryProps {
    broadcasts: Broadcast[];
    onCancelBroadcast: (broadcastId: string) => void;
}

const BroadcastHistory: React.FC<BroadcastHistoryProps> = ({ broadcasts, onCancelBroadcast }) => {
  const [viewingBroadcast, setViewingBroadcast] = useState<Broadcast | null>(null);
  const { showNotification } = useNotification();
  
  const getStatusChip = (status: Broadcast['status']) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusMap = {
      'Sent': `${baseClasses} bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300`,
      'In Progress': `${baseClasses} bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300`,
      'Scheduled': `${baseClasses} bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300`,
      'Draft': `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`,
      'Failed': `${baseClasses} bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300`,
      'Cancelled': `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 line-through`,
    };
    return <span className={statusMap[status]}>{status}</span>;
  }
  
  const ProgressBar: React.FC<{progress: number, status: Broadcast['status']}> = ({ progress, status }) => {
    const [animatedProgress, setAnimatedProgress] = useState(progress);

    useEffect(() => {
        // Only animate if the progress is changing and it's "In Progress"
        if (status === 'In Progress') {
            const animationDuration = 2000; // ms to match the polling interval in mock API
            let start: number | null = null;
            const startProgress = animatedProgress;

            const step = (timestamp: number) => {
                if (!start) start = timestamp;
                const timeElapsed = timestamp - start;
                const progressFraction = Math.min(timeElapsed / animationDuration, 1);
                const currentProgress = startProgress + (progress - startProgress) * progressFraction;
                setAnimatedProgress(currentProgress);
                if (timeElapsed < animationDuration && currentProgress < progress) {
                    requestAnimationFrame(step);
                } else {
                    setAnimatedProgress(progress); // Ensure it lands on the final value
                }
            };
            requestAnimationFrame(step);
        } else {
            setAnimatedProgress(progress);
        }
    }, [progress, status, animatedProgress]);

    return (
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${animatedProgress}%`, transition: 'width 2s linear'}}></div>
        </div>
    );
  };
  
  const handleViewDetails = (broadcast: Broadcast) => {
    if(broadcast.status === 'Draft' || broadcast.status === 'Cancelled' || broadcast.status === 'Scheduled') {
        showNotification({ message: 'No analytics available for this campaign status.', type: 'info'});
        return;
    }
    setViewingBroadcast(broadcast);
  };

  if (broadcasts.length === 0) {
    return (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold">No Broadcast History</h3>
            <p className="text-sm mt-1">This page doesn't have any past or scheduled broadcasts yet.</p>
        </div>
    );
  }

  return (
    <>
        {viewingBroadcast && (
            <BroadcastDetailsModal 
                broadcast={viewingBroadcast}
                onClose={() => setViewingBroadcast(null)}
            />
        )}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Campaign</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3 w-32">Progress</th>
                            <th scope="col" className="px-4 py-3 text-right">Sent / Total</th>
                            <th scope="col" className="px-4 py-3">Scheduled At</th>
                            <th scope="col" className="px-4 py-3">Time Spent</th>
                            <th scope="col" className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {broadcasts.map((broadcast) => (
                            <tr key={broadcast.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                                <td className="px-4 py-4 max-w-xs">
                                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={broadcast.campaignName}>
                                        {broadcast.campaignName}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 truncate" title={broadcast.message}>
                                        {broadcast.message}
                                    </div>
                                </td>
                                <td className="px-4 py-4">{getStatusChip(broadcast.status)}</td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-2">
                                        <ProgressBar progress={broadcast.progress} status={broadcast.status} />
                                        <span className="text-xs font-medium w-8 text-right">{Math.round(broadcast.progress)}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right font-medium text-slate-700 dark:text-slate-200">
                                    {broadcast.sentCount.toLocaleString()} / {broadcast.totalRecipients.toLocaleString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">{broadcast.scheduledAt ? new Date(broadcast.scheduledAt).toLocaleString() : '-'}</td>
                                <td className="px-4 py-4 whitespace-nowrap">{broadcast.timeSpent || '-'}</td>
                                <td className="px-4 py-4 text-center">
                                    {broadcast.status === 'Scheduled' ? (
                                        <button onClick={() => onCancelBroadcast(broadcast.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-xs">Cancel</button>
                                    ) : (
                                        <button onClick={() => handleViewDetails(broadcast)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-xs">View Details</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
  );
};

export default BroadcastHistory;