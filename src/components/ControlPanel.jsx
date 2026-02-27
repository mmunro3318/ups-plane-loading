// src/components/ControlPanel.jsx
import React from 'react';
import { BOEING_757_SPECS } from '../engine/planeData';
import './ControlPanel.css';

export default function ControlPanel({ onSort, isSorting, currentScore, macPercent }) {
    // Determine the color of the score based on how close it is to the optimal MAC
    const deviation = Math.abs(BOEING_757_SPECS.optimalAftCog - macPercent);
    let scoreColorClass = "score-good";
    if (deviation > 5) scoreColorClass = "score-warning";
    if (deviation > 10) scoreColorClass = "score-danger";
    if (Number.isNaN(deviation) || !macPercent) scoreColorClass = "score-neutral";

    return (
        <div className="control-panel glass-panel">
            <div className="metrics-area">
                <div className="metric-group">
                    <span className="label-text">Current %MAC</span>
                    <span className={`metric-value mono-text ${scoreColorClass}`}>
                        {macPercent ? macPercent.toFixed(2) + '%' : '--'}
                    </span>
                </div>
                <div className="metric-group">
                    <span className="label-text">Target %MAC</span>
                    <span className="metric-value mono-text trace-text">
                        {BOEING_757_SPECS.optimalAftCog.toFixed(2)}%
                    </span>
                </div>
            </div>

            <button
                className={`sort-action-btn ${isSorting ? 'sorting' : ''}`}
                onClick={onSort}
                disabled={isSorting}
            >
                {isSorting ? 'OPTIMIZING...' : 'SORT MANIFEST'}
            </button>
        </div>
    );
}
