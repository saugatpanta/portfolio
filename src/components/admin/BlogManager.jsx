import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import gsap from "gsap";

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export default function BlogManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    featured_image: "",
    tags: "",
    category: "other",
    status: "draft",
    featured: false,
    reading_time: 0,
    published_date: new Date().toISOString()
  });

  // Ref for staggered list animation
  const listRef = useRef(null);

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => firebaseClient.entities.BlogPost.list('-created_date'),
  });

  // Staggered entrance animation when posts load
  useEffect(() => {
    if (posts.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.blog-item');
      gsap.fromTo(items,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [posts]);

  const createMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-detail'] });
      closeForm();
      toast.success("Blog post created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseClient.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-detail'] });
      closeForm();
      toast.success("Blog post updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseClient.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-detail'] });
      toast.success("Blog post deleted successfully");
    }
  });

  const openForm = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        ...post,
        tags: post.tags?.join(", ") || "",
        published_date: post.published_date || new Date().toISOString()
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "",
        featured_image: "",
        tags: "",
        category: "other",
        status: "draft",
        featured: false,
        reading_time: 0,
        published_date: new Date().toISOString()
      });
    }
    setActiveTab("edit");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      reading_time: calculateReadingTime(formData.content)
    };
    
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleTitleChange = (title) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const publishedPosts = posts.filter(p => p.status === "published");
  const draftPosts = posts.filter(p => p.status === "draft");

  return (
    <div>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white/90">Blog Posts</CardTitle>
            <p className="text-sm text-white/40 mt-1">
              {publishedPosts.length} published, {draftPosts.length} drafts
            </p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-blue-600/80 hover:bg-blue-600 text-white border-0">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" ref={listRef}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="blog-item flex items-start justify-between p-4 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
              >
                <div className="flex gap-4 flex-1">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-white/90">{post.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded border ${
                        post.status === "published" 
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.25)]"
                          : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30 shadow-[0_0_6px_rgba(234,179,8,0.2)]"
                      }`}>
                        {post.status}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mb-2 line-clamp-1">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/30">
                      <span>{post.author || "No author"}</span>
                      <span>•</span>
                      <span>{format(new Date(post.published_date || post.created_date), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views || 0}
                      </span>
                      {post.tags?.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{post.tags.slice(0, 2).join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openForm(post)}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(post.id)}
                    className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center py-12 text-white/30">
                No blog posts yet. Create your first post!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white/90">
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {editingPost 
                ? "Update your blog post details below. Changes will be saved immediately." 
                : "Fill in the details to create a new blog post. All fields marked with * are required."
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
              <TabsTrigger value="edit" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                <FileText className="w-4 h-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      placeholder="My Awesome Blog Post"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Slug (URL)</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="my-awesome-blog-post"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                    <p className="text-xs text-white/30 mt-1">Auto-generated from title if left empty</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Excerpt *</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      required
                      rows={2}
                      placeholder="A brief description of your post"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Content * (Markdown supported)</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={12}
                      placeholder="Write your blog post content here using Markdown..."
                      className="font-mono text-sm bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Author</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Your Name"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/15 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/15 text-white">
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="thoughts">Thoughts</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Featured Image URL</Label>
                    <Input
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://..."
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/70">Tags (comma-separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="react, javascript, tutorial"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/15 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/15 text-white">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/70">Published Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.published_date ? new Date(formData.published_date).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setFormData({ ...formData, published_date: new Date(e.target.value).toISOString() })}
                      className="bg-white/5 border-white/15 text-white focus:border-blue-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label className="text-white/70">Featured post</Label>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={closeForm} className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600/80 hover:bg-blue-600 text-white">
                    {editingPost ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="space-y-6 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                <div>
                  <h1 className="text-4xl font-bold mb-4 text-white/90">{formData.title || "Untitled Post"}</h1>
                  <p className="text-white/50">{formData.excerpt}</p>
                </div>
                {formData.featured_image && (
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-white/10"
                  />
                )}
                <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white/90 prose-a:text-blue-400 prose-strong:text-white/80 prose-code:text-emerald-300">
                  <ReactMarkdown>{formData.content || "*No content yet*"}</ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}