"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity } from "lucide-react";

const generateData = (isCritical: boolean) => {
  const now = new Date();
  return Array.from({ length: 15 }).map((_, i) => {
    const time = new Date(now.getTime() - (15 - i) * 60000);
    const baseLatency = 100 + Math.random() * 50;
    const latency = isCritical && i > 10 ? baseLatency * (i - 9) * 2 : baseLatency;
    const errors = isCritical && i > 10 ? (i - 10) * 15 + Math.random() * 10 : 0;
    return {
      time: `${time.getHours()}:${time.getMinutes()}`,
      latency: Math.min(latency, 3000),
      errors: Math.min(errors, 100)
    };
  });
};

export const MetricsPanel = ({ isCritical }: { isCritical?: boolean }) => {
  const chartData = generateData(!!isCritical);
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
            <AreaChart data={chartData}>
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
            <LineChart data={chartData}>
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
