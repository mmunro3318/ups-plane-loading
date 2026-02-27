// src/engine/scoring.js
import { BOEING_757_SPECS } from './planeData.js';

// Calculate the moment for a position
// Distance from datum (rough estimate for 757 15-pos main deck)
// Nose is roughly 300 inches from datum, with ~73 inches per position.
function getPositionDistance(posId) {
    const startInchesFromDatum = 350;
    const inchesPerPosition = 75;
    return startInchesFromDatum + (posId - 1) * inchesPerPosition;
}

export function calculateMacPercent(loadOrder) {
    let totalWeight = 0;
    let totalMoment = 0;

    // Base empty weight of the plane and its CG
    const emptyWeight = 115000;
    const emptyCgInches = 1040; // Approx 24% MAC empty

    totalWeight += emptyWeight;
    totalMoment += emptyWeight * emptyCgInches;

    for (let i = 0; i < loadOrder.length; i++) {
        const slot = loadOrder[i];
        if (slot.uld) {
            const weight = slot.uld.weight;
            const distance = getPositionDistance(slot.positionId);
            totalWeight += weight;
            totalMoment += (weight * distance);
        }
    }

    const cgInches = totalMoment / totalWeight;

    // %MAC = ((CG - LEMAC) / MAC) * 100
    const macPercent = ((cgInches - BOEING_757_SPECS.lemac) / BOEING_757_SPECS.macLength) * 100;

    return macPercent;
}

export function scoreLoadOrder(loadOrder) {
    const macPercent = calculateMacPercent(loadOrder);
    // Score is the absolute absolute deviation from the optimal Aft CG
    // Lower score is better (0 is perfect)
    return Math.abs(BOEING_757_SPECS.optimalAftCog - macPercent);
}

export function isLoadOrderValid(loadOrder) {
    // Check Hazmat constraints
    for (let i = 0; i < loadOrder.length; i++) {
        const slot = loadOrder[i];
        if (slot.uld) {
            // Position weight limit
            if (slot.uld.weight > BOEING_757_SPECS.maxWeightPerPosition) {
                return false;
            }

            // Hazmat Accessible must be in Pos 1 or 2
            if (slot.uld.isHazmatAccessible && slot.positionId > 2) {
                return false;
            }
        }
    }

    // Check MAC safe envelope
    const macPercent = calculateMacPercent(loadOrder);
    if (macPercent < BOEING_757_SPECS.safeEnvelopePercent.min || macPercent > BOEING_757_SPECS.safeEnvelopePercent.max) {
        return false;
    }

    return true;
}
