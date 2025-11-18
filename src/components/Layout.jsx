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
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

        /* Responsive text sizes */
        @media (max-width: 640px) {
          .responsive-text {
            font-size: 0.875rem;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "glass shadow-lg" : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to={createPageUrl("Home")} className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xl sm:text-2xl font-bold gradient-text"
                >
                  Portfolio
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
                {navigationItems.map((item) => (
                  <Link key={item.title} to={item.url}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`text-sm font-medium transition-colors responsive-text ${
                        isActive(item.url)
                          ? "text-blue-500"
                          : "text-slate-600 dark:text-slate-400 hover:text-blue-500"
                      }`}
                    >
                      {item.title}
                    </motion.div>
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Link to={createPageUrl("Admin")}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="text-sm font-medium text-purple-500 hover:text-purple-400 flex items-center gap-1 responsive-text"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </motion.div>
                  </Link>
                ) : (
                  <button
                    onClick={() => firebaseClient.auth.redirectToLogin(createPageUrl("Admin"))}
                    className="text-sm font-medium text-purple-500 hover:text-purple-400 flex items-center gap-1 responsive-text"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </button>
                )}
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div 
                className="absolute inset-0 bg-black/50" 
                onClick={() => setMobileMenuOpen(false)} 
                aria-hidden="true"
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs glass p-4 sm:p-6 pt-16 sm:pt-20 overflow-y-auto">
                <div className="flex flex-col gap-2 sm:gap-3">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive(item.url)
                            ? "bg-blue-500/10 text-blue-500"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium responsive-text">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  <Separator className="my-1 sm:my-2" />
                  
                  {/* Admin Login/Logout in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigationItems.length * 0.1 }}
                  >
                    {isAuthenticated ? (
                      <Link
                        to={createPageUrl("Admin")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 text-purple-500"
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium responsive-text">Admin</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          firebaseClient.auth.redirectToLogin(createPageUrl("Admin"));
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 text-purple-500 w-full text-left"
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium responsive-text">Admin Login</span>
                      </button>
                    )}
                  </motion.div>

                  <Separator className="my-1 sm:my-2" />
                  
                  {/* Dark Mode Toggle in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigationItems.length + 1) * 0.1 }}
                  >
                    <button
                      onClick={() => setIsDark(!isDark)}
                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Sun className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <Moon className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="font-medium responsive-text">
                          {isDark ? "Light Mode" : "Dark Mode"}
                        </span>
                      </div>
                      <motion.div
                        className={`w-12 h-6 rounded-full p-1 flex items-center ${
                          isDark ? "bg-blue-500" : "bg-slate-300"
                        }`}
                        animate={{ backgroundColor: isDark ? "rgb(59, 130, 246)" : "rgb(203, 213, 225)" }}
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full bg-white shadow-md"
                          animate={{ x: isDark ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.div>
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="pt-16 sm:pt-20">
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
        <footer className="mt-12 sm:mt-16 lg:mt-20 py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm responsive-text">
              © {new Date().getFullYear()} Portfolio. Built with React & Firebase.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}