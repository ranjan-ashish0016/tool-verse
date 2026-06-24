import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Calculator, 
  QrCode, 
  ShieldCheck, 
  FileText,
  Sun, 
  Moon, 
  Compass, 
  History,
  Wrench,
  CalendarRange
} from "lucide-react";

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  onResumeComingSoon: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Navbar({
  onNavigate,
  activeSection,
  onResumeComingSoon,
  theme,
  onToggleTheme
}: NavbarProps) {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateFromMenu = (sectionId: string) => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/70 border-b border-slate-800/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Taglines */}
          <div 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/40 relative overflow-hidden">
              <Wrench className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  ToolVerse
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded bg-indigo-500/10 text-[9px] text-indigo-400 font-bold border border-indigo-500/25 uppercase tracking-wider">SaaS</span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                All-in-One Smart Tools Platform
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate("home")}
              className={`text-sm font-semibold transition-colors outline-none cursor-pointer ${
                activeSection === "home" ? "text-indigo-400" : "text-slate-300 hover:text-white"
              }`}
            >
              Home
            </button>

            {/* Tools Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
                className="text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-1 outline-none cursor-pointer"
              >
                <span>Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsDropdownOpen ? "rotate-180 text-indigo-400" : "text-slate-400"}`} />
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[26rem] p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-2 gap-4"
                  >
                    {/* Calculators Column */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/60 pb-1.5 mb-2.5">
                        Calculators
                      </h4>
                      <div className="space-y-1">
                        <button
                          onMouseDown={() => navigateFromMenu("gst-calc")}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-300 hover:text-white transition-all group"
                        >
                          <Calculator className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold leading-none">GST Calculator</p>
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Rates tax estimator</span>
                          </div>
                        </button>
                        
                        <button
                          onMouseDown={() => navigateFromMenu("emi-calc")}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-300 hover:text-white transition-all group"
                        >
                          <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold leading-none">EMI Calculator</p>
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Loan index breakdowns</span>
                          </div>
                        </button>

                        <button
                          onMouseDown={() => navigateFromMenu("age-calc")}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-300 hover:text-white transition-all group"
                        >
                          <CalendarRange className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold leading-none">Age Calculator</p>
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Birthday countdowns</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Generators & Builders Column */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/60 pb-1.5 mb-2.5">
                          Generators & Builders
                        </h4>
                        <div className="space-y-1">
                          <button
                            onMouseDown={() => navigateFromMenu("qr-gen")}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-300 hover:text-white transition-all group"
                          >
                            <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold leading-none">QR Generator</p>
                              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Branded DH logo</span>
                            </div>
                          </button>

                          <button
                            onMouseDown={() => navigateFromMenu("pwd-gen")}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-300 hover:text-white transition-all group"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold leading-none">Password Generator</p>
                              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Cryptographic string maker</span>
                            </div>
                          </button>

                          <button
                            onMouseDown={() => {
                              onResumeComingSoon();
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/[0.03] flex items-center gap-2 text-slate-400/80 hover:text-slate-200 transition-all group"
                          >
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            <div>
                              <div className="flex items-center gap-1 leading-none">
                                <span className="text-xs font-bold">Resume Builder</span>
                                <span className="px-1 bg-indigo-500/10 text-[8px] text-indigo-400 rounded">Soon</span>
                              </div>
                              <span className="text-[10px] text-slate-600 mt-0.5">PDF dynamic builder</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigateFromMenu("history")}
              className={`text-sm font-semibold transition-colors outline-none flex items-center gap-1.5 cursor-pointer ${
                activeSection === "history" ? "text-indigo-400" : "text-slate-300 hover:text-white"
              }`}
            >
              <History className="w-4.5 h-4.5 text-slate-400" />
              <span>History</span>
            </button>

            <button
              onClick={() => onNavigate("about-us")}
              className={`text-sm font-semibold transition-colors outline-none cursor-pointer ${
                activeSection === "about-us" ? "text-indigo-400" : "text-slate-300 hover:text-white"
              }`}
            >
              About Us
            </button>
          </div>

          {/* Theme switcher, Auth control center */}
          <div className="hidden md:flex items-center gap-4.5">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors outline-none cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Mobile menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-450 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-t border-slate-850 py-4 px-4 space-y-3 shadow-2xl"
          >
            {/* Nav links */}
            <div className="space-y-1">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("home"); }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 font-semibold text-sm"
              >
                Home
              </button>

              <div className="px-3 py-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Calculators</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => navigateFromMenu("gst-calc")}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-300"
                  >
                    <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                    <span>GST Calc</span>
                  </button>
                  <button
                    onClick={() => navigateFromMenu("emi-calc")}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-300"
                  >
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>EMI Calc</span>
                  </button>
                  <button
                    onClick={() => navigateFromMenu("age-calc")}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-300"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Age Calc</span>
                  </button>
                </div>
              </div>

              <div className="px-3 py-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Generators</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => navigateFromMenu("qr-gen")}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-300"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>QR Gen</span>
                  </button>
                  <button
                    onClick={() => navigateFromMenu("pwd-gen")}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-300"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pas Gen</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onResumeComingSoon();
                    }}
                    className="p-2 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 text-slate-450"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resume Build</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigateFromMenu("history")}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 font-semibold text-sm flex items-center gap-1.5"
              >
                <History className="w-4 h-4 text-slate-450" />
                <span>History Logs</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("about-us"); }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 font-semibold text-sm"
              >
                About Us
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
