import { describe, expect, it } from "vitest";
import { AssetStudioService } from "../src/application/AssetStudioService.js";
import type { AssetGateway, AssetLibraryPresetCompositionView, AssetLibrarySearchView, AssetRecipeExecutionView, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";
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
    if (name === "generate_seamless_texture") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: 1, format: "png", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_water_reflection") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_water_caustics") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_day_night_cycle") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_variant_pack") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, outputPrefix: args.output_prefix, seed: args.seed, artifacts: (args.variants as string[]).map((variant) => ({ variant, outputFilename: `${args.output_prefix}-${variant}.gif`, operation: `generate_${variant}_variant`, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true })), deterministic: true, sourcePreserved: true }) }] };
    if (name === "inspect_asset_bundle") return { content: [{ text: JSON.stringify({ operation: name, filename: args.filename, inspection: { frameCount: 1, width: 16, height: 16, totalColors: 4, reports: [], delaysMs: [0] }, quality: { valid: true, maxColors: 64, maxIsolatedPixels: 4, violations: [] }, recommendations: ["Asset passes the requested compact quality checks."], deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_asset_preset") return { content: [{ text: JSON.stringify({ operation: name, presetId: args.preset_id, environmentKind: "beach", composition: { preset: { id: String(args.preset_id), title: "Coastal sunset", description: "Beach", category: "biomes-and-maps", itemIds: ["beach"], recommendedTools: ["generate_beach_scene"], deterministic: true }, items: [], layers: [], deterministic: true }, generation: { operation: "generate_environment_pack", artifacts: { previewPng: "coast-preview.png", timeGif: "coast-time.gif" } }, deterministic: true, sourcePreserved: true }) }] };
    if (name === "generate_scene_effect_stack") return { content: [{ text: JSON.stringify({ operation: name, input: args.input_filename, outputPrefix: args.output_prefix, seed: args.seed, effects: args.effects, artifacts: (args.effects as string[]).map((effect) => ({ effect, outputFilename: `${args.output_prefix}-${effect}.gif`, operation: `generate_${effect}`, frames: args.frames, format: "gif", deterministic: true, sourcePreserved: true })), deterministic: true, sourcePreserved: true }) }] };
    if (name === "create_asset_recipe") return { content: [{ text: JSON.stringify({ recipeId: "recipe-1", schemaVersion: 1, algorithmVersion: "asset-recipe-v1", assetId: args.asset_id, inputFilename: args.input_filename, outputPrefix: args.output_prefix, format: "png", seed: args.seed, steps: [], sourcePreserved: true, deterministic: true }) }] };
    if (name === "execute_asset_recipe") return { content: [{ text: JSON.stringify({ ok: true, recipeId: "recipe-1", outputFilename: "hero-recipe-quality_gate.png", steps: [{ id: "outline", operation: "apply_pixel_outline", ok: true, message: "ok" }, { id: "quality_gate", operation: "run_asset_quality_gate", ok: true, message: "ok" }], sourcePreserved: true, deterministic: true } satisfies AssetRecipeExecutionView) }] };
    if (name === "get_asset_library") return { content: [{ text: JSON.stringify({ query: { query: typeof args.query === "string" ? args.query : "", limit: 24 }, total: 1, categories: [], items: [{ id: "oak", title: "Oak", category: "flora", folder: "flora/oak", kind: "sprite", description: "Tree", tags: ["tree"], variants: ["rain"], formats: ["png", "svg", "json"], readmePath: "flora/oak/README.md", previewPath: "flora/oak/preview.png", spritePath: "flora/oak/sprite-sheet.png", deterministic: true }], presets: [] } satisfies AssetLibrarySearchView) }] };
    if (name === "compose_asset_preset") return { content: [{ text: JSON.stringify({ preset: { id: String(args.id), title: "Rainy grove", description: "Oak", category: "flora", itemIds: ["oak"], recommendedTools: ["generate_world_map"], deterministic: true }, items: [], layers: [{ id: "rainy-grove-oak", assetId: "oak", role: "background", order: 0 }], deterministic: true } satisfies AssetLibraryPresetCompositionView) }] };
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
