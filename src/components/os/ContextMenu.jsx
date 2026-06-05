import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useOSStore from '@/store/useOSStore';

function Item({ item, onClose }) {
  if (item.divider) return <div className="aero-ctx-divider" />;
  return (
    <div
      className={`aero-ctx-item ${item.disabled ? 'disabled' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!item.disabled && item.action) {
          item.action();
          onClose();
        }
      }}
    >
      {item.icon && <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>}
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.shortcut && <span className="aero-ctx-shortcut">{item.shortcut}</span>}
      {item.submenu && <span className="aero-ctx-arrow">▶</span>}
      {item.submenu && (
        <div className="aero-ctx-sub">
          {item.submenu.map((s, i) => <Item key={i} item={s} onClose={onClose} />)}
        </div>
      )}
    </div>
  );
}

export default function ContextMenu() {
  const contextMenu = useOSStore(s => s.contextMenu);
  const closeContextMenu = useOSStore(s => s.closeContextMenu);
  const ref = useRef(null);

  const handleOutsideClick = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      closeContextMenu();
    }
  }, [closeContextMenu]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeContextMenu(); };
    // Use timeout to avoid the same click that opened the menu from closing it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('contextmenu', handleOutsideClick);
    }, 10);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', closeContextMenu, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('contextmenu', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu, closeContextMenu, handleOutsideClick]);

  if (!contextMenu) return null;

  // Position: keep on-screen
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mw = 220;
  const mh = (contextMenu.items?.length || 1) * 30 + 16;
  const x = Math.min(contextMenu.x, vw - mw - 8);
  const y = Math.min(contextMenu.y, vh - mh - 8);

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={ref}
        className="aero-ctx"
        style={{ left: Math.max(4, x), top: Math.max(4, y) }}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.12 }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {contextMenu.items?.map((item, i) => (
          <Item key={i} item={item} onClose={closeContextMenu} />
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
