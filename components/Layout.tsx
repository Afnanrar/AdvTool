import React from 'react';
import Header from './Header';
import HealthPanel from './HealthPanel';
import { AdminInspectionContext, AuthUser } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pageTitle: string;
  adminInspectionContext: AdminInspectionContext | null;
  onExitAdminInspection: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  theme, 
  onToggleTheme, 
  pageTitle, 
  adminInspectionContext, 
  onExitAdminInspection,
  currentUser,
  onLogout
}) => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header 
        theme={theme} 
        onToggleTheme={onToggleTheme} 
        pageTitle={pageTitle}
        adminInspectionContext={adminInspectionContext}
        onExitAdminInspection={onExitAdminInspection}
        user={currentUser}
        onLogout={onLogout}
      />
      <div className="flex-grow flex">
        <div className="flex flex-grow">
          {children}
        </div>
        <HealthPanel />
      </div>
    </div>
  );
};

export default Layout;