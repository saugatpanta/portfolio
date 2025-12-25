import React, { useState, useEffect, useRef } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Home, 
  AlertCircle, 
  Image, 
  Mail, 
  Menu, 
  X, 
  FileText, 
  Briefcase, 
  FolderGit2, 
  Zap, 
  MessageSquare,
  User,
  Globe,
  Settings
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobile, setIsMobile] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Check screen size for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside - FIXED VERSION
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both menu and hamburger button
      if (mobileMenuOpen && 
          mobileMenuRef.current && 
          hamburgerRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          !hamburgerRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, isMobile]);

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

  // Update active tab based on URL or persist on refresh
  useEffect(() => {
    const savedTab = localStorage.getItem('admin-active-tab');
    if (savedTab && tabConfig.find(tab => tab.value === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    // Save active tab to localStorage
    localStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    await firebaseClient.auth.logout(createPageUrl("Home"));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const tabConfig = [
    { value: "profile", label: "Profile", icon: Image, mobileIcon: User },
    { value: "contact", label: "Contact", icon: Mail, mobileIcon: Mail },
    { value: "blog", label: "Blog", icon: FileText, mobileIcon: FileText },
    { value: "projects", label: "Projects", icon: FolderGit2, mobileIcon: FolderGit2 },
    { value: "experience", label: "Experience", icon: Briefcase, mobileIcon: Briefcase },
    { value: "skills", label: "Skills", icon: Zap, mobileIcon: Zap },
    { value: "messages", label: "Messages", icon: MessageSquare, mobileIcon: MessageSquare },
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we verify your credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-500 dark:border-t-blue-400 mx-auto" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            You don't have permission to access the admin panel. Please contact the administrator if you believe this is an error.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Home")} className="w-full sm:w-auto">
              <Button className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Globe className="w-4 h-4" />
                Visit Website
              </Button>
            </Link>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
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
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-3 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Admin
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {userEmail && (
                <div className="flex items-center gap-2 mr-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                    {userEmail.split('@')[0]}
                  </span>
                </div>
              )}
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden xl:inline">View Site</span>
                  <span className="xl:hidden">Site</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout} 
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Logout</span>
                <span className="xl:hidden">Out</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              ref={hamburgerRef}
              variant="outline"
              size="icon"
              onClick={toggleMobileMenu}
              className="lg:hidden flex-shrink-0 rounded-full h-9 w-9 relative"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  {userEmail && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-gray-900" />
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            ref={mobileMenuRef}
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto transform transition-transform duration-200 ease-out"
            style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}
          >
            <div className="p-6">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">Menu</h2>
                    {userEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Sections
                </h3>
                {tabConfig.map((tab) => (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "secondary" : "ghost"}
                    onClick={() => handleTabChange(tab.value)}
                    className="w-full justify-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg"
                  >
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.value && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Link 
                  to={createPageUrl("Home")} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="gap-3 w-full justify-start">
                    <Home className="w-4 h-4" />
                    View Live Site
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }} 
                  className="gap-3 w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
            {/* Sidebar for extra large screens */}
            <div className="hidden xl:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Tabs Navigation */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Navigation</h3>
                  <nav className="space-y-1">
                    {tabConfig.map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "secondary" : "ghost"}
                        onClick={() => handleTabChange(tab.value)}
                        className="w-full justify-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg"
                      >
                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{tab.label}</span>
                        {activeTab === tab.value && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </Button>
                    ))}
                  </nav>
                </div>
                
                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Session</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
                      <span className="text-sm text-gray-900 dark:text-gray-300 truncate max-w-[120px]">
                        {userEmail.split('@')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Tabs for Large screens (not xl) */}
              <div className="hidden lg:block xl:hidden mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-1">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    {tabConfig.map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "ghost"}
                        onClick={() => handleTabChange(tab.value)}
                        className="flex items-center gap-2 px-4 py-3 whitespace-nowrap rounded-lg mx-1"
                      >
                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{tab.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs for Mobile and Tablet */}
              <div className="lg:hidden mb-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-2">
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    {tabConfig.slice(0, 4).map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTabChange(tab.value)}
                        className="h-11 flex flex-col items-center justify-center gap-1 hover:scale-[1.02] transition-transform rounded-lg"
                      >
                        <tab.mobileIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate w-full px-1">{tab.label}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {tabConfig.slice(4).map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTabChange(tab.value)}
                        className="h-11 flex flex-col items-center justify-center gap-1 hover:scale-[1.02] transition-transform rounded-lg"
                      >
                        <tab.mobileIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate w-full px-1">{tab.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Card with proper overflow handling */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 min-h-[calc(100vh-180px)]">
                  <div className="w-full max-w-full overflow-hidden">
                    <div className={`w-full ${activeTab === "blog" ? 'overflow-x-auto' : ''}`}>
                      <div className={activeTab === "blog" ? 'min-w-[768px] lg:min-w-0' : ''}>
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

              {/* Mobile Bottom Actions */}
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                      {userEmail.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl("Home")}>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        <Home className="w-3 h-3" />
                        <span>Site</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="h-8 gap-1 text-xs"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 1024px) {
          .min-h-\[calc\(100vh-180px\)\] {
            min-height: calc(100vh - 180px);
          }
        }
      `}</style>
    </div>
  );
}
