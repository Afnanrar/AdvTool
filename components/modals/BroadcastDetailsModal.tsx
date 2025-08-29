import React from 'react';
import { Broadcast } from '../../types';
import Modal from './Modal';

interface BroadcastDetailsModalProps {
    broadcast: Broadcast;
    onClose: () => void;
}

const Stat: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="text-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
);

const BroadcastDetailsModal: React.FC<BroadcastDetailsModalProps> = ({ broadcast, onClose }) => {
    const footer = (
        <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
        >
            Close
        </button>
    );
    
    // Mock analytics if not present
    const analytics = broadcast.analytics || {
        openRate: broadcast.status === 'Sent' ? Math.random() * (95 - 80) + 80 : 0,
        clickThroughRate: broadcast.status === 'Sent' ? Math.random() * (15 - 5) + 5 : 0,
        errors: broadcast.status === 'Sent' && Math.random() > 0.8 ? [{ code: 100, message: 'User has blocked the page', count: Math.floor(Math.random()*10) + 1 }] : [],
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Analytics: ${broadcast.campaignName}`} footer={footer} size="lg">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Stat label="Open Rate" value={`${analytics.openRate.toFixed(2)}%`} />
                    <Stat label="Click-Through Rate" value={`${analytics.clickThroughRate.toFixed(2)}%`} />
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-300">Message Content</h4>
                    <p className="text-sm p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md whitespace-pre-wrap">{broadcast.message}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-300">Error Log</h4>
                    {analytics.errors.length > 0 ? (
                        <ul className="text-xs space-y-1 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                            {analytics.errors.map((err, i) => (
                                <li key={i} className="flex justify-between">
                                    <span className="text-red-800 dark:text-red-300">{err.message} (Code: {err.code})</span>
                                    <span className="font-mono text-red-600 dark:text-red-400">{err.count} users</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-500 dark:text-slate-400">No errors reported for this broadcast.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default BroadcastDetailsModal;