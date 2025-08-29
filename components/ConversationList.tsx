import React, { useState, useMemo } from 'react';
import { Conversation } from '../types';
import ConversationListItem from './ConversationListItem';
import SkeletonLoader from './SkeletonLoader';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.userProfile.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <aside className="w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {loading ? (
           <SkeletonLoader type="conversation" />
        ) : (
          <ul>
            {filteredConversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))}
          </ul>
        )}
        {!loading && filteredConversations.length === 0 && (
            <div className="text-center p-6 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm ? 'No matching conversations.' : 'No conversations found.'}
            </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;