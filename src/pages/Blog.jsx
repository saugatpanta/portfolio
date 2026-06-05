import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useOSStore from '@/store/useOSStore';

export default function Blog() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');
  const navigate = useNavigate();
  const { openApp } = useOSStore();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => firebaseClient.entities.BlogPost.filter({ status: 'published' }, '-published_date'),
    staleTime: 5 * 60 * 1000,
  });

  const allTags = useMemo(() => [...new Set(posts.flatMap(p => p.tags || []))], [posts]);

  const filtered = useMemo(() => posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchTag = tag === 'all' || p.tags?.includes(tag);
    return matchSearch && matchTag;
  }), [posts, search, tag]);

  const openPost = (post) => {
    navigate(createPageUrl('BlogPost') + `?slug=${post.slug}`);
    openApp({ id: `blog-post-${post.slug}`, title: post.title || 'Blog Post', component: 'BlogPost', size: { w: 940, h: 700 } });
  };

  const readTime = (content = '') => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  const formatDate = (d) => {
    try { return format(d instanceof Date ? d : new Date(d), 'MMM d, yyyy'); }
    catch { return ''; }
  };

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto">
      <div className="max-w-[90%] xl:max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 py-16">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6">Blog</p>
          <h1 className="text-3xl font-light text-white">Thoughts on code, design, and building things.</h1>
        </motion.div>

        {/* Search + Tags */}
        <div className="mb-10 space-y-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full md:w-72 px-4 py-2.5 text-[13px] bg-transparent border border-gray-800 rounded-md text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors"
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTag('all')} className={`text-[11px] px-3 py-1 rounded-md transition-colors ${tag === 'all' ? 'bg-white text-black' : 'text-gray-500 hover:text-white border border-gray-800'}`}>All</button>
              {allTags.map(t => (
                <button key={t} onClick={() => setTag(t)} className={`text-[11px] px-3 py-1 rounded-md transition-colors ${tag === t ? 'bg-white text-black' : 'text-gray-500 hover:text-white border border-gray-800'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800/30 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-0 divide-y divide-gray-800/60">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                className="py-7 cursor-pointer group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openPost(post)}
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2 className="text-[16px] font-medium text-white group-hover:text-blue-300 transition-colors">{post.title}</h2>
                  <span className="text-[11px] text-gray-600 flex-shrink-0 font-mono">{formatDate(post.published_date)}</span>
                </div>
                {post.excerpt && <p className="text-[14px] text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-600">{readTime(post.content)} min read</span>
                  {post.views > 0 && <span className="text-[11px] text-gray-600">{post.views} views</span>}
                  {(post.tags || []).length > 0 && (
                    <div className="flex gap-1.5">
                      {post.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 text-gray-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-600 text-sm">No posts yet — check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
