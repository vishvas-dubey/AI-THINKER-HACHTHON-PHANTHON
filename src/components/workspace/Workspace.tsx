"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopologyMap } from "../panels/TopologyMap";
import { StreamingLogs } from "../panels/StreamingLogs";
import { RollbackConsole } from "../panels/RollbackConsole";
import { IncidentTimeline } from "../panels/IncidentTimeline";
import { InvestigationPanel } from "../panels/InvestigationPanel";
import { MetricsPanel } from "../panels/MetricsPanel";
import { DebuggerPanel } from "../panels/DebuggerPanel";
import { PanelConfig, WorkspaceConfig, generateWorkspace } from "@/runtime-layout/generateWorkspace";
import { 
  Zap, 
  Shield, 
  Activity, 
  Terminal, 
  Search, 
  AlertCircle,
  History,
  RotateCcw,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle,
  Command,
  FilePlus
} from "lucide-react";
import { ReleaseHealthPanel } from "../panels/ReleaseHealthPanel";
import { AgentActivity } from "./AgentActivity";
import { ReportsPanel } from "../panels/ReportsPanel";
import { TestGenModal } from "./TestGenModal";
import { ApiTestModal } from "./ApiTestModal";
import { SecurityAuditModal } from "./SecurityAuditModal";

export const Workspace = () => {
  const [scene, setScene] = useState(0);
  const [promptInput, setPromptInput] = useState("Run Release Readiness Audit (Project: Fintech KYC & Payments, Deadline: 72h)");
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(generateWorkspace(0, [], promptInput));
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isTestGenOpen, setIsTestGenOpen] = useState(false);
  const [isApiTestOpen, setIsApiTestOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);

  useEffect(() => {
    (window as any).openApiTester = () => setIsApiTestOpen(true);
    (window as any).openSecurityAudit = () => setIsSecurityAuditOpen(true);
    return () => { 
      delete (window as any).openApiTester; 
      delete (window as any).openSecurityAudit;
    };
  }, []);

  const resetWorkspace = () => {
    setScene(0);
    setWorkspace(generateWorkspace(0, []));
    setAnalysisResult("");
    setIsTestGenOpen(false);
    setIsApiTestOpen(false);
    setIsSecurityAuditOpen(false);
  };

  useEffect(() => {
    // Generate the next state based on the scene index
    setWorkspace(prev => generateWorkspace(scene, prev.logs, promptInput, analysisResult));

    // Update active agents based on scene
    if (scene === 1) setActiveAgents(["qa", "infra"]);
    if (scene === 2) setActiveAgents(["qa", "infra", "topology"]);
    if (scene === 3) setActiveAgents(["qa", "infra", "recovery", "architect"]);
    if (scene === 4) setActiveAgents(["qa", "infra", "recovery"]);
    if (scene === 0) setActiveAgents([]);
  }, [scene, analysisResult]);

  const handlePrompt = async () => {
    setScene(1);
    
    // Clear previous logs and analysis
    setWorkspace(prev => ({ ...prev, logs: [] }));
    setAnalysisResult("");

    try {
      const response = await fetch('/api/qa-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Move to Analysis mode quickly to show logs
      setTimeout(() => setScene(2), 2000);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            
            if (data.type === 'log') {
              setWorkspace(prev => ({
                ...prev,
                logs: [...prev.logs, data.message]
              }));
            } else if (data.type === 'result') {
              setAnalysisResult(data.analysis);
              if (data.status === 'critical') {
                setScene(3); // Enter War Room
              } else {
                // If it succeeded without bugs, just stay in analysis mode
                setWorkspace(prev => ({
                  ...prev,
                  logs: [...prev.logs, "AGENT [System]: Testing completed successfully."]
                }));
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Agent error:", error);
    }
  };

  const handleRollback = () => {
    setScene(4);
  };

  const generatedFileUrl = useMemo(() => {
    if (!analysisResult) return null;
    const match = analysisResult.match(/\/generated\/[a-zA-Z0-9_-]+\.csv/);
    return match ? match[0] : null;
  }, [analysisResult]);

  const renderPanel = (panel: PanelConfig) => {
    switch (panel.type) {
      case "topology_map":
        return <TopologyMap data={panel.data} isCritical={workspace.status === 'critical'} />;
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
      case "release_health":
        return (
          <ReleaseHealthPanel 
            isCritical={workspace.status === 'success'} 
            fileUrl={generatedFileUrl || undefined}
            onOpenTestGen={() => setIsTestGenOpen(true)}
          />
        );
      case "debugger_panel":
        return <DebuggerPanel />;
      default:
        return null;
    }
  };

  const getGridClasses = (layout: string) => {
    switch (layout) {
      case "investigation":
        return "flex items-center justify-center p-8 h-full";
      case "war_room":
        return "grid grid-cols-12 grid-rows-12 gap-4 p-4 h-full";
      case "recovery":
        return "grid grid-cols-12 grid-rows-12 gap-4 p-4 h-full";
      default:
        return "flex items-center justify-center p-8 h-full";
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
      return "w-full max-w-4xl h-[600px] min-h-0";
    }
    return "w-full h-full min-h-0";
  };

  return (
    <div className="h-screen w-full flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-white">NexusQA</span>
            <span className="text-[10px] text-white/50 font-mono tracking-wider">Autonomous SDET Swarm v1.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            System Ready
          </div>
          
          <button 
            onClick={() => setIsReportsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <History size={14} />
            History
          </button>

          {scene !== 0 && (
            <button 
              onClick={() => setScene(0)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
              Reset Workspace
            </button>
          )}

          <button 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className={`flex-1 relative transition-all duration-1000 p-6 flex flex-col overflow-y-auto custom-scrollbar ${workspace.layout !== 'empty' ? getGridClasses(workspace.layout) : 'items-center justify-center'}`}>
        <AnimatePresence mode="popLayout">
          {scene === 0 ? (
            <motion.div 
              key="nexus-dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-full max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6"
            >
              {/* Left Column - Input Panel */}
              <div className="col-span-4 flex flex-col gap-4">
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <h2 className="flex items-center gap-2 text-white/80 font-medium mb-6">
                    <span className="text-blue-500 font-mono">{'>_'}</span> Requirement Input
                  </h2>
                  <textarea 
                    className="w-full flex-1 bg-black/40 border border-white/5 rounded-xl p-4 text-white/90 font-mono text-sm resize-none focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20"
                    placeholder="Enter requirement or type 'api testing'..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handlePrompt}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl p-4 font-semibold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Run QA Swarm
                </button>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-xl rounded-full"></div>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Bugs Detected</span>
                    <span className="text-white/90 text-2xl font-mono">0</span>
                  </div>
                  <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-xl rounded-full"></div>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Inference Speed</span>
                    <span className="text-white/90 text-2xl font-mono">1.2s</span>
                  </div>
                  <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col gap-1 shadow-lg col-span-2 relative overflow-hidden flex-row items-center justify-between">
                    <div className="absolute left-0 bottom-0 w-full h-8 bg-green-500/5 blur-xl"></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Active Nodes</span>
                      <span className="text-white/90 text-2xl font-mono">5</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-green-500/20 flex items-center justify-center bg-green-500/5">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Map & Logs */}
              <div className="col-span-8 flex flex-col gap-6">
                {/* Swarm Map Panel */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 h-64 shadow-2xl relative overflow-hidden flex items-center justify-center">
                  {/* Dotted Background */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                  
                  {/* Connecting Line */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[1px] border-b border-dashed border-white/10"></div>
                  
                  {/* Nodes */}
                  <div className="relative flex justify-between w-full max-w-2xl px-4 z-10">
                    {[
                      { name: 'ANALYST', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="11" cy="14" r="2"/><path d="m12.5 15.5 2.5 2.5"/></svg> },
                      { name: 'SDET', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
                      { name: 'EXECUTOR', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
                      { name: 'HEALER', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
                      { name: 'REPORTER', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
                    ].map((node, i) => (
                      <div key={node.name} className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white/70 shadow-lg relative group cursor-pointer hover:border-white/30 transition-colors">
                          {node.icon}
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-white/40">{node.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logs Panel */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl flex-1 shadow-2xl flex flex-col overflow-hidden relative">
                  <div className="h-10 border-b border-white/5 bg-black/20 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-xs font-mono text-white/40">swarm_execution.log</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                  </div>
                  <div className="p-4 font-mono text-xs text-white/60 space-y-2 flex-1">
                    <div className="text-white/30">{'[09:16:19] Initializing NexusQA Swarm...'}</div>
                    <div className="text-white/30">{'[09:16:19] Waiting for requirement input...'}</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="col-span-12 flex justify-center mt-4">
                <span className="text-[10px] text-white/30 tracking-widest font-mono">
                  © 2026 NEXUS QA • ENGINEERED FOR EXCELLENCE
                </span>
              </div>
            </motion.div>
          ) : (
            <>
              {workspace.panels.map(panel => (
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
              ))}

            </>
          )}
        </AnimatePresence>
      </main>

      <AgentActivity activeAgents={activeAgents} />
      
      <AnimatePresence>
        {isReportsOpen && <ReportsPanel onClose={() => setIsReportsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isTestGenOpen && (
          <TestGenModal 
            onClose={() => setIsTestGenOpen(false)} 
            onReset={resetWorkspace}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isApiTestOpen && (
          <ApiTestModal 
            onClose={() => setIsApiTestOpen(false)} 
            onReset={resetWorkspace}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSecurityAuditOpen && (
          <SecurityAuditModal 
            onClose={() => setIsSecurityAuditOpen(false)} 
            onReset={resetWorkspace}
          />
        )}
      </AnimatePresence>
      
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
