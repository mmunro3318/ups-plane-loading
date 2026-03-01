import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ScorePlot.css';

// Transform our parallel histories into a format Recharts likes
function formatData(greedyHistory, randomHistory) {
    if (!greedyHistory || !randomHistory) return [];

    // Assuming both histories are same length (same maxIter, sampled similarly)
    // If not, we map by iteration
    const dataMap = new Map();

    greedyHistory.forEach(point => {
        dataMap.set(point.iteration, {
            iteration: point.iteration,
            GreedyScore: point.currentScore,
            GreedyBest: point.bestScore,
            GreedyTemp: point.temperature
        });
    });

    randomHistory.forEach(point => {
        const existing = dataMap.get(point.iteration) || { iteration: point.iteration };
        dataMap.set(point.iteration, {
            ...existing,
            RandomScore: point.currentScore,
            RandomBest: point.bestScore,
            RandomTemp: point.temperature
        });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.iteration - b.iteration);
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip glass-panel" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '4px' }}>
                <p className="label" style={{ color: '#aaa', marginBottom: '5px', fontFamily: 'monospace' }}>Iteration: {label}</p>
                <p style={{ color: '#00E5FF', margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
                    Greedy: {data.GreedyScore?.toFixed(3)} (Best: {data.GreedyBest?.toFixed(3)})
                </p>
                <p style={{ color: '#00E5FF', margin: 0, fontFamily: 'monospace', fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
                    Temp: {data.GreedyTemp?.toFixed(2)}
                </p>
                <p style={{ color: '#FF5722', margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
                    Random: {data.RandomScore?.toFixed(3)} (Best: {data.RandomBest?.toFixed(3)})
                </p>
                <p style={{ color: '#FF5722', margin: 0, fontFamily: 'monospace', fontSize: '12px', opacity: 0.7 }}>
                    Temp: {data.RandomTemp?.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

export default function ScorePlot({ greedyHistory, randomHistory, onClose }) {
    const data = useMemo(() => formatData(greedyHistory, randomHistory), [greedyHistory, randomHistory]);

    if (!data || data.length === 0) {
        return null;
    }

    // To keep the chart readable, we might want to cap the Y-Axis if penalties caused massive spikes
    // Recharts 'dataMin' / 'dataMax' usually handles this, but a custom domain helps with outlier penalties.
    // The 'dataMax' on these penalties is ~50k-100k+, which shrinks the actual nuance. We'll let it auto-scale for now.

    return (
        <div className="score-plot-overlay">
            <div className="score-plot-modal glass-panel">
                <div className="score-plot-header">
                    <h2 className="cyber-title">Optimization Profiler</h2>
                    <button className="close-plot-btn" onClick={onClose}>✕</button>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                            <XAxis
                                dataKey="iteration"
                                stroke="rgba(255,255,255,0.5)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                label={{ value: 'Iterations', position: 'insideBottomRight', offset: -10, fill: 'rgba(0, 229, 255, 0.7)' }}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.5)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                label={{ value: 'Score (Lower is Better)', angle: -90, position: 'insideLeft', fill: 'rgba(0, 229, 255, 0.7)' }}
                                domain={[0, 4.0]}
                                allowDataOverflow={true}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {/* Random Seed Lines */}
                            <Line type="monotone" dataKey="RandomScore" stroke="#FF5722" dot={false} strokeOpacity={0.3} strokeWidth={1} name="Random (Current)" />
                            <Line type="monotone" dataKey="RandomBest" stroke="#FF5722" dot={false} strokeWidth={2} name="Random (Best)" />

                            {/* Greedy Seed Lines */}
                            <Line type="monotone" dataKey="GreedyScore" stroke="#00E5FF" dot={false} strokeOpacity={0.3} strokeWidth={1} name="Greedy (Current)" />
                            <Line type="monotone" dataKey="GreedyBest" stroke="#00E5FF" dot={false} strokeWidth={2} name="Greedy (Best)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="profiler-stats mono-text">
                    <div><strong>Greedy Seed Final:</strong> {data[data.length - 1]?.GreedyBest?.toFixed(2) || 'N/A'}</div>
                    <div><strong>Random Seed Final:</strong> {data[data.length - 1]?.RandomBest?.toFixed(2) || 'N/A'}</div>
                </div>
            </div>
        </div>
    );
}
