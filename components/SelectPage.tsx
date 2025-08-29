import React from 'react';
import { FacebookPage } from '../types';

interface SelectPageProps {
  pages: FacebookPage[];
  onSelectPage: (pageId: string) => void;
}

const SelectPage: React.FC<SelectPageProps> = ({ pages, onSelectPage }) => {
  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="bg-blue-500 p-3 rounded-lg inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome to Messenger Inbox</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Please select a page to continue</p>
      </div>
      
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {pages.length > 0 ? (
                    pages.map(page => (
                        <li key={page.id}>
                            <button 
                                onClick={() => onSelectPage(page.id)}
                                className="w-full flex items-center p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <img src={page.avatarUrl} alt={page.name} className="w-10 h-10 rounded-md mr-4" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{page.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </li>
                    ))
                ) : (
                     <li className="p-4 text-center text-slate-500 dark:text-slate-400">Loading pages...</li>
                )}
            </ul>
        </div>
      </div>
       <footer className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            You can switch pages anytime from the header.
        </footer>
    </div>
  );
};

export default SelectPage;