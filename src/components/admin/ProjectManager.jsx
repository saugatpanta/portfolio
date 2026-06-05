import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import gsap from "gsap";

export default function ProjecstManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    technologies: "",
    image_url: "",
    github_url: "",
    live_url: "",
    featured: false,
    order: 0
  });

  // Ref for list items container to animate children
  const listRef = useRef(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => firebaseClient.entities.Project.list('-order'),
  });

  // Staggered entrance animation when projects load
  useEffect(() => {
    if (projects.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.project-item');
      gsap.fromTo(items,
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [projects]);

  const createMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] });
      closeForm();
      toast.success("Project created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseClient.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] });
      closeForm();
      toast.success("Project updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseClient.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] });
      toast.success("Project deleted successfully");
    }
  });

  const openForm = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        technologies: project.technologies?.join(", ") || ""
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        long_description: "",
        technologies: "",
        image_url: "",
        github_url: "",
        live_url: "",
        featured: false,
        order: 0
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean)
    };
    
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white/90">Projects</CardTitle>
          <Button onClick={() => openForm()} className="gap-2 bg-blue-600/80 hover:bg-blue-600 text-white border-0">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" ref={listRef}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-item flex items-start justify-between p-4 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white/90">{project.title}</h3>
                    {project.featured && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mb-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies?.slice(0, 5).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-white/[0.08] text-white/60 rounded border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openForm(project)}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(project.id)}
                    className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white/90">
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/70">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Short Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Long Description</Label>
              <Textarea
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                rows={4}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Technologies (comma-separated)</Label>
              <Input
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, Node.js, MongoDB"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">GitHub URL</Label>
              <Input
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/..."
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Live URL</Label>
              <Input
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label className="text-white/70">Featured on homepage</Label>
            </div>
            <div>
              <Label className="text-white/70">Display Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={closeForm} className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600/80 hover:bg-blue-600 text-white">
                {editingProject ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}