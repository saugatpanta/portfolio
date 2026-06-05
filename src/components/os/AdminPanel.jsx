import React, { useState, useEffect, useCallback } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, Settings, Image, Mail, FileText,
  Briefcase, FolderGit2, Zap, MessageSquare, Lock,
  ChevronRight, User, Loader2, Volume2
} from 'lucide-react';

// Admin managers
import ProfileManager from '@/components/admin/ProfileManager';
import ContactManager from '@/components/admin/ContactManager';
import BlogManager from '@/components/admin/BlogManager';
import ProjectManager from '@/components/admin/ProjectManager';
import ExperienceManager from '@/components/admin/ExperienceManager';
import SkillsManager from '@/components/admin/SkillsManager';
import MessagesManager from '@/components/admin/MessagesManager';
import SecurityManager from '@/components/admin/SecurityManager';
import SoundsManager from '@/components/admin/SoundsManager';
import WallpapersManager from '@/components/admin/WallpapersManager';

const tabs = [
  { id: 'profile', label: 'Profile', icon: Image, color: '#3b82f6', component: ProfileManager },
  { id: 'contact', label: 'Contact', icon: Mail, color: '#10b981', component: ContactManager },
  { id: 'blog', label: 'Blog', icon: FileText, color: '#8b5cf6', component: BlogManager },
  { id: 'projects', label: 'Projects', icon: FolderGit2, color: '#f59e0b', component: ProjectManager },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: '#ef4444', component: ExperienceManager },
  { id: 'skills', label: 'Skills', icon: Zap, color: '#eab308', component: SkillsManager },
  { id: 'wallpapers', label: 'Wallpapers', icon: Image, color: '#a855f7', component: WallpapersManager },
  { id: 'sounds', label: 'Sounds', icon: Volume2, color: '#06b6d4', component: SoundsManager },
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: '#ec4899', component: MessagesManager },
  { id: 'security', label: 'Security', icon: Shield, color: '#f97316', component: SecurityManager },
];

/**
 * AdminPanel — Firebase-authenticated admin inside AeroWindow.
 * Shows Google login → then sidebar + manager tabs.
 */
export default function AdminPanel() {
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'unauthenticated' | 'denied' | 'authenticated'
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const check = async () => {
      try {
        const isAuthed = await firebaseClient.auth.isAuthenticated();
        if (isAuthed) {
          const user = firebaseClient.auth.getCurrentUser();
          setUserEmail(user?.email || '');
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } catch {
        setAuthState('unauthenticated');
      }
    };
    check();
  }, []);

  // Restore saved tab
  useEffect(() => {
    const saved = localStorage.getItem('admin-active-tab');
    if (saved && tabs.find((t) => t.id === saved)) setActiveTab(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  const handleLogin = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      // signInWithPopup — no redirect, stays in the window
      const success = await firebaseClient.auth.redirectToLogin();
      if (success) {
        const user = firebaseClient.auth.getCurrentUser();
        setUserEmail(user?.email || '');
        setAuthState('authenticated');
      } else {
        setAuthState('denied');
      }
    } catch {
      setAuthState('unauthenticated');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await firebaseClient.auth.logout();
    setAuthState('unauthenticated');
    setUserEmail('');
  }, []);

  // ── Loading state ──
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center h-full bg-[#0e1525]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-2 border-blue-900/50 border-t-blue-400 animate-spin" />
          <p className="text-white/50 text-sm">Checking authorization...</p>
        </motion.div>
      </div>
    );
  }

  // ── Login screen ──
  if (authState === 'unauthenticated' || authState === 'denied') {
    return (
      <div className="flex items-center justify-center h-full bg-[#0e1525]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col items-center gap-6 p-10 rounded-2xl max-w-sm w-full"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Shield icon */}
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
            animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.1)', '0 0 40px rgba(59,130,246,0.2)', '0 0 20px rgba(59,130,246,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Lock className="w-8 h-8 text-blue-400" />
          </motion.div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-white/90 mb-1">Admin Panel</h2>
            <p className="text-sm text-white/40">
              Sign in with Google to manage your portfolio
            </p>
          </div>

          {authState === 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-3 rounded-lg text-xs text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Access denied. Only authorized administrators can sign in.
            </motion.div>
          )}

          <motion.button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #4285f4, #3367d6)',
              boxShadow: '0 4px 15px rgba(66,133,244,0.3)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 6px 25px rgba(66,133,244,0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoggingIn ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {/* Google G icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Authenticated admin dashboard ──
  const activeTabConfig = tabs.find((t) => t.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="flex h-full bg-[#0e1525]">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
        style={{
          width: 'clamp(180px, 18%, 280px)',
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* User info */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/80 font-medium truncate">{userEmail || 'Admin'}</p>
              <p className="text-[10px] text-white/30">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex-1 py-2 px-1.5 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: `${tab.color}20` }}
              >
                <tab.icon size={12} style={{ color: tab.color }} />
              </div>
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight size={12} className="ml-auto text-white/30" />
              )}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-3 border-b" style={{ background: 'rgba(14,21,37,0.9)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-2">
            {activeTabConfig && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${activeTabConfig.color}20` }}>
                <activeTabConfig.icon size={14} style={{ color: activeTabConfig.color }} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-white/90">{activeTabConfig?.label} Manager</h2>
              <p className="text-[10px] text-white/30">Manage {activeTabConfig?.label.toLowerCase()} settings</p>
            </div>
          </div>
        </div>

        {/* Manager content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6"
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
