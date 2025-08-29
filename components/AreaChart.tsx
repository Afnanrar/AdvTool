import React, { useState, useMemo } from 'react';

interface ChartData {
    name: string;
    value: number;
}

interface AreaChartProps {
    data: ChartData[];
}

const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, value: number, name: string } | null>(null);

    const width = 500;
    const height = 150;
    const padding = 20;

    const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    const yScale = (value: number) => height - padding - (value / maxValue) * (height - 2 * padding);

    const linePath = useMemo(() => 
        data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ')
    , [data, xScale, yScale]);

    const areaPath = useMemo(() => 
        `${linePath} L ${xScale(data.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`
    , [linePath, data.length, xScale, height, padding]);

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const index = Math.round(((x - padding) / (width - 2 * padding)) * (data.length - 1));
        
        if (index >= 0 && index < data.length) {
            const point = data[index];
            setTooltip({
                x: xScale(index),
                y: yScale(point.value),
                value: point.value,
                name: point.name
            });
        }
    };

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" className="stop-color-blue-500" stopOpacity={0.4}/>
                        <stop offset="100%" className="stop-color-blue-500" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGradient)" className="stroke-none"/>
                <path d={linePath} fill="none" strokeWidth="2" className="stroke-blue-500"/>

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text key={d.name} x={xScale(i)} y={height - 5} textAnchor="middle" className="text-[8px] fill-slate-500 dark:fill-slate-400">
                        {d.name}
                    </text>
                ))}

                {/* Interactive Tooltip Elements */}
                {tooltip && (
                    <g>
                        <line x1={tooltip.x} y1={padding} x2={tooltip.x} y2={height - padding} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="3,3"/>
                        <circle cx={tooltip.x} cy={tooltip.y} r="4" className="fill-blue-500 stroke-white dark:stroke-slate-900" strokeWidth="2"/>
                    </g>
                )}

                {/* Transparent rectangle for capturing mouse events */}
                <rect 
                    x="0" y="0" width={width} height={height} 
                    fill="transparent"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                />
            </svg>
            
            {tooltip && (
                <div 
                    className="absolute p-2 text-xs bg-slate-800 text-white rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: `${(tooltip.x / width) * 100}%`, top: `${(tooltip.y / height) * 100}%`, marginTop: '-8px' }}
                >
                    <div className="font-bold">{tooltip.name}</div>
                    <div>{tooltip.value} New Users</div>
                </div>
            )}
            <style>{`.stop-color-blue-500 { stop-color: #3b82f6; }`}</style>
        </div>
    );
};

export default AreaChart;