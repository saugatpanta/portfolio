import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import { Calendar, Clock, ArrowLeft, Eye, Tag, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import useOSStore from '@/store/useOSStore';

export default function BlogPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { windows, openApp } = useOSStore();

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: posts=[] } = useQuery({
    queryKey: ['blog-posts-detail'],
    queryFn: () => firebaseClient.entities.BlogPost.filter({ status:'published' }),
    staleTime: 5*60*1000,
  });

  const post = posts.find(p=>p.slug===slug);

  const viewMutation = useMutation({
    mutationFn: ({id,views}) => firebaseClient.entities.BlogPost.update(id,{views:(views||0)+1}),
    onSuccess: () => queryClient.invalidateQueries({queryKey:['blog-posts-detail']}),
  });

  useEffect(() => {
    if (post && !sessionStorage.getItem(`viewed-${post.id}`)) {
      viewMutation.mutate({id:post.id,views:post.views||0});
      sessionStorage.setItem(`viewed-${post.id}`,'true');
    }
  }, [post?.id]);

  const goToBlog = () => {
    const blogWin = windows.find(w=>w.component==='Blog');
    if (blogWin) useOSStore.getState().focusWindow(blogWin.id);
    else openApp('blog');
  };

  const openBlogPost = (p) => {
    navigate(createPageUrl('BlogPost')+`?slug=${p.slug}`);
    openApp({ id:`blog-post-${p.slug}`, title:p.title||'Blog Post', component:'BlogPost', size:{w:940,h:700} });
  };

  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({title:post.title,text:post.excerpt,url:window.location.href}); } catch{} }
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  const readTime = (content='') => Math.max(1, Math.ceil(content.split(/\s+/).length/200));

  if (!slug) { goToBlog(); return null; }

  if (!post) {
    return (
      <div className="min-h-full h-full bg-gradient-to-b from-gray-900 to-[#0d1b2e] text-white flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-5xl">📄</div>
        <h2 className="text-xl font-bold">Post Not Found</h2>
        <p className="text-white/50 text-sm">This post doesn't exist or has been removed.</p>
        <button onClick={goToBlog} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"><ArrowLeft className="h-4 w-4" />Back to Blog</button>
      </div>
    );
  }

  const related = posts.filter(p=>p.id!==post.id&&p.tags?.some(t=>post.tags?.includes(t))).slice(0,3);

  return (
    <div className="min-h-full h-full bg-gradient-to-b from-gray-900 to-[#0d1b2e] text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={goToBlog} className="flex items-center gap-2 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
        </button>

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          {post.category && <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium mb-3 inline-block capitalize">{post.category}</span>}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-6">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(post.published_date||post.created_date||Date.now()),'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(post.content)} min read</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views||0} views</span>
            <button onClick={handleShare} className="flex items-center gap-1 ml-auto hover:text-white transition-colors"><Share2 className="h-3 w-3" />Share</button>
          </div>
        </motion.div>

        {/* Featured image */}
        {post.featured_image && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-8 rounded-xl overflow-hidden border border-white/10">
            <img src={post.featured_image} alt={post.title} className="w-full h-64 object-cover" />
          </motion.div>
        )}

        {/* Content */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="prose prose-invert prose-sm max-w-none mb-8
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-white/70 prose-p:leading-relaxed
            prose-a:text-blue-400 hover:prose-a:text-blue-300
            prose-strong:text-white
            prose-code:text-blue-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-[#1a1f2e] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:text-white/60
            prose-img:rounded-xl prose-img:border prose-img:border-white/10
            prose-hr:border-white/10">
          <ReactMarkdown>{post.content||'*No content available.*'}</ReactMarkdown>
        </motion.div>

        {/* Tags */}
        {post.tags?.length>0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-white/10">
            <Tag className="h-4 w-4 text-white/30" />
            {post.tags.map(t=><span key={t} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-colors cursor-pointer">{t}</span>)}
          </div>
        )}

        {/* Related */}
        {related.length>0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Related Posts</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map(p=>(
                <div key={p.id} onClick={()=>openBlogPost(p)} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer group">
                  <div className="h-24 bg-gradient-to-br from-blue-500/15 to-purple-500/15 overflow-hidden">
                    {p.featured_image && <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-white/80 group-hover:text-blue-400 transition-colors line-clamp-2">{p.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
