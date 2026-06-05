import { useEffect, useRef, useState, useCallback } from 'react';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

/* Authentic Windows 7 desktop icons */
const DESKTOP_ICONS = [
  { id:'home',          label:'Computer',           emoji:'💻', color:'#7cc9ff' },
  { id:'file-explorer', label:'Documents',          emoji:'📁', color:'#fbbf24' },
  { id:'browser',       label:'Internet\nExplorer', emoji:'🌐', color:'#38bdf8' },
  { id:'projects',      label:'My Projects',        emoji:'📂', color:'#f8b84e' },
  { id:'terminal',      label:'Command\nPrompt',    emoji:'⬛', color:'#86efac' },
  { id:'control-panel', label:'Control Panel',      emoji:'⚙️', color:'#d5dde8' },
  { id:'games',         label:'Games',              emoji:'🎮', color:'#34d399' },
  { id:'notepad',       label:'Notepad',            emoji:'📝', color:'#94a3b8' },
  { id:'recycle-bin',   label:'Recycle Bin',        emoji:'🗑️', color:'#9ca3af', isRecycle:true },
];

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function Desktop({ desktopRef }) {
  const { openApp, wallpaper, wallpaperStyle, openContextMenu, closeContextMenu,
          pushNotification, incrementClick } = useOSStore();
  const [selected, setSelected] = useState(null);
  const [ripples, setRipples] = useState([]);
  const canvasRef   = useRef(null);
  const matrixRef   = useRef(null);
  const rafRef      = useRef(null);
  const matRafRef   = useRef(null);
  const konamiRef   = useRef([]);

  /* ── Subtle floating particles ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({length:35}, ()=>({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.15,
      r:Math.random()*1+.3, a:Math.random()*.08+.02,
    }));
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
        ctx.globalAlpha=p.a; ctx.fillStyle='#fff';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); };
  }, []);

  /* ── Matrix rain easter egg ── */
  const startMatrix = useCallback(() => {
    const c = matrixRef.current; if(!c) return;
    c.style.display='block'; c.width=window.innerWidth; c.height=window.innerHeight;
    const ctx=c.getContext('2d');
    const cols=Math.floor(c.width/14);
    const drops=Array(cols).fill(1);
    const draw=()=>{
      ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='#0f0'; ctx.font='13px monospace';
      drops.forEach((y,i)=>{
        ctx.fillText(String.fromCharCode(0x30A0+Math.random()*96),i*14,y*14);
        if(y*14>c.height&&Math.random()>.975) drops[i]=0;
        drops[i]++;
      });
      matRafRef.current=requestAnimationFrame(draw);
    };
    matRafRef.current=requestAnimationFrame(draw);
    setTimeout(()=>{ cancelAnimationFrame(matRafRef.current); c.style.display='none'; },8000);
  }, []);

  /* ── Konami code ── */
  useEffect(() => {
    const h = (e) => {
      konamiRef.current=[...konamiRef.current,e.key].slice(-KONAMI.length);
      if(konamiRef.current.join(',')===KONAMI.join(',')) {
        startMatrix();
        pushNotification({title:'🐉 Cheat Code!',body:'Matrix rain activated!',icon:'🎮'});
        konamiRef.current=[];
      }
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[startMatrix,pushNotification]);

  /* ── Click handlers ── */
  const handleClick = useCallback((e) => {
    setSelected(null); closeContextMenu(); incrementClick();
    const id=Date.now();
    setRipples(r=>[...r,{id,x:e.clientX,y:e.clientY}]);
    setTimeout(()=>setRipples(r=>r.filter(rp=>rp.id!==id)),650);
  }, [closeContextMenu, incrementClick]);

  const handleRightClick = useCallback((e) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, [
      { label:'View', icon:'👁', submenu:[
        {label:'Large Icons', action:()=>pushNotification({title:'View',body:'Switched to Large Icons',icon:'🖼️'})},
        {label:'Medium Icons', action:()=>pushNotification({title:'View',body:'Switched to Medium Icons',icon:'🖼️'})},
        {label:'Small Icons', action:()=>pushNotification({title:'View',body:'Switched to Small Icons',icon:'🖼️'})},
      ]},
      { label:'Sort by', icon:'↕', submenu:[
        {label:'Name', action:()=>pushNotification({title:'Sort',body:'Sorted by Name',icon:'🔤'})},
        {label:'Size', action:()=>pushNotification({title:'Sort',body:'Sorted by Size',icon:'📊'})},
        {label:'Date modified', action:()=>pushNotification({title:'Sort',body:'Sorted by Date',icon:'📅'})},
      ]},
      { divider:true },
      { label:'Refresh', icon:'🔄', shortcut:'F5', action:()=>pushNotification({title:'Desktop',body:'Desktop refreshed',icon:'✅'}) },
      { divider:true },
      { label:'New', icon:'📄', submenu:[
        {label:'Folder', action:()=>pushNotification({title:'New',body:'New folder created',icon:'📁'})},
        {label:'Text Document', action:()=>{openApp('notepad');pushNotification({title:'New',body:'Text document opened',icon:'📝'});}},
      ]},
      { divider:true },
      { label:'Gadgets', icon:'⚙️', action:()=>pushNotification({title:'Gadgets',body:'Desktop gadgets are shown on the right side',icon:'⚙️'}) },
      { label:'Personalize', icon:'🎨', action:()=>openApp('control-panel') },
    ]);
  }, [openContextMenu, openApp, pushNotification]);

  /* ── Wallpaper style ── */
  const bgStyle = {};
  if (wallpaper?.startsWith('http')||wallpaper?.startsWith('/')) {
    bgStyle.backgroundImage=`url(${wallpaper})`;
    bgStyle.backgroundSize=wallpaperStyle==='tile'?'auto':wallpaperStyle==='fit'?'contain':'cover';
    bgStyle.backgroundPosition='center';
    bgStyle.backgroundRepeat=wallpaperStyle==='tile'?'repeat':'no-repeat';
  } else {
    bgStyle.background=wallpaper;
  }

  return (
    <div
      ref={desktopRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{paddingBottom:'var(--aero-taskbar-h, 40px)'}}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {/* Wallpaper */}
      <div className="aero-wallpaper" style={bgStyle} />

      {/* Windows logo centered on desktop */}
      <div className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center" style={{ paddingBottom: 40 }}>
        <div style={{ opacity: 0.12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: 80, height: 80 }}>
          <div style={{ borderRadius: 6, background: '#ef4444' }} />
          <div style={{ borderRadius: 6, background: '#22c55e' }} />
          <div style={{ borderRadius: 6, background: '#3b82f6' }} />
          <div style={{ borderRadius: 6, background: '#eab308' }} />
        </div>
      </div>

      {/* Win7 authentic light rays */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(100,180,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 30% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)',
      }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[2]" />
      {/* Matrix canvas */}
      <canvas ref={matrixRef} className="absolute inset-0 pointer-events-none z-[3]" style={{display:'none',opacity:.85}} />

      {/* Click ripples */}
      {ripples.map(r=>(
        <div key={r.id} className="aero-ripple" style={{left:r.x-20,top:r.y-20}} />
      ))}

      {/* Desktop Icons — Win7 grid layout */}
      <div className="absolute left-3 top-3 z-10 flex flex-col flex-wrap gap-1 max-h-[calc(100vh-80px)]"
        onClick={e=>e.stopPropagation()}>
        {DESKTOP_ICONS.map(item=>(
          <button
            key={item.id}
            type="button"
            className={`aero-icon ${selected===item.id?'selected':''}`}
            onClick={e=>{e.stopPropagation();setSelected(item.id);}}
            onDoubleClick={()=>{
              if(item.isRecycle){pushNotification({title:'Recycle Bin',body:'Recycle Bin is empty.',icon:'🗑️'});return;}
              openApp(item.id);
            }}
            onContextMenu={e=>{
              e.preventDefault();e.stopPropagation();setSelected(item.id);
              openContextMenu(e.clientX,e.clientY,[
                {label:'Open', icon:'📂', action:()=>openApp(item.id)},
                {divider:true},
                {label:'Pin to Taskbar', icon:'📌', action:()=>pushNotification({title:'Pinned',body:`${item.label.replace('\n',' ')} pinned to taskbar`,icon:'📌'})},
                {divider:true},
                {label:'Properties', icon:'ℹ️', action:()=>pushNotification({title:'Properties',body:`${item.label.replace('\n',' ')}: System Application`,icon:'ℹ️'})},
              ]);
            }}
            title={item.label.replace('\n',' ')}
          >
            <div className="aero-icon-img">
              <span style={{fontSize:38, filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}}>{item.emoji}</span>
            </div>
            <span className="aero-icon-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right-side Gadgets — authentic Win7 sidebar widgets */}
      <div className="aero-gadgets pointer-events-none">
        <GadgetClock />
        <GadgetWeather />
        <GadgetSystem />
      </div>
    </div>
  );
}

/* ── Gadget: Analog Clock ── */
function GadgetClock() {
  const canvasRef = useRef(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 140, cx = size / 2, cy = size / 2, r = 58;
    ctx.clearRect(0, 0, size, size);
    // Face
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0.03)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
    // Hour marks
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8));
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = i % 3 === 0 ? 2 : 1; ctx.stroke();
    }
    const h = date.getHours() % 12, m = date.getMinutes(), s = date.getSeconds();
    // Hour hand
    const ha = ((h + m / 60) * 30 - 90) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * 30, cy + Math.sin(ha) * 30);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
    // Minute hand
    const ma = ((m + s / 60) * 6 - 90) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * 42, cy + Math.sin(ma) * 42);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.8; ctx.stroke();
    // Second hand
    const sa = (s * 6 - 90) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sa) * 48, cy + Math.sin(sa) * 48);
    ctx.strokeStyle = 'rgba(239,68,68,0.8)'; ctx.lineWidth = 0.8; ctx.stroke();
    // Center dot
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  }, [date]);

  return (
    <div className="aero-gadget" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10 }}>
      <canvas ref={canvasRef} width={140} height={140} />
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

/* ── Gadget: Weather ── */
function GadgetWeather() {
  return (
    <div className="aero-gadget">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 32 }}>☀️</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 300, color: 'white', lineHeight: 1 }}>24°C</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Kathmandu</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        <span>Humidity: 52%</span>
        <span>Wind: 8km/h</span>
      </div>
    </div>
  );
}

/* ── Gadget: System Monitor ── */
function GadgetSystem() {
  const [cpu, setCpu] = useState(23);
  const [ram, setRam] = useState(54);

  useEffect(() => {
    const i = setInterval(() => {
      setCpu(Math.floor(15 + Math.random() * 30));
      setRam(Math.floor(45 + Math.random() * 20));
    }, 3000);
    return () => clearInterval(i);
  }, []);

  const bars = [
    { label: 'CPU', val: cpu, from: '#22d3ee', to: '#3b82f6' },
    { label: 'RAM', val: ram, from: '#86efac', to: '#22c55e' },
    { label: 'Disk', val: 34, from: '#c4b5fd', to: '#8b5cf6' },
  ];

  return (
    <div className="aero-gadget">
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>System Monitor</div>
      {bars.map(b => (
        <div key={b.label} style={{ marginBottom: 7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>
            <span>{b.label}</span><span>{b.val}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${b.val}%`, background: `linear-gradient(90deg,${b.from},${b.to})`, transition: 'width 0.5s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
