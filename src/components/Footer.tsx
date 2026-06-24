import { Wrench } from "lucide-react";

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-slate-900">
        
        {/* Left Side: Brand presentation */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-bold">
              <Wrench className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-display font-black text-lg text-white">ToolVerse</span>
              <p className="text-[10px] text-slate-500 font-medium">All-in-One Smart Tools Platform</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            We build modern SaaS products and productivity tools that help creators save time, 
            optimize accuracy, and simplify computation complexity globally.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="md:col-span-2 space-y-3 col-span-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li>
              <button onClick={() => onNavigate("home")} className="hover:text-indigo-400 transition-colors cursor-pointer block">Home</button>
            </li>
            <li>
              <a href="#tools" onClick={() => onNavigate("home")} className="hover:text-indigo-400 transition-colors block">Tools Suite</a>
            </li>
            <li>
              <button onClick={() => onNavigate("about-us")} className="hover:text-indigo-400 transition-colors cursor-pointer block">Mission Story</button>
            </li>
          </ul>
        </div>

        {/* Column 3: Useful Links */}
        <div className="md:col-span-2 space-y-3 col-span-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Useful Links</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-indigo-400 transition-colors">Terms of Use</a></li>
            <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            <li><a href="https://ashishranjan620.profiled.site/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Portfolio</a></li>
          </ul>
        </div>

        {/* Column 4: Contact & Corporate info */}
        <div className="md:col-span-3 space-y-4 col-span-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Details</h4>
          <div className="space-y-1.5 text-xs font-medium leading-relaxed">
            <p className="text-white font-bold">{`Ashish Ranjan`}</p>
            <p>
              Email:{" "}
              <a href="mailto:ashishranjan6206@gmail.com" className="text-indigo-400 hover:underline">
                ashishranjan6206@gmail.com
              </a>
            </p>
            <p>
              Portfolio:{" "}
              <a href="https://ashishranjan620.profiled.site/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                ashishranjan620.profiled.site
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Row containing mandatory Digital Heroes requirement */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p className="text-slate-600 select-none">&copy; {new Date().getFullYear()} ToolVerse. All rights reserved.</p>

        {/* Mandatory button with exact target text & URL scheme */}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-bold text-white transition-all shadow-md active:scale-95 uppercase tracking-wider"
        >
          <span>Built for Digital Heroes</span>
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
