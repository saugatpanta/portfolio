import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Eye, Tag as TagIcon, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function BlogPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts-detail'],
    queryFn: () => firebaseClient.entities.BlogPost.filter({ status: "published" }),
  });

  const post = posts.find(p => p.slug === slug);

  const incrementViewMutation = useMutation({
    mutationFn: ({ id, views }) => firebaseClient.entities.BlogPost.update(id, { views: views + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-detail'] });
    }
  });

  useEffect(() => {
    if (post && !sessionStorage.getItem(`viewed-${post.id}`)) {
      incrementViewMutation.mutate({ id: post.id, views: post.views || 0 });
      sessionStorage.setItem(`viewed-${post.id}`, "true");
    }
  }, [post?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!slug) {
    navigate(createPageUrl("Blog"));
    return null;
  }

  if (!post) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to={createPageUrl("Blog")}>
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.tags?.some(tag => post.tags?.includes(tag)))
    .slice(0, 3);

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Category Badge */}
          {post.category && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <span className="px-4 py-2 rounded-full bg-purple-500/10 text-purple-500 text-sm font-semibold capitalize">
                {post.category}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-6 mb-8 text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {post.author?.[0] || "A"}
              </div>
              <span className="font-medium">{post.author || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.published_date || post.created_date), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.reading_time || 5} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {post.views || 0} views
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 ml-auto"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </motion.div>

          {/* Featured Image */}
          {post.featured_image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12 rounded-2xl overflow-hidden"
            >
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-8 md:p-12 glass border-0 mb-12">
              <ReactMarkdown
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                  prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                  prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                  prose-code:text-sm prose-code:bg-slate-100 dark:prose-code:bg-slate-800 
                  prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-pre:bg-slate-900 prose-pre:text-slate-100
                  prose-img:rounded-lg prose-img:shadow-lg
                  prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              >
                {post.content}
              </ReactMarkdown>
            </Card>
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <Card className="p-6 glass border-0">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <Link to={createPageUrl("BlogPost") + `?slug=${relatedPost.slug}`}>
                      <Card className="group overflow-hidden border-0 glass hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                          {relatedPost.featured_image ? (
                            <img
                              src={relatedPost.featured_image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300 dark:text-slate-700">
                              {relatedPost.title[0]}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.article>
      </div>
    </div>
  );
}