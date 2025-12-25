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
    <div className="min-h-screen py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            My <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
            A collection of my work showcasing various technologies and problem-solving approaches
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`text-xs sm:text-sm ${filter === "all" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            size="sm"
          >
            All Projects
          </Button>
          {allTechnologies.slice(0, 6).map((tech) => (
            <Button
              key={tech}
              variant={filter === tech ? "default" : "outline"}
              onClick={() => setFilter(tech)}
              className={`text-xs sm:text-sm ${filter === tech ? "bg-blue-500 hover:bg-blue-600" : ""}`}
              size="sm"
            >
              {tech}
            </Button>
          ))}
          {filter !== "all" && !allTechnologies.slice(0, 6).includes(filter) && (
            <Button
              variant="default"
              onClick={() => setFilter("all")}
              className="bg-blue-500 hover:bg-blue-600 gap-2 text-xs sm:text-sm"
              size="sm"
            >
              {filter}
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full"
                >
                  <Card 
                    className="group overflow-hidden border-0 glass hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      {project.image_url ? (
                        <motion.img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-300 dark:text-slate-700">
                          {project.title[0]}
                        </div>
                      )}
                      
                      {/* Hover overlay with gradient */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-2 sm:pb-4"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.span 
                          className="text-white font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                          initial={{ y: 5 }}
                          whileHover={{ y: 0 }}
                        >
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                          Click for details
                        </motion.span>
                      </motion.div>

                      {/* Corner badge animation */}
                      {project.featured && (
                        <motion.div
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        >
                          Featured
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <motion.h3 
                        className="text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {project.title}
                      </motion.h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {project.technologies?.slice(0, 4).map((tech, i) => (
                          <motion.span
                            key={i}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"
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
            className="text-center py-12 sm:py-16 md:py-20"
          >
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              No projects found with this filter
            </p>
            <Button 
              onClick={() => setFilter("all")} 
              className="mt-4"
              variant="outline"
              size="sm"
            >
              Clear Filter
            </Button>
          </motion.div>
        )}

        {/* Project Detail Modal */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-3xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
                    {selectedProject.title}
                  </DialogTitle>
                </DialogHeader>
                
                <motion.div 
                  className="space-y-4 sm:space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {selectedProject.image_url && (
                    <motion.img
                      src={selectedProject.image_url}
                      alt={selectedProject.title}
                      className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Description</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      {selectedProject.long_description || selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies?.map((tech, i) => (
                        <motion.span
                          key={i}
                          className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500"
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

                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedProject.github_url && (
                      <motion.a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto"
                      >
                        <Button className="gap-2 w-full sm:w-auto">
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
                        className="w-full sm:w-auto"
                      >
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
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