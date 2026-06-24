import { useState, useEffect } from "react";
import { addHistoryRecord } from "../lib/localHistory";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Save, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(14);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(true);
  
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  const generatePassword = () => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      setPassword("Please select at least one character suite");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      result += chars.charAt(index);
    }
    setPassword(result);
    setCopied(false);
    setSaved(false);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const handleCopy = () => {
    if (!password || password.startsWith("Please")) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthAndColor = () => {
    if (password.startsWith("Please")) return { label: "N/A", color: "text-slate-500", barColor: "bg-slate-800", percent: "w-0" };
    
    let activeTypes = 0;
    if (uppercase) activeTypes++;
    if (lowercase) activeTypes++;
    if (numbers) activeTypes++;
    if (symbols) activeTypes++;

    const score = length * activeTypes;

    if (score < 15 || activeTypes === 0) {
      return { label: "Weak", color: "text-rose-400", barColor: "bg-rose-500", percent: "w-1/4" };
    } else if (score < 30) {
      return { label: "Medium", color: "text-amber-400", barColor: "bg-amber-500", percent: "w-2/4" };
    } else if (score < 48) {
      return { label: "Strong", color: "text-indigo-400", barColor: "bg-indigo-500", percent: "w-3/4" };
    } else {
      return { label: "Very Strong", color: "text-emerald-400", barColor: "bg-emerald-500", percent: "w-full" };
    }
  };

  const strength = getStrengthAndColor();

  const handleSaveToHistory = async () => {
    if (!password || password.startsWith("Please")) return;

    setSavingLoading(true);
    setSaved(false);
    try {
      addHistoryRecord("password_history", {
        toolName: "Password Generator",
        length: length,
        strength: strength.label as any,
        generatedPassword: password,
        config: { uppercase, lowercase, numbers, symbols },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Firestore Save Error:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-white">Password Generator</h2>
          <p className="text-xs text-slate-400">Establish cryptographic string keys of arbitrary length and density</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Parameters */}
        <div className="space-y-5">
          {/* Slider Length field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Password Length
              </label>
              <span className="text-sm font-mono font-bold text-white px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-850">
                {length} Characters
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-bold font-mono px-0.5 mt-1">
              <span>8</span>
              <span>16</span>
              <span>32</span>
              <span>48</span>
              <span>64</span>
            </div>
          </div>

          {/* Core Checkboxes rules */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Included Parameters
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-850/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="w-4.5 h-4.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">A-Z (Upper)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-850/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="w-4.5 h-4.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">a-z (Lower)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-850/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                  className="w-4.5 h-4.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">0-9 (Digits)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-850/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                  className="w-4.5 h-4.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">!@#$ (Symbols)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Generated Value & strength readings */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Security Output</h3>

            {/* Password Readout block */}
            <div className="relative p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between min-h-14">
              <span className={`font-mono text-sm break-all pr-8 select-all select-none ${
                revealed ? "text-indigo-200" : "text-indigo-400/20 blur-[3px]"
              }`}>
                {password}
              </span>
              <div className="absolute right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRevealed(!revealed)}
                  title="Toggle Display View"
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  title="Generate New String"
                  className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Real-time slider strength indicators */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Entropy Quality Meter:</span>
                <span className={`text-xs font-bold ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full ${strength.barColor} ${strength.percent} transition-all duration-300`} />
              </div>
            </div>
          </div>

          {/* Action Row buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleCopy}
              className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Clipped Result</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Password</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveToHistory}
              disabled={savingLoading || password.startsWith("Please")}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                  <span>Saved DB</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{savingLoading ? "Saving" : "Save History"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
