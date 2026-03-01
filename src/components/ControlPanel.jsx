// src/components/ControlPanel.jsx
import React, { useState } from 'react';
import { BOEING_757_SPECS } from '../engine/planeData';
import './ControlPanel.css';

export default function ControlPanel({ onSort, onRegenerate, isSorting, currentScore, macPercent, tailTipMode, onTailTipChange, manifest, algoParams, setAlgoParams }) {
    const [isParamsOpen, setIsParamsOpen] = useState(false);
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

            <div className="algo-params-section">
                <button
                    className="params-toggle-btn mono-text"
                    onClick={() => setIsParamsOpen(!isParamsOpen)}
                >
                    ALGO PARAMETERS {isParamsOpen ? '▲' : '▼'}
                </button>
                {isParamsOpen && algoParams && (
                    <div className="params-card">
                        <div className="param-group">
                            <label className="param-label mono-text" title="Initial Temperature: Higher means it will explore more and accept worse states initially.">
                                Temp: {algoParams.temperature}
                            </label>
                            <input
                                type="range"
                                min="1" max="500" step="1"
                                value={algoParams.temperature}
                                onChange={(e) => setAlgoParams({ ...algoParams, temperature: parseFloat(e.target.value) })}
                                disabled={isSorting}
                            />
                        </div>
                        <div className="param-group">
                            <label className="param-label mono-text" title="Cooling Rate: How fast it drops temperature. Closer to 1 cools slower (longer search).">
                                Cool Rate: {algoParams.coolingRate}
                            </label>
                            <input
                                type="range"
                                min="0.8" max="0.999" step="0.001"
                                value={algoParams.coolingRate}
                                onChange={(e) => setAlgoParams({ ...algoParams, coolingRate: parseFloat(e.target.value) })}
                                disabled={isSorting}
                            />
                        </div>
                        <div className="param-group">
                            <label className="param-label mono-text" title="Max Iterations: Maximum number of swaps it will attempt.">
                                Iters: {algoParams.maxIterations}
                            </label>
                            <input
                                type="range"
                                min="1000" max="50000" step="1000"
                                value={algoParams.maxIterations}
                                onChange={(e) => setAlgoParams({ ...algoParams, maxIterations: parseInt(e.target.value) })}
                                disabled={isSorting}
                            />
                        </div>
                        <div className="param-group checkbox-group">
                            <label className="radio-label">
                                <input
                                    type="checkbox"
                                    checked={algoParams.greedySeed}
                                    onChange={(e) => setAlgoParams({ ...algoParams, greedySeed: e.target.checked })}
                                    disabled={isSorting}
                                />
                                <span className="mono-text" title="Greedy Seed: Starts sorting from a heuristic rather than a random layout.">Greedy Seed</span>
                            </label>
                        </div>
                        <button
                            className="reset-params-btn mono-text"
                            onClick={() => setAlgoParams({ temperature: 100.0, coolingRate: 0.995, maxIterations: 10000, greedySeed: true })}
                            disabled={isSorting}
                        >
                            RESET PARAMETERS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
