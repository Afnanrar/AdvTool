import React from 'react';
import { MessageTag } from '../types';
import { AVAILABLE_TAGS } from '../constants';

interface TagSelectorProps {
  selectedTag: MessageTag | null;
  onSelectTag: (tag: MessageTag | null) => void;
}

const TAG_DESCRIPTIONS: Record<MessageTag, string> = {
    [MessageTag.ACCOUNT_UPDATE]: "Notify user of a non-recurring change to their account.",
    [MessageTag.POST_PURCHASE_UPDATE]: "Provide updates on a recent purchase.",
    [MessageTag.CONFIRMED_EVENT_UPDATE]: "Send reminders or updates for a registered event.",
    [MessageTag.HUMAN_AGENT]: "Allow a human agent to respond to user inquiries (within 7 days)."
};

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTag, onSelectTag }) => {
  const isRequiredAndUnselected = !selectedTag;

  return (
    <div className="bg-yellow-400/10 dark:bg-yellow-900/30 border border-yellow-400/50 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-200 p-3 rounded-lg">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <h4 className="font-semibold">24-hour window has passed</h4>
          <p className="text-sm text-yellow-600/80 dark:text-yellow-300/80 mb-2">
            A message tag is required to send a message. Please select the appropriate tag below.
          </p>
          <select 
            value={selectedTag || ''} 
            onChange={e => onSelectTag(e.target.value as MessageTag)}
            className={`w-full bg-slate-200/50 dark:bg-slate-700/50 border text-slate-800 dark:text-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
              isRequiredAndUnselected
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
            }`}
          >
            <option value="">-- Select a Tag --</option>
            {AVAILABLE_TAGS.map(tag => (
              <option key={tag} value={tag}>{tag.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {selectedTag && <p className="text-xs mt-2 text-yellow-600/70 dark:text-yellow-300/70">{TAG_DESCRIPTIONS[selectedTag]}</p>}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;