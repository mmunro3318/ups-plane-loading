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

const PENALTY_LIGHT_COMBI = 10; // Penalty for violating light combi
const PENALTY_TAIL_TIP = 50;    // Massive penalty for tail tip risk

/**
 * Applies a non-linear scaling to the raw deviation.
 * This is based on the MCTS implementation `reward_from_dev_linear`.
 * 
 * By using a gamma < 1 (e.g. 0.5 for square root), small deviations from
 * optimal MAC are made mathematically "larger", forcing the optimizer to
 * care more about tiny differences in highly optimized states, rather than
 * treating them all as effectively zero.
 * 
 * @param {number} rawDeviation 
 * @param {number} gamma  Ex: 0.5
 * @returns {number} scaled deviation
 */
function scaleDeviation(rawDeviation, gamma = 0.5) {
    if (rawDeviation <= 0) return 0;
    // We scale the deviation using the power of gamma
    return Math.pow(rawDeviation, gamma);
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

/**
 * Calculates the total score for a given load order
 * A lower score is better (0 is perfect balance and no broken constraints)
 * 
 * @param {Array} loadOrder - Array of ULD objects
 * @param {boolean} useScaling - Whether to apply non-linear scaling to the MAC deviation
 * @returns {number} The calculated score
 */
export function scoreLoadOrder(loadOrder, useScaling = true) {
    const macPercent = calculateMacPercent(loadOrder);
    // Base score is deviation from optimal Aft CG
    let optimalMacDeviation = Math.abs(BOEING_757_SPECS.optimalAftCog - macPercent);

    // Apply scaling to the MAC deviation if requested
    const finalMacPenalty = useScaling ? scaleDeviation(optimalMacDeviation) : optimalMacDeviation;

    // We weight the MAC deviation heavily so the optimizer prioritizes it
    // Note: If using non-linear scaling (e.g., gamma=0.5), the raw value is already structurally transformed,
    // so we might need less of an arbitrary multiplier, but we keep it to ensure it competes with constraints.
    let score = finalMacPenalty * 10;

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

    // --- TIPPING PREVENTION CONSTRAINTS ---

    // 0. Position 1 Dependency on Position 15 (Tail-Tip Protection)
    const pos1Slot = loadOrder.find(s => s.positionId === 1);
    const pos15Slot = loadOrder.find(s => s.positionId === 15);
    if (pos1Slot && !pos1Slot.uld && pos15Slot && pos15Slot.uld) {
        // Massive penalty to ensure optimizer rejects leaving pos 1 empty if pos 15 has cargo
        penalty += 50000;
    }

    // 1. Cumulative Aft Limits (from planeData poster limits)
    if (BOEING_757_SPECS.cumulativeAftLimits) {
        BOEING_757_SPECS.cumulativeAftLimits.forEach(limit => {
            let sum = 0;
            limit.positions.forEach(pos => {
                const slot = loadOrder.find(s => s.positionId === pos);
                if (slot && slot.uld) sum += slot.uld.weight;
            });
            if (sum > limit.maxWeight) {
                // Massive penalty proportional to the violation to drive the optimizer away
                penalty += 20000 + (sum - limit.maxWeight) * 10;
            }
        });
    }

    // 2. Minimum Forward Ballast Rule
    if (BOEING_757_SPECS.forwardBallastRule) {
        const rule = BOEING_757_SPECS.forwardBallastRule;
        let aftSum = 0;
        rule.aftPositions.forEach(pos => {
            const slot = loadOrder.find(s => s.positionId === pos);
            if (slot && slot.uld) aftSum += slot.uld.weight;
        });

        if (aftSum >= rule.triggerWeightAft) {
            let forwardSum = 0;
            rule.forwardPositions.forEach(pos => {
                const slot = loadOrder.find(s => s.positionId === pos);
                if (slot && slot.uld) forwardSum += slot.uld.weight;
            });

            if (forwardSum < rule.requiredBallastForward) {
                // Penalty for not having enough ballast when tail is heavy
                penalty += 25000 + (rule.requiredBallastForward - forwardSum) * 10;
            }
        }
    }

    // Envelope constraint
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

    // Position 1 vs 15 rule
    const pos1Slot = loadOrder.find(s => s.positionId === 1);
    const pos15Slot = loadOrder.find(s => s.positionId === 15);
    if (pos1Slot && !pos1Slot.uld && pos15Slot && pos15Slot.uld) return false;

    const macPercent = calculateMacPercent(loadOrder);
    if (macPercent < BOEING_757_SPECS.safeEnvelopePercent.min || macPercent > BOEING_757_SPECS.safeEnvelopePercent.max) {
        return false;
    }

    return true;
}
