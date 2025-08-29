import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ThemeToggle from '../ThemeToggle';

interface AuthPageProps {
    onLogin: (email: string, pass: string) => Promise<void>;
    onSignup: (name: string, email: string, pass: string) => Promise<void>;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onNavigateHome: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, theme, onToggleTheme, onNavigateHome }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
             <div className="absolute top-4 left-4">
                <button onClick={onNavigateHome} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    &larr; Back to Home
                </button>
            </div>
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-lg inline-block mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        {isLoginView ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-8">
                    {isLoginView ? (
                        <LoginForm onLogin={onLogin} />
                    ) : (
                        <SignupForm onSignup={onSignup} />
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
