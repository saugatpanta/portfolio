import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import useOSStore from '@/store/useOSStore';

const FALLBACK_SKILLS = {
  Frontend: [{ name: 'React', pct: 90 }, { name: 'JavaScript', pct: 88 }, { name: 'Tailwind CSS', pct: 85 }, { name: 'TypeScript', pct: 75 }],
  Backend: [{ name: 'Node.js', pct: 82 }, { name: 'Python', pct: 70 }, { name: 'Firebase', pct: 80 }, { name: 'MongoDB', pct: 72 }],
  Tools: [{ name: 'Git', pct: 88 }, { name: 'Docker', pct: 60 }, { name: 'Figma', pct: 65 }, { name: 'VS Code', pct: 95 }],
};

const FALLBACK_EDUCATION = [
  { year: '2024—Present', title: 'BSc CSIT', place: 'Apex College, Kathmandu', note: 'GPA 3.59 (2nd Sem)' },
  { year: '2022—2024', title: '+2 Science', place: 'Reliance International Academy', note: 'Physics, Math, CS' },
];

function SkillBar({ name, pct, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <div ref={ref} className="flex items-center gap-4 py-2.5">
      <span className="w-28 text-[13px] text-gray-400 flex-shrink-0">{name}</span>
      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gray-400 rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <span className="text-[11px] text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function About() {
  const { openApp } = useOSStore();
  const { data: profileData } = useQuery({ queryKey: ['profileImage'], queryFn: () => firebaseClient.entities.ProfileImage.get() });
  const { data: contactInfo } = useQuery({ queryKey: ['contactInfo'], queryFn: () => firebaseClient.entities.ContactInfo.get() });
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => firebaseClient.entities.Skill.list('-order') });
  const { data: experience = [] } = useQuery({ queryKey: ['experience'], queryFn: () => firebaseClient.entities.Experience.list('-order') });

  const avatarUrl = profileData?.profileImage || '';

  // Build skills by category from Firebase, fallback to hardcoded
  const skillsByCategory = (() => {
    if (skills.length === 0) return FALLBACK_SKILLS;
    const grouped = {};
    skills.forEach(s => {
      const cat = s.category || 'Tools';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ name: s.name, pct: s.proficiency || s.level || 75 });
    });
    return Object.keys(grouped).length > 0 ? grouped : FALLBACK_SKILLS;
  })();

  // Build education from experience entries marked as education, or fallback
  const education = (() => {
    const edu = experience.filter(e => e.type === 'education');
    if (edu.length > 0) return edu.map(e => ({
      year: e.duration || `${e.start_year || ''}—${e.end_year || 'Present'}`,
      title: e.role || e.degree || e.title,
      place: e.company || e.institution,
      note: e.description || '',
    }));
    return FALLBACK_EDUCATION;
  })();

  // Bio from contactInfo or profileData
  const bio = contactInfo?.description || contactInfo?.bio || '';

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto">
      <div className="max-w-[90%] xl:max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 py-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6">About</p>
          <h1 className="text-3xl md:text-4xl font-light text-white leading-snug">
            I'm a developer who cares about{' '}
            <span className="text-gray-400">craft, clarity, and user experience.</span>
          </h1>
        </motion.div>

        {/* Two-column intro */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Saugat Panta" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-light text-gray-800">SP</div>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-[13px] text-gray-400">Kathmandu, Nepal</p>
              <p className="text-[13px] text-emerald-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Available for projects
              </p>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div className="md:col-span-2 space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {bio ? (
              <p className="text-[15px] text-gray-300 leading-relaxed">{bio}</p>
            ) : (
              <>
                <p className="text-[15px] text-gray-300 leading-relaxed">
                  I'm Saugat — a full-stack developer and BSc CSIT student in my 3rd semester at Apex College.
                  I've been building for the web since 2022, starting with static sites for local businesses
                  and progressing to full-stack applications with React and Node.js.
                </p>
                <p className="text-[15px] text-gray-300 leading-relaxed">
                  My approach is simple: understand the problem deeply, then build the simplest solution that works well.
                  I value readable code over clever code, and real shipping over endless planning.
                </p>
                <p className="text-[15px] text-gray-300 leading-relaxed">
                  When I'm not coding, I'm tutoring programming to beginners, reading about system design,
                  or working on open source. I believe in learning publicly and sharing what I know.
                </p>
              </>
            )}

            <div className="pt-4 flex gap-3">
              <button onClick={() => openApp('mail')} className="px-4 py-2 text-[12px] font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors">
                Get in touch
              </button>
              {contactInfo?.cvUrl && (
                <button onClick={() => window.open(contactInfo.cvUrl)} className="px-4 py-2 text-[12px] font-medium text-gray-400 border border-gray-700 rounded-md hover:border-gray-500 hover:text-white transition-colors">
                  Download CV
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mb-16" />

        {/* Skills */}
        <div className="mb-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-10">Proficiency</p>
          <div className="grid md:grid-cols-3 gap-10">
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-[12px] uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-800">{category}</h3>
                {items.map((s, i) => (
                  <SkillBar key={s.name} name={s.name} pct={s.pct} delay={i * 0.1} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-10">Education</p>
          <div className="space-y-0 divide-y divide-gray-800">
            {education.map((e, i) => (
              <motion.div
                key={i}
                className="py-6 grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr_1fr] gap-4 items-baseline"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-[12px] text-gray-600 font-mono">{e.year}</span>
                <div>
                  <h4 className="text-[15px] text-white font-medium">{e.title}</h4>
                  <p className="text-[13px] text-gray-500 mt-0.5">{e.place}</p>
                </div>
                <span className="text-[12px] text-gray-600 hidden md:block">{e.note}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick facts */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-8">Quick Facts</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Location', value: 'Kathmandu' },
              { label: 'Languages', value: 'English, Nepali' },
              { label: 'Timezone', value: 'NPT (UTC+5:45)' },
              { label: 'Editor', value: 'VS Code' },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[11px] text-gray-600 mb-1">{f.label}</p>
                <p className="text-[14px] text-gray-300">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
