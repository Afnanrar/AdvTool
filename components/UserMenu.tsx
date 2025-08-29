import React, { useState, useRef, useEffect } from 'react';
import { AuthUser } from '../types';

interface UserMenuProps {
    user: AuthUser;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
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
    
    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)}>
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 ring-blue-500"/>
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-slate-200 dark:border-slate-700">
                    <div className="py-1">
                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100" >{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                         <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            role="menuitem"
                          >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
