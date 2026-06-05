import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useWindowManager } from './WindowManager';
import {
  X, Minus, Square, ChevronLeft, ChevronRight, RotateCcw,
  Lock, Star, Share, MoreHorizontal, Plus
} from 'lucide-react';

export default function BrowserWindow({ windowData, children }) {
  const {
    closeWindow, minimizeWindow, maximizeWindow,
    focusWindow, updateWindowPosition
  } = useWindowManager();

  const windowRef = useRef(null);
  const titleBarRef = useRef(null);
  const contentRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);

  const { id, title, position, size, zIndex, minimized, maximized, url } = windowData;

  // Animate window open
  useEffect(() => {
    if (windowRef.current && !minimized) {
      gsap.fromTo(windowRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  // Handle minimize animation
  useEffect(() => {
    if (!windowRef.current) return;
    if (minimized) {
      gsap.to(windowRef.current, {
        scale: 0, opacity: 0, y: 100,
        duration: 0.3, ease: 'power2.in',
      });
    } else {
      gsap.to(windowRef.current, {
        scale: 1, opacity: 1, y: 0,
        duration: 0.3, ease: 'back.out(1.2)',
      });
    }
  }, [minimized]);

  // Handle maximize animation
  useEffect(() => {
    if (!windowRef.current) return;
    if (maximized) {
      gsap.to(windowRef.current, {
        x: 0, y: 0, width: '100vw', height: `calc(100vh - 48px)`,
        borderRadius: 0, duration: 0.3, ease: 'power3.out',
      });
    } else {
      gsap.to(windowRef.current, {
        x: position.x, y: position.y,
        width: size.width, height: size.height,
        borderRadius: 12, duration: 0.3, ease: 'power3.out',
      });
    }
  }, [maximized]);

  // Close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    gsap.to(windowRef.current, {
      scale: 0.85, opacity: 0,
      duration: 0.25, ease: 'power2.in',
      onComplete: () => closeWindow(id),
    });
  }, [closeWindow, id]);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    if (maximized) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    focusWindow(id);

    // Subtle 3D tilt while dragging
    gsap.to(windowRef.current, {
      boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      duration: 0.2,
    });

    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = Math.max(0, e.clientY - dragStart.current.y);
      
      gsap.set(windowRef.current, { x: newX, y: newY });

      // 3D tilt based on drag velocity
      const tiltX = (e.movementY || 0) * 0.3;
      const tiltY = (e.movementX || 0) * -0.3;
      gsap.to(windowRef.current, {
        rotateX: Math.max(-5, Math.min(5, tiltX)),
        rotateY: Math.max(-5, Math.min(5, tiltY)),
        duration: 0.1,
      });
    };

    const handleDragEnd = (e) => {
      isDragging.current = false;
      const newX = e.clientX - dragStart.current.x;
      const newY = Math.max(0, e.clientY - dragStart.current.y);
      
      updateWindowPosition(id, { x: newX, y: newY });

      gsap.to(windowRef.current, {
        rotateX: 0, rotateY: 0,
        boxShadow: '0 16px 64px rgba(0,0,0,0.5)',
        duration: 0.3, ease: 'elastic.out(1, 0.7)',
      });

      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }, [id, position, maximized, focusWindow, updateWindowPosition]);

  if (isClosing) return null;

  const windowStyle = maximized ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: 'calc(100vh - 48px)',
    zIndex,
  } : {
    position: 'absolute',
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
    zIndex,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div
      ref={windowRef}
      className="os-window focused"
      style={{
        ...windowStyle,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        willChange: 'transform',
      }}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className="os-titlebar"
        onMouseDown={handleDragStart}
        onDoubleClick={() => maximizeWindow(id)}
      >
        {/* Tab */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 bg-white/5 rounded-t-lg px-3 py-1 max-w-[200px]">
            <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
              <span className="text-[8px] text-blue-400">S</span>
            </div>
            <span className="text-xs text-white/80 truncate">{title}</span>
            <button
              className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center"
              onClick={handleClose}
            >
              <X className="w-2.5 h-2.5 text-white/40" />
            </button>
          </div>
          <button className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center">
            <Plus className="w-3 h-3 text-white/30" />
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2 ml-2">
          <button
            className="os-titlebar-btn os-btn-minimize"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            title="Minimize"
          />
          <button
            className="os-titlebar-btn os-btn-maximize"
            onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
            title="Maximize"
          />
          <button
            className="os-titlebar-btn os-btn-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            title="Close"
          />
        </div>
      </div>

      {/* Address Bar */}
      <div className="os-address-bar">
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="os-address-input flex items-center gap-2">
          <Lock className="w-3 h-3 text-green-400 flex-shrink-0" />
          <span>{url || 'saugatpanta.com'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <Star className="w-3 h-3" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <Share className="w-3 h-3" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-white/30">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="os-window-content bg-slate-950"
        style={{
          height: `calc(100% - ${36 + 38}px)`,
        }}
      >
        <div className="min-h-full">
          {children}
        </div>
      </div>

      {/* Resize handles (only when not maximized) */}
      {!maximized && (
        <>
          <div className="os-resize-handle os-resize-se" />
          <div className="os-resize-handle os-resize-e" />
          <div className="os-resize-handle os-resize-s" />
        </>
      )}
    </div>
  );
}
