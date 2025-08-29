import React, { ReactNode } from 'react';
import XCircleIcon from '../icons/XCircleIcon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses: Record<typeof size, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full m-4 flex flex-col max-h-[90vh] ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <header className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
                {footer && (
                    <footer className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg flex justify-end space-x-3 flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Modal;
