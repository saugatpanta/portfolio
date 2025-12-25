import React, { useState, useEffect } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home, AlertCircle, Image, Mail, Menu, X, FileText, Briefcase, FolderGit2, Zap, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ProjectManager from "../components/admin/ProjectManager";
import ExperienceManager from "../components/admin/ExperienceManager";
import SkillsManager from "../components/admin/SkillsManager";
import MessagesManager from "../components/admin/MessagesManager";
import BlogManager from "../components/admin/BlogManager";
import ProfileManager from "../components/admin/ProfileManager";
import ContactManager from "../components/admin/ContactManager";

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await firebaseClient.auth.isAuthenticated();
        if (!authed) {
          firebaseClient.auth.redirectToLogin(createPageUrl("Admin"));
          return;
        }
        
        setIsAuthenticated(true);
        setIsAllowed(true);
        const user = firebaseClient.auth.getCurrentUser();
        if (user && user.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    // Close mobile menu when switching tabs on mobile
    if (mobileMenuOpen && window.innerWidth < 640) {
      setMobileMenuOpen(false);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await firebaseClient.auth.logout(createPageUrl("Home"));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this admin panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Return to Site
            </Button>
            <Link to={createPageUrl("Home")} className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <Home className="w-4 h-4" />
                Home Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between sm:block">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Manage your portfolio content
                </p>
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden flex-shrink-0"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
            
            {userEmail && (
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 truncate">
                <span className="font-medium">Logged in as:</span> {userEmail}
              </p>
            )}
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden sm:flex gap-2 md:gap-3 flex-shrink-0">
            <Link to={createPageUrl("Home")}>
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">View Site</span>
                <span className="md:hidden">Site</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
              <span className="md:hidden">Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Buttons (when menu is open) */}
        {mobileMenuOpen && (
          <div className="sm:hidden flex flex-col gap-2 mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <Link to={createPageUrl("Home")} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="gap-2 w-full justify-start">
                <Home className="w-4 h-4" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }} 
              className="gap-2 w-full justify-start"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden relative">
            <select 
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="profile">📷 Profile Settings</option>
              <option value="contact">✉️ Contact Info</option>
              <option value="blog">📝 Blog Posts</option>
              <option value="projects">💼 Projects</option>
              <option value="experience">🏢 Experience</option>
              <option value="skills">⚡ Skills</option>
              <option value="messages">💬 Messages</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden sm:grid sm:grid-cols-4 lg:flex lg:flex-wrap lg:gap-1 xl:gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <Image className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Contact</span>
            </TabsTrigger>
            <TabsTrigger 
              value="blog" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Blog</span>
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <FolderGit2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Projects</span>
            </TabsTrigger>
            <TabsTrigger 
              value="experience" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Experience</span>
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Skills</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm rounded"
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <TabsContent value="profile" className="mt-0">
              <div className="p-4 sm:p-6">
                <ProfileManager />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <div className="p-4 sm:p-6">
                <ContactManager />
              </div>
            </TabsContent>

            <TabsContent value="blog" className="mt-0">
              <div className="p-4 sm:p-6">
                <BlogManager />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <div className="p-4 sm:p-6">
                <ProjectManager />
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-0">
              <div className="p-4 sm:p-6">
                <ExperienceManager />
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              <div className="p-4 sm:p-6">
                <SkillsManager />
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="p-4 sm:p-6">
                <MessagesManager />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}