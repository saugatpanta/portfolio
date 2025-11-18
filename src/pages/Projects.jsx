import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, X, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("all");

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => firebaseClient.entities.Project.list('-order'),
  });

  // Check for URL parameter skill filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const skillParam = urlParams.get("skill");
    if (skillParam) {
      setFilter(skillParam);
    }
  }, []);

  const allTechnologies = [...new Set(projects.flatMap(p => p.technologies || []))];
  
  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.technologies?.includes(filter));

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
            My <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A collection of my work showcasing various technologies and problem-solving approaches
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            All Projects
          </Button>
          {allTechnologies.slice(0, 6).map((tech) => (
            <Button
              key={tech}
              variant={filter === tech ? "default" : "outline"}
              onClick={() => setFilter(tech)}
              className={filter === tech ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              {tech}
            </Button>
          ))}
          {filter !== "all" && !allTechnologies.slice(0, 6).includes(filter) && (
            <Button
              variant="default"
              onClick={() => setFilter("all")}
              className="bg-blue-500 hover:bg-blue-600 gap-2"
            >
              {filter}
              <X className="w-4 h-4" />
            </Button>
          )}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card 
                    className="group overflow-hidden border-0 glass hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      {project.image_url ? (
                        <motion.img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-slate-300 dark:text-slate-700">
                          {project.title[0]}
                        </div>
                      )}
                      
                      {/* Hover overlay with gradient */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-4"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.span 
                          className="text-white font-medium flex items-center gap-2"
                          initial={{ y: 10 }}
                          whileHover={{ y: 0 }}
                        >
                          <Sparkles className="w-4 h-4" />
                          Click for details
                        </motion.span>
                      </motion.div>

                      {/* Corner badge animation */}
                      {project.featured && (
                        <motion.div
                          className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        >
                          Featured
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <motion.h3 
                        className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {project.title}
                      </motion.h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 4).map((tech, i) => (
                          <motion.span
                            key={i}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No projects found with this filter
            </p>
            <Button 
              onClick={() => setFilter("all")} 
              className="mt-4"
              variant="outline"
            >
              Clear Filter
            </Button>
          </motion.div>
        )}

        {/* Project Detail Modal */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedProject.title}
                  </DialogTitle>
                </DialogHeader>
                
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {selectedProject.image_url && (
                    <motion.img
                      src={selectedProject.image_url}
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover rounded-lg"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProject.long_description || selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies?.map((tech, i) => (
                        <motion.span
                          key={i}
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {selectedProject.github_url && (
                      <motion.a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="gap-2">
                          <Github className="w-4 h-4" />
                          View Code
                        </Button>
                      </motion.a>
                    )}
                    {selectedProject.live_url && (
                      <motion.a
                        href={selectedProject.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </Button>
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}