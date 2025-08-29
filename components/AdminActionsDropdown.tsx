import React, { useState, useRef, useEffect } from 'react';
import { SaaSUser, UserStatus } from '../types';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon';

interface AdminActionsDropdownProps {
    user: SaaSUser;
    onAddCredits: () => void;
    onUpdateStatus: (userId: string, status: UserStatus) => void;
    onImpersonate: () => void;
}

const AdminActionsDropdown: React.FC<AdminActionsDropdownProps> = ({ user, onAddCredits, onUpdateStatus, onImpersonate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    <EllipsisVerticalIcon />
                </button>
            </div>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-slate-200 dark:border-slate-700"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={() => handleAction(onAddCredits)}
                            className="text-slate-700 dark:text-slate-200 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                            role="menuitem"
                        >
                            Add Credits
                        </button>
                        
                        {user.status === 'Active' && (
                             <button
                                onClick={() => {
                                    if(window.confirm(`Are you sure you want to suspend ${user.name}?`)) {
                                        handleAction(() => onUpdateStatus(user.id, 'Suspended'))
                                    }
                                }}
                                className="text-yellow-600 dark:text-yellow-400 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                role="menuitem"
                            >
                                Suspend User
                            </button>
                        )}
                        
                        {user.status === 'Suspended' && (
                            <button
                                onClick={() => handleAction(() => onUpdateStatus(user.id, 'Active'))}
                                className="text-green-600 dark:text-green-400 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                role="menuitem"
                            >
                                Reactivate User
                            </button>
                        )}
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

                        <button
                            onClick={() => handleAction(onImpersonate)}
                            className="text-slate-700 dark:text-slate-200 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                            role="menuitem"
                        >
                            Impersonate User
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActionsDropdown;
