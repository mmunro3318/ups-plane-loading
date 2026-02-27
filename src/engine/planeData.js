// src/engine/planeData.js

export const BOEING_757_SPECS = {
    id: "B757-200F",
    positions: 15,
    macLength: 199.7, // inches
    lemac: 991.9, // inches from datum
    optimalAftCog: 27, // Target %MAC for optimal fuel efficiency
    safeEnvelopePercent: { min: 7, max: 39 },
    maxWeightPerPosition: 6700, // lbs

    // Position coordinates for rendering (x, y % offsets)
    // Assuming a top-down view. Coordinates can be tweaked via UI later.
};

export const ULD_TYPES = {
    "A2": {
        name: "A2 Container",
        weightMax: 13300,
        type: "container",
    },
    "PAG": {
        name: "PAG Pallet",
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
