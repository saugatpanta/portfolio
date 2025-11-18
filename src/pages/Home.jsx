import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Github, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const { data: projects = [] } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => firebaseClient.entities.Project.filter({ featured: true }, '-order', 3),
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile-image'],
    queryFn: () => firebaseClient.entities.ProfileImage.get(),
    refetchOnWindowFocus: false
  });

  const [displayText, setDisplayText] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fullText = "Full-Stack Developer";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Reset image states when profile data changes
  useEffect(() => {
    if (profileData?.profileImage) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [profileData?.profileImage]);

  // Get optimized profile image URL
  const getProfileImageUrl = () => {
    if (!profileData?.profileImage) return null;
    
    // If it's a Cloudinary URL, optimize it
    if (profileData.profileImage.includes('cloudinary.com')) {
      return firebaseClient.storage.getOptimizedImage(profileData.profileImage, {
        width: 400,
        height: 400,
        quality: 'auto',
        crop: 'fill',
        gravity: 'face' // Focus on faces if detected
      });
    }
    
    // Return original URL for non-Cloudinary images
    return profileData.profileImage;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Animated Background */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-20 left-4 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-4 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Text Content */}
          <motion.div
            style={{ opacity }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Available for opportunities</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6"
            >
              Hi, I'm <span className="gradient-text block sm:inline">Saugat Panta</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 text-slate-600 dark:text-slate-400 h-10 sm:h-12 md:h-14"
            >
              {displayText}
              <span className="animate-pulse">|</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0"
            >
              I craft beautiful, performant web applications with modern technologies.
              Passionate about clean code and exceptional user experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <Link to={createPageUrl("Projects")}>
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 gap-2 group w-full sm:w-auto">
                  View My Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  Get In Touch
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
            className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0"
          >
            <div className="relative">
              {/* Floating background elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity }
                }}
                className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
              />
              
              {/* Main profile image container */}
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg"
                />
                
                {/* Profile image */}
                <motion.div
                  whileHover={{ 
                    boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)"
                  }}
                  className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Saugat Panta"
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => {
                        console.log('Profile image loaded successfully');
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={(e) => {
                        console.error('Profile image failed to load:', profileImageUrl);
                        setImageError(true);
                        setImageLoaded(false);
                      }}
                    />
                  ) : (
                    // Fallback to local image when no profile image is set
                    <img
                      src="/saugat-profile.jpg"
                      alt="Saugat Panta"
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => {
                        console.log('Fallback image loaded successfully');
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={(e) => {
                        console.error('Fallback image also failed to load');
                        setImageError(true);
                        setImageLoaded(false);
                      }}
                    />
                  )}
                  
                  {/* Fallback initial avatar - only show if both images fail to load */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                      SP
                    </div>
                  )}

                  {/* Loading indicator */}
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </motion.div>

                {/* Floating tech badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg"
                >
                  React
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 px-2 sm:px-3 py-1 bg-green-500 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg"
                >
                  Node.js
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="absolute top-1/2 -left-6 sm:-left-8 px-2 sm:px-3 py-1 bg-purple-500 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg"
                >
                  Full Stack
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-slate-300 dark:border-slate-700 rounded-full p-1">
            <div className="w-1.5 h-3 bg-slate-400 dark:bg-slate-600 rounded-full mx-auto" />
          </div>
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
              Some of my recent work that I'm proud of
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <Card className="group overflow-hidden border-0 glass hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    {project.image_url && (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {project.technologies?.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                          Code
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-600 dark:text-slate-400">
                No featured projects yet. Add some from the Admin Dashboard!
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline" size="lg" className="gap-2 group">
                View All Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}