import { Suspense, useEffect, useRef, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import useOSStore from '@/store/useOSStore';
import { setSoundUrls, playSound, setSoundMuted } from '@/utils/soundEngine';
import { firebaseClient } from '@/api/firebaseClient';

/* OS shell */
import AeroWindow     from './AeroWindow';
import BootSequence   from './BootSequence';
import BlueScreen     from './BlueScreen';
import Desktop        from './Desktop';
import LoginScreen    from './LoginScreen';
import Taskbar        from './Taskbar';
import ContextMenu    from './ContextMenu';
import Notification   from './Notification';
import AltTabSwitcher from './AltTabSwitcher';

/* Portfolio pages */
import Home       from '@/pages/Home';
import About      from '@/pages/About';
import Projects   from '@/pages/Projects';
import Experience from '@/pages/Experience';
import Blog       from '@/pages/Blog';
import BlogPost   from '@/pages/BlogPost';
import Contact    from '@/pages/Contact';

/* System apps */
import TerminalApp   from './TerminalApp';
import CalculatorApp from './CalculatorApp';
import TaskManager   from './TaskManager';
import FileExplorer  from './FileExplorer';
import Notepad       from './Notepad';
import BrowserApp    from './BrowserApp';
import ImageViewer   from './ImageViewer';
import Games         from './Games';
import MediaPlayer   from './MediaPlayer';
import RecycleBin    from './RecycleBin';
import ControlPanel  from './ControlPanel';

const AdminPanel = lazy(() => import('./AdminPanel'));

/**
 * COMP must map the `component` string from APPS registry → React element.
 * Keys must match exactly what APPS[id].component is set to.
 */
const COMP = {
  /* Portfolio pages */
  Home:         () => <Home />,
  About:        () => <About />,
  Projects:     () => <Projects />,
  Experience:   () => <Experience />,
  Blog:         () => <Blog />,
  BlogPost:     () => <BlogPost />,
  Contact:      () => <Contact />,
  /* System apps — names match APPS registry component strings */
  Terminal:     () => <TerminalApp />,
  Calculator:   () => <CalculatorApp />,
  TaskManager:  () => <TaskManager />,
  FileExplorer: () => <FileExplorer />,
  Notepad:      () => <Notepad />,
  Browser:      () => <BrowserApp />,
  ImageViewer:  () => <ImageViewer />,
  Games:        () => <Games />,
  MediaPlayer:  () => <MediaPlayer />,
  RecycleBin:   () => <RecycleBin />,
  ControlPanel: () => <ControlPanel />,
  AdminPanel: () => (
    <Suspense fallback={
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0e1525', color:'rgba(255,255,255,0.4)', fontSize:13 }}>
        Loading admin...
      </div>
    }>
      <AdminPanel />
    </Suspense>
  ),
};

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function OSDesktop() {
  const windows    = useOSStore(s => s.windows);
  const desktopRef = useRef(null);

  return (
    <>
      <Desktop desktopRef={desktopRef} />
      <AnimatePresence>
        {windows.filter(w => w.isOpen).map(win => {
          const Render = COMP[win.component];
          if (!Render) {
            console.warn('[OSDesktop] No COMP entry for component:', win.component, 'window:', win.id);
            return null;
          }
          return (
            <AeroWindow key={win.id} windowData={win} desktopRef={desktopRef}>
              <Render />
            </AeroWindow>
          );
        })}
      </AnimatePresence>
      <Taskbar />
      <ContextMenu />
      <Notification />
      <AltTabSwitcher />
    </>
  );
}

export default function OSEnvironment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bootState, openApp, setBootState, toggleAltTab, toggleShowDesktop,
          pushNotification, closeContextMenu } = useOSStore();
  const konamiRef = useRef([]);

  useEffect(() => {
    document.body.classList.add('os-active');
    document.documentElement.classList.add('dark');
    // Load sound URLs from Firebase
    firebaseClient.entities.SiteSettings.get().then(doc => {
      if (doc?.sounds) setSoundUrls(doc.sounds);
    }).catch(() => {});
    return () => document.body.classList.remove('os-active');
  }, []);

  // Intercept ALL external link clicks → open in OS browser
  useEffect(() => {
    const handler = (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      // Skip internal routes, anchors, and javascript:
      if (href.startsWith('#') || href.startsWith('/') || href.startsWith('javascript:')) return;
      // Skip mailto: links
      if (href.startsWith('mailto:')) return;
      // It's an external URL — intercept it
      e.preventDefault();
      e.stopPropagation();
      useOSStore.getState().openInBrowser(href);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  // Play sounds on boot state changes
  const prevBoot = useRef(bootState);
  useEffect(() => {
    if (prevBoot.current !== bootState) {
      if (bootState === 'booting') playSound('boot');
      if (bootState === 'login') playSound('startup');
      if (bootState === 'desktop') playSound('login');
      prevBoot.current = bootState;
    }
  }, [bootState]);

  /* Global keyboard shortcuts */
  useEffect(() => {
    if (bootState !== 'desktop') return;
    const h = (e) => {
      const s = useOSStore.getState();

      /* Konami */
      konamiRef.current = [...konamiRef.current, e.key].slice(-KONAMI.length);
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        pushNotification({ title:'🐉 Cheat Code!', body:'Matrix rain activated!', icon:'🎮' });
        konamiRef.current = [];
      }

      if (e.altKey && e.key === 'F4')                         { e.preventDefault(); if (s.activeWindowId) s.closeApp(s.activeWindowId); }
      if (e.altKey && e.key === 'Tab')                        { e.preventDefault(); toggleAltTab(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd')          { e.preventDefault(); toggleShowDesktop(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e')          { e.preventDefault(); openApp('file-explorer'); }
      if ((e.metaKey || e.ctrlKey) && e.key === 't')          { e.preventDefault(); openApp('terminal'); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l')          { e.preventDefault(); setBootState('login'); }
      if (e.key === 'Escape')                                  { closeContextMenu(); s.closeStartMenu?.(); }
      if (e.key === 'F5')                                      { pushNotification({ title:'Desktop', body:'Desktop refreshed.', icon:'🖥️' }); }
      if (e.ctrlKey && e.altKey && e.key === 'Delete')         { e.preventDefault(); openApp('task-manager'); }
      if (e.metaKey && e.key === 'ArrowLeft'  && s.activeWindowId) { e.preventDefault(); s.snapWindow(s.activeWindowId, 'left'); }
      if (e.metaKey && e.key === 'ArrowRight' && s.activeWindowId) { e.preventDefault(); s.snapWindow(s.activeWindowId, 'right'); }
      if (e.metaKey && e.key === 'ArrowUp'    && s.activeWindowId) { e.preventDefault(); s.maximizeApp(s.activeWindowId); }
      if (e.metaKey && e.key === 'ArrowDown'  && s.activeWindowId) { e.preventDefault(); s.minimizeApp(s.activeWindowId); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [bootState, openApp, setBootState, toggleAltTab, toggleShowDesktop, pushNotification, closeContextMenu]);

  /* Route → open window (only on first desktop load, not on subsequent navigations) */
  const hasHandledRoute = useRef(false);
  useEffect(() => {
    if (bootState !== 'desktop') return;
    if (hasHandledRoute.current) return;
    hasHandledRoute.current = true;

    const path = location.pathname.toLowerCase();
    // Only handle route if user landed directly on a deep link
    if (path === '/' || path === '') return;

    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');

    if (path.includes('blog/post') || path.includes('blogpost')) {
      if (slug) {
        openApp({ id:`blog-post-${slug}`, title:`Blog: ${slug.replace(/-/g,' ')}`, component:'BlogPost', size:{ w:920, h:680 } });
      }
      navigate('/', { replace: true });
      return;
    }
    const map = { '/home':'home', '/about':'about', '/projects':'projects', '/blog':'blog', '/experience':'experience', '/contact':'contact' };
    if (map[path]) {
      openApp(map[path]);
      navigate('/', { replace: true });
    }
  }, [bootState]);

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', background:'black' }}>
      {/* Skip intro button */}
      {bootState !== 'desktop' && bootState !== 'bsod' && (
        <button
          onClick={() => useOSStore.getState().setBootState('desktop')}
          style={{
            position:'fixed', top:12, right:12, zIndex:999999,
            padding:'6px 14px', borderRadius:20, fontSize:11,
            color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer',
            backdropFilter:'blur(8px)', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
        >
          Skip Intro →
        </button>
      )}

      <AnimatePresence mode="wait">
        {bootState === 'booting' && <BootSequence key="boot" />}
        {bootState === 'login'   && <LoginScreen  key="login" />}
        {bootState === 'bsod'    && <BlueScreen   key="bsod" />}
      </AnimatePresence>

      {bootState === 'desktop' && <OSDesktop />}
    </div>
  );
}
