// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import PlaneStage from './components/PlaneStage';
import ManifestSidebar from './components/ManifestSidebar';
import ControlPanel from './components/ControlPanel';
import { generateEmptySlots, ULD_TYPES } from './engine/planeData';
import { optimizeLoadOrder } from './engine/optimizer';
import { calculateMacPercent } from './engine/scoring';
import './App.css';

// Mock data generator for MVP
function generateManifest() {
  return [
    { id: 'A2-001X', type: 'A2', weight: 12500, isHazmatAccessible: false },
    { id: 'A2-002Y', type: 'A2', weight: 9800, isHazmatAccessible: true },
    { id: 'PZ-045W', type: 'PAG', weight: 4500, isHazmatAccessible: false },
    { id: 'PZ-112Q', type: 'PAG', weight: 11200, isHazmatAccessible: false },
    { id: 'A2-990P', type: 'A2', weight: 8900, isHazmatAccessible: false },
    { id: 'A2-111R', type: 'A2', weight: 13100, isHazmatAccessible: false },
    { id: 'A2-222K', type: 'A2', weight: 5000, isHazmatAccessible: true },
    { id: 'PZ-333L', type: 'PAG', weight: 7000, isHazmatAccessible: false },
  ];
}

function App() {
  const [manifest, setManifest] = useState(generateManifest());
  const [loadOrder, setLoadOrder] = useState(generateEmptySlots());
  const [isSorting, setIsSorting] = useState(false);
  const [macPercent, setMacPercent] = useState(null);
  const [bestScore, setBestScore] = useState(null);

  // Initial naive greedy load: Just dump them in order for now 
  // Wait, the PRD says greedy init -> heaviest aft.
  // Let's implement that.
  useEffect(() => {
    const sortedManifest = [...manifest].sort((a, b) => b.weight - a.weight);
    const nextOrder = generateEmptySlots();
    let manifestIdx = 0;

    // Place hazmats first at positions 1 and 2
    for (let i = 0; i < sortedManifest.length; i++) {
      if (sortedManifest[i].isHazmatAccessible) {
        // Find empty front slot
        for (let p = 0; p < 2; p++) {
          if (!nextOrder[p].uld) {
            nextOrder[p].uld = sortedManifest[i];
            break;
          }
        }
      }
    }

    // Place heaviest remaining towards the back
    let backIdx = nextOrder.length - 1;
    for (let i = 0; i < sortedManifest.length; i++) {
      if (!sortedManifest[i].isHazmatAccessible) {
        while (backIdx >= 0 && nextOrder[backIdx].uld) {
          backIdx--;
        }
        if (backIdx >= 0) {
          nextOrder[backIdx].uld = sortedManifest[i];
        }
      }
    }

    setLoadOrder(nextOrder);
    setMacPercent(calculateMacPercent(nextOrder));
  }, []);

  const handleSort = () => {
    if (isSorting) return;
    setIsSorting(true);

    // We run the optimizer async so we don't block the UI entirely
    setTimeout(() => {
      const { bestOrder, bestScore } = optimizeLoadOrder(
        loadOrder,
        null, // progress callback not used sync
        10000 // 10k iterations
      );

      setLoadOrder(bestOrder);
      setBestScore(bestScore);
      setMacPercent(calculateMacPercent(bestOrder));
      setIsSorting(false);
    }, 100);
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="cyber-title">UPS <span>LoadBalancer</span></h1>
        <div className="header-status mono-text">
          <span className="dot active"></span> SYSTEM ONLINE // B757-200F
        </div>
      </header>

      <main className="dashboard-main">
        <section className="manifest-section">
          <ManifestSidebar ulds={manifest} />
        </section>

        <section className="stage-section">
          <PlaneStage loadOrder={loadOrder} />
        </section>

        <section className="control-section">
          <ControlPanel
            onSort={handleSort}
            isSorting={isSorting}
            currentScore={bestScore}
            macPercent={macPercent}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
