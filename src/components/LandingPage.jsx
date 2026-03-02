// src/components/LandingPage.jsx
import React, { useState, useRef } from 'react';
import './LandingPage.css';

const PLANES = [
    { id: 'B757-200F', name: 'Boeing 757', active: true, image: '/assets/757-collectible-card.png', description: '15 Positions. Optimal for mid-range, medium-capacity routes.' },
    { id: 'B767-300F', name: 'Boeing 767', active: false, image: '/assets/767-collectible-card.png', description: '24 Positions. Wide-body, high-capacity long haul.' },
    { id: 'A300-600F', name: 'Airbus A300', active: false, image: '/assets/A300-collectible-card.png', description: '21 Positions. Versatile regional heavy cargo.' },
    { id: 'MD11F', name: 'MD-11', active: false, image: '/assets/MD11-collectible-card.png', description: 'Heavy-lift intercontinental freighter.' },
];

export default function LandingPage({ onSelectPlane, onLearnMore }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth * 0.8; // Approximate card width
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const handleScroll = (e) => {
        const container = e.target;
        const centerPosition = container.scrollLeft + container.clientWidth / 2;

        let minDiff = Infinity;
        let visibleIndex = 0;

        Array.from(container.children).forEach((child, index) => {
            const childCenter = child.offsetLeft + child.offsetWidth / 2 - container.offsetLeft;
            const diff = Math.abs(centerPosition - childCenter);
            if (diff < minDiff) {
                minDiff = diff;
                visibleIndex = index;
            }
        });

        setActiveIndex(visibleIndex);
    };

    return (
        <div className="landing-layout">
            <header className="app-header">
                <h1 className="cyber-title">UPS <span>LoadBalancer</span></h1>
            </header>

            <div className="top-nav-bar glass-panel">
                <button className="nav-btn active">
                    <span className="nav-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L2.5 9l8.1 4.5-3.6 3.6-3.3-.6c-.4-.1-.8.1-1 .5L1.5 19l6 1.5 1.5 6c.4-.2.6-.6.5-1l-.6-3.3 3.6-3.6 4.5 8.1c.4.2.8.2.9-.3l2.2-1.2c.4-.2.7-.6.6-1.1z" />
                        </svg>
                    </span>
                    AIRCRAFT
                </button>
                <button className="nav-btn" onClick={onLearnMore}>
                    <span className="nav-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </span>
                    EDUCATION
                </button>
            </div>

            <main className="landing-main">
                <h2 className="landing-subtitle label-text">INITIALIZE ROUTING OPTIMIZATION</h2>

                <div className="carousel-container" style={{ position: 'relative' }}>
                    <button className="carousel-arrow left-arrow" onClick={() => scrollCarousel('left')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <div className="plane-carousel" ref={scrollRef} onScroll={handleScroll}>
                        {PLANES.map((plane, index) => (
                            <div
                                key={plane.id}
                                className={`plane-card glass-panel ${plane.active ? 'active-sim' : 'disabled-sim'} ${index === activeIndex ? 'is-centered' : 'is-side'}`}
                                onClick={() => plane.active && onSelectPlane(plane.id)}
                                title={plane.active ? `Initialize ${plane.name}` : `${plane.name} - Module Offline`}
                            >
                                <div className="plane-card-image">
                                    <img src={plane.image} alt={plane.name} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="carousel-arrow right-arrow" onClick={() => scrollCarousel('right')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

                <div className="carousel-indicators">
                    {PLANES.map((plane, index) => (
                        <div
                            key={plane.id}
                            className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
