import { motion } from "motion/react";
import { Info, Sparkles, Shield, Zap } from "lucide-react";

export default function AboutUs() {
  return (
    <motion.section
      id="about-us"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-20 px-4 max-w-5xl mx-auto text-center"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium mb-4">
        <Info className="w-3.5 h-3.5" />
        <span>Our Mission</span>
      </div>

      <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent mb-6">
        About ToolVerse
      </h2>

      <p className="text-gray-300 md:text-lg max-w-3xl mx-auto leading-relaxed mb-12">
        We build modern SaaS products and productivity tools that help users save time, 
        automate repetitive tasks, and improve efficiency. Our mission is to provide reliable, 
        secure, and user-friendly tools accessible to everyone.
      </p>

      {/* Corporate pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 backdrop-blur-md transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold mb-2">High Efficiency</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Every tool is performance-optimized to deliver near-instant calculations and code creations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 backdrop-blur-md transition-colors">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold mb-2">Ironclad Security</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your results, generated keys, and calculator parameters are kept entirely private.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 backdrop-blur-md transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold mb-2">Pristine Design</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            A beautiful, uncluttered interface configured perfectly for dark and light environments.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
