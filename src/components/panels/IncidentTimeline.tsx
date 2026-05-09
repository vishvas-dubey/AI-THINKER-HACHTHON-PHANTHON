"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, ShieldAlert, RotateCcw } from "lucide-react";

export const IncidentTimeline = ({ data }: { data?: any }) => {
  const isRecovered = data?.recovered;

  const events = [
    { time: "10:42:00", title: "Deployment v2.1.4 Initiated", icon: CheckCircle, color: "text-blue-400" },
    { time: "10:43:15", title: "Traffic Shift to v2.1.4", icon: CheckCircle, color: "text-blue-400" },
    { time: "10:44:10", title: "Latency Spikes Detected", icon: AlertTriangle, color: "text-yellow-400" },
    { time: "10:44:30", title: "Checkout Error Rate 100%", icon: ShieldAlert, color: "text-red-500" },
  ];

  if (isRecovered) {
    events.push(
      { time: "10:48:00", title: "Rollback to v2.1.3 Executed", icon: RotateCcw, color: "text-blue-400" },
      { time: "10:49:15", title: "Error Rate Normal", icon: CheckCircle, color: "text-green-400" }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel w-full h-full flex flex-col overflow-hidden"
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 bg-white/5">
        <Clock size={16} className="text-primary" />
        <span className="text-sm font-medium tracking-wider text-white/80 uppercase">Incident Timeline</span>
      </div>
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="relative border-l border-white/20 ml-3">
          {events.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="mb-6 ml-6 relative"
              >
                <div className={`absolute -left-[35px] top-1 bg-black rounded-full p-1 border border-white/20 ${e.color}`}>
                  <Icon size={14} />
                </div>
                <div className="text-xs text-white/50 font-mono mb-1">{e.time}</div>
                <div className="text-sm font-medium text-white">{e.title}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
