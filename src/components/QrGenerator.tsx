import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { addHistoryRecord } from "../lib/localHistory";
import { 
  QrCode, 
  Download, 
  Share2, 
  Save, 
  Check, 
  Type, 
  Link2, 
  Mail, 
  PhoneCall,
  Loader2,
  Copy
} from "lucide-react";

type QrInputType = "text" | "url" | "email" | "phone";

export default function QrGenerator() {
  const [inputType, setInputType] = useState<QrInputType>("url");
  const [inputValue, setInputValue] = useState("");
  
  // Custom states for each input type
  const [textVal, setTextVal] = useState("Hello from ToolVerse!");
  const [urlVal, setUrlVal] = useState("https://digitalheroesco.com");
  const [emailVal, setEmailVal] = useState("ashishranjan6206@gmail.com");
  const [phoneVal, setPhoneVal] = useState("+916206000000");

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine current active input string
  const getActivePayload = () => {
    switch (inputType) {
      case "text": return textVal;
      case "url": return urlVal;
      case "email": return `mailto:${emailVal}`;
      case "phone": return `tel:${phoneVal}`;
      default: return "";
    }
  };

  const payload = getActivePayload();

  // Draw QR on canvas
  const drawQR = async () => {
    if (!canvasRef.current || !payload) return;
    try {
      await QRCode.toCanvas(canvasRef.current, payload, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "H", // High correction level allows logo watermark overlay
        color: {
          dark: "#0f172a", // Navy-Slate
          light: "#ffffff",
        },
      });

      // Canvas element
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const size = canvas.width;
        // Draw Watermark DH Center Icon
        const logoSize = 56;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        // Draw white frame overlay
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x - 5, y - 5, logoSize + 10, logoSize + 10, 10);
        } else {
          ctx.rect(x - 5, y - 5, logoSize + 10, logoSize + 10);
        }
        ctx.fill();

        // Draw Purple Badge
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, logoSize, logoSize, 8);
        } else {
          ctx.rect(x, y, logoSize, logoSize);
        }
        ctx.fill();

        // Add Digital Heroes watermark logo text "DH"
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DH", size / 2, size / 2);
      }
    } catch (err) {
      console.error("QR Code rendering error:", err);
    }
  };

  useEffect(() => {
    drawQR();
  }, [inputType, textVal, urlVal, emailVal, phoneVal, payload]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `ToolVerse_QR_${inputType}_${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      const url = canvasRef.current.toDataURL("image/png");
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "toolverse_qr.png", { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ToolVerse QR Code",
          text: `QR Code sharing from ToolVerse. Generated with DH watermark.`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        // Fallback to clipboard URL or payload copy
        navigator.clipboard.writeText(payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Sharing failed, copying payload.", err);
      // fallback
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToHistory = async () => {
    setLoading(true);
    setSaved(false);
    try {
      addHistoryRecord("qr_history", {
        toolName: "QR Code Generator",
        type: inputType,
        inputData: payload,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Firestore Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-white">QR Code Generator</h2>
          <p className="text-xs text-slate-400">Generate high-fidelity vector QR codes branded with DH watermark</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters (Column Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Input Type selection buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              QR Content Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setInputType("url")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 ${
                  inputType === "url"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>

              <button
                type="button"
                onClick={() => setInputType("text")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 ${
                  inputType === "text"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>

              <button
                type="button"
                onClick={() => setInputType("email")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 ${
                  inputType === "email"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setInputType("phone")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 ${
                  inputType === "phone"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Phone</span>
              </button>
            </div>
          </div>

          {/* Dynamic input form based on type */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
            {inputType === "url" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Destination URL</label>
                <input
                  type="url"
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                />
              </div>
            )}

            {inputType === "text" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Custom Content Text</label>
                <textarea
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="Write message here..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all resize-none"
                />
              </div>
            )}

            {inputType === "email" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Receiver Email Address</label>
                <input
                  type="email"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                />
              </div>
            )}

            {inputType === "phone" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number (with country code)</label>
                <input
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                />
              </div>
            )}

            {/* Readout of compiled payloads */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Encoded Data String:</span>
              <span className="font-mono text-xs text-indigo-300 break-all select-all font-medium">{payload}</span>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Frame (Column Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 font-display">Live QR Generator Output</h3>
            
            {/* Interactive QR frame */}
            <div className="relative p-4 bg-white rounded-2xl shadow-xl shadow-slate-950/50 inline-block overflow-hidden border border-slate-800">
              <canvas 
                ref={canvasRef} 
                className="w-56 h-56 mx-auto sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-56 lg:h-56 xl:w-64 xl:h-64 block" 
              />
            </div>
            
            <p className="text-[10px] text-slate-500 mt-3 italic">
              * Centers a high-contrast <strong>DH</strong> identification badge of corporate integrity.
            </p>
          </div>

          {/* QR Action row buttons */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6">
            <button
              onClick={handleDownload}
              className="py-2.5 px-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveToHistory}
              disabled={loading}
              className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving" : "Save DB"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
