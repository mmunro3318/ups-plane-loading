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
    // Base score is deviation from optimal Aft CG
    let score = Math.abs(BOEING_757_SPECS.optimalAftCog - macPercent);

    let penalty = 0;

    for (let i = 0; i < loadOrder.length; i++) {
        const slot = loadOrder[i];
        if (slot.uld) {
            const uld = slot.uld;

            // Overweight position penalty
            if (uld.weight > BOEING_757_SPECS.maxWeightPerPosition) {
                penalty += 10000;
            }

            if (uld.hazmatType) {
                // A must be in pos 1
                if (uld.hazmatType === 'A' && slot.positionId !== 1) {
                    penalty += 5000;
                }

                // R must be away from crew (pos > 3)
                if (uld.hazmatType === 'R' && slot.positionId <= 3) {
                    penalty += 5000;
                }

                // F not near C, R, B
                if (uld.hazmatType === 'F') {
                    if (i > 0 && loadOrder[i - 1].uld) {
                        const adjType = loadOrder[i - 1].uld.hazmatType;
                        if (['C', 'R', 'B'].includes(adjType)) penalty += 5000;
                    }
                    if (i < loadOrder.length - 1 && loadOrder[i + 1].uld) {
                        const adjType = loadOrder[i + 1].uld.hazmatType;
                        if (['C', 'R', 'B'].includes(adjType)) penalty += 5000;
                    }
                }
            }
        }
    }

    if (macPercent < BOEING_757_SPECS.safeEnvelopePercent.min || macPercent > BOEING_757_SPECS.safeEnvelopePercent.max) {
        penalty += 20000;
    }

    return score + penalty;
}

export function isLoadOrderValid(loadOrder) {
    for (let i = 0; i < loadOrder.length; i++) {
        const slot = loadOrder[i];
        if (slot.uld) {
            const uld = slot.uld;
            if (uld.weight > BOEING_757_SPECS.maxWeightPerPosition) return false;

            if (uld.hazmatType === 'A' && slot.positionId !== 1) return false;
            if (uld.hazmatType === 'R' && slot.positionId <= 3) return false;

            if (uld.hazmatType === 'F') {
                if (i > 0 && loadOrder[i - 1].uld && ['C', 'R', 'B'].includes(loadOrder[i - 1].uld.hazmatType)) return false;
                if (i < loadOrder.length - 1 && loadOrder[i + 1].uld && ['C', 'R', 'B'].includes(loadOrder[i + 1].uld.hazmatType)) return false;
            }
        }
    }

    const macPercent = calculateMacPercent(loadOrder);
    if (macPercent < BOEING_757_SPECS.safeEnvelopePercent.min || macPercent > BOEING_757_SPECS.safeEnvelopePercent.max) {
        return false;
    }

    return true;
}
