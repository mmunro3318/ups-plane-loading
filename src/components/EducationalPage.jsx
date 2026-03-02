import React, { useState } from 'react';
import './EducationalPage.css';

export default function EducationalPage({ onBack }) {
    const [activeTab, setActiveTab] = useState('problem');

    return (
        <div className="edu-layout">
            <header className="app-header">
                <h1 className="cyber-title" style={{ cursor: 'pointer' }} onClick={onBack}>
                    UPS <span>LoadBalancer</span>
                </h1>
                <div className="header-status mono-text">
                    <span className="dot active"></span> SYSTEM ONLINE // KNOWLEDGE BASE
                </div>
            </header>

            <main className="edu-main">
                <div className="edu-navigation glass-panel">
                    <button
                        className={`edu-tab-btn mono-text ${activeTab === 'problem' ? 'active' : ''}`}
                        onClick={() => setActiveTab('problem')}
                    >
                        THE PROBLEM
                    </button>
                    <button
                        className={`edu-tab-btn mono-text ${activeTab === 'algorithm' ? 'active' : ''}`}
                        onClick={() => setActiveTab('algorithm')}
                    >
                        THE ALGORITHM
                    </button>
                    <button className="edu-back-btn mono-text" onClick={onBack}>
                        RETURN TO HUB
                    </button>
                </div>

                <div className="edu-content-area glass-panel">
                    {activeTab === 'problem' && (
                        <div className="edu-section fade-in">
                            <h2 className="edu-title cyber-title">Centro-Gravity Dynamics</h2>

                            <div className="edu-split-view">
                                <div className="edu-text">
                                    <h3>What is MAC?</h3>
                                    <p>
                                        In aviation, physical balance is a matter of life and death. The <strong>Mean Aerodynamic Chord (MAC)</strong> is the theoretical wing width that represents the average lift of an aircraft. Pilots calculate the aircraft's <strong>Center of Gravity (CG)</strong> as a percentage of this MAC.
                                    </p>
                                    <p>
                                        For our Boeing 757-200F, the optimal fuel-efficiency target is <strong>27% MAC</strong>. If the CG is too far forward (nose heavy), the plane struggles to generate enough lift, reducing fuel efficiency. If it's too far aft (tail heavy), the plane becomes dangerously unstable.
                                    </p>

                                    <h3>Structural Constraints</h3>
                                    <p>
                                        It's not just about average balance; structural integrity must be maintained:
                                    </p>
                                    <ul>
                                        <li><strong>Position Maximums:</strong> A single position cannot exceed structural floor limits (e.g. 6,700 lbs).</li>
                                        <li><strong>Tail-Tipping Risk:</strong> While loading on the ground, placing heavy cargo in the aft (rear) before the nose can literally tip the plane onto its tail! We enforce strict void dependencies (e.g. Position 1 must have cargo if Position 15 does).</li>
                                        <li><strong>Material Segregation:</strong> Hazardous materials require physical separation from crews, animals, or certain other chemicals.</li>
                                    </ul>
                                </div>
                                <div className="edu-visual">
                                    <img src="/assets/mac-balance-scale.png" alt="Holographic Balance Scale showing optimal MAC" className="edu-image" />
                                    <p className="caption mono-text">Fig 1. Optimal load distribution must perfectly offset moments across the fulcrum of the datum line.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'algorithm' && (
                        <div className="edu-section fade-in">
                            <h2 className="edu-title cyber-title">Simulated Annealing</h2>

                            <div className="edu-split-view">
                                <div className="edu-visual">
                                    <img src="/assets/sim-annealing-infographic.png" alt="Simulated Annealing Infographic" className="edu-image" />
                                    <p className="caption mono-text">Fig 2. Just like tempering steel, the algorithm cools from a chaotic fluid state to an optimal rigid structure.</p>
                                </div>
                                <div className="edu-text">
                                    <h3>Metallurgical Mathematics</h3>
                                    <p>
                                        With 15 positions and dozens of ULDs, calculating every possible load combination would take millions of years for a computer to brute-force. Enter <strong>Simulated Annealing</strong>.
                                    </p>
                                    <p>
                                        Inspired by metallurgy, where metals are heated to a chaotic state and slowly cooled to form perfect, strong crystalline structures, our algorithm does the same with data:
                                    </p>
                                    <ul>
                                        <li><strong>High Temperature:</strong> At the start of the sort, the algorithm runs "Hot." It makes completely random swaps, happily accepting "worse" load orders. This prevents it from getting stuck in a local valley (a visually decent load order that isn't actually optimal).</li>
                                        <li><strong>Cooling Rate:</strong> Over thousands of iterations, the temperature geometrically decays (e.g. T_next = T_current * 0.999).</li>
                                        <li><strong>Freezing:</strong> As the math "Cools," the algorithm becomes infinitely strict, only accepting swaps that strictly improve the score, carving out the absolute optimal load balance.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
