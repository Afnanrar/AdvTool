import React, { useState, useEffect } from 'react';
import { Broadcast } from '../../types';
import Modal from './Modal';
import { useNotification } from '../../contexts/NotificationContext';

interface LoadTemplateModalProps {
    onClose: () => void;
    onLoadTemplate: (template: Broadcast) => void;
    fetchTemplates: () => Promise<Broadcast[]>;
}

const LoadTemplateModal: React.FC<LoadTemplateModalProps> = ({ onClose, onLoadTemplate, fetchTemplates }) => {
    const [templates, setTemplates] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const fetchedTemplates = await fetchTemplates();
                setTemplates(fetchedTemplates);
            } catch (error) {
                showNotification({ message: 'Could not load templates.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        loadTemplates();
    }, [fetchTemplates, showNotification]);

    return (
        <Modal isOpen={true} onClose={onClose} title="Load from Template" size="lg">
            <div className="max-h-96 overflow-y-auto -mr-2 pr-2">
                {isLoading ? (
                    <p className="text-center p-4 text-slate-500 dark:text-slate-400">Loading templates...</p>
                ) : templates.length > 0 ? (
                    <ul className="space-y-2">
                        {templates.map(template => (
                            <li key={template.id}>
                                <button
                                    onClick={() => onLoadTemplate(template)}
                                    className="w-full text-left p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50"
                                >
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{template.campaignName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{template.message}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center p-4 text-slate-500 dark:text-slate-400">You have no saved templates.</p>
                )}
            </div>
        </Modal>
    );
};

export default LoadTemplateModal;
