import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Wifi, Battery, ChevronUp } from 'lucide-react';
import useOSStore from '@/store/useOSStore';
import StartMenu from './StartMenu';
import './aero-styles.css';

/* Windows logo SVG for the orb */
function WinLogo() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" style={{position:'relative',zIndex:1}}>
      <path d="M0 2.5L8.2 1.4V9.5H0z" fill="rgba(255,255,255,0.9)" />
      <path d="M9.1 1.3L20 0V9.5H9.1z" fill="rgba(255,255,255,0.8)" />
      <path d="M0 10.5H8.2V18.6L0 17.5z" fill="rgba(255,255,255,0.75)" />
      <path d="M9.1 10.5H20V20L9.1 18.7z" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

export default function Taskbar() {
  const { windows, activeWindowId, focusWindow, minimizeApp, openApp,
          toggleStartMenu, startMenuOpen, setPeekWindow,
          openContextMenu, pushNotification,
          volume, isMuted, setVolume, toggleMute } = useOSStore();

  const [time, setTime]       = useState(new Date());
  const [hoverWin, setHoverWin] = useState(null);
  const [showVol, setShowVol] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const startClicksRef = useRef([]);
  const volRef = useRef(null);

  useEffect(() => {
    const i = setInterval(()=>setTime(new Date()), 1000);
    return ()=>clearInterval(i);
  }, []);

  /* Close volume on outside click */
  useEffect(() => {
    if (!showVol) return;
    const h = (e) => { if(volRef.current&&!volRef.current.contains(e.target)) setShowVol(false); };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  }, [showVol]);

  const handleTaskBtn = useCallback((winId) => {
    const w = windows.find(w=>w.id===winId);
    if (!w) return;
    if (activeWindowId===winId && !w.isMinimized) minimizeApp(winId);
    else focusWindow(winId);
  }, [windows, activeWindowId, focusWindow, minimizeApp]);

  const handleStartClick = () => {
    const now = Date.now();
    startClicksRef.current = [...startClicksRef.current.filter(t=>now-t<3000), now];
    if (startClicksRef.current.length >= 7) {
      startClicksRef.current = [];
      pushNotification({title:'🎵 Easter Egg!',body:'7 clicks! You found the secret!',icon:'⭐'});
    }
    toggleStartMenu();
  };

  const timeStr = time.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
  const dateStr = time.toLocaleDateString('en-US',{month:'numeric',day:'numeric',year:'numeric'});

  const setPeek = (on) => document.body.classList.toggle('aero-peeking', on);

  return (
    <>
      <StartMenu />
      <div className="aero-taskbar">
        {/* Start Orb */}
        <button className="aero-start-orb" onClick={handleStartClick} title="Start" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <WinLogo />
        </button>

        {/* Quick Launch */}
        <div className="aero-quicklaunch" style={{display:'flex',alignItems:'center',gap:2,padding:'0 4px',borderRight:'1px solid rgba(255,255,255,0.1)',marginRight:4}}>
          {[
            {id:'file-explorer',emoji:'📁',title:'File Explorer'},
            {id:'browser',emoji:'🌐',title:'Internet Explorer'},
            {id:'terminal',emoji:'💻',title:'Terminal'},
          ].map(q=>(
            <button key={q.id} onClick={()=>openApp(q.id)} title={q.title}
              style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:3,border:'none',background:'transparent',cursor:'pointer',fontSize:15,transition:'background 0.12s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {q.emoji}
            </button>
          ))}
        </div>

        {/* Open Windows */}
        <div style={{display:'flex',alignItems:'center',gap:2,flex:1,overflow:'hidden',padding:'0 2px'}}>
          {windows.map(win=>{
            const Icon = win.icon;
            const isActive = activeWindowId===win.id && !win.isMinimized;
            return (
              <div key={win.id} style={{position:'relative',flexShrink:0}}
                onMouseEnter={()=>{setHoverWin(win.id);setPeekWindow(win.id);}}
                onMouseLeave={()=>{setHoverWin(null);setPeekWindow(null);}}>
                <button
                  className={`aero-taskbar-btn ${isActive?'active':''} ${win.isMinimized?'minimized':''}`}
                  onClick={()=>handleTaskBtn(win.id)}
                  onContextMenu={e=>{e.preventDefault();openContextMenu(e.clientX,e.clientY,[
                    {label:'Restore',action:()=>useOSStore.getState().restoreApp(win.id)},
                    {label:'Minimize',action:()=>minimizeApp(win.id)},
                    {label:'Maximize',action:()=>useOSStore.getState().maximizeApp(win.id)},
                    {divider:true},
                    {label:'Close window',action:()=>useOSStore.getState().closeApp(win.id)},
                  ]);}}
                  title={win.title}
                >
                  {Icon && <Icon style={{width:13,height:13,color:win.iconColor,flexShrink:0}} />}
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',maxWidth:120}}>{win.title}</span>
                </button>
                {/* Thumbnail preview */}
                {hoverWin===win.id && (
                  <div className="aero-thumb">
                    <div className="aero-thumb-title">
                      {Icon && <Icon style={{width:11,height:11,color:win.iconColor}} />}
                      <span>{win.title}</span>
                    </div>
                    <div className="aero-thumb-screen">
                      <div className="aero-thumb-bar" />
                      <div className="aero-thumb-lines"><span/><span/><span/></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System Tray */}
        <div className="aero-systray">
          <div className="aero-tray-item" title="Network"><Wifi style={{width:13,height:13}} /></div>
          <div className="aero-tray-item" title="Battery"><Battery style={{width:13,height:13}} /></div>

          {/* Volume */}
          <div className="aero-tray-item" ref={volRef} style={{cursor:'pointer'}} onClick={()=>setShowVol(v=>!v)} title={isMuted?'Sound: Off':`Sound: On (${volume}%)`}>
            {isMuted ? <VolumeX style={{width:13,height:13,color:'#f87171'}} /> : <Volume2 style={{width:13,height:13}} />}
            {showVol && (
              <div className="aero-vol-popup" onClick={e=>e.stopPropagation()}>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.5)'}}>{isMuted?'Muted':`${volume}%`}</span>
                <input type="range" min={0} max={100} value={isMuted?0:volume}
                  onChange={e=>{setVolume(Number(e.target.value));if(isMuted)toggleMute();}}
                  className="aero-vol-slider" />
                <button onClick={toggleMute}
                  style={{fontSize:10,padding:'3px 8px',borderRadius:4,color:isMuted?'#f87171':'#4ade80',background:isMuted?'rgba(248,113,113,0.15)':'rgba(74,222,128,0.15)',border:'none',cursor:'pointer',fontWeight:500}}>
                  {isMuted?'🔇 OFF':'🔊 ON'}
                </button>
              </div>
            )}
          </div>

          <div className="aero-tray-item"><ChevronUp style={{width:11,height:11}} /></div>

          {/* Clock */}
          <div className="aero-clock" style={{position:'relative'}}
            onMouseEnter={()=>setShowDate(true)} onMouseLeave={()=>setShowDate(false)}>
            <div>{timeStr}</div>
            <div style={{fontSize:9,opacity:.65}}>{dateStr}</div>
            {showDate && (
              <div style={{position:'absolute',bottom:'100%',right:0,marginBottom:6,padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(15,25,45,0.92)',backdropFilter:'blur(24px)',fontSize:11,color:'rgba(255,255,255,0.85)',whiteSpace:'nowrap',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
                {time.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            )}
          </div>

          {/* Show Desktop */}
          <button className="aero-show-desktop" title="Show desktop"
            onMouseEnter={()=>setPeek(true)} onMouseLeave={()=>setPeek(false)}
            onClick={()=>{setPeek(false);useOSStore.getState().toggleShowDesktop();}} />
        </div>
      </div>
    </>
  );
}
