import { useState } from "react";
import { addHistoryRecord } from "../lib/localHistory";
import { 
  Save, 
  Check, 
  TrendingUp
} from "lucide-react";

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("500000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [tenureYears, setTenureYears] = useState<string>("5");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Parse fields safely
  const principal = parseFloat(loanAmount) || 0;
  const annualRate = parseFloat(interestRate) || 0;
  const timePeriod = parseFloat(tenureYears) || 0;

  const ratePerMonth = annualRate / 12 / 100;
  const numMonths = tenureUnit === "years" ? timePeriod * 12 : timePeriod;

  // EMI Equation: P * r * (1+r)^n / ((1+r)^n - 1)
  let monthlyEmi = 0;
  if (principal > 0 && ratePerMonth > 0 && numMonths > 0) {
    monthlyEmi = principal * ratePerMonth * Math.pow(1 + ratePerMonth, numMonths) / (Math.pow(1 + ratePerMonth, numMonths) - 1);
  } else if (principal > 0 && numMonths > 0 && ratePerMonth === 0) {
    // zero interest loan fallback
    monthlyEmi = principal / numMonths;
  }

  const totalPayment = monthlyEmi * numMonths;
  const totalInterest = totalPayment - principal;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleSaveToHistory = async () => {
    setSavingLoading(true);
    setSaved(false);
    try {
      addHistoryRecord("emi_history", {
        toolName: "EMI Calculator",
        loanAmount: principal,
        interestRate: annualRate,
        loanTenure: numMonths, // Saved in months normalized
        monthlyEmi: parseFloat(monthlyEmi.toFixed(2)),
        totalInterest: parseFloat((totalInterest > 0 ? totalInterest : 0).toFixed(2)),
        totalPayment: parseFloat(totalPayment.toFixed(2)),
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
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-white">EMI Calculator</h2>
          <p className="text-xs text-slate-400">Model loans, interest structures, and monthly commitments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Input Fields */}
        <div className="space-y-4">
          {/* Loan Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Loan Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="e.g. 5,00,000"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Interest Rate (% Per Annum)
            </label>
            <div className="relative">
              <span className="absolute right-4 top-3 text-slate-500 font-bold">%</span>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 8.5"
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Loan Tenure with years/months toggle */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Loan Tenure
              </label>
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTenureUnit("years")}
                  className={`px-2 py-1 rounded transition-colors font-semibold ${
                    tenureUnit === "years" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  Years
                </button>
                <button
                  type="button"
                  onClick={() => setTenureUnit("months")}
                  className={`px-2 py-1 rounded transition-colors font-semibold ${
                    tenureUnit === "months" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  Months
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute right-4 top-3 text-slate-500 font-medium">
                {tenureUnit === "years" ? "Yrs" : "Mths"}
              </span>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                placeholder={tenureUnit === "years" ? "e.g. 5" : "e.g. 60"}
                className="w-full pl-4 pr-14 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">EMI Summary</h3>

            {/* Monthly EMI output */}
            <div className="py-4 border-b border-slate-800/60 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Monthly Loan EMI</p>
              <h4 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatCurrency(monthlyEmi)}
              </h4>
            </div>

            {/* Principal Loan amount readout */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40 text-sm">
              <span className="text-slate-400">Principal Loan Amount</span>
              <span className="text-slate-200 font-mono font-medium">{formatCurrency(principal)}</span>
            </div>

            {/* Total Interest Amount */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40 text-sm">
              <span className="text-slate-400">Total Interest Payable</span>
              <span className="text-indigo-400 font-mono font-bold">
                {formatCurrency(totalInterest > 0 ? totalInterest : 0)}
              </span>
            </div>

            {/* Total Payment readout */}
            <div className="flex justify-between items-center py-2 text-sm font-semibold">
              <span className="text-slate-300">Total Amount Payable</span>
              <span className="text-white font-mono font-bold">{formatCurrency(totalPayment > 0 ? totalPayment : 0)}</span>
            </div>
          </div>

          <button
            onClick={handleSaveToHistory}
            disabled={savingLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Saved To Profile</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{savingLoading ? "Saving Commit..." : "Save Calculation to History"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
