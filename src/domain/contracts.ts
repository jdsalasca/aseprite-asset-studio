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

export interface StoredAsset {
  filename: string;
  path: string;
  sizeBytes: number;
}

export interface AssetContent {
  filename: string;
  contentType: string;
  data: Uint8Array;
}

export interface EnhancementPlanView {
  planId: string;
  algorithmVersion: string;
  filename: string;
  seed: number;
  detectedSignals: string[];
  warnings: string[];
  passes: Array<{ id: string; reason: string; parameters: Record<string, number | string | boolean> }>;
  destructive: false;
}

export interface EnhancementApplyView {
  planId: string;
  outputFilename: string;
  format: "png" | "gif";
  frames: number;
  passesApplied: string[];
  sourcePreserved: true;
}

export interface AssetGateway {
  health(): Promise<HealthResponse>;
  config(): Promise<StudioConfig>;
  startMcp(config: StudioConfig): Promise<McpStatus>;
  stopMcp(): Promise<McpStatus>;
  tools(): Promise<McpToolSummary[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  upload(file: File): Promise<StoredAsset>;
  assetPreviewUrl(path: string): string;
}
