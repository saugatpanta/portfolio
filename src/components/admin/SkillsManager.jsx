import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import gsap from "gsap";

export default function SkillsManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "frontend",
    proficiency: 80,
    icon: "Code",
    order: 0
  });

  // Ref for grid and proficiency bar animations
  const gridRef = useRef(null);

  const { data: skills = [] } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: () => firebaseClient.entities.Skill.list('-order'),
  });

  // Animate skill cards and proficiency bars on data load
  useEffect(() => {
    if (skills.length > 0 && gridRef.current) {
      const items = gridRef.current.querySelectorAll('.skill-item');
      const bars = gridRef.current.querySelectorAll('.proficiency-bar-fill');
      
      // Staggered card entrance
      gsap.fromTo(items,
        { opacity: 0, y: 15, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
      
      // Animate proficiency bar widths from 0 to target
      bars.forEach((bar) => {
        const targetWidth = bar.dataset.width;
        gsap.fromTo(bar,
          { width: '0%' },
          { width: targetWidth + '%', duration: 0.8, delay: 0.3, ease: 'power2.out' }
        );
      });
    }
  }, [skills]);

  // Category color mapping for dark theme pills
  const categoryColors = {
    frontend: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    backend: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    database: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    devops: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    tools: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    other: 'bg-white/10 text-white/60 border-white/15',
  };

  const createMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Skill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      closeForm();
      toast.success("Skill created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseClient.entities.Skill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      closeForm();
      toast.success("Skill updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseClient.entities.Skill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success("Skill deleted successfully");
    }
  });

  const openForm = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData(skill);
    } else {
      setEditingSkill(null);
      setFormData({
        name: "",
        category: "frontend",
        proficiency: 80,
        icon: "Code",
        order: 0
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSkill(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white/90">Skills</CardTitle>
          <Button onClick={() => openForm()} className="gap-2 bg-blue-600/80 hover:bg-blue-600 text-white border-0">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3" ref={gridRef}>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="skill-item flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white/90">{skill.name}</h3>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full border mt-1 capitalize ${categoryColors[skill.category] || categoryColors.other}`}>
                    {skill.category}
                  </span>
                  {/* Proficiency bar with GSAP animation */}
                  <div className="mt-2 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="proficiency-bar-fill h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      data-width={skill.proficiency}
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-1">{skill.proficiency}%</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openForm(skill)}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(skill.id)}
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
        <DialogContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white/90">
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/70">Skill Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/15 text-white">
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Proficiency (0-100) *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
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
                {editingSkill ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}