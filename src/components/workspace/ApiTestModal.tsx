"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Upload, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Sparkles,
  FileCode,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface ApiTestModalProps {
  onClose: () => void;
  onReset: () => void;
}

export const ApiTestModal = ({ onClose, onReset }: ApiTestModalProps) => {
  const [step, setStep] = useState<"upload" | "testing" | "result">("upload");
  const [fileName, setFileName] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const runTests = async () => {
    setStep("testing");
    setTerminalLogs([]);
    
    const logs = [
      "Initializing Newman runner...",
      "Loading OpenAPI 3.0 schema: demo_swagger.json",
      "[PROBE] GET /api/v1/auth - 200 OK (42ms)",
      "[PROBE] GET /api/v1/users/profile - 200 OK (115ms)",
      "[SECURITY SCAN] POST /api/v1/payments/verify - Injecting SQLi payload...",
      "[CRITICAL] POST /api/v1/payments/verify - 500 Internal Server Error",
      "[STRESS TEST] POST /api/v1/kyc/upload - Simulating 100MB payload...",
      "[FAIL] POST /api/v1/kyc/upload - Gateway Timeout",
      "Parsing results and generating report..."
    ];

    for (const log of logs) {
      setTerminalLogs(prev => [...prev, log]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setStep("result");
  };

  const results = {
    working: [
      { path: "/api/v1/auth", method: "GET", latency: "42ms" },
      { path: "/api/v1/users/profile", method: "GET", latency: "115ms" },
      { path: "/api/v1/payments/history", method: "GET", latency: "156ms" },
    ],
    broken: [
      { path: "/api/v1/payments/verify", method: "POST", error: "500 Internal Server Error", detail: "Null pointer at PaymentHandler.go:142" },
      { path: "/api/v1/kyc/upload", method: "POST", error: "Timeout", detail: "Gateway timeout after 30000ms" },
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-5xl relative z-10 flex flex-col h-[80vh]">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            <ArrowLeft size={18} />
            <span className="font-bold tracking-tight uppercase text-xs">Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Globe className="text-purple-400 animate-pulse" size={24} />
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Autonomous API Tester</h1>
          </div>

          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-red-400/60 hover:text-red-400 transition-colors px-4 py-2 rounded-lg bg-red-500/5 border border-red-500/10"
          >
            <RotateCcw size={18} />
            <span className="font-bold tracking-tight uppercase text-xs">Reset</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div 
                key="upload"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <div className="glass-panel p-12 flex flex-col items-center text-center group hover:border-purple-500/50 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        runTests();
                      }
                    }}
                  />
                  <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                    <FileCode size={48} className="text-purple-400" />
                  </div>
                  <h3 className="text-3xl font-black italic tracking-tighter text-white mb-4 uppercase">Upload Swagger / OpenAPI</h3>
                  <p className="text-white/40 mb-10 max-w-sm mx-auto">Drop your API documentation here. Our swarm will automatically test every endpoint for uptime, security, and schema validation.</p>
                  <button 
                    type="button"
                    className="px-10 py-4 rounded-xl bg-purple-500 text-white font-black uppercase italic tracking-tighter hover:bg-purple-600 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] pointer-events-none"
                  >
                    Select Swagger File
                  </button>
                </div>
              </motion.div>
            )}

            {step === "testing" && (
              <motion.div 
                key="testing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-32 h-32 mb-10">
                  <Loader2 size={128} className="text-purple-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={48} className="text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-4">Probing Endpoints...</h2>
                
                {/* Simulated Terminal */}
                <div className="w-full max-w-xl bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-[10px] text-green-400/80 h-48 overflow-y-auto mb-10 text-left custom-scrollbar">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-2">
                      <span className="text-white/20">{">"}</span>
                      <span className={log.includes('[FAIL]') || log.includes('[CRITICAL]') ? 'text-red-400' : ''}>{log}</span>
                    </div>
                  ))}
                  <div className="animate-pulse">_</div>
                </div>

                <div className="w-96 bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-primary"
                  />
                </div>
              </motion.div>
            )}

            {step === "result" && (
              <motion.div 
                key="result"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full grid grid-cols-2 gap-8 overflow-hidden"
              >
                {/* Working APIs */}
                <div className="glass-panel p-6 border-green-500/20 bg-green-500/5 flex flex-col h-[50vh]">
                  <div className="flex items-center gap-3 mb-6 border-b border-green-500/20 pb-4">
                    <CheckCircle className="text-green-500" size={20} />
                    <h3 className="font-black italic text-white uppercase tracking-tighter">Operational Endpoints ({results.working.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {results.working.map((api, i) => (
                      <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">{api.method}</span>
                          <span className="text-sm font-mono text-white/80">{api.path}</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{api.latency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Broken APIs */}
                <div className="glass-panel p-6 border-red-500/20 bg-red-500/5 flex flex-col h-[50vh]">
                  <div className="flex items-center gap-3 mb-6 border-b border-red-500/20 pb-4">
                    <XCircle className="text-red-500" size={20} />
                    <h3 className="font-black italic text-white uppercase tracking-tighter">Critical Failures ({results.broken.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {results.broken.map((api, i) => (
                      <div key={i} className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex flex-col gap-2 group hover:bg-red-500/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">{api.method}</span>
                            <span className="text-sm font-mono text-white">{api.path}</span>
                          </div>
                          <AlertTriangle size={14} className="text-red-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-red-400">{api.error}</span>
                          <span className="text-[10px] text-white/40 font-mono">{api.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex justify-center mt-6">
                   <button 
                    onClick={() => setStep("upload")}
                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                  >
                    TEST NEW SWAGGER
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
