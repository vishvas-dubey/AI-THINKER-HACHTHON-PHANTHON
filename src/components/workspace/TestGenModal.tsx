/** 🤖 AI-POWERED COMPONENT - PHANTOM-OPS AUTONOMOUS QA **/
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  FilePlus, 
  Upload, 
  Search, 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  Download,
  Loader2,
  CheckCircle,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface TestGenModalProps {
  onClose: () => void;
  onReset: () => void;
}

export const TestGenModal = ({ onClose, onReset }: TestGenModalProps) => {
  const [step, setStep] = useState<"choice" | "loading">("choice");
  const [flowName, setFlowName] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep("loading");
    setError("");
    
    try {
      const res = await fetch("/api/generate-test-cases", {
        method: "POST",
        body: JSON.stringify({ flowName: flowName || "Manual Flow" })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || "API failed");
      }
      
      const data = await res.json();
      
      if (data.url) {
        setGeneratedUrl(data.url);
        setStep("choice"); // Stay on same page
      } else {
        throw new Error("No URL returned");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "API issue right now. AI Swarm is over capacity.");
      setStep("choice");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            <ArrowLeft size={18} />
            <span className="font-bold tracking-tight uppercase text-xs text-white">Return to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" size={24} />
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Autonomous Test Generator</h1>
          </div>

          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-red-400/60 hover:text-red-400 transition-colors px-4 py-2 rounded-lg bg-red-500/5 border border-red-500/10"
          >
            <RotateCcw size={18} />
            <span className="font-bold tracking-tight uppercase text-xs">Reset Workspace</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "choice" && (
            <motion.div 
              key="choice"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="space-y-6"
            >
              {/* Success Result Banner */}
              {generatedUrl && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-between shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase italic tracking-tighter">Test Scenarios Ready</h4>
                      <p className="text-white/40 text-xs">AI Swarm has successfully generated the test matrix for your flow.</p>
                    </div>
                  </div>
                  <a 
                    href={generatedUrl}
                    download
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-green-500 transition-all"
                  >
                    <Download size={18} />
                    DOWNLOAD CSV
                  </a>
                </motion.div>
              )}

              {/* Error Banner */}
              {error && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center gap-3 text-red-400 font-bold text-sm"
                >
                  <AlertTriangle size={18} />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Upload Option */}
                <div className="glass-panel p-8 flex flex-col items-center text-center group hover:border-primary/50 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    id="flow-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFlowName(file.name.split('.')[0]);
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={40} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase italic tracking-tighter">Upload Technical Flow</h3>
                  <p className="text-white/40 text-sm mb-6">Upload your PRDs or diagrams to generate scenarios.</p>
                  <button 
                    type="button"
                    className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all pointer-events-none"
                  >
                    SELECT FILE
                  </button>
                </div>

                {/* Search Option */}
                <div className="glass-panel p-8 flex flex-col items-center text-center group hover:border-purple-500/50 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Search size={40} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase italic tracking-tighter">Search via Flow Name</h3>
                  <p className="text-white/40 text-sm mb-6">Type a flow name and our AI will build the matrix.</p>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGenerate(e);
                    }} 
                    className="w-full flex gap-2"
                  >
                    <input 
                      type="text" 
                      placeholder="e.g. Payments..."
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                    />
                    <button 
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-all text-xs"
                    >
                      GENERATE
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-20 flex flex-col items-center text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <Loader2 size={96} className="text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-4">Orchestrating AI Swarm</h2>
              <p className="text-white/40 max-w-md mx-auto">Our agents are scanning existing test vectors and identifying missing edge cases. Please wait...</p>
              
              <div className="w-full max-w-md mt-12 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
