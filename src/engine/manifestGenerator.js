// src/engine/manifestGenerator.js

const TARE_WEIGHTS = [460, 464, 490, 510];
const ULD_ID_PREFIXES = ['AAY', 'AAD', 'PAG', 'PAH'];

/**
 * Generates a random weight based on the user's requirements:
 * - Empties: 460, 464, 490, 510 lbs
 * - Containers: 800 - 8800 lbs (skewed to 1000-4000)
 * - Pallets: 4000 - 8000 lbs
 */
function getRandomWeight(type, isEmpty = false) {
    if (isEmpty) {
        return TARE_WEIGHTS[Math.floor(Math.random() * TARE_WEIGHTS.length)];
    }

    if (type === 'PAG' || type === 'PAH') {
        // Pallets 4000-8000 (never empty)
        return Math.floor(4000 + Math.random() * 4000);
    }

    // Containers (A2, A1) 800-8800, skewed to 1000-4000
    // We'll use a simple transformation to skew the distribution:
    // Math.random()^2 would skew towards 0. 
    // We want a peak between 1000-4000.

    const isSkewer = Math.random() < 0.7; // 70% chance to be in the "frequent" range
    if (isSkewer) {
        return Math.floor(1000 + Math.random() * 3000);
    } else {
        // 30% chance to be anywhere else in the range [800, 8800]
        return Math.floor(800 + Math.random() * 8000);
    }
}

function generateRandomId() {
    const prefix = ULD_ID_PREFIXES[Math.floor(Math.random() * ULD_ID_PREFIXES.length)];
    const suffix = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${suffix}`;
}

/**
 * Scenarios: 
 * - 'full': Every slot has a ULD (some might be empty weight)
 * - 'mixed': A mix of full ULDs, empty weight ULDs, and some voids
 * - 'mostly-empty': Mostly empty weight ULDs or voids
 * - 'voids-heavy': Many completely empty positions
 */
export function generateRandomManifest(numPositions = 15, scenario = 'mixed') {
    const manifest = [];

    for (let i = 0; i < numPositions; i++) {
        let skip = false;
        let isEmpty = false;

        // Determination based on scenario
        const roll = Math.random();

        if (scenario === 'full') {
            isEmpty = roll < 0.2; // 20% chance of being an empty weight container
        } else if (scenario === 'mixed') {
            if (roll < 0.15) skip = true; // 15% void
            else if (roll < 0.35) isEmpty = true; // 20% empty weight
        } else if (scenario === 'mostly-empty') {
            if (roll < 0.3) skip = true; // 30% void
            else isEmpty = true; // Rest are empty weight
        } else if (scenario === 'voids-heavy') {
            if (roll < 0.6) skip = true; // 60% void
            else isEmpty = roll < 0.8; // some empty, some full
        }

        if (skip) continue;

        const types = ['A2', 'A1', 'PAG', 'PAH'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Pallets are never empty per user request
        const effectiveEmpty = (type === 'PAG' || type === 'PAH') ? false : isEmpty;

        manifest.push({
            id: generateRandomId(),
            type: type,
            weight: getRandomWeight(type, effectiveEmpty),
            hazmatType: Math.random() < 0.1 ? ['A', 'U', 'C', 'F', 'R', 'B'][Math.floor(Math.random() * 6)] : null,
            isEmpty: effectiveEmpty
        });
    }

    return manifest;
}
