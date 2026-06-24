import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  db, 
  auth,
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch 
} from "../lib/firebase";
import { 
  History, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  ListRestart
} from "lucide-react";

interface HistoryItem {
  id: string;
  collectionName: "gst_history" | "emi_history" | "age_history" | "qr_history" | "password_history";
  toolName: string;
  timestamp: Date;
  inputDescription: string;
  resultDescription: string;
  rawRecord: any;
}

export default function HistoryDashboard() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const pageSize = 8;

  // Map of collections we query
  const collectionsList: Array<"gst_history" | "emi_history" | "age_history" | "qr_history" | "password_history"> = [
    "gst_history",
    "emi_history",
    "age_history",
    "qr_history",
    "password_history"
  ];

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      setRecords([]);
      return;
    }

    setLoading(true);
    try {
      const allPromises = collectionsList.map(async (colName) => {
        const q = query(collection(db, colName), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          
          // Format Firestore timestamp safely
          let rawDate = new Date();
          if (data.timestamp?.seconds) {
            rawDate = new Date(data.timestamp.seconds * 1000);
          } else if (data.timestamp) {
            rawDate = new Date(data.timestamp);
          }

          // Compute descriptive fields for unified layout representation
          let inputDesc = "";
          let resultDesc = "";

          if (colName === "gst_history") {
            inputDesc = `₹${data.amount} @ ${data.gstRate}% Gst (${data.calculationType || "add"})`;
            resultDesc = `Total: ₹${data.finalAmount}`;
          } else if (colName === "emi_history") {
            inputDesc = `Principal: ₹${data.loanAmount} for ${data.loanTenure} Mths @ ${data.interestRate}%`;
            resultDesc = `EMI: ₹${data.monthlyEmi}/mo`;
          } else if (colName === "age_history") {
            inputDesc = `DOB: ${data.dob}`;
            resultDesc = `Age: ${data.years}y ${data.months}m ${data.days}d`;
          } else if (colName === "qr_history") {
            inputDesc = `Encoding: [${(data.type || "text").toUpperCase()}]`;
            resultDesc = data.inputData || "";
          } else if (colName === "password_history") {
            inputDesc = `Length: ${data.length} (${Object.keys(data.config || {}).filter(k => data.config[k]).join(", ")})`;
            resultDesc = data.generatedPassword || "";
          }

          return {
            id: docSnap.id,
            collectionName: colName,
            toolName: data.toolName || "Smart Tool",
            timestamp: rawDate,
            inputDescription: inputDesc,
            resultDescription: resultDesc,
            rawRecord: data
          } as HistoryItem;
        });
      });

      const results = await Promise.all(allPromises);
      const flattened = results.flat();
      
      // Sort newest first
      flattened.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecords(flattened);
    } catch (err) {
      console.error("Failed to query history logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteSingle = async (item: HistoryItem) => {
    try {
      await deleteDoc(doc(db, item.collectionName, item.id));
      setRecords((prev) => prev.filter((r) => !(r.id === item.id && r.collectionName === item.collectionName)));
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };

  const handleDeleteAll = async () => {
    const user = auth.currentUser;
    if (!user || records.length === 0) return;

    let confirmed = false;
    try {
      confirmed = window.confirm("Are you sure you want to permanently wipe all stored history records? Change is irreversible.");
    } catch (e) {
      console.warn("window.confirm block/unsupported in sandbox context:", e);
      confirmed = true; // Fallback to auto-confirm if browser sandbox blocks user prompt
    }

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // Fetch and delete all user records sequentially or using batch
      for (const colName of collectionsList) {
        const q = query(collection(db, colName), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
      }

      await batch.commit();
      setRecords([]);
    } catch (err) {
      console.error("Failed to clear database logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordReveal = (recordId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // Filter records based on UI configurations
  const filteredRecords = records.filter((rec) => {
    const matchesTool = selectedTool === "All" || rec.toolName === selectedTool;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      rec.toolName.toLowerCase().includes(searchLower) ||
      rec.inputDescription.toLowerCase().includes(searchLower) ||
      rec.resultDescription.toLowerCase().includes(searchLower);

    return matchesTool && matchesSearch;
  });

  // Paginated elements chunking
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTool]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md max-w-5xl mx-auto my-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display text-white">Activity Dashboard</h2>
            <p className="text-sm text-slate-400">View and manage execution trials processed in your session profile</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title="Refresh History Database"
          >
            <ListRestart className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={records.length === 0}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-semibold text-xs transition-all border border-rose-500/20 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Database</span>
          </button>
        </div>
      </div>

      {/* Filter Options Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search activities by input parameters or outcomes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-650 text-sm outline-none transition-all"
          />
        </div>

        <div className="md:col-span-4 relative">
          <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="All">All Tools</option>
            <option value="GST Calculator">GST Calculator</option>
            <option value="EMI Calculator">EMI Calculator</option>
            <option value="Age Calculator">Age Calculator</option>
            <option value="QR Code Generator">QR Code Generator</option>
            <option value="Password Generator">Password Generator</option>
          </select>
          <div className="absolute right-3.5 top-4 pointer-events-none text-slate-500">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Loading Spinners */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400 font-medium select-none">Synchronizing database nodes...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="py-20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
          <h4 className="text-base font-bold text-slate-300">No logs found</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
            Your execution runs are saved automatically when registered. Fire up any calculator or creator to trigger.
          </p>
        </div>
      ) : paginatedRecords.length === 0 ? (
        <div className="py-20 flex flex-col items-center">
          <Search className="w-10 h-10 text-slate-700 mb-3" />
          <h4 className="text-slate-400 text-sm font-semibold">No results match your active search filter</h4>
        </div>
      ) : (
        /* History list elements mapping */
        <div className="space-y-3.5">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            <div className="col-span-3">Tool Name</div>
            <div className="col-span-4">Execution Parameters</div>
            <div className="col-span-3">Outcome Result</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <AnimatePresence mode="popLayout">
            {paginatedRecords.map((item) => (
              <motion.div
                key={`${item.collectionName}_${item.id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-800/80 hover:bg-slate-950 transition-all text-slate-200 text-sm"
              >
                {/* Micro Tool Name with Badge */}
                <div className="sm:col-span-3 flex items-start gap-2.5 sm:block">
                  <span className="text-slate-400 font-bold sm:hidden text-xs uppercase block mb-1">Tool Name</span>
                  <div>
                    <h4 className="font-extrabold text-white tracking-wide">{item.toolName}</h4>
                    <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-550" />
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Configuration readouts */}
                <div className="sm:col-span-4">
                  <span className="text-slate-400 font-bold sm:hidden text-xs uppercase block mb-1">Inputs</span>
                  <div className="font-mono text-xs text-slate-400 break-words">{item.inputDescription}</div>
                </div>

                {/* Results columns */}
                <div className="sm:col-span-3">
                  <span className="text-slate-400 font-bold sm:hidden text-xs uppercase block mb-1">Output Result</span>
                  <div className="flex items-center gap-2">
                    {item.collectionName === "password_history" ? (
                      <>
                        <span className={`font-mono text-xs break-all ${
                          showPasswords[item.id] ? "text-indigo-300 font-bold" : "text-indigo-400/20 blur-[3px]"
                        }`}>
                          {item.resultDescription}
                        </span>
                        <button
                          onClick={() => togglePasswordReveal(item.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                        >
                          {showPasswords[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    ) : (
                      <span className="font-mono text-xs font-bold text-indigo-300 break-all">{item.resultDescription}</span>
                    )}
                  </div>
                </div>

                {/* Delete Individual action button */}
                <div className="sm:col-span-2 text-right">
                  <button
                    onClick={() => handleDeleteSingle(item)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination Footer Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-850 mt-6 text-xs text-slate-400 select-none">
              <span>Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> - <strong>{Math.min(currentPage * pageSize, totalRecords)}</strong> of <strong>{totalRecords}</strong> calculations</span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center px-3 bg-slate-900 border border-slate-800 h-7 rounded font-mono font-bold text-white">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
