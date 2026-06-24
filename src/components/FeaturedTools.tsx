import { motion } from "motion/react";
import { 
  Calculator, 
  QrCode, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Compass,
  CalendarRange
} from "lucide-react";

interface FeaturedToolsProps {
  onNavigateToTool: (sectionId: string) => void;
  onResumeSoon: () => void;
}

export default function FeaturedTools({ onNavigateToTool, onResumeSoon }: FeaturedToolsProps) {
  
  const card1Tools = [
    { name: "GST Calculator", desc: "Calculate GST taxes in seconds", id: "gst-calc" },
    { name: "EMI Calculator", desc: "Calculate your loan EMIs cleanly", id: "emi-calc" },
    { name: "Age Calculator", desc: "Discover birthdays countdown", id: "age-calc" }
  ];

  const card2Tools = [
    { name: "QR Code Generator", desc: "Generate custom branded QR codes", id: "qr-gen" },
    { name: "Password Generator", desc: "Generate strong cryptographic passwords", id: "pwd-gen" }
  ];

  return (
    <section id="tools" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-3">
        <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
          Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Featured Suites</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Unlock high-fidelity calculations, secure string encodings, and robust structural parameters in a cohesive developer workspace.
        </p>
      </div>

      {/* Grid containing exactly 3 suite cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD 1: Calculator Suite */}
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
        >
          {/* Ambient inner soft lighting */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header branding */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Calculator Suite</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Calculators</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Illustration Mock of Calculator */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mb-6">
              <svg className="w-24 h-24 text-indigo-500" viewBox="0 0 100 100">
                <rect x="25" y="10" width="50" height="80" rx="8" fill="#0c0f1a" stroke="#1f2937" strokeWidth="2" />
                <rect x="32" y="18" width="36" height="18" rx="4" fill="#1e1b4b" stroke="#312e81" strokeWidth="1" />
                <text x="50" y="30" fill="#a5b4fc" fontSize="10" fontFamily="monospace" textAnchor="middle">₹ 14,500.00</text>
                <circle cx="36" cy="48" r="4" fill="#312e81" />
                <circle cx="50" cy="48" r="4" fill="#312e81" />
                <circle cx="64" cy="48" r="4" fill="#312e81" />
                <circle cx="36" cy="60" r="4" fill="#312e81" />
                <circle cx="50" cy="60" r="4" fill="#312e81" />
                <circle cx="64" cy="60" r="4" fill="#312e81" />
                <circle cx="36" cy="72" r="4" fill="#312e81" />
                <circle cx="50" cy="72" r="4" fill="#312e81" />
                <circle cx="64" cy="72" r="4" fill="#4f46e5" />
              </svg>
            </div>

            {/* List of sub menus */}
            <div className="space-y-2 mb-6">
              {card1Tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onNavigateToTool(tool.id)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/50 border border-slate-850 hover:border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    {tool.id === "gst-calc" && <Calculator className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />}
                    {tool.id === "emi-calc" && <Compass className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />}
                    {tool.id === "age-calc" && <CalendarRange className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />}
                    <div>
                      <p className="text-xs font-bold leading-none">{tool.name}</p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">{tool.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTool("gst-calc")}
            className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 group"
          >
            <span>View All Calculators</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-500" />
          </button>
        </motion.div>

        {/* CARD 2: Generator Suite */}
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
        >
          {/* Ambient inner soft lighting */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header branding */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-650/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Generator Suite</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Generators</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Illustration Mock of QR and Password Security matrix */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mb-6">
              <svg className="w-24 h-24 text-purple-500" viewBox="0 0 100 100">
                <rect x="25" y="25" width="50" height="50" rx="6" fill="#0d0e1a" stroke="#1f2937" strokeWidth="2" />
                {/* QR Pattern cells */}
                <rect x="31" y="31" width="12" height="12" rx="1" fill="#c084fc" />
                <rect x="34" y="34" width="6" height="6" fill="#0d0e1a" />
                <rect x="57" y="31" width="12" height="12" rx="1" fill="#c084fc" />
                <rect x="60" y="34" width="6" height="6" fill="#0d0e1a" />
                <rect x="31" y="57" width="12" height="12" rx="1" fill="#c084fc" />
                <rect x="34" y="60" width="6" height="6" fill="#0d0e1a" />
                <rect x="57" y="57" width="6" height="6" fill="#c084fc" />
                <rect x="63" y="63" width="6" height="6" fill="#c084fc" />
              </svg>
            </div>

            {/* List of sub menus */}
            <div className="space-y-2 mb-6">
              {card2Tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onNavigateToTool(tool.id)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/50 border border-slate-850 hover:border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    {tool.id === "qr-gen" && <QrCode className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />}
                    {tool.id === "pwd-gen" && <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />}
                    <div>
                      <p className="text-xs font-bold leading-none">{tool.name}</p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">{tool.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTool("qr-gen")}
            className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 group"
          >
            <span>View All Generators</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-500" />
          </button>
        </motion.div>

        {/* CARD 3: Builder Suite */}
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
        >
          {/* Ambient inner soft lighting */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header branding */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Builder Suite</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Builders</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Illustration Mock of resume sheet */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mb-6">
              <svg className="w-24 h-24 text-cyan-500" viewBox="0 0 100 100">
                <rect x="30" y="15" width="40" height="70" rx="4" fill="#0d0e1a" stroke="#1f2937" strokeWidth="2" />
                <line x1="38" y1="28" x2="62" y2="28" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
                <line x1="38" y1="36" x2="52" y2="36" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                <line x1="38" y1="44" x2="58" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                <line x1="38" y1="52" x2="48" y2="52" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* List of sub menus */}
            <div className="space-y-2 mb-6">
              <button
                onClick={onResumeSoon}
                className="w-full text-left p-3 rounded-xl bg-slate-950/50 border border-slate-850 hover:border-slate-800 flex items-center justify-between text-slate-400/80 hover:text-slate-250 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-bold">Resume Builder</span>
                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-[8px] text-indigo-400 font-bold rounded">Soon</span>
                    </div>
                    <span className="text-[10px] text-slate-600 mt-0.5 block font-medium">Build pristine corporate resumes</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <button
            onClick={onResumeSoon}
            className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-350 transition-colors flex items-center justify-center gap-1 group"
          >
            <span>Coming Soon</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
