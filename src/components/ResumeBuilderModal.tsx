import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Bell, Sparkles } from "lucide-react";

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeBuilderModal({ isOpen, onClose }: ResumeBuilderModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100"
          >
            {/* Header decor */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400 mb-4 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
                We are currently working on <strong>Resume Builder</strong>. 
                Stay tuned for future updates and be the first to know when it launches.
              </p>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Notification recorded! Thank you.</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email for updates"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-900/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Bell className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting..." : "Notify Me"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
