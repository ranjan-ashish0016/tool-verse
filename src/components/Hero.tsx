import { motion } from "motion/react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Smile, 
  CheckCircle, 
  History, 
  Zap, 
  Sparkles, 
  GitBranch,
  TrendingUp,
  Cpu
} from "lucide-react";

interface HeroProps {
  onExplore: () => void;
  onGetStarted: () => void;
}

export default function Hero({ onExplore, onGetStarted }: HeroProps) {
  return (
    <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Background radial soft ambient glows */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none select-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl text-center mx-auto space-y-6 md:space-y-8">
          
          {/* Micro accent badge trigger */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Introducing v2.4 Security Sandbox</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white"
          >
            All Your Daily Tools <br />
            In One <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300">Powerful Platform</span>
          </motion.h1>

          {/* Subheadline description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Professional calculators, generators, and productivity tools designed to save time, optimize calculation accuracy, and map activity history securely.
          </motion.p>

          {/* Large CTA buttons with Framer hover animations */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-950/50 hover:shadow-indigo-950/80 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Explore Smart Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Get Started Free
            </button>
          </motion.div>

          {/* Trust indicators banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10 border-t border-slate-800/30 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">100% Free</p>
                <span className="text-[10px] text-slate-500 font-medium">No hidden subscriptions</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center">
              <Smile className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">Easy To Use</p>
                <span className="text-[10px] text-slate-500 font-medium">Clean direct interface</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">Secure Platform</p>
                <span className="text-[10px] text-slate-500 font-medium">Enterprise privacy gates</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center md:justify-end">
              <History className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">Activity History</p>
                <span className="text-[10px] text-slate-500 font-medium">Persistent Firestore log</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
