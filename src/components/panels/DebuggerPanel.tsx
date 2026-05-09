"use client";

import { motion } from "framer-motion";
import { Code, FileCode } from "lucide-react";

export const DebuggerPanel = () => {
  const code = `// AGENT [Recovery]: Identified Regression in Payment Gateway
// Location: /services/checkout/payment-handler.ts

export async function processPayment(orderId: string) {
-  const gateway = await getGatewayV2();
-  const response = await gateway.authorize(orderId); 
+  // Reverting to stable V1 gateway
+  const gateway = await getGatewayV1();
+  const response = await gateway.process(orderId);
  
  if (response.status === 'error') {
    throw new PaymentError(response.code);
  }
  return response;
}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel w-full h-full flex flex-col overflow-hidden"
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 bg-white/5">
        <Code size={16} className="text-purple-400" />
        <span className="text-sm font-medium tracking-wider text-white/80 uppercase">AI Code Analysis</span>
      </div>
      <div className="flex-1 p-4 bg-black/40 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <FileCode size={14} className="text-white/40" />
          <span className="text-xs text-white/40 font-mono">payment-handler.ts</span>
        </div>
        <pre className="flex-1 overflow-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-white/70 p-3 bg-white/5 rounded border border-white/5">
          {code.split("\n").map((line, i) => (
            <div key={i} className={line.startsWith('+') ? 'text-green-400 bg-green-400/10' : line.startsWith('-') ? 'text-red-400 bg-red-400/10' : ''}>
              <span className="inline-block w-4 text-white/20 select-none mr-2">{i + 1}</span>
              {line}
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  );
};
