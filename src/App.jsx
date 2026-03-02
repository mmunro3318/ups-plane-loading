// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import PlaneStage from './components/PlaneStage';
import ManifestSidebar from './components/ManifestSidebar';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';
import EducationalPage from './components/EducationalPage';
import ScorePlot from './components/ScorePlot';
import { generateEmptySlots, BOEING_757_SPECS } from './engine/planeData';
import { optimizeLoadOrder, randomizeLoadOrder } from './engine/optimizer';
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
  const [tailTipMode, setTailTipMode] = useState('none');
  const [algoParams, setAlgoParams] = useState({
    temperature: 100.0,
    coolingRate: 0.999,
    maxIterations: 10000,
    greedySeed: true
  });
  const [showProfiler, setShowProfiler] = useState(false);
  const [profilerData, setProfilerData] = useState({ greedy: null, random: null });

  const handleSelectPlane = (planeId) => {
    setSelectedPlane(planeId);
    setView('dashboard');
  };

  const handleLearnMore = () => {
    setView('education');
  };

  // Initial loading logic moved to a reusable function
  const applyInitialLoad = (newManifest, currentTailTipMode = 'none') => {
    const sortedManifest = [...newManifest].sort((a, b) => b.weight - a.weight);
    const nextOrder = generateEmptySlots();

    // -- Handle Tail Tip Logic --
    const totalVoids = BOEING_757_SPECS.positions - sortedManifest.length;
    let forcedVoids = [];

    if (currentTailTipMode === 'single' && totalVoids >= BOEING_757_SPECS.tailTipConfig.single.minVoidsRequired) {
      forcedVoids = BOEING_757_SPECS.tailTipConfig.single.forceVoidPositions;
    } else if (currentTailTipMode === 'double' && totalVoids >= BOEING_757_SPECS.tailTipConfig.double.minVoidsRequired) {
      forcedVoids = BOEING_757_SPECS.tailTipConfig.double.forceVoidPositions;
    }

    forcedVoids.forEach(pos => {
      const slot = nextOrder.find(s => s.positionId === pos);
      if (slot) slot.isForcedVoid = true;
    });

    // Place accessible hazmats first at positions 1 and 2
    for (let i = 0; i < sortedManifest.length; i++) {
      if (sortedManifest[i].hazmatType === 'A') {
        for (let p = 0; p < 2; p++) {
          if (!nextOrder[p].uld && !nextOrder[p].isForcedVoid) {
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

        while (backIdx >= 0 && (nextOrder[backIdx].uld || nextOrder[backIdx].isForcedVoid)) {
          backIdx--;
        }
        if (backIdx >= 0) {
          nextOrder[backIdx].uld = sortedManifest[i];
        }
      }
    }

    nextOrder.forEach(slot => delete slot.isForcedVoid);

    setLoadOrder(nextOrder);
    setMacPercent(calculateMacPercent(nextOrder));
  };

  useEffect(() => {
    applyInitialLoad(manifest, tailTipMode);
  }, []);

  const handleRegenerate = (scenario = 'mixed') => {
    const newManifest = generateRandomManifest(BOEING_757_SPECS.positions, scenario);
    setManifest(newManifest);

    // Automatically reset Tail-Tip mode if the new manifest doesn't have enough voids
    const newTotalVoids = BOEING_757_SPECS.positions - newManifest.length;
    let safeTailTipMode = tailTipMode;
    if (tailTipMode === 'double' && newTotalVoids < BOEING_757_SPECS.tailTipConfig.double.minVoidsRequired) safeTailTipMode = 'none';
    if (tailTipMode === 'single' && newTotalVoids < BOEING_757_SPECS.tailTipConfig.single.minVoidsRequired) safeTailTipMode = 'none';

    if (safeTailTipMode !== tailTipMode) setTailTipMode(safeTailTipMode);

    applyInitialLoad(newManifest, safeTailTipMode);
    setBestScore(null);
  };

  const handleTailTipChange = (mode) => {
    setTailTipMode(mode);
    applyInitialLoad(manifest, mode);
  };

  const handleSort = () => {
    if (isSorting) return;
    setIsSorting(true);

    // We run the optimizer async so we don't block the UI entirely
    setTimeout(() => {
      // If profiling is on, run both!
      if (showProfiler) {
        const greedyStart = loadOrder;
        const randomStart = randomizeLoadOrder(loadOrder, tailTipMode);

        const greedyResult = optimizeLoadOrder(
          greedyStart, null, algoParams.maxIterations, tailTipMode, algoParams.temperature, algoParams.coolingRate
        );

        const randomResult = optimizeLoadOrder(
          randomStart, null, algoParams.maxIterations, tailTipMode, algoParams.temperature, algoParams.coolingRate
        );

        setProfilerData({ greedy: greedyResult.history, random: randomResult.history });

        // Adopt the better of the two for the UI
        let bestOfTwo = greedyResult;
        if (randomResult.bestScore < greedyResult.bestScore) {
          bestOfTwo = randomResult;
        }
        setLoadOrder(bestOfTwo.bestOrder);
        setBestScore(bestOfTwo.bestScore);
        setMacPercent(calculateMacPercent(bestOfTwo.bestOrder));

      } else {
        // Normal single run
        let initialOrder = loadOrder;
        if (!algoParams.greedySeed) {
          initialOrder = randomizeLoadOrder(loadOrder, tailTipMode);
        }

        const { bestOrder, bestScore } = optimizeLoadOrder(
          initialOrder,
          null, // progress callback not used sync
          algoParams.maxIterations,
          tailTipMode,
          algoParams.temperature,
          algoParams.coolingRate
        );

        setLoadOrder(bestOrder);
        setBestScore(bestScore);
        setMacPercent(calculateMacPercent(bestOrder));
      }

      setIsSorting(false);
    }, 100);
  };

  if (view === 'landing') {
    return <LandingPage onSelectPlane={handleSelectPlane} onLearnMore={handleLearnMore} />;
  }

  if (view === 'education') {
    return <EducationalPage onBack={() => setView('landing')} />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="cyber-title" style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
          UPS <span>LoadBalancer</span>
        </h1>
        <div className="header-status mono-text">
          {macPercent !== null && (
            <span className="header-mac-badge" style={{ color: 'var(--color-mac-green)', padding: '4px 12px', border: '1px solid var(--color-mac-green)', borderRadius: '4px' }}>
              MAC: {macPercent}%
            </span>
          )}
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
            tailTipMode={tailTipMode}
            onTailTipChange={handleTailTipChange}
            manifest={manifest}
            algoParams={algoParams}
            setAlgoParams={setAlgoParams}
            showProfiler={showProfiler}
            setShowProfiler={setShowProfiler}
          />
        </section>

        {showProfiler && profilerData.greedy && profilerData.random && (
          <ScorePlot
            greedyHistory={profilerData.greedy}
            randomHistory={profilerData.random}
            onClose={() => setShowProfiler(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
