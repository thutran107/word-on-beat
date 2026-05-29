// Screens: Title, PlayerSetup, DifficultySelect, ModeSelect, ContentSetup, GridSize, Play
// Quiz-app theme: cream/butter/coral/mint/peri. No sea creatures.
// Beat-driven card reveals synced to uploaded mp3.

const { useState, useRef, useEffect, useMemo } = React;

const DIFFICULTY_LEVELS = [
  { id: 'easy',   label: 'Easy',   sub: 'Level 1', options: 2, bpm: 90,  emoji: '🍋', color: '#ffd96b' },
  { id: 'medium', label: 'Medium', sub: 'Level 2', options: 3, bpm: 120, emoji: '🌶️', color: '#f5ad86' },
  { id: 'hard',   label: 'Hard',   sub: 'Level 3', options: 4, bpm: 150, emoji: '🌟', color: '#e85b4a' },
];

const LEVEL_CONFIG = [
  { id: 'easy',   label: 'Easy',   emoji: '🍋', rows: 2, cols: 4, numOptions: 2, bpm: 120 },
  { id: 'medium', label: 'Medium', emoji: '🌶️', rows: 2, cols: 4, numOptions: 3, bpm: 120 },
  { id: 'hard',   label: 'Hard',   emoji: '🌟', rows: 2, cols: 4, numOptions: 4, bpm: 150 },
];

// Option palette — mapped to option A/B/C/D
const OPTION_COLORS = ['#ffd96b', '#e85b4a', '#a7dcb4', '#b8b9f0'];
const OPTION_TINT   = ['#fff5ce', '#fbd5cf', '#dcf0e1', '#e1e1fa'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const DEFAULT_WORDS = ['CAP', 'CLAP', 'TAP', 'NAP'];

const BEAT_TRACK_URL = 'uploads/beat.mp3';
// Seconds of intro in the track before the first beat hit
const AUDIO_BEAT_OFFSET_S = 3.25;

// ---------- Title ----------
const TitleScreen = ({ onStart, onLibrary, numPlayers, numTurns, subtitle, lux }) => {
  if (lux) {
    return (
      <div className="title-lux">
        <div className="nebula a" />
        <div className="nebula b" />
        <div className="nebula c" />
        <div className="stars" />
        <div className="stars b" />
        <div className="planet" />
        <div className="shooting-star" />
        <div className="scan" />
        <div className="grain" />

        {/* Top nav */}
        <div style={{ position: 'absolute', top: 28, left: 36, right: 36,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
          <div className="liquid-glass lux-chip">
            <span style={{ width: 6, height: 6, borderRadius: '50%',
              background: '#7af0c8', boxShadow: '0 0 10px #7af0c8' }} />
            {subtitle}
          </div>
          <div className="liquid-glass lux-chip">
            <span className="mono">{numPlayers}P</span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span className="mono">{numTurns}L</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 60, zIndex: 2 }}>
          <div className="lux-kicker" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1, background: 'rgba(180,200,255,0.5)' }} />
            A rhythm transmission · Vol. 01
            <span style={{ display: 'inline-block', width: 28, height: 1, background: 'rgba(180,200,255,0.5)' }} />
          </div>

          <h1 className="lux-headline" style={{ margin: 0 }}>
            Beat <em style={{ fontSize: '0.55em', verticalAlign: '0.18em' }}>on the</em> Mic
          </h1>

          <div className="lux-sub" style={{ marginTop: 28, maxWidth: 640 }}>
            Speak the word the moment the beacon pulses.<br/>
            Miss the signal — and you drift.
          </div>

          <button className="lux-cta" style={{ marginTop: 44 }} onClick={onStart}>
            Launch sequence
            <span className="dot">→</span>
          </button>
          <button
            onClick={onLibrary}
            style={{
              marginTop: 16,
              background: 'transparent',
              border: '1px solid rgba(180,165,255,0.4)',
              borderRadius: 999,
              padding: '10px 28px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: 'rgba(220,225,255,0.7)',
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            📚 Saved games
          </button>
        </div>

        {/* Bottom metadata */}
        <div style={{ position: 'absolute', bottom: 32, left: 36, right: 36,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 3 }}>
          <div className="lux-kicker" style={{ fontSize: 10 }}>
            <span className="mono" style={{ letterSpacing: 2 }}>SEC.01 / TITLE</span><br/>
            <span style={{ opacity: 0.6, letterSpacing: 2 }}>Awaiting input</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['A','B','C','D'].map((l) => (
              <div key={l} className="liquid-glass" style={{
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Instrument Serif', fontStyle: 'italic',
                color: 'rgba(220,225,255,0.8)', fontSize: 16,
              }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--cream)' }}>
      <div className="confetti-bg" />
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ position: 'absolute', top: 28, right: 36 }}>
          <div className="q-badge">{numPlayers}P · {numTurns}L</div>
        </div>
        <div style={{ position: 'absolute', top: 28, left: 36 }}>
          <div className="pill-chip">★ {subtitle}</div>
        </div>

        <div style={{ position: 'relative', marginBottom: 36 }}>
          <div style={{ position: 'absolute', top: 8, left: -30, width: 60, height: 80, background: 'var(--butter)', borderRadius: 14, transform: 'rotate(-8deg)', boxShadow: '0 6px 16px rgba(59,30,74,0.15)' }} />
          <div style={{ position: 'absolute', top: 6, right: -26, width: 60, height: 80, background: 'var(--mint)', borderRadius: 14, transform: 'rotate(10deg)', boxShadow: '0 6px 16px rgba(59,30,74,0.15)' }} />
          <div style={{ position: 'absolute', top: -20, right: 40, width: 48, height: 48, background: 'var(--peri)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -10, left: 40, width: 36, height: 36, background: 'var(--coral)', borderRadius: '50%' }} />
          <h1 style={{ fontSize: 120, letterSpacing: '-2px', lineHeight: 1, position: 'relative', zIndex: 2, textAlign: 'center', whiteSpace: 'nowrap', padding: '0 20px' }}>
            Beat on the Mic
          </h1>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 560, color: 'var(--plum)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Say the word on the beat.</div>
          <div style={{ fontSize: 18, opacity: 0.75 }}>Miss the beat? You pay.</div>
        </div>

        <button className="btn primary" style={{ marginTop: 40, fontSize: 22, padding: '18px 50px' }} onClick={onStart}>
          Let's play →
        </button>
        <button className="btn ghost" style={{ marginTop: 12, fontSize: 16 }} onClick={onLibrary}>
          📚 Saved games
        </button>
      </div>
    </div>
  );
};

// ---------- Player Setup ----------
const PlayerSetupScreen = ({ players, setPlayer, numPlayers, setNumPlayers, numTurns, setNumTurns, onNext, onBack }) => {
  const canContinue = Array.from({ length: numPlayers }).every((_, i) => (players[i] || '').trim().length > 0);
  const LEVEL_LABELS = ['Easy only', 'Easy + Medium', 'All 3 levels'];

  return (
    <ScreenShell qBadge="Q1" title="Who's playing?" subtitle="Set up players and levels" onBack={onBack}>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Config: player count + turns per player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="soft-card" style={{ minWidth: 220 }}>
            <div className="heading" style={{ fontSize: 20, marginBottom: 12 }}>Players</div>
            <Stepper value={numPlayers} min={2} max={5} onChange={setNumPlayers} />
          </div>
          <div className="soft-card" style={{ minWidth: 220 }}>
            <div className="heading" style={{ fontSize: 20, marginBottom: 4 }}>Levels per player</div>
            <div style={{ fontSize: 12, color: 'rgba(220,225,255,0.55)', marginBottom: 12, fontFamily: 'Nunito', fontWeight: 700 }}>
              {LEVEL_LABELS[numTurns - 1]}
            </div>
            <Stepper value={numTurns} min={1} max={3} onChange={setNumTurns} />
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LEVEL_CONFIG.slice(0, numTurns).map(lvl => (
                <div key={lvl.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Nunito', fontSize: 12, color: 'rgba(220,225,255,0.7)', fontWeight: 700 }}>
                  <span>{lvl.emoji}</span>
                  <span>{lvl.label}</span>
                  <span style={{ opacity: 0.5 }}>· {lvl.rows}×{lvl.cols} · {lvl.bpm} BPM</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player name inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320, maxWidth: 400 }}>
          {Array.from({ length: numPlayers }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: OPTION_COLORS[i % 4],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Nunito', fontWeight: 900, fontSize: 15, color: '#1a0e24',
                flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {i + 1}
              </div>
              <input
                className="word-input"
                style={{ flex: 1, fontFamily: 'Fredoka, sans-serif', letterSpacing: 0.5,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#f4f0ff' }}
                placeholder={`Player ${i + 1}`}
                value={players[i] || ''}
                onChange={e => setPlayer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
        <button className="btn primary" onClick={onNext} disabled={!canContinue}>
          Start game →
        </button>
      </div>
    </ScreenShell>
  );
};

// ---------- Difficulty (kept, not in main flow) ----------
const DifficultySelect = ({ difficulty, setDifficulty, onNext, onBack }) => (
  <ScreenShell qBadge="Q1" title="Pick your level" subtitle="More options = harder rhythm" onBack={onBack}>
    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
      {DIFFICULTY_LEVELS.map(lvl => (
        <div key={lvl.id}
          className={`option-card ${difficulty === lvl.id ? 'selected' : ''}`}
          onClick={() => setDifficulty(lvl.id)}>
          <div style={{ width: 84, height: 84, margin: '0 auto 14px',
            background: lvl.color, borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
            {lvl.emoji}
          </div>
          <div className="heading" style={{ fontSize: 28 }}>{lvl.label}</div>
          <div style={{ fontSize: 13, color: '#8a7a8a', marginTop: 2, fontWeight: 700 }}>{lvl.sub}</div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {Array.from({ length: lvl.options }).map((_, i) => (
              <div key={i} style={{ width: 20, height: 20, borderRadius: 6,
                background: OPTION_COLORS[i] }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#6a586a', marginTop: 10, fontWeight: 600 }}>
            {lvl.options} options · {lvl.bpm} BPM
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
      <button className="btn primary" onClick={onNext} disabled={!difficulty}>Next →</button>
    </div>
  </ScreenShell>
);

// ---------- Mode ----------
const ModeSelect = ({ mode, setMode, onNext, onBack, numOptions }) => (
  <ScreenShell qBadge="Q2" title="Pick your content" subtitle={`Set up ${numOptions} options to say on the beat`} onBack={onBack}>
    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 30 }}>
      <div className={`option-card ${mode === 'images' ? 'selected' : ''}`} style={{ width: 280 }} onClick={() => setMode('images')}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numOptions,2)}, 1fr)`, gap: 8, marginBottom: 16 }}>
          {Array.from({ length: numOptions }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: OPTION_TINT[i],
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
              {['🍋','🌶️','🧀','🍓'][i]}
            </div>
          ))}
        </div>
        <div className="heading" style={{ fontSize: 26 }}>Images</div>
        <div style={{ fontSize: 14, color: '#6a586a', marginTop: 4, fontWeight: 600 }}>Upload {numOptions} pictures</div>
      </div>
      <div className={`option-card ${mode === 'words' ? 'selected' : ''}`} style={{ width: 280 }} onClick={() => setMode('words')}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numOptions,2)}, 1fr)`, gap: 8, marginBottom: 16 }}>
          {Array.from({ length: numOptions }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: OPTION_TINT[i],
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Gloock, serif', fontSize: 22, color: 'var(--plum)' }}>
              {DEFAULT_WORDS[i]}
            </div>
          ))}
        </div>
        <div className="heading" style={{ fontSize: 26 }}>Words</div>
        <div style={{ fontSize: 14, color: '#6a586a', marginTop: 4, fontWeight: 600 }}>Type {numOptions} words</div>
      </div>
    </div>
    <div style={{ marginTop: 44, display: 'flex', justifyContent: 'center' }}>
      <button className="btn primary" onClick={onNext} disabled={!mode}>Next →</button>
    </div>
  </ScreenShell>
);

// ---------- Content Setup ----------
const ContentSetup = ({ mode, slots, setSlot, onNext, onBack, numOptions, onSaveToLibrary }) => {
  const fileRefs = useRef([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedConfirm, setSavedConfirm] = useState(false);

  const handleFile = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSlot(idx, { kind: 'image', src: reader.result, label: file.name.replace(/\.[^.]+$/, '').slice(0, 16) });
    reader.readAsDataURL(file);
  };

  const renderSlot = (idx) => {
    const slot = slots[idx];
    const header = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: OPTION_COLORS[idx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: '#1a0e24',
          boxShadow: '0 0 16px rgba(255,255,255,0.15)' }}>
          {OPTION_LABELS[idx]}
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#f4f0ff',
          textShadow: '0 0 20px rgba(140,120,255,0.35)' }}>
          Option {OPTION_LABELS[idx]}
        </div>
      </div>
    );

    if (mode === 'images') {
      return (
        <div style={{ width: 230 }} key={idx}>
          {header}
          <div className={`upload-slot ${slot?.src ? 'filled' : ''}`}
            onClick={() => !slot?.src && fileRefs.current[idx]?.click()}>
            {slot?.src ? (
              <>
                <img src={slot.src} alt="" />
                <button className="remove" onClick={(e) => { e.stopPropagation(); setSlot(idx, null); }}>✕</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 34, opacity: 0.85 }}>📷</div>
                <div style={{ fontWeight: 700, color: 'rgba(220,225,255,0.85)', fontSize: 14 }}>Click to upload</div>
              </>
            )}
            <input type="file" accept="image/*"
              ref={el => (fileRefs.current[idx] = el)}
              style={{ display: 'none' }}
              onChange={(e) => handleFile(idx, e)} />
          </div>
        </div>
      );
    }
    return (
      <div style={{ width: 230 }} key={idx}>
        {header}
        <input className="word-input"
          style={{ fontFamily: 'Gloock, serif', letterSpacing: 1, textAlign: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
            color: '#f4f0ff' }}
          placeholder={DEFAULT_WORDS[idx]}
          value={slot?.label || ''}
          onChange={(e) => setSlot(idx, { kind: 'word', label: e.target.value })} />
        <div style={{ marginTop: 10,
          height: 130, borderRadius: 18,
          background: `linear-gradient(180deg, ${OPTION_COLORS[idx]}33 0%, rgba(255,255,255,0.04) 100%)`,
          border: `1px solid ${OPTION_COLORS[idx]}55`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 28px ${OPTION_COLORS[idx]}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Instrument Serif, serif', fontSize: 38, color: '#f4f0ff', letterSpacing: 2,
          textShadow: `0 0 20px ${OPTION_COLORS[idx]}aa`,
        }}>
          {(slot?.label || '—').toUpperCase().slice(0, 10)}
        </div>
      </div>
    );
  };

  const canContinue = mode === 'images'
    ? slots.slice(0, numOptions).every(s => s?.src)
    : slots.slice(0, numOptions).every(s => s?.label?.trim());

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ScreenShell
        qBadge="Q3"
        title={mode === 'images' ? `Upload ${numOptions} images` : `Type ${numOptions} words`}
        subtitle={mode === 'images' ? 'These are your beat-callouts' : 'Short snappy words work best'}
        onBack={onBack}
      >
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'flex-start',
          flexWrap: 'wrap', maxWidth: 1100, margin: '24px auto 0' }}>
          {Array.from({ length: numOptions }).map((_, i) => renderSlot(i))}
        </div>
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {onSaveToLibrary && (
            <button
              className="btn ghost"
              style={{ fontSize: 15 }}
              disabled={!canContinue}
              onClick={() => { setSaveName(''); setShowSaveModal(true); setSavedConfirm(false); }}
            >
              💾 Save to library
            </button>
          )}
          <button className="btn primary" onClick={onNext} disabled={!canContinue}>Next →</button>
        </div>
      </ScreenShell>

      {showSaveModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,8,28,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSaveModal(false); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowSaveModal(false); }}
          tabIndex={-1}
        >
          <div style={{
            background: 'rgba(20,16,48,0.98)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 36,
            width: 360,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <h3 style={{ margin: 0, fontFamily: 'Instrument Serif, serif', color: '#f4f0ff', fontSize: 26 }}>
              Save to library
            </h3>
            <input
              className="word-input"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#f4f0ff' }}
              placeholder="Game name…"
              value={saveName}
              autoFocus
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && saveName.trim()) {
                  onSaveToLibrary(saveName.trim());
                  setSavedConfirm(true);
                  setTimeout(() => setShowSaveModal(false), 1200);
                }
                if (e.key === 'Escape') setShowSaveModal(false);
              }}
            />
            {savedConfirm ? (
              <div style={{ textAlign: 'center', color: '#a7dcb4', fontFamily: 'Nunito', fontWeight: 800, fontSize: 16 }}>
                ✓ Saved to library!
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn primary"
                  style={{ flex: 1, fontSize: 15 }}
                  disabled={!saveName.trim()}
                  onClick={() => {
                    onSaveToLibrary(saveName.trim());
                    setSavedConfirm(true);
                    setTimeout(() => setShowSaveModal(false), 1200);
                  }}
                >
                  Save
                </button>
                <button className="btn ghost" style={{ fontSize: 15 }} onClick={() => setShowSaveModal(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Grid + music (kept, not in main flow) ----------
const MUSIC_OPTIONS = [
  { id: 'beat',  label: '🎵 Beat Track', useFile: true },
  { id: 'none',  label: '🔇 No music', useFile: false, tempo: 0 },
];

const GridSizeScreen = ({ rows, cols, setRows, setCols, music, setMusic, slots, numOptions, bpm, setBpm, onNext, onBack }) => (
  <ScreenShell qBadge="Q4" title="Grid & vibes" subtitle="How fast should the beat roll?" onBack={onBack}>
    <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 340 }}>
        <div className="soft-card">
          <div className="heading" style={{ fontSize: 22, marginBottom: 10 }}>Rows</div>
          <Stepper value={rows} min={1} max={5} onChange={setRows} />
          <div className="heading" style={{ fontSize: 22, marginTop: 16, marginBottom: 10 }}>Columns</div>
          <Stepper value={cols} min={1} max={6} onChange={setCols} />
          <div className="meta-dim" style={{ fontSize: 13, marginTop: 14, fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: 0.4 }}>
            Total tiles: <b style={{ color: '#f4f0ff' }}>{rows * cols}</b> · split across <b style={{ color: '#f4f0ff' }}>{numOptions}</b> options
          </div>
        </div>

        <div className="soft-card">
          <div className="heading" style={{ fontSize: 22, marginBottom: 12 }}>Music</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MUSIC_OPTIONS.map(m => (
              <div key={m.id} className={`music-chip ${music === m.id ? 'active' : ''}`} onClick={() => setMusic(m.id)}>
                {m.label}
                {music === m.id && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="meta-dim" style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: 'Nunito, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
              Beat tempo · <span style={{ color: '#f4f0ff', fontFamily: 'Instrument Serif, serif', fontSize: 18, letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}>{bpm} BPM</span>
            </div>
            <input type="range" min="60" max="180" value={bpm}
              onChange={(e) => setBpm(+e.target.value)}
              style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 560 }}>
        <div className="heading" style={{ fontSize: 22, marginBottom: 10, fontFamily: 'Instrument Serif, serif', color: '#f4f0ff' }}>Live preview</div>
        <div className="soft-card" style={{ padding: 16 }}>
          <GridPreview rows={rows} cols={cols} slots={slots} numOptions={numOptions} />
        </div>
      </div>
    </div>

    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
      <button className="btn primary" onClick={onNext}>Launch game →</button>
    </div>
  </ScreenShell>
);

const Stepper = ({ value, min, max, onChange }) => (
  <div className="stepper">
    <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
    <div className="value">{value}</div>
    <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
  </div>
);

const GridPreview = ({ rows, cols, slots, numOptions }) => {
  const previewDifficulty = numOptions <= 2 ? 'easy' : numOptions === 3 ? 'medium' : 'hard';
  const tiles = generateTiles(rows * cols, slots.slice(0, numOptions), previewDifficulty);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 6,
      width: '100%',
      aspectRatio: `${cols}/${rows}`,
      maxHeight: 340,
    }}>
      {tiles.map((t, i) => {
        const accent = OPTION_COLORS[t?._optIdx ?? 0];
        return (
          <div key={i} style={{
            borderRadius: 10,
            background: t?.kind === 'image' && t?.src
              ? 'rgba(255,255,255,0.04)'
              : `radial-gradient(circle at 50% 30%, ${accent}30 0%, ${accent}12 55%, rgba(255,255,255,0.03) 100%)`,
            boxShadow: `inset 0 0 0 1px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.12)`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Instrument Serif, serif', fontSize: 13, color: '#f4f0ff',
            textShadow: `0 0 14px ${accent}aa`, letterSpacing: 0.5,
          }}>
            {t?.kind === 'image' && t?.src
              ? <img src={t.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (t?.label || '').toUpperCase().slice(0, 6)}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Play ----------
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, warmupBars, turnNumber, totalTurns, playerTurnNumber, numTurns, onTurnDone, onReset, onBack, subtitle, autoStart, skipIntro, isPlayerDone, usedLayouts }) => {
  const { rows, cols, numOptions, bpm: levelBpm } = levelCfg;
  const activeSlots = slots.slice(0, numOptions);
  const total = rows * cols;

  const generateUniqueTiles = () => {
    const levelId = levelCfg.id;
    const seen = usedLayouts?.current?.[levelId];
    let candidate = generateTiles(total, activeSlots, levelId);
    let recorded = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      candidate = generateTiles(total, activeSlots, levelId);
      if (!seen) break;
      const key = candidate.map(t => `${t.label}::${t.src || ''}`).join('|');
      if (!seen.has(key)) {
        seen.add(key);
        recorded = true;
        break;
      }
    }
    if (seen && !recorded) {
      seen.add(candidate.map(t => `${t.label}::${t.src || ''}`).join('|'));
    }
    return candidate;
  };

  const [tiles, setTiles] = useState(() => generateUniqueTiles());
  const [beatIdx, setBeatIdx] = useState(-1);
  const [playing, setPlaying] = useState(!!autoStart);
  const [showHit, setShowHit] = useState(false);
  const [beatPing, setBeatPing] = useState(false);
  const [intro, setIntro] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [turnDone, setTurnDone] = useState(false);

  const audioRef = useRef(null);
  const rAFRef = useRef(null);
  const lastBeatRef = useRef(-1);
  const flashTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const introTimerRef = useRef(null);

  const reshuffle = () => {
    setTiles(generateUniqueTiles());
    setBeatIdx(-1);
    lastBeatRef.current = -1;
  };

  useEffect(() => { reshuffle(); /* eslint-disable-next-line */ },
    [rows, cols, numOptions, JSON.stringify(activeSlots.map(s => s?.label + (s?.src || '')))]);

  const useFileTrack = music === 'beat';
  const effectiveBpm = levelBpm || 100;
  const popDur = Math.max(0.18, (60 / effectiveBpm) * 0.55);
  const flashDur = Math.max(0.15, (60 / effectiveBpm) * 0.45);
  const hitScale = levelCfg.id === 'hard' ? 1.15 : levelCfg.id === 'medium' ? 1.10 : 1.06;
  const beatInterval_ms = 60000 / effectiveBpm;
  const beatInterval_s  = 60    / effectiveBpm;
  const warmupBeats = (warmupBars ?? 2) * 4;
  const effectiveWarmupBeats = skipIntro ? 0 : warmupBeats;

  useEffect(() => {
    if (!playing) {
      clearInterval(introTimerRef.current);
      cancelAnimationFrame(rAFRef.current);
      clearTimeout(flashTimerRef.current);
      clearTimeout(pingTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
      setIntro(0);
      setCountdown(null);
      window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
      return;
    }

    setTurnDone(false);
    lastBeatRef.current = -1;

    if (!skipIntro) setIntro(1);
    setCountdown(null);

    if (useFileTrack && audioRef.current) {
      // Level transitions skip waiting notes and jump straight to the beat
      audioRef.current.currentTime = skipIntro ? (beatOffset ?? AUDIO_BEAT_OFFSET_S) : 0;
      audioRef.current.play()?.catch(() => {});
    }
    window.parent.postMessage({ type: 'beat-playing', playing: true }, '*');

    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;

      const elapsed = audio.currentTime - (beatOffset ?? AUDIO_BEAT_OFFSET_S);
      if (elapsed < 0) {
        rAFRef.current = requestAnimationFrame(tick);
        return;
      }

      const b = Math.floor(elapsed / beatInterval_s);

      if (b !== lastBeatRef.current) {
        lastBeatRef.current = b;

        if (b < effectiveWarmupBeats) {
          // Warmup phase: pulse the beat dot and update the beat-synced counter
          setCountdown((b % 4) + 1);
          setBeatPing(true);
          clearTimeout(pingTimerRef.current);
          pingTimerRef.current = setTimeout(() => setBeatPing(false), 180);
        } else {
          // First game beat: hide the overlay
          if (b >= effectiveWarmupBeats) {
            setIntro(0);
            setCountdown(null);
          }

          const tileB = b - effectiveWarmupBeats;
          if (tileB < total) {
            setBeatIdx(tileB);
            setShowHit(true);
            setBeatPing(true);
            clearTimeout(flashTimerRef.current);
            clearTimeout(pingTimerRef.current);
            flashTimerRef.current = setTimeout(
              () => setShowHit(false),
              Math.min(220, beatInterval_ms * 0.7)
            );
            pingTimerRef.current = setTimeout(() => setBeatPing(false), 180);
          } else {
            audioRef.current?.pause();
            rAFRef.current = null;
            setPlaying(false);
            setTurnDone(true);
            window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
            return;
          }
        }
      }

      rAFRef.current = requestAnimationFrame(tick);
    };
    rAFRef.current = requestAnimationFrame(tick);

    return () => {
      clearInterval(introTimerRef.current);
      cancelAnimationFrame(rAFRef.current);
      clearTimeout(flashTimerRef.current);
      clearTimeout(pingTimerRef.current);
      window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
    };
    // eslint-disable-next-line
  }, [playing, beatInterval_s, beatInterval_ms, useFileTrack, total, effectiveWarmupBeats]);

  const startOrPause = () => {
    if (turnDone) return;
    setPlaying(p => !p);
  };

  // Auto-advance only within same player's levels; player transitions need a button
  useEffect(() => {
    if (!turnDone || isLastTurn || isPlayerDone) return;
    const timer = setTimeout(onTurnDone, 5000);
    return () => clearTimeout(timer);
  }, [turnDone]);

  // Tile sizing — fill play area
  const maxGridW = 1160;
  const maxGridH = 520;
  const tileW = Math.min(maxGridW / cols, maxGridH / rows);
  const gridW = tileW * cols;
  const gridH = tileW * rows;

  const isLastTurn = turnNumber >= totalTurns;

  return (
    <div className="shell-cosmic" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column',
        padding: '16px 40px 20px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn ghost" onClick={onBack}>← Back</button>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="q-badge">{levelCfg.emoji} {levelCfg.label}</div>
            <h2 style={{ fontSize: 32, whiteSpace: 'nowrap', lineHeight: 1, fontFamily: 'Instrument Serif, serif',
              fontWeight: 400, color: '#f4f0ff', textShadow: '0 0 40px rgba(140,120,255,0.35)', margin: 0 }}>
              {playerName}
            </h2>
            <div style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(220,225,255,0.85)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13,
              backdropFilter: 'blur(8px)' }}>★ {subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className={`beat-dot ${beatPing ? 'ping' : ''}`} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: showHit ? '#8c7aff' : 'rgba(180,165,255,0.5)',
              boxShadow: showHit ? '0 0 18px rgba(140,120,255,0.85), 0 0 0 1px rgba(255,255,255,0.4)' : '0 0 0 1px rgba(255,255,255,0.18)',
              transition: 'background 0.1s, box-shadow 0.1s',
            }} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, color: 'rgba(220,225,255,0.85)', fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {effectiveBpm} BPM
            </span>
          </div>
        </div>

        {/* Turn counter */}
        <div style={{ textAlign: 'center', marginTop: 2, marginBottom: 2 }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11,
            color: 'rgba(220,225,255,0.45)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Turn {playerTurnNumber} of {numTurns}
          </span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, minHeight: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 12,
            width: gridW,
            height: gridH,
            '--pop-dur': `${popDur}s`,
            '--flash-dur': `${flashDur}s`,
            '--hit-scale': hitScale,
          }}>
            {tiles.map((t, i) => (
              <Tile key={i} tile={t}
                isVisible={true}
                isBeatHit={showHit && beatIdx === i}
                justPopped={beatIdx === i && showHit}
                dimmed={beatIdx >= 0 && beatIdx !== i}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ margin: '0 auto 12px', width: '60%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, ((beatIdx + 1) / total) * 100)}%`,
              background: 'linear-gradient(90deg, #8c7aff, #c93a8a)',
              boxShadow: '0 0 12px rgba(140,120,255,0.6)',
              transition: 'width 0.12s linear',
            }} />
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: 'rgba(220,225,255,0.85)', minWidth: 40, letterSpacing: 1 }}>
            {Math.max(0, beatIdx + 1)}/{total}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            className="btn primary"
            onClick={startOrPause}
            style={{ minWidth: 140 }}
            disabled={turnDone}
          >
            {playing ? '⏸ Pause' : (beatIdx >= total - 1 && !turnDone ? '↺ Replay' : '▶ Start beat')}
          </button>
          <button className="btn ghost" onClick={reshuffle}>🔀 Shuffle</button>
          <button className="btn ghost" onClick={onReset}>↺ New game</button>
        </div>
      </div>

      {useFileTrack && (
        <audio ref={audioRef} src={BEAT_TRACK_URL} preload="auto" />
      )}

      {intro > 0 && (
        <div className="intro-overlay">
          <div className="intro-ring">
            <div className="caption">Feel the beat</div>
            <div className="num" key={countdown}>{countdown ?? '🎵'}</div>
          </div>
        </div>
      )}

      {turnDone && (
        <div className="intro-overlay">
          <div className="turn-done-ring">
            <div style={{ fontSize: 72, lineHeight: 1, color: '#f4f0ff' }}>
              {isLastTurn ? '🎉' : '✓'}
            </div>
            <div style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 32,
              color: '#f4f0ff', letterSpacing: 1, marginTop: 8, textAlign: 'center',
              textShadow: '0 0 30px rgba(140,120,255,0.5)', whiteSpace: 'nowrap'
            }}>
              {isLastTurn ? 'Game complete!' : `${playerName} done!`}
            </div>
            {/* Same player, next level — auto-advances, no button */}
            {!isLastTurn && !isPlayerDone && (
              <div style={{
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
                color: 'rgba(220,225,255,0.7)', marginTop: 6, textAlign: 'center'
              }}>
                🎵 Next level dropping…
              </div>
            )}
            {/* Player finished all their levels — next player clicks in */}
            {!isLastTurn && isPlayerDone && (
              <button
                className="btn primary"
                style={{ marginTop: 14, fontSize: 14, padding: '10px 24px' }}
                onClick={onTurnDone}
              >
                Next player →
              </button>
            )}
            {/* Game over */}
            {isLastTurn && (
              <button
                className="btn primary"
                style={{ marginTop: 14, fontSize: 14, padding: '10px 24px' }}
                onClick={onReset}
              >
                ↺ New game
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Tile = ({ tile, isVisible, isBeatHit, justPopped, dimmed }) => {
  const accent = OPTION_COLORS[tile?._optIdx ?? 0];
  const bg = `radial-gradient(circle at 50% 30%, ${accent}28 0%, ${accent}10 55%, rgba(255,255,255,0.03) 100%)`;
  return (
    <div className={`tile ${isVisible ? 'visible' : ''} ${isBeatHit ? 'beat-hit' : ''} ${justPopped ? 'just-popped' : ''} ${dimmed ? 'dimmed' : ''}`}
      style={{
        background: bg,
        boxShadow: isBeatHit
          ? `0 18px 44px ${accent}88, 0 0 0 2px ${accent}cc, 0 0 60px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.3)`
          : `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.18), 0 0 28px ${accent}1f`,
      }}>
      {tile.kind === 'image' && tile.src && <img src={tile.src} alt="" />}
      {tile.kind === 'word' && (
        <div className="word" style={{ color: '#f4f0ff', textShadow: `0 0 22px ${accent}cc` }}>
          {(tile.label || '').toUpperCase()}
        </div>
      )}
    </div>
  );
};

function generateTiles(total, activeSlots, difficulty = 'hard') {
  const n = activeSlots.length || 1;
  const arr = [];
  for (let i = 0; i < total; i++) {
    const optIdx = i % n;
    const slot = activeSlots[optIdx] || { kind: 'word', label: '—' };
    arr.push({ ...slot, _optIdx: optIdx });
  }

  if (difficulty === 'easy' || difficulty === 'medium') {
    // Partial shuffle: randomize only half the tiles
    const halfCount = Math.floor(total / 2);
    // Pick halfCount unique random indices
    const indices = [];
    while (indices.length < halfCount) {
      const idx = Math.floor(Math.random() * total);
      if (!indices.includes(idx)) indices.push(idx);
    }
    // Extract those tiles, shuffle them with Fisher-Yates, put back
    const subset = indices.map(i => arr[i]);
    for (let i = subset.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [subset[i], subset[j]] = [subset[j], subset[i]];
    }
    indices.forEach((arrIdx, subIdx) => { arr[arrIdx] = subset[subIdx]; });
  } else {
    // Hard: full Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
}

// ---------- Library Game Card ----------
const LibraryGameCard = ({ game, onLoad, onEdit, onDelete }) => {
  const modeBadge = game.mode === 'images' ? 'Images' : 'Words';
  const modeColor = game.mode === 'images' ? '#b8b9f0' : '#a7dcb4';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      minWidth: 0,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: 20,
          color: '#f4f0ff',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}>
          {game.name}
        </div>
        <div style={{
          flexShrink: 0,
          background: modeColor + '33',
          border: `1px solid ${modeColor}66`,
          borderRadius: 999,
          padding: '3px 10px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: 11,
          color: modeColor,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {modeBadge}
        </div>
      </div>

      {/* BPM summary */}
      <div style={{
        display: 'flex',
        gap: 10,
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: 12,
        color: 'rgba(220,225,255,0.6)',
      }}>
        <span>🍋 {game.bpmEasy}</span>
        <span>🌶️ {game.bpmMedium}</span>
        <span>🌟 {game.bpmHard}</span>
        <span style={{ opacity: 0.5 }}>+{game.beatOffset}s</span>
      </div>

      {/* Slot preview */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(game.slots || []).slice(0, 4).map((slot, i) => (
          <div key={i} style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            borderRadius: 10,
            background: OPTION_COLORS[i] + '22',
            border: `1px solid ${OPTION_COLORS[i]}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {slot?.kind === 'image' && slot?.src
              ? <img src={slot.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 11,
                  color: '#f4f0ff',
                  letterSpacing: 0.5,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  padding: '0 4px',
                }}>
                  {(slot?.label || '—').toUpperCase().slice(0, 6)}
                </span>
            }
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button
          className="btn primary"
          style={{ flex: 1, fontSize: 13, padding: '8px 0' }}
          onClick={() => onLoad(game)}
        >
          ▶ Load
        </button>
        <button
          className="btn ghost"
          style={{ fontSize: 13, padding: '8px 14px' }}
          onClick={() => onEdit(game)}
        >
          ✏
        </button>
        <button
          onClick={() => onDelete(game.id)}
          style={{
            background: 'rgba(232,91,74,0.12)',
            border: '1px solid rgba(232,91,74,0.35)',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 14,
            cursor: 'pointer',
            color: '#e85b4a',
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

// ---------- Library Screen ----------
const LibraryScreen = ({ savedGames, onLoad, onEdit, onDelete, onNew, onImport, onExport, onBack }) => (
  <ScreenShell qBadge="📚" title="Game Library" subtitle="Load a saved game or create a new one" onBack={onBack}>
    {/* Page actions */}
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <button className="btn primary" style={{ fontSize: 15, padding: '10px 24px' }} onClick={onNew}>
        + New game
      </button>
      <button className="btn ghost" style={{ fontSize: 15, padding: '10px 24px' }} onClick={onImport}>
        ⬆ Import JSON
      </button>
      <button className="btn ghost" style={{ fontSize: 15, padding: '10px 24px' }} onClick={onExport}>
        ⬇ Export all
      </button>
    </div>

    {savedGames.length === 0 ? (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'rgba(220,225,255,0.45)',
        fontFamily: 'Instrument Serif, serif',
        fontSize: 22,
        fontStyle: 'italic',
      }}>
        No saved games yet.<br />
        <span style={{ fontSize: 16 }}>Create your first game to get started.</span>
      </div>
    ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
        padding: '0 4px 24px',
      }}>
        {savedGames.map(game => (
          <LibraryGameCard
            key={game.id}
            game={game}
            onLoad={onLoad}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </ScreenShell>
);

// ---------- Game Editor Screen ----------
const GameEditorScreen = ({ initialGame, onSave, onCancel }) => {
  const isNew = !initialGame;
  const [name, setName] = useState(initialGame?.name || '');
  const [mode, setEditorMode] = useState(initialGame?.mode || 'words');
  const [slots, setEditorSlots] = useState(
    initialGame?.slots || [null, null, null, null]
  );
  const [bpmEasy, setBpmEasy] = useState(initialGame?.bpmEasy ?? 120);
  const [bpmMedium, setBpmMedium] = useState(initialGame?.bpmMedium ?? 120);
  const [bpmHard, setBpmHard] = useState(initialGame?.bpmHard ?? 150);
  const [beatOffset, setBeatOffset] = useState(initialGame?.beatOffset ?? 3.25);

  const setSlot = (idx, val) =>
    setEditorSlots(prev => { const next = [...prev]; next[idx] = val; return next; });

  const canSave = name.trim().length > 0 &&
    slots.slice(0, 4).every(s =>
      mode === 'words' ? s?.label?.trim() : s?.src
    );

  const handleSave = () => {
    const game = {
      id: initialGame?.id || genId(),
      name: name.trim(),
      mode,
      slots,
      bpmEasy,
      bpmMedium,
      bpmHard,
      beatOffset,
      createdAt: initialGame?.createdAt || Date.now(),
    };
    onSave(game);
  };

  return (
    <ScreenShell
      qBadge={isNew ? '✨' : '✏️'}
      title={isNew ? 'New game' : 'Edit game'}
      subtitle="Configure slots, BPM, and beat offset"
      onBack={onCancel}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 0 32px' }}>

        {/* Name */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'rgba(220,225,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Game name
          </div>
          <input
            className="word-input"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: '#f4f0ff', maxWidth: 400 }}
            placeholder="e.g. Anduin Edition"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Mode toggle */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'rgba(220,225,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Mode
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['words', 'images'].map(m => (
              <button
                key={m}
                onClick={() => setEditorMode(m)}
                style={{
                  background: mode === m ? 'rgba(140,120,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mode === m ? 'rgba(180,165,255,0.65)' : 'rgba(255,255,255,0.18)'}`,
                  borderRadius: 999,
                  padding: '8px 22px',
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 14,
                  color: mode === m ? '#f4f0ff' : 'rgba(220,225,255,0.6)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'words' ? '📝 Words' : '🖼 Images'}
              </button>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'rgba(220,225,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Slots (A – D)
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[0, 1, 2, 3].map(i => {
              const slot = slots[i];
              return (
                <div key={i} style={{ width: 190 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: OPTION_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito', fontWeight: 900, fontSize: 14, color: '#1a0e24' }}>
                      {OPTION_LABELS[i]}
                    </div>
                    <span style={{ color: 'rgba(220,225,255,0.7)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13 }}>Option {OPTION_LABELS[i]}</span>
                  </div>

                  {mode === 'images' ? (
                    <>
                      <input
                        className="word-input"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: '#f4f0ff', fontSize: 14 }}
                        placeholder="uploads/cat.png"
                        value={slot?.src || ''}
                        onChange={e => setSlot(i, { kind: 'image', src: e.target.value, label: e.target.value.replace(/.*\//, '').replace(/\.[^.]+$/, '') })}
                      />
                      {slot?.src && (
                        <img
                          src={slot.src}
                          alt=""
                          style={{ marginTop: 6, width: '100%', height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                          onLoad={e => { e.target.style.display = 'block'; }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        className="word-input"
                        style={{ fontFamily: 'Gloock, serif', letterSpacing: 1, textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: '#f4f0ff' }}
                        placeholder={DEFAULT_WORDS[i]}
                        value={slot?.label || ''}
                        onChange={e => setSlot(i, { kind: 'word', label: e.target.value })}
                      />
                      <div style={{ marginTop: 8, height: 80, borderRadius: 14, background: `linear-gradient(180deg, ${OPTION_COLORS[i]}22 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid ${OPTION_COLORS[i]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 26, color: '#f4f0ff' }}>
                        {(slot?.label || '—').toUpperCase().slice(0, 10)}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BPM fields */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'rgba(220,225,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            BPM per level
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { emoji: '🍋', label: 'Easy', value: bpmEasy, set: setBpmEasy },
              { emoji: '🌶️', label: 'Medium', value: bpmMedium, set: setBpmMedium },
              { emoji: '🌟', label: 'Hard', value: bpmHard, set: setBpmHard },
            ].map(({ emoji, label, value, set }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: 'rgba(220,225,255,0.8)' }}>
                {emoji} {label}
                <input
                  type="number"
                  min="60" max="180"
                  value={value}
                  onChange={e => set(Math.max(60, Math.min(180, +e.target.value || 120)))}
                  style={{ width: 60, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 8px', background: 'rgba(255,255,255,0.06)', color: '#f4f0ff', fontFamily: 'Nunito', fontWeight: 700 }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Beat offset */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'rgba(220,225,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Beat offset (seconds)
          </div>
          <input
            type="number"
            min="0" max="10" step="0.1"
            value={beatOffset}
            onChange={e => setBeatOffset(Math.max(0, +e.target.value || 0))}
            style={{ width: 80, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.06)', color: '#f4f0ff', fontFamily: 'Nunito', fontWeight: 700 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn primary"
            style={{ fontSize: 16, padding: '12px 32px' }}
            disabled={!canSave}
            onClick={handleSave}
          >
            💾 Save game
          </button>
          <button className="btn ghost" style={{ fontSize: 16 }} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </ScreenShell>
  );
};

// ---------- Shell ----------
const ScreenShell = ({ qBadge, title, subtitle, onBack, children }) => (
  <div className="shell-cosmic" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column',
      padding: '22px 40px 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn ghost" onClick={onBack}>← Back</button>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {qBadge && <div className="q-badge">{qBadge}</div>}
          <h2 style={{ fontSize: 48, lineHeight: 1 }}>{title}</h2>
          {subtitle && <div className="sub-cosmic" style={{ fontSize: 20 }}>{subtitle}</div>}
        </div>
        <div style={{ width: 110 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative', zIndex: 2 }} className="scroll">
        {children}
      </div>
    </div>
  </div>
);

Object.assign(window, {
  LEVEL_CONFIG,
  TitleScreen, PlayerSetupScreen, DifficultySelect, ModeSelect, ContentSetup, GridSizeScreen, PlayScreen,
  LibraryGameCard, LibraryScreen, GameEditorScreen,
  DIFFICULTY_LEVELS, OPTION_COLORS, OPTION_TINT, OPTION_LABELS, DEFAULT_WORDS, MUSIC_OPTIONS
});
