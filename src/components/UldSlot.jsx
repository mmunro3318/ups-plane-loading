// src/components/UldSlot.jsx
import React from 'react';
import './UldSlot.css';

export default function UldSlot({ slot, style }) {
    if (!slot) return null;

    const isEmpty = !slot.uld;
    const isHazmat = !!slot.uld?.hazmatType;

    // Base styles + positional styles
    let classNames = ["uld-slot"];
    if (isEmpty) classNames.push("empty-slot");
    else classNames.push("occupied-slot");
    if (isHazmat) classNames.push("hazmat-slot");

    return (
        <div className={classNames.join(" ")} style={style}>
            {!isEmpty && (
                <div className="uld-content">
                    <div className="uld-id-badge mono-text">{slot.uld.id}</div>
                    <div className="uld-weight label-text">{slot.uld.weight.toLocaleString()} lbs</div>
                </div>
            )}
        </div>
    );
}
