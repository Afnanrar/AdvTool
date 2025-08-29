import React from 'react';
import { CannedResponse } from '../types';

interface CannedResponsesPopoverProps {
    responses: CannedResponse[];
    onSelect: (response: CannedResponse) => void;
    onClose: () => void;
}

const CannedResponsesPopover: React.FC<CannedResponsesPopoverProps> = ({ responses, onSelect, onClose }) => {
    return (
        <>
            <div onClick={onClose} className="fixed inset-0 z-10"></div>
            <div className="absolute bottom-full mb-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
                <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Canned Responses</h4>
                </div>
                <ul className="py-1 max-h-60 overflow-y-auto">
                    {responses.map(response => (
                        <li key={response.id}>
                            <button
                                onClick={() => onSelect(response)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{response.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{response.text}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default CannedResponsesPopover;