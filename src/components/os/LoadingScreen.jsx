import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '@/components/os/os-styles.css';

// ─── Spinner configuration ───
const DOT_COUNT = 5;
const ORBIT_RADIUS = 18;
const DOT_SIZE = 5;

/**
 * LoadingScreen — Windows 11-style loading with spinning dots ring
 * Authentic Windows 11 boot experience with logo and progress ring.
 */
export default function LoadingScreen({ onComplete }) {
  const containerRef = useRef(null);
  const dotsRef = useRef([]);
  const timelineRef = useRef(null);
  const pulseRef = useRef(null);
  const timerRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const dots = dotsRef.current.filter(Boolean);
    if (!dots.length) return;

    // Logo entrance
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }
      );
    }

    // Dot orbit animation — authentic Windows 11 chasing dots
    const tl = gsap.timeline({ repeat: -1 });
    timelineRef.current = tl;

    dots.forEach((dot, i) => {
      const startAngle = (i / DOT_COUNT) * Math.PI * 2;

      gsap.set(dot, {
        x: Math.cos(startAngle) * ORBIT_RADIUS,
        y: Math.sin(startAngle) * ORBIT_RADIUS,
        opacity: 1 - (i * 0.15),
      });

      tl.to(
        dot,
        {
          duration: 1.8,
          ease: 'power1.inOut',
          repeat: -1,
          keyframes: Array.from({ length: 37 }, (_, k) => {
            const angle = startAngle + (k / 36) * Math.PI * 2;
            return {
              x: Math.cos(angle) * ORBIT_RADIUS,
              y: Math.sin(angle) * ORBIT_RADIUS,
              duration: 1.8 / 36,
            };
          }),
        },
        i * 0.12,
      );
    });

    // Pulsing status text
    const pulse = gsap.to(pulseRef.current, {
      opacity: 0.3,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Advance after 3 seconds
    timerRef.current = gsap.delayedCall(3, () => onComplete?.());

    return () => {
      tl.kill();
      pulse.kill();
      timerRef.current?.kill();
      gsap.killTweensOf(dots);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: '#000000' }}
    >
      {/* Windows-style logo */}
      <div ref={logoRef} className="mb-16 flex flex-col items-center gap-6">
        {/* Windows 4-pane grid logo */}
        <div className="grid grid-cols-2 gap-[3px] w-14 h-14">
          <div className="bg-blue-400 rounded-tl-[3px]" />
          <div className="bg-blue-400 rounded-tr-[3px]" />
          <div className="bg-blue-400 rounded-bl-[3px]" />
          <div className="bg-blue-400 rounded-br-[3px]" />
        </div>
        
        {/* Brand text */}
        <h1
          className="text-3xl font-light text-white tracking-[0.2em]"
          style={{
            textShadow: '0 0 40px rgba(0,120,212,0.3)',
          }}
        >
          SaugatOS
        </h1>
      </div>

      {/* Dot spinner */}
      <div
        className="os-spinner relative mb-10"
        style={{ width: ORBIT_RADIUS * 2 + DOT_SIZE, height: ORBIT_RADIUS * 2 + DOT_SIZE }}
      >
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            className="absolute rounded-full"
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              top: '50%',
              left: '50%',
              marginTop: -(DOT_SIZE / 2),
              marginLeft: -(DOT_SIZE / 2),
              background: `rgba(255, 255, 255, ${1 - i * 0.15})`,
            }}
          />
        ))}
      </div>

      {/* Status message */}
      <p ref={pulseRef} className="text-xs text-white/50 tracking-wider">
        Getting things ready...
      </p>
    </div>
  );
}
