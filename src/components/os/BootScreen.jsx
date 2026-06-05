import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '@/components/os/os-styles.css';

// ─── BIOS POST lines ───
const BOOT_LINES = [
  { text: 'SaugatOS BIOS v2.0', type: 'header' },
  { text: 'Copyright (C) 2024 Saugat Industries', type: 'dim' },
  { text: '', type: 'blank' },
  { text: '╔══════════════════════════════════════════╗', type: 'border' },
  { text: '║  System Configuration                    ║', type: 'border' },
  { text: '╠══════════════════════════════════════════╣', type: 'border' },
  { text: '║  CPU: Creative Cortex x64 @ Max GHz      ║', type: 'border' },
  { text: '║  RAM: 32GB Ideas DDR5                    ║', type: 'border' },
  { text: '║  GPU: Imagination RTX Ultra              ║', type: 'border' },
  { text: '║  SSD: ∞ TB Project Storage               ║', type: 'border' },
  { text: '╚══════════════════════════════════════════╝', type: 'border' },
  { text: '', type: 'blank' },
  { text: 'Detecting portfolio modules...', type: 'normal' },
  { text: '  ✓ React 19 Framework', type: 'success' },
  { text: '  ✓ Firebase Backend', type: 'success' },
  { text: '  ✓ GSAP Animation Engine', type: 'success' },
  { text: '  ✓ Tailwind CSS Renderer', type: 'success' },
  { text: '  ✓ Windows 11 Theme Layer', type: 'success' },
  { text: '', type: 'blank' },
  { text: 'All systems operational. Booting SaugatOS...', type: 'highlight' },
];

const LINE_COLORS = {
  header: '#00ff41',
  dim: '#00cc33',
  border: '#007722',
  normal: '#00ff41',
  success: '#00ff41',
  highlight: '#40ff70',
  blank: 'transparent',
};

/**
 * BootScreen — BIOS-style POST screen
 * Renders green monospace text lines one by one using GSAP stagger.
 */
export default function BootScreen({ onComplete }) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const lines = containerRef.current?.querySelectorAll('.boot-line');
    if (!lines?.length) return;

    // Blinking cursor
    const cursorBlink = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)',
    });

    // Build staggered timeline
    const tl = gsap.timeline({
      onComplete: () => {
        cursorBlink.kill();
        gsap.delayedCall(0.5, () => onComplete?.());
      },
    });

    tl.fromTo(
      lines,
      { opacity: 0, x: -3 },
      {
        opacity: 1,
        x: 0,
        duration: 0.05,
        stagger: 0.12,
        ease: 'none',
      },
    );

    return () => {
      tl.kill();
      cursorBlink.kill();
      gsap.killTweensOf(lines);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col justify-start overflow-hidden select-none"
      style={{
        background: '#000000',
        padding: 'clamp(16px, 4vw, 48px)',
      }}
    >
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* CRT glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Boot text lines */}
      {BOOT_LINES.map((line, i) => (
        <p
          key={i}
          className="boot-line text-xs sm:text-sm leading-5 sm:leading-6 opacity-0 whitespace-pre font-mono"
          style={{
            color: LINE_COLORS[line.type],
            textShadow: line.type !== 'blank' ? `0 0 8px ${LINE_COLORS[line.type]}40` : 'none',
          }}
        >
          {line.text || '\u00A0'}
        </p>
      ))}

      {/* Blinking cursor */}
      <span
        ref={cursorRef}
        className="inline-block mt-1 font-mono text-sm"
        style={{
          color: '#00ff41',
          textShadow: '0 0 8px rgba(0,255,65,0.5)',
        }}
      >
        █
      </span>
    </div>
  );
}
