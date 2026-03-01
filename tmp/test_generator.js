// /tmp/test_generator.js
import { generateRandomManifest } from '../src/engine/manifestGenerator.js';

const iterations = 1000;
const results = {
    tare: 0,
    container: 0,
    pallet: 0,
    voids: 0,
    weights: []
};

for (let i = 0; i < iterations; i++) {
    const manifest = generateRandomManifest(15, 'mixed');
    results.voids += (15 - manifest.length);

    manifest.forEach(uld => {
        results.weights.push(uld.weight);
        if (uld.isEmpty) results.tare++;
        else if (uld.type.startsWith('P')) results.pallet++;
        else results.container++;
    });
}

const avgWeight = results.weights.reduce((a, b) => a + b, 0) / results.weights.length;
const minWeight = Math.min(...results.weights);
const maxWeight = Math.max(...results.weights);

console.log('--- Manifest Generator Stats (1000 iterations) ---');
console.log(`Average Voids per plane: ${(results.voids / iterations).toFixed(2)}`);
console.log(`Average ULDs per plane: ${(results.weights.length / iterations).toFixed(2)}`);
console.log(`Tare Containers: ${results.tare}`);
console.log(`Full Containers: ${results.container}`);
console.log(`Pallets: ${results.pallet}`);
console.log(`Weight Range: ${minWeight} - ${maxWeight}`);
console.log(`Average Weight: ${avgWeight.toFixed(2)}`);

// Check skewing
const frequentRange = results.weights.filter(w => w >= 1000 && w <= 4000).length;
console.log(`% in 1000-4000 lbs range: ${(frequentRange / results.weights.length * 100).toFixed(2)}%`);
