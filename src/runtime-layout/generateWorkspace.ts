export type PanelType = "topology_map" | "rollback_console" | "incident_timeline" | "streaming_logs" | "investigation_panel" | "metrics_panel" | "debugger_panel";

export interface PanelConfig {
  id: string;
  type: PanelType;
  position: "left" | "right" | "bottom" | "center" | "top-right" | "bottom-left" | "main";
  size: "small" | "medium" | "large" | "full";
  gridArea?: string;
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

export const generateWorkspace = (sceneIndex: number, currentLogs: string[], userPrompt: string = "Investigate system anomalies.", analysisText: string = ""): WorkspaceConfig => {
  switch (sceneIndex) {
    case 0:
      return initialWorkspace;
    case 1:
      return {
        mode: "investigating",
        layout: "investigation",
        status: "investigating",
        logs: [...currentLogs, `USER: ${userPrompt}`, "AGENT [Orchestrator]: Spawning specialized agents..."],
        panels: [{ id: "p-investigation", type: "investigation_panel", position: "center", size: "medium" }]
      };
    case 2:
      // Analysis Phase
      return {
        mode: "analysis",
        layout: "war_room",
        status: "investigating",
        logs: currentLogs,
        panels: [
          { id: "p-health", type: "release_health", position: "left", gridArea: "1 / 1 / 7 / 9", size: "medium" },
          { id: "p-logs", type: "streaming_logs", position: "right", gridArea: "1 / 9 / 13 / 13", size: "large" },
          { id: "p-topology", type: "topology_map", position: "bottom", gridArea: "7 / 1 / 13 / 6", size: "medium" },
          { id: "p-metrics", type: "metrics_panel", position: "bottom", gridArea: "7 / 6 / 13 / 9", size: "small" }
        ]
      };
    case 3:
      // Critical Outage War Room
      return {
        mode: "critical_incident",
        layout: "war_room",
        status: "critical",
        logs: currentLogs,
        panels: [
          { id: "p-health-alert", type: "release_health", position: "left", gridArea: "1 / 1 / 7 / 9", size: "medium", data: { alert: true } },
          { id: "p-logs", type: "streaming_logs", position: "right", gridArea: "1 / 9 / 13 / 13", size: "large" },
          { id: "p-topology-alert", type: "topology_map", position: "bottom", gridArea: "7 / 1 / 13 / 6", size: "medium", data: { alert: true } },
          { id: "p-metrics-alert", type: "metrics_panel", position: "bottom", gridArea: "7 / 6 / 13 / 9", size: "small", data: { alert: true } }
        ]
      };
    case 4:
      // Recovery Phase
      return {
        mode: "recovery",
        layout: "war_room",
        status: "recovering",
        logs: [
          ...currentLogs,
          "USER: Rollback deployment.",
          "AGENT [Recovery]: Rollback in progress...",
          "AGENT [Infra]: Monitoring traffic shift...",
          "AGENT [QA]: All tests passing for v2.1.3.",
          "AGENT [Orchestrator]: Incident resolved."
        ],
        panels: [
          { id: "p-metrics-recovered", type: "metrics_panel", position: "left", gridArea: "1 / 1 / 6 / 9", size: "large" },
          { id: "p-timeline", type: "incident_timeline", position: "right", gridArea: "1 / 9 / 13 / 13", size: "large", data: { recovered: true } },
          { id: "p-topology-recovered", type: "topology_map", position: "bottom", gridArea: "6 / 1 / 13 / 9", size: "large", data: { recovered: true } }
        ]
      };
    default:
      return initialWorkspace;
  }
};
