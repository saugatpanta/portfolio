import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useWindowManager } from './WindowManager';
import {
  X, Minus, Square, Settings, Image, Mail, FileText,
  FolderGit2, Briefcase, Zap, MessageSquare, ChevronRight, LogOut, Home, Shield
} from 'lucide-react';

// Admin manager components
import ProfileManager from '@/components/admin/ProfileManager';
import ContactManager from '@/components/admin/ContactManager';
import BlogManager from '@/components/admin/BlogManager';
import ProjectManager from '@/components/admin/ProjectManager';
import ExperienceManager from '@/components/admin/ExperienceManager';
import SkillsManager from '@/components/admin/SkillsManager';
import MessagesManager from '@/components/admin/MessagesManager';
import SecurityManager from '@/components/admin/SecurityManager';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: Image, color: '#3b82f6' },
  { id: 'contact', label: 'Contact', icon: Mail, color: '#10b981' },
  { id: 'blog', label: 'Blog', icon: FileText, color: '#8b5cf6' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, color: '#f59e0b' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: '#ef4444' },
  { id: 'skills', label: 'Skills', icon: Zap, color: '#eab308' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: '#ec4899' },
  { id: 'security', label: 'Security', icon: Shield, color: '#f97316' },
];

const tabComponents = {
  profile: ProfileManager,
  contact: ContactManager,
  blog: BlogManager,
  projects: ProjectManager,
  experience: ExperienceManager,
  skills: SkillsManager,
  messages: MessagesManager,
  security: SecurityManager,
};

export default function SettingsWindow({ windowData, onLogout, onViewSite }) {
  const {
    closeWindow, minimizeWindow, maximizeWindow,
    focusWindow, updateWindowPosition
  } = useWindowManager();

  const windowRef = useRef(null);
  const contentRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('profile');
  const [isClosing, setIsClosing] = useState(false);

  const { id, position, size, zIndex, minimized, maximized } = windowData;

  // Load saved tab
  useEffect(() => {
    const saved = localStorage.getItem('admin-active-tab');
    if (saved && settingsTabs.find(t => t.id === saved)) {
      setActiveTab(saved);
    }
  }, []);

  // Save active tab
  useEffect(() => {
    localStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  // Animate open
  useEffect(() => {
    if (windowRef.current && !minimized) {
      gsap.fromTo(windowRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  // Minimize animation
  useEffect(() => {
    if (!windowRef.current) return;
    if (minimized) {
      gsap.to(windowRef.current, {
        scale: 0, opacity: 0, y: 100,
        duration: 0.3, ease: 'power2.in',
      });
    } else {
      gsap.to(windowRef.current, {
        scale: 1, opacity: 1, y: 0,
        duration: 0.3, ease: 'back.out(1.2)',
      });
    }
  }, [minimized]);

  // Close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    gsap.to(windowRef.current, {
      scale: 0.85, opacity: 0,
      duration: 0.25, ease: 'power2.in',
      onComplete: () => closeWindow(id),
    });
  }, [closeWindow, id]);

  // Tab change animation
  const handleTabChange = useCallback((tabId) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0, x: 20,
        duration: 0.15,
        onComplete: () => {
          setActiveTab(tabId);
          gsap.fromTo(contentRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
          );
        }
      });
    } else {
      setActiveTab(tabId);
    }
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    if (maximized) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    focusWindow(id);

    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = Math.max(0, e.clientY - dragStart.current.y);
      gsap.set(windowRef.current, { x: newX, y: newY });
    };

    const handleDragEnd = (e) => {
      isDragging.current = false;
      const newX = e.clientX - dragStart.current.x;
      const newY = Math.max(0, e.clientY - dragStart.current.y);
      updateWindowPosition(id, { x: newX, y: newY });
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }, [id, position, maximized, focusWindow, updateWindowPosition]);

  if (isClosing) return null;

  const ActiveComponent = tabComponents[activeTab];
  const activeTabConfig = settingsTabs.find(t => t.id === activeTab);

  const windowStyle = maximized ? {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: 'calc(100vh - 48px)',
    zIndex,
  } : {
    position: 'absolute',
    left: 0, top: 0,
    width: size.width,
    height: size.height,
    zIndex,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div
      ref={windowRef}
      className="os-window focused"
      style={{ ...windowStyle, transformStyle: 'preserve-3d' }}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div
        className="os-titlebar"
        onMouseDown={handleDragStart}
        onDoubleClick={() => maximizeWindow(id)}
      >
        <div className="flex items-center gap-2 flex-1">
          <Settings className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/80 font-medium">Settings</span>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <span className="text-xs text-white/60">{activeTabConfig?.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="os-titlebar-btn os-btn-minimize"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
          />
          <button
            className="os-titlebar-btn os-btn-maximize"
            onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
          />
          <button
            className="os-titlebar-btn os-btn-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
          />
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex" style={{ height: `calc(100% - 36px)` }}>
        {/* Sidebar */}
        <div className="os-settings-sidebar os-glass-light py-3 flex flex-col">
          {/* User Info */}
          <div className="px-4 pb-3 mb-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                SP
              </div>
              <div>
                <p className="text-sm text-white/90 font-medium">Saugat Panta</p>
                <p className="text-xs text-white/40">Administrator</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto px-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`os-settings-item w-full relative ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${tab.color}20` }}
                >
                  <tab.icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="px-2 pt-2 mt-2 border-t border-white/5 space-y-1">
            {onViewSite && (
              <button
                onClick={onViewSite}
                className="os-settings-item w-full"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span className="text-sm">View Site</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="os-settings-item w-full"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto os-settings-content">
          {/* Content Header */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${activeTabConfig?.color}20` }}
              >
                {activeTabConfig && (
                  <activeTabConfig.icon
                    className="w-4.5 h-4.5"
                    style={{ color: activeTabConfig.color }}
                  />
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white/90">
                  {activeTabConfig?.label} Manager
                </h2>
                <p className="text-xs text-white/40">
                  Manage your {activeTabConfig?.label.toLowerCase()} settings
                </p>
              </div>
            </div>
          </div>

          {/* Manager Content */}
          <div ref={contentRef} className="p-4 md:p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}
