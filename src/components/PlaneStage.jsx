// src/components/PlaneStage.jsx
import React, { useRef, useEffect } from 'react';
import UldSlot from './UldSlot';
import { BOEING_757_SPECS } from '../engine/planeData';
import './PlaneStage.css';

export default function PlaneStage({ loadOrder }) {
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        // Auto-center horizontal scroll on mobile mount
        if (scrollContainerRef.current && window.innerWidth <= 1024) {
            const container = scrollContainerRef.current;
            container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
        }
    }, [loadOrder.length]);

    return (
        <div className="plane-stage-container">
            <div className="plane-grid">
                <div className="slots-container" ref={scrollContainerRef}>

                    {/* The scrollable wrapper that holds everything */}
                    <div className="scroll-content-wrapper">

                        {/* The underlying blurred/ephemeral fuselage image */}
                        <div className="ephemeral-fuselage-mask">
                            <img src="/assets/fuselage_mask_alt.png" alt="Boeing 757 Overlay" />
                        </div>

                        {/* Visual anchor for MAC point - position around slot 6-7 */}
                        <div className="mac-anchor-line">
                            <span className="mac-label">MAC Center</span>
                        </div>

                        {/* Render slots 1-15 */}
                        <div className="slots-wrapper">
                            {loadOrder.map((slot, index) => (
                                <div key={slot.positionId} className="slot-wrapper">
                                    <span className="position-label">{slot.positionId}</span>
                                    <UldSlot slot={slot} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
