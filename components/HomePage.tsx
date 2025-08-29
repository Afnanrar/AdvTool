import React, { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import InboxIcon from './icons/InboxIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import CheckIcon from './icons/CheckIcon';


interface HomePageProps {
    onNavigateToAuth: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}
// --- Data Structures for Content ---
const features = [
    {
        icon: <InboxIcon />,
        title: "Unified Inbox for All Your Pages",
        description: "Tired of switching between multiple Facebook pages? Our Unified Inbox brings all your customer conversations into one powerful, streamlined view. Respond faster, stay organized, and deliver exceptional support without the chaos.",
        benefits: [
            "Centralized Communication: Never miss a message again. Connect unlimited Facebook pages and manage every conversation from a single, intuitive dashboard.",
            "AI-Powered Smart Replies: Generate context-aware reply suggestions with a single click to answer common questions instantly.",
            "CRM-like User Info: See the full picture. Every conversation is enriched with customer history, private agent notes, and labels, turning your inbox into a lightweight CRM."
        ],
        mockup: (
            <svg viewBox="0 0 500 375" className="rounded-lg bg-white dark:bg-slate-900">
              <rect x="0" y="0" width="150" height="375" className="fill-slate-50 dark:fill-slate-800" />
              <rect x="10" y="10" width="130" height="50" rx="4" className="fill-blue-500/10" />
              <rect x="20" y="20" width="30" height="30" rx="15" className="fill-slate-300 dark:fill-slate-600" />
              <rect x="60" y="25" width="70" height="8" rx="2" className="fill-blue-500/50" />
              <rect x="60" y="40" width="50" height="6" rx="2" className="fill-slate-300 dark:fill-slate-600" />
              <rect x="10" y="70" width="130" height="50" rx="4" className="fill-slate-200/50 dark:fill-slate-700/50" />
              <rect x="20" y="80" width="30" height="30" rx="15" className="fill-slate-300 dark:fill-slate-600" />
              <rect x="60" y="85" width="70" height="8" rx="2" className="fill-slate-400 dark:fill-slate-500" />
              <rect x="60" y="100" width="60" height="6" rx="2" className="fill-slate-300 dark:fill-slate-600" />
              <rect x="150" y="0" width="350" height="375" className="fill-white dark:fill-slate-900" />
              <rect x="160" y="10" width="330" height="40" rx="4" className="fill-slate-50 dark:fill-slate-800" />
              <rect x="170" y="70" width="200" height="40" rx="8" className="fill-slate-200 dark:fill-slate-700" />
              <rect x="280" y="120" width="200" height="50" rx="8" className="fill-blue-600" />
              <rect x="170" y="180" width="150" height="30" rx="8" className="fill-slate-200 dark:fill-slate-700" />
              <rect x="160" y="325" width="330" height="40" rx="8" className="fill-slate-100 dark:fill-slate-800" />
            </svg>
        )
    },
    {
        icon: <MegaphoneIcon />,
        title: "Broadcasts That Convert",
        description: "Engage your audience at scale. Whether you're announcing a new product or sending a critical update, our broadcast tool lets you reach thousands of subscribers directly in their Messenger inbox. We make it simple to stay compliant with Facebook's policies.",
        benefits: [
            "Schedule Campaigns: Plan ahead, execute flawlessly. Compose your messages in advance and schedule them to be delivered at the optimal time for your audience.",
            "Policy Compliant: Broadcast with confidence. The platform automatically detects users outside the 24-hour window and requires the appropriate Message Tag, protecting your page from policy violations.",
            "Track Performance: Get real-time insights into your campaigns with a detailed history view showing delivery progress, total recipients, and send counts."
        ],
        mockup: (
            <svg viewBox="0 0 500 375" className="rounded-lg bg-white dark:bg-slate-900">
                <rect x="10" y="10" width="480" height="355" rx="4" className="fill-slate-50 dark:fill-slate-800" />
                <rect x="30" y="30" width="100" height="10" rx="3" className="fill-slate-400 dark:fill-slate-500" />
                <rect x="30" y="50" width="440" height="30" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                <rect x="30" y="100" width="80" height="10" rx="3" className="fill-slate-400 dark:fill-slate-500" />
                <rect x="30" y="120" width="440" height="120" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                <rect x="30" y="260" width="440" height="50" rx="4" className="fill-yellow-400/10" />
                <rect x="40" y="275" width="120" height="20" rx="4" className="fill-yellow-400/20" />
                <rect x="350" y="325" width="120" height="30" rx="4" className="fill-blue-600" />
            </svg>
        )
    }
];

const testimonials = [
    { name: 'Sarah L.', title: 'E-commerce Manager', quote: 'This tool has been a game-changer for our customer support. We can handle 3x the volume with the same team size.', avatar: 'sarah' },
    { name: 'Mike R.', title: 'Agency Owner', quote: 'The broadcast feature is incredibly powerful for our clients. We\'ve seen a 25% increase in engagement on campaigns we run through this platform.', avatar: 'mike' },
    { name: 'Jessica T.', title: 'Social Media Lead', quote: 'Finally, an inbox that makes sense! Having everything in one place saves me hours every single week. The admin panel is also a lifesaver.', avatar: 'jessica' }
];

const faqs = [
    { title: "Is there a free trial?", content: "Yes! All plans start with a 14-day free trial. No credit card is required to get started." },
    { title: "Can I change my plan later?", content: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings." },
    { title: "What happens if I go over my message limit?", content: "We will notify you when you are approaching your limit. You can choose to upgrade your plan or purchase additional message packs." },
    { title: "Is this tool compliant with Facebook's policies?", content: "Yes, our platform is built from the ground up to be fully compliant with the Facebook Messenger Platform policies, including the 24-hour window and message tags." }
];

const pricingTiers = [
    { name: "Starter", price: "$25", messages: "800,000", features: ['2 Facebook Pages', 'Unified Inbox', 'Basic Broadcasts', 'Email Support'] },
    { name: "Growth", price: "$50", messages: "2,000,000", features: ['5 Facebook Pages', 'Advanced Broadcasts', 'User Labeling', 'AI Smart Replies', 'Priority Support'], primary: true, popular: true },
    { name: "Scale", price: "$250", messages: "7,000,000", features: ['Unlimited Pages', 'Massive Labeling', 'Advanced Admin Panel', 'Dedicated Account Manager'] }
];

// --- Sub-components ---
const PricingTier: React.FC<{name: string, price: string, messages: string, features: string[], onNavigateToAuth: () => void, primary?: boolean, popular?: boolean}> = 
({ name, price, messages, features, onNavigateToAuth, primary=false, popular=false}) => (
    <div className={`relative p-8 rounded-lg border ${primary ? 'border-blue-500 bg-blue-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'}`}>
        {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>}
        <h3 className={`font-bold text-lg ${primary ? 'text-blue-500' : 'text-slate-800 dark:text-slate-100'}`}>{name}</h3>
        <p className="text-3xl font-bold mt-4">{price}<span className="text-base font-normal text-slate-500 dark:text-slate-400">/mo</span></p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{messages} messages</p>
        <ul className="mt-6 space-y-3 text-sm">
            {features.map(f => <li key={f} className="flex items-start"><div className="flex-shrink-0 w-5 h-5 mr-2 text-green-500"><CheckIcon /></div> {f}</li>)}
        </ul>
        <button 
            onClick={onNavigateToAuth}
            className={`w-full mt-8 py-3 px-4 rounded-md font-semibold text-sm transition-colors ${primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
            Get Started
        </button>
    </div>
);

const FaqItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left font-semibold text-slate-800 dark:text-slate-100 flex justify-between items-center"
                aria-expanded={isOpen}
            >
                {title}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                <p className="p-4 pt-0 text-slate-600 dark:text-slate-400">{children}</p>
            </div>
        </div>
    );
};

// Hook for scroll animations
const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));
        
        // Add CSS for the animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .scroll-animate {
                opacity: 0;
            }
            .animate-fade-in {
                animation: fadeIn 0.7s ease-out forwards;
            }
        `;
        document.head.appendChild(style);

        return () => {
            elements.forEach(el => observer.unobserve(el));
            document.head.removeChild(style);
        };
    }, []);
};


const HomePage: React.FC<HomePageProps> = ({ onNavigateToAuth, theme, onToggleTheme }) => {
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    useScrollAnimation();

    useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        if (!targetId) return;

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 64; // Corresponds to h-16 on the scrolled header
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <header className={`fixed top-0 left-0 w-full px-4 sm:px-6 flex justify-between items-center z-20 transition-all duration-300 ${isHeaderScrolled ? 'h-16 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-md' : 'h-20'}`}>
                <div className="flex items-center space-x-2">
                     <div className="bg-blue-600 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl">Messenger Inbox</span>
                </div>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <a href="#features" onClick={handleSmoothScroll} className="hover:text-blue-600 dark:hover:text-blue-400">Features</a>
                    <a href="#testimonials" onClick={handleSmoothScroll} className="hover:text-blue-600 dark:hover:text-blue-400">Testimonials</a>
                    <a href="#pricing" onClick={handleSmoothScroll} className="hover:text-blue-600 dark:hover:text-blue-400">Pricing</a>
                    <a href="#faq" onClick={handleSmoothScroll} className="hover:text-blue-600 dark:hover:text-blue-400">FAQ</a>
                </nav>
                <div className="flex items-center space-x-2">
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    <button onClick={onNavigateToAuth} className="hidden sm:block px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                        Login
                    </button>
                     <button onClick={onNavigateToAuth} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Get Started
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-24 text-center overflow-hidden">
                     <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/0 via-white/50 to-white dark:from-slate-900/0 dark:via-slate-900/50 dark:to-slate-900 -z-10"></div>
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                           Manage All Your Facebook Conversations in <span className="text-blue-600">One Place</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                            A powerful SaaS tool to centralize your Facebook Page inboxes, send bulk messages, and supercharge your customer engagement.
                        </p>
                        <div className="mt-8">
                            <button onClick={onNavigateToAuth} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 text-lg shadow-lg shadow-blue-500/20">
                                Get Started For Free
                            </button>
                        </div>
                        <div className="mt-12 scroll-animate">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-widest">Trusted by teams at</p>
                             <div className="flex justify-center items-center space-x-8 md:space-x-12 grayscale opacity-60 dark:opacity-40 dark:invert">
                                <svg className="h-8" viewBox="0 0 102 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M43.082 2.146h5.833v24.288h-5.833V2.146zm-9.333 1.637c4.667 0 7.834 3.167 7.834 7.833s-3.167 7.833-7.834 7.833-7.833-3.167-7.833-7.833 3.166-7.833 7.833-7.833zm0 12.333c1.944 0 2.861-1.833 2.861-4.5s-.917-4.5-2.861-4.5-2.861 1.833-2.861 4.5.917 4.5 2.861 4.5zM3.444 2.146h5.473l5.138 18.028L19.194 2.146h5.473v24.288h-4.639V8.257l-4.472 16.541h-3.417L7.694 8.257v18.177H3.055V2.146h.389zM57.19 14c0-4.667-3.166-7.833-7.833-7.833-4.667 0-7.833 3.166-7.833 7.833 0 4.667 3.166 7.833 7.833 7.833 4.667 0 7.833-3.166 7.833-7.833zm-12.333 0c0-1.944.917-4.5 2.86-4.5s2.861 2.556 2.861 4.5-.916 4.5-2.86 4.5-2.861-2.556-2.861-4.5zM74.968 2.146h5.833v10.972h.167c.611-2.055 2.528-3.472 4.972-3.472 3.194 0 5.138 2.083 5.138 5.61v13.23h-5.833V16.51c0-2.389-1.083-3.583-2.86-3.583-1.612 0-2.862 1.25-2.862 3.5v10.04h-5.417V2.146h.834zM96.786 14c0-4.667-3.166-7.833-7.833-7.833-4.667 0-7.833 3.166-7.833 7.833 0 4.667 3.166 7.833 7.833 7.833 4.667 0 7.833-3.166 7.833-7.833zm-12.333 0c0-1.944.917-4.5 2.86-4.5s2.861 2.556 2.861 4.5-.916 4.5-2.86 4.5-2.861-2.556-2.861-4.5z"></path></svg>
                                <svg className="h-7" viewBox="0 0 100 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.05 2.148h10.75v4.528H8.4v19.76H3.05v-24.288zM22.95 26.436l-1.61-4.113h-6.61l-1.61 4.114H7.1l7.8-21.78h6.22l7.8 21.78h-6.02zm-6.02-8.54h4.41l-2.2-6.19-2.21 6.19zM42.74 20.323c0 2.228 1.48 3.518 3.6 3.518 1.13 0 2.21-.29 3.16-.83v-4.15c-.95.38-1.84.57-2.73.57-1.06 0-1.61-.39-1.61-1.18V2.148h5.35v11.14c0 3.79-2.02 5.8-5.32 5.8-3.3 0-5.35-2-5.35-5.7V2.148h5.35v18.175zM59.94 14.163c0-4.686-3.16-7.853-7.83-7.853-4.68 0-7.83 3.167-7.83 7.853 0 4.68 3.15 7.85 7.83 7.85s7.83-3.17 7.83-7.85zm-12.33 0c0-1.94.92-4.5 2.86-4.5s2.86 2.56 2.86 4.5-.92 4.5-2.86 4.5-2.86-2.56-2.86-4.5zM77.77 2.148V.198h-5.4v26.24h5.4V16.738h3.5v9.69h5.4V.198h-5.4v13.97h-3.5V2.148zM96.79 14.163c0-4.686-3.16-7.853-7.83-7.853-4.68 0-7.83 3.167-7.83 7.853 0 4.68 3.15 7.85 7.83 7.85s7.83-3.17 7.83-7.85zm-12.33 0c0-1.94.92-4.5 2.86-4.5s2.86 2.56 2.86 4.5-.92 4.5-2.86 4.5-2.86-2.56-2.86-4.5z"></path></svg>
                                <svg className="h-8" viewBox="0 0 88 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.05 2.148h10.75v4.528H8.4v19.76H3.05V2.148zM24.79 21.655c-3.3 0-5.35-2-5.35-5.7V2.148h5.35v13.82c0 1.05.58 1.63 1.61 1.63.92 0 1.84-.2 2.73-.57v4.15c-.95.54-2.03.83-3.16.83-2.12 0-3.6-1.29-3.6-3.52v-2.02h-4.32V2.148h5.35v11.14c0 3.79 2.02 5.8 5.32 5.8 3.3 0 5.35-2 5.35-5.7V2.148h5.35v18.175c0 2.228 1.48 3.518 3.6 3.518 1.13 0 2.21-.29 3.16-.83v-4.15c-.95.38-1.84.57-2.73.57-1.06 0-1.61-.39-1.61-1.18V2.148h5.35v11.14c0 3.79 2.02 5.8 5.32 5.8 3.3 0 5.35-2 5.35-5.7V2.148h5.35v18.175c0 2.228 1.48 3.518 3.6 3.518 1.13 0 2.21-.29 3.16-.83v-4.15c-.95.38-1.84.57-2.73.57-1.06 0-1.61-.39-1.61-1.18V2.148h5.35v11.14c0 3.79 2.02 5.8 5.32 5.8 3.3 0 5.35-2 5.35-5.7V2.148h5.35v18.175c0 2.228 1.48 3.518 3.6 3.518 1.13 0 2.21-.29 3.16-.83v-4.15c-.95.38-1.84.57-2.73.57-1.06 0-1.61-.39-1.61-1.18V2.148h5.35v11.14c0 3.79 2.02 5.8 5.32 5.8 3.3 0 5.35-2 5.35-5.7V2.148h5.35v18.175z"></path></svg>
                            </div>
                        </div>
                        <div className="mt-16 max-w-4xl mx-auto p-2 bg-slate-900/10 dark:bg-white/10 rounded-xl shadow-2xl scroll-animate">
                           <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg">
                             <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-t-md flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                             </div>
                              <svg viewBox="0 0 500 308" className="w-full h-auto rounded-b-lg bg-white dark:bg-slate-900">
                                <rect x="10" y="10" width="130" height="288" rx="4" className="fill-slate-50 dark:fill-slate-800/50" />
                                <rect x="20" y="20" width="30" height="30" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="60" y="25" width="70" height="8" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="60" y="40" width="50" height="6" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="20" y="60" width="110" height="2" rx="1" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="20" y="72" width="30" height="30" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="60" y="77" width="70" height="8" rx="2" className="fill-blue-500/50" />
                                <rect x="60" y="92" width="60" height="6" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="150" y="10" width="340" height="288" rx="4" className="fill-slate-50 dark:fill-slate-800/50" />
                                <rect x="160" y="20" width="320" height="130" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="170" y="120" width="40" height="20" rx="2" className="fill-blue-500/50" />
                                <rect x="220" y="100" width="40" height="40" rx="2" className="fill-blue-500/50" />
                                <rect x="270" y="80" width="40" height="60" rx="2" className="fill-blue-500/50" />
                                <rect x="320" y="110" width="40" height="30" rx="2" className="fill-blue-500/50" />
                                <rect x="370" y="90" width="40" height="50" rx="2" className="fill-blue-500/50" />
                                <rect x="160" y="160" width="155" height="128" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                                <rect x="325" y="160" width="155" height="128" rx="4" className="fill-slate-200 dark:fill-slate-700" />
                              </svg>
                           </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container mx-auto px-4 space-y-20">
                        <div className="text-center mb-12 scroll-animate">
                            <h2 className="text-3xl font-bold">Powerful Features, Simple Interface</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Everything you need to scale your Messenger marketing.</p>
                        </div>
                        
                        {features.map((feature, index) => (
                             <div key={feature.title} className="grid md:grid-cols-2 gap-12 items-center scroll-animate">
                                <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                                    <div className="inline-block p-2 bg-blue-600/10 text-blue-500 rounded-lg">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                                    <ul className="space-y-2">
                                        {feature.benefits.map(benefit => (
                                             <li key={benefit} className="flex items-start"><span className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"><CheckIcon /></span> {benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-2 bg-slate-900/10 dark:bg-white/10 rounded-xl">
                                   <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4">
                                      {feature.mockup}
                                   </div>
                                 </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                 {/* Testimonials Section */}
                <section id="testimonials" className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 scroll-animate">
                            <h2 className="text-3xl font-bold">Loved by Marketers and Support Teams</h2>
                             <p className="mt-2 text-slate-500 dark:text-slate-400">Don't just take our word for it. Here's what our customers say.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                           {testimonials.map((t, index) => (
                                <div key={t.name} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 scroll-animate" style={{animationDelay: `${index * 100}ms`}}>
                                    <p className="text-slate-600 dark:text-slate-300">"{t.quote}"</p>
                                    <div className="flex items-center mt-4">
                                        <img src={`https://picsum.photos/seed/${t.avatar}/40/40`} alt={t.name} className="w-10 h-10 rounded-full"/>
                                        <div className="ml-3">
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{t.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{t.title}</p>
                                        </div>
                                    </div>
                                </div>
                           ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container mx-auto px-4">
                         <div className="text-center mb-12 scroll-animate">
                            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Choose the plan that's right for your business. No hidden fees.</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto scroll-animate">
                           {pricingTiers.map(tier => (
                               <PricingTier key={tier.name} {...tier} onNavigateToAuth={onNavigateToAuth} />
                           ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-24">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="text-center mb-12 scroll-animate">
                            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-4 scroll-animate">
                           {faqs.map(faq => (
                               <FaqItem key={faq.title} title={faq.title}>{faq.content}</FaqItem>
                           ))}
                        </div>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section className="py-24 bg-blue-600">
                     <div className="container mx-auto px-4 text-center scroll-animate">
                        <h2 className="text-3xl font-bold text-white">Ready to Supercharge Your Messenger Marketing?</h2>
                        <p className="mt-4 text-blue-200 max-w-2xl mx-auto">Join hundreds of businesses growing their brand and streamlining their support with Messenger Inbox.</p>
                         <div className="mt-8">
                            <button onClick={onNavigateToAuth} className="px-8 py-3 font-semibold text-blue-600 bg-white rounded-md hover:bg-slate-100 text-lg shadow-lg">
                                Sign Up For Free
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-slate-800/50 py-12">
                <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Messenger Inbox. All rights reserved.</p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-200">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-200">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;