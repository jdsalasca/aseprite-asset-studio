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

export type SpriteEffectKind = "outline" | "color_grade" | "shadow" | "particles" | "normal_map" | "rain" | "motion" | "upscale" | "seamless" | "reflection" | "caustics" | "day_night";
export type AssetVariantKind = "rain" | "fire" | "earthquake" | "birds" | "night" | "day_night" | "walk" | "water_reflection" | "water_caustics";
export interface AssetVariantArtifactView { variant: AssetVariantKind; outputFilename: string; operation: string; frames: number; format: "png" | "gif"; deterministic: true; sourcePreserved: true; }
export interface AssetVariantPackView { operation: "generate_variant_pack"; input: string; outputPrefix: string; seed: number; artifacts: AssetVariantArtifactView[]; deterministic: true; sourcePreserved: true; }
export interface AssetQualityBundleView { operation: "inspect_asset_bundle"; filename: string; inspection: { frameCount: number; width: number; height: number; totalColors: number; reports: Array<Record<string, number>>; delaysMs: number[] }; quality: { valid: boolean; maxColors: number; maxIsolatedPixels: number; violations: string[] }; recommendations: string[]; deterministic: true; sourcePreserved: true; }
export interface AssetQualityBatchView { operation: "inspect_asset_batch"; assets: Array<{ filename: string; valid: boolean; frameCount?: number; width?: number; height?: number; totalColors?: number; violations: string[]; recommendations: string[]; error?: string }>; summary: { total: number; valid: number; invalid: number; failed: number }; maxColors: number; maxIsolatedPixels: number; deterministic: true; sourcePreserved: true; }
export interface AnimationQualityView { operation: "inspect_animation_quality"; filename: string; frameCount: number; width: number; height: number; delaysMs: number[]; transitions: Array<{ fromFrame: number; toFrame: number; changedPixels: number; changedRatio: number; changedBounds: { x: number; y: number; width: number; height: number } | null }>; duplicateFrames: number[]; loop: { changedPixels: number; closed: boolean }; palette: { colorsPerFrame: number[]; driftFrames: number[]; stable: boolean }; timing: { consistent: boolean; positive: boolean }; quality: { valid: boolean; violations: string[] }; recommendations: string[]; deterministic: true; sourcePreserved: true; }
export type SpritePivotMode = "center" | "bottom_center";
export interface SpriteNormalizationView { operation: "normalize_sprite"; input: string; output: string; manifest: string; format: "png" | "gif"; width: number; height: number; frames: number; padding: number; bounds: { x: number; y: number; width: number; height: number }; pivot: { mode: SpritePivotMode; x: number; y: number }; deterministic: true; sourcePreserved: true; }
export interface AnimationSheetView { operation: "build_animation_sheet"; output: string; manifest: string; frames: number; columns: number; rows: number; width: number; height: number; cellWidth: number; cellHeight: number; padding: number; deterministic: true; sourcePreserved: true; }
export interface SpriteGeometryComponentView { x: number; y: number; width: number; height: number; pixels: number; }
export interface SpriteGeometryFrameView { index: number; opaquePixels: number; bounds: { x: number; y: number; width: number; height: number } | null; baselineY: number | null; pivot: { x: number; y: number; mode: "bottom_center" }; components: SpriteGeometryComponentView[]; }
export interface SpriteGeometryView { operation: "inspect_sprite_geometry"; filename: string; frameCount: number; width: number; height: number; minComponentPixels: number; frames: SpriteGeometryFrameView[]; animation: { stableBounds: boolean; baselineDrift: number }; quality: { valid: boolean; violations: string[] }; recommendations: string[]; deterministic: true; sourcePreserved: true; }
export interface SpriteHitboxView { operation: "generate_sprite_hitboxes"; manifest: string; filename: string; frames: number; mode: "components" | "union"; padding: number; hitboxes: number; deterministic: true; sourcePreserved: true; }
export interface SpriteRuntimeBundleView { operation: "build_sprite_runtime_bundle"; manifest: string; filename: string; frames: number; artifacts: 2; deterministic: true; sourcePreserved: true; }
export interface SpriteAnchorsView { operation: "generate_sprite_anchors"; manifest: string; filename: string; frames: number; anchorTypes: 6; baselineDrift: number; deterministic: true; sourcePreserved: true; }
export interface AssetPresetGenerationView { operation: "generate_asset_preset"; presetId: string; environmentKind: "beach" | "forest" | "village" | "cave"; composition: AssetLibraryPresetCompositionView; generation: { operation: string; artifacts?: { previewPng?: string; timeGif?: string; waveGif?: string } }; deterministic: true; sourcePreserved: true; }
export type SceneEffectKind = "rain" | "water_reflection" | "water_caustics" | "day_night" | "material_texture" | "depth_lighting" | "particles";
export interface SceneEffectArtifactView { effect: SceneEffectKind; outputFilename: string; operation: string; frames: number; format: "png" | "gif"; deterministic: true; sourcePreserved: true; }
export interface SceneEffectStackView { operation: "generate_scene_effect_stack"; input: string; outputPrefix: string; seed: number; effects: SceneEffectKind[]; artifacts: SceneEffectArtifactView[]; deterministic: true; sourcePreserved: true; }
export type AssetRecipeStep = "outline" | "color_grade" | "material_texture" | "depth_lighting" | "shadow" | "particles" | "normal_map" | "quality_gate";
export interface SpriteEffectView { operation: string; output: string; frames: number; format: "png" | "gif"; deterministic: true; sourcePreserved: true; }
export interface AssetRecipeStepView { id: AssetRecipeStep; operation: string; inputFilename: string; outputFilename?: string; arguments: Record<string, number | string | boolean>; }
export interface AssetRecipePlanView { recipeId: string; schemaVersion: 1; algorithmVersion: string; assetId: string; inputFilename: string; outputPrefix: string; format: "png" | "gif"; seed: number; steps: AssetRecipeStepView[]; sourcePreserved: true; deterministic: true; }
export interface AssetRecipeExecutionStepView { id: AssetRecipeStep; operation: string; ok: boolean; message: string; }
export interface AssetRecipeExecutionView { ok: boolean; recipeId: string; outputFilename: string; steps: AssetRecipeExecutionStepView[]; failedStep?: AssetRecipeStep; error?: string; sourcePreserved: true; deterministic: true; }
export interface AssetLibraryItemView { id: string; title: string; category: string; folder: string; kind: "sprite" | "tileset" | "scene" | "effect" | "character" | "prop"; description: string; tags: string[]; variants: string[]; formats: Array<"png" | "gif" | "svg" | "json">; readmePath: string; previewPath: string; spritePath: string; deterministic: true; }
export interface AssetLibraryPresetView { id: string; title: string; description: string; category: string; itemIds: string[]; recommendedTools: string[]; deterministic: true; }
export interface AssetLibrarySearchView { query: { query?: string; category?: string; limit?: number }; total: number; categories: Array<{ id: string; title: string; description: string; itemCount: number }>; items: AssetLibraryItemView[]; presets: AssetLibraryPresetView[]; }
export interface AssetLibraryPresetCompositionView { preset: AssetLibraryPresetView; items: AssetLibraryItemView[]; layers: Array<{ id: string; assetId: string; role: "background" | "midground" | "foreground" | "effect"; order: number }>; deterministic: true; }
export interface AssetLibraryAuditView { operation: "audit_asset_library"; libraryVersion: string; totalItems: number; totalCategories: number; totalPresets: number; totalFolders: number; readmePaths: number; previewPaths: number; spritePaths: number; valid: boolean; violations: string[]; deterministic: true; sourcePreserved: true; }
export interface AssetLibrarySummaryView { operation: "summarize_asset_library"; libraryVersion: string; totalItems: number; totalCategories: number; totalPresets: number; categories: Array<{ id: string; title: string; itemCount: number; examples: string[] }>; presets: Array<{ id: string; title: string; category: string; itemCount: number }>; deterministic: true; sourcePreserved: true; }
export interface AssetScenePlanView { operation: "plan_asset_scene"; libraryVersion: string; itemIds: string[]; layers: Array<{ id: string; assetId: string; title: string; category: string; kind: "sprite" | "tileset" | "scene" | "effect" | "character" | "prop"; role: "background" | "midground" | "foreground" | "effect"; order: number; previewPath: string; spritePath: string }>; deterministic: true; sourcePreserved: true; }
export interface AssetSceneCompositionView { operation: "compose_asset_scene"; output: string; manifest: string; libraryVersion: string; itemIds: string[]; width: number; height: number; padding: number; layers: Array<{ id: string; assetId: string; title: string; category: string; kind: "sprite" | "tileset" | "scene" | "effect" | "character" | "prop"; role: "background" | "midground" | "foreground" | "effect"; order: number; previewPath: string; spritePath: string; x: number; y: number; width: number; height: number }>; deterministic: true; sourcePreserved: true; }
export interface AssetSceneAnimationCompositionView { operation: "compose_asset_scene_animation"; output: string; manifest: string; libraryVersion: string; itemIds: string[]; width: number; height: number; padding: number; frames: number; delayMs: number; frameLayers: Array<{ index: number; layers: Array<{ id: string; assetId: string; title: string; category: string; kind: "sprite" | "tileset" | "scene" | "effect" | "character" | "prop"; role: "background" | "midground" | "foreground" | "effect"; order: number; previewPath: string; spritePath: string; x: number; y: number; width: number; height: number }> }>; deterministic: true; sourcePreserved: true; }
export interface SceneExtensionView { operation: "extend_scene"; input: string; output: string; preview: string | null; width: number; height: number; padding: { top: number; right: number; bottom: number; left: number }; seed: number; layers: number; sourcePreserved: true; deterministic: true; }
export interface BiomeTransitionView { operation: "generate_biome_transition"; input: string; output: string; preview: string | null; width: number; height: number; transitionWidth: number; transitions: number; seed: number; sourcePreserved: true; deterministic: true; }
export interface PaletteHarmonizeView { operation: "harmonize_asset_palette"; input: string; output: string; frames: number; format: "png" | "gif"; accentColor: string; strength: number; maxColors: number; palette: string[]; sourcePreserved: true; deterministic: true; }
export interface ContactSheetView { operation: "build_contact_sheet"; output: string; manifest: string; assets: number; columns: number; rows: number; width: number; height: number; cellWidth: number; cellHeight: number; padding: number; deterministic: true; sourcePreserved: true; }

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
