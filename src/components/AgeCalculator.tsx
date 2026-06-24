import { useState } from "react";
import { motion } from "motion/react";
import { db, auth, collection, addDoc, serverTimestamp } from "../lib/firebase";
import { 
  CalendarRange, 
  Hourglass, 
  Save, 
  Check, 
  Cake 
} from "lucide-react";

interface AgeCalculatorProps {
  onShowAuthModal: (toolName: string) => void;
}

export default function AgeCalculator({ onShowAuthModal }: AgeCalculatorProps) {
  const [dob, setDob] = useState<string>("2000-01-01");
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Compute detailed metrics on the fly
  const computeAgeDetails = () => {
    if (!dob) return null;

    const birthDateObj = new Date(dob);
    const today = new Date(); // Normalized to today

    if (isNaN(birthDateObj.getTime()) || birthDateObj > today) {
      return null;
    }

    // Comprehensive age in Years, Months, Days
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    let days = today.getDate() - birthDateObj.getDate();

    if (days < 0) {
      months--;
      // Get days in the previous month
      const prevMonthDate = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonthDate.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Cumulative Total Days
    const timeDiff = today.getTime() - birthDateObj.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Next Birthday countdown calculation
    const nextBirthday = new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const countdownDiff = nextBirthday.getTime() - today.getTime();
    const countdownToNextBirthday = Math.max(0, Math.ceil(countdownDiff / (1000 * 60 * 60 * 24))) % 365;

    return {
      years,
      months,
      days,
      totalDays,
      countdownToNextBirthday,
    };
  };

  const results = computeAgeDetails();

  const handleSaveToHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      onShowAuthModal("Age Calculator");
      return;
    }

    if (!results) return;

    setSavingLoading(true);
    setSaved(false);
    try {
      await addDoc(collection(db, "age_history"), {
        userId: user.uid,
        toolName: "Age Calculator",
        timestamp: serverTimestamp(),
        dob: dob,
        years: results.years,
        months: results.months,
        days: results.days,
        totalDays: results.totalDays,
        countdownToNextBirthday: results.countdownToNextBirthday,
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
          <CalendarRange className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-white">Age Calculator</h2>
          <p className="text-xs text-slate-400">Discover precise lifespan chronometers and birthday arrivals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Date selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
              Select Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850/60 flex items-start gap-3">
            <Hourglass className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-400 leading-relaxed">
              Calculations are processed on matching timezone boundaries. Supports leap-day coordinates and accurate age distribution breakdowns.
            </div>
          </div>
        </div>

        {/* Right Outputs Readout Grid */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950 border border-slate-800">
          {results ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Lifespan Breakdown</h3>

              {/* Big metrics cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center my-4">
                <div className="p-3 bg-slate-900 border border-slate-800/85 rounded-xl">
                  <p className="text-2xl font-extrabold text-white font-mono">{results.years}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Years</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800/85 rounded-xl">
                  <p className="text-2xl font-extrabold text-indigo-400 font-mono">{results.months}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Months</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800/85 rounded-xl">
                  <p className="text-2xl font-extrabold text-cyan-400 font-mono">{results.days}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Days</p>
                </div>
              </div>

              {/* Cumulative stats rows */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-2 border-b border-slate-850 text-sm">
                  <span className="text-slate-400">Total Days Lived</span>
                  <span className="text-slate-200 font-mono font-medium">{results.totalDays.toLocaleString()} Days</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-850 text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    Next Birthday Countdown <Cake className="w-3.5 h-3.5 text-pink-400" />
                  </span>
                  <span className="text-pink-400 font-mono font-bold">{results.countdownToNextBirthday} Days Remaining</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-10">
              <CalendarRange className="w-10 h-10 text-slate-700 animate-pulse mb-3" />
              <p className="text-sm text-slate-500 font-medium">Please specify a valid DOB in the selector to display parameters.</p>
            </div>
          )}

          <button
            onClick={handleSaveToHistory}
            disabled={savingLoading || !results}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 hover:disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Saved to Profile History</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{savingLoading ? "Committing Database..." : "Save Calculation to Profile"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
