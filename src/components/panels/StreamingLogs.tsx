"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";

export const StreamingLogs = ({ logs }: { logs: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel w-full h-full relative overflow-hidden bg-[#0a0a0a]"
    >
      <div className="border-b border-white/10 px-4 h-12 flex items-center gap-2 bg-white/5 shrink-0 absolute top-0 left-0 w-full z-10">
        <Terminal size={16} className="text-primary" />
        <span className="text-sm font-medium tracking-wider text-white/80 uppercase">Streaming Logs</span>
      </div>
      <div 
        ref={containerRef}
        className="absolute top-12 left-0 w-full bottom-0 p-4 pb-8 overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed"
      >
        {logs.map((log, i) => {
          let color = "text-white/60";
          if (log.includes("CRITICAL") || log.includes("failed")) color = "text-red-400";
          else if (log.includes("recovered") || log.includes("passing")) color = "text-green-400";
          else if (log.includes("AGENT")) color = "text-blue-400";
          else if (log.includes("USER")) color = "text-white";

          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              key={i}
              className={`mb-1 ${color}`}
            >
              <span className="text-white/30 mr-2">[{new Date().toISOString().split("T")[1].substring(0,8)}]</span>
              {log}
            </motion.div>
          );
        })}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-4 bg-primary animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
