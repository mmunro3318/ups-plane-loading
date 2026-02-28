// src/components/ManifestSidebar.jsx
import React from 'react';
import './ManifestSidebar.css';

export default function ManifestSidebar({ ulds, loadOrder }) {
    return (
        <div className="manifest-sidebar glass-panel">
            <h2 className="manifest-title label-text">Cargo Manifest</h2>
            <div className="manifest-list">
                {ulds.map(uld => {
                    const position = loadOrder.find(slot => slot.uld?.id === uld.id)?.positionId || "N/A";

                    return (
                        <div key={uld.id} className={`manifest-item ${uld.hazmatType ? 'hazmat' : ''}`}>
                            <div className="item-header">
                                <span className="mono-text id-label">{uld.id}</span>
                                <span className="type-badge">POS {position}</span>
                            </div>
                            <div className="item-details label-text">
                                <span>{uld.weight.toLocaleString()} lbs</span>
                                {uld.hazmatType && <span className={`hazmat-alert hazmat-${uld.hazmatType}`}>HAZ: {uld.hazmatType}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="manifest-footer label-text">
                Total ULDs: {ulds.length}
            </div>
        </div>
    );
}
