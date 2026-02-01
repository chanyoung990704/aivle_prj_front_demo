"use client";

import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { DashboardMetricProps } from "@/types/dashboard";

const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-paper/95 backdrop-blur-sm border border-paper-border p-4 rounded-xl shadow-soft">
                <p className="font-serif font-medium text-ink mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-ink-soft">
                            {entry.name === "actualValue" ? "실제값 (Actual)" : "예측값 (Predict)"}:
                        </span>
                        <span className="font-bold tabular-nums text-ink">
                            {entry.value?.toLocaleString()} {unit}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function PredictChart({
                                         title,
                                         metricCode,
                                         metricNameKo,
                                         data,
                                         unit = "%",
                                     }: DashboardMetricProps) {
    const lastValue = data[data.length - 1]?.predictValue || data[data.length - 1]?.actualValue || 0;
    const isPositive = lastValue > 0;

    return (
        <div className="bg-paper rounded-3xl p-6 border border-paper-border shadow-card hover:shadow-glow transition-shadow duration-300">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-paper-light px-3 py-1 rounded-full text-xs font-bold text-accent tracking-wide uppercase border border-paper-border">
                            {metricCode}
                        </span>
                        <h3 className="font-serif text-xl text-ink font-medium">
                            {metricNameKo}
                        </h3>
                    </div>
                    <p className="text-ink-soft text-sm font-sans">
                        Historical Data & AI Prediction
                    </p>
                </div>

                <div className="text-right">
                    <div className={`flex items-center gap-1 font-bold text-lg ${isPositive ? 'text-accent-secondary' : 'text-accent'}`}>
                        {isPositive ? <TrendingUp size={20} /> : <ArrowUpRight size={20} />}
                        {lastValue.toLocaleString()}{unit}
                    </div>
                    <span className="text-xs text-ink-muted">Latest Forecast</span>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#2a2e37"
                        />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-space-grotesk)' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-space-grotesk)' }}
                            tickFormatter={(value) => `${value}${unit}`}
                        />
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            formatter={(value) => (
                                <span className="text-ink-soft text-sm font-medium ml-1">
                                    {value === "actualValue" ? "Actual" : "AI Predict"}
                                </span>
                            )}
                        />
                        <Line
                            type="monotone"
                            dataKey="actualValue"
                            stroke="#3d7bff"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#3d7bff", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="predictValue"
                            stroke="#ff6b3d"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: "#ff6b3d", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
