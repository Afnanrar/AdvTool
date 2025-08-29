import React, { useState, useMemo, useEffect } from 'react';
import { Conversation, MessageTag, CannedResponse } from '../types';
import TagSelector from './TagSelector';
import { generateSmartReplies } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import SparklesIcon from './icons/SparklesIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import CannedResponsesPopover from './CannedResponsesPopover';
import { MOCK_CANNED_RESPONSES } from '../constants';
import { useNotification } from '../contexts/NotificationContext';

interface MessageInputProps {
  conversation: Conversation;
  onSendMessage: (text: string, tag: string | null) => void;
}

const MAX_MESSAGE_LENGTH = 2000;

const MessageInput: React.FC<MessageInputProps> = ({ conversation, onSendMessage }) => {
  const { showNotification } = useNotification();
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<MessageTag | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showCannedResponses, setShowCannedResponses] = useState(false);

  // State for the undo feature
  const [pendingSend, setPendingSend] = useState<{ text: string; tag: string | null } | null>(null);
  // Fix: The return type of setTimeout in a browser environment is `number`, not `NodeJS.Timeout`.
  const [sendTimerId, setSendTimerId] = useState<number | null>(null);

  const isOutside24HourWindow = useMemo(() => {
    const lastMessageDate = new Date(conversation.lastMessageAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }, [conversation.lastMessageAt]);
  
  // Clear suggestions and any pending sends when conversation changes
  useEffect(() => {
    setSuggestions([]);
    if (sendTimerId) {
        clearTimeout(sendTimerId);
    }
    setPendingSend(null);
    setSendTimerId(null);
    setText('');
    setShowCannedResponses(false);
    // When the conversation changes, also reset the selected tag
    setSelectedTag(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (sendTimerId) {
        clearTimeout(sendTimerId);
      }
    };
  }, [sendTimerId]);

  const confirmSend = (messageToSend: { text: string; tag: string | null }) => {
    if (messageToSend.text.trim() === '') return;
    onSendMessage(messageToSend.text, messageToSend.tag);
    setPendingSend(null);
    setSendTimerId(null);
  };

  const handleSend = () => {
    if (text.trim() === '') return;
    if (isOutside24HourWindow && !selectedTag) {
      showNotification({ message: 'Please select a message tag for conversations older than 24 hours.', type: 'error' });
      return;
    }
    
    // Set up the pending send
    const messageDetails = { text, tag: selectedTag };
    setPendingSend(messageDetails);
    
    // Start the 2-second timer to send the message
    // Fix: Use `window.setTimeout` to ensure the return type is `number` in all TypeScript environments (browser vs. Node). This resolves the type error with `setSendTimerId`.
    const timerId = window.setTimeout(() => confirmSend(messageDetails), 2000);
    setSendTimerId(timerId);

    // Clear inputs immediately
    setText('');
    setSelectedTag(null);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };
  
  const handleUndo = () => {
    if (sendTimerId) {
      clearTimeout(sendTimerId);
    }
    if (pendingSend) {
      // Restore the text and tag to the input fields
      setText(pendingSend.text);
      setSelectedTag(pendingSend.tag as MessageTag | null);
    }
    setPendingSend(null);
    setSendTimerId(null);
  };

  const handleGenerateReplies = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    try {
        const replies = await generateSmartReplies(`Generate 3 short, helpful, and distinct reply suggestions for a customer support agent. The customer's last message was: "${conversation.lastMessage}"`);
        setSuggestions(replies);
    } catch (error) {
        console.error("Failed to generate smart replies:", error);
        showNotification({ message: 'Could not generate AI replies.', type: 'error' });
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (isOutside24HourWindow) {
      // If outside window, just fill the text box to allow tag selection
      setText(suggestion);
    } else {
      // If inside window, send immediately for efficiency, bypassing the undo delay
      onSendMessage(suggestion, null);
      setSuggestions([]);
      setText('');
    }
  };

  const handleCannedResponseSelect = (response: CannedResponse) => {
    // Replaces the input text with the canned response, rather than appending.
    // This provides a more predictable user experience for "populating" the input.
    setText(response.text);
    setShowCannedResponses(false);
  }

  return (
    <div className="relative flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700/50">
       { showCannedResponses && (
            <CannedResponsesPopover 
                responses={MOCK_CANNED_RESPONSES}
                onSelect={handleCannedResponseSelect}
                onClose={() => setShowCannedResponses(false)}
            />
        )}
       {pendingSend ? (
        <div className="flex items-center justify-between h-[42px] animate-pulse">
          <span className="text-slate-500 dark:text-slate-400">Sending...</span>
          <button
            onClick={handleUndo}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900"
          >
            Undo
          </button>
        </div>
      ) : (
        <>
            {isOutside24HourWindow && (
                <div className="mb-2">
                    <TagSelector selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                </div>
            )}
            {suggestions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(s)} className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900">
                            {s}
                        </button>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => showNotification({ message: 'File attachment is not implemented in this prototype.', type: 'info' })}
                  className="p-2 self-end mb-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <PaperclipIcon />
                </button>
                <div className="relative flex-grow">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 rounded-2xl py-2 pl-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
                        style={{ maxHeight: '120px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                    <div className="absolute right-2 bottom-1.5 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowCannedResponses(!showCannedResponses)}
                            className={`p-2 rounded-md transition-colors ${
                                showCannedResponses
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title="Insert Canned Response"
                            >
                            <BookmarkIcon />
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateReplies}
                            disabled={isGenerating}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generate Smart Replies with AI"
                            >
                            <SparklesIcon />
                            {isGenerating && <div className="absolute inset-0 rounded-full bg-black/20 animate-pulse"></div>}
                        </button>
                    </div>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50 flex-shrink-0" disabled={!text.trim()}>
                    <SendIcon />
                </button>
            </form>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-2 px-4">
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{isOutside24HourWindow ? 'Message tag is required' : ''}</span>
                <span className={text.length > MAX_MESSAGE_LENGTH ? 'font-bold text-red-500' : ''}>{text.length} / {MAX_MESSAGE_LENGTH}</span>
            </div>
        </>
       )}
    </div>
  );
};

export default MessageInput;
