import React, { useState } from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };
    
    const footer = (
        <>
            <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"
            >
                {cancelText}
            </button>
            <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
            >
                {isLoading ? 'Processing...' : confirmText}
            </button>
        </>
    );

    return (
        <Modal isOpen={true} onClose={onCancel} title={title} footer={footer} size="md">
            <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        </Modal>
    );
};

export default ConfirmationModal;
