import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Moon, Sun, Menu, X, Home, User, Briefcase, FolderGit2, Mail, Shield, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { firebaseClient } from "@/api/firebaseClient";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "About", url: createPageUrl("About"), icon: User },
  { title: "Projects", url: createPageUrl("Projects"), icon: FolderGit2 },
  { title: "Experience", url: createPageUrl("Experience"), icon: Briefcase },
  { title: "Blog", url: createPageUrl("Blog"), icon: BookOpen },
  { title: "Contact", url: createPageUrl("Contact"), icon: Mail },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await firebaseClient.auth.isAuthenticated();
      setIsAuthenticated(authed);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const isAdminPage = currentPageName === "Admin";
  const isBlogPostPage = currentPageName === "BlogPost";

  if (isAdminPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</div>;
  }

  const isActive = (url) => {
    if (isBlogPostPage && url === createPageUrl("Blog")) {
      return true;
    }
    return location.pathname === url;
  };

  return (
    <>
      <style>{`
        :root {
          --color-primary: 59, 130, 246;
          --color-secondary: 168, 85, 247;
          --color-accent: 34, 211, 238;
        }
        
        .dark {
          --color-bg: 3, 7, 18;
          --color-surface: 15, 23, 42;
          --color-text: 248, 250, 252;
        }
        
        :root:not(.dark) {
          --color-bg: 255, 255, 255;
          --color-surface: 248, 250, 252;
          --color-text: 15, 23, 42;
        }

        body {
          background: rgb(var(--color-bg));
          color: rgb(var(--color-text));
          overflow-x: hidden;
        }

        .glass {
          background: rgba(var(--color-surface), 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(var(--color-text), 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Prevent body scroll when mobile menu is open */
        body.menu-open {
          overflow: hidden;
        }

        /* Hide scrollbar but allow scrolling */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      {/* Add body class when mobile menu is open */}
      {mobileMenuOpen && (
        <style>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
        {/* Navigation - FIXED VERSION */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "glass shadow-lg" : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link 
                to={createPageUrl("Home")} 
                className="flex-shrink-0 flex items-center min-w-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-lg sm:text-xl font-bold gradient-text whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  Portfolio
                </motion.div>
              </Link>

              {/* Desktop Navigation - HIDDEN ON MOBILE & TABLET */}
              <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                <div className="flex items-center space-x-1 xl:space-x-2 overflow-x-auto no-scrollbar max-w-[500px] xl:max-w-[600px]">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.title} 
                      to={item.url} 
                      className="px-2 xl:px-3 py-2 flex-shrink-0"
                    >
                      <motion.div
                        whileHover={{ y: -2 }}
                        className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive(item.url)
                            ? "text-blue-500"
                            : "text-slate-600 dark:text-slate-400 hover:text-blue-500"
                        }`}
                      >
                        {item.title}
                      </motion.div>
                    </Link>
                  ))}
                </div>
                
                {/* Admin link */}
                {isAuthenticated ? (
                  <Link 
                    to={createPageUrl("Admin")} 
                    className="px-2 xl:px-3 py-2 flex-shrink-0 ml-1 xl:ml-2"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="text-xs sm:text-sm font-medium text-purple-500 hover:text-purple-400 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Admin</span>
                    </motion.div>
                  </Link>
                ) : (
                  <button
                    onClick={() => firebaseClient.auth.redirectToLogin(createPageUrl("Admin"))}
                    className="px-2 xl:px-3 py-2 flex-shrink-0 ml-1 xl:ml-2 text-xs sm:text-sm font-medium text-purple-500 hover:text-purple-400 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Admin</span>
                  </button>
                )}
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? (
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                  )}
                </Button>

                {/* Mobile Menu Button - SHOW ON MOBILE & TABLET */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden rounded-full w-7 h-7 sm:w-8 sm:h-8"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Menu - IMPROVED FOR BETTER MOBILE EXPERIENCE */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 100 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm glass p-4 sm:p-6 pt-20 sm:pt-24 overflow-y-auto lg:hidden"
              >
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg transition-colors ${
                          isActive(item.url)
                            ? "bg-blue-500/10 text-blue-500 border-l-4 border-blue-500"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-base sm:text-lg">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  <Separator className="my-2" />
                  
                  {/* Admin Login/Logout in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigationItems.length * 0.05 }}
                  >
                    {isAuthenticated ? (
                      <Link
                        to={createPageUrl("Admin")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg hover:bg-purple-500/10 text-purple-500 border-l-4 border-purple-500"
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-base sm:text-lg">Admin</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          firebaseClient.auth.redirectToLogin(createPageUrl("Admin"));
                        }}
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg hover:bg-purple-500/10 text-purple-500 border-l-4 border-purple-500 w-full text-left"
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-base sm:text-lg">Admin Login</span>
                      </button>
                    )}
                  </motion.div>

                  <Separator className="my-2" />
                  
                  {/* Dark Mode Toggle in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigationItems.length + 1) * 0.05 }}
                  >
                    <button
                      onClick={() => setIsDark(!isDark)}
                      className="flex items-center justify-between w-full p-3 sm:p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Sun className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <Moon className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="font-medium text-base sm:text-lg">
                          {isDark ? "Light Mode" : "Dark Mode"}
                        </span>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 flex items-center ${
                        isDark ? "bg-blue-500" : "bg-slate-300"
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          isDark ? "translate-x-6" : "translate-x-0"
                        }`} />
                      </div>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="pt-14 sm:pt-16 md:pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 md:mt-16 py-6 sm:py-8 md:py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              © {new Date().getFullYear()} Portfolio. Built with React & Firebase.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}