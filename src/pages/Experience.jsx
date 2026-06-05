import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';

const FALLBACK_EXP = [
  { id: '1', company: 'Freelance', role: 'Web Developer', location: 'Kathmandu', duration: '2023 — Present', current: true, description: 'Building responsive websites for local businesses. Implementing SEO best practices and maintaining existing sites.', technologies: ['React', 'Tailwind', 'Firebase'] },
  { id: '2', company: 'Private Tutoring', role: 'Programming Tutor', location: 'Kathmandu', duration: '2022 — 2023', current: false, description: 'Taught HTML, CSS, and JavaScript fundamentals. Created learning materials and guided students through portfolio projects.', technologies: ['HTML', 'CSS', 'JavaScript'] },
];

const EDUCATION = [
  { id: '1', institution: 'Apex College', degree: 'BSc CSIT', duration: '2024 — Present', note: '3rd Semester • GPA 3.59', description: 'Data Structures, Algorithms, Web Technologies, Database Management' },
  { id: '2', institution: 'Reliance International Academy', degree: '+2 Science', duration: '2022 — 2024', note: 'Physical Science', description: 'Physics, Mathematics, Computer Science' },
];

export default function Experience() {
  const [tab, setTab] = useState('work');
  const { data: experience = [] } = useQuery({ queryKey: ['experience'], queryFn: () => firebaseClient.entities.Experience.list('-order'), staleTime: 5 * 60 * 1000 });

  const entries = experience.length > 0 ? experience : FALLBACK_EXP;

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto">
      <div className="max-w-[90%] xl:max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 py-16">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6">Experience</p>
          <h1 className="text-3xl font-light text-white">Where I've worked and what I've learned.</h1>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-6 mb-12 border-b border-gray-800">
          {[{ id: 'work', label: 'Work' }, { id: 'education', label: 'Education' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-[13px] font-medium relative transition-colors ${tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-px bg-white" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
            </button>
          ))}
        </div>

        {/* Work timeline */}
        {tab === 'work' && (
          <div className="space-y-0 divide-y divide-gray-800/60">
            {entries.map((e, i) => (
              <motion.div
                key={e.id || i}
                className="py-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-8"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <p className="text-[12px] font-mono text-gray-600">{e.duration}</p>
                  <p className="text-[12px] text-gray-600 mt-1">{e.location}</p>
                  {e.current && (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Current
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-white">{e.role}</h3>
                  <p className="text-[14px] text-gray-500 mt-0.5">{e.company}</p>
                  <p className="text-[14px] text-gray-400 mt-3 leading-relaxed">{e.description}</p>
                  {(e.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {e.technologies.map(t => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-gray-800/80 text-gray-500 border border-gray-700/50">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Education */}
        {tab === 'education' && (
          <div className="space-y-0 divide-y divide-gray-800/60">
            {EDUCATION.map((e, i) => (
              <motion.div
                key={e.id}
                className="py-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-8"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div>
                  <p className="text-[12px] font-mono text-gray-600">{e.duration}</p>
                  <p className="text-[12px] text-gray-600 mt-1">{e.note}</p>
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-white">{e.degree}</h3>
                  <p className="text-[14px] text-gray-500 mt-0.5">{e.institution}</p>
                  <p className="text-[14px] text-gray-400 mt-3 leading-relaxed">{e.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
