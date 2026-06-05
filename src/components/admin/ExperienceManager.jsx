
import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import gsap from "gsap";

export default function ExperienceManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    achievements: "",
    order: 0
  });

  // Ref for staggered list animation
  const listRef = useRef(null);

  const { data: experiences = [] } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: () => firebaseClient.entities.Experience.list('-order'),
  });

  // Staggered entrance animation when experiences load
  useEffect(() => {
    if (experiences.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.exp-item');
      gsap.fromTo(items,
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
      );
    }
  }, [experiences]);

  const createMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Experience.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      closeForm();
      toast.success("Experience created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseClient.entities.Experience.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      closeForm();
      toast.success("Experience updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseClient.entities.Experience.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success("Experience deleted successfully");
    }
  });

  const openForm = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        ...exp,
        achievements: exp.achievements?.join("\n") || ""
      });
    } else {
      setEditingExp(null);
      setFormData({
        company: "",
        position: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
        achievements: "",
        order: 0
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExp(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      achievements: formData.achievements.split("\n").map(a => a.trim()).filter(Boolean)
    };
    
    if (editingExp) {
      updateMutation.mutate({ id: editingExp.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white/90">Experience</CardTitle>
          <Button onClick={() => openForm()} className="gap-2 bg-blue-600/80 hover:bg-blue-600 text-white border-0">
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" ref={listRef}>
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="exp-item flex items-start justify-between p-4 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white/90">{exp.position}</h3>
                  <p className="text-sm text-blue-400">{exp.company}</p>
                  <p className="text-sm text-white/40 mt-1">
                    {exp.start_date} - {exp.end_date || "Present"}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openForm(exp)}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(exp.id)}
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
              {editingExp ? "Edit Experience" : "Add New Experience"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/70">Company *</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Position *</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="bg-white/5 border-white/15 text-white focus:border-blue-500/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <Label className="text-white/70">End Date (leave empty for current)</Label>
                <Input
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  placeholder="Present"
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-blue-500/50"
              />
            </div>
            <div>
              <Label className="text-white/70">Achievements (one per line)</Label>
              <Textarea
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={5}
                placeholder="Led team of 5 developers&#10;Improved performance by 50%"
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
                {editingExp ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}