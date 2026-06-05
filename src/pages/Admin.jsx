import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  CheckCircle,
  Shield,
  Activity,
  Database,
  Sparkles
} from "lucide-react";
import gsap from "gsap";

import ProjectManager from "../components/admin/ProjectManager";
import ExperienceManager from "../components/admin/ExperienceManager";
import SkillsManager from "../components/admin/SkillsManager";
import MessagesManager from "../components/admin/MessagesManager";
import BlogManager from "../components/admin/BlogManager";
import ProfileManager from "../components/admin/ProfileManager";
import ContactManager from "../components/admin/ContactManager";
import SecurityManager from "../components/admin/SecurityManager";

/**
 * Standalone Admin page for direct /admin URL access.
 * When accessed inside the OS environment, the SettingsWindow component
 * handles rendering the admin managers instead.
 */
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState("profile");
  const adminRootRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await firebaseClient.auth.isAuthenticated();
        if (!authed) {
          setLoading(false);
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

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAllowed || !adminRootRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('[data-admin-hero]', {
        opacity: 0,
        y: -24,
        filter: 'blur(12px)',
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-admin-stat]', {
        opacity: 0,
        y: 26,
        rotateX: -12,
        transformPerspective: 900,
        stagger: 0.08,
        duration: 0.75,
        ease: 'back.out(1.6)',
      });

      gsap.from('[data-admin-nav-item]', {
        opacity: 0,
        x: -22,
        stagger: 0.035,
        duration: 0.45,
        ease: 'power2.out',
      });

      gsap.to('[data-admin-orb]', {
        x: 'random(-24, 24)',
        y: 'random(-18, 18)',
        scale: 'random(0.92, 1.08)',
        repeat: -1,
        yoyo: true,
        duration: 'random(4, 6)',
        ease: 'sine.inOut',
        stagger: 0.2,
      });
    }, adminRootRef);

    return () => ctx.revert();
  }, [isAuthenticated, isAllowed]);

  useEffect(() => {
    if (!contentRef.current || !isAuthenticated || !isAllowed) return undefined;
    const tween = gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 18, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' },
    );
    return () => tween.kill();
  }, [activeTab, isAuthenticated, isAllowed]);

  const handleLogout = async () => {
    await firebaseClient.auth.logout();
    setIsAuthenticated(false);
    setIsAllowed(false);
    setUserEmail('');
  };

  const tabConfig = [
    { value: "profile", label: "Profile", icon: Image, color: '#3b82f6' },
    { value: "contact", label: "Contact", icon: Mail, color: '#10b981' },
    { value: "blog", label: "Blog", icon: FileText, color: '#8b5cf6' },
    { value: "projects", label: "Projects", icon: FolderGit2, color: '#f59e0b' },
    { value: "experience", label: "Experience", icon: Briefcase, color: '#ef4444' },
    { value: "skills", label: "Skills", icon: Zap, color: '#eab308' },
    { value: "messages", label: "Messages", icon: MessageSquare, color: '#ec4899' },
    { value: "security", label: "Security", icon: Shield, color: '#f97316' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-900/50 border-t-blue-400 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white/60 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleAdminLogin = async () => {
      const success = await firebaseClient.auth.redirectToLogin();
      if (success) {
        const user = firebaseClient.auth.getCurrentUser();
        setUserEmail(user?.email || '');
        setIsAuthenticated(true);
        setIsAllowed(true);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center space-y-6 max-w-sm w-full p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/90 mb-1">Admin Panel</h2>
            <p className="text-sm text-white/40">Sign in with Google to manage your portfolio</p>
          </div>
          <button
            onClick={handleAdminLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #4285f4, #3367d6)', boxShadow: '0 4px 15px rgba(66,133,244,0.3)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <Link to="/" className="block">
            <button className="w-full py-2 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors">
              ← Back to Portfolio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white/90 mb-3">
            Access Restricted
          </h1>
          <p className="text-white/50 mb-6 text-sm">
            You don't have permission to access the admin panel.
          </p>
          <div className="flex flex-col gap-3">
            <Link to={createPageUrl("Home")} className="w-full">
              <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                Visit Website
              </Button>
            </Link>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="gap-2 w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={adminRootRef} className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(ellipse_at_85%_14%,rgba(168,85,247,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px] opacity-20" />
      <div data-admin-orb className="pointer-events-none absolute -top-24 left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div data-admin-orb className="pointer-events-none absolute right-6 top-28 h-80 w-80 rounded-full bg-fuchsia-500/14 blur-3xl" />
      {/* Header */}
      <div data-admin-hero className="sticky top-0 z-40 border-b border-white/10 bg-[#07101f]/75 px-4 py-3 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 via-cyan-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/30">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white/90">
                  Settings
                </h1>
                {userEmail && (
                  <p className="text-xs text-white/40">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-medium text-green-400">Active</span>
              </div>
              
              <Link to={createPageUrl("Home")}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Home className="w-4 h-4" />
                  View Site
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout} 
                className="gap-2 border-white/10 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div data-admin-hero className="relative z-10 mx-auto max-w-7xl px-4 pt-6">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {[
            { label: 'Firebase Status', value: 'Connected', icon: Database, color: '#38bdf8' },
            { label: 'Admin Session', value: 'Secure', icon: Shield, color: '#22c55e' },
            { label: 'Live Modules', value: String(tabConfig.length), icon: Activity, color: '#a78bfa' },
          ].map((stat) => (
            <div
              key={stat.label}
              data-admin-stat
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/40">{stat.label}</div>
                  <div className="mt-2 text-xl font-semibold text-white">{stat.value}</div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex min-h-[calc(100vh-190px)] rounded-t-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl">
        {/* Sidebar */}
        <div className="w-56 min-w-56 border-r border-white/10 py-4 px-2 hidden md:block">
          {tabConfig.map((tab) => (
            <button
              key={tab.value}
              data-admin-nav-item
              onClick={() => setActiveTab(tab.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all text-sm ${
                activeTab === tab.value
                  ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${tab.color}15` }}
              >
                <tab.icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
              </div>
              <span>{tab.label}</span>
              {activeTab === tab.value && (
                <ChevronRight className="w-3 h-3 ml-auto text-blue-400/50" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/5 p-2">
          <div className="flex justify-around">
            {tabConfig.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  activeTab === tab.value
                    ? 'text-blue-400'
                    : 'text-white/40'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Content Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `${tabConfig.find(t => t.value === activeTab)?.color}15` }}
              >
                {tabConfig.find(t => t.value === activeTab)?.icon && 
                  React.createElement(tabConfig.find(t => t.value === activeTab)?.icon, {
                    className: "w-4.5 h-4.5",
                    style: { color: tabConfig.find(t => t.value === activeTab)?.color }
                  })
                }
              </div>
              <div>
                <h2 className="text-base font-semibold text-white/90">
                  {tabConfig.find(t => t.value === activeTab)?.label} Manager
                </h2>
                <p className="text-xs text-white/40">
                  Manage your {tabConfig.find(t => t.value === activeTab)?.label.toLowerCase()} settings
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/45">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                GSAP enhanced workspace
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Manager Content */}
          <div ref={contentRef} className="p-4 md:p-6 os-settings-content">
            {activeTab === "profile" && <ProfileManager />}
            {activeTab === "contact" && <ContactManager />}
            {activeTab === "blog" && <BlogManager />}
            {activeTab === "projects" && <ProjectManager />}
            {activeTab === "experience" && <ExperienceManager />}
            {activeTab === "skills" && <SkillsManager />}
            {activeTab === "messages" && <MessagesManager />}
            {activeTab === "security" && <SecurityManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
