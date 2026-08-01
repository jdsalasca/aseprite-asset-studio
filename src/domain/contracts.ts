export type ConnectionState = "offline" | "starting" | "online" | "error";

export interface StudioConfig {
  mcpRepoPath: string;
  asepritePath: string;
  gatewayPort: number;
}

export interface McpStatus {
  state: ConnectionState;
  pid: number | null;
  serverName: string | null;
  serverVersion: string | null;
  toolCount: number;
  message: string;
}

export interface McpToolSummary {
  name: string;
  description?: string;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  version: string;
  mcp: McpStatus;
}

export interface AssetGateway {
  health(): Promise<HealthResponse>;
  config(): Promise<StudioConfig>;
  startMcp(config: StudioConfig): Promise<McpStatus>;
  stopMcp(): Promise<McpStatus>;
  tools(): Promise<McpToolSummary[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}
