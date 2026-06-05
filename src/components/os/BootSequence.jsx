import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOSStore from '@/store/useOSStore';
import './aero-styles.css';

export default function BootSequence() {
  const setBootState = useOSStore((s) => s.setBootState);
  const [phase, setPhase] = useState('orbs'); // orbs → logo → welcome → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 2800);
    const t2 = setTimeout(() => setPhase('welcome'), 4200);
    const t3 = setTimeout(() => setBootState('login'), 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setBootState]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={{ background: '#000' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'orbs' && <OrbsAnimation key="orbs" />}
        {phase === 'logo' && <LogoReveal key="logo" />}
        {phase === 'welcome' && <WelcomeScreen key="welcome" />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Phase 1: Four orbs flying in and swirling (Win7 style) ── */
function OrbsAnimation() {
  const orbs = [
    { color: '#ef4444', glow: 'rgba(239,68,68,0.6)', startX: -400, startY: 0, delay: 0 },
    { color: '#22c55e', glow: 'rgba(34,197,94,0.6)', startX: 0, startY: -400, delay: 0.15 },
    { color: '#3b82f6', glow: 'rgba(59,130,246,0.6)', startX: 400, startY: 0, delay: 0.3 },
    { color: '#eab308', glow: 'rgba(234,179,8,0.6)', startX: 0, startY: 400, delay: 0.45 },
  ];

  return (
    <motion.div
      className="relative"
      style={{ width: 200, height: 200 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.4 }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orb.color}, ${orb.color}aa)`,
            boxShadow: `0 0 20px ${orb.glow}, 0 0 40px ${orb.glow}`,
            top: '50%',
            left: '50%',
            marginTop: -8,
            marginLeft: -8,
          }}
          initial={{ x: orb.startX, y: orb.startY, opacity: 0, scale: 0.3 }}
          animate={{
            x: [orb.startX, orb.startX * 0.3, 60 * Math.cos(i * Math.PI / 2), 30 * Math.cos(i * Math.PI / 2 + 1), 0],
            y: [orb.startY, orb.startY * 0.3, 60 * Math.sin(i * Math.PI / 2), 30 * Math.sin(i * Math.PI / 2 + 1), 0],
            opacity: [0, 1, 1, 1, 1],
            scale: [0.3, 1.2, 1, 0.8, 0.6],
          }}
          transition={{ duration: 2.4, delay: orb.delay, ease: [0.25, 0.1, 0.25, 1] }}
        />
      ))}

      {/* Trail/streak effects */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`trail-${i}`}
          style={{
            position: 'absolute',
            width: 40,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${orb.color}80)`,
            top: '50%',
            left: '50%',
            marginTop: -1.5,
            marginLeft: -20,
            transformOrigin: 'center',
          }}
          initial={{ opacity: 0, rotate: i * 90 }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            rotate: [i * 90, i * 90 + 180, i * 90 + 360, i * 90 + 540],
            scale: [0, 1, 0.6, 0],
          }}
          transition={{ duration: 2.2, delay: orb.delay + 0.3, ease: 'easeInOut' }}
        />
      ))}

      {/* Center glow that builds up */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 80, height: 80,
          marginTop: -40, marginLeft: -40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0, 0.8, 1], scale: [0, 0, 1, 1.5] }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
      />

      {/* "Starting Windows" text */}
      <motion.p
        style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          fontWeight: 300,
          letterSpacing: '0.15em',
          fontFamily: 'Segoe UI, -apple-system, sans-serif',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Starting Windows
      </motion.p>
    </motion.div>
  );
}

/* ── Phase 2: Logo forms with light burst ── */
function LogoReveal() {
  const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];

  return (
    <motion.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
    >
      {/* Light burst behind logo */}
      <motion.div
        style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(74,144,217,0.15) 40%, transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0.6], scale: [0.3, 1.5, 1.2] }}
        transition={{ duration: 1.2 }}
      />

      {/* Windows flag logo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: 56, height: 56, position: 'relative' }}>
        {colors.map((color, i) => (
          <motion.div
            key={i}
            style={{
              borderRadius: 4,
              background: `linear-gradient(135deg, ${color}ee, ${color}99)`,
              boxShadow: `0 0 16px ${color}80, inset 0 1px 2px rgba(255,255,255,0.4)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3, type: 'spring', stiffness: 300 }}
          />
        ))}
      </div>

      {/* Animated loading dots */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)',
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Phase 3: Welcome screen (Win7 authentic) ── */
function WelcomeScreen() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse 110% 80% at 50% 45%, #1565a8 0%, #0d3a6e 35%, #061e3f 75%, #020e1f 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(80,160,240,0.12) 0%, transparent 70%)',
      }} />

      <div className="flex flex-col items-center gap-6">
        {/* Spinning circle of dots */}
        <SpinningCircle />

        <motion.h1
          style={{
            fontSize: 40,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.95)',
            fontFamily: 'Segoe UI, -apple-system, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            letterSpacing: '0.01em',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome
        </motion.h1>
      </div>
    </motion.div>
  );
}

/* ── Win7 spinning circle loader ── */
function SpinningCircle() {
  const DOT_COUNT = 6;
  const RADIUS = 20;

  return (
    <motion.div
      style={{ width: 52, height: 52, position: 'relative' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    >
      {Array.from({ length: DOT_COUNT }).map((_, i) => {
        const angle = (i / DOT_COUNT) * 360;
        const rad = angle * (Math.PI / 180);
        const x = Math.cos(rad) * RADIUS;
        const y = Math.sin(rad) * RADIUS;
        const opacity = 0.3 + (i / DOT_COUNT) * 0.7;
        const size = 3 + (i / DOT_COUNT) * 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              background: `rgba(255,255,255,${opacity})`,
              boxShadow: `0 0 4px rgba(200,230,255,${opacity * 0.5})`,
              top: '50%',
              left: '50%',
              transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
            }}
          />
        );
      })}
    </motion.div>
  );
}
