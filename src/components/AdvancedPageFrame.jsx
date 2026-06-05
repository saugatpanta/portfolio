import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './advanced-page-frame.css';

const variants = {
  projects: {
    eyebrow: 'Computer',
    title: 'Project Explorer',
    meta: 'Live portfolio workspace',
  },
  blog: {
    eyebrow: 'Documents',
    title: 'Knowledge Library',
    meta: 'Articles, notes, and ideas',
  },
  article: {
    eyebrow: 'Reader',
    title: 'Article Viewer',
    meta: 'Focused reading surface',
  },
  about: {
    eyebrow: 'Profile',
    title: 'About Studio',
    meta: 'Skills, story, and credentials',
  },
  terminal: {
    eyebrow: 'Terminal',
    title: 'Experience Console',
    meta: 'Career timeline and execution logs',
  },
  mail: {
    eyebrow: 'Mail',
    title: 'Contact Center',
    meta: 'Messages, links, and location',
  },
  home: {
    eyebrow: 'Desktop',
    title: 'Profile Hub',
    meta: 'Personal operating space',
  },
  control: {
    eyebrow: 'Control Panel',
    title: 'Personalization',
    meta: 'System appearance settings',
  },
};

export default function AdvancedPageFrame({ variant = 'home', children }) {
  const rootRef = useRef(null);
  const glowRef = useRef(null);
  const info = variants[variant] || variants.home;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('[data-advanced-chrome]', {
        opacity: 0,
        y: -18,
        filter: 'blur(10px)',
        duration: 0.75,
        ease: 'power3.out',
      });

      gsap.from('[data-advanced-particle]', {
        opacity: 0,
        scale: 0.5,
        y: 24,
        stagger: 0.06,
        duration: 0.9,
        ease: 'back.out(1.8)',
      });

      gsap.to('[data-advanced-particle]', {
        y: 'random(-18, 18)',
        x: 'random(-12, 12)',
        rotate: 'random(-12, 12)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.14,
      });
    }, root);

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(glowRef.current, {
        x: px * 42,
        y: py * 42,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.to(root.querySelectorAll('[data-depth]'), {
        x: (_, target) => px * Number(target.dataset.depth),
        y: (_, target) => py * Number(target.dataset.depth),
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    root.addEventListener('pointermove', onMove);
    return () => {
      root.removeEventListener('pointermove', onMove);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={`advanced-page-frame advanced-page-${variant}`}>
      <div ref={glowRef} className="advanced-page-cursor-glow" />
      <div className="advanced-page-grid" />
      <div className="advanced-page-vignette" />
      <div className="advanced-page-scanline" />

      <div className="advanced-particles" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            key={item}
            data-advanced-particle
            data-depth={6 + item * 2}
            className={`advanced-particle advanced-particle-${item + 1}`}
          />
        ))}
      </div>

      <div data-advanced-chrome className="advanced-page-chrome">
        <div>
          <div className="advanced-page-eyebrow">{info.eyebrow}</div>
          <div className="advanced-page-title">{info.title}</div>
        </div>
        <div className="advanced-page-meta">{info.meta}</div>
      </div>

      <div className="advanced-page-content">{children}</div>
    </div>
  );
}
