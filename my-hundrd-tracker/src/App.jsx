import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Trash2, FileText, Sun, Moon } from 'lucide-react';

// --- Confetti Burst (Existing Logic) ---
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

// --- Progress Ring (Existing Logic) ---
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

// --- Main App Component ---
export default function Hundrd() {
  // 1. PERSISTENCE LOGIC (Load from LocalStorage)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('hundrd_projects');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Name of Project', description: 'A minimalist approach to goals.', tasks: [] }
    ];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('hundrd_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [activeId, setActiveId] = useState(projects[0]?.id || 1);
  const [taskInput, setTaskInput] = useState('');
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [confetti, setConfetti] = useState(false);
  const prevProgress = useRef(0);

  // 2. AUTO-SAVE HOOK
  useEffect(() => {
    localStorage.setItem('hundrd_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('hundrd_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const active = projects.find(p => p.id === activeId) ?? projects[0];
  const totalAllocated = active.tasks.reduce((s, t) => s + (Number(t.weight) || 0), 0);
  const progressValue  = active.tasks.reduce((s, t) => t.completed ? s + (Number(t.weight) || 0) : s, 0);
  const remaining      = 100 - totalAllocated;

  useEffect(() => {
    if (progressValue === 100 && prevProgress.current < 100) setConfetti(true);
    prevProgress.current = progressValue;
  }, [progressValue]);

  // -- Actions --
  const setProject = (field, val) =>
    setProjects(ps => ps.map(p => p.id === activeId ? { ...p, [field]: val } : p));

  const addTask = e => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setProject('tasks', [...active.tasks, { id: Date.now(), text: taskInput.trim(), weight: 0, completed: false, note: '' }]);
    setTaskInput('');
  };

  const patchTask = (id, patch) =>
    setProject('tasks', active.tasks.map(t => t.id === id ? { ...t, ...patch } : t));

  const deleteTask = id => {
    setProject('tasks', active.tasks.filter(t => t.id !== id));
  };

  const addProject = () => {
    const id = Date.now();
    setProjects(ps => [...ps, { id, name: 'New Journey', description: '', tasks: [] }]);
    setActiveId(id);
  };

  const theme = {
    bg: darkMode ? '#0b0907' : '#fcfaf2',
    text: darkMode ? '#ede5d0' : '#2d2b28',
    sidebar: darkMode ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.02)',
    border: darkMode ? 'rgba(237,229,208,0.05)' : 'rgba(45,43,40,0.08)',
    card: darkMode ? 'rgba(237,229,208,0.022)' : 'rgba(0,0,0,0.015)',
    input: darkMode ? 'rgba(237,229,208,0.025)' : '#ffffff'
  };

  const budgetState = totalAllocated === 100 ? 'exact' : totalAllocated > 100 ? 'over' : 'under';
  const BUDGET = {
    exact: { c:'#5ec97c', bg:'rgba(94,201,124,0.1)',  label:'Budget complete ·' },
    over:  { c:'#e8523a', bg:'rgba(232,82,58,0.1)',   label:`${totalAllocated - 100}% over budget ·` },
    under: { c:'#f5a522', bg:'rgba(245,165,34,0.1)',  label:`${remaining}% unallocated ·` },
  }[budgetState];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background: ${theme.bg}; color: ${theme.text}; transition: background 0.5s ease, color 0.5s ease; overflow: hidden;}
        .t-enter{animation: slideUp .42s cubic-bezier(.22,1,.36,1) both;}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .note-reveal{animation: reveal .3s ease forwards;}
        @keyframes reveal{from{opacity:0;max-height:0;}to{opacity:1;max-height:200px;}}
        .sidebar-btn:hover{ background: ${darkMode ? 'rgba(245,165,34,0.07)' : 'rgba(0,0,0,0.04)'} !important; }
        .del-btn{ opacity: 0; transition: opacity 0.2s; }
        .task-row:hover .del-btn{ opacity: 1; }
      `}</style>

      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

      <div style={{ display:'flex', height:'100vh' }}>
        
        {/* SIDEBAR */}
        <aside style={{ width:248, flexShrink:0, background: theme.sidebar, borderRight:`1px solid ${theme.border}`, padding:'2rem 1.25rem', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '2.5rem' }}>
            <div>
              <h1 style={{ fontFamily:"'Fraunces', serif", fontStyle:'italic', fontWeight:300, fontSize:'1.4rem', color:'#f5a522' }}>Hundrd</h1>
              <div style={{ fontSize:'0.52rem', letterSpacing:'0.24em', textTransform:'uppercase', opacity:0.3 }}>Weighted Focus</div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.4 }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:'0.52rem', letterSpacing:'0.25em', textTransform:'uppercase', opacity:0.3, fontWeight:600, marginBottom:'1rem' }}>Collections</div>
            {projects.map(p => (
              <button key={p.id} className="sidebar-btn" onClick={() => setActiveId(p.id)} style={{
                width:'100%', padding:'0.7rem', borderRadius:10, textAlign:'left', border:'none', cursor:'pointer', marginBottom:4,
                background: p.id === activeId ? (darkMode ? 'rgba(245,165,34,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                color: p.id === activeId ? theme.text : 'rgba(128,128,128,0.5)', transition:'0.2s'
              }}>
                <div style={{ fontSize:'0.8rem', fontWeight:500 }}>{p.name || 'Untitled'}</div>
              </button>
            ))}
            <button onClick={addProject} style={{ background:'none', border:'none', color:'#f5a522', fontSize:'0.75rem', padding:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={14} /> New Project
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, overflowY:'auto', padding:'3rem' }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <header style={{ marginBottom:'3rem' }}>
              <input value={active.name} onChange={e => setProject('name', e.target.value)} style={{
                background:'none', border:'none', outline:'none', color: theme.text, width:'100%',
                fontFamily:"'Fraunces', serif", fontStyle:'italic', fontSize:'3.5rem', fontWeight:200, letterSpacing:'-0.02em'
              }} />
              <input value={active.description} onChange={e => setProject('description', e.target.value)} placeholder="Subtitle..." style={{
                background:'none', border:'none', outline:'none', color: theme.text, opacity:0.3, width:'100%', fontSize:'0.9rem'
              }} />

              <div style={{ display:'flex', alignItems:'center', gap:'2.5rem', marginTop:'2.5rem' }}>
                <ProgressRing value={progressValue} isDark={darkMode} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, background: BUDGET.bg, color: BUDGET.c, fontSize:'0.65rem', fontWeight:600, marginBottom:16 }}>
                    {BUDGET.label}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                     <div>
                       <div style={{ fontSize:'0.5rem', textTransform:'uppercase', opacity:0.3 }}>Allocated</div>
                       <div style={{ fontFamily:"'Fraunces', serif", fontSize:'1.5rem' }}>{totalAllocated}%</div>
                     </div>
                     <div>
                       <div style={{ fontSize:'0.5rem', textTransform:'uppercase', opacity:0.3 }}>Remaining</div>
                       <div style={{ fontFamily:"'Fraunces', serif", fontSize:'1.5rem' }}>{Math.max(0, remaining)}%</div>
                     </div>
                  </div>
                </div>
              </div>
            </header>

            <form onSubmit={addTask} style={{ position:'relative', marginBottom:20 }}>
              <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Milestone..." style={{
                width:'100%', background: theme.input, border:`1px solid ${theme.border}`, borderRadius:12, padding:'1rem', color: theme.text, outline:'none'
              }} />
              <button type="submit" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'#f5a522', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer' }}>
                <Plus size={16} color="white" />
              </button>
            </form>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {active.tasks.map((t, i) => (
                <div key={t.id} className="task-row t-enter" style={{ background: theme.card, border:`1px solid ${theme.border}`, borderRadius:12, padding:'1rem', animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <button onClick={() => patchTask(t.id, { completed: !t.completed })} style={{
                      width:20, height:20, borderRadius:'50%', border: t.completed ? 'none' : `1px solid ${theme.border}`, background: t.completed ? '#5ec97c' : 'none', cursor:'pointer'
                    }}>
                      {t.completed && <Check size={12} color="white" />}
                    </button>
                    <span style={{ flex:1, opacity: t.completed ? 0.3 : 1, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</span>
                    <input type="number" value={t.weight} onChange={e => patchTask(t.id, { weight: e.target.value })} style={{
                      width:35, background:'none', border:'none', color: '#f5a522', textAlign:'right', fontWeight:600, outline:'none'
                    }} />
                    <span style={{ fontSize:'0.6rem', opacity:0.2 }}>%</span>
                    <button onClick={() => toggleNote(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.2 }}><FileText size={14}/></button>
                    <button onClick={() => deleteTask(t.id)} className="del-btn" style={{ background:'none', border:'none', cursor:'pointer', color:'#e8523a' }}><Trash2 size={14}/></button>
                  </div>
                  {expandedNotes.has(t.id) && (
                    <div className="note-reveal" style={{ marginTop:12 }}>
                      <textarea value={t.note} onChange={e => patchTask(t.id, { note: e.target.value })} style={{
                        width:'100%', background:'rgba(0,0,0,0.1)', border:'none', borderRadius:8, padding:10, color: theme.text, fontSize:'0.8rem'
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}