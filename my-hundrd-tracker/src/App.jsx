import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Trash2, FileText, Sun, Moon, Zap, Sparkles, ArrowLeft, Pause, Play, Info, Volume2, Cloud, Coffee, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Confetti Burst ---
const ConfettiBurst = ({ active, onDone }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const COLS = ['#f5a522','#e8523a','#5ec97c','#56ccf2','#f2c94c','#c97de8'];
    const pts = Array.from({ length: 130 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 500,
      y: canvas.height * 0.38 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 9,
      vy: -5 - Math.random() * 7,
      g: 0.14,
      color: COLS[Math.floor(Math.random() * COLS.length)],
      size: 5 + Math.random() * 5,
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 9,
      life: 1,
      decay: 0.007 + Math.random() * 0.009,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pts.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.rs; p.life -= p.decay;
        if (p.life <= 0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(draw);
      else onDone?.();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }} />;
};

// --- Progress Ring ---
const ProgressRing = ({ value, size = 172, isDark }) => {
  const sw = 5;
  const r = (size - sw * 2) / 2;
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', display:'block' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5a522" />
            <stop offset="100%" stopColor="#e8523a" />
          </linearGradient>
          <linearGradient id="rgDone" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5ec97c" />
            <stop offset="100%" stopColor="#3ab05e" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={isDark ? "rgba(237,229,208,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={value === 100 ? 'url(#rgDone)' : 'url(#rg)'}
          strokeWidth={sw}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - value / 100)}
          strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1), stroke 0.5s ease' }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        {value === 100
          ? <span style={{ fontFamily:"'Fraunces', serif", fontSize:'2rem', color:'#5ec97c', lineHeight:1 }}>✓</span>
          : <>
              <span style={{ fontFamily:"'Fraunces', serif", fontWeight:200, fontSize:'2.8rem', lineHeight:1 }}>{value}</span>
              <span style={{ fontFamily:"'Outfit', sans-serif", fontSize:'0.5rem', letterSpacing:'0.2em', opacity: 0.3, textTransform:'uppercase', marginTop:4 }}>done</span>
            </>
        }
      </div>
    </div>
  );
};

const renderDopaIcon = (name, size = 14) => {
    const icons = {
      Coffee: <Coffee size={size} />,
      Zap: <Zap size={size} />,
      Sparkles: <Sparkles size={size} />,
      Sun: <Sun size={size} />,
      Cloud: <Cloud size={size} />,
      Check: <Check size={size} />,
      Trash2: <Trash2 size={size} />,
    };
    return icons[name] || <Sparkles size={size} />;
  };

export default function Hundrd() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('hundrd_projects');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'My Journey', description: 'A minimalist approach to goals.', tasks: [] }
    ];
  });
  const [showArchived, setShowArchived] = useState(false);

  const [brainDump, setBrainDump] = useState(() => {
    const savedDump = localStorage.getItem('hundrd_dump');
    return savedDump ? JSON.parse(savedDump) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('hundrd_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const filteredProjects = projects.filter(p => !!p.archived === showArchived);

  const [currentOptions, setCurrentOptions] = useState([]);
  const [microWins, setMicroWins] = useState(() => {
    const savedWins = localStorage.getItem('hundrd_microwins');
    return savedWins ? JSON.parse(savedWins) : [];
  });
  const dopaMenu = [
    { text: "Drink a full glass of water", iconName: "Coffee" },
    { text: "Play 1 high-energy song", iconName: "Zap" },
    { text: "Stand up and stretch for 60s", iconName: "Sparkles" },
    { text: "Step outside for 3 minutes", iconName: "Sun" },
    { text: "5 deep belly breaths", iconName: "Cloud" },
    { text: "Tidy 3 items on your desk", iconName: "Check" },
    { text: "Splash cold water on your face", iconName: "Cloud" },
    { text: "Do 10 jumping jacks", iconName: "Zap" },
    { text: "Write down 1 thing you're grateful for", iconName: "Sparkles" },
    { text: "Eat a small healthy snack", iconName: "Coffee" },
    { text: "Close your eyes and rest for 60s", iconName: "Cloud" },
    { text: "Doodle anything for 2 minutes", iconName: "Sparkles" },
    { text: "Text someone something kind", iconName: "Check" },
    { text: "Look out the window for 1 minute", iconName: "Sun" },
    { text: "Roll your shoulders back 5 times", iconName: "Sparkles" },
    { text: "Hum or sing along to a song", iconName: "Zap" },
    { text: "Step away from screens for 2 min", iconName: "Sun" },
    { text: "Laugh at a meme or short video", iconName: "Sparkles" },
    { text: "Do a quick 1-minute tidy sprint", iconName: "Check" },
    { text: "Make yourself a warm drink", iconName: "Coffee" },
    { text: "Shake out your hands and wrists", iconName: "Zap" },
    { text: "Read 1 paragraph of a book", iconName: "Check" },
    { text: "Pet an animal if one is nearby", iconName: "Sparkles" },
    { text: "Write the next 3 steps for your task", iconName: "Check" },
    { text: "Close all tabs you aren't using", iconName: "Check" },
    { text: "Change your sitting position", iconName: "Sun" },
    { text: "Put 1 piece of trash in the bin", iconName: "Trash2" },
    { text: "Give yourself a high-five in the mirror", iconName: "Sparkles" },
    { text: "Take a 5% 'Free Win' on your current journey", iconName: "Zap" },
  ];


const rollDopamine = () => {

  const available = dopaMenu.filter(item => !currentOptions.includes(item));
  // If we ran out of new ones, just use the whole menu again
  const pool = available.length >= 3 ? available : dopaMenu;
  // Shuffle and pick 3 unique ones
  const shuffled = [...dopaMenu].sort(() => 0.5 - Math.random());
  setCurrentOptions(shuffled.slice(0, 3));
};

  const [activeId, setActiveId] = useState(projects[0]?.id || 1);
  const [taskInput, setTaskInput] = useState('');
  const [dumpInput, setDumpInput] = useState('');
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [confetti, setConfetti] = useState(false);
  const prevProgress = useRef(0);

  // Audio Suite — powered by SomaFM (free, no account needed)
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPreset, setAudioPreset] = useState('groove');
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);

  const audioPresets = [
    { id: 'groove', label: 'Groove Salad', desc: 'Ambient · Chill',     url: 'https://ice2.somafm.com/groovesalad-128-mp3' },
    { id: 'jazz',   label: 'Jazz & Blues', desc: 'Live Jazz Radio',     url: 'https://ice2.somafm.com/jazzandblues-128-mp3' },
    { id: 'lush',   label: 'Lush',         desc: 'Dreamy · Mellow',     url: 'https://ice2.somafm.com/lush-128-mp3' },
    { id: 'space',  label: 'Deep Space',   desc: 'Dark Ambient',        url: 'https://ice2.somafm.com/deepspaceone-128-mp3' },
  ];

  useEffect(() => {
    const audio = new Audio();
    audio.volume = audioVolume;
    audio.onwaiting = () => setAudioLoading(true);
    audio.onplaying = () => setAudioLoading(false);
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      const preset = audioPresets.find(p => p.id === audioPreset);
      if (!audio.src || !audio.src.includes(audioPreset)) audio.src = preset.url;
      setAudioLoading(true);
      audio.play().catch(() => setAudioLoading(false));
      setAudioPlaying(true);
    }
  };

  const switchPreset = (id) => {
    setAudioPreset(id);
    const audio = audioRef.current;
    if (!audio) return;
    const preset = audioPresets.find(p => p.id === id);
    audio.src = preset.url;
    if (audioPlaying) { setAudioLoading(true); audio.play().catch(() => setAudioLoading(false)); }
  };

  const changeVolume = (val) => {
    setAudioVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  useEffect(() => {
    localStorage.setItem('hundrd_projects', JSON.stringify(projects));
    localStorage.setItem('hundrd_dump', JSON.stringify(brainDump));
  }, [projects, brainDump]);

  useEffect(() => {
    localStorage.setItem('hundrd_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!filteredProjects.find(p => p.id === activeId) && filteredProjects.length > 0) {
      setActiveId(filteredProjects[0].id);
    }
  }, [showArchived, projects, activeId, filteredProjects]);

  useEffect(() => {
    localStorage.setItem('hundrd_microwins', JSON.stringify(microWins));
  }, [microWins]);

  const completeMicroWin = (win) => {
    setMicroWins([{ ...win, id: Date.now() }, ...microWins]);
    // Remove the one they just did from the current options
    setCurrentOptions(currentOptions.filter(o => o.text !== win.text));
  };

  const active = projects.find(p => p.id === activeId) ?? projects[0];
  const totalAllocated = active.tasks.reduce((s, t) => s + (Number(t.weight) || 0), 0);
  const progressValue  = active.tasks.reduce((s, t) => t.completed ? s + (Number(t.weight) || 0) : s, 0);
  const remaining      = 100 - totalAllocated;

  const [showArchivePrompt, setShowArchivePrompt] = useState(false);

  useEffect(() => {
    if (progressValue === 100 && prevProgress.current < 100 && !active.archived) {
      setConfetti(true);
      setShowArchivePrompt(true);
    }
    if (progressValue < 100) setShowArchivePrompt(false);
    prevProgress.current = progressValue;
  }, [progressValue, active.archived]);

  // -- Actions --
  const setProject = (field, val) =>
    setProjects(ps => ps.map(p => p.id === activeId ? { ...p, [field]: val } : p));

  const addProject = () => {
    const id = Date.now();
    setProjects(ps => [...ps, { id, name: 'New Journey', description: 'Begin small.', tasks: [] }]);
    setActiveId(id);
  };

  const deleteProject = (id) => {
    const remaining = projects.filter(p => p.id !== id);
    if (remaining.length === 0) return;
    setProjects(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const archiveProject = () => {
    setProjects(ps => ps.map(p => p.id === activeId ? { ...p, archived: true } : p));
    const next = projects.find(p => p.id !== activeId && !p.archived);
    if (next) setActiveId(next.id);
    setShowArchivePrompt(false);
  };

  const addTask = (text, weight = 0) => {
    setProject('tasks', [...active.tasks, { id: Date.now(), text, weight, completed: false, note: '' }]);
  };

  const patchTask = (id, patch) => {
    if (patch.weight !== undefined) patch.weight = Math.max(0, Math.min(100, Number(patch.weight) || 0));
    setProject('tasks', active.tasks.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const kaizenSplit = (task) => {
    const half = Math.floor(task.weight / 2);
    const remainder = task.weight - half;
    const filtered = active.tasks.filter(t => t.id !== task.id);
    setProject('tasks', [
      ...filtered, 
      { ...task, id: Date.now(), text: `${task.text} (1/2)`, weight: half },
      { ...task, id: Date.now() + 1, text: `${task.text} (2/2)`, weight: remainder }
    ]);
  };

  const promoteDump = (item) => {
    addTask(item.text);
    setBrainDump(brainDump.filter(d => d.id !== item.id));
  };

  const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1024);
  const [leftCollapsed, setLeftCollapsed] = useState(() => window.innerWidth < 1024);
  const [rightCollapsed, setRightCollapsed] = useState(() => window.innerWidth < 1024);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsTablet(w < 1024);
      if (w < 1024) { setLeftCollapsed(true); setRightCollapsed(true); }
      else { setLeftCollapsed(false); setRightCollapsed(false); }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const theme = {
    bg: darkMode ? '#0b0907' : '#fcfaf2',
    text: darkMode ? '#ede5d0' : '#2d2b28',
    sidebar: darkMode ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.02)',
    border: darkMode ? 'rgba(237,229,208,0.05)' : 'rgba(45,43,40,0.08)',
    card: darkMode ? 'rgba(237,229,208,0.022)' : 'rgba(0,0,0,0.015)',
    input: darkMode ? 'rgba(237,229,208,0.025)' : '#ffffff',
    accent: '#f5a522'
  };

  const BUDGET = {
    exact: { c:'#5ec97c', bg:'rgba(94,201,124,0.1)', label:'Perfectly Balanced' },
    over:  { c:'#e8523a', bg:'rgba(232,82,58,0.1)', label:`Over Budget (${totalAllocated-100}%)` },
    under: { c:'#f5a522', bg:'rgba(245,165,34,0.1)', label:`Unallocated (${remaining}%)` },
  }[totalAllocated === 100 ? 'exact' : totalAllocated > 100 ? 'over' : 'under'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600&display=swap');
        body{background: ${theme.bg}; color: ${theme.text}; font-family: 'Outfit', sans-serif; transition: 0.5s ease; margin:0; overflow:hidden;}
        .sidebar-btn:hover{ background: ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} !important; }
        .task-row:hover .row-actions{ opacity: 1; }
        .row-actions{ opacity: 0; transition: 0.2s; display: flex; gap: 8px; }
        .guide-pill{ font-size: 0.6rem; padding: 4px 10px; border-radius: 20px; border: 1px solid ${theme.border}; opacity: 0.5; display: flex; alignItems: center; gap: 6px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        .energy-btn { 
          opacity: 0.2; 
          transition: 0.2s; 
          cursor: pointer; 
          border: none; 
          background: none; 
          color: ${theme.text}; 
        }
        .energy-btn.active { 
          opacity: 1; 
          color: ${theme.accent}; 
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        aside {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .collection-row:hover .collection-delete { opacity: 0.5 !important; }
        .collection-delete:hover { opacity: 1 !important; }
        .collections-list::-webkit-scrollbar { width: 3px; }
        .collections-list::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        .collections-list::-webkit-scrollbar-track { background: transparent; }

        main {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .zen-active main {
          max-width: 800px;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .app-shell { display: none !important; }
          .mobile-warning { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-warning { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .main-content { padding: 2rem 1.25rem !important; }
        }
        @media (max-width: 768px) {
          .mobile-warning { display: flex !important; }
          /* Hide the rest of the app */
          #root > div:not(.mobile-warning) { display: none; }
        }
      `}</style>

      {/* MOBILE WARNING — shown only on phones via CSS */}
      <div className="mobile-warning" style={{
        position: 'fixed', inset: 0, background: theme.bg, zIndex: 9999,
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center', gap: 12
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🖥️</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '1.5rem', color: theme.accent, marginBottom: 6 }}>Hundrd</div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, marginBottom: 8 }}>Built for bigger screens</div>
        <div style={{ fontSize: '0.8rem', color: theme.text, opacity: 0.5, lineHeight: 1.6, maxWidth: 280 }}>
          Open Hundrd on a tablet or desktop for the full focus experience.
        </div>
      </div>

      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

      <div className="app-shell" style={{ display:'flex', height:'100vh', position: 'relative' }}>

        {/* LEFT COLLAPSE TOGGLE — desktop only */}
        <button
          className="desktop-toggle"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          style={{
            position: 'absolute', left: leftCollapsed ? 48 : 236, top: 20, zIndex: 20,
            background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '50%',
            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: theme.text, transition: 'left 0.4s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: `0 1px 4px rgba(0,0,0,0.15)`
          }}
        >
          {leftCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>


        {/* SIDEBAR: COLLECTIONS */}
        <aside style={{
          width:leftCollapsed ? 60 : 248,
          background: theme.sidebar,
          borderRight:`1px solid ${theme.border}`,
          padding: leftCollapsed ? '2rem 0.5rem' : '2rem 1.25rem',
          position: 'relative', display:'flex',
          flexDirection:'column', overflow: 'hidden' }}>

          {!leftCollapsed && (
          <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ marginBottom: '1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h1 style={{ fontFamily:"'Fraunces', serif", fontStyle:'italic', fontWeight:300, fontSize:'1.4rem', color: theme.accent, margin:0 }}>Hundrd</h1>
              <div style={{ fontSize:'0.52rem', letterSpacing:'0.24em', textTransform:'uppercase', opacity:0.3 }}>Weighted Focus</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.4, display:'flex', alignItems:'center', padding: 4 }}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => {
                  setZenMode(!zenMode);
                  setLeftCollapsed(!zenMode);
                  setRightCollapsed(!zenMode);
                }}
                style={{
                  background: zenMode ? theme.accent : 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8, padding: '3px 7px', fontSize: '0.58rem', color: zenMode ? 'white' : theme.text,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <Sun size={11} /> {zenMode ? "Focused" : "Zen"}
              </button>
            </div>
          </div>

          

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button
              onClick={() => setShowArchived(false)}
              style={{
                flex: 1, fontSize: '0.58rem', padding: '3px 0', borderRadius: 6, cursor: 'pointer',
                background: !showArchived ? theme.card : 'none',
                border: `1px solid ${theme.border}`, color: theme.text
              }}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              style={{
                flex: 1, fontSize: '0.58rem', padding: '3px 0', borderRadius: 6, cursor: 'pointer',
                background: showArchived ? theme.card : 'none',
                border: `1px solid ${theme.border}`, color: theme.text
              }}
            >
              Archived
            </button>
          </div>

          <div className="collections-list" style={{ flex:1, overflowY:'auto', overflowX:'hidden', minHeight: 0 }}>
            <div style={{ fontSize:'0.52rem', letterSpacing:'0.25em', textTransform:'uppercase', opacity:0.3, fontWeight:600, marginBottom:'0.5rem', marginTop: '1rem' }}>Collections</div>
            {filteredProjects.map(p => (
              <div key={p.id} className="sidebar-btn collection-row" style={{
                display:'flex', alignItems:'center', borderRadius:8, marginBottom:2, cursor:'pointer',
                background: p.id === activeId ? (darkMode ? 'rgba(245,165,34,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
              }}>
                <button onClick={() => setActiveId(p.id)} style={{
                  flex:1, padding:'0.45rem 0.7rem', textAlign:'left', border:'none', background:'none', cursor:'pointer',
                  color: p.id === activeId ? theme.text : 'rgba(128,128,128,0.5)'
                }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name || 'Untitled'}</div>
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={() => deleteProject(p.id)}
                    title="Delete collection"
                    className="collection-delete"
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#e8523a', padding:'0 6px', opacity:0, flexShrink:0 }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addProject} style={{ background:'none', border:'none', color: theme.accent, fontSize:'0.72rem', padding:'0.45rem 0.7rem', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              <Plus size={12} /> New Journey
            </button>
          </div>

          {/* THE DOPA-MENU RECHARGE */}
          <div style={{ flexShrink: 0, padding: '10px 12px', background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ opacity: 0.35, fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Micro-wins</span>
              <button onClick={rollDopamine} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.accent, display: 'flex', alignItems: 'center', padding: 0 }} title="Refresh">
                <Zap size={11} />
              </button>
            </div>

            {currentOptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => completeMicroWin(opt)}
                    title={opt.text}
                    style={{
                      textAlign: 'left', padding: '5px 8px', borderRadius: 7, background: 'none',
                      border: `1px solid ${theme.border}`, color: theme.text, fontSize: '0.68rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7, transition: '0.2s',
                      opacity: 0.7
                    }}
                    className="sidebar-btn"
                  >
                    <span style={{ opacity: 0.5, flexShrink: 0 }}>{renderDopaIcon(opt.iconName, 11)}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={rollDopamine}
                style={{ width: '100%', background: 'none', border: `1px dashed ${theme.border}`, color: theme.text, opacity: 0.3, fontSize: '0.62rem', padding: '7px', borderRadius: 7, cursor: 'pointer' }}
              >
                Stuck? Pick a micro-win.
              </button>
            )}

            {/* MICRO-WINS HISTORY inline */}
            {microWins.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {microWins.slice(0, 10).map(win => (
                    <div
                      key={win.id}
                      title={win.text}
                      style={{
                        width: 16, height: 16, borderRadius: 4, background: 'rgba(94,201,124,0.12)',
                        border: '1px solid rgba(94,201,124,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5ec97c',
                        cursor: 'default'
                      }}
                    >
                      {renderDopaIcon(win.iconName, 9)}
                    </div>
                  ))}
                  {microWins.length > 10 && (
                    <span style={{ fontSize: '0.5rem', opacity: 0.3, alignSelf: 'center' }}>+{microWins.length - 10}</span>
                  )}
                </div>
                <button
                  onClick={() => setMicroWins([])}
                  style={{ background: 'none', border: 'none', color: '#e8523a', fontSize: '0.5rem', cursor: 'pointer', opacity: 0.35, flexShrink: 0 }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        
        
        
        </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content" style={{ flex:1, overflowY:'auto', padding: isTablet ? '2rem 1.25rem' : '3rem 2rem' }}>
          <div style={{ maxWidth: 680, margin:'0 auto' }}>
            
            {/* ARCHIVE PROMPT */}
            {showArchivePrompt && !active.archived && (
              <div style={{
                marginBottom: 24, padding: '14px 18px', borderRadius: 14,
                background: 'rgba(94,201,124,0.08)', border: '1px solid rgba(94,201,124,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                animation: 'fadeIn 0.4s'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5ec97c', marginBottom: 2 }}>Journey complete</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Move this collection to your archive?</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={archiveProject}
                    style={{
                      padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(94,201,124,0.4)',
                      background: 'rgba(94,201,124,0.12)', color: '#5ec97c',
                      fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => setShowArchivePrompt(false)}
                    style={{
                      padding: '5px 10px', borderRadius: 8, border: `1px solid ${theme.border}`,
                      background: 'none', color: theme.text, opacity: 0.4,
                      fontSize: '0.68rem', cursor: 'pointer'
                    }}
                  >
                    Later
                  </button>
                </div>
              </div>
            )}

            {/* MINI GUIDE SECTION */}
            <div style={{ display:'flex', gap:12, marginBottom:40 }}>
                <div className="guide-pill"><Sparkles size={10}/> Brain Dump first</div>
                <div className="guide-pill"><Zap size={10}/> Weight by impact</div>
                <div className="guide-pill"><Info size={10}/> Finish at 100%</div>
            </div>

            <header style={{ marginBottom: '3rem' }}>
              <input
                value={active.name}
                onChange={(e) => setProject('name', e.target.value)}
                style={{
                  background: 'none', border: 'none', outline: 'none', color: theme.text, width: '100%',
                  fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '3.5rem', fontWeight: 200, marginBottom: 8
                }}
              />
              <input
                value={active.description}
                onChange={(e) => setProject('description', e.target.value)}
                placeholder="What is the intent of this journey?"
                style={{
                  background: 'none', border: 'none', outline: 'none', color: theme.text, opacity: 0.3, width: '100%', fontSize: '1rem'
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginTop: '3rem' }}>
                <ProgressRing value={progressValue} isDark={darkMode} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ background: BUDGET.bg, color: BUDGET.c, fontSize: '0.65rem', padding: '4px 12px', borderRadius: 20, fontWeight: 700, marginBottom: 16, display: 'inline-block' }}>
                    {BUDGET.label}
                  </div>

                  {/* Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: '0.5rem', opacity: 0.3, textTransform: 'uppercase' }}>Progress</div>
                      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: theme.accent }}>{progressValue}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.5rem', opacity: 0.3, textTransform: 'uppercase' }}>Allocated</div>
                      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif" }}>{totalAllocated}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.5rem', opacity: 0.3, textTransform: 'uppercase' }}>Remaining</div>
                      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif" }}>{Math.max(0, remaining)}%</div>
                    </div>
                  </div>

                  {/* Kaizen Journal - Moved outside the grid to span full width */}
                  <div style={{ marginTop: 24, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={12} color={theme.accent} />
                      <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.4, fontWeight: 700 }}>
                        DAILY KAIZEN
                      </span>
                    </div>
                    <input
                      value={active.journal || ''}
                      onChange={(e) => setProject('journal', e.target.value)}
                      placeholder="What made today 1% better?"
                      style={{
                        width: '100%', background: 'none', border: 'none', outline: 'none',
                        fontSize: '0.9rem', color: theme.text, fontStyle: 'italic',
                        opacity: active.journal ? 1 : 0.5
                      }}
                    />
                  </div>
                </div>
              </div>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); if(taskInput.trim()){ addTask(taskInput.trim()); setTaskInput(''); } }} style={{ position:'relative', marginBottom:24 }}>
              <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Define a milestone..." style={{
                width:'100%', background: theme.card, border:`1px solid ${theme.border}`, padding:'1.2rem', borderRadius:16, color:theme.text, outline:'none'
              }} />
              <button style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background: theme.accent, border:'none', borderRadius:10, padding:8, cursor:'pointer' }}>
                <Plus size={18} color="white"/>
              </button>
            </form>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {active.tasks.map(t => (
                <div key={t.id} className="task-row" style={{ background: theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <button onClick={() => patchTask(t.id, { completed: !t.completed })} style={{
                      width:22, height:22, borderRadius:'50%', border: t.completed ? 'none' : `1px solid ${theme.border}`, background: t.completed ? '#5ec97c' : 'none', cursor:'pointer'
                    }}>
                      {t.completed && <Check size={14} color="white" />}
                    </button>
                    <span style={{ flex:1, opacity: t.completed ? 0.3 : 1, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</span>
                    
                    <div className="row-actions">
                      <button 
                        onClick={() => patchTask(t.id, { energy: 'low' })} 
                        className={`energy-btn ${t.energy === 'low' ? 'active' : ''}`}
                        title="Low Energy"
                      >
                        <Cloud size={14}/>
                      </button>
                      <button 
                        onClick={() => patchTask(t.id, { energy: 'med' })} 
                        className={`energy-btn ${t.energy === 'med' ? 'active' : ''}`}
                        title="Medium Energy"
                      >
                        <Coffee size={14}/>
                      </button>
                      <button 
                        onClick={() => patchTask(t.id, { energy: 'high' })} 
                        className={`energy-btn ${t.energy === 'high' ? 'active' : ''}`}
                        title="High Energy"
                      >
                        <Flame size={14}/>
                      </button>
                       <button onClick={() => kaizenSplit(t)} title="Kaizen Split" style={{ background:'none', border:'none', cursor:'pointer', color: theme.accent }}><Zap size={14}/></button>
                       <button onClick={() => { const n = new Set(expandedNotes); if(n.has(t.id)) n.delete(t.id); else n.add(t.id); setExpandedNotes(n); }} title="Add a Note" style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.3 }}><FileText size={14}/></button>
                       <button onClick={() => setProject('tasks', active.tasks.filter(x => x.id !== t.id))} title="Delete Task" style={{ background:'none', border:'none', cursor:'pointer', color:'#e8523a' }}><Trash2 size={14}/></button>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <input type="number" value={t.weight} onChange={e => patchTask(t.id, { weight: e.target.value })} style={{
                        width:34, background:'none', border:'none', color: theme.accent, fontWeight:700, textAlign:'right', outline:'none'
                      }} />
                      <span style={{ fontSize:'0.6rem', opacity:0.2 }}>%</span>
                    </div>
                  </div>
                  {expandedNotes.has(t.id) && (
                    <textarea value={t.note} onChange={e => patchTask(t.id, { note: e.target.value })} style={{
                      width:'100%', marginTop:12, background:'rgba(0,0,0,0.05)', border:'none', borderRadius:8, paddingLeft: 20, padding:10, color: theme.text, fontSize:'0.8rem', minHeight:60
                    }} placeholder="Notes and tactical steps..." />
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT COLLAPSE TOGGLE — desktop only */}
        <button
          className="desktop-toggle"
          onClick={() => setRightCollapsed(!rightCollapsed)}
          style={{
            position: 'absolute', right: rightCollapsed ? 8 : 248, top: 20, zIndex: 20,
            background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '50%',
            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: theme.text, transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: `0 1px 4px rgba(0,0,0,0.15)`
          }}
        >
          {rightCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* RIGHT SIDEBAR: BRAIN DUMP */}
        <aside style={{
            width: rightCollapsed ? 0 : (isTablet ? 240 : 260),
            opacity: rightCollapsed ? 0 : 1,
            background: theme.sidebar,
            borderLeft: `1px solid ${theme.border}`,
            padding: rightCollapsed ? 0 : '2rem 1.25rem',
            display: 'flex', flexDirection: 'column',
            height: '100vh', overflow: 'hidden',
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s'
          }}>

          {!rightCollapsed && (
            <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} color={theme.accent} />
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.4 }}>
              Brain Dump
            </div>
          </div>

          {/* Input Section */}
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (dumpInput.trim()) { 
                // Splits bulk text into individual cards
                const newEntries = dumpInput
                  .split('\n')
                  .filter(line => line.trim() !== '')
                  .map((text, i) => ({ id: Date.now() + i, text: text.trim() }));

                setBrainDump([...newEntries, ...brainDump]); 
                setDumpInput(''); 
              } 
            }} 
            style={{ marginBottom: 20 }}
          >
            <textarea 
              value={dumpInput} 
              onChange={e => setDumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form.requestSubmit();
                }
              }}
              placeholder="Type a thought." 
              style={{
                width: '100%', 
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)', 
                border: `1px solid ${theme.border}`, 
                borderRadius: 12, 
                padding: '12px', 
                color: theme.text, 
                fontSize: '0.85rem', 
                outline: 'none', 
                minHeight: '80px', 
                resize: 'none', 
                fontFamily: 'inherit',
                lineHeight: 1.5
              }} 
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: 8, 
              opacity: 0.4, 
              fontSize: '0.6rem' 
            }}>
              <span>{dumpInput.split('\n').filter(t => t.trim()).length} thoughts pending</span>
              <span>⌘</span>
            </div>
          </form>

          {/* Scrollable List Section */}
          <div style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {brainDump.length === 0 ? (
              <div style={{ opacity: 0.2, fontSize: '0.7rem', textAlign: 'center', marginTop: 40 }}>
                Your mind is clear. <br/> (For now.)
              </div>
            ) : (
              brainDump.map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    padding: '14px', 
                    background: theme.card, 
                    borderRadius: 12, 
                    fontSize: '0.85rem', 
                    border: `1px solid ${theme.border}`,
                    transition: '0.2s ease'
                  }}
                >
                  <div style={{ marginBottom: 12, opacity: 0.9, lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => promoteDump(item)}
                      title="Promote to milestone"
                      style={{
                        flex: 1, background: 'rgba(245,165,34,0.08)', border: `1px solid rgba(245,165,34,0.25)`, color: theme.accent,
                        borderRadius: 8, padding: '5px', cursor: 'pointer', fontSize: '0.62rem',
                        opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        transition: '0.2s'
                      }}
                      className="sidebar-btn"
                    >
                      <ArrowLeft size={11} /> Milestone
                    </button>
                    <button 
                      onClick={() => setBrainDump(brainDump.filter(x => x.id !== item.id))} 
                      style={{ 
                        width: 32, background: 'none', border: `1px solid ${theme.border}`, 
                        cursor: 'pointer', color: '#e8523a', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AUDIO SUITE */}
          <div style={{ 
            flexShrink: 0, 
            marginTop: 16, 
            padding: '16px', 
            background: `linear-gradient(145deg, ${theme.card}, ${theme.bg})`, 
            borderRadius: 16, 
            border: `1px solid ${theme.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {/* TOP SECTION: TITLE & MAIN TOGGLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: audioPlaying ? theme.accent : '#444', boxShadow: audioPlaying ? `0 0 8px ${theme.accent}` : 'none', transition: '0.3s' }} />
                  <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 800 }}>Soundscape</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: theme.text, opacity: 0.9 }}>
                  {audioPresets.find(p => p.id === audioPreset)?.label}
                  {audioPlaying && (
                    <span style={{ marginLeft: 8, fontSize: '0.6rem', color: theme.accent, opacity: 0.8, animation: 'pulse 2s infinite' }}>
                      {audioLoading ? '◌' : '活跃'} 
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={toggleAudio}
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  border: `1px solid ${audioPlaying ? theme.accent : theme.border}`,
                  background: audioPlaying ? theme.accent : 'rgba(255,255,255,0.03)',
                  color: audioPlaying ? '#fff' : theme.text,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: audioPlaying ? `0 4px 12px ${theme.accent}44` : 'none'
                }}
              >
                {audioPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />}
              </button>
            </div>

            {/* PRESET SELECTOR: Pill-style buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}>
              {audioPresets.map(p => (
                <button
                  key={p.id}
                  onClick={() => switchPreset(p.id)}
                  title={p.desc}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 7, fontSize: '0.6rem', cursor: 'pointer',
                    border: 'none',
                    background: p.id === audioPreset ? theme.card : 'transparent',
                    color: p.id === audioPreset ? theme.text : theme.text,
                    opacity: p.id === audioPreset ? 1 : 0.4, 
                    transition: '0.2s',
                    fontWeight: p.id === audioPreset ? 600 : 400,
                    boxShadow: p.id === audioPreset ? '0 2px 6px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* VOLUME SLIDER: Sleek and Minimal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Volume2 size={12} style={{ opacity: audioVolume > 0 ? 0.5 : 0.1, transition: '0.2s' }} />
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="range" min={0} max={1} step={0.01} value={audioVolume}
                  onChange={e => changeVolume(parseFloat(e.target.value))}
                  style={{ 
                    width: '100%', 
                    accentColor: theme.accent, 
                    cursor: 'pointer',
                    height: 4,
                    borderRadius: 2,
                    appearance: 'none',
                    background: `linear-gradient(to right, ${theme.accent} ${audioVolume * 100}%, ${theme.border} ${audioVolume * 100}%)`
                  }}
                />
              </div>
              <span style={{ fontSize: '0.55rem', opacity: 0.3, width: 20, textAlign: 'right', fontFamily: 'monospace' }}>
                {Math.round(audioVolume * 100)}
              </span>
            </div>

            <style>{`
              @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
              }
              input[type='range']::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                background: #fff;
                border: 2px solid ${theme.accent};
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
            `}</style>
          </div>

          </div>
          )}
        </aside>


      </div>
    </>
  );
}