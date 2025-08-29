import React from 'react';
import { Message } from '../types';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const { direction, text, createdAt, status } = message;
  const isOutgoing = direction === 'out';

  const getStatusIndicator = () => {
    switch(status) {
        case 'queued': return <span title="Queued" className="text-xs">◌</span>;
        case 'sent': return <span title="Sent" className="text-xs">✓</span>;
        case 'delivered': return <span title="Delivered" className="text-xs">✓✓</span>;
        case 'read': return <span title="Read" className="text-blue-400 text-xs">✓✓</span>;
        case 'failed': return <span title="Failed" className="text-red-400 text-xs">✗</span>;
        default: return null;
    }
  }

  return (
    <div className={`flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md lg:max-w-xl px-4 py-2 rounded-xl ${isOutgoing ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
        <p className="whitespace-pre-wrap">{text}</p>
        <div className={`text-xs mt-1 text-right ${isOutgoing ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'}`}>
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isOutgoing && <div className="flex-shrink-0 w-4 h-4 text-slate-400">{getStatusIndicator()}</div>}
    </div>
  );
};

export default MessageComponent;