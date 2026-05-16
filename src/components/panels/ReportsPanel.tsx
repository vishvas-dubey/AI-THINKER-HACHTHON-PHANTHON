"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, AlertTriangle, CheckCircle, ChevronRight, X } from "lucide-react";

interface Report {
  id: string;
  timestamp: string;
  prompt: string;
  status: "success" | "critical" | "failed";
  analysis: string;
  logs: { timestamp: string; message: string }[];
}

export const ReportsPanel = ({ onClose }: { onClose: () => void }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-[500px] bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[100] shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          <h2 className="text-xl font-bold text-white tracking-tight">Test History</h2>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center text-white/30 mt-20">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No reports found yet. Run an investigation to generate one.</p>
          </div>
        ) : !selectedReport ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReport(report)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {report.status === "critical" ? (
                      <AlertTriangle size={16} className="text-red-500" />
                    ) : (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${report.status === "critical" ? "text-red-500" : "text-green-500"}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/30">
                    <Clock size={12} />
                    {new Date(report.timestamp).toLocaleString()}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white mb-1 line-clamp-2">{report.prompt}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-white/40">{report.logs.length} events logged</span>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedReport(null)}
              className="text-xs text-primary flex items-center gap-1 hover:underline mb-4"
            >
              ← Back to list
            </button>
            
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Investigation Prompt</h3>
              <p className="text-lg text-white font-medium">{selectedReport.prompt}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Final Analysis</h3>
              <p className="text-sm text-white/80 leading-relaxed italic">"{selectedReport.analysis}"</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Event Log</h3>
              <div className="space-y-2">
                {selectedReport.logs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-[11px] font-mono leading-tight">
                    <span className="text-white/20 shrink-0">{log.timestamp.split('T')[1].split('.')[0]}</span>
                    <span className={
                      log.message.includes('AGENT') ? 'text-primary' : 
                      log.message.includes('ERROR') || log.message.includes('Error') ? 'text-red-400' : 
                      'text-white/60'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
