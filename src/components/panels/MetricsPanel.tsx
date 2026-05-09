"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity } from "lucide-react";

const data = [
  { time: "10:40", latency: 120, errors: 0 },
  { time: "10:41", latency: 132, errors: 0 },
  { time: "10:42", latency: 101, errors: 0 },
  { time: "10:43", latency: 134, errors: 2 },
  { time: "10:44", latency: 850, errors: 45 },
  { time: "10:45", latency: 2100, errors: 89 },
  { time: "10:46", latency: 2450, errors: 100 },
];

export const MetricsPanel = ({ isCritical }: { isCritical?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel w-full h-full flex flex-col overflow-hidden ${isCritical ? "border-red-500/30" : ""}`}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 bg-white/5">
        <Activity size={16} className={isCritical ? "text-red-400" : "text-primary"} />
        <span className="text-sm font-medium tracking-wider text-white/80 uppercase">System Telemetry</span>
      </div>
      <div className="flex-1 p-4">
        <div className="h-1/2 w-full mb-4">
          <p className="text-[10px] uppercase text-white/40 mb-2 font-bold">Latency (ms)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isCritical ? "#ef4444" : "#3b82f6"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isCritical ? "#ef4444" : "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 3000]} />
              <Tooltip 
                contentStyle={{ background: "#000", border: "1px solid #ffffff20", fontSize: "10px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="latency" stroke={isCritical ? "#ef4444" : "#3b82f6"} fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-1/2 w-full">
          <p className="text-[10px] uppercase text-white/40 mb-2 font-bold">Error Rate (%)</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ background: "#000", border: "1px solid #ffffff20", fontSize: "10px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
