import React from 'react';

interface ChartData {
    name: string;
    value: number;
}

interface DoughnutChartProps {
    data: ChartData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>;
    }
    
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulativePercent = 0;

    const segments = data.map((d, i) => {
        const percent = d.value / total;
        const dashArray = 2 * Math.PI * 45; // Circumference of the circle
        const dashOffset = dashArray * (1 - cumulativePercent);
        const strokeDasharray = `${percent * dashArray} ${dashArray * (1 - percent)}`;
        
        const segment = {
            ...d,
            percent: (percent * 100).toFixed(1),
            color: COLORS[i % COLORS.length],
            strokeDasharray,
            dashOffset
        };
        cumulativePercent += percent;
        return segment;
    });

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="-rotate-90">
                    {segments.map((seg, i) => (
                        <circle
                            key={seg.name}
                            cx="50" cy="50" r="45"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="10"
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={seg.dashOffset}
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Total Users</span>
                </div>
            </div>
            <ul className="ml-8 space-y-2 text-sm">
                {segments.map(seg => (
                    <li key={seg.name} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: seg.color }}></span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{seg.name}:</span>
                        <span className="ml-auto text-slate-500 dark:text-slate-400">{seg.value} ({seg.percent}%)</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DoughnutChart;
