import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import useOSStore from '@/store/useOSStore';

const ROLES = ['builds web apps', 'writes clean code', 'solves problems'];
const FALLBACK_TECH = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Firebase', 'MongoDB', 'Tailwind CSS', 'Git', 'Docker'];

export default function Home() {
  const { openApp } = useOSStore();
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true });

  const { data: profileData } = useQuery({ queryKey: ['profileImage'], queryFn: () => firebaseClient.entities.ProfileImage.get() });
  const { data: projects = [] } = useQuery({ queryKey: ['featuredProjects'], queryFn: () => firebaseClient.entities.Project.filter({ featured: true }, '-order', 3) });
  const { data: contactInfo } = useQuery({ queryKey: ['contactInfo'], queryFn: () => firebaseClient.entities.ContactInfo.get() });
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => firebaseClient.entities.Skill.list('-order'), staleTime: 5 * 60 * 1000 });

  const avatarUrl = profileData?.profileImage || '';
  const techStack = skills.length > 0 ? skills.map(s => s.name) : FALLBACK_TECH;

  useEffect(() => {
    const word = ROLES[roleIdx];
    let t;
    if (!deleting && charIdx === word.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setRoleIdx((i) => (i + 1) % ROLES.length);
    } else {
      t = setTimeout(() => setCharIdx((c) => c + (deleting ? -1 : 1)), deleting ? 40 : 90);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, roleIdx]);

  const displayProjects = projects.length > 0 ? projects : [
    { id: '1', title: 'Portfolio OS', description: 'Windows 7 inspired web-based operating system.', technologies: ['React', 'Firebase', 'Framer Motion'] },
    { id: '2', title: 'E-Commerce Platform', description: 'Full-stack shopping application.', technologies: ['Next.js', 'PostgreSQL', 'Stripe'] },
    { id: '3', title: 'Task Manager', description: 'Kanban-style productivity tool.', technologies: ['React', 'Node.js', 'MongoDB'] },
  ];

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto font-[system-ui]">
      {/* Hero — clean, minimal, typographic */}
      <section className="relative px-4 sm:px-8 md:px-16 pt-20 pb-24 max-w-[90%] xl:max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div className="flex-1">
            <motion.p
              className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            >
              Full-Stack Developer — Kathmandu, NP
            </motion.p>

            <motion.h1
              className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.05] text-white tracking-tight"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            >
              Saugat Panta
              <span className="block text-gray-500 text-[clamp(1rem,2.5vw,1.5rem)] mt-3 font-normal">
                {ROLES[roleIdx].slice(0, charIdx)}<span className="text-white/40">_</span>
              </span>
            </motion.h1>

            <motion.p
              className="mt-8 text-gray-400 text-[15px] leading-relaxed max-w-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            >
              I design and build digital products that are fast, accessible, and pleasant to use. Currently studying BSc CSIT and freelancing.
            </motion.p>

            <motion.div
              className="mt-10 flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            >
              <button onClick={() => openApp('projects')}
                className="px-5 py-2.5 text-[13px] font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors">
                Projects
              </button>
              <button onClick={() => openApp('mail')}
                className="px-5 py-2.5 text-[13px] font-medium text-gray-300 border border-gray-700 rounded-md hover:border-gray-500 hover:text-white transition-colors">
                Say hello
              </button>
              <span className="ml-4 flex items-center gap-2 text-[12px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open to work
              </span>
            </motion.div>
          </div>

          {/* Avatar — simple, no spinning rings */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Saugat Panta" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-light text-gray-700">SP</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Divider line */}
        <motion.div className="mt-20 h-px bg-gray-800" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }} style={{ transformOrigin: 'left' }} />
      </section>

      {/* Selected Work */}
      <section ref={sectionRef} className="px-4 sm:px-8 md:px-16 pb-24 max-w-[90%] xl:max-w-[1400px] mx-auto">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Selected Work</h2>
          <button onClick={() => openApp('projects')} className="text-[12px] text-gray-500 hover:text-white transition-colors">
            View all →
          </button>
        </div>

        <div className="space-y-0 divide-y divide-gray-800/60">
          {displayProjects.map((p, i) => {
            const img = p.image || p.featured_image || p.image_url || p.thumbnailUrl || '';
            return (
              <motion.div
                key={p.id || i}
                className="group py-8 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                onClick={() => openApp('projects')}
              >
                {/* Thumbnail */}
                <div className="w-full md:w-40 h-24 rounded-lg overflow-hidden bg-gray-800/50 flex-shrink-0">
                  {img ? (
                    <img src={img} alt={p.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-light text-gray-700">{p.title?.[0]}</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white group-hover:text-blue-300 transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.description}</p>
                </div>

                {/* Tech */}
                <div className="flex gap-2 flex-shrink-0">
                  {(p.technologies || p.tech || []).slice(0, 2).map(t => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700/50">{t}</span>
                  ))}
                </div>

                {/* Arrow */}
                <span className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all text-lg flex-shrink-0">→</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Skills strip — minimal horizontal */}
      <section className="border-t border-gray-800 py-16 px-4 sm:px-8 md:px-16 max-w-[90%] xl:max-w-[1400px] mx-auto">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-8">Stack</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {techStack.map((s, i) => (
            <motion.span
              key={s}
              className="text-[15px] text-gray-400 hover:text-white transition-colors cursor-default"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-gray-800 py-20 px-4 sm:px-8 md:px-16 max-w-[90%] xl:max-w-[1400px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-gray-500 text-sm mb-4">Interested in working together?</p>
          <button onClick={() => openApp('mail')}
            className="text-2xl md:text-3xl font-light text-white hover:text-blue-300 transition-colors">
            pantasaugat7@gmail.com
          </button>
        </motion.div>
      </section>
    </div>
  );
}
