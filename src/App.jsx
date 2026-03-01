// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import PlaneStage from './components/PlaneStage';
import ManifestSidebar from './components/ManifestSidebar';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';
import { generateEmptySlots, BOEING_757_SPECS } from './engine/planeData';
import { optimizeLoadOrder } from './engine/optimizer';
import { calculateMacPercent } from './engine/scoring';
import { generateRandomManifest } from './engine/manifestGenerator';
import './App.css';

// Mock data generator for MVP
function generateManifest() {
  return generateRandomManifest(BOEING_757_SPECS.positions, 'mixed');
}

function App() {
  const [view, setView] = useState('landing');
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [manifest, setManifest] = useState(generateManifest());
  const [loadOrder, setLoadOrder] = useState(generateEmptySlots());
  const [isSorting, setIsSorting] = useState(false);
  const [macPercent, setMacPercent] = useState(null);
  const [bestScore, setBestScore] = useState(null);

  const handleSelectPlane = (planeId) => {
    setSelectedPlane(planeId);
    setView('dashboard');
  };

  // Initial loading logic moved to a reusable function
  const applyInitialLoad = (newManifest) => {
    const sortedManifest = [...newManifest].sort((a, b) => b.weight - a.weight);
    const nextOrder = generateEmptySlots();

    // Place accessible hazmats first at positions 1 and 2
    for (let i = 0; i < sortedManifest.length; i++) {
      if (sortedManifest[i].hazmatType === 'A') {
        for (let p = 0; p < 2; p++) {
          if (!nextOrder[p].uld) {
            nextOrder[p].uld = sortedManifest[i];
            break;
          }
        }
      }
    }

    // Place remaining towards the back (greedy heavy-aft)
    let backIdx = nextOrder.length - 1;
    for (let i = 0; i < sortedManifest.length; i++) {
      if (sortedManifest[i].hazmatType !== 'A') {
        const alreadyPlaced = nextOrder.some(slot => slot.uld?.id === sortedManifest[i].id);
        if (alreadyPlaced) continue;

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
  };

  useEffect(() => {
    applyInitialLoad(manifest);
  }, []);

  const handleRegenerate = (scenario = 'mixed') => {
    const newManifest = generateRandomManifest(BOEING_757_SPECS.positions, scenario);
    setManifest(newManifest);
    applyInitialLoad(newManifest);
    setBestScore(null);
  };

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

  if (view === 'landing') {
    return <LandingPage onSelectPlane={handleSelectPlane} />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="cyber-title" style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
          UPS <span>LoadBalancer</span>
        </h1>
        <div className="header-status mono-text">
          <span className="dot active"></span> SYSTEM ONLINE // {selectedPlane || 'B757-200F'}
        </div>
      </header>

      <main className="dashboard-main">
        <section className="manifest-section">
          <ManifestSidebar ulds={manifest} loadOrder={loadOrder} />
        </section>

        <section className="stage-section">
          <PlaneStage loadOrder={loadOrder} />
        </section>

        <section className="control-section">
          <ControlPanel
            onSort={handleSort}
            onRegenerate={handleRegenerate}
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
