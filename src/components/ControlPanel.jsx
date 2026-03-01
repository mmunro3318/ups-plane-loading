// src/components/ControlPanel.jsx
import React from 'react';
import { BOEING_757_SPECS } from '../engine/planeData';
import './ControlPanel.css';

export default function ControlPanel({ onSort, onRegenerate, isSorting, currentScore, macPercent, tailTipMode, onTailTipChange, manifest }) {
    // Determine the color of the score based on how close it is to the optimal MAC
    const deviation = Math.abs(BOEING_757_SPECS.optimalAftCog - macPercent);
    let scoreColorClass = "score-good";
    if (deviation > 5) scoreColorClass = "score-warning";
    if (deviation > 10) scoreColorClass = "score-danger";
    if (Number.isNaN(deviation) || !macPercent) scoreColorClass = "score-neutral";

    const totalVoids = manifest ? BOEING_757_SPECS.positions - manifest.length : 0;
    const canSingle = totalVoids >= BOEING_757_SPECS.tailTipConfig.single.minVoidsRequired;
    const canDouble = totalVoids >= BOEING_757_SPECS.tailTipConfig.double.minVoidsRequired;

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

            <div className="action-buttons">
                <div
                    className="tail-tip-controls"
                    title="Tail-Tip Strategy: Centralizes cargo to prevent tail-tipping during loading. Requires sufficient voids (empty ULD spots). Single forces Pos 1 and 15 empty. Double forces Pos 1, 2, 14, and 15 empty. STRICTLY ENFORCED by the optimizer."
                >
                    <span className="label-text">Tail-Tip Strategy (?)</span>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input type="radio" name="tailTip" value="none" checked={tailTipMode === 'none'} onChange={() => onTailTipChange('none')} disabled={isSorting} />
                            <span className="mono-text">None</span>
                        </label>
                        <label className={`radio-label ${!canSingle ? 'disabled-label' : ''}`} title={!canSingle ? "Requires at least 2 voids on manifest" : ""}>
                            <input type="radio" name="tailTip" value="single" checked={tailTipMode === 'single'} onChange={() => onTailTipChange('single')} disabled={isSorting || !canSingle} />
                            <span className="mono-text">Single</span>
                        </label>
                        <label className={`radio-label ${!canDouble ? 'disabled-label' : ''}`} title={!canDouble ? "Requires at least 4 voids on manifest" : ""}>
                            <input type="radio" name="tailTip" value="double" checked={tailTipMode === 'double'} onChange={() => onTailTipChange('double')} disabled={isSorting || !canDouble} />
                            <span className="mono-text">Double</span>
                        </label>
                    </div>
                </div>

                <button
                    className={`sort-action-btn ${isSorting ? 'sorting' : ''}`}
                    onClick={onSort}
                    disabled={isSorting}
                >
                    {isSorting ? 'OPTIMIZING...' : 'SORT MANIFEST'}
                </button>
                <button
                    className="regen-btn mono-text"
                    onClick={() => onRegenerate('mixed')}
                    disabled={isSorting}
                >
                    REGEN MANIFEST
                </button>
            </div>
        </div>
    );
}
