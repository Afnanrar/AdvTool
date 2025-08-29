import React from 'react';
import { Conversation } from '../types';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const { userProfile, lastMessage, lastMessageAt, unreadCount } = conversation;

  const timeAgo = (date: string): string => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return "now";
  }

  const baseClasses = "flex items-center p-3 cursor-pointer transition-colors duration-200 ease-in-out border-b border-slate-200/50 dark:border-slate-700/50";
  const selectedClasses = "bg-slate-200 dark:bg-slate-700/50";
  const unselectedClasses = "hover:bg-slate-200/50 dark:hover:bg-slate-700/30";

  return (
    <li className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`} onClick={onClick}>
      <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-12 h-12 rounded-full mr-3" />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-baseline">
          <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{userProfile.name}</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{timeAgo(lastMessageAt)}</span>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-2">{lastMessage}</p>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default ConversationListItem;