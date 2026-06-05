import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable hook for GSAP ScrollTrigger animations.
 * Auto-cleans up on unmount.
 * 
 * @param {Object} options
 * @param {string} options.animation - Animation type: 'fadeUp', 'fadeIn', 'slideLeft', 'slideRight', 'flip3D', 'scaleIn', 'stagger'
 * @param {number} options.duration - Animation duration (default: 0.8)
 * @param {number} options.delay - Delay before animation (default: 0)
 * @param {string} options.start - ScrollTrigger start position (default: 'top 85%')
 * @param {boolean} options.once - Only animate once (default: true)
 * @param {number} options.staggerAmount - Stagger amount for children (default: 0.1)
 * @returns {React.RefObject}
 */
export function useGSAPScrollTrigger({
  animation = 'fadeUp',
  duration = 0.8,
  delay = 0,
  start = 'top 85%',
  once = true,
  staggerAmount = 0.1,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tween;

    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60, rotateX: -10 },
        to: { opacity: 1, y: 0, rotateX: 0, duration, delay, ease: 'power3.out' },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1, duration, delay, ease: 'power2.out' },
      },
      slideLeft: {
        from: { opacity: 0, x: -100, rotateY: 15 },
        to: { opacity: 1, x: 0, rotateY: 0, duration, delay, ease: 'power3.out' },
      },
      slideRight: {
        from: { opacity: 0, x: 100, rotateY: -15 },
        to: { opacity: 1, x: 0, rotateY: 0, duration, delay, ease: 'power3.out' },
      },
      flip3D: {
        from: { opacity: 0, rotateY: -90, transformPerspective: 1000 },
        to: { opacity: 1, rotateY: 0, duration, delay, ease: 'power3.out' },
      },
      scaleIn: {
        from: { opacity: 0, scale: 0.8, rotateX: -15 },
        to: { opacity: 1, scale: 1, rotateX: 0, duration, delay, ease: 'back.out(1.7)' },
      },
      stagger: {
        from: { opacity: 0, y: 40, rotateX: -5 },
        to: {
          opacity: 1, y: 0, rotateX: 0, duration, delay,
          ease: 'power3.out',
          stagger: { amount: staggerAmount, from: 'start' },
        },
      },
    };

    const config = animations[animation] || animations.fadeUp;

    if (animation === 'stagger') {
      const children = el.children;
      if (children.length > 0) {
        gsap.set(children, config.from);
        tween = gsap.to(children, {
          ...config.to,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: once ? 'play none none none' : 'play reverse play reverse',
          },
        });
      }
    } else {
      gsap.set(el, config.from);
      tween = gsap.to(el, {
        ...config.to,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      });
    }

    return () => {
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
    };
  }, [animation, duration, delay, start, once, staggerAmount]);

  return ref;
}

export default useGSAPScrollTrigger;
