import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Tag, Search, ArrowRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => firebaseClient.entities.BlogPost.filter({ status: "published" }, '-published_date'),
  });

  const allTags = [...new Set(posts.flatMap(p => p.tags || []))];
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = posts.find(p => p.featured);

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            My <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on web development, design, and technology
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <Link to={createPageUrl("BlogPost") + `?slug=${featuredPost.slug}`}>
              <Card className="group overflow-hidden border-0 glass hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-slate-300 dark:text-slate-700">
                        {featuredPost.title[0]}
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(featuredPost.published_date || featuredPost.created_date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.reading_time || 5} min read
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 group-hover:text-blue-500 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-blue-500 font-medium group-hover:gap-4 transition-all">
                      Read More
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedTag === "all" ? "default" : "outline"}
              onClick={() => setSelectedTag("all")}
              className={selectedTag === "all" ? "bg-blue-500 hover:bg-blue-600" : ""}
              size="sm"
            >
              All Posts
            </Button>
            {allTags.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-blue-500 hover:bg-blue-600" : ""}
                size="sm"
              >
                {tag}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPosts.filter(p => !p.featured || posts.length === 1).map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl("BlogPost") + `?slug=${post.slug}`}>
                  <Card className="group overflow-hidden border-0 glass hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-slate-300 dark:text-slate-700">
                          {post.title[0]}
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold capitalize">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_date || post.created_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.reading_time || 5} min
                        </div>
                        {post.views > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No blog posts found {searchQuery || selectedTag !== "all" ? "matching your filters" : ""}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}