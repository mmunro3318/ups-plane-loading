// src/engine/optimizer.js
import { scoreLoadOrder, isLoadOrderValid } from './scoring.js';

function copyLoadOrder(loadOrder) {
    return loadOrder.map(slot => ({ ...slot }));
}

// Generate a random neighbor by swapping two random slots
function generateNeighbor(currentOrder) {
    const nextOrder = copyLoadOrder(currentOrder);
    const i = Math.floor(Math.random() * nextOrder.length);
    let j = Math.floor(Math.random() * nextOrder.length);
    while (i === j) j = Math.floor(Math.random() * nextOrder.length);

    // Swap the ULDs
    const temp = nextOrder[i].uld;
    nextOrder[i].uld = nextOrder[j].uld;
    nextOrder[j].uld = temp;

    return nextOrder;
}

export function optimizeLoadOrder(initialLoadOrder, onProgress, maxIterations = 5000) {
    let currentOrder = copyLoadOrder(initialLoadOrder);

    // Fallback if initial is invalid, though "greedy seed" should build a valid one.
    let currentScore = scoreLoadOrder(currentOrder);
    let bestOrder = copyLoadOrder(currentOrder);
    let bestScore = currentScore;

    let temperature = 100.0;
    const coolingRate = 0.995;

    for (let i = 0; i < maxIterations; i++) {
        const neighbor = generateNeighbor(currentOrder);

        // Only accept if it breaks no physical/safety constraints
        if (!isLoadOrderValid(neighbor)) {
            continue;
        }

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
        if (i % 100 === 0 && onProgress) {
            onProgress(bestOrder, bestScore, (i / maxIterations) * 100);
        }
    }

    return { bestOrder, bestScore };
}
