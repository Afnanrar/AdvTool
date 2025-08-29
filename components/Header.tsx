import React from 'react';
import ThemeToggle from './ThemeToggle';
import InboxIcon from './icons/InboxIcon'; // Generic icon
import { AdminInspectionContext, AuthUser } from '../types';
import AdminInspectionBanner from './AdminInspectionBanner';
import UserMenu from './UserMenu';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    pageTitle: string;
    adminInspectionContext: AdminInspectionContext | null;
    onExitAdminInspection: () => void;
    user: AuthUser;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, pageTitle, adminInspectionContext, onExitAdminInspection, user, onLogout }) => {
  return (
    <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-between p-3 h-16 w-full">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-md">
              <InboxIcon />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{pageTitle}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
      {adminInspectionContext && (
        <AdminInspectionBanner context={adminInspectionContext} onExit={onExitAdminInspection} />
      )}
    </header>
  );
};

export default Header;
