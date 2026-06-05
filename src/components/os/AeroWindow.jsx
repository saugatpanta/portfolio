import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, Copy, X } from 'lucide-react';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

export default function AeroWindow({ windowData: win, desktopRef, children }) {
  const store = useOSStore();
  const { activeWindowId, peekWindowId, closeApp, minimizeApp, maximizeApp, focusWindow,
          updateWindowPosition, updateWindowSize, openContextMenu } = store;

  const isFocused = activeWindowId === win.id;
  const isPeeked  = peekWindowId !== null && peekWindowId !== win.id;

  const posRef  = useRef({ x: win.position.x, y: win.position.y });
  const sizeRef = useRef({ w: win.size.w, h: win.size.h });
  const [pos,  setPos]  = useState({ x: win.position.x, y: win.position.y });
  const [size, setSize] = useState({ w: win.size.w, h: win.size.h });
  const [snapDir, setSnapDir] = useState(null);
  const dragging = useRef(false);

  /* Sync when store changes (e.g. snap restore) */
  useEffect(() => {
    if (!dragging.current) {
      setPos({ x: win.position.x, y: win.position.y });
      setSize({ w: win.size.w, h: win.size.h });
      posRef.current  = { x: win.position.x, y: win.position.y };
      sizeRef.current = { w: win.size.w, h: win.size.h };
    }
  }, [win.position.x, win.position.y, win.size.w, win.size.h]);

  if (win.isMinimized) return null;

  const isMaxed = win.isMaximized || !!win.isSnapped;

  /* ── Drag ── */
  const startDrag = useCallback((e) => {
    if (isMaxed) return;
    e.preventDefault();
    focusWindow(win.id);
    dragging.current = true;
    const ox = e.clientX - posRef.current.x;
    const oy = e.clientY - posRef.current.y;

    const onMove = (me) => {
      const nx = me.clientX - ox;
      const ny = me.clientY - oy;
      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
      // Snap detection
      const dw = window.innerWidth;
      if (me.clientX < 20)      setSnapDir('left');
      else if (me.clientX > dw-20) setSnapDir('right');
      else if (me.clientY < 4)  setSnapDir('maximized');
      else                       setSnapDir(null);
    };
    const onUp = (ue) => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const dw = window.innerWidth;
      if (ue.clientX < 20)       { useOSStore.getState().snapWindow(win.id,'left'); setSnapDir(null); return; }
      if (ue.clientX > dw-20)    { useOSStore.getState().snapWindow(win.id,'right'); setSnapDir(null); return; }
      if (ue.clientY < 4)        { useOSStore.getState().snapWindow(win.id,'maximized'); setSnapDir(null); return; }
      setSnapDir(null);
      updateWindowPosition(win.id, { x: Math.max(0, posRef.current.x), y: Math.max(0, posRef.current.y) });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }, [isMaxed, win.id, focusWindow, updateWindowPosition]);

  /* ── Resize ── */
  const startResize = useCallback((e, dir) => {
    e.preventDefault(); e.stopPropagation();
    if (isMaxed) return;
    focusWindow(win.id);
    const sx = e.clientX, sy = e.clientY;
    const sw = sizeRef.current.w, sh = sizeRef.current.h;
    const sl = posRef.current.x, st = posRef.current.y;
    const minW = win.minSize?.w||280, minH = win.minSize?.h||200;

    const onMove = (me) => {
      const dx = me.clientX-sx, dy = me.clientY-sy;
      const dw = window.innerWidth, dh = window.innerHeight-(window.innerWidth<768?44:40);
      let nx=sl,ny=st,nw=sw,nh=sh;
      if (dir.includes('e')) nw = sw+dx;
      if (dir.includes('s')) nh = sh+dy;
      if (dir.includes('w')) { nw = sw-dx; nx = sl+dx; }
      if (dir.includes('n')) { nh = sh-dy; ny = st+dy; }
      nw = Math.min(Math.max(minW,nw), dw-Math.max(0,nx)-4);
      nh = Math.min(Math.max(minH,nh), dh-Math.max(0,ny)-4);
      nx = Math.max(0, Math.min(nx, dw-nw));
      ny = Math.max(0, Math.min(ny, dh-nh));
      posRef.current  = { x:nx, y:ny };
      sizeRef.current = { w:nw, h:nh };
      setPos({ x:nx, y:ny });
      setSize({ w:nw, h:nh });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      updateWindowPosition(win.id, posRef.current);
      updateWindowSize(win.id, sizeRef.current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }, [isMaxed, win.id, win.minSize, focusWindow, updateWindowPosition, updateWindowSize]);

  const titleBarCtx = (e) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, [
      { label:'Restore',  action:()=>useOSStore.getState().restoreApp(win.id),  disabled:!isMaxed },
      { label:'Move',     action:()=>{} },
      { label:'Size',     action:()=>{} },
      { label:'Minimize', action:()=>minimizeApp(win.id) },
      { label:'Maximize', action:()=>maximizeApp(win.id), disabled:win.isMaximized },
      { divider:true },
      { label:'Close', shortcut:'Alt+F4', action:()=>closeApp(win.id) },
    ]);
  };

  const Icon = win.icon;

  return (
    <>
      {/* Snap preview */}
      {snapDir && (
        <div className="aero-snap-preview" style={{
          top: 0,
          left: snapDir==='right' ? '50%' : 0,
          width: snapDir==='maximized' ? '100%' : '50%',
          height: 'calc(100vh - var(--aero-taskbar-h, 40px))',
        }} />
      )}

      <motion.div
        className={`aero-window ${isFocused?'focused':'unfocused'}`}
        style={{
          left:   isMaxed ? 0 : pos.x,
          top:    isMaxed ? 0 : pos.y,
          width:  isMaxed ? (win.isSnapped==='left'||win.isSnapped==='right' ? '50vw' : '100vw') : size.w,
          height: isMaxed ? 'calc(100vh - var(--aero-taskbar-h, 40px))' : size.h,
          zIndex: win.zIndex,
          borderRadius: isMaxed ? 0 : undefined,
          opacity: isPeeked ? 0.07 : 1,
          filter:  isPeeked ? 'blur(1px)' : 'none',
          transition: isPeeked ? 'opacity 0.25s,filter 0.25s' : undefined,
        }}
        onPointerDown={() => focusWindow(win.id)}
        initial={{ opacity:0, scale:0.88, y:16 }}
        animate={{ opacity:isPeeked?0.07:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.88, y:12 }}
        transition={{ type:'spring', stiffness:460, damping:36 }}
      >
        {/* Title bar */}
        <div
          className="aero-titlebar"
          onPointerDown={startDrag}
          onDoubleClick={() => maximizeApp(win.id)}
          onContextMenu={titleBarCtx}
        >
          <div className="aero-titlebar-icon">
            {Icon && <Icon style={{ width:14, height:14, color:win.iconColor, flexShrink:0 }} />}
          </div>
          <span className="aero-titlebar-title">{win.title}</span>
          <div className="aero-controls" onPointerDown={e=>e.stopPropagation()}>
            <button className="aero-ctrl aero-ctrl-min" onClick={e=>{e.stopPropagation();minimizeApp(win.id);}} title="Minimize">
              <Minus style={{width:10,height:10}} />
            </button>
            <button className="aero-ctrl aero-ctrl-max" onClick={e=>{e.stopPropagation();maximizeApp(win.id);}} title={isMaxed?'Restore':'Maximize'}>
              {isMaxed ? <Copy style={{width:10,height:10}} /> : <Square style={{width:10,height:10}} />}
            </button>
            <button className="aero-ctrl aero-ctrl-close" onClick={e=>{e.stopPropagation();closeApp(win.id);}} title="Close">
              <X style={{width:11,height:11}} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="aero-content">{children}</div>

        {/* Resize handles */}
        {!isMaxed && (
          <>
            <div className="aero-resize aero-resize-n"  onPointerDown={e=>startResize(e,'n')} />
            <div className="aero-resize aero-resize-s"  onPointerDown={e=>startResize(e,'s')} />
            <div className="aero-resize aero-resize-e"  onPointerDown={e=>startResize(e,'e')} />
            <div className="aero-resize aero-resize-w"  onPointerDown={e=>startResize(e,'w')} />
            <div className="aero-resize aero-resize-ne" onPointerDown={e=>startResize(e,'ne')} />
            <div className="aero-resize aero-resize-nw" onPointerDown={e=>startResize(e,'nw')} />
            <div className="aero-resize aero-resize-se" onPointerDown={e=>startResize(e,'se')} />
            <div className="aero-resize aero-resize-sw" onPointerDown={e=>startResize(e,'sw')} />
          </>
        )}
      </motion.div>
    </>
  );
}
