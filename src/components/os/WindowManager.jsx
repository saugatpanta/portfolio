import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const WindowManagerContext = createContext(null);

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}

let windowIdCounter = 0;

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const zIndexRef = useRef(100);

  const openWindow = useCallback((config) => {
    const id = `window-${++windowIdCounter}`;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const w = config.width || 900;
    const h = config.height || 600;

    const newWindow = {
      id,
      type: config.type || 'browser', // 'browser' | 'settings'
      title: config.title || 'New Window',
      icon: config.icon || null,
      component: config.component || null,
      componentProps: config.componentProps || {},
      position: config.position || {
        x: Math.max(50, (screenW - w) / 2 + (windowIdCounter % 5) * 30),
        y: Math.max(30, (screenH - h) / 2 + (windowIdCounter % 5) * 30),
      },
      size: { width: w, height: h },
      zIndex: ++zIndexRef.current,
      minimized: false,
      maximized: false,
      url: config.url || 'saugatpanta.com',
    };

    setWindows(prev => [...prev, newWindow]);
    return id;
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)
    );
  }, []);

  const maximizeWindow = useCallback((id) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, maximized: !w.maximized, minimized: false } : w)
    );
  }, []);

  const focusWindow = useCallback((id) => {
    zIndexRef.current += 1;
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, zIndex: zIndexRef.current, minimized: false }
          : w
      )
    );
  }, []);

  const updateWindowPosition = useCallback((id, position) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, position } : w)
    );
  }, []);

  const updateWindowSize = useCallback((id, size) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, size } : w)
    );
  }, []);

  const isWindowOpen = useCallback((title) => {
    return windows.some(w => w.title === title && !w.minimized);
  }, [windows]);

  const getWindowByTitle = useCallback((title) => {
    return windows.find(w => w.title === title);
  }, [windows]);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        isWindowOpen,
        getWindowByTitle,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export default WindowManagerProvider;
