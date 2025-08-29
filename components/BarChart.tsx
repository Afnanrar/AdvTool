import React, { useState } from 'react';

interface ChartData {
    name: string;
    value: number;
}

interface BarChartProps {
    data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, value: number, name: string } | null>(null);

    const chartHeight = 256;
    const chartWidth = 1000; // Using a fixed internal width for scaling
    const barPadding = 15;
    const barWidth = (chartWidth - barPadding * (data.length + 1)) / data.length;
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" preserveAspectRatio="none">
                {data.map((d, i) => {
                    const barHeight = (d.value / maxValue) * chartHeight * 0.9; // Use 90% of height for headroom
                    const x = barPadding + i * (barWidth + barPadding);
                    const y = chartHeight - barHeight;

                    return (
                        <g key={d.name}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                className="fill-blue-500 hover:fill-blue-400 transition-colors"
                                rx="4"
                                onMouseMove={(e) => {
                                    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                    if(svgRect) {
                                       setTooltip({
                                            x: e.clientX - svgRect.left,
                                            y: e.clientY - svgRect.top - 10,
                                            value: d.value,
                                            name: d.name
                                        });
                                    }
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight - 5}
                                textAnchor="middle"
                                className="fill-current text-slate-500 dark:text-slate-400 text-xs"
                                style={{ fontSize: '30px' }} // Font size in SVG coordinate system
                            >
                                {d.name}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {tooltip && (
                <div
                    className="absolute p-2 text-xs bg-slate-800 text-white rounded-md shadow-lg pointer-events-none"
                    style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: 'translate(-50%, -100%)' }}
                >
                   <div><strong>{tooltip.name}</strong>: {tooltip.value} users</div>
                </div>
            )}
        </div>
    );
};

export default BarChart;