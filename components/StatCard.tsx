import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change }) => {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className="text-slate-400 dark:text-slate-500">{icon}</div>
            </div>
            <div className="mt-2">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
                {change !== undefined && (
                    <p className={`text-sm mt-1 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="font-semibold mr-1">{isPositive ? '▲' : '▼'} {Math.abs(change)}%</span>
                        <span className="text-slate-400">vs last month</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
