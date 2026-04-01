import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Trash2, FileText, Sun, Moon, Zap, Sparkles, ArrowLeft, Info, Cloud, Coffee, Scissors} from 'lucide-react';

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

  const [activeId, setActiveId] = useState(projects[0]?.id || 1);
  const [taskInput, setTaskInput] = useState('');
  const [dumpInput, setDumpInput] = useState('');
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [confetti, setConfetti] = useState(false);
  const prevProgress = useRef(0);

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

  const addProject = () => {
    const id = Date.now();
    setProjects(ps => [...ps, { id, name: 'New Journey', description: 'Begin small.', tasks: [] }]);
    setActiveId(id);
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
      `}</style>

      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

      <div style={{ display:'flex', height:'100vh' }}>
        
        {/* SIDEBAR: COLLECTIONS */}
        <aside style={{ width:248, background: theme.sidebar, borderRight:`1px solid ${theme.border}`, padding:'2rem 1.25rem', display:'flex', flexDirection:'column' }}>
          <div style={{ marginBottom: '2.5rem', display:'flex', justifyContent:'space-between' }}>
            <div>
                <h1 style={{ fontFamily:"'Fraunces', serif", fontStyle:'italic', fontWeight:300, fontSize:'1.4rem', color: theme.accent, margin:0 }}>Hundrd</h1>
                <div style={{ fontSize:'0.52rem', letterSpacing:'0.24em', textTransform:'uppercase', opacity:0.3 }}>Weighted Focus</div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.4 }}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button 
              onClick={() => setShowArchived(false)}
              style={{ 
                flex: 1, fontSize: '0.6rem', padding: '4px', borderRadius: 6,
                background: !showArchived ? theme.card : 'none',
                border: `1px solid ${theme.border}`, color: theme.text
              }}
            >
              Active
            </button>
            <button 
              onClick={() => setShowArchived(true)}
              style={{ 
                flex: 1, fontSize: '0.6rem', padding: '4px', borderRadius: 6,
                background: showArchived ? theme.card : 'none',
                border: `1px solid ${theme.border}`, color: theme.text
              }}
            >
              Archived
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:'0.52rem', letterSpacing:'0.25em', textTransform:'uppercase', opacity:0.3, fontWeight:600, marginBottom:'1rem' }}>Collections</div>
            {filteredProjects.map(p => (
              <button key={p.id} onClick={() => setActiveId(p.id)} className="sidebar-btn" style={{
                width:'100%', padding:'0.7rem', borderRadius:10, textAlign:'left', border:'none', cursor:'pointer', marginBottom:4,
                background: p.id === activeId ? (darkMode ? 'rgba(245,165,34,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                color: p.id === activeId ? theme.text : 'rgba(128,128,128,0.5)'
              }}>
                <div style={{ fontSize:'0.8rem', fontWeight:500 }}>{p.name || 'Untitled'}</div>
              </button>
            ))}
            <button onClick={addProject} style={{ background:'none', border:'none', color: theme.accent, fontSize:'0.75rem', padding:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={14} /> New Journey
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex:1, overflowY:'auto', padding:'3rem 2rem' }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            
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
                        <Zap size={14}/>
                      </button>
                       <button onClick={() => kaizenSplit(t)} title="Kaizen Split" style={{ background:'none', border:'none', cursor:'pointer', color: theme.accent }}><Scissors size={14}/></button>
                       <button onClick={() => { const n = new Set(expandedNotes); if(n.has(t.id)) n.delete(t.id); else n.add(t.id); setExpandedNotes(n); }} style={{ background:'none', border:'none', cursor:'pointer', color: theme.text, opacity:0.3 }}><FileText size={14}/></button>
                       <button onClick={() => setProject('tasks', active.tasks.filter(x => x.id !== t.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'#e8523a' }}><Trash2 size={14}/></button>
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

        {/* RIGHT SIDEBAR: BRAIN DUMP */}
        <aside style={{ 
          width: 260, 
          background: theme.sidebar, 
          borderLeft: `1px solid ${theme.border}`, 
          padding: '2rem 1.25rem', 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh' 
        }}>
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
            overflowY: 'auto', 
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
                      style={{ 
                        flex: 1, background: theme.accent, border: 'none', color: 'white', 
                        borderRadius: 8, padding: '6px', cursor: 'pointer', fontSize: '0.7rem', 
                        fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 
                      }}
                    >
                      <ArrowLeft size={12} /> Milestone
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
        </aside>
      </div>
    </>
  );
}