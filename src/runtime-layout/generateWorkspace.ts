export type PanelType = "topology_map" | "rollback_console" | "incident_timeline" | "streaming_logs" | "investigation_panel";

export interface PanelConfig {
  id: string;
  type: PanelType;
  position: "left" | "right" | "bottom" | "center" | "fullscreen";
  size: "small" | "medium" | "large" | "full";
  data?: any;
}

export interface WorkspaceConfig {
  mode: string;
  layout: "empty" | "investigation" | "war_room" | "recovery";
  panels: PanelConfig[];
  status: "idle" | "investigating" | "critical" | "recovering";
  logs: string[];
}

export const initialWorkspace: WorkspaceConfig = {
  mode: "idle",
  layout: "empty",
  panels: [],
  status: "idle",
  logs: ["System idle. Waiting for events..."]
};

// Simulated agents returning different workspace configurations based on the scene
export const generateWorkspace = (sceneIndex: number, currentLogs: string[]): WorkspaceConfig => {
  switch (sceneIndex) {
    case 0:
      return initialWorkspace;
    case 1:
      // User triggers investigate
      return {
        mode: "investigating",
        layout: "investigation",
        status: "investigating",
        logs: [...currentLogs, "USER: Investigate checkout outage after latest deployment.", "AGENT [Orchestrator]: Engaging investigation protocol..."],
        panels: [
          { id: "p-investigation", type: "investigation_panel", position: "center", size: "medium" }
        ]
      };
    case 2:
      // AI Agents activate
      return {
        mode: "analysis",
        layout: "investigation",
        status: "investigating",
        logs: [
          ...currentLogs,
          "AGENT [QA]: Scanning test vectors for checkout service...",
          "AGENT [QA]: DETECTED: 14 regression failures in payment processing.",
          "AGENT [Infra]: Telemetry snapshot retrieved from k8s-cluster-01.",
          "AGENT [Infra]: WARNING: Latency p99 > 2500ms for checkout-service.",
          "AGENT [Topology]: Mapping dependencies for checkout -> payment -> db.",
          "AGENT [UI Architect]: Syncing War Room layout for critical incident."
        ],
        panels: [
          { id: "p-topology", type: "topology_map", position: "left", size: "large" },
          { id: "p-logs", type: "streaming_logs", position: "right", size: "small" }
        ]
      };
    case 3:
      // Critical outage war room
      return {
        mode: "critical_incident",
        layout: "war_room",
        status: "critical",
        logs: [
          ...currentLogs,
          "AGENT [Infra]: CRITICAL: checkout-service is down.",
          "AGENT [Recovery]: Formulating recovery plan...",
          "AGENT [Recovery]: Recommended action: Rollback deployment v2.1.4 to v2.1.3.",
          "AGENT [UI Architect]: Generating War Room interface..."
        ],
        panels: [
          { id: "p-topology-alert", type: "topology_map", position: "left", size: "large", data: { alert: true } },
          { id: "p-rollback", type: "rollback_console", position: "bottom", size: "medium" },
          { id: "p-timeline", type: "incident_timeline", position: "right", size: "medium" }
        ]
      };
    case 4:
      // Rollback initiated
      return {
        mode: "recovery",
        layout: "recovery",
        status: "recovering",
        logs: [
          ...currentLogs,
          "USER: Rollback deployment.",
          "AGENT [Recovery]: Executing rollback to v2.1.3...",
          "AGENT [Infra]: Monitoring traffic on v2.1.3...",
          "AGENT [QA]: Re-running checkout test suite...",
          "AGENT [QA]: All tests passing. Checkout service restored."
        ],
        panels: [
          { id: "p-topology-recovered", type: "topology_map", position: "left", size: "medium", data: { alert: false, recovered: true } },
          { id: "p-timeline-updated", type: "incident_timeline", position: "right", size: "medium", data: { recovered: true } },
          { id: "p-logs", type: "streaming_logs", position: "center", size: "large" }
        ]
      };
    default:
      return initialWorkspace;
  }
};
