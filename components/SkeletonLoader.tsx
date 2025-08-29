import React from 'react';

interface SkeletonLoaderProps {
    type: 'conversation' | 'messages' | 'pageCards';
}

const ConversationSkeleton: React.FC = () => (
    <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50 animate-pulse">
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mr-3"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

const MessageSkeleton: React.FC<{ isOutgoing?: boolean }> = ({ isOutgoing }) => (
    <div className={`flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className={`max-w-md lg:max-w-xl px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700`}>
        <div className="space-y-2">
            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-48"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
        </div>
      </div>
    </div>
);

const PageCardSkeleton: React.FC = () => (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-5 animate-pulse">
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-md bg-slate-200 dark:bg-slate-700 mr-4"></div>
            <div className="w-2/3 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-slate-200 dark:border-slate-700/50">
            <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
            </div>
             <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
    </div>
);


const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
    if (type === 'conversation') {
        return (
            <div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <ConversationSkeleton key={i} />
                ))}
            </div>
        );
    }
    
    if (type === 'messages') {
        return (
             <div className="p-4 space-y-4">
                <MessageSkeleton />
                <MessageSkeleton isOutgoing />
                <MessageSkeleton />
             </div>
        )
    }

    if (type === 'pageCards') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <PageCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    return null;
};

export default SkeletonLoader;