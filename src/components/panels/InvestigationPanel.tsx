"use client";

import { motion } from "framer-motion";
import { Search, Cpu, Shield, Zap, Layout } from "lucide-react";

export const InvestigationPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel w-full max-w-2xl mx-auto flex flex-col overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3 bg-white/5">
        <Search size={20} className="text-primary" />
        <span className="text-lg font-medium text-white tracking-tight">Active Investigation</span>
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        </div>
      </div>
      
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative z-10">
            <Cpu size={40} className="text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Synthesizing Workspace</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            "Investigate checkout outage after latest deployment."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {[
            { label: "QA Analysis", icon: Shield, color: "text-green-400" },
            { label: "Infra Audit", icon: Zap, color: "text-yellow-400" },
            { label: "Graph Construction", icon: Search, color: "text-blue-400" },
            { label: "Layout Synth", icon: Layout, color: "text-purple-400" },
          ].map((task, i) => (
            <motion.div
              key={task.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <task.icon size={16} className={task.color} />
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-white/80">{task.label}</span>
                <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2, delay: 0.5 + i * 0.2 }}
                    className={`h-full bg-current ${task.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
