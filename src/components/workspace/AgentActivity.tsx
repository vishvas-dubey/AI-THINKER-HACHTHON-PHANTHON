"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Cpu, Search, Layout, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const agents = [
  { id: "qa", name: "QA Agent", icon: Shield, color: "text-green-400", dot: "bg-green-400" },
  { id: "infra", name: "Infra Agent", icon: Activity, color: "text-yellow-400", dot: "bg-yellow-400" },
  { id: "recovery", name: "Recovery Agent", icon: Cpu, color: "text-red-400", dot: "bg-red-400" },
  { id: "topology", name: "Topology Agent", icon: Search, color: "text-blue-400", dot: "bg-blue-400" },
  { id: "architect", name: "UI Architect", icon: Layout, color: "text-purple-400", dot: "bg-purple-400" },
];

export const AgentActivity = ({ activeAgents }: { activeAgents: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (activeAgents.length === 0) return null;

  return (
    <div className="fixed top-24 left-6 flex flex-col gap-2 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2 glass-panel hover:bg-white/5 transition-colors w-48"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {activeAgents.slice(0, 3).map((agentId, i) => (
              <div key={agentId} className={`w-5 h-5 rounded-full border border-black flex items-center justify-center bg-white/10 ${agents.find(a => a.id === agentId)?.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${agents.find(a => a.id === agentId)?.dot}`} />
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-white/70">Swarm ({activeAgents.length})</span>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            {agents.map((agent) => {
              const isActive = activeAgents.includes(agent.id);
              if (!isActive) return null;
              
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel px-4 py-3 flex items-center gap-4 min-w-[200px]"
                >
                  <div className={`p-1.5 rounded bg-white/5 ${agent.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Active Agent</p>
                    <p className="text-sm font-semibold text-white/90">{agent.name}</p>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-2 h-2 rounded-full ${agent.dot}`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
