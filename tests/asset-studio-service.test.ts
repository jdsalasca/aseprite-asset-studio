import { describe, expect, it } from "vitest";
import { AssetStudioService } from "../src/application/AssetStudioService.js";
import type { AssetGateway, AssetLibraryAuditView, AssetLibraryPresetCompositionView, AssetLibrarySearchView, AssetLibrarySummaryView, AssetLibraryVariantPackView, AssetManifestAuditView, AssetRecipeExecutionView, AssetSceneAnimationCompositionView, AssetSceneCompositionView, AssetScenePlanView, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";
import type { OperationEvent, OperationLogPort } from "../src/ports/OperationLogPort.js";

const status: ToolRuntimeStatus = { state: "online", pid: 7, serverName: "fake", serverVersion: "1", toolCount: 1, message: "online" };

class FakeLogger implements OperationLogPort {
  public events: OperationEvent[] = [];
  public record(event: OperationEvent): void { this.events.push(event); }
}

class FakeGateway implements AssetGateway {
  public calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  public async health(): Promise<HealthResponse> { return { ok: true, service: "fake", version: "1", runtime: status }; }
  public async config(): Promise<RuntimeConfig> { return { workspacePath: "", executablePath: "", gatewayPort: 3765 }; }
  public async startRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async stopRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async tools(): Promise<ToolDescriptor[]> { return [{ name: "apply_enhancement_plan" }]; }
  public async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    if (name === "suggest_enhancement_plan") return { content: [{ text: JSON.stringify({ planId: "plan-1", algorithmVersion: "v1", filename: args.filename, seed: 1, detectedSignals: [], warnings: [], passes: [], destructive: false }) }] };
    if (name === "apply_material_texture") return { content: [{ text: JSON.stringify({ outputFilename: args.output_filename, material: args.material, seed: args.seed, intensity: args.intensity, frames: 1, format: "png", sourcePreserved: true }) }] };
    if (name === "apply_depth_lighting") return { content: [{ text: JSON.stringify({ outputFilename: args.output_filename, direction: args.direction, strength: args.strength, ambient: args.ambient, frames: 1, format: "png", sourcePreserved: true }) }] };
    if (name === "apply_pixel_outline") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: 1, format: "png", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_rain_overlay") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: 1, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_motion_pack") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "upscale_pixel_art") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, scale: args.scale, frames: 1, format: "png", deterministic: true, sourcePreserved: true }) }] };
    if (name === "extend_scene") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_map_filename, output: args.output_map_filename, preview: null, width: 32, height: 24, padding: { top: args.top, right: args.right, bottom: args.bottom, left: args.left }, seed: args.seed, layers: 3, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_biome_transition") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_map_filename, output: args.output_map_filename, preview: args.preview_filename ?? null, width: 32, height: 24, transitionWidth: args.transition_width, transitions: 42, seed: args.seed, deterministic: true, sourcePreserved: true }) }] };
    if (name === "harmonize_asset_palette") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, output: args.output_filename, frames: 1, format: "png", accentColor: args.accent_color, strength: args.strength, maxColors: args.max_colors, palette: ["#3155D8", "#8AA0F0"], deterministic: true, sourcePreserved: true }) }] };
    if (name === "build_contact_sheet") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, manifest: args.manifest_filename, assets: (args.input_filenames as string[]).length, columns: args.columns ?? 2, rows: 1, width: 66, height: 32, cellWidth: args.cell_width, cellHeight: args.cell_height, padding: args.padding, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_seamless_texture") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: 1, format: "png", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_water_reflection") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_water_caustics") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_day_night_cycle") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_variant_pack") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, outputPrefix: args.output_prefix, seed: args.seed, artifacts: (args.variants as string[]).map((variant) => ({ variant, outputFilename: `${args.output_prefix}-${variant}.gif`, operation: `generate_${variant}_variant`, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true })), deterministic: true, sourcePreserved: true }) }] };
    if (name === "inspect_asset_bundle") return { content: [{ text: JSON.stringify({ operation: name, filename: args.filename, inspection: { frameCount: 1, width: 16, height: 16, totalColors: 4, reports: [], delaysMs: [0] }, quality: { valid: true, maxColors: 64, maxIsolatedPixels: 4, violations: [] }, recommendations: ["Asset passes the requested compact quality checks."], deterministic: true, sourcePreserved: true }) }] };
    if (name === "inspect_asset_batch") return { content: [{ text: JSON.stringify({ operation: name, assets: (args.filenames as string[]).map((filename) => ({ filename, valid: filename !== "broken.png", frameCount: 1, width: 16, height: 16, totalColors: 4, violations: filename === "broken.png" ? ["too many colors"] : [], recommendations: [] })), summary: { total: (args.filenames as string[]).length, valid: 1, invalid: 1, failed: 0 }, maxColors: args.max_colors, maxIsolatedPixels: args.max_isolated_pixels, deterministic: true, sourcePreserved: true }) }] };
    if (name === "inspect_animation_quality") return { content: [{ text: JSON.stringify({ operation: name, filename: args.filename, frameCount: 8, width: 16, height: 16, delaysMs: [90, 90], transitions: [], duplicateFrames: [3], loop: { changedPixels: 0, closed: true }, palette: { colorsPerFrame: [4, 4], driftFrames: [], stable: true }, timing: { consistent: true, positive: true }, quality: { valid: false, violations: ["duplicate frames: 3"] }, recommendations: ["Remove duplicate frames."], deterministic: true, sourcePreserved: true }) }] };
    if (name === "normalize_sprite") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, output: args.output_filename, manifest: args.manifest_filename, format: args.format ?? "gif", width: 24, height: 28, frames: 8, padding: args.padding, bounds: { x: 2, y: 3, width: 20, height: 24 }, pivot: { mode: args.pivot, x: 12, y: 26 }, deterministic: true, sourcePreserved: true }) }] };
    if (name === "build_animation_sheet") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, manifest: args.manifest_filename, frames: 8, columns: args.columns ?? 3, rows: 3, width: 100, height: 100, cellWidth: 32, cellHeight: 32, padding: args.padding, deterministic: true, sourcePreserved: true }) }] };
    if (name === "inspect_sprite_geometry") return { content: [{ text: JSON.stringify({ operation: name, filename: args.filename, frameCount: 8, width: 32, height: 32, minComponentPixels: args.min_component_pixels, frames: [{ index: 0, opaquePixels: 42, bounds: { x: 4, y: 8, width: 20, height: 22 }, baselineY: 29, pivot: { x: 16, y: 29, mode: "bottom_center" }, components: [{ x: 4, y: 8, width: 20, height: 22, pixels: 42 }] }], animation: { stableBounds: false, baselineDrift: 2 }, quality: { valid: true, violations: [] }, recommendations: ["Use the reported pivots."], deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_sprite_hitboxes") return { content: [{ text: JSON.stringify({ operation: name, manifest: args.output_filename, filename: args.filename, frames: 8, mode: args.mode ?? "components", padding: args.padding ?? 0, hitboxes: 24, deterministic: true, sourcePreserved: true }) }] };
    if (name === "build_sprite_runtime_bundle") return { content: [{ text: JSON.stringify({ operation: name, manifest: args.bundle_manifest_filename, filename: args.input_filename, frames: 8, artifacts: 2, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_sprite_anchors") return { content: [{ text: JSON.stringify({ operation: name, manifest: args.output_filename, filename: args.filename, frames: 8, anchorTypes: 6, baselineDrift: 2, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_asset_preset") return { content: [{ text: JSON.stringify({ operation: name, presetId: args.preset_id, environmentKind: "beach", composition: { preset: { id: String(args.preset_id), title: "Coastal sunset", description: "Beach", category: "biomes-and-maps", itemIds: ["beach"], recommendedTools: ["generate_beach_scene"], deterministic: true }, items: [], layers: [], deterministic: true }, generation: { operation: "generate_environment_pack", artifacts: { previewPng: "coast-preview.png", timeGif: "coast-time.gif" } }, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_scene_effect_stack") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, outputPrefix: args.output_prefix, seed: args.seed, effects: args.effects, artifacts: (args.effects as string[]).map((effect) => ({ effect, outputFilename: `${args.output_prefix}-${effect}.gif`, operation: `generate_${effect}`, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true })), deterministic: true, sourcePreserved: true }) }] };
    if (name === "create_asset_recipe") return { content: [{ text: JSON.stringify({ recipeId: "recipe-1", schemaVersion: 1, algorithmVersion: "asset-recipe-v1", assetId: args.asset_id, inputFilename: args.input_filename, outputPrefix: args.output_prefix, format: "png", seed: args.seed, steps: [], sourcePreserved: true, deterministic: true }) }] };
    if (name === "execute_asset_recipe") return { content: [{ text: JSON.stringify({ ok: true, recipeId: "recipe-1", outputFilename: "hero-recipe-quality_gate.png", steps: [{ id: "outline", operation: "apply_pixel_outline", ok: true, message: "ok" }, { id: "quality_gate", operation: "run_asset_quality_gate", ok: true, message: "ok" }], sourcePreserved: true, deterministic: true } satisfies AssetRecipeExecutionView) }] };
    if (name === "get_asset_library") return { content: [{ text: JSON.stringify({ query: { query: typeof args.query === "string" ? args.query : "", limit: 24 }, total: 1, categories: [], items: [{ id: "oak", title: "Oak", category: "flora", folder: "flora/oak", kind: "sprite", description: "Tree", tags: ["tree"], variants: ["rain"], formats: ["png", "svg", "json"], readmePath: "flora/oak/README.md", previewPath: "flora/oak/preview.png", spritePath: "flora/oak/sprite-sheet.png", deterministic: true }], presets: [] } satisfies AssetLibrarySearchView) }] };
    if (name === "compose_asset_preset") return { content: [{ text: JSON.stringify({ preset: { id: String(args.id), title: "Rainy grove", description: "Oak", category: "flora", itemIds: ["oak"], recommendedTools: ["generate_world_map"], deterministic: true }, items: [], layers: [{ id: "rainy-grove-oak", assetId: "oak", role: "background", order: 0 }], deterministic: true } satisfies AssetLibraryPresetCompositionView) }] };
    if (name === "audit_asset_library") return { content: [{ text: JSON.stringify({ operation: name, libraryVersion: "catalog-v1", totalItems: 339, totalCategories: 24, totalPresets: 12, totalFolders: 339, readmePaths: 339, previewPaths: 339, spritePaths: 339, valid: true, violations: [], deterministic: true, sourcePreserved: true } satisfies AssetLibraryAuditView) }] };
    if (name === "audit_asset_manifest") return { content: [{ text: JSON.stringify({ operation: name, manifest: String(args.manifest_filename), artifacts: [{ filename: "out/scene.png", status: "ok", sizeBytes: 2048, format: "png", sha256: "abcdef123456" }], totalArtifacts: 1, missingArtifacts: 0, emptyArtifacts: 0, valid: true, deterministic: true, sourcePreserved: true } satisfies AssetManifestAuditView) }] };
    if (name === "summarize_asset_library") return { content: [{ text: JSON.stringify({ operation: name, libraryVersion: "catalog-v2", totalItems: 339, totalCategories: 24, totalPresets: 12, categories: [{ id: "flora", title: "Flora", itemCount: 42, examples: ["oak", "pine"] }], presets: [{ id: "grove", title: "Living grove", category: "flora", itemCount: 8 }], deterministic: true, sourcePreserved: true } satisfies AssetLibrarySummaryView) }] };
    if (name === "plan_asset_scene") return { content: [{ text: JSON.stringify({ operation: name, libraryVersion: "catalog-scene-v1", itemIds: ["oak"], layers: [{ id: "scene-oak", assetId: "oak", title: "Oak", category: "flora", kind: "scene", role: "background", order: 0, previewPath: "flora/oak/preview.png", spritePath: "flora/oak/sprite-sheet.png" }], deterministic: true, sourcePreserved: true } satisfies AssetScenePlanView) }] };
    if (name === "compose_asset_scene") return { content: [{ text: JSON.stringify({ operation: name, output: String(args.output_filename), manifest: String(args.manifest_filename), libraryVersion: "catalog-scene-v1", itemIds: args.item_ids as string[], width: Number(args.width), height: Number(args.height), padding: Number(args.padding), layers: [{ id: "scene-oak", assetId: "oak", title: "Oak", category: "flora", kind: "scene", role: "background", order: 0, previewPath: "flora/oak/preview.png", spritePath: "flora/oak/sprite-sheet.png", x: 2, y: 2, width: 60, height: 60 }], deterministic: true, sourcePreserved: true } satisfies AssetSceneCompositionView) }] };
    if (name === "compose_asset_scene_animation") return { content: [{ text: JSON.stringify({ operation: name, output: String(args.output_filename), manifest: String(args.manifest_filename), libraryVersion: "catalog-scene-v1", itemIds: args.item_ids as string[], width: Number(args.width), height: Number(args.height), padding: Number(args.padding), frames: Number(args.frames), delayMs: Number(args.delay_ms), frameLayers: [{ index: 0, layers: [{ id: "scene-rain", assetId: "rain", title: "Rain", category: "effects", kind: "effect", role: "effect", order: 0, previewPath: "effects/rain/preview.gif", spritePath: "effects/rain/sprite-sheet.gif", x: 2, y: 2, width: 60, height: 60 }] }], deterministic: true, sourcePreserved: true } satisfies AssetSceneAnimationCompositionView) }] };
    if (name === "generate_library_variant_pack") return { content: [{ text: JSON.stringify({ operation: name, manifest: "out/library.json", libraryVersion: "catalog-v1", itemIds: args.item_ids as string[], outputPrefix: String(args.output_prefix), variants: args.variants as AssetLibraryVariantPackView["variants"], frames: Number(args.frames), seed: Number(args.seed), assets: [{ assetId: "oak", title: "Oak", outputPrefix: "out/library/oak", artifacts: [{ variant: "rain", outputFilename: "out/library/oak-rain.gif", operation: "generate_rain_overlay", frames: Number(args.frames), format: "gif", deterministic: true, sourcePreserved: true }] }], deterministic: true, sourcePreserved: true } satisfies AssetLibraryVariantPackView) }] };
    return { content: [{ text: JSON.stringify({ applied: { planId: "plan-1", outputFilename: args.output_filename, format: "png", frames: 1, passesApplied: ["cleanup"], sourcePreserved: true }, quality: { valid: true, violations: [] } }) }] };
  }
  public async upload(file: File): Promise<StoredAsset> { return { filename: file.name, path: `/tmp/${file.name}`, sizeBytes: file.size }; }
  public assetPreviewUrl(path: string): string { return `/preview?path=${encodeURIComponent(path)}`; }
}

describe("AssetStudioService enhancement use cases", () => {
  it("inspects before suggesting a typed plan", async () => {
    const gateway = new FakeGateway();
    const logger = new FakeLogger();
    const plan = await new AssetStudioService(gateway, logger).suggestEnhancementPlan("source.png");
    expect(plan.planId).toBe("plan-1");
    expect(gateway.calls.map((call) => call.name)).toEqual(["inspect_reference", "suggest_enhancement_plan"]);
    expect(logger.events).toHaveLength(2);
    expect(logger.events.map((event) => event.outcome)).toEqual(["started", "success"]);
    expect(logger.events[1]).toMatchObject({ operation: "suggest_enhancement_plan", outcome: "success" });
    expect(logger.events[1]?.correlationId).toContain("suggest_enhancement_plan-");
  });

  it("applies to a separate output and returns a typed outcome", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyEnhancementPlan("source.png", "source-enhanced.png");
    expect(result).toMatchObject({ outputFilename: "source-enhanced.png", sourcePreserved: true, quality: { valid: true } });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_enhancement_plan", args: { output_filename: "source-enhanced.png" } });
  });

  it("executes the material pass through the generic gateway contract", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyMaterialTexture("source.png", "source-textured.png", "water", 42, 0.7);

    expect(result).toMatchObject({ outputFilename: "source-textured.png", material: "water", seed: 42, intensity: 0.7, sourcePreserved: true });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_material_texture", args: { input_filename: "source.png", output_filename: "source-textured.png", material: "water" } });
  });

  it("executes the depth lighting pass through the generic gateway contract", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyDepthLighting("source.png", "source-lit.png", "north_east", 0.8, 0.25);

    expect(result).toMatchObject({ outputFilename: "source-lit.png", direction: "north_east", strength: 0.8, ambient: 0.25, sourcePreserved: true });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_depth_lighting", args: { input_filename: "source.png", output_filename: "source-lit.png", direction: "north_east" } });
  });

  it("maps sprite effects and recipe creation through typed application ports", async () => {
    const gateway = new FakeGateway();
    const service = new AssetStudioService(gateway);
    const effect = await service.applySpriteEffect("outline", "source.png", "source-outline.png", { color: "#172033", thickness: 1 });
    const rain = await service.applySpriteEffect("rain", "source.png", "source-rain.gif", { seed: 9, intensity: 0.7, wind: 0.2, color: "#b7d7ff" });
    const recipe = await service.createAssetRecipe({ assetId: "hero", filename: "source.png", outputPrefix: "hero", steps: ["outline", "quality_gate"], seed: 7, material: "earth", direction: "south_east" });

    expect(effect).toMatchObject({ operation: "apply_pixel_outline", output: "source-outline.png", sourcePreserved: true });
    expect(rain).toMatchObject({ operation: "generate_rain_overlay", output: "source-rain.gif", sourcePreserved: true });
    expect(recipe).toMatchObject({ recipeId: "recipe-1", assetId: "hero", seed: 7, deterministic: true });
    expect(gateway.calls.map((call) => call.name)).toEqual(["apply_pixel_outline", "generate_rain_overlay", "create_asset_recipe"]);
    expect(gateway.calls[1]?.args).toMatchObject({ input_filename: "source.png", output_filename: "source-rain.gif", format: "gif", seed: 9, intensity: 0.7, wind: 0.2 });
    expect(gateway.calls[2]?.args.steps).toEqual(["outline", "quality_gate"]);
  });

  it("maps motion controls to the shared MCP cycle generator", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("motion", "source.png", "source-walk.gif", { motion: "walk", frames: 8, amplitude: 2, seed: 3 });
    expect(result).toMatchObject({ operation: "generate_motion_pack", output: "source-walk.gif", format: "gif" });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_motion_pack", args: { motion: "walk", frames: 8, amplitude: 2, seed: 3, format: "gif" } });
  });

  it("normalizes raster frames through the shared MCP gateway and keeps pivot metadata", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).normalizeSprite({ inputFilename: "source.gif", outputFilename: "source-normalized.gif", manifestFilename: "source-normalized.json", padding: 2, pivot: "bottom_center" });
    expect(result).toMatchObject({ operation: "normalize_sprite", output: "source-normalized.gif", manifest: "source-normalized.json", frames: 8, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "normalize_sprite", args: { input_filename: "source.gif", output_filename: "source-normalized.gif", manifest_filename: "source-normalized.json", padding: 2, pivot: "bottom_center", format: "gif" } });
  });

  it("assembles an animation sheet through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).buildAnimationSheet({ inputFilename: "source.gif", outputFilename: "source-sheet.png", manifestFilename: "source-sheet.json", columns: 3, padding: 1 });
    expect(result).toMatchObject({ operation: "build_animation_sheet", output: "source-sheet.png", manifest: "source-sheet.json", frames: 8, columns: 3, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "build_animation_sheet", args: { input_filename: "source.gif", output_filename: "source-sheet.png", manifest_filename: "source-sheet.json", columns: 3, padding: 1 } });
  });

  it("inspects sprite geometry through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).inspectSpriteGeometry("source.gif", 2);
    expect(result).toMatchObject({ operation: "inspect_sprite_geometry", filename: "source.gif", frameCount: 8, animation: { baselineDrift: 2 }, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "inspect_sprite_geometry", args: { filename: "source.gif", min_component_pixels: 2 } });
  });

  it("generates sprite hitboxes through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateSpriteHitboxes({ filename: "source.gif", outputFilename: "source-hitboxes.json", mode: "components", padding: 1 });
    expect(result).toMatchObject({ operation: "generate_sprite_hitboxes", manifest: "source-hitboxes.json", frames: 8, hitboxes: 24, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_sprite_hitboxes", args: { filename: "source.gif", output_filename: "source-hitboxes.json", mode: "components", padding: 1, min_component_pixels: 1 } });
  });

  it("builds one sprite runtime bundle through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).buildSpriteRuntimeBundle({ inputFilename: "source.gif", sheetFilename: "source-sheet.png", sheetManifestFilename: "source-sheet.json", hitboxManifestFilename: "source-hitboxes.json", bundleManifestFilename: "source-runtime.json", columns: 4, sheetPadding: 1, hitboxMode: "components", hitboxPadding: 2 });
    expect(result).toMatchObject({ operation: "build_sprite_runtime_bundle", manifest: "source-runtime.json", frames: 8, artifacts: 2, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "build_sprite_runtime_bundle", args: { input_filename: "source.gif", sheet_filename: "source-sheet.png", sheet_manifest_filename: "source-sheet.json", hitbox_manifest_filename: "source-hitboxes.json", bundle_manifest_filename: "source-runtime.json", columns: 4, sheet_padding: 1, hitbox_mode: "components", hitbox_padding: 2, min_component_pixels: 1 } });
  });

  it("generates placement anchors through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateSpriteAnchors("source.gif", "source-anchors.json", 2);
    expect(result).toMatchObject({ operation: "generate_sprite_anchors", manifest: "source-anchors.json", frames: 8, anchorTypes: 6, baselineDrift: 2, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_sprite_anchors", args: { filename: "source.gif", output_filename: "source-anchors.json", min_component_pixels: 2 } });
  });

  it("maps nearest upscale to the shared MCP image service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("upscale", "source.png", "source-upscale.png", { scale: 3 });
    expect(result).toMatchObject({ operation: "upscale_pixel_art", output: "source-upscale.png", scale: 3, format: "png" });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "upscale_pixel_art", args: { input_filename: "source.png", output_filename: "source-upscale.png", scale: 3, format: "png" } });
  });

  it("maps scene extension to the shared MCP world service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).extendScene({ inputMapFilename: "world.json", outputMapFilename: "world-expanded.json", top: 2, right: 8, bottom: 1, left: 4, seed: 9 });
    expect(result).toMatchObject({ operation: "extend_scene", output: "world-expanded.json", width: 32, height: 24, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "extend_scene", args: { input_map_filename: "world.json", output_map_filename: "world-expanded.json", top: 2, right: 8, bottom: 1, left: 4, seed: 9 } });
  });

  it("maps biome transition generation to the shared MCP world service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateBiomeTransition({ inputMapFilename: "world.json", outputMapFilename: "world-transition.json", previewFilename: "world-transition.png", transitionWidth: 2, seed: 9 });
    expect(result).toMatchObject({ operation: "generate_biome_transition", output: "world-transition.json", transitionWidth: 2, transitions: 42, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_biome_transition", args: { input_map_filename: "world.json", output_map_filename: "world-transition.json", preview_filename: "world-transition.png", transition_width: 2, seed: 9 } });
  });

  it("maps palette harmonization to the shared MCP image service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).harmonizePalette("source.png", "source-harmonized.png", "#3155d8", 0.8, 8);
    expect(result).toMatchObject({ operation: "harmonize_asset_palette", output: "source-harmonized.png", format: "png", maxColors: 8, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "harmonize_asset_palette", args: { input_filename: "source.png", output_filename: "source-harmonized.png", accent_color: "#3155d8", strength: 0.8, max_colors: 8, format: "png" } });
  });

  it("maps variant previews to one shared contact-sheet request", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).buildContactSheet({ inputFilenames: ["rain.gif", "night.gif"], outputFilename: "variants-sheet.png", manifestFilename: "variants-sheet.json", cellWidth: 32, cellHeight: 32, columns: 2, padding: 2 });
    expect(result).toMatchObject({ operation: "build_contact_sheet", output: "variants-sheet.png", manifest: "variants-sheet.json", assets: 2, columns: 2, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "build_contact_sheet", args: { input_filenames: ["rain.gif", "night.gif"], output_filename: "variants-sheet.png", manifest_filename: "variants-sheet.json", cell_width: 32, cell_height: 32, columns: 2, padding: 2 } });
  });

  it("maps seamless texture to the shared MCP effects service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("seamless", "water.png", "water-seamless.png", { seam_width: 2 });
    expect(result).toMatchObject({ operation: "generate_seamless_texture", output: "water-seamless.png", format: "png" });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_seamless_texture", args: { input_filename: "water.png", output_filename: "water-seamless.png", seam_width: 2, format: "png" } });
  });

  it("maps water reflection to the shared MCP effects service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("reflection", "ocean.png", "ocean-reflection.gif", { waterline: 16, frames: 6, seed: 4, amplitude: 2, opacity: 0.65 });
    expect(result).toMatchObject({ operation: "generate_water_reflection", output: "ocean-reflection.gif", format: "gif", frames: 6 });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_water_reflection", args: { input_filename: "ocean.png", output_filename: "ocean-reflection.gif", waterline: 16, frames: 6, seed: 4, amplitude: 2, opacity: 0.65, format: "gif" } });
  });

  it("maps water caustics to the shared MCP effects service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("caustics", "pool.png", "pool-caustics.gif", { frames: 6, seed: 5, intensity: 0.8, scale: 3, color: "#DFF6FF" });
    expect(result).toMatchObject({ operation: "generate_water_caustics", output: "pool-caustics.gif", format: "gif", frames: 6 });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_water_caustics", args: { input_filename: "pool.png", output_filename: "pool-caustics.gif", frames: 6, seed: 5, intensity: 0.8, scale: 3, color: "#DFF6FF", format: "gif" } });
  });

  it("maps day night cycle to the shared MCP effects service", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applySpriteEffect("day_night", "village.png", "village-day-night.gif", { frames: 8, seed: 9, intensity: 0.75 });
    expect(result).toMatchObject({ operation: "generate_day_night_cycle", output: "village-day-night.gif", format: "gif", frames: 8 });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_day_night_cycle", args: { input_filename: "village.png", output_filename: "village-day-night.gif", frames: 8, seed: 9, intensity: 0.75, format: "gif" } });
  });

  it("generates a multi-output environmental variant pack through one MCP call", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateVariantPack({ filename: "oak.png", outputPrefix: "oak-variants", variants: ["rain", "fire", "birds"], frames: 6, seed: 4 });
    expect(result).toMatchObject({ operation: "generate_variant_pack", input: "oak.png", outputPrefix: "oak-variants", seed: 4, deterministic: true });
    expect(result.artifacts.map((artifact) => artifact.variant)).toEqual(["rain", "fire", "birds"]);
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_variant_pack", args: { input_filename: "oak.png", output_prefix: "oak-variants", variants: ["rain", "fire", "birds"], frames: 6, seed: 4 } });
  });

  it("maps compact quality inspection to the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).inspectAssetQualityBundle("oak.png");
    expect(result).toMatchObject({ operation: "inspect_asset_bundle", filename: "oak.png", deterministic: true, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "inspect_asset_bundle", args: { filename: "oak.png", max_colors: 64, max_isolated_pixels: 4 } });
  });

  it("maps one batch quality request to the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).inspectAssetBatch({ filenames: ["hero.png", "broken.png"], maxColors: 32, maxIsolatedPixels: 4 });
    expect(result).toMatchObject({ operation: "inspect_asset_batch", summary: { total: 2, invalid: 1 }, deterministic: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "inspect_asset_batch", args: { filenames: ["hero.png", "broken.png"], max_colors: 32, max_isolated_pixels: 4 } });
  });

  it("maps animation quality auditing to the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).inspectAnimationQuality("hero.gif");
    expect(result).toMatchObject({ operation: "inspect_animation_quality", frameCount: 8, duplicateFrames: [3], deterministic: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "inspect_animation_quality", args: { filename: "hero.gif" } });
  });

  it("maps executable preset generation to the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateAssetPreset({ presetId: "coastal-sunset", outputPrefix: "art/coast", width: 32, height: 24, seed: 9 });
    expect(result).toMatchObject({ operation: "generate_asset_preset", presetId: "coastal-sunset", environmentKind: "beach", deterministic: true, sourcePreserved: true });
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_asset_preset", args: { preset_id: "coastal-sunset", output_prefix: "art/coast", width: 32, height: 24, seed: 9 } });
  });

  it("generates a compact scene effect stack through one shared MCP call", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateSceneEffectStack({ filename: "scene.png", outputPrefix: "scene-stack", effects: ["material_texture", "rain", "particles"], frames: 6, seed: 9, material: "earth", direction: "south_east" });
    expect(result).toMatchObject({ operation: "generate_scene_effect_stack", input: "scene.png", seed: 9, deterministic: true, sourcePreserved: true });
    expect(result.artifacts.map((artifact) => artifact.effect)).toEqual(["material_texture", "rain", "particles"]);
    expect(gateway.calls.at(-1)).toMatchObject({ name: "generate_scene_effect_stack", args: { input_filename: "scene.png", output_prefix: "scene-stack", effects: ["material_texture", "rain", "particles"], frames: 6, seed: 9, material: "earth", direction: "south_east" } });
  });

  it("executes a recipe through the shared MCP tool and preserves typed output", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).executeAssetRecipe({ assetId: "hero", filename: "source.png", outputPrefix: "hero-recipe", steps: ["outline", "quality_gate"], seed: 7, material: "earth", direction: "south_east" });

    expect(result).toMatchObject({ ok: true, recipeId: "recipe-1", outputFilename: "hero-recipe-quality_gate.png", sourcePreserved: true, deterministic: true });
    expect(gateway.calls[0]).toMatchObject({ name: "execute_asset_recipe", args: { asset_id: "hero", input_filename: "source.png", output_prefix: "hero-recipe" } });
  });

  it("searches the shared asset library through the typed MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).searchAssetLibrary("rain");
    expect(result.total).toBe(1);
    expect(result.items[0]?.id).toBe("oak");
    expect(gateway.calls[0]).toMatchObject({ name: "get_asset_library", args: { query: "rain", limit: 24 } });
  });

  it("composes a preset through one compact MCP request", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).composeAssetPreset("rainy-grove");
    expect(result.layers[0]?.assetId).toBe("oak");
    expect(gateway.calls[0]).toMatchObject({ name: "compose_asset_preset", args: { id: "rainy-grove" } });
  });

  it("audits the shared asset library through one compact MCP request", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).auditAssetLibrary();
    expect(result).toMatchObject({ operation: "audit_asset_library", totalItems: 339, valid: true });
    expect(gateway.calls[0]).toMatchObject({ name: "audit_asset_library", args: {} });
  });

  it("audits generated manifest artifacts through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).auditAssetManifest("out/scene.json");
    expect(result).toMatchObject({ operation: "audit_asset_manifest", manifest: "out/scene.json", valid: true, totalArtifacts: 1 });
    expect(gateway.calls[0]).toMatchObject({ name: "audit_asset_manifest", args: { manifest_filename: "out/scene.json" } });
  });

  it("summarizes the shared asset library through one compact MCP request", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).summarizeAssetLibrary();
    expect(result).toMatchObject({ operation: "summarize_asset_library", totalCategories: 24, totalPresets: 12 });
    expect(gateway.calls[0]).toMatchObject({ name: "summarize_asset_library", args: {} });
  });

  it("plans a scene through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).planAssetScene(["oak"]);
    expect(result).toMatchObject({ operation: "plan_asset_scene", itemIds: ["oak"] });
    expect(gateway.calls[0]).toMatchObject({ name: "plan_asset_scene", args: { item_ids: ["oak"] } });
  });

  it("composes a scene through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).composeAssetScene({ itemIds: ["oak"], outputFilename: "scene.png", manifestFilename: "scene.json", width: 64, height: 64, padding: 2 });
    expect(result).toMatchObject({ operation: "compose_asset_scene", output: "scene.png", manifest: "scene.json", width: 64, height: 64 });
    expect(gateway.calls[0]).toMatchObject({ name: "compose_asset_scene", args: { item_ids: ["oak"], output_filename: "scene.png", manifest_filename: "scene.json" } });
  });

  it("composes an animated scene through the shared MCP gateway", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).composeAssetSceneAnimation({ itemIds: ["rain"], outputFilename: "scene.gif", manifestFilename: "scene.json", width: 64, height: 64, padding: 2, frames: 8, delayMs: 90 });
    expect(result).toMatchObject({ operation: "compose_asset_scene_animation", output: "scene.gif", frames: 8, delayMs: 90 });
    expect(gateway.calls[0]).toMatchObject({ name: "compose_asset_scene_animation", args: { item_ids: ["rain"], frames: 8, delay_ms: 90 } });
  });

  it("generates a library variant pack through one compact MCP request", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).generateLibraryVariantPack({ itemIds: ["oak"], outputPrefix: "out/library", variants: ["rain", "walk"], frames: 6, seed: 3, delayMs: 100 });
    expect(result).toMatchObject({ operation: "generate_library_variant_pack", itemIds: ["oak"], manifest: "out/library.json" });
    expect(gateway.calls[0]).toMatchObject({ name: "generate_library_variant_pack", args: { item_ids: ["oak"], output_prefix: "out/library", frames: 6 } });
  });

  it("surfaces the MCP error instead of replacing it with a missing-plan message", async () => {
    const gateway = new FakeGateway();
    gateway.callTool = async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      gateway.calls.push({ name, args });
      if (name === "suggest_enhancement_plan") return { isError: true, content: [{ type: "text", text: "La imagen no tiene una capa válida" }] };
      return { content: [{ text: "{}" }] };
    };

    await expect(new AssetStudioService(gateway).suggestEnhancementPlan("source.png"))
      .rejects.toThrow("La imagen no tiene una capa válida");
  });

  it("rejects malformed tool JSON with a diagnostic that identifies the protocol problem", async () => {
    const gateway = new FakeGateway();
    gateway.callTool = async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      gateway.calls.push({ name, args });
      return { content: [{ type: "text", text: "{not-json" }] };
    };

    await expect(new AssetStudioService(gateway).suggestEnhancementPlan("source.png"))
      .rejects.toThrow("JSON inválido");
  });
});
