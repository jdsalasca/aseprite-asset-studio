import type { RuntimeDiagnostics } from "./aseprite.js";

export type ConnectionState = "offline" | "starting" | "online" | "error";

export interface RuntimeConfig {
  workspacePath: string;
  executablePath: string;
  gatewayPort: number;
  mcpRestPort?: number;
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

export type LightDirection = "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west";

export interface DepthLightingView {
  outputFilename: string;
  direction: LightDirection;
  strength: number;
  ambient: number;
  frames: number;
  format: "png" | "gif";
  sourcePreserved: true;
}

export type SpriteEffectKind = "outline" | "color_grade" | "shadow" | "particles" | "normal_map" | "rain";
export type AssetRecipeStep = "outline" | "color_grade" | "material_texture" | "depth_lighting" | "shadow" | "particles" | "normal_map" | "quality_gate";
export interface SpriteEffectView { operation: string; output: string; frames: number; format: "png" | "gif"; deterministic: true; sourcePreserved: true; }
export interface AssetRecipeStepView { id: AssetRecipeStep; operation: string; inputFilename: string; outputFilename?: string; arguments: Record<string, number | string | boolean>; }
export interface AssetRecipePlanView { recipeId: string; schemaVersion: 1; algorithmVersion: string; assetId: string; inputFilename: string; outputPrefix: string; format: "png" | "gif"; seed: number; steps: AssetRecipeStepView[]; sourcePreserved: true; deterministic: true; }
export interface AssetRecipeExecutionStepView { id: AssetRecipeStep; operation: string; ok: boolean; message: string; }
export interface AssetRecipeExecutionView { ok: boolean; recipeId: string; outputFilename: string; steps: AssetRecipeExecutionStepView[]; failedStep?: AssetRecipeStep; error?: string; sourcePreserved: true; deterministic: true; }
export interface AssetLibraryItemView { id: string; title: string; category: string; folder: string; kind: "sprite" | "tileset" | "scene" | "effect" | "character" | "prop"; description: string; tags: string[]; variants: string[]; formats: Array<"png" | "gif" | "svg" | "json">; readmePath: string; previewPath: string; spritePath: string; deterministic: true; }
export interface AssetLibraryPresetView { id: string; title: string; description: string; category: string; itemIds: string[]; recommendedTools: string[]; deterministic: true; }
export interface AssetLibrarySearchView { query: { query?: string; category?: string; limit?: number }; total: number; categories: Array<{ id: string; title: string; description: string; itemCount: number }>; items: AssetLibraryItemView[]; presets: AssetLibraryPresetView[]; }

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
  progress?: { completed: number; total: number };
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
  diagnostics?(): Promise<RuntimeDiagnostics>;
}
