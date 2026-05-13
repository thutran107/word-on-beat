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
  { id: 'hard',   label: 'Hard',   emoji: '🌟', rows: 3, cols: 4, numOptions: 4, bpm: 150 },
];

// Option palette — mapped to option A/B/C/D
const OPTION_COLORS = ['#ffd96b', '#e85b4a', '#a7dcb4', '#b8b9f0'];
const OPTION_TINT   = ['#fff5ce', '#fbd5cf', '#dcf0e1', '#e1e1fa'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const DEFAULT_WORDS = ['CAP', 'CLAP', 'TAP', 'NAP'];

const BEAT_TRACK_URL = 'uploads/Untitled (5).mp3';
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
const ContentSetup = ({ mode, slots, setSlot, onNext, onBack, numOptions }) => {
  const fileRefs = useRef([]);

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
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
        <button className="btn primary" onClick={onNext} disabled={!canContinue}>Next →</button>
      </div>
    </ScreenShell>
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
  const tiles = generateTiles(rows * cols, slots.slice(0, numOptions));
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
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, turnNumber, totalTurns, onTurnDone, onReset, onBack, subtitle, autoStart, isPlayerDone }) => {
  const { rows, cols, numOptions, bpm: levelBpm } = levelCfg;
  const activeSlots = slots.slice(0, numOptions);
  const total = rows * cols;

  const [tiles, setTiles] = useState(() => generateTiles(total, activeSlots));
  const [beatIdx, setBeatIdx] = useState(-1);
  const [playing, setPlaying] = useState(!!autoStart);
  const [showHit, setShowHit] = useState(false);
  const [beatPing, setBeatPing] = useState(false);
  const [intro, setIntro] = useState(0);
  const [turnDone, setTurnDone] = useState(false);

  const audioRef = useRef(null);
  const rAFRef = useRef(null);
  const lastBeatRef = useRef(-1);
  const flashTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const introTimerRef = useRef(null);

  const reshuffle = () => {
    setTiles(generateTiles(total, activeSlots));
    setBeatIdx(-1);
    lastBeatRef.current = -1;
  };

  useEffect(() => { reshuffle(); /* eslint-disable-next-line */ },
    [rows, cols, numOptions, JSON.stringify(activeSlots.map(s => s?.label + (s?.src || '')))]);

  const useFileTrack = music === 'beat';
  const effectiveBpm = levelBpm || 100;
  const beatInterval_ms = 60000 / effectiveBpm;
  const beatInterval_s  = 60    / effectiveBpm;

  useEffect(() => {
    if (!playing) {
      clearInterval(introTimerRef.current);
      cancelAnimationFrame(rAFRef.current);
      clearTimeout(flashTimerRef.current);
      clearTimeout(pingTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
      setIntro(0);
      window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
      return;
    }

    setTurnDone(false);
    lastBeatRef.current = -1;

    // Start audio immediately — the intro music IS the countdown
    setIntro(1);
    if (useFileTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
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

      setIntro(0); // beat dropped — hide overlay

      const b = Math.floor(elapsed / beatInterval_s);

      if (b !== lastBeatRef.current) {
        lastBeatRef.current = b;

        if (b < total) {
          setBeatIdx(b);
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
  }, [playing, beatInterval_s, beatInterval_ms, useFileTrack, total]);

  const startOrPause = () => {
    if (turnDone) return;
    setPlaying(p => !p);
  };

  // Auto-advance only within same player's levels; player transitions need a button
  useEffect(() => {
    if (!turnDone || isLastTurn || isPlayerDone) return;
    const timer = setTimeout(onTurnDone, 800);
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
            Turn {turnNumber} of {totalTurns}
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
            <div className="num" style={{ fontSize: 42, lineHeight: 1 }}>🎵</div>
            <div className="caption">Feel the beat</div>
          </div>
        </div>
      )}

      {turnDone && (
        <div className="intro-overlay">
          <div className="intro-ring" style={{ width: 280, height: 280 }}>
            <div style={{ fontSize: 46, lineHeight: 1 }}>
              {isLastTurn ? '🎉' : '✓'}
            </div>
            <div style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 16,
              color: 'var(--coral)', letterSpacing: 1, marginTop: 8, textAlign: 'center'
            }}>
              {isLastTurn ? 'Game complete!' : `${playerName} done!`}
            </div>
            {/* Same player, next level — auto-advances, no button */}
            {!isLastTurn && !isPlayerDone && (
              <div style={{
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
                color: 'rgba(220,225,255,0.55)', marginTop: 6, textAlign: 'center'
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

function generateTiles(total, activeSlots) {
  const n = activeSlots.length || 1;
  const arr = [];
  for (let i = 0; i < total; i++) {
    const optIdx = i % n;
    const slot = activeSlots[optIdx] || { kind: 'word', label: '—' };
    arr.push({ ...slot, _optIdx: optIdx });
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  DIFFICULTY_LEVELS, OPTION_COLORS, OPTION_TINT, OPTION_LABELS, DEFAULT_WORDS, MUSIC_OPTIONS
});
