"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, Search, Shield, Layout } from "lucide-react";

const agents = [
  { id: "qa", name: "QA Agent", icon: Shield, color: "text-green-400" },
  { id: "infra", name: "Infra Agent", icon: Zap, color: "text-yellow-400" },
  { id: "recovery", name: "Recovery Agent", icon: Cpu, color: "text-red-400" },
  { id: "topology", name: "Topology Agent", icon: Search, color: "text-blue-400" },
  { id: "architect", name: "UI Architect", icon: Layout, color: "text-purple-400" },
];

export const AgentActivity = ({ activeAgents }: { activeAgents: string[] }) => {
  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {agents.map((agent) => {
          const isActive = activeAgents.includes(agent.id);
          if (!isActive) return null;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.8 }}
              className="glass-panel px-4 py-2 flex items-center gap-3 bg-black/60 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              <div className={`p-1.5 rounded bg-white/5 border border-white/10 ${agent.color}`}>
                <agent.icon size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Active Agent</span>
                <span className="text-sm text-white font-medium">{agent.name}</span>
              </div>
              <div className="ml-4 flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-1.5 h-1.5 rounded-full bg-current ${agent.color}`} 
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
