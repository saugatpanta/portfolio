import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Power, Moon, RefreshCw,
         Home, User, FolderGit2, Terminal, BookOpen, Mail,
         Globe, Calculator, Folder, Settings, Activity,
         Shield, FileText, Music, Gamepad2, Image } from 'lucide-react';
import useOSStore from '@/store/useOSStore';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import './aero-styles.css';

const ALL_APPS = [
  { id:'about',         label:'About Me',          icon:User,       color:'#c4b5fd', desc:'Who I am' },
  { id:'admin',         label:'Admin Panel',       icon:Shield,     color:'#f97316', desc:'Site admin' },
  { id:'blog',          label:'Blog',              icon:BookOpen,   color:'#4dd7a6', desc:'Articles' },
  { id:'calculator',    label:'Calculator',        icon:Calculator, color:'#a78bfa', desc:'Math' },
  { id:'contact',       label:'Contact',           icon:Mail,       color:'#60d6ff', desc:'Get in touch' },
  { id:'control-panel', label:'Control Panel',     icon:Settings,   color:'#d5dde8', desc:'Settings' },
  { id:'experience',    label:'Experience',        icon:Terminal,   color:'#ff8a78', desc:'Work history' },
  { id:'file-explorer', label:'File Explorer',     icon:Folder,     color:'#fbbf24', desc:'Browse files' },
  { id:'games',         label:'Games',             icon:Gamepad2,   color:'#34d399', desc:'Play games' },
  { id:'home',          label:'Home',              icon:Home,       color:'#7dbdff', desc:'Portfolio home' },
  { id:'browser',       label:'Internet Explorer', icon:Globe,      color:'#38bdf8', desc:'Browse the web' },
  { id:'media-player',  label:'Media Player',      icon:Music,      color:'#a78bfa', desc:'Music & video' },
  { id:'notepad',       label:'Notepad',           icon:FileText,   color:'#94a3b8', desc:'Text editor' },
  { id:'image-viewer',  label:'Photo Viewer',      icon:Image,      color:'#f472b6', desc:'View images' },
  { id:'projects',      label:'Projects',          icon:FolderGit2, color:'#f8b84e', desc:'My work' },
  { id:'task-manager',  label:'Task Manager',      icon:Activity,   color:'#f59e0b', desc:'System monitor' },
  { id:'terminal',      label:'Terminal',          icon:Terminal,   color:'#4ade80', desc:'Command line' },
];

const RIGHT_LINKS = [
  { id:'about',         label:'About Me',      icon:User },
  { id:'file-explorer', label:'Documents',     icon:Folder },
  { id:'image-viewer',  label:'Pictures',      icon:Image },
  { id:'control-panel', label:'Control Panel', icon:Settings },
  { id:'task-manager',  label:'Task Manager',  icon:Activity },
];

export default function StartMenu() {
  const { startMenuOpen, closeStartMenu, openApp, setBootState, pushNotification } = useOSStore();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile-image'],
    queryFn: () => firebaseClient.entities.ProfileImage.get(),
    staleTime: 5*60*1000,
  });
  const avatarUrl = profileData?.profileImage || '';

  const apps = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? ALL_APPS.filter(a=>a.label.toLowerCase().includes(q)||a.desc.toLowerCase().includes(q)) : (showAll ? ALL_APPS : ALL_APPS.slice(0,9));
    return list;
  }, [search, showAll]);

  useEffect(() => {
    if (!startMenuOpen) return;
    const h = (e) => {
      if (!e.target.closest('.aero-start-menu') && !e.target.closest('.aero-start-orb')) closeStartMenu();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [startMenuOpen, closeStartMenu]);

  useEffect(() => { if (!startMenuOpen) { setSearch(''); setShowAll(false); } }, [startMenuOpen]);

  // Auto-focus search input when user types a letter
  useEffect(() => {
    if (!startMenuOpen) return;
    const h = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        const input = document.querySelector('.aero-start-menu input');
        if (input) { input.focus(); }
        setSearch(s => s + e.key);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [startMenuOpen]);

  const launch = (id) => { openApp(id); closeStartMenu(); };

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          className="aero-start-menu"
          initial={{ opacity:0, y:16, scale:0.97 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:16, scale:0.97 }}
          transition={{ duration:0.18, ease:'easeOut' }}
        >
          {/* User header */}
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{width:44,height:44,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,255,255,0.3)',flexShrink:0,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)'}}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'white'}}>SP</div>}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'white',textShadow:'0 1px 3px rgba(0,0,0,0.7)'}}>Saugat Panta</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Full Stack Developer</div>
            </div>
          </div>

          <div style={{display:'flex',minHeight:340}}>
            {/* Left panel */}
            <div style={{flex:1,display:'flex',flexDirection:'column',padding:'6px 0'}}>
              <div style={{flex:1,overflowY:'auto',maxHeight:280}}>
                {apps.length===0 && (
                  <div style={{padding:'24px 16px',textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:12}}>No results found</div>
                )}
                {apps.map(app=>(
                  <button key={app.id} onClick={()=>launch(app.id)}
                    style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'7px 14px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.88)',fontSize:12,textAlign:'left',borderRadius:3,transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <span style={{width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:4,background:'rgba(255,255,255,0.08)',flexShrink:0}}>
                      <app.icon style={{width:16,height:16,color:app.color}} />
                    </span>
                    <span style={{flex:1}}>{app.label}</span>
                  </button>
                ))}
                {!search && (
                  <button onClick={()=>setShowAll(v=>!v)}
                    style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'7px 14px',background:'none',border:'none',borderTop:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',color:'rgba(255,255,255,0.45)',fontSize:11,marginTop:4,transition:'color 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}
                    onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                    <span style={{fontSize:9}}>{showAll?'▲':'▶'}</span>
                    {showAll ? 'Show Less' : 'All Programs'}
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{padding:'8px 10px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{position:'relative'}}>
                  <Search style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',width:13,height:13,color:'rgba(255,255,255,0.35)'}} />
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search programs and files"
                    style={{width:'100%',padding:'6px 8px 6px 26px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:3,color:'white',fontSize:11,outline:'none',boxSizing:'border-box'}}
                    onFocus={e=>e.target.style.borderColor='rgba(74,144,217,0.7)'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="aero-start-right" style={{width:160,background:'rgba(0,0,0,0.2)',borderLeft:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',padding:'6px 0'}}>
              <div style={{flex:1}}>
                {RIGHT_LINKS.map(l=>(
                  <button key={l.id} onClick={()=>launch(l.id)}
                    style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'7px 12px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.72)',fontSize:11,textAlign:'left',transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <l.icon style={{width:14,height:14,color:'rgba(255,255,255,0.5)',flexShrink:0}} />
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Power */}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'6px 8px',display:'flex',flexDirection:'column',gap:2}}>
                <button onClick={()=>{closeStartMenu();pushNotification({title:'Sleep',body:'Going to sleep...',icon:'💤'});}}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.6)',fontSize:11,borderRadius:3,transition:'background 0.1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <Moon style={{width:12,height:12}} /> Sleep
                </button>
                <button onClick={()=>{closeStartMenu();setBootState('booting');}}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,100,100,0.8)',fontSize:11,borderRadius:3,transition:'background 0.1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(220,50,50,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <Power style={{width:12,height:12}} /> Shut Down
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
