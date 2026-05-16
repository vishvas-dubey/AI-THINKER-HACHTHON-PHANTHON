"use client";

import { useEffect, useState, useMemo } from "react";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export const TopologyMap = ({ data, isCritical: isCriticalProp }: { data?: any, isCritical?: boolean }) => {
  const isAlert = data?.alert || isCriticalProp;
  const isRecovered = data?.recovered;
  const isCritical = isCriticalProp;

  const initialNodes: Node[] = [
    { id: "1", position: { x: 250, y: 50 }, data: { label: "API Gateway" }, style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } },
    { id: "2", position: { x: 100, y: 150 }, data: { label: "Auth Service" }, style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } },
    { id: "3", position: { x: 400, y: 150 }, data: { label: "Checkout Service" }, style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } },
    { id: "4", position: { x: 250, y: 250 }, data: { label: "Database" }, style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#fff" } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#fff" } },
    { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#fff" } },
    { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "#fff" } },
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === "3") {
          if (isAlert) {
            return {
              ...n,
              className: "pulse-glow-red",
              style: { ...n.style, background: "#7f1d1d", borderColor: "#ef4444" },
            };
          } else if (isRecovered) {
            return {
              ...n,
              className: "",
              style: { ...n.style, background: "#14532d", borderColor: "#22c55e" },
            };
          } else {
            return {
              ...n,
              className: "",
              style: { ...n.style, background: "#1e293b", borderColor: "#334155" },
            };
          }
        }
        return n;
      })
    );

    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === "e1-3" || e.id === "e3-4") {
          if (isAlert) {
            return { ...e, style: { stroke: "#ef4444" }, animated: true };
          } else if (isRecovered) {
            return { ...e, style: { stroke: "#22c55e" }, animated: true };
          }
        }
        return e;
      })
    );
  }, [isAlert, isRecovered]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel w-full h-full flex flex-col overflow-hidden relative ${isCritical ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : ""}`}
    >
      <style jsx global>{`
        .react-flow__attribution, .react-flow__attribution * {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 bg-white/5 z-10 shrink-0">
        <Activity size={16} className={isAlert ? "text-red-400" : isRecovered ? "text-green-400" : "text-primary"} />
        <span className="text-sm font-medium tracking-wider text-white/80 uppercase">Service Topology</span>
        {isAlert && <span className="ml-auto text-xs text-red-400 font-bold animate-pulse">CRITICAL OUTAGE DETECTED</span>}
      </div>
      <div className="flex-1 relative bg-black/20">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#ffffff" gap={16} size={1} />
        </ReactFlow>
      </div>
    </motion.div>
  );
};
