"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopologyMap } from "../panels/TopologyMap";
import { StreamingLogs } from "../panels/StreamingLogs";
import { RollbackConsole } from "../panels/RollbackConsole";
import { IncidentTimeline } from "../panels/IncidentTimeline";
import { InvestigationPanel } from "../panels/InvestigationPanel";
import { MetricsPanel } from "../panels/MetricsPanel";
import { DebuggerPanel } from "../panels/DebuggerPanel";
import { PanelConfig, WorkspaceConfig, generateWorkspace } from "@/runtime-layout/generateWorkspace";
import { Command, Sparkles, Search, Activity, Shield, Terminal } from "lucide-react";
import { AgentActivity } from "./AgentActivity";

export const Workspace = () => {
  const [scene, setScene] = useState(0);
  const [promptInput, setPromptInput] = useState("Investigate checkout outage after latest deployment.");
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(generateWorkspace(0, [], promptInput));
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  useEffect(() => {
    // Generate the next state based on the scene index
    setWorkspace(prev => generateWorkspace(scene, prev.logs, promptInput));

    // Update active agents based on scene
    if (scene === 1) setActiveAgents(["architect"]);
    if (scene === 2) setActiveAgents(["qa", "infra", "topology"]);
    if (scene === 3) setActiveAgents(["qa", "infra", "recovery", "architect"]);
    if (scene === 4) setActiveAgents(["qa", "infra", "recovery"]);
    if (scene === 0) setActiveAgents([]);
  }, [scene]);

  const handlePrompt = () => {
    setScene(1);
    // Simulate agent processing with longer delays for demo presentation
    setTimeout(() => setScene(2), 6000); // 6 seconds in Investigation mode
    setTimeout(() => setScene(3), 14000); // 14 seconds before Critical War Room mode
  };

  const handleRollback = () => {
    setScene(4);
  };

  const renderPanel = (panel: PanelConfig) => {
    switch (panel.type) {
      case "topology_map":
        return <TopologyMap data={panel.data} />;
      case "rollback_console":
        return <RollbackConsole onRollback={handleRollback} />;
      case "incident_timeline":
        return <IncidentTimeline data={panel.data} />;
      case "streaming_logs":
        return <StreamingLogs logs={workspace.logs} />;
      case "investigation_panel":
        return <InvestigationPanel />;
      case "metrics_panel":
        return <MetricsPanel isCritical={panel.data?.alert} />;
      case "debugger_panel":
        return <DebuggerPanel />;
      default:
        return null;
    }
  };

  const getGridClasses = (layout: string) => {
    switch (layout) {
      case "investigation":
        return "flex items-center justify-center p-8";
      case "war_room":
        return "grid grid-cols-12 grid-rows-12 gap-4 p-4";
      case "recovery":
        return "grid grid-cols-12 grid-rows-12 gap-4 p-4";
      default:
        return "flex items-center justify-center p-8";
    }
  };

  const getPanelStyles = (panel: PanelConfig) => {
    if (workspace.layout === "investigation") return {};
    return {
      gridArea: panel.gridArea
    };
  };

  const getPanelClasses = (panel: PanelConfig) => {
    if (workspace.layout === "investigation") {
      return "w-full max-w-4xl h-[600px]";
    }
    return "w-full h-full";
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent overflow-x-hidden overflow-y-auto custom-scrollbar">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
            <Command size={18} className="text-primary" />
          </div>
          <span className="font-bold text-lg tracking-wider text-white">PHANTOM<span className="text-primary">OPS</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <Sparkles size={14} className="text-primary" />
            AI Workspace Active
          </div>
          {scene !== 0 && (
            <button 
              onClick={() => setScene(0)}
              className="text-xs text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              Reset Workspace
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className={`flex-1 relative transition-all duration-1000 p-6 flex flex-col ${workspace.layout !== 'empty' ? getGridClasses(workspace.layout) : 'items-center justify-center'}`}>
        <AnimatePresence mode="popLayout">
          {scene === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center max-w-2xl text-center space-y-8 mt-24"
            >
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Command size={48} className="text-white/20" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">AI Operational Workspace</h1>
              <p className="text-lg text-white/50">Enter a command to spawn an autonomous investigation.</p>
              
              <div className="w-full relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-black/50 border border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  <Search className="text-white/40 ml-4" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g. Investigate checkout outage after latest deployment..."
                    className="w-full bg-transparent text-white px-4 py-4 outline-none placeholder:text-white/30"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePrompt()}
                  />
                  <button 
                    onClick={handlePrompt}
                    className="bg-primary hover:bg-blue-600 text-white px-6 py-4 font-semibold transition-colors flex items-center gap-2"
                  >
                    Execute
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            workspace.panels.map(panel => (
              <motion.div
                key={panel.id}
                layoutId={panel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                className={getPanelClasses(panel)}
                style={getPanelStyles(panel)}
              >
                {renderPanel(panel)}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      <AgentActivity activeAgents={activeAgents} />
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        {workspace.status === "critical" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute inset-0 bg-red-950/20 blur-[120px]"
          />
        )}
      </div>
    </div>
  );
};
