import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Reusable hook for mouse-tracking 3D tilt effect.
 * Uses gsap.quickSetter for 60fps performance.
 * 
 * @param {Object} options
 * @param {number} options.maxRotation - Maximum rotation in degrees (default: 15)
 * @param {number} options.perspective - CSS perspective value (default: 1000)
 * @param {number} options.speed - Animation speed in seconds (default: 0.3)
 * @param {boolean} options.glare - Add glare effect (default: false)
 * @param {number} options.scale - Scale on hover (default: 1.02)
 * @returns {{ ref: React.RefObject, style: Object }}
 */
export function use3DTilt({
  maxRotation = 15,
  perspective = 1000,
  speed = 0.3,
  glare = false,
  scale = 1.02,
} = {}) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    gsap.to(el, {
      rotateX,
      rotateY,
      scale,
      duration: speed,
      ease: 'power2.out',
      transformPerspective: perspective,
    });

    if (glare && glareRef.current) {
      const glareAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      const glareOpacity = Math.max(
        Math.abs(rotateX) / maxRotation,
        Math.abs(rotateY) / maxRotation
      ) * 0.15;

      gsap.to(glareRef.current, {
        opacity: glareOpacity,
        background: `linear-gradient(${glareAngle + 180}deg, rgba(255,255,255,0.4) 0%, transparent 80%)`,
        duration: speed,
      });
    }
  }, [maxRotation, perspective, speed, glare, scale]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: speed * 1.5,
      ease: 'elastic.out(1, 0.5)',
      transformPerspective: perspective,
    });

    if (glare && glareRef.current) {
      gsap.to(glareRef.current, { opacity: 0, duration: speed });
    }
  }, [perspective, speed, glare]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, glareRef };
}

export default use3DTilt;
