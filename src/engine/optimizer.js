// src/engine/optimizer.js
import { scoreLoadOrder, isLoadOrderValid } from './scoring.js';

import { BOEING_757_SPECS } from './planeData.js';

function copyLoadOrder(loadOrder) {
    return loadOrder.map(slot => ({ ...slot }));
}

// Generate a random neighbor by swapping two random slots, respecting locked positions
function generateNeighbor(currentOrder, lockedPositions = []) {
    const nextOrder = copyLoadOrder(currentOrder);

    // Get array of indices that are NOT locked
    const swappableIndices = nextOrder
        .map((slot, index) => ({ index, positionId: slot.positionId }))
        .filter(item => !lockedPositions.includes(item.positionId))
        .map(item => item.index);

    if (swappableIndices.length < 2) return nextOrder; // Cannot swap

    let iIdx = Math.floor(Math.random() * swappableIndices.length);
    let jIdx = Math.floor(Math.random() * swappableIndices.length);
    while (iIdx === jIdx) jIdx = Math.floor(Math.random() * swappableIndices.length);

    const i = swappableIndices[iIdx];
    const j = swappableIndices[jIdx];

    // Swap the ULDs
    const temp = nextOrder[i].uld;
    nextOrder[i].uld = nextOrder[j].uld;
    nextOrder[j].uld = temp;

    return nextOrder;
}

export function randomizeLoadOrder(initialLoadOrder, tailTipMode = 'none') {
    let currentOrder = copyLoadOrder(initialLoadOrder);

    // Determine locked positions based on tailTipMode
    let lockedPositions = [];
    const numVoids = currentOrder.filter(slot => !slot.uld).length;

    if (tailTipMode === 'single' && numVoids >= BOEING_757_SPECS.tailTipConfig.single.minVoidsRequired) {
        lockedPositions = BOEING_757_SPECS.tailTipConfig.single.forceVoidPositions;
    } else if (tailTipMode === 'double' && numVoids >= BOEING_757_SPECS.tailTipConfig.double.minVoidsRequired) {
        lockedPositions = BOEING_757_SPECS.tailTipConfig.double.forceVoidPositions;
    }

    // Perform enough valid random swaps to scramble the order
    for (let i = 0; i < 50; i++) {
        currentOrder = generateNeighbor(currentOrder, lockedPositions);
    }
    return currentOrder;
}

export function optimizeLoadOrder(initialLoadOrder, onProgress, maxIterations = 5000, tailTipMode = 'none', initialTemperature = 100.0, coolingRate = 0.995) {
    let currentOrder = copyLoadOrder(initialLoadOrder);

    // Determine locked positions based on tailTipMode
    let lockedPositions = [];
    const numVoids = currentOrder.filter(slot => !slot.uld).length;

    if (tailTipMode === 'single' && numVoids >= BOEING_757_SPECS.tailTipConfig.single.minVoidsRequired) {
        lockedPositions = BOEING_757_SPECS.tailTipConfig.single.forceVoidPositions;
    } else if (tailTipMode === 'double' && numVoids >= BOEING_757_SPECS.tailTipConfig.double.minVoidsRequired) {
        lockedPositions = BOEING_757_SPECS.tailTipConfig.double.forceVoidPositions;
    }

    // Fallback if initial is invalid, though "greedy seed" should build a valid one.
    let currentScore = scoreLoadOrder(currentOrder);
    let bestOrder = copyLoadOrder(currentOrder);
    let bestScore = currentScore;

    let temperature = initialTemperature;

    for (let iter = 0; iter < maxIterations; iter++) {
        const neighbor = generateNeighbor(currentOrder, lockedPositions);

        // Removed strict isLoadOrderValid check so algorithms can evaluate penalized invalid states

        const neighborScore = scoreLoadOrder(neighbor);
        const delta = neighborScore - currentScore;

        // If neighbor is better, or if temperature allows a worse move
        if (delta < 0 || Math.exp(-delta / temperature) > Math.random()) {
            currentOrder = neighbor;
            currentScore = neighborScore;

            if (currentScore < bestScore) {
                bestScore = currentScore;
                bestOrder = copyLoadOrder(currentOrder);
            }
        }

        temperature *= coolingRate;

        // Report progress occasionally
        if (iter % 100 === 0 && onProgress) {
            onProgress(bestOrder, bestScore, (iter / maxIterations) * 100);
        }
    }

    return { bestOrder, bestScore };
}
