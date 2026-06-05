import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import { Github, ExternalLink, X } from 'lucide-react';
import useOSStore from '@/store/useOSStore';

const FALLBACK = [
  { id: '1', title: 'Portfolio OS', description: 'Windows 7 inspired web-based operating system with Aero Glass effects, draggable windows, and full desktop simulation.', technologies: ['React', 'Firebase', 'Framer Motion', 'Tailwind CSS'], status: 'live', featured: true, github_url: 'https://github.com/saugatpanta/portfolio', live_url: 'https://saugatpanta.com', image_url: '', year: 2025 },
  { id: '2', title: 'E-Commerce Platform', description: 'Full stack shopping platform with product catalog, cart, and payment integration.', technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'], status: 'live', featured: false, github_url: 'https://github.com/saugatpanta', live_url: '', image_url: '', year: 2024 },
  { id: '3', title: 'AI Chat Application', description: 'Real-time AI powered chat with streaming responses and multi-model support.', technologies: ['React', 'Node.js', 'MongoDB', 'TypeScript'], status: 'wip', featured: false, github_url: 'https://github.com/saugatpanta', live_url: '', image_url: '', year: 2025 },
  { id: '4', title: 'Task Management System', description: 'Kanban-style task management with drag-and-drop and real-time sync.', technologies: ['React', 'Firebase', 'Tailwind CSS'], status: 'live', featured: false, github_url: 'https://github.com/saugatpanta/task-manager', live_url: '', image_url: '', year: 2024 },
];

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { openInBrowser } = useOSStore();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => firebaseClient.entities.Project.list('-order'),
    staleTime: 5 * 60 * 1000,
  });

  const all = projects.length > 0 ? projects : FALLBACK;

  const filtered = all.filter(p => {
    const mf = filter === 'all' || (filter === 'featured' && p.featured) || p.status === filter;
    const ms = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || (p.technologies || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return mf && ms;
  });

  const getImg = (p) => p.featured_image || p.image_url || p.thumbnailUrl || p.thumbnail || '';

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto">
      <div className="max-w-[90%] xl:max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 py-16">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6">Projects</p>
          <h1 className="text-3xl font-light text-white">Things I've built.</h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full sm:w-60 px-4 py-2.5 text-[13px] bg-transparent border border-gray-800 rounded-md text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors"
          />
          <div className="flex gap-2">
            {['all', 'featured', 'live', 'wip'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] px-3 py-1.5 rounded-md capitalize transition-colors ${filter === f ? 'bg-white text-black' : 'text-gray-500 border border-gray-800 hover:text-white hover:border-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Project list */}
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-800/20 rounded-lg animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-0 divide-y divide-gray-800/60">
            <AnimatePresence>
              {filtered.map((p, i) => {
                const img = getImg(p);
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="py-7 flex flex-col md:flex-row md:items-center gap-5 cursor-pointer group"
                    onClick={() => setSelected(p)}
                  >
                    {/* Thumbnail */}
                    <div className="w-full md:w-44 h-28 rounded-lg overflow-hidden bg-gray-800/30 flex-shrink-0 border border-gray-800/50">
                      {img ? (
                        <img src={img} alt={p.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-light text-gray-800">{p.title?.[0]}</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-[15px] font-medium text-white group-hover:text-blue-300 transition-colors">{p.title}</h3>
                        {p.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Featured</span>}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.status === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : p.status === 'wip' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {p.status === 'live' ? 'Live' : p.status === 'wip' ? 'WIP' : 'Archived'}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 line-clamp-1 mb-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(p.technologies || []).slice(0, 4).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 text-gray-500">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Year */}
                    <span className="text-[12px] font-mono text-gray-700 flex-shrink-0">{p.year}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="py-16 text-center text-gray-600 text-sm">No projects match your filters.</p>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-[#111827] border border-gray-800 rounded-xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              {getImg(selected) ? (
                <img src={getImg(selected)} alt={selected.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-800/30 flex items-center justify-center text-5xl font-light text-gray-800">{selected.title?.[0]}</div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-medium text-white">{selected.title}</h2>
                    <p className="text-[12px] text-gray-500 mt-1">{selected.year} • {selected.status}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <p className="text-[14px] text-gray-400 leading-relaxed mb-5">{selected.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(selected.technologies || []).map(t => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700/50">{t}</span>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  {selected.github_url && (
                    <button onClick={() => openInBrowser(selected.github_url)} className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-gray-300 border border-gray-700 rounded-md hover:border-gray-500 hover:text-white transition-colors">
                      <Github className="w-3.5 h-3.5" />Source
                    </button>
                  )}
                  {selected.live_url && (
                    <button onClick={() => openInBrowser(selected.live_url)} className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />Live Demo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
