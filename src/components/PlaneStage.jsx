// src/components/PlaneStage.jsx
import React from 'react';
import UldSlot from './UldSlot';
import { BOEING_757_SPECS } from '../engine/planeData';
import './PlaneStage.css';

export default function PlaneStage({ loadOrder }) {
    // The MAC percentage physical location for drawing the visual line
    // LEMAC is roughly at position 6 in the main deck of 757 when viewed top-down
    // For visual simplicity in this MVP, we estimate the MAC line explicitly half way 
    // down the fuselage grid.

    return (
        <div className="plane-stage-container">
            {/* The underlying blurred/ephemeral fuselage image */}
            <div className="ephemeral-fuselage-mask">
                <img src="/assets/fuselage_mask_alt.png" alt="Boeing 757 Overlay" />
            </div>

            <div className="plane-grid">
                {/* Visual anchor for MAC point */}
                <div className="mac-anchor-line">
                    <span className="mac-label">MAC Center</span>
                </div>

                {/* Render slots 1-15 */}
                <div className="slots-container">
                    {loadOrder.map((slot, index) => (
                        <div key={slot.positionId} className="slot-wrapper">
                            <span className="position-label">{slot.positionId}</span>
                            <UldSlot slot={slot} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
