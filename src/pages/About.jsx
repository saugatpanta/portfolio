import React from "react";
import { motion, useInView } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SkillBar = ({ skill, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ 
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="mb-6"
    >
      <Link to={createPageUrl("Projects") + `?skill=${encodeURIComponent(skill.name)}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          className="cursor-pointer group"
        >
          <div className="flex justify-between mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors flex items-center gap-2">
              {skill.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <motion.span 
              className="text-sm text-slate-500 font-semibold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: index * 0.08 + 0.8, duration: 0.3 }}
            >
              {skill.proficiency}%
            </motion.span>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
            {/* Background shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={isInView ? { x: "200%" } : { x: "-100%" }}
              transition={{
                delay: index * 0.08 + 0.2,
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
            
            {/* Animated proficiency bar */}
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full relative overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={isInView ? { 
                width: `${skill.proficiency}%`,
                opacity: 1
              } : { 
                width: 0,
                opacity: 0
              }}
              transition={{ 
                delay: index * 0.08 + 0.3,
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            >
              {/* Glossy effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              
              {/* Animated glow */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                transition={{
                  delay: index * 0.08 + 1.2,
                  duration: 0.8,
                  ease: "easeOut"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const SkillCategory = ({ category, categorySkills, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        scale: 1
      } : { 
        opacity: 0, 
        y: 30,
        scale: 0.95
      }}
      transition={{ 
        delay: index * 0.15,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Card className="p-6 glass border-0 h-full hover:shadow-xl transition-shadow duration-300">
        <motion.h3 
          className="text-xl font-bold mb-6 capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ delay: index * 0.15 + 0.2, duration: 0.4 }}
        >
          {category.replace('_', ' ')}
        </motion.h3>
        <p className="text-xs text-slate-500 mb-4">Click a skill to see related projects</p>
        {categorySkills.map((skill, i) => (
          <SkillBar key={skill.id} skill={skill} index={i} />
        ))}
      </Card>
    </motion.div>
  );
};

export default function About() {
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => firebaseClient.entities.Skill.list('-order'),
  });

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const timeline = [
    {
      year: "2024",
      title: "Senior Full-Stack Developer",
      description: "Leading development of enterprise applications with modern tech stack"
    },
    {
      year: "2022",
      title: "Full-Stack Developer",
      description: "Built scalable web applications and RESTful APIs"
    },
    {
      year: "2020",
      title: "Frontend Developer",
      description: "Created responsive, pixel-perfect user interfaces"
    },
    {
      year: "2018",
      title: "Started Journey",
      description: "Began learning web development and fell in love with coding"
    }
  ];

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="gradient-text">Me</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            I'm a passionate developer with expertise in building modern web applications.
            I love turning complex problems into simple, beautiful, and intuitive solutions.
          </p>
        </motion.div>

        {/* Bio Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 glass border-0">
              <h2 className="text-2xl font-bold mb-6">My Story</h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  I started my journey in web development back in 2018, and it's been an incredible
                  ride ever since. What began as curiosity turned into a deep passion for creating
                  digital experiences that matter.
                </p>
                <p>
                  Over the years, I've had the privilege of working on diverse projects, from
                  startups to enterprise applications. Each project taught me something valuable
                  about code, design, and the importance of user-centric thinking.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring new technologies, contributing to
                  open-source projects, or sharing knowledge with the developer community.
                </p>
              </div>
              <Button className="mt-6 gap-2 bg-blue-500 hover:bg-blue-600">
                <Download className="w-4 h-4" />
                Download Resume
              </Button>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 glass border-0">
              <h2 className="text-2xl font-bold mb-6">Journey Timeline</h2>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-6 border-l-2 border-blue-500/30 last:border-0 last:pb-0"
                  >
                    <motion.div 
                      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    />
                    <div className="text-sm font-semibold text-blue-500 mb-1">{item.year}</div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Technical <span className="gradient-text">Skills</span>
            </motion.h2>
            <motion.p
              className="text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Click on any skill to see related projects
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(groupedSkills).map(([category, categorySkills], index) => (
              <SkillCategory
                key={category}
                category={category}
                categorySkills={categorySkills}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Empty state if no skills */}
        {skills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No skills added yet. Add some from the Admin Dashboard!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}