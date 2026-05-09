"use client";

import { motion } from "framer-motion";
import { AlertOctagon, RotateCcw } from "lucide-react";

export const RollbackConsole = ({ onRollback }: { onRollback: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel w-full h-full flex flex-col overflow-hidden bg-red-950/20"
    >
      <div className="border-b border-red-500/30 px-4 py-3 flex items-center gap-2 bg-red-500/10">
        <AlertOctagon size={16} className="text-red-400" />
        <span className="text-sm font-medium tracking-wider text-red-200 uppercase">Emergency Controls</span>
      </div>
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Critical Failure in Checkout v2.1.4</h3>
          <p className="text-sm text-red-200">The latest deployment has caused a 100% failure rate in the checkout flow. AI Recovery Agent recommends immediate rollback.</p>
        </div>
        
        <div className="flex gap-4 w-full max-w-md">
          <button 
            onClick={onRollback}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
          >
            <RotateCcw size={18} />
            EXECUTE ROLLBACK TO v2.1.3
          </button>
        </div>
      </div>
    </motion.div>
  );
};
