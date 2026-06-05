import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronUp } from 'lucide-react';
import '@/components/os/os-styles.css';

/**
 * Formats a Date into "HH:MM" (24-hour, zero-padded)
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a Date into "Saturday, June 1" style
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * LockScreen — Windows 11-style lock screen
 * Shows a large clock & date over the animated wallpaper.
 * Click anywhere or press any key to slide the screen up and unlock.
 */
export default function LockScreen({ onComplete }) {
  const [time, setTime] = useState(new Date());
  const screenRef = useRef(null);
  const isUnlocking = useRef(false);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Unlock handler: slide screen up
  const handleUnlock = useCallback(() => {
    if (isUnlocking.current) return;
    isUnlocking.current = true;

    gsap.to(screenRef.current, {
      y: '-100vh',
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => onComplete?.(),
    });
  }, [onComplete]);

  // Keyboard listener (any key to unlock)
  useEffect(() => {
    const onKey = () => handleUnlock();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUnlock]);

  // Pulsing hint + chevron bounce
  const hintRef = useRef(null);
  const chevronRef = useRef(null);
  useEffect(() => {
    const pulse = gsap.to(hintRef.current, {
      opacity: 0.4,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
    const bounce = gsap.to(chevronRef.current, {
      y: -6,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
    return () => {
      pulse.kill();
      bounce.kill();
    };
  }, []);

  // Entrance animation for clock
  const clockRef = useRef(null);
  useEffect(() => {
    if (clockRef.current) {
      gsap.from(clockRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
      });
    }
  }, []);

  return (
    <div
      ref={screenRef}
      onClick={handleUnlock}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      {/* Advanced animated wallpaper */}
      <div className="os-wallpaper">
        <div className="os-wallpaper-aurora">
          <div className="os-aurora-blob" />
          <div className="os-aurora-blob" />
          <div className="os-aurora-blob" />
          <div className="os-aurora-blob" />
          <div className="os-aurora-blob" />
          <div className="os-aurora-blob" />
        </div>
        <div className="os-wallpaper-particles">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="os-particle"
              style={{
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 20}s`,
                animationDelay: `${Math.random() * 20}s`,
              }}
            />
          ))}
        </div>
        <div className="os-wallpaper-stars">
          <div className="os-shooting-star" />
          <div className="os-shooting-star" />
          <div className="os-shooting-star" />
        </div>
      </div>

      {/* Content sits above the wallpaper */}
      <div ref={clockRef} className="relative z-10 flex flex-col items-center">
        {/* Clock */}
        <h1
          className="text-white font-extralight tracking-wider"
          style={{
            fontSize: 'clamp(64px, 10vw, 96px)',
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {formatTime(time)}
        </h1>

        {/* Date */}
        <p className="text-white/80 text-lg mt-2 font-light tracking-wide">
          {formatDate(time)}
        </p>

        {/* Unlock hint */}
        <div className="mt-20 flex flex-col items-center gap-2">
          <div ref={chevronRef}>
            <ChevronUp className="w-5 h-5 text-white/50" />
          </div>
          <p ref={hintRef} className="text-white/50 text-xs tracking-widest uppercase">
            Click anywhere to unlock
          </p>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-8">
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
          <span>SaugatOS</span>
        </div>
        <div className="flex items-center gap-4 text-white/30 text-xs">
          <span>🌐</span>
          <span>🔋</span>
        </div>
      </div>
    </div>
  );
}
