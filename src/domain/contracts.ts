export type ConnectionState = "offline" | "starting" | "online" | "error";

export interface RuntimeConfig {
  workspacePath: string;
  executablePath: string;
  gatewayPort: number;
}

export interface ToolRuntimeStatus {
  state: ConnectionState;
  pid: number | null;
  serverName: string | null;
  serverVersion: string | null;
  toolCount: number;
  message: string;
}

export interface ToolDescriptor {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  version: string;
  runtime: ToolRuntimeStatus;
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
  quality: { valid: boolean; violations?: string[] };
}

export type MaterialTextureKind = "water" | "earth" | "grass" | "stone" | "snow";

export interface MaterialTextureView {
  outputFilename: string;
  material: MaterialTextureKind;
  seed: number;
  intensity: number;
  frames: number;
  format: "png" | "gif";
  sourcePreserved: true;
}

export type AssetRecipe = "pixel_art" | "animation_pixel_art" | "gif" | "atlas";
export type AssetJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface AssetArtifactView {
  id: string;
  jobId: string;
  filename: string;
  format: string;
  sizeBytes: number;
  sha256: string;
  createdAt: string;
}

export interface AssetJobItem {
  recipe: AssetRecipe;
  inputFilenames: string[];
  outputFilename?: string;
  width?: number;
  height?: number;
  maxColors?: number;
}

export interface AssetJobRequest { jobs: AssetJobItem[]; }
export interface AssetJobView {
  id: string;
  status: AssetJobStatus;
  jobs: AssetJobItem[];
  createdAt: string;
  updatedAt: string;
  outcome?: { ok: boolean; message: string };
  artifacts?: AssetArtifactView[];
}

export interface AssetGateway {
  health(): Promise<HealthResponse>;
  config(): Promise<RuntimeConfig>;
  startRuntime(config: RuntimeConfig): Promise<ToolRuntimeStatus>;
  stopRuntime(): Promise<ToolRuntimeStatus>;
  tools(): Promise<ToolDescriptor[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  upload(file: File): Promise<StoredAsset>;
  assetPreviewUrl(path: string): string;
}
