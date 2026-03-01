// src/engine/planeData.js

export const BOEING_757_SPECS = {
    id: "B757-200F",
    positions: 15,
    macLength: 199.7, // inches
    lemac: 991.9, // inches from datum
    optimalAftCog: 27, // Target %MAC for optimal fuel efficiency
    safeEnvelopePercent: { min: 7, max: 39 },
    maxWeightPerPosition: 6700, // lbs

    // Tipping Prevention Constraints
    cumulativeAftLimits: [
        { positions: [15], maxWeight: 6700 },
        { positions: [14, 15], maxWeight: 12000 },
        { positions: [13, 14, 15], maxWeight: 18000 },
        { positions: [12, 13, 14, 15], maxWeight: 24000 },
        { positions: [11, 12, 13, 14, 15], maxWeight: 30000 }
    ],
    forwardBallastRule: {
        triggerWeightAft: 25000,
        aftPositions: [11, 12, 13, 14, 15],
        requiredBallastForward: 4000,
        forwardPositions: [1, 2]
    },

    // UI and Logic configuration for manual Tail-Tip modes
    tailTipConfig: {
        single: { minVoidsRequired: 2, forceVoidPositions: [1, 15] },
        double: { minVoidsRequired: 4, forceVoidPositions: [1, 2, 14, 15] }
    },

    // Position coordinates for rendering (x, y % offsets)
    // Assuming a top-down view. Coordinates can be tweaked via UI later.
};

export const ULD_TYPES = {
    "A2": {
        name: "A2 Container",
        weightMax: 13300,
        type: "container",
    },
    "A1": {
        name: "A1 Container",
        weightMax: 13300,
        type: "container",
    },
    "PAG": {
        name: "PAG Pallet",
        weightMax: 13300,
        type: "pallet",
    },
    "PAH": {
        name: "PAH Pallet",
        weightMax: 13300,
        type: "pallet",
    }
};

// Returns an array of slot objects, purely for state modeling
export function generateEmptySlots(numPositions = BOEING_757_SPECS.positions) {
    return Array.from({ length: numPositions }).map((_, i) => ({
        positionId: i + 1,
        uld: null, // will hold a ULD object when assigned
    }));
}
