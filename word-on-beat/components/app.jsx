// Main App — orchestrates flow, stage scaling, tweaks

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subtitle": "Anduin Edition",
  "bpmEasy": 150,
  "bpmMedium": 150,
  "bpmHard": 150,
  "beatOffset": 3.45,
  "warmupBars": 2,
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
// ---- Shared game library (Supabase) ----
// SB is created in index.html. Read is public; write requires the curator login.
const SB = window.SB;

async function fetchGames() {
  if (!SB) return [];
  const { data, error } = await SB.from('games')
    .select('data')
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchGames failed:', error); return []; }
  return (data || []).map(r => r.data).filter(Boolean);
}

async function upsertGameRow(game) {
  if (!SB) throw new Error('Database not available');
  const { error } = await SB.from('games')
    .upsert({ id: game.id, name: game.name, data: game });
  if (error) throw error;
}

async function deleteGameRow(id) {
  if (!SB) throw new Error('Database not available');
  const { error } = await SB.from('games').delete().eq('id', id);
  if (error) throw error;
}
function genId() {
  return Math.random().toString(36).slice(2, 10);
}
window.genId = genId;

const DEFAULT_SLOTS = DEFAULT_WORDS.map(w => ({ kind: 'word', label: w }));

// Minimal curator login overlay (single shared admin account).
function CuratorLogin({ onLogin, onClose }) {
  const [email, setEmail] = useStateA('');
  const [password, setPassword] = useStateA('');
  const [error, setError] = useStateA(null);
  const [busy, setBusy] = useStateA(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await onLogin(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  };

  const field = {
    width: '100%', boxSizing: 'border-box', marginTop: 6, marginBottom: 14,
    padding: '10px 12px', borderRadius: 10, fontSize: 15,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
    color: '#f4f0ff', fontFamily: "'Nunito', sans-serif",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(2,3,12,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{
          width: 340, background: 'linear-gradient(180deg, #2a1636, #1c0f26)',
          border: '1px solid rgba(180,165,255,0.35)', borderRadius: 20,
          padding: 28, color: '#f4f0ff', fontFamily: "'Fredoka', sans-serif",
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, marginBottom: 4 }}>
          🔑 Curator login
        </div>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 18 }}>
          Sign in to add, edit, or delete games in the shared library.
        </div>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, opacity: 0.7 }}>
          Email
          <input type="email" value={email} autoFocus
            onChange={(e) => setEmail(e.target.value)} style={field} />
        </label>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, opacity: 0.7 }}>
          Password
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} style={field} />
        </label>
        {error && (
          <div style={{ color: '#ff9a8c', fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}

function App() {
  const persisted = loadPersisted() || {};
  const wasPlaying = persisted.screen === 'play';
  const [screen, setScreen] = useStateA(wasPlaying ? 'title' : (persisted.screen || 'title'));
  const [players, setPlayers] = useStateA(
    persisted.players || ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']
  );
  const [numPlayers, setNumPlayers] = useStateA(persisted.numPlayers || 5);
  const [numTurns, setNumTurns] = useStateA(persisted.numTurns || 3);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useStateA(wasPlaying ? 0 : (persisted.currentPlayerIdx || 0));
  const [currentLevelIdx, setCurrentLevelIdx] = useStateA(wasPlaying ? 0 : (persisted.currentLevelIdx || 0));
  const [mode, setMode] = useStateA(persisted.mode || null);
  const [slots, setSlots] = useStateA(persisted.slots || [null, null, null, null]);
  const [music, setMusic] = useStateA(persisted.music || 'beat');
  const [tweaks, setTweaks] = useStateA(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useStateA(false);
  const [tweaksCollapsed, setTweaksCollapsed] = useStateA(false);
  const [savedGames, setSavedGames] = useStateA([]);
  const [session, setSession] = useStateA(null);
  const [showLogin, setShowLogin] = useStateA(false);
  const isCurator = !!session;
  const [editingGame, setEditingGame] = useStateA(null);
  const [gameLoaded, setGameLoaded] = useStateA(false);
  const [ledMode, setLedMode] = useStateA(false);
  const usedLayoutsRef = useRefA({ easy: new Set(), medium: new Set(), hard: new Set() });

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
  const playerTurnNumber = currentLevelIdx + 1;

  useEffectA(() => {
    persist({ screen, players, numPlayers, numTurns, currentPlayerIdx, currentLevelIdx, mode, slots, music });
  }, [screen, players, numPlayers, numTurns, currentPlayerIdx, currentLevelIdx, mode, slots, music]);

  // Load the shared library + track curator auth session
  const refreshGames = async () => { setSavedGames(await fetchGames()); };
  useEffectA(() => {
    refreshGames();
    if (!SB) return;
    SB.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = SB.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

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
        usedLayoutsRef.current = { easy: new Set(), medium: new Set(), hard: new Set() };
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
    setGameLoaded(false);
    usedLayoutsRef.current = { easy: new Set(), medium: new Set(), hard: new Set() };
    // numPlayers, numTurns, players preserved for replay
  };

  const saveGame = async (name) => {
    const game = {
      id: genId(),
      name,
      mode,
      slots: slots.map(s => s || null),
      bpmEasy: tweaks.bpmEasy,
      bpmMedium: tweaks.bpmMedium,
      bpmHard: tweaks.bpmHard,
      beatOffset: tweaks.beatOffset,
      createdAt: Date.now(),
    };
    try { await upsertGameRow(game); await refreshGames(); }
    catch (e) { window.alert('Could not save game: ' + (e.message || e)); }
  };

  const deleteGame = async (id) => {
    try { await deleteGameRow(id); await refreshGames(); }
    catch (e) { window.alert('Could not delete game: ' + (e.message || e)); }
  };

  // One-time migration: games saved on this device (old localStorage library)
  // that aren't yet in the shared Supabase library.
  const deviceGames = (() => {
    try { return JSON.parse(localStorage.getItem('sayorpay:games') || '[]'); }
    catch { return []; }
  })();
  const libraryIds = new Set(savedGames.map(g => g.id));
  const pendingDeviceGames = deviceGames.filter(g => g && g.id && !libraryIds.has(g.id));

  const importFromDevice = async () => {
    try {
      for (const g of pendingDeviceGames) await upsertGameRow(g);
      await refreshGames();
    } catch (e) { window.alert('Could not import from this device: ' + (e.message || e)); }
  };

  // ---- Curator authentication ----
  const handleLogin = async (email, password) => {
    if (!SB) return 'Database not available';
    const { error } = await SB.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    setShowLogin(false);
    return null;
  };
  const handleLogout = () => { if (SB) SB.auth.signOut(); };

  const loadGameFromLibrary = (game) => {
    setMode(game.mode);
    setSlots(game.slots.map(s => s || null));
    setTweaks(t => ({
      ...t,
      bpmEasy: game.bpmEasy,
      bpmMedium: game.bpmMedium,
      bpmHard: game.bpmHard,
      beatOffset: game.beatOffset,
    }));
    setGameLoaded(true);
    setScreen('playersetup');
  };

  const startNewGame = () => {
    setEditingGame(null);
    setScreen('editor');
  };

  const startEditGame = (game) => {
    setEditingGame(game);
    setScreen('editor');
  };

  const effSlots = slots.map((s, i) => s || DEFAULT_SLOTS[i]);

  const stageRef = useRefA();
  useEffectA(() => {
    const fit = () => {
      const scale = ledMode
        ? Math.min(1024 / 1280, 768 / 800)
        : Math.min(window.innerWidth / 1280, window.innerHeight / 800);
      if (stageRef.current) stageRef.current.style.transform = `scale(${scale})`;
    };
    fit();
    if (!ledMode) {
      window.addEventListener('resize', fit);
      return () => window.removeEventListener('resize', fit);
    }
  }, [ledMode]);

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
            onLibrary={() => setScreen('library')}
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
            onNext={() => setScreen(gameLoaded ? 'play' : 'mode')}
            onBack={() => setScreen(gameLoaded ? 'library' : 'title')}
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
            onSaveToLibrary={isCurator ? ((name) => saveGame(name)) : undefined}
          />
        )}
        {screen === 'library' && (
          <LibraryScreen
            savedGames={savedGames}
            isCurator={isCurator}
            onLogin={() => setShowLogin(true)}
            onLogout={handleLogout}
            deviceImportCount={pendingDeviceGames.length}
            onImportDevice={importFromDevice}
            onLoad={loadGameFromLibrary}
            onEdit={startEditGame}
            onDelete={(id) => {
              if (window.confirm('Delete this game?')) deleteGame(id);
            }}
            onNew={startNewGame}
            onImport={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const imported = JSON.parse(reader.result);
                    const arr = Array.isArray(imported) ? imported : [];
                    const existingIds = new Set(savedGames.map(g => g.id));
                    const fresh = arr.filter(g => g.id && !existingIds.has(g.id));
                    for (const g of fresh) await upsertGameRow(g);
                    await refreshGames();
                  } catch (err) { window.alert('Could not import: ' + (err.message || 'invalid JSON file.')); }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            onExport={() => {
              const blob = new Blob([JSON.stringify(savedGames, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sayorpay-games.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            onBack={() => setScreen('title')}
          />
        )}
        {screen === 'editor' && (
          <GameEditorScreen
            initialGame={editingGame}
            onSave={async (game) => {
              try { await upsertGameRow(game); await refreshGames(); }
              catch (e) { window.alert('Could not save game: ' + (e.message || e)); return; }
              setEditingGame(null);
              setScreen('library');
            }}
            onCancel={() => {
              setEditingGame(null);
              setScreen('library');
            }}
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
            warmupBars={tweaks.warmupBars ?? 2}
            turnNumber={turnNumber}
            totalTurns={totalTurns}
            playerTurnNumber={playerTurnNumber}
            numTurns={numTurns}
            onTurnDone={advanceTurn}
            onReset={reset}
            onBack={() => setScreen(gameLoaded ? 'playersetup' : 'setup')}
            subtitle={tweaks.subtitle}
            autoStart={currentLevelIdx > 0}
            isPlayerDone={currentLevelIdx === numTurns - 1}
            usedLayouts={usedLayoutsRef}
          />
        )}
      </div>

      <button
        onClick={() => {
          setLedMode(v => {
            if (!v) { setShowTweaks(false); setTweaksCollapsed(false); }
            return !v;
          });
        }}
        style={{
          position: 'fixed', left: 12, bottom: 12, zIndex: 999,
          background: ledMode ? 'rgba(140,120,255,0.2)' : 'rgba(10,8,28,0.85)',
          border: ledMode ? '1px solid rgba(180,165,255,0.6)' : '1px solid rgba(255,255,255,0.25)',
          borderRadius: 999,
          padding: '8px 16px',
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: ledMode ? '#c8b8ff' : 'rgba(220,225,255,0.8)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          letterSpacing: 0.5,
        }}
      >
        {ledMode ? '💻 Exit LED' : '📺 LED view'}
      </button>
      {!ledMode && showTweaks && tweaksCollapsed && (
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
      {!ledMode && (
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
        <label>Warmup bars
          <input type="number" min="0" max="8" step="1" value={tweaks.warmupBars ?? 2}
            onChange={(e) => applyTweak('warmupBars', Math.max(0, Math.min(8, Math.round(+e.target.value || 0))))}
            style={{ width: 55 }} />
        </label>
        <div style={{ marginTop: 10, marginBottom: 4, fontWeight: 700, fontSize: 12, color: 'var(--plum)', letterSpacing: 0.5 }}>
          BPM PER LEVEL
        </div>
        <label>🍋 Easy
          <input type="number" min="60" max="180" value={tweaks.bpmEasy ?? 150}
            onChange={(e) => applyTweak('bpmEasy', Math.max(60, Math.min(180, +e.target.value || 150)))}
            style={{ width: 55 }} />
        </label>
        <label>🌶️ Medium
          <input type="number" min="60" max="180" value={tweaks.bpmMedium ?? 150}
            onChange={(e) => applyTweak('bpmMedium', Math.max(60, Math.min(180, +e.target.value || 150)))}
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
      )}
      {showLogin && (
        <CuratorLogin onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
