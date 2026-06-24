import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Check, AlertCircle, Sparkles } from "lucide-react";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import FeaturedTools from "./components/FeaturedTools";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
import ResumeBuilderModal from "./components/ResumeBuilderModal";
import AuthModal from "./components/AuthModal";

// Tools
import GstCalculator from "./components/GstCalculator";
import EmiCalculator from "./components/EmiCalculator";
import AgeCalculator from "./components/AgeCalculator";
import QrGenerator from "./components/QrGenerator";
import PasswordGenerator from "./components/PasswordGenerator";
import HistoryDashboard from "./components/HistoryDashboard";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    (window as any).showToast = showToast;
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  // Layout View State: "home" | "gst-calc" | "emi-calc" | "age-calc" | "qr-gen" | "pwd-gen" | "history" | "about-us"
  const [activeSection, setActiveSection] = useState<string>("home");

  // Modals visibility toggles
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<"login" | "signup">("login");
  const [restrictedToolTrigger, setRestrictedToolTrigger] = useState<string | null>(null);

  // Pending redirection/navigation state once user completes authentication in raw flow
  const [pendingToolRedirect, setPendingToolRedirect] = useState<{ sectionId: string; toolName: string } | null>(null);

  // Dark / Light Theme engine
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("theme");
      return saved === "light" ? "light" : "dark"; // Default is Dark mode
    } catch (e) {
      console.warn("localStorage is not available:", e);
      return "dark";
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthStateLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync theme to local storage & HTML document classes
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("localStorage is not available for writing:", e);
    }
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.style.backgroundColor = "#F8FAFC"; // light off-white slate background
    } else {
      root.classList.add("dark");
      root.style.backgroundColor = "#020617"; // deep slate black background
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleOpenAuthModal = (mode: "login" | "signup", restrictedToolName: string | null = null) => {
    setRestrictedToolTrigger(restrictedToolName);
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  const checkAccessAndNavigate = (toolName: string, sectionId: string) => {
    if (!currentUser) {
      setPendingToolRedirect({ sectionId, toolName });
      handleOpenAuthModal("login", toolName);
    } else {
      setActiveSection(sectionId);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.warn("window.scrollTo failed in current container sandbox context", err);
      }
    }
  };

  const handleAuthSuccess = () => {
    if (pendingToolRedirect) {
      setActiveSection(pendingToolRedirect.sectionId);
      setPendingToolRedirect(null);
    } else {
      setActiveSection("history"); // Redirect to history dashboard log on regular successful registration/login
    }
    setRestrictedToolTrigger(null);
  };

  const handleExploreTools = () => {
    const toolsSection = document.getElementById("tools");
    if (toolsSection) {
      try {
        toolsSection.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.warn("scrollIntoView failed in current container sandbox context", err);
      }
    }
  };

  const handleGetStarted = () => {
    if (currentUser) {
      handleExploreTools();
    } else {
      handleOpenAuthModal("signup");
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "text-slate-100 dark" : "text-slate-900 light"}`}>
      
      {/* Absolute Dynamic Grid Matrix Pattern Background (Dark Mode only) */}
      {theme === "dark" && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      )}

      {/* Corporate Navbar Header */}
      <Navbar
        onNavigate={(section) => {
          if (["gst-calc", "emi-calc", "age-calc", "qr-gen", "pwd-gen", "history"].includes(section)) {
            const toolNamesMap: { [key: string]: string } = {
              "gst-calc": "GST Calculator",
              "emi-calc": "EMI Calculator",
              "age-calc": "Age Calculator",
              "qr-gen": "QR Code Generator",
              "pwd-gen": "Password Generator",
              "history": "Activity History Dashboard"
            };
            checkAccessAndNavigate(toolNamesMap[section], section);
          } else {
            setActiveSection(section);
            if (section === "home") {
              try {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch (err) {
                console.warn("window.scrollTo failed in current container sandbox context", err);
              }
            } else {
              setTimeout(() => {
                const element = document.getElementById(section);
                if (element) {
                  try {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  } catch (err) {
                    console.warn("scrollIntoView failed in current container sandbox context", err);
                  }
                }
              }, 100);
            }
          }
        }}
        activeSection={activeSection}
        onOpenAuth={(mode) => handleOpenAuthModal(mode)}
        onResumeComingSoon={() => setResumeModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onShowRestrictedModal={(toolName) => handleOpenAuthModal("login", toolName)}
      />

      {/* Main Container Core Router */}
      <main className="relative z-10 pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          {activeSection === "home" && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Premium Hero section */}
              <Hero 
                onExplore={handleExploreTools} 
                onGetStarted={handleGetStarted} 
              />
              
              {/* Animated Counters Statistics */}
              <Stats />

              {/* Bento Grid Suite Mappings */}
              <FeaturedTools 
                onNavigateToTool={(toolId) => {
                  const toolNamesMap: { [key: string]: string } = {
                    "gst-calc": "GST Calculator",
                    "emi-calc": "EMI Calculator",
                    "age-calc": "Age Calculator",
                    "qr-gen": "QR Code Generator",
                    "pwd-gen": "Password Generator",
                  };
                  checkAccessAndNavigate(toolNamesMap[toolId], toolId);
                }} 
                onResumeSoon={() => setResumeModalOpen(true)} 
              />

              {/* Company Story pillars */}
              <AboutUs />
            </motion.div>
          )}

          {/* Active Tool Sub-Views */}
          {activeSection === "gst-calc" && (
            <motion.div
              key="gst-calc-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 py-12 md:py-16"
            >
              <GstCalculator onShowAuthModal={(t) => handleOpenAuthModal("login", t)} />
            </motion.div>
          )}

          {activeSection === "emi-calc" && (
            <motion.div
              key="emi-calc-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 py-12 md:py-16"
            >
              <EmiCalculator onShowAuthModal={(t) => handleOpenAuthModal("login", t)} />
            </motion.div>
          )}

          {activeSection === "age-calc" && (
            <motion.div
              key="age-calc-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 py-12 md:py-16"
            >
              <AgeCalculator onShowAuthModal={(t) => handleOpenAuthModal("login", t)} />
            </motion.div>
          )}

          {activeSection === "qr-gen" && (
            <motion.div
              key="qr-gen-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto px-4 py-12 md:py-16"
            >
              <QrGenerator onShowAuthModal={(t) => handleOpenAuthModal("login", t)} />
            </motion.div>
          )}

          {activeSection === "pwd-gen" && (
            <motion.div
              key="pwd-gen-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 py-12 md:py-16"
            >
              <PasswordGenerator onShowAuthModal={(t) => handleOpenAuthModal("login", t)} />
            </motion.div>
          )}

          {/* History Dashboard log */}
          {activeSection === "history" && (
            <motion.div
              key="history-dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="px-4"
            >
              <HistoryDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate footer structure */}
      <Footer 
        onNavigate={(section) => {
          setActiveSection("home");
          setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
              try {
                element.scrollIntoView({ behavior: "smooth" });
              } catch (err) {
                console.warn("scrollIntoView failed inside sandbox context", err);
              }
            }
          }, 150);
        }} 
      />

      {/* Modals Overlays */}
      <ResumeBuilderModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onSuccess={handleAuthSuccess}
        restrictedToolName={restrictedToolTrigger}
      />

      {/* Floating Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm pointer-events-auto border backdrop-blur-md ${
                toast.type === "success" 
                  ? "bg-slate-900/90 border-emerald-500/30 text-emerald-400" 
                  : toast.type === "error"
                  ? "bg-slate-900/90 border-rose-500/30 text-rose-400"
                  : "bg-slate-900/90 border-indigo-500/30 text-indigo-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {toast.type === "info" && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-white text-xs pl-2 shrink-0 select-none cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
