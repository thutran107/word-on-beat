// Decorative animated mascots drifting around the stage.
// Pure SVG — astronauts + speakers — with bounce/float animations.

const Astronaut = ({ size = 140, color = '#f5ad86' }) => (
  <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
    {/* Backpack tether balloon trail */}
    <circle cx="40" cy="30" r="10" fill="#ffd96b" stroke="#3b1e4a" strokeWidth="2.5"/>
    <circle cx="60" cy="14" r="8"  fill="#a7dcb4" stroke="#3b1e4a" strokeWidth="2.5"/>
    <circle cx="80" cy="28" r="9"  fill="#b8b9f0" stroke="#3b1e4a" strokeWidth="2.5"/>
    <path d="M40,40 C60,60 75,65 100,85" stroke="#3b1e4a" strokeWidth="1.5" fill="none"/>
    <path d="M60,22 C70,50 85,70 100,90" stroke="#3b1e4a" strokeWidth="1.5" fill="none"/>
    <path d="M80,37 C88,60 95,78 100,92" stroke="#3b1e4a" strokeWidth="1.5" fill="none"/>

    {/* Body */}
    <ellipse cx="110" cy="150" rx="56" ry="52" fill="#fff5e0" stroke="#3b1e4a" strokeWidth="3.5"/>
    {/* Arms */}
    <ellipse cx="58" cy="138" rx="18" ry="26" fill="#fff5e0" stroke="#3b1e4a" strokeWidth="3.5" transform="rotate(-20 58 138)"/>
    <ellipse cx="166" cy="152" rx="18" ry="26" fill="#fff5e0" stroke="#3b1e4a" strokeWidth="3.5" transform="rotate(20 166 152)"/>
    {/* Mitts */}
    <circle cx="50" cy="112" r="11" fill={color} stroke="#3b1e4a" strokeWidth="3"/>
    <circle cx="176" cy="178" r="11" fill={color} stroke="#3b1e4a" strokeWidth="3"/>
    {/* Helmet */}
    <circle cx="110" cy="95" r="48" fill="#d9e9ff" stroke="#3b1e4a" strokeWidth="3.5"/>
    <circle cx="110" cy="95" r="40" fill="#b8d3f5" opacity="0.6"/>
    {/* Face */}
    <ellipse cx="110" cy="100" rx="26" ry="28" fill="#3b1e4a"/>
    <circle cx="102" cy="96" r="4" fill="#fff5e0"/>
    <circle cx="118" cy="96" r="4" fill="#fff5e0"/>
    <path d="M100,110 Q110,118 120,110" stroke="#fff5e0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Helmet shine */}
    <ellipse cx="92" cy="78" rx="10" ry="14" fill="white" opacity="0.55"/>
    {/* Chest panel */}
    <rect x="90" y="150" width="40" height="22" rx="6" fill={color} stroke="#3b1e4a" strokeWidth="3"/>
    <circle cx="100" cy="161" r="3" fill="#3b1e4a"/>
    <circle cx="110" cy="161" r="3" fill="#fff5e0"/>
    <circle cx="120" cy="161" r="3" fill="#e85b4a"/>
  </svg>
);

const Speaker = ({ size = 120, active = false }) => (
  <svg viewBox="0 0 160 200" width={size} height={size * 1.25}>
    {/* Body */}
    <rect x="20" y="25" width="120" height="155" rx="14" fill="#3b1e4a" stroke="#25122f" strokeWidth="3"/>
    <rect x="28" y="33" width="104" height="139" rx="10" fill="#4a2660"/>
    {/* Top LED bar */}
    <rect x="36" y="40" width="88" height="8" rx="3" fill="#25122f"/>
    <circle cx="44" cy="44" r="2" fill={active ? "#e85b4a" : "#7b4a8a"}/>
    <circle cx="54" cy="44" r="2" fill={active ? "#ffd96b" : "#7b4a8a"}/>
    <circle cx="64" cy="44" r="2" fill={active ? "#a7dcb4" : "#7b4a8a"}/>
    {/* Big woofer */}
    <circle cx="80" cy="100" r="36" fill="#25122f" stroke="#ffd96b" strokeWidth="3"/>
    <circle cx="80" cy="100" r="28" fill="#3b1e4a"/>
    <circle cx="80" cy="100" r="14" fill="#25122f"/>
    <circle cx="80" cy="100" r="6" fill="#ffd96b"/>
    {/* Tweeter */}
    <circle cx="80" cy="156" r="14" fill="#25122f" stroke="#e85b4a" strokeWidth="2.5"/>
    <circle cx="80" cy="156" r="7" fill="#3b1e4a"/>
    {/* Sound waves when active */}
    {active && (
      <g stroke="#ffd96b" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M10,95 Q4,100 10,105" />
        <path d="M0,85 Q-8,100 0,115" opacity="0.6"/>
        <path d="M150,95 Q156,100 150,105" />
        <path d="M160,85 Q168,100 160,115" opacity="0.6"/>
      </g>
    )}
  </svg>
);

// Four mascots for play screen surround, plus floating music notes when active
const StageMascots = ({ active = false }) => (
  <>
    <div className="mascot astronaut-left">
      <Astronaut size={150} color="#e85b4a" />
    </div>
    <div className="mascot astronaut-right">
      <Astronaut size={130} color="#a7dcb4" />
    </div>
    <div className={`mascot speaker-left ${active ? 'speaker-bounce' : ''}`}>
      <Speaker size={110} active={active} />
    </div>
    <div className={`mascot speaker-right ${active ? 'speaker-bounce' : ''}`}>
      <Speaker size={100} active={active} />
    </div>
    {active && (
      <>
        <div className="music-note" style={{ left: '6%',  top: '40%', animationDelay: '0s' }}>♪</div>
        <div className="music-note" style={{ left: '8%',  top: '30%', animationDelay: '1.2s', color: '#e85b4a' }}>♫</div>
        <div className="music-note" style={{ right: '6%', top: '38%', animationDelay: '0.6s', color: '#a7dcb4' }}>♪</div>
        <div className="music-note" style={{ right: '8%', top: '26%', animationDelay: '1.8s', color: '#b8b9f0' }}>♬</div>
      </>
    )}
  </>
);

Object.assign(window, { Astronaut, Speaker, StageMascots });
