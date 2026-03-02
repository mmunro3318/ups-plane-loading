import React, { useState, useRef, useEffect } from 'react';
import './ManifestSidebar.css';

const LOAD_ORDER_SEQUENCE = [1, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 2, 3];

const SORT_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'load', label: 'Sort Manifest' },
    { value: 'asc', label: 'Ascending' }
];

export default function ManifestSidebar({ ulds, loadOrder }) {
    const [sortMode, setSortMode] = useState('none');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getSortedUlds = () => {
        const uldsWithPos = ulds.map(uld => ({
            ...uld,
            pos: loadOrder.find(slot => slot.uld?.id === uld.id)?.positionId || Infinity
        }));

        if (sortMode === 'asc') {
            return [...uldsWithPos].sort((a, b) => a.pos - b.pos);
        }

        if (sortMode === 'load') {
            return [...uldsWithPos].sort((a, b) => {
                const idxA = LOAD_ORDER_SEQUENCE.indexOf(a.pos);
                const idxB = LOAD_ORDER_SEQUENCE.indexOf(b.pos);

                // If POS is not in sequence (Infinity), pull to bottom
                const valA = idxA === -1 ? 999 : idxA;
                const valB = idxB === -1 ? 999 : idxB;

                return valA - valB;
            });
        }

        return ulds; // 'none' or default
    };

    const handleSelectSort = (mode) => {
        setSortMode(mode);
        setIsOpen(false);
    };

    const sortedUlds = getSortedUlds();
    const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortMode)?.label;
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(window.innerWidth <= 1024);

    return (
        <div className={`manifest-sidebar glass-panel ${isMobileCollapsed ? 'collapsed' : ''}`}>
            <header className="sidebar-header" style={{ justifyContent: 'space-between' }}>
                <h2
                    className="manifest-title label-text"
                    onClick={() => { if (window.innerWidth <= 1024) setIsMobileCollapsed(!isMobileCollapsed); }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    Cargo Manifest <span className="mobile-only-toggle">{isMobileCollapsed ? '▼' : '▲'}</span>
                </h2>

                <div className="sort-container" ref={dropdownRef}>
                    <button
                        className={`sort-dropdown-toggle mono-text ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {currentSortLabel}
                        <span className={`chevron ${isOpen ? 'up' : 'down'}`}>▾</span>
                    </button>

                    {isOpen && (
                        <div className="sort-dropdown-menu glass-panel">
                            {SORT_OPTIONS.map(option => (
                                <div
                                    key={option.value}
                                    className={`sort-option mono-text ${sortMode === option.value ? 'selected' : ''}`}
                                    onClick={() => handleSelectSort(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <div className="manifest-list">
                {sortedUlds.map(uld => {
                    const position = uld.pos === Infinity ? "N/A" : uld.pos;

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
