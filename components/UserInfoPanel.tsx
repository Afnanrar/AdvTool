import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface UserInfoPanelProps {
    userProfile: UserProfile;
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ userProfile }) => {
    const [notes, setNotes] = useState(userProfile.notes || '');

    useEffect(() => {
        setNotes(userProfile.notes || '');
    }, [userProfile]);

    const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm text-slate-200">{value}</p>
        </div>
    );

    return (
        <aside className="w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700/50 flex flex-col p-4 space-y-6">
            <div className="text-center">
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-20 h-20 rounded-full mx-auto" />
                <h3 className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{userProfile.name}</h3>
            </div>

            <div className="bg-slate-200 dark:bg-slate-700/50 p-3 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600 pb-2">User Details</h4>
                <InfoRow label="Email" value={userProfile.email} />
                <InfoRow label="Joined" value={new Date(userProfile.joinedAt).toLocaleDateString()} />
            </div>

            <div className="bg-slate-200 dark:bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Labels</h4>
                {/* Add logic to add/remove labels in a real app */}
                <div className="flex flex-wrap gap-2">
                    {/* In a real app, these would come from the conversation object */}
                    {['VIP', 'Interested', 'Repeat Customer'].map(label => (
                        <span key={label} className="text-xs bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-full">{label}</span>
                    ))}
                     <button className="text-xs bg-slate-300/50 dark:bg-slate-600/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600">+</button>
                </div>
            </div>

            <div className="flex-grow flex flex-col bg-slate-200 dark:bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Agent Notes</h4>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes here..."
                    className="w-full flex-grow bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                 {/* A real app would have a save button that triggers an API call */}
            </div>
        </aside>
    );
};

export default UserInfoPanel;