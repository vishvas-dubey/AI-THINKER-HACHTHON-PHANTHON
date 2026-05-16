"use client";

import { motion } from "framer-motion";
import { Shield, Activity, Users, AlertTriangle, CheckCircle, Zap, History, FilePlus } from "lucide-react";

interface MetricProps {
  label: string;
  value: number;
  status: "success" | "warning" | "error";
  icon: any;
}

const MetricCircle = ({ label, value, status, icon: Icon }: MetricProps) => {
  const color = status === "success" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444";
  
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
      <div className="relative w-12 h-12 mb-1.5">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-white/10"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke={color}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={125.6}
            initial={{ strokeDashoffset: 125.6 }}
            animate={{ strokeDashoffset: 125.6 - (125.6 * value) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-0.5">{label}</span>
      <span className="text-xs font-bold text-white">{value}%</span>
    </div>
  );
};

export const ReleaseHealthPanel = ({ isCritical, fileUrl, onOpenTestGen }: { isCritical?: boolean, fileUrl?: string, onOpenTestGen?: () => void }) => {
  const metrics = [
    { label: "Functional", value: 38, status: "warning", icon: CheckCircle },
    { label: "Security", value: 15, status: "error", icon: Shield },
    { label: "Performance", value: 42, status: "warning", icon: Zap },
    { label: "Accessibility", value: 0, status: "error", icon: Users },
    { label: "Regression", value: 24, status: "warning", icon: Activity },
    { label: "AI Fraud", value: 50, status: "warning", icon: AlertTriangle },
  ];

  const criticalMetrics = [
    { label: "Functional", value: 98, status: "success", icon: CheckCircle },
    { label: "Security", value: 95, status: "success", icon: Shield },
    { label: "Performance", value: 92, status: "success", icon: Zap },
    { label: "Accessibility", value: 90, status: "success", icon: Users },
    { label: "Regression", value: 94, status: "success", icon: Activity },
    { label: "AI Fraud", value: 99, status: "success", icon: AlertTriangle },
  ];

  const displayMetrics = isCritical ? criticalMetrics : metrics;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel w-full h-full flex flex-col overflow-hidden"
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          <span className="text-sm font-medium tracking-wider text-white/80 uppercase text-xs">Release Scorecard</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenTestGen}
            className="px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5"
            title="Create Test Cases"
          >
            <FilePlus size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Test Generator</span>
          </button>

          <button 
            onClick={(window as any).openApiTester}
            className="px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
            title="Run API Tests"
          >
            <Zap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">API Tester</span>
          </button>
          
          {isCritical ? (
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] text-green-400 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <CheckCircle size={12} />
              RELEASE STATUS: GO
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] text-red-400 font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={12} />
              RELEASE STATUS: NO-GO
            </div>
          )}
          <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] text-primary font-bold">
            LIVE AUDIT
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar">
        {displayMetrics.map((m, i) => (
          <MetricCircle key={i} {...m as any} />
        ))}
      </div>
    </motion.div>
  );
};
