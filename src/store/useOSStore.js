import { create } from 'zustand';
import { playSound, setSoundMuted } from '@/utils/soundEngine';
import {
  Monitor, Terminal, Settings, Globe, Trash2, Shield,
  FolderGit2, Mail, BookOpen, Calculator, Activity,
  Folder, FileText, Image, Music, Gamepad2, MonitorCog,
  Network, User,
} from 'lucide-react';

let zTop = 100;

/* ─── App registry ─────────────────────────────────────── */
export const APPS = {
  /* Portfolio apps */
  home:           { id:'home',           title:'Home',              component:'Home',         icon:Monitor,    iconColor:'#7dbdff', size:{w:960,h:660} },
  about:          { id:'about',          title:'About Me',          component:'About',        icon:User,       iconColor:'#c4b5fd', size:{w:900,h:660} },
  projects:       { id:'projects',       title:'Projects',          component:'Projects',     icon:FolderGit2, iconColor:'#f8b84e', size:{w:960,h:660} },
  experience:     { id:'experience',     title:'Experience',        component:'Experience',   icon:Terminal,   iconColor:'#7cff9b', size:{w:900,h:620} },
  blog:           { id:'blog',           title:'Blog',              component:'Blog',         icon:BookOpen,   iconColor:'#4dd7a6', size:{w:900,h:640} },
  contact:        { id:'contact',        title:'Contact',           component:'Contact',      icon:Mail,       iconColor:'#60d6ff', size:{w:840,h:600} },
  mail:           { id:'contact',        title:'Contact',           component:'Contact',      icon:Mail,       iconColor:'#60d6ff', size:{w:840,h:600} },
  /* System apps */
  'terminal':     { id:'terminal',       title:'Terminal',          component:'Terminal',     icon:Terminal,   iconColor:'#4ade80', size:{w:700,h:460} },
  'browser':      { id:'browser',        title:'Internet Explorer', component:'Browser',      icon:Globe,      iconColor:'#38bdf8', size:{w:1020,h:680} },
  'file-explorer':{ id:'file-explorer',  title:'File Explorer',     component:'FileExplorer', icon:Folder,     iconColor:'#fbbf24', size:{w:840,h:560} },
  'calculator':   { id:'calculator',     title:'Calculator',        component:'Calculator',   icon:Calculator, iconColor:'#60a5fa', size:{w:320,h:500} },
  'task-manager': { id:'task-manager',   title:'Task Manager',      component:'TaskManager',  icon:Activity,   iconColor:'#f59e0b', size:{w:560,h:500} },
  'control-panel':{ id:'control-panel',  title:'Control Panel',     component:'ControlPanel', icon:Settings,   iconColor:'#d5dde8', size:{w:780,h:540} },
  'notepad':      { id:'notepad',        title:'Notepad',           component:'Notepad',      icon:FileText,   iconColor:'#94a3b8', size:{w:620,h:460} },
  'image-viewer': { id:'image-viewer',   title:'Photo Viewer',      component:'ImageViewer',  icon:Image,      iconColor:'#f472b6', size:{w:780,h:580} },
  'media-player': { id:'media-player',   title:'Media Player',      component:'MediaPlayer',  icon:Music,      iconColor:'#a78bfa', size:{w:460,h:340} },
  'games':        { id:'games',          title:'Games',             component:'Games',        icon:Gamepad2,   iconColor:'#34d399', size:{w:580,h:480} },
  'admin':        { id:'admin',          title:'Admin Panel',       component:'AdminPanel',   icon:Shield,     iconColor:'#f97316', size:{w:960,h:660} },
  'recycle-bin':  { id:'recycle-bin',    title:'Recycle Bin',       component:'RecycleBin',   icon:Trash2,     iconColor:'#9ca3af', size:{w:580,h:380} },
  /* Blog post window */
  'blog-post':    { id:'blog-post',      title:'Blog Post',         component:'BlogPost',     icon:BookOpen,   iconColor:'#a78bfa', size:{w:920,h:680} },
};

const clamp = (size={}, fb={w:900,h:620}) => {
  if (typeof window==='undefined') return {...fb,...size};
  const vw = window.innerWidth, vh = window.innerHeight;
  // Scale windows proportionally on larger screens (base: 1440x900)
  const scaleX = Math.max(1, vw / 1440);
  const scaleY = Math.max(1, vh / 900);
  const baseW = size.w || fb.w;
  const baseH = size.h || fb.h;
  return {
    w: Math.min(Math.round(baseW * scaleX), Math.max(320, vw - 60)),
    h: Math.min(Math.round(baseH * scaleY), Math.max(240, vh - 80)),
  };
};

const useOSStore = create((set, get) => ({
  /* ── State ── */
  bootState: 'booting',
  windows: [],
  activeWindowId: null,
  wallpaper: 'radial-gradient(ellipse 140% 70% at 50% 100%, rgba(74,200,255,0.45) 0%, transparent 45%), radial-gradient(ellipse 80% 50% at 25% 75%, rgba(0,80,180,0.4) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 25%, rgba(50,140,220,0.25) 0%, transparent 50%), linear-gradient(180deg, #091a3a 0%, #0e4a8a 25%, #2196d4 50%, #0e4a8a 80%, #061230 100%)',
  wallpaperStyle: 'fill',
  theme: { accentColor:'#4a90d9', glassOpacity:10, blurStrength:40 },
  notifications: [],
  clipboard: null,
  volume: 80,
  isMuted: false,
  startMenuOpen: false,
  peekWindowId: null,
  showDesktop: false,
  contextMenu: null,
  altTabOpen: false,
  altTabIndex: 0,
  sessionStats: { startTime:Date.now(), windowsOpened:0, clicks:0, appsUsed:{} },

  /* ── Boot ── */
  setBootState: (s) => {
    if (s==='booting') { set({ bootState:s, windows:[], activeWindowId:null, startMenuOpen:false, contextMenu:null, altTabOpen:false }); return; }
    set({ bootState:s });
  },

  /* ── Windows ── */
  openApp: (app) => {
    const preset = typeof app==='string' ? APPS[app] : APPS[app?.id];
    const def = { ...preset, ...(typeof app==='object' ? app : {}) };
    if (!def?.id || !def?.component) return;
    const { windows, sessionStats } = get();
    const existing = windows.find(w=>w.id===def.id);
    zTop++;
    if (existing) {
      set({ windows:windows.map(w=>w.id===def.id?{...w,isOpen:true,isMinimized:false,zIndex:zTop}:w), activeWindowId:def.id, startMenuOpen:false });
      return;
    }
    const size = clamp(def.size);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const off = windows.length % 8;
    const pos = def.position || (isMobile ? { x:0, y:0 } : { x:80+off*28, y:40+off*24 });
    const appsUsed = {...sessionStats.appsUsed};
    appsUsed[def.title] = (appsUsed[def.title]||0)+1;
    set({
      windows: [...windows, {
        id:def.id, title:def.title, component:def.component,
        icon:def.icon||MonitorCog, iconColor:def.iconColor||'#7dbdff',
        isOpen:true, isMinimized:false, isMaximized:isMobile, isSnapped:isMobile?'maximized':null,
        zIndex:zTop, position:pos, size,
        minSize:{w:280,h:200}, prevSize:null, prevPosition:null,
      }],
      activeWindowId: def.id,
      startMenuOpen: false,
      sessionStats: {...sessionStats, windowsOpened:sessionStats.windowsOpened+1, appsUsed},
    });
    playSound('open');
  },

  closeApp: (id) => {
    const { windows, activeWindowId } = get();
    const rest = windows.filter(w=>w.id!==id);
    const top = [...rest].filter(w=>!w.isMinimized).sort((a,b)=>b.zIndex-a.zIndex)[0];
    set({ windows:rest, activeWindowId:activeWindowId===id?top?.id||null:activeWindowId });
    playSound('close');
  },

  minimizeApp: (id) => {
    const { windows, activeWindowId } = get();
    const win = windows.find(w=>w.id===id);
    if (!win) return;
    const nowMin = !win.isMinimized;
    const top = windows.filter(w=>w.id!==id&&!w.isMinimized).sort((a,b)=>b.zIndex-a.zIndex)[0];
    set({ windows:windows.map(w=>w.id===id?{...w,isMinimized:nowMin}:w), activeWindowId:nowMin&&activeWindowId===id?top?.id||null:id });
  },

  maximizeApp: (id) => {
    const { windows } = get();
    const win = windows.find(w=>w.id===id);
    if (!win) return;
    zTop++;
    if (win.isMaximized) {
      set({ windows:windows.map(w=>w.id===id?{...w,isMaximized:false,isSnapped:null,zIndex:zTop,position:w.prevPosition||w.position,size:w.prevSize||w.size,prevPosition:null,prevSize:null}:w), activeWindowId:id });
    } else {
      set({ windows:windows.map(w=>w.id===id?{...w,isMaximized:true,isSnapped:'maximized',zIndex:zTop,prevPosition:w.position,prevSize:w.size}:w), activeWindowId:id });
    }
  },

  restoreApp: (id) => {
    const { windows } = get();
    zTop++;
    set({ windows:windows.map(w=>w.id===id?{...w,isMinimized:false,isMaximized:false,isSnapped:null,zIndex:zTop,position:w.prevPosition||w.position,size:w.prevSize||w.size,prevPosition:null,prevSize:null}:w), activeWindowId:id });
  },

  snapWindow: (id, dir) => {
    const { windows } = get();
    const win = windows.find(w=>w.id===id);
    if (!win) return;
    zTop++;
    const dw=window.innerWidth, dh=window.innerHeight-(window.innerWidth<768?44:40);
    const map = {
      left:  { pos:{x:0,y:0},   size:{w:Math.floor(dw/2),h:dh} },
      right: { pos:{x:Math.floor(dw/2),y:0}, size:{w:Math.ceil(dw/2),h:dh} },
      maximized: { pos:{x:0,y:0}, size:{w:dw,h:dh} },
    };
    const { pos, size } = map[dir]||map.maximized;
    set({ windows:windows.map(w=>w.id===id?{...w,isSnapped:dir,isMaximized:dir==='maximized',zIndex:zTop,prevPosition:w.prevPosition||w.position,prevSize:w.prevSize||w.size,position:pos,size}:w), activeWindowId:id });
  },

  focusWindow: (id) => {
    zTop++;
    set({ windows:get().windows.map(w=>w.id===id?{...w,isMinimized:false,zIndex:zTop}:w), activeWindowId:id });
  },

  updateWindowPosition: (id, position) => set({ windows:get().windows.map(w=>w.id===id?{...w,position,isSnapped:null}:w) }),
  updateWindowSize:     (id, size)     => set({ windows:get().windows.map(w=>w.id===id?{...w,size}:w) }),

  /* ── Wallpaper / Theme ── */
  setWallpaper: (url, style) => set({ wallpaper:url, ...(style?{wallpaperStyle:style}:{}) }),
  updateTheme:  (t) => set(s=>({ theme:{...s.theme,...t} })),

  /* ── Volume ── */
  setVolume:  (v) => set({ volume:Math.max(0,Math.min(100,v)) }),
  toggleMute: ()  => { const m = !get().isMuted; set({ isMuted: m }); setSoundMuted(m); },

  /* ── Notifications ── */
  pushNotification: (n) => {
    const id = `n-${Date.now()}-${Math.random()}`;
    set(s=>({ notifications:[...s.notifications.slice(-4),{id,timestamp:Date.now(),...n}] }));
    setTimeout(()=>get().dismissNotification(id), 4500);
  },
  dismissNotification: (id) => set(s=>({ notifications:s.notifications.filter(n=>n.id!==id) })),

  /* ── UI state ── */
  openContextMenu:  (x,y,items) => set({ contextMenu:{x,y,items} }),
  closeContextMenu: ()          => set({ contextMenu:null }),
  toggleStartMenu:  ()          => set(s=>({ startMenuOpen:!s.startMenuOpen, contextMenu:null })),
  closeStartMenu:   ()          => set({ startMenuOpen:false }),
  setPeekWindow:    (id)        => set({ peekWindowId:id }),

  toggleShowDesktop: () => {
    const { windows, showDesktop } = get();
    if (!showDesktop) set({ windows:windows.map(w=>({...w,_wasMin:w.isMinimized,isMinimized:true})), showDesktop:true });
    else              set({ windows:windows.map(w=>({...w,isMinimized:w._wasMin||false})), showDesktop:false });
  },

  toggleAltTab:  ()  => set(s=>({ altTabOpen:!s.altTabOpen, altTabIndex:0 })),
  setAltTabIndex:(i) => set({ altTabIndex:i }),
  closeAltTab:   ()  => set({ altTabOpen:false }),

  setClipboard:    (t) => set({ clipboard:t }),
  incrementClick:  ()  => set(s=>({ sessionStats:{...s.sessionStats,clicks:s.sessionStats.clicks+1} })),

  /* Open a URL inside the in-OS browser */
  openInBrowser: (url) => {
    const { windows } = get();
    const existing = windows.find(w => w.id === 'browser');
    zTop++;
    if (existing) {
      // Update existing browser window's URL via a custom event
      set({ windows: windows.map(w => w.id === 'browser' ? { ...w, isOpen: true, isMinimized: false, zIndex: zTop } : w), activeWindowId: 'browser' });
      window.dispatchEvent(new CustomEvent('os-browser-navigate', { detail: { url } }));
    } else {
      // Open new browser window — store the URL to navigate to
      window.__osBrowserInitUrl = url;
      get().openApp('browser');
    }
  },
}));

export default useOSStore;
