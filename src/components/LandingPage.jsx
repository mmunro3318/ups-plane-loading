// src/components/LandingPage.jsx
import React from 'react';
import './LandingPage.css';

const PLANES = [
    { id: 'B757-200F', name: 'Boeing 757', active: true, image: '/assets/757-collectible-card.png', description: '15 Positions. Optimal for mid-range, medium-capacity routes.' },
    { id: 'B767-300F', name: 'Boeing 767', active: false, image: '/assets/767-collectible-card.png', description: '24 Positions. Wide-body, high-capacity long haul.' },
    { id: 'A300-600F', name: 'Airbus A300', active: false, image: '/assets/A300-collectible-card.png', description: '21 Positions. Versatile regional heavy cargo.' },
    { id: 'MD11F', name: 'MD-11', active: false, image: '/assets/MD11-collectible-card.png', description: 'Heavy-lift intercontinental freighter.' },
];

export default function LandingPage({ onSelectPlane, onLearnMore }) {
    return (
        <div className="landing-layout">
            <header className="app-header">
                <h1 className="cyber-title">UPS <span>LoadBalancer</span></h1>
                <div className="header-status mono-text">
                    <span className="dot active"></span> SYSTEM ONLINE // SELECT AIRCRAFT
                </div>
            </header>

            <main className="landing-main">
                <h2 className="landing-subtitle label-text" style={{ marginTop: '0', marginBottom: '20px' }}>EDUCATIONAL RESOURCES</h2>

                <div className="plane-grid-container" style={{ marginBottom: '40px', justifyContent: 'center' }}>
                    <div
                        className="plane-card glass-panel active-sim"
                        onClick={onLearnMore}
                        title="Learn more about load balancing and simulated annealing"
                    >
                        <div className="plane-card-image">
                            <img src="/assets/digital-sword.png" alt="Educational Resources" />
                        </div>
                    </div>
                </div>

                <h2 className="landing-subtitle label-text">INITIALIZE ROUTING OPTIMIZATION</h2>

                <div className="plane-grid-container">
                    {PLANES.map(plane => (
                        <div
                            key={plane.id}
                            className={`plane-card glass-panel ${plane.active ? 'active-sim' : 'disabled-sim'}`}
                            onClick={() => plane.active && onSelectPlane(plane.id)}
                            title={plane.active ? `Initialize ${plane.name}` : `${plane.name} - Module Offline`}
                        >
                            <div className="plane-card-image">
                                <img src={plane.image} alt={plane.name} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
