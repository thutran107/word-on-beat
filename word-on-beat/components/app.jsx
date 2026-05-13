// Main App — orchestrates flow, stage scaling, tweaks

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subtitle": "Anduin Edition",
  "bpmEasy": 120,
  "bpmMedium": 120,
  "bpmHard": 150,
  "beatOffset": 3.25,
  "luxTitle": true
}/*EDITMODE-END*/;

function loadPersisted() {
  try {
    const raw = localStorage.getItem('sayorpay:state');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function persist(state) {
  try { localStorage.setItem('sayorpay:state', JSON.stringify(state)); } catch {}
}

const DEFAULT_SLOTS = DEFAULT_WORDS.map(w => ({ kind: 'word', label: w }));

function App() {
  const persisted = loadPersisted() || {};
  const [screen, setScreen] = useStateA(persisted.screen || 'title');
  const [players, setPlayers] = useStateA(
    persisted.players || ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']
  );
  const [numPlayers, setNumPlayers] = useStateA(persisted.numPlayers || 5);
  const [numTurns, setNumTurns] = useStateA(persisted.numTurns || 3);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useStateA(persisted.currentPlayerIdx || 0);
  const [currentLevelIdx, setCurrentLevelIdx] = useStateA(persisted.currentLevelIdx || 0);
  const [mode, setMode] = useStateA(persisted.mode || null);
  const [slots, setSlots] = useStateA(persisted.slots || [null, null, null, null]);
  const [music, setMusic] = useStateA(persisted.music || 'beat');
  const [tweaks, setTweaks] = useStateA(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useStateA(false);
  const [tweaksCollapsed, setTweaksCollapsed] = useStateA(false);

  // Derived: current level config with BPM override from tweaks
  const activeLevels = LEVEL_CONFIG.slice(0, numTurns);
  const baseLevelCfg = activeLevels[currentLevelIdx] || LEVEL_CONFIG[0];
  const levelCfg = {
    ...baseLevelCfg,
    bpm: tweaks[`bpm${baseLevelCfg.label}`] ?? baseLevelCfg.bpm,
  };
  const playerName = players[currentPlayerIdx] || `Player ${currentPlayerIdx + 1}`;
  const totalTurns = numPlayers * numTurns;
  const turnNumber = currentPlayerIdx * numTurns + currentLevelIdx + 1;

  useEffectA(() => {
    persist({ screen, players, numPlayers, numTurns, currentPlayerIdx, currentLevelIdx, mode, slots, music });
  }, [screen, players, numPlayers, numTurns, currentPlayerIdx, currentLevelIdx, mode, slots, music]);

  useEffectA(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setShowTweaks(true);
      if (d.type === '__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffectA(() => {
    const handler = (e) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowTweaks(v => !v);
        setTweaksCollapsed(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const applyTweak = (key, value) => {
    const next = { ...tweaks, [key]: value };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
  };

  const setPlayer = (idx, val) => {
    setPlayers(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const setSlot = (idx, val) => {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const advanceTurn = () => {
    const nextLevel = currentLevelIdx + 1;
    if (nextLevel < numTurns) {
      setCurrentLevelIdx(nextLevel);
    } else {
      const nextPlayer = currentPlayerIdx + 1;
      setCurrentLevelIdx(0);
      if (nextPlayer < numPlayers) {
        setCurrentPlayerIdx(nextPlayer);
      } else {
        // All turns complete — reset indices and return to title
        setCurrentPlayerIdx(0);
        setCurrentLevelIdx(0);
        setScreen('title');
      }
    }
  };

  const reset = () => {
    setScreen('title');
    setMode(null);
    setSlots([null, null, null, null]);
    setCurrentPlayerIdx(0);
    setCurrentLevelIdx(0);
    // numPlayers, numTurns, players preserved for replay
  };

  const effSlots = slots.map((s, i) => s || DEFAULT_SLOTS[i]);

  const stageRef = useRefA();
  useEffectA(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const scale = Math.min(w / 1280, h / 800);
      if (stageRef.current) stageRef.current.style.transform = `scale(${scale})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const mascotsActive = screen === 'play';
  const [speakerActive, setSpeakerActive] = useStateA(false);

  useEffectA(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === 'beat-playing') setSpeakerActive(!!d.playing);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="stage-wrap">
      <StageMascots active={mascotsActive && speakerActive} />
      <div className="stage" ref={stageRef} data-screen-label={`01 ${screen}`}>
        {screen === 'title' && (
          <TitleScreen
            onStart={() => setScreen('playersetup')}
            numPlayers={numPlayers}
            numTurns={numTurns}
            subtitle={tweaks.subtitle}
            lux={tweaks.luxTitle}
          />
        )}
        {screen === 'playersetup' && (
          <PlayerSetupScreen
            players={players}
            setPlayer={setPlayer}
            numPlayers={numPlayers}
            setNumPlayers={setNumPlayers}
            numTurns={numTurns}
            setNumTurns={setNumTurns}
            onNext={() => setScreen('mode')}
            onBack={() => setScreen('title')}
          />
        )}
        {screen === 'mode' && (
          <ModeSelect
            mode={mode} setMode={setMode}
            numOptions={4}
            onNext={() => setScreen('setup')}
            onBack={() => setScreen('playersetup')}
          />
        )}
        {screen === 'setup' && (
          <ContentSetup
            mode={mode}
            slots={slots} setSlot={setSlot}
            numOptions={4}
            onNext={() => setScreen('play')}
            onBack={() => setScreen('mode')}
          />
        )}
        {screen === 'play' && (
          <PlayScreen
            key={`${currentPlayerIdx}-${currentLevelIdx}`}
            slots={effSlots}
            music={music}
            playerName={playerName}
            levelCfg={levelCfg}
            beatOffset={tweaks.beatOffset ?? 4}
            turnNumber={turnNumber}
            totalTurns={totalTurns}
            onTurnDone={advanceTurn}
            onReset={reset}
            onBack={() => setScreen('setup')}
            subtitle={tweaks.subtitle}
            autoStart={currentLevelIdx > 0}
            isPlayerDone={currentLevelIdx === numTurns - 1}
          />
        )}
      </div>

      {showTweaks && tweaksCollapsed && (
        <button
          onClick={() => setTweaksCollapsed(false)}
          style={{
            position: 'fixed', right: 20, bottom: 20, zIndex: 999,
            background: 'var(--cream)', border: '2px solid var(--plum)',
            borderRadius: 999, padding: '10px 16px',
            fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 13,
            color: 'var(--plum)', cursor: 'pointer',
            boxShadow: '0 4px 0 var(--plum-deep)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          aria-label="Show Tweaks"
        >
          <span style={{ fontSize: 15 }}>⚙</span> Tweaks
        </button>
      )}
      <div className={`tweaks ${showTweaks && !tweaksCollapsed ? 'visible' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h4 style={{ margin: 0 }}>Tweaks</h4>
          <button
            onClick={() => setTweaksCollapsed(true)}
            title="Minimize"
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 18, lineHeight: 1, color: 'var(--plum)',
              padding: '2px 6px', fontWeight: 900,
            }}
          >−</button>
        </div>
        <label>Subtitle
          <input type="text" value={tweaks.subtitle}
            onChange={(e) => applyTweak('subtitle', e.target.value)}
            style={{ width: 120 }} />
        </label>
        <label>Lux title
          <input type="checkbox" checked={!!tweaks.luxTitle}
            onChange={(e) => applyTweak('luxTitle', e.target.checked)} />
        </label>
        <label>Music
          <select value={music} onChange={(e) => setMusic(e.target.value)}
            style={{ width: 80, padding: '2px 4px' }}>
            <option value="beat">Beat</option>
            <option value="none">Off</option>
          </select>
        </label>
        <label>Beat offset (s)
          <input type="number" min="0" max="10" step="0.1" value={tweaks.beatOffset ?? 4}
            onChange={(e) => applyTweak('beatOffset', Math.max(0, +e.target.value || 0))}
            style={{ width: 55 }} />
        </label>
        <div style={{ marginTop: 10, marginBottom: 4, fontWeight: 700, fontSize: 12, color: 'var(--plum)', letterSpacing: 0.5 }}>
          BPM PER LEVEL
        </div>
        <label>🍋 Easy
          <input type="number" min="60" max="180" value={tweaks.bpmEasy ?? 90}
            onChange={(e) => applyTweak('bpmEasy', Math.max(60, Math.min(180, +e.target.value || 90)))}
            style={{ width: 55 }} />
        </label>
        <label>🌶️ Medium
          <input type="number" min="60" max="180" value={tweaks.bpmMedium ?? 120}
            onChange={(e) => applyTweak('bpmMedium', Math.max(60, Math.min(180, +e.target.value || 120)))}
            style={{ width: 55 }} />
        </label>
        <label>🌟 Hard
          <input type="number" min="60" max="180" value={tweaks.bpmHard ?? 150}
            onChange={(e) => applyTweak('bpmHard', Math.max(60, Math.min(180, +e.target.value || 150)))}
            style={{ width: 55 }} />
        </label>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <button className="btn ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={reset}>RESET</button>
          <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setScreen('play')}>JUMP TO PLAY</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
