import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  Download, ExternalLink, X, FileText, User, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, Award, Globe, Plus, Trash2, Star,
  Calendar, Code, Database, Palette, Server, GitBranch, Sparkles,
  BookOpen, Heart, Music, Camera, GamepadIcon, Utensils, Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";

// Advanced CV Generator Modal Component
const AdvancedCVGeneratorModal = ({ isOpen, onClose, profileImage }) => {
  const [cvData, setCvData] = useState({
    // Personal Information
    fullName: "Saugat Panta",
    email: "pantasaugat7@gmail.com",
    phone: "+977 984-1234567",
    location: "Kathmandu, Nepal",
    website: "saugatpanta.com",
    linkedin: "linkedin.com/in/saugatpanta",
    github: "github.com/saugatpanta",
    
    // Professional Summary
    summary: "Aspiring Full-Stack Developer currently pursuing BSc in Computer Science and Information Technology with a strong foundation in modern web technologies. Passionate about creating efficient, scalable solutions and continuously expanding my technical skills through practical projects and academic learning.",
    
    // Education - Updated with accurate grades
    education: [
      {
        degree: "Bachelor's in Computer Science and Information Technology",
        institution: "Apex College, Kathmandu",
        period: "2024 - Present",
        semester: "3rd Semester",
        grades: [
          { semester: "First Semester", gpa: "3.08" },
          { semester: "Second Semester", gpa: "3.59" }
        ],
        description: "Currently in 3rd semester, actively studying Data Structures, Algorithms, Web Technologies, Database Management, and Software Engineering. Demonstrated consistent academic improvement from 3.08 to 3.59 GPA.",
        achievements: [
          "Dean's List for Second Semester (3.59 GPA)",
          "Active member of Computer Science Club",
          "Participated in college coding workshops"
        ]
      },
      {
        degree: "+2 Science (Physical Science)",
        institution: "Reliance International Academy, Kathmandu",
        period: "2022 - 2024",
        grade: "Graduated with strong foundation in Physics and Computer Science",
        description: "Completed +2 Science with focus on Physical Science, Mathematics, and Computer Science. Developed analytical thinking and problem-solving skills through physics experiments and computer programming.",
        achievements: [
          "Completed major physics practical projects",
          "Developed basic programming skills",
          "Participated in science exhibitions"
        ]
      }
    ],
    
    // Technical Skills with proficiency
    technicalSkills: [
      { 
        category: "Frontend Development", 
        icon: "🎨",
        skills: [
          { name: "HTML5", proficiency: 90 },
          { name: "CSS3", proficiency: 85 },
          { name: "JavaScript", proficiency: 80 },
          { name: "React", proficiency: 75 },
          { name: "Tailwind CSS", proficiency: 85 }
        ]
      },
      { 
        category: "Backend Development", 
        icon: "⚙️",
        skills: [
          { name: "Node.js", proficiency: 70 },
          { name: "Python", proficiency: 75 },
          { name: "Java", proficiency: 65 }
        ]
      },
      { 
        category: "Databases", 
        icon: "💾",
        skills: [
          { name: "MySQL", proficiency: 80 },
          { name: "MongoDB", proficiency: 70 }
        ]
      },
      { 
        category: "Tools & Technologies", 
        icon: "🛠️",
        skills: [
          { name: "Git & GitHub", proficiency: 85 },
          { name: "VS Code", proficiency: 90 },
          { name: "Figma", proficiency: 70 },
          { name: "Firebase", proficiency: 75 }
        ]
      }
    ],
    
    // Projects
    projects: [
      {
        name: "Personal Portfolio Website",
        description: "Built a modern, responsive portfolio website with dark mode, smooth animations, and project showcase using React, Tailwind CSS, and Framer Motion.",
        technologies: ["React", "Tailwind CSS", "Framer Motion", "Firebase"],
        features: ["Responsive Design", "Dark/Light Mode", "Project Showcase", "Contact Form"],
        githubUrl: "https://github.com/saugatpanta/portfolio",
        achievements: [
          "Optimized performance with 95+ Lighthouse score",
          "Fully responsive across all devices",
          "Interactive animations for better user experience"
        ]
      },
      {
        name: "E-commerce Demo Application",
        description: "Developed a frontend e-commerce application with product catalog, shopping cart functionality, and user authentication.",
        technologies: ["HTML5", "CSS3", "JavaScript", "Local Storage"],
        features: ["Product Filtering", "Shopping Cart", "User Authentication", "Responsive UI"],
        githubUrl: "https://github.com/saugatpanta/ecommerce-demo",
        achievements: [
          "Implemented secure form validation",
          "Optimized image loading for better performance",
          "Cross-browser compatibility"
        ]
      },
      {
        name: "Task Management System",
        description: "Created a task management application with full CRUD operations, task categorization, and local storage persistence.",
        technologies: ["JavaScript", "CSS3", "HTML5", "Local Storage API"],
        features: ["Add/Edit/Delete Tasks", "Task Categories", "Due Date Tracking", "Search Functionality"],
        githubUrl: "https://github.com/saugatpanta/task-manager",
        achievements: [
          "Improved task organization efficiency",
          "Clean and intuitive user interface",
          "Persistent data storage"
        ]
      }
    ],
    
    // Work Experience
    experience: [
      {
        position: "Freelance Web Developer",
        company: "Self-Employed",
        period: "2023 - Present",
        location: "Kathmandu, Nepal",
        description: "Creating responsive websites and web applications for clients while ensuring code quality and timely delivery.",
        responsibilities: [
          "Developed responsive websites for local businesses",
          "Collaborated with clients to understand requirements",
          "Implemented SEO best practices",
          "Maintained and updated existing websites"
        ]
      },
      {
        position: "Programming Tutor",
        company: "Private Tutoring",
        period: "2022 - 2023",
        location: "Kathmandu, Nepal",
        description: "Provided programming guidance and mentorship to students learning web development fundamentals.",
        responsibilities: [
          "Taught HTML, CSS, JavaScript basics to students",
          "Created learning materials and practice exercises",
          "Helped students build simple portfolio projects",
          "Provided guidance on programming concepts"
        ]
      }
    ],
    
    // Certifications
    certifications: [
      {
        name: "Web Development Fundamentals",
        issuer: "Online Course Platform",
        date: "2024",
        description: "Covered HTML, CSS, JavaScript fundamentals and modern web development practices.",
        credential: "WD2024-001"
      },
      {
        name: "JavaScript Programming Course",
        issuer: "Code Academy",
        date: "2023",
        description: "Learned JavaScript concepts including ES6+, DOM manipulation, and asynchronous programming.",
        credential: "JS2023-045"
      }
    ],
    
    // Languages
    languages: [
      { language: "English", proficiency: "Fluent", level: 90 },
      { language: "Nepali", proficiency: "Native", level: 100 },
      { language: "Hindi", proficiency: "Conversational", level: 75 }
    ],
    
    // Hobbies & Interests
    hobbies: [
      {
        name: "Open Source Contribution",
        description: "Contributing to open source projects and learning from community code"
      },
      {
        name: "Technology Blogs",
        description: "Reading about new web technologies and development trends"
      },
      {
        name: "Problem Solving",
        description: "Solving coding challenges on platforms like LeetCode"
      }
    ],
    
    // Achievements & Awards
    achievements: [
      {
        title: "Academic Improvement Award",
        issuer: "Apex College",
        date: "2024",
        description: "Recognized for significant GPA improvement from 3.08 to 3.59"
      }
    ]
  });

  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [newSkill, setNewSkill] = useState({ category: "", name: "", proficiency: 70 });

  const generateModernCV = () => {
    try {
      toast.loading("Generating your professional CV...");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Modern color scheme
      const primaryColor = [59, 130, 246]; // Blue
      const secondaryColor = [139, 92, 246]; // Purple
      const accentColor = [14, 165, 233]; // Sky Blue
      const darkColor = [30, 41, 59]; // Dark Slate
      const lightColor = [248, 250, 252]; // Light Background
      const textColor = [51, 51, 51]; // Dark Gray
      const lightTextColor = [107, 114, 128]; // Gray

      // Helper functions
      const drawRoundedRect = (x, y, width, height, radius, color) => {
        pdf.setFillColor(...color);
        pdf.roundedRect(x, y, width, height, radius, radius, 'F');
      };

      const drawSectionHeader = (title, x, y) => {
        pdf.setFillColor(...primaryColor);
        pdf.roundedRect(x, y, 60, 8, 4, 4, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + 5, y + 5.5);
        return y + 15;
      };

      // Modern Header with gradient
      drawRoundedRect(0, 0, pageWidth, 80, 0, darkColor);
      
      // Name and title with modern typography
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cvData.fullName.toUpperCase(), 20, 35);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text("FULL-STACK DEVELOPER | CSIT STUDENT", 20, 45);
      
      // Contact info in modern layout
      const contactInfo = [
        { icon: "📧", text: cvData.email },
        { icon: "📱", text: cvData.phone },
        { icon: "📍", text: cvData.location },
        { icon: "🌐", text: cvData.website }
      ];

      pdf.setFontSize(9);
      contactInfo.forEach((info, index) => {
        pdf.text(`${info.icon} ${info.text}`, pageWidth - 80, 25 + (index * 5));
      });

      let yPosition = 95;

      // Professional Summary
      yPosition = drawSectionHeader("PROFILE", 20, yPosition - 10);
      pdf.setTextColor(...textColor);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(cvData.summary, pageWidth - 40);
      pdf.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 4 + 20;

      // Two-column layout
      const col1Width = pageWidth * 0.65;
      const col2Width = pageWidth * 0.35;
      let col1Y = yPosition;
      let col2Y = yPosition;

      // LEFT COLUMN - Technical Skills
      col1Y = drawSectionHeader("TECHNICAL SKILLS", 20, col1Y);
      cvData.technicalSkills.forEach(skillCategory => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...secondaryColor);
        pdf.text(`${skillCategory.icon} ${skillCategory.category}`, 20, col1Y);
        col1Y += 5;

        skillCategory.skills.forEach(skill => {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...textColor);
          pdf.text(skill.name, 20, col1Y);
          
          // Modern progress bar
          pdf.setDrawColor(229, 231, 235);
          pdf.setLineWidth(3);
          pdf.line(50, col1Y - 1, 80, col1Y - 1);
          
          const progressWidth = (30 * skill.proficiency) / 100;
          pdf.setDrawColor(...primaryColor);
          pdf.setLineWidth(3);
          pdf.line(50, col1Y - 1, 50 + progressWidth, col1Y - 1);
          
          pdf.setTextColor(...lightTextColor);
          pdf.text(`${skill.proficiency}%`, 83, col1Y);
          col1Y += 5;
        });
        col1Y += 3;
      });

      // Projects
      col1Y += 10;
      col1Y = drawSectionHeader("PROJECTS", 20, col1Y);
      cvData.projects.forEach((project, index) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text(`${project.name}`, 20, col1Y);
        col1Y += 5;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...lightTextColor);
        pdf.text(`Technologies: ${project.technologies.join(' • ')}`, 20, col1Y);
        col1Y += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textColor);
        const descLines = pdf.splitTextToSize(project.description, col1Width - 25);
        pdf.text(descLines, 20, col1Y);
        col1Y += descLines.length * 3 + 3;
        
        // Achievements
        pdf.setFontSize(7);
        pdf.setTextColor(...secondaryColor);
        project.achievements.forEach(achievement => {
          pdf.text(`• ${achievement}`, 22, col1Y);
          col1Y += 3;
        });
        
        col1Y += 8;
      });

      // Experience
      if (col1Y < pageHeight - 50) {
        col1Y = drawSectionHeader("EXPERIENCE", 20, col1Y);
        cvData.experience.forEach(exp => {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...primaryColor);
          pdf.text(exp.position, 20, col1Y);
          col1Y += 4;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...secondaryColor);
          pdf.text(`${exp.company} | ${exp.period}`, 20, col1Y);
          col1Y += 4;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...textColor);
          const descLines = pdf.splitTextToSize(exp.description, col1Width - 25);
          pdf.text(descLines, 20, col1Y);
          col1Y += descLines.length * 3 + 3;
          
          // Responsibilities
          pdf.setFontSize(7);
          pdf.setTextColor(...lightTextColor);
          exp.responsibilities.forEach(resp => {
            pdf.text(`• ${resp}`, 22, col1Y);
            col1Y += 3;
          });
          
          col1Y += 8;
        });
      }

      // RIGHT COLUMN - Education
      col2Y = drawSectionHeader("EDUCATION", col1Width + 10, col2Y);
      cvData.education.forEach(edu => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        const degreeLines = pdf.splitTextToSize(edu.degree, col2Width - 15);
        pdf.text(degreeLines, col1Width + 10, col2Y);
        col2Y += degreeLines.length * 3 + 2;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...secondaryColor);
        pdf.text(edu.institution, col1Width + 10, col2Y);
        col2Y += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...lightTextColor);
        pdf.text(`${edu.period}`, col1Width + 10, col2Y);
        col2Y += 4;
        
        // Display grades for college
        if (edu.grades) {
          edu.grades.forEach(grade => {
            pdf.text(`${grade.semester}: GPA ${grade.gpa}`, col1Width + 10, col2Y);
            col2Y += 4;
          });
        } else {
          pdf.text(edu.grade, col1Width + 10, col2Y);
          col2Y += 4;
        }
        
        pdf.setFontSize(7);
        pdf.setTextColor(...textColor);
        const descLines = pdf.splitTextToSize(edu.description, col2Width - 15);
        pdf.text(descLines, col1Width + 10, col2Y);
        col2Y += descLines.length * 3 + 3;
        
        // Achievements
        pdf.setTextColor(...secondaryColor);
        edu.achievements.forEach(achievement => {
          pdf.text(`• ${achievement}`, col1Width + 12, col2Y);
          col2Y += 3;
        });
        
        col2Y += 8;
      });

      // Languages
      col2Y += 10;
      col2Y = drawSectionHeader("LANGUAGES", col1Width + 10, col2Y);
      cvData.languages.forEach(lang => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textColor);
        pdf.text(lang.language, col1Width + 10, col2Y);
        
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(3);
        pdf.line(col1Width + 35, col2Y - 1, col1Width + 55, col2Y - 1);
        
        const progressWidth = (20 * lang.level) / 100;
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(3);
        pdf.line(col1Width + 35, col2Y - 1, col1Width + 35 + progressWidth, col2Y - 1);
        
        pdf.setTextColor(...lightTextColor);
        pdf.text(lang.proficiency, col1Width + 58, col2Y);
        col2Y += 6;
      });

      // Certifications
      col2Y += 10;
      col2Y = drawSectionHeader("CERTIFICATIONS", col1Width + 10, col2Y);
      cvData.certifications.forEach(cert => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text(cert.name, col1Width + 10, col2Y);
        col2Y += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...lightTextColor);
        pdf.text(`${cert.issuer} | ${cert.date}`, col1Width + 10, col2Y);
        col2Y += 6;
      });

      // Hobbies
      col2Y += 10;
      col2Y = drawSectionHeader("INTERESTS", col1Width + 10, col2Y);
      cvData.hobbies.forEach(hobby => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text(hobby.name, col1Width + 10, col2Y);
        col2Y += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textColor);
        const descLines = pdf.splitTextToSize(hobby.description, col2Width - 15);
        pdf.text(descLines, col1Width + 10, col2Y);
        col2Y += descLines.length * 3 + 6;
      });

      // Footer with modern design
      pdf.setFillColor(...darkColor);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Professional CV generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} • ${cvData.website} • ${cvData.email}`, 
      pageWidth / 2, pageHeight - 8, { align: 'center' });

      // Save the PDF
      pdf.save(`${cvData.fullName.replace(' ', '_')}_Modern_CV.pdf`);
      
      toast.dismiss();
      toast.success("🎉 Modern CV downloaded successfully!");
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate CV. Please try again.");
      console.error("PDF generation error:", error);
    }
  };

  const generateProfessionalCV = () => {
    try {
      toast.loading("Creating your advanced professional CV...");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Professional color scheme
      const darkBlue = [13, 71, 161];
      const mediumBlue = [25, 118, 210];
      const lightBlue = [227, 242, 253];
      const darkGray = [33, 33, 33];
      const mediumGray = [97, 97, 97];
      const lightGray = [245, 245, 245];

      // Header with professional design
      pdf.setFillColor(...darkBlue);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      // Name and title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cvData.fullName, 20, 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Full-Stack Developer & CSIT Student", 20, 21);

      let yPosition = 40;

      // Contact info sidebar
      const sidebarWidth = 60;
      pdf.setFillColor(...lightGray);
      pdf.rect(0, 25, sidebarWidth, pageHeight - 25, 'F');
      
      // Contact information in sidebar
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("CONTACT", 10, 40);
      
      const contactDetails = [
        `Email: ${cvData.email}`,
        `Phone: ${cvData.phone}`,
        `Location: ${cvData.location}`,
        `Website: ${cvData.website}`,
        `GitHub: ${cvData.github}`,
        `LinkedIn: ${cvData.linkedin}`
      ];
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      contactDetails.forEach((detail, index) => {
        const lines = pdf.splitTextToSize(detail, sidebarWidth - 15);
        lines.forEach((line, lineIndex) => {
          pdf.text(line, 10, 47 + (index * 12) + (lineIndex * 4));
        });
      });

      // Languages in sidebar
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkGray);
      pdf.text("LANGUAGES", 10, 125);
      
      pdf.setFont('helvetica', 'normal');
      cvData.languages.forEach((lang, index) => {
        pdf.setTextColor(...darkGray);
        pdf.text(lang.language, 10, 132 + (index * 6));
        pdf.setTextColor(...mediumGray);
        pdf.text(lang.proficiency, 45, 132 + (index * 6));
      });

      // Main content area
      const mainX = sidebarWidth + 10;
      const mainWidth = pageWidth - sidebarWidth - 20;

      // Professional Summary
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PROFESSIONAL SUMMARY", mainX, yPosition);
      pdf.setDrawColor(...mediumBlue);
      pdf.setLineWidth(0.5);
      pdf.line(mainX, yPosition + 2, mainX + 70, yPosition + 2);
      
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(cvData.summary, mainWidth);
      pdf.text(summaryLines, mainX, yPosition);
      yPosition += summaryLines.length * 4 + 15;

      // Technical Skills
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("TECHNICAL SKILLS", mainX, yPosition);
      pdf.line(mainX, yPosition + 2, mainX + 50, yPosition + 2);
      yPosition += 8;

      cvData.technicalSkills.forEach(skillCategory => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...mediumBlue);
        pdf.text(skillCategory.category, mainX, yPosition);
        yPosition += 5;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkGray);
        const skillsText = skillCategory.skills.map(s => `${s.name} (${s.proficiency}%)`).join(' • ');
        const skillLines = pdf.splitTextToSize(skillsText, mainWidth);
        pdf.text(skillLines, mainX, yPosition);
        yPosition += skillLines.length * 4 + 5;
      });

      yPosition += 5;

      // Professional Experience
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PROFESSIONAL EXPERIENCE", mainX, yPosition);
      pdf.line(mainX, yPosition + 2, mainX + 80, yPosition + 2);
      yPosition += 10;

      cvData.experience.forEach(exp => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...darkBlue);
        pdf.text(exp.position, mainX, yPosition);
        yPosition += 4;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...mediumBlue);
        pdf.text(`${exp.company} | ${exp.period} | ${exp.location}`, mainX, yPosition);
        yPosition += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkGray);
        const descLines = pdf.splitTextToSize(exp.description, mainWidth);
        pdf.text(descLines, mainX, yPosition);
        yPosition += descLines.length * 4 + 3;
        
        // Responsibilities
        pdf.setFontSize(8);
        pdf.setTextColor(...mediumGray);
        exp.responsibilities.forEach(resp => {
          pdf.text(`• ${resp}`, mainX + 2, yPosition);
          yPosition += 3.5;
        });
        
        yPosition += 8;
      });

      // Education (new page if needed)
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("EDUCATION", mainX, yPosition);
      pdf.line(mainX, yPosition + 2, mainX + 35, yPosition + 2);
      yPosition += 10;

      cvData.education.forEach(edu => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...darkBlue);
        pdf.text(edu.degree, mainX, yPosition);
        yPosition += 4;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...mediumBlue);
        pdf.text(`${edu.institution} | ${edu.period}`, mainX, yPosition);
        yPosition += 4;
        
        // Display grades for college
        if (edu.grades) {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...mediumGray);
          edu.grades.forEach(grade => {
            pdf.text(`${grade.semester}: GPA ${grade.gpa}`, mainX, yPosition);
            yPosition += 4;
          });
        } else {
          pdf.text(`Grade: ${edu.grade}`, mainX, yPosition);
          yPosition += 4;
        }
        
        pdf.setTextColor(...darkGray);
        const descLines = pdf.splitTextToSize(edu.description, mainWidth);
        pdf.text(descLines, mainX, yPosition);
        yPosition += descLines.length * 4 + 3;
        
        // Achievements
        pdf.setFontSize(8);
        pdf.setTextColor(...mediumBlue);
        edu.achievements.forEach(achievement => {
          pdf.text(`• ${achievement}`, mainX + 2, yPosition);
          yPosition += 3.5;
        });
        
        yPosition += 8;
      });

      // Projects
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("KEY PROJECTS", mainX, yPosition);
      pdf.line(mainX, yPosition + 2, mainX + 45, yPosition + 2);
      yPosition += 10;

      cvData.projects.forEach((project, index) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...darkBlue);
        pdf.text(`${index + 1}. ${project.name}`, mainX, yPosition);
        yPosition += 4;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkGray);
        const descLines = pdf.splitTextToSize(project.description, mainWidth);
        pdf.text(descLines, mainX, yPosition);
        yPosition += descLines.length * 4 + 3;
        
        pdf.setFontSize(8);
        pdf.setTextColor(...mediumBlue);
        pdf.text(`Technologies: ${project.technologies.join(', ')}`, mainX, yPosition);
        yPosition += 4;
        
        pdf.text(`Features: ${project.features.join(', ')}`, mainX, yPosition);
        yPosition += 6;
        
        // Achievements
        pdf.setTextColor(...mediumGray);
        project.achievements.forEach(achievement => {
          pdf.text(`• ${achievement}`, mainX + 2, yPosition);
          yPosition += 3.5;
        });
        
        yPosition += 8;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(...mediumGray);
      pdf.text(`Confidential - Generated for professional purposes on ${new Date().toLocaleDateString()} • ${cvData.website}`, 
               pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`${cvData.fullName.replace(' ', '_')}_Executive_CV.pdf`);
      
      toast.dismiss();
      toast.success("📄 Executive CV downloaded successfully!");
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate CV. Please try again.");
      console.error("PDF generation error:", error);
    }
  };

  // Simple CV Download function for the quick download button
  const generateQuickCV = () => {
    try {
      toast.loading("Generating quick CV...");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Modern quick design
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Name and title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cvData.fullName, 20, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Full-Stack Developer | CSIT Student", 20, 26);
      
      let yPosition = 45;

      // Quick contact info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.text(`📧 ${cvData.email} | 📱 ${cvData.phone} | 📍 ${cvData.location}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`🌐 ${cvData.website} | 💼 ${cvData.linkedin} | 🐙 ${cvData.github}`, 20, yPosition);
      yPosition += 12;

      // Summary
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PROFILE", 20, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(cvData.summary, pageWidth - 40);
      pdf.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 3.5 + 12;

      // Skills in two columns
      const colWidth = (pageWidth - 50) / 2;
      let leftY = yPosition;
      let rightY = yPosition;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("TECHNICAL SKILLS", 20, leftY);
      leftY += 8;

      cvData.technicalSkills.forEach(category => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${category.category}:`, 20, leftY);
        leftY += 4;
        
        pdf.setFont('helvetica', 'normal');
        const skillsText = category.skills.map(s => s.name).join(', ');
        const skillLines = pdf.splitTextToSize(skillsText, colWidth - 10);
        pdf.text(skillLines, 25, leftY);
        leftY += skillLines.length * 3.5 + 4;
      });

      // Education
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("EDUCATION", 20 + colWidth + 10, rightY);
      rightY += 8;

      cvData.education.forEach(edu => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(edu.institution, 20 + colWidth + 10, rightY);
        rightY += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${edu.degree} (${edu.period})`, 20 + colWidth + 10, rightY);
        rightY += 4;
        
        // Display grades for college
        if (edu.grades) {
          edu.grades.forEach(grade => {
            pdf.text(`${grade.semester}: GPA ${grade.gpa}`, 20 + colWidth + 10, rightY);
            rightY += 4;
          });
        } else {
          pdf.text(edu.grade, 20 + colWidth + 10, rightY);
          rightY += 4;
        }
        rightY += 4;
      });

      yPosition = Math.max(leftY, rightY) + 10;

      // Projects
      if (yPosition < pageHeight - 50) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text("PROJECTS", 20, yPosition);
        yPosition += 8;

        cvData.projects.forEach(project => {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`• ${project.name}`, 20, yPosition);
          yPosition += 4;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Tech: ${project.technologies.join(', ')}`, 25, yPosition);
          yPosition += 6;
        });
      }

      pdf.save(`${cvData.fullName.replace(' ', '_')}_Quick_CV.pdf`);
      
      toast.dismiss();
      toast.success("📄 Quick CV downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate quick CV. Please try again.");
      console.error("Quick CV generation error:", error);
    }
  };

  const handleGenerateCV = () => {
    if (activeTemplate === "modern") {
      generateModernCV();
    } else {
      generateProfessionalCV();
    }
  };

  const addSkill = () => {
    if (newSkill.category && newSkill.name) {
      const existingCategory = cvData.technicalSkills.find(cat => cat.category === newSkill.category);
      
      if (existingCategory) {
        setCvData(prev => ({
          ...prev,
          technicalSkills: prev.technicalSkills.map(cat => 
            cat.category === newSkill.category 
              ? { 
                  ...cat, 
                  skills: [...cat.skills, { 
                    name: newSkill.name, 
                    proficiency: newSkill.proficiency 
                  }]
                }
              : cat
          )
        }));
      } else {
        setCvData(prev => ({
          ...prev,
          technicalSkills: [...prev.technicalSkills, {
            category: newSkill.category,
            icon: "⭐",
            skills: [{ name: newSkill.name, proficiency: newSkill.proficiency }]
          }]
        }));
      }
      
      setNewSkill({ category: "", name: "", proficiency: 70 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Advanced CV Generator</h2>
              <p className="text-blue-100 text-sm">Create professional resumes with beautiful designs</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Template Selection */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Choose CV Template</h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                activeTemplate === "modern" 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => setActiveTemplate("modern")}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h4 className="font-semibold">Modern Design</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Clean, colorful layout with progress bars and modern styling
              </p>
            </div>
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                activeTemplate === "professional" 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => setActiveTemplate("professional")}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold">Professional Executive</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Corporate-style layout perfect for job applications and interviews
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={cvData.fullName}
                    onChange={(e) => setCvData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.email}
                    onChange={(e) => setCvData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={cvData.phone}
                    onChange={(e) => setCvData(prev => ({ ...prev, phone: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Online Presence
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={cvData.location}
                    onChange={(e) => setCvData(prev => ({ ...prev, location: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Portfolio Website</Label>
                  <Input
                    id="website"
                    value={cvData.website}
                    onChange={(e) => setCvData(prev => ({ ...prev, website: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={cvData.linkedin}
                    onChange={(e) => setCvData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
            <Textarea
              value={cvData.summary}
              onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
              rows={4}
              placeholder="Write a compelling professional summary that highlights your skills, experience, and career goals..."
              className="resize-none border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Education Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Education Details
            </h3>
            <div className="space-y-6">
              {cvData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-blue-600 dark:text-blue-400">{edu.degree}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{edu.institution} • {edu.period}</p>
                    </div>
                  </div>
                  
                  {/* Grades Display */}
                  {edu.grades ? (
                    <div className="mb-3">
                      <Label className="text-sm font-medium mb-2 block">Semester Grades</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {edu.grades.map((grade, gradeIndex) => (
                          <div key={gradeIndex} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border">
                            <span className="text-sm">{grade.semester}</span>
                            <span className="font-semibold text-blue-600">GPA {grade.gpa}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{edu.grade}</p>
                  )}
                  
                  <Textarea
                    value={edu.description}
                    onChange={(e) => {
                      const newEducation = [...cvData.education];
                      newEducation[index].description = e.target.value;
                      setCvData(prev => ({ ...prev, education: newEducation }));
                    }}
                    rows={3}
                    className="resize-none border-slate-300 dark:border-slate-600 mb-3"
                  />
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Achievements</Label>
                    <div className="space-y-2">
                      {edu.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              Technical Skills
            </h3>
            
            {/* Current Skills Display */}
            <div className="space-y-6 mb-6">
              {cvData.technicalSkills.map((skillCategory, catIndex) => (
                <div key={catIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{skillCategory.icon}</span>
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400">{skillCategory.category}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCvData(prev => ({
                        ...prev,
                        technicalSkills: prev.technicalSkills.filter((_, i) => i !== catIndex)
                      }))}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {skillCategory.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-sm">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8">{skill.proficiency}%</span>
                          <button
                            onClick={() => {
                              const newSkills = [...cvData.technicalSkills];
                              newSkills[catIndex].skills = newSkills[catIndex].skills.filter((_, i) => i !== skillIndex);
                              setCvData(prev => ({ ...prev, technicalSkills: newSkills }));
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Skill */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold mb-3 text-sm">Add New Skill</h4>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input
                    placeholder="e.g., Frontend"
                    value={newSkill.category}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                    className="text-sm border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-xs">Skill Name</Label>
                  <Input
                    placeholder="e.g., React"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-xs">Proficiency (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: parseInt(e.target.value) || 0 }))}
                    className="text-sm border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addSkill} className="w-full text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Selected: <span className="font-semibold text-blue-600">
              {activeTemplate === "modern" ? "Modern Design" : "Professional Executive"}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCV} 
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              <Download className="w-4 h-4" />
              Download {activeTemplate === "modern" ? "Modern CV" : "Executive CV"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Rest of the components (SkillBar, SkillCategory, About) remain the same...

const SkillBar = ({ skill, index }) => {
  const ref = useRef(null);
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
      className="mb-4 sm:mb-6"
    >
      <Link to={createPageUrl("Projects") + `?skill=${encodeURIComponent(skill.name)}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          className="cursor-pointer group"
        >
          <div className="flex justify-between mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors flex items-center gap-2 text-sm sm:text-base">
              {skill.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <motion.span 
              className="text-xs sm:text-sm text-slate-500 font-semibold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: index * 0.08 + 0.8, duration: 0.3 }}
            >
              {skill.proficiency}%
            </motion.span>
          </div>
          <div className="h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
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
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-white/30 to-transparent"
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
  const ref = useRef(null);
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
      <Card className="p-4 sm:p-6 glass border-0 h-full hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
        <motion.h3 
          className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ delay: index * 0.15 + 0.2, duration: 0.4 }}
        >
          {category.replace('_', ' ')}
        </motion.h3>
        <p className="text-xs text-slate-500 mb-3 sm:mb-4">Click a skill to see related projects</p>
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

  const { data: profileData } = useQuery({
    queryKey: ['profile-image'],
    queryFn: () => firebaseClient.entities.ProfileImage.get(),
    refetchOnWindowFocus: false
  });

  const [showCVModal, setShowCVModal] = useState(false);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const timeline = [
    {
      year: "2024 - Present",
      title: "BSc CSIT Student at Apex College",
      description: "Currently in 3rd semester with consistent academic performance improvement (3.08 GPA in 1st sem → 3.59 GPA in 2nd sem)"
    },
    {
      year: "2023",
      title: "Web Development Journey Begins",
      description: "Started learning HTML, CSS, and JavaScript through online courses and personal projects"
    },
    {
      year: "2022 - 2024",
      title: "+2 Science (Physical Science)",
      description: "Completed +2 Science from Reliance International Academy with focus on Physics and Computer Science"
    },
    {
      year: "2021",
      title: "First Steps in Programming",
      description: "Began exploring programming concepts and developed interest in software development"
    }
  ];

  // Simple CV generator for quick download
  const generateQuickCV = () => {
    try {
      toast.loading("Generating quick CV...");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Simple professional design
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Name and title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Saugat Panta", 20, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Full-Stack Developer | CSIT Student", 20, 28);
      
      let yPosition = 50;

      // Contact info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text("Email: pantasaugat7@gmail.com | Phone: +977 984-1234567 | Location: Kathmandu, Nepal", 20, yPosition);
      yPosition += 8;
      pdf.text("Website: saugatpanta.com | GitHub: github.com/saugatpanta", 20, yPosition);
      yPosition += 15;

      // Summary
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PROFESSIONAL SUMMARY", 20, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const summary = "Aspiring Full-Stack Developer currently pursuing BSc in Computer Science and Information Technology. Demonstrated consistent academic improvement (3.08 to 3.59 GPA) while building practical web development skills through personal projects and self-learning.";
      const summaryLines = pdf.splitTextToSize(summary, pageWidth - 40);
      pdf.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 4 + 12;

      // Skills
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("TECHNICAL SKILLS", 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(9);
      const skillsList = [
        "Frontend: HTML5, CSS3, JavaScript, React, Tailwind CSS",
        "Backend: Node.js, Python, Java",
        "Databases: MySQL, MongoDB",
        "Tools: Git, VS Code, Figma, Firebase"
      ];
      
      skillsList.forEach(skill => {
        pdf.text(skill, 20, yPosition);
        yPosition += 5;
      });

      yPosition += 8;

      // Education
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("EDUCATION", 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(9);
      const education = [
        {
          degree: "Bachelor's in Computer Science and Information Technology",
          institution: "Apex College, Kathmandu",
          period: "2024 - Present",
          grades: ["1st Semester: GPA 3.08", "2nd Semester: GPA 3.59", "3rd Semester: Currently Studying"]
        },
        {
          degree: "+2 Science (Physical Science)",
          institution: "Reliance International Academy, Kathmandu",
          period: "2022 - 2024", 
          grade: "Completed with strong foundation in Physics and Computer Science"
        }
      ];

      education.forEach(edu => {
        pdf.text(`${edu.degree}`, 20, yPosition);
        yPosition += 4;
        pdf.text(`${edu.institution} (${edu.period})`, 20, yPosition);
        yPosition += 4;
        
        if (edu.grades) {
          edu.grades.forEach(grade => {
            pdf.text(grade, 20, yPosition);
            yPosition += 4;
          });
        } else {
          pdf.text(edu.grade, 20, yPosition);
          yPosition += 4;
        }
        yPosition += 8;
      });

      pdf.save("Saugat_Panta_Quick_CV.pdf");
      
      toast.dismiss();
      toast.success("📄 Quick CV downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate quick CV. Please try again.");
      console.error("Quick CV generation error:", error);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            About <span className="gradient-text">Me</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-4">
            A passionate CSIT student and aspiring full-stack developer building innovative web solutions 
            while continuously expanding my technical skills through practical projects and academic learning.
          </p>
        </motion.div>

        {/* Bio Section */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-4 sm:p-6 lg:p-8 glass border-0 h-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Development Journey</h2>
              <div className="space-y-3 sm:space-y-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                <p>
                  Hello! I'm Saugat Panta, currently in my 3rd semester of BSc CSIT at Apex College, Kathmandu. 
                  My journey into web development started during my +2 Science years, where I first discovered 
                  my interest in programming while studying Computer Science.
                </p>
                <p>
                  What excites me most about development is the ability to bring ideas to life through code. 
                  I started with basic HTML and CSS, and have since progressed to learning React, Node.js, 
                  and database management. My academic journey has shown consistent improvement - from 3.08 GPA 
                  in my first semester to 3.59 in the second - reflecting my growing understanding and dedication 
                  to the field.
                </p>
                <p>
                  Through personal projects like my portfolio website and various web applications, I've gained 
                  practical experience in modern web technologies. I'm particularly interested in creating 
                  user-friendly interfaces and efficient backend systems that solve real problems.
                </p>
                <p>
                  When I'm not coding or studying, I enjoy exploring new technologies, contributing to open-source 
                  projects, and connecting with other developers to learn from their experiences.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  onClick={() => setShowCVModal(true)}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Professional CV
                </Button>
                <Button 
                  onClick={generateQuickCV}
                  variant="outline"
                  className="gap-2"
                  size="lg"
                >
                  <Download className="w-4 h-4" />
                  Quick Download
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-4 sm:p-6 lg:p-8 glass border-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Education Timeline
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6 sm:pl-8 pb-4 sm:pb-6 border-l-2 border-blue-500/30 last:border-0 last:pb-0"
                  >
                    <motion.div 
                      className="absolute -left-[7px] sm:-left-[9px] top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 border-2 sm:border-4 border-white dark:border-slate-900"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    />
                    <div className="text-xs sm:text-sm font-semibold text-blue-500 mb-1">{item.year}</div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{item.description}</p>
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
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Technical <span className="gradient-text">Skills</span>
            </motion.h2>
            <motion.p
              className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Click on any skill to explore related projects and see how I've applied these technologies in real-world applications
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            className="text-center py-12 sm:py-20"
          >
            <Card className="p-8 glass border-0 max-w-md mx-auto">
              <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Skills Added Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Add your technical skills through the Admin Dashboard to showcase your expertise here.
              </p>
              <Button variant="outline" size="sm">
                Go to Admin Dashboard
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Advanced CV Generator Modal */}
      <AdvancedCVGeneratorModal
        isOpen={showCVModal}
        onClose={() => setShowCVModal(false)}
        profileImage={profileData?.profileImage}
      />
    </div>
  );
}