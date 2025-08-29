import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message, Agent } from '../types';
import MessageComponent from './Message';
import MessageInput from './MessageInput';
import UserInfoPanel from './UserInfoPanel';
import { useNotification } from '../contexts/NotificationContext';
import SkeletonLoader from './SkeletonLoader';

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 justify-start">
        <div className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    </div>
);


interface ChatWindowProps {
  conversation: Conversation | undefined;
  messages: Message[];
  agents: Agent[];
  onSendMessage: (conversationId: string, text: string, tag: string | null) => void;
  loading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, agents, onSendMessage, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [assignedAgent, setAssignedAgent] = useState<Agent | null | undefined>(null);
  const { showNotification } = useNotification();
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    if (conversation) {
        setAssignedAgent(agents.find(a => a.id === conversation.assignedAgentId));
    }
  }, [conversation, agents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);
  
  // Simulate bot reply
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].direction === 'out') {
        setIsBotTyping(true);
        const timer = setTimeout(() => {
            setIsBotTyping(false);
            // In a real app, this would be a new message from a webhook
        }, 1500 + Math.random() * 1000);
        return () => clearTimeout(timer);
    }
  }, [messages]);
  
  if (!conversation) {
    return (
      <main className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-500">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="mt-2 text-lg font-medium">Select a conversation</h2>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-600">Choose a conversation from the left panel to start chatting.</p>
        </div>
      </main>
    );
  }

  const handleAssignAgent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agent = agents.find(a => a.id === e.target.value);
    setAssignedAgent(agent);
    showNotification({ message: `Conversation assigned to ${agent?.name || 'Unassigned'}.`, type: 'info' });
  };

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700/50 h-16">
        <div>
          <h2 className="font-bold text-lg">{conversation.userProfile.name}</h2>
        </div>
        <div>
          <select 
            value={assignedAgent?.id || ''} 
            onChange={handleAssignAgent}
            className="text-sm bg-slate-100 dark:bg-slate-800 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
                <SkeletonLoader type="messages" />
            ) : (
                <>
                    {messages.map((msg) => (
                        <MessageComponent key={msg.id} message={msg} />
                    ))}
                    {isBotTyping && <TypingIndicator />}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
        <UserInfoPanel userProfile={conversation.userProfile} />
      </div>

      {/* Input Area */}
      <MessageInput
        conversation={conversation}
        onSendMessage={(text, tag) => onSendMessage(conversation.id, text, tag)}
      />
    </main>
  );
};

export default ChatWindow;