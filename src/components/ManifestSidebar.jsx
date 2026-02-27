// src/components/ManifestSidebar.jsx
import React from 'react';
import './ManifestSidebar.css';

export default function ManifestSidebar({ ulds }) {
    return (
        <div className="manifest-sidebar glass-panel">
            <h2 className="manifest-title label-text">Cargo Manifest</h2>
            <div className="manifest-list">
                {ulds.map(uld => (
                    <div key={uld.id} className={`manifest-item ${uld.isHazmatAccessible ? 'hazmat' : ''}`}>
                        <div className="item-header">
                            <span className="mono-text id-label">{uld.id}</span>
                            <span className="type-badge">{uld.type}</span>
                        </div>
                        <div className="item-details label-text">
                            <span>{uld.weight.toLocaleString()} lbs</span>
                            {uld.isHazmatAccessible && <span className="hazmat-alert">HAZMAT</span>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="manifest-footer label-text">
                Total ULDs: {ulds.length}
            </div>
        </div>
    );
}
