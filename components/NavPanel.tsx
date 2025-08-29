import React from 'react';
import InboxIcon from './icons/InboxIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import CogIcon from './icons/CogIcon';
import PagesIcon from './icons/PagesIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import { AppView } from '../types';

interface NavPanelProps {
    currentView: AppView;
    onSetView: (view: AppView) => void;
    isSuperAdmin: boolean;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => {
    const baseClasses = "flex flex-col items-center justify-center p-3 w-full rounded-lg transition-colors duration-200 ease-in-out";
    const activeClasses = "bg-blue-600/20 text-blue-500 dark:text-blue-400";
    const inactiveClasses = "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-label={label}
            title={label}
        >
            {children}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
}

const NavPanel: React.FC<NavPanelProps> = ({ currentView, onSetView, isSuperAdmin }) => {
    return (
        <nav className="w-20 flex-shrink-0 bg-slate-100 dark:bg-slate-800/50 p-2 flex flex-col items-center space-y-2 border-r border-slate-200 dark:border-slate-700/50">
           <NavButton
                label="Pages"
                isActive={currentView === 'pages'}
                onClick={() => onSetView('pages')}
            >
                <PagesIcon />
            </NavButton>
           <NavButton
                label="Inbox"
                isActive={currentView === 'inbox'}
                onClick={() => onSetView('inbox')}
            >
                <InboxIcon />
            </NavButton>
            <NavButton
                label="Broadcasts"
                isActive={currentView === 'broadcast'}
                onClick={() => onSetView('broadcast')}
            >
                <MegaphoneIcon />
            </NavButton>
            <div className="flex-grow"></div>
            <NavButton
                label="Settings"
                isActive={currentView === 'settings'}
                onClick={() => onSetView('settings')}
            >
                <CogIcon />
            </NavButton>
            {isSuperAdmin && (
                <>
                    <div className="w-full px-2">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700 my-2"></div>
                    </div>
                    <NavButton
                        label="Admin"
                        isActive={currentView === 'admin'}
                        onClick={() => onSetView('admin')}
                    >
                        <ShieldCheckIcon />
                    </NavButton>
                </>
            )}
        </nav>
    );
};

export default NavPanel;
