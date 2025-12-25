import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { firebaseClient } from "@/api/firebaseClient";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Home, 
  AlertCircle, 
  Image, 
  Mail, 
  FileText, 
  Briefcase, 
  FolderGit2, 
  Zap, 
  MessageSquare,
  Settings,
  ChevronRight,
  CheckCircle
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        console.error("Auth error:", error);
        setIsAuthenticated(false);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const savedTab = localStorage.getItem('admin-active-tab');
    if (savedTab && tabConfig.find(tab => tab.value === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    await firebaseClient.auth.logout(createPageUrl("Home"));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const tabConfig = [
    { value: "profile", label: "Profile", icon: Image, mobileLabel: "Profile" },
    { value: "contact", label: "Contact", icon: Mail, mobileLabel: "Contact" },
    { value: "blog", label: "Blog", icon: FileText, mobileLabel: "Blog" },
    { value: "projects", label: "Projects", icon: FolderGit2, mobileLabel: "Projects" },
    { value: "experience", label: "Experience", icon: Briefcase, mobileLabel: "Exp" },
    { value: "skills", label: "Skills", icon: Zap, mobileLabel: "Skills" },
    { value: "messages", label: "Messages", icon: MessageSquare, mobileLabel: "Msgs" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-500 dark:border-t-blue-400 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-500 dark:border-t-blue-400 mx-auto" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            You don't have permission to access the admin panel.
          </p>
          <div className="flex flex-col gap-3">
            <Link to={createPageUrl("Home")} className="w-full">
              <Button className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                Visit Website
              </Button>
            </Link>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="gap-2 w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate">
                  Admin Dashboard
                </h1>
                {userEmail && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Active
                </span>
              </div>
              
              <Link to={createPageUrl("Home")}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                >
                  <Home className="w-4 h-4" />
                  View Site
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout} 
                className="gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
              <Link to={createPageUrl("Home")}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                  title="View Site"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout} 
                className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Dynamic padding based on screen size */}
      <div className={`${isMobile ? 'pb-16' : 'pb-0'} pt-4 px-4 sm:px-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Mobile Tabs Navigation - Only shown on mobile */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 shadow-lg">
              <div className="grid grid-cols-4 gap-1">
                {tabConfig.slice(0, 4).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "default" : "ghost"}
                    onClick={() => handleTabChange(tab.value)}
                    className={`flex flex-col items-center gap-1 py-2 h-auto rounded-lg transition-all text-xs ${
                      activeTab === tab.value 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.mobileLabel}</span>
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {tabConfig.slice(4).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "default" : "ghost"}
                    onClick={() => handleTabChange(tab.value)}
                    className={`flex flex-col items-center gap-1 py-2 h-auto rounded-lg transition-all text-xs ${
                      activeTab === tab.value 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.mobileLabel}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Tabs Navigation - Only shown on desktop */}
          {!isMobile && (
            <div className="mb-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-1">
                <div className="flex flex-wrap gap-1">
                  {tabConfig.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "ghost"}
                      onClick={() => handleTabChange(tab.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
                        activeTab === tab.value 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {activeTab === tab.value && (
                        <ChevronRight className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Content Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === "profile" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                    activeTab === "contact" ? "bg-gradient-to-br from-green-500 to-green-600" :
                    activeTab === "blog" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
                    activeTab === "projects" ? "bg-gradient-to-br from-orange-500 to-orange-600" :
                    activeTab === "experience" ? "bg-gradient-to-br from-red-500 to-red-600" :
                    activeTab === "skills" ? "bg-gradient-to-br from-yellow-500 to-yellow-600" :
                    "bg-gradient-to-br from-pink-500 to-pink-600"
                  }`}>
                    {tabConfig.find(tab => tab.value === activeTab)?.icon && 
                      React.createElement(tabConfig.find(tab => tab.value === activeTab)?.icon, {
                        className: "w-5 h-5 text-white"
                      })
                    }
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {tabConfig.find(tab => tab.value === activeTab)?.label} Manager
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Manage your {tabConfig.find(tab => tab.value === activeTab)?.label.toLowerCase()} settings
                    </p>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2 sm:ml-auto">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-3 sm:p-4 md:p-6">
              <div className="w-full overflow-x-hidden">
                {/* Responsive Content Container */}
                <div className={`${activeTab === "blog" ? 'overflow-x-auto' : 'w-full'}`}>
                  <div className={`${activeTab === "blog" ? 'min-w-[768px] md:min-w-0' : 'w-full'} overflow-visible`}>
                    {activeTab === "profile" && <ProfileManager />}
                    {activeTab === "contact" && <ContactManager />}
                    {activeTab === "blog" && <BlogManager />}
                    {activeTab === "projects" && <ProjectManager />}
                    {activeTab === "experience" && <ExperienceManager />}
                    {activeTab === "skills" && <SkillsManager />}
                    {activeTab === "messages" && <MessagesManager />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Specific Styles */}
      <style jsx>{`
        /* Ensure buttons don't overflow on mobile */
        @media (max-width: 640px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Better scroll handling */
          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
