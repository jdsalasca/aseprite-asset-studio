import type { AnimationQualityView, AnimationSheetView, AssetGateway, AssetLibraryAuditView, AssetLibraryPresetCompositionView, AssetLibrarySearchView, AssetPresetGenerationView, AssetQualityBatchView, AssetQualityBundleView, AssetRecipeExecutionView, AssetRecipePlanView, AssetRecipeStep, AssetVariantKind, AssetVariantPackView, BiomeTransitionView, ContactSheetView, DepthLightingView, EnhancementApplyView, EnhancementPlanView, LightDirection, MaterialTextureKind, MaterialTextureView, PaletteHarmonizeView, RuntimeConfig, SceneEffectKind, SceneEffectStackView, SceneExtensionView, SpriteEffectKind, SpriteGeometryView, SpriteHitboxView, SpriteNormalizationView, SpritePivotMode, SpriteRuntimeBundleView, SpriteAnchorsView, SpriteEffectView, StoredAsset, ToolRuntimeStatus } from "../domain/contracts.js";
import type { RuntimeDiagnostics } from "../domain/aseprite.js";
import type { OperationEvent, OperationLogPort } from "../ports/OperationLogPort.js";
import { ToolResponseParser } from "./ToolResponseParser.js";

export class AssetStudioService {
  public constructor(private readonly gateway: AssetGateway, private readonly logger?: OperationLogPort, private readonly responseParser = new ToolResponseParser()) {}

  public health() { return this.trace("health", () => this.gateway.health()); }
  public config() { return this.trace("config", () => this.gateway.config()); }
  public startRuntime(config: RuntimeConfig): Promise<ToolRuntimeStatus> { return this.trace("start_runtime", () => this.gateway.startRuntime(config), { gatewayPort: config.gatewayPort }); }
  public stopRuntime(): Promise<ToolRuntimeStatus> { return this.trace("stop_runtime", () => this.gateway.stopRuntime()); }
  public tools() { return this.trace("tools", () => this.gateway.tools()); }
  public callTool(name: string, args: Record<string, unknown>) { return this.trace("call_tool", () => this.gateway.callTool(name, args), { tool: name }); }
  public upload(file: File): Promise<StoredAsset> { return this.trace("upload_asset", () => this.gateway.upload(file), { filename: file.name, sizeBytes: file.size }); }
  public diagnostics(): Promise<RuntimeDiagnostics> { if (!this.gateway.diagnostics) return Promise.reject(new Error("Diagnostics are not available in this gateway")); return this.trace("diagnostics", () => this.gateway.diagnostics!()); }

  public async suggestEnhancementPlan(filename: string): Promise<EnhancementPlanView> {
    return this.trace("suggest_enhancement_plan", async () => {
      await this.gateway.callTool("inspect_reference", { filename });
      const response = await this.gateway.callTool("suggest_enhancement_plan", { filename, goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] });
      return this.responseParser.parseJson<EnhancementPlanView>(response, "El MCP no devolvió un plan de mejora");
    }, { filename });
  }

  public async applyEnhancementPlan(filename: string, outputFilename: string): Promise<EnhancementApplyView> {
    return this.trace("apply_enhancement_plan", async () => {
      const response = await this.gateway.callTool("apply_enhancement_plan", { filename, output_filename: outputFilename, format: "png", goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] });
      const parsed = this.responseParser.parseJson<{ applied?: EnhancementApplyView; quality?: EnhancementApplyView["quality"] }>(response, "El MCP no devolvió el resultado de aplicación");
      if (!parsed.applied || !parsed.quality) throw new Error("El MCP devolvió una aplicación sin quality gate");
      return { ...parsed.applied, quality: parsed.quality };
    }, { filename, outputFilename });
  }

  public async applyMaterialTexture(filename: string, outputFilename: string, material: MaterialTextureKind, seed: number, intensity: number): Promise<MaterialTextureView> {
    return this.trace("apply_material_texture", async () => {
      const response = await this.gateway.callTool("apply_material_texture", { input_filename: filename, output_filename: outputFilename, material, seed, intensity, format: "png" });
      return this.responseParser.parseJson<MaterialTextureView>(response, "El MCP no devolvió el resultado de textura");
    }, { filename, outputFilename, material, seed, intensity });
  }

  public async applyDepthLighting(filename: string, outputFilename: string, direction: LightDirection, strength: number, ambient: number): Promise<DepthLightingView> {
    return this.trace("apply_depth_lighting", async () => {
      const response = await this.gateway.callTool("apply_depth_lighting", { input_filename: filename, output_filename: outputFilename, direction, strength, ambient, format: "png" });
      return this.responseParser.parseJson<DepthLightingView>(response, "El MCP no devolvió el resultado de iluminación");
    }, { filename, outputFilename, direction, strength, ambient });
  }

  public async applySpriteEffect(kind: SpriteEffectKind, filename: string, outputFilename: string, options: Record<string, number | string | boolean> = {}): Promise<SpriteEffectView> {
    return this.trace(`apply_${kind}`, async () => {
      const operation = kind === "outline" ? "apply_pixel_outline" : kind === "color_grade" ? "apply_color_grade" : kind === "shadow" ? "generate_sprite_shadow" : kind === "particles" ? "generate_particle_burst" : kind === "normal_map" ? "generate_normal_map" : kind === "rain" ? "generate_rain_overlay" : kind === "motion" ? "generate_motion_pack" : kind === "upscale" ? "upscale_pixel_art" : kind === "reflection" ? "generate_water_reflection" : kind === "caustics" ? "generate_water_caustics" : kind === "day_night" ? "generate_day_night_cycle" : "generate_seamless_texture";
      const args: Record<string, unknown> = kind === "particles"
        ? { output_filename: outputFilename, width: options.width ?? 64, height: options.height ?? 64, frames: options.frames ?? 8, particle_count: options.particle_count ?? 24, seed: options.seed ?? 1, color: options.color ?? "#FFD166", delay_ms: options.delay_ms ?? 80 }
        : kind === "rain"
          ? { input_filename: filename, output_filename: outputFilename, format: "gif", seed: options.seed ?? 1, intensity: options.intensity ?? 0.55, wind: options.wind ?? 0, color: options.color ?? "#B7D7FF", delay_ms: options.delay_ms ?? 90 }
          : kind === "motion"
            ? { input_filename: filename, output_filename: outputFilename, format: "gif", motion: options.motion ?? "walk", frames: options.frames ?? 8, seed: options.seed ?? 1, amplitude: options.amplitude ?? 2, delay_ms: options.delay_ms ?? 90 }
            : kind === "upscale"
              ? { input_filename: filename, output_filename: outputFilename, format: "png", scale: options.scale ?? 2 }
              : kind === "reflection"
                ? { input_filename: filename, output_filename: outputFilename, format: "gif", waterline: options.waterline ?? 16, frames: options.frames ?? 8, seed: options.seed ?? 1, amplitude: options.amplitude ?? 1, opacity: options.opacity ?? 0.6, delay_ms: options.delay_ms ?? 90 }
                : kind === "caustics"
                  ? { input_filename: filename, output_filename: outputFilename, format: "gif", frames: options.frames ?? 8, seed: options.seed ?? 1, intensity: options.intensity ?? 0.7, scale: options.scale ?? 4, color: options.color ?? "#DFF6FF", delay_ms: options.delay_ms ?? 90 }
                : kind === "day_night"
                  ? { input_filename: filename, output_filename: outputFilename, format: "gif", frames: options.frames ?? 8, seed: options.seed ?? 1, intensity: options.intensity ?? 0.8, delay_ms: options.delay_ms ?? 90 }
                : kind === "seamless"
                  ? { input_filename: filename, output_filename: outputFilename, format: "png", seam_width: options.seam_width ?? 1 }
                  : { input_filename: filename, output_filename: outputFilename, format: "png", ...options };
      const response = await this.gateway.callTool(operation, args);
      return this.responseParser.parseJson<SpriteEffectView>(response, "El MCP no devolvió el resultado del efecto");
    }, { filename, outputFilename, kind });
  }

  public async generateVariantPack(input: { filename: string; outputPrefix: string; variants: AssetVariantKind[]; frames: number; seed: number }): Promise<AssetVariantPackView> {
    return this.trace("generate_variant_pack", async () => {
      const response = await this.gateway.callTool("generate_variant_pack", { input_filename: input.filename, output_prefix: input.outputPrefix, variants: input.variants, frames: input.frames, seed: input.seed, delay_ms: 90 });
      return this.responseParser.parseJson<AssetVariantPackView>(response, "El MCP no devolvió el pack de variantes");
    }, { filename: input.filename, variants: input.variants.length, seed: input.seed });
  }

  public async generateSceneEffectStack(input: { filename: string; outputPrefix: string; effects: SceneEffectKind[]; frames: number; seed: number; material: MaterialTextureKind; direction: LightDirection; particleCount?: number }): Promise<SceneEffectStackView> {
    return this.trace("generate_scene_effect_stack", async () => {
      const response = await this.gateway.callTool("generate_scene_effect_stack", { input_filename: input.filename, output_prefix: input.outputPrefix, effects: input.effects, frames: input.frames, seed: input.seed, delay_ms: 90, material: input.material, direction: input.direction, ...(input.particleCount === undefined ? {} : { particle_count: input.particleCount }), format: "gif" });
      return this.responseParser.parseJson<SceneEffectStackView>(response, "El MCP no devolvió el stack de efectos");
    }, { filename: input.filename, effects: input.effects.length, seed: input.seed });
  }

  public async inspectAssetQualityBundle(filename: string): Promise<AssetQualityBundleView> {
    return this.trace("inspect_asset_bundle", async () => {
      const response = await this.gateway.callTool("inspect_asset_bundle", { filename, max_colors: 64, max_isolated_pixels: 4 });
      return this.responseParser.parseJson<AssetQualityBundleView>(response, "El MCP no devolvió el quality bundle");
    }, { filename });
  }

  public async inspectAssetBatch(input: { filenames: string[]; maxColors?: number; maxIsolatedPixels?: number }): Promise<AssetQualityBatchView> {
    return this.trace("inspect_asset_batch", async () => {
      const response = await this.gateway.callTool("inspect_asset_batch", { filenames: input.filenames, max_colors: input.maxColors ?? 64, max_isolated_pixels: input.maxIsolatedPixels ?? 4 });
      return this.responseParser.parseJson<AssetQualityBatchView>(response, "El MCP no devolvió el quality report batch");
    }, { assets: input.filenames.length });
  }

  public async inspectAnimationQuality(filename: string): Promise<AnimationQualityView> {
    return this.trace("inspect_animation_quality", async () => {
      const response = await this.gateway.callTool("inspect_animation_quality", { filename });
      return this.responseParser.parseJson<AnimationQualityView>(response, "El MCP no devolvió la auditoría de animación");
    }, { filename });
  }

  public async normalizeSprite(input: { inputFilename: string; outputFilename: string; manifestFilename: string; padding: number; pivot: SpritePivotMode; format?: "png" | "gif" }): Promise<SpriteNormalizationView> {
    return this.trace("normalize_sprite", async () => {
      const format = input.format ?? (/\.gif$/i.test(input.inputFilename) ? "gif" : "png");
      const response = await this.gateway.callTool("normalize_sprite", { input_filename: input.inputFilename, output_filename: input.outputFilename, manifest_filename: input.manifestFilename, padding: input.padding, pivot: input.pivot, format });
      return this.responseParser.parseJson<SpriteNormalizationView>(response, "El MCP no devolvió la normalización del sprite");
    }, { filename: input.inputFilename, padding: input.padding, pivot: input.pivot });
  }

  public async buildAnimationSheet(input: { inputFilename: string; outputFilename: string; manifestFilename: string; columns: number; padding: number }): Promise<AnimationSheetView> {
    return this.trace("build_animation_sheet", async () => {
      const response = await this.gateway.callTool("build_animation_sheet", { input_filename: input.inputFilename, output_filename: input.outputFilename, manifest_filename: input.manifestFilename, columns: input.columns, padding: input.padding });
      return this.responseParser.parseJson<AnimationSheetView>(response, "El MCP no devolvió el spritesheet de animación");
    }, { filename: input.inputFilename, columns: input.columns, padding: input.padding });
  }

  public async inspectSpriteGeometry(filename: string, minComponentPixels = 1): Promise<SpriteGeometryView> {
    return this.trace("inspect_sprite_geometry", async () => {
      const response = await this.gateway.callTool("inspect_sprite_geometry", { filename, min_component_pixels: minComponentPixels });
      return this.responseParser.parseJson<SpriteGeometryView>(response, "El MCP no devolvió la geometría del sprite");
    }, { filename, minComponentPixels });
  }

  public async generateSpriteHitboxes(input: { filename: string; outputFilename: string; mode: "components" | "union"; padding: number; minComponentPixels?: number }): Promise<SpriteHitboxView> {
    return this.trace("generate_sprite_hitboxes", async () => {
      const response = await this.gateway.callTool("generate_sprite_hitboxes", { filename: input.filename, output_filename: input.outputFilename, mode: input.mode, padding: input.padding, min_component_pixels: input.minComponentPixels ?? 1 });
      return this.responseParser.parseJson<SpriteHitboxView>(response, "El MCP no devolvió los hitboxes del sprite");
    }, { filename: input.filename, mode: input.mode, padding: input.padding });
  }

  public async buildSpriteRuntimeBundle(input: { inputFilename: string; sheetFilename: string; sheetManifestFilename: string; hitboxManifestFilename: string; bundleManifestFilename: string; columns?: number; sheetPadding: number; hitboxMode: "components" | "union"; hitboxPadding: number; minComponentPixels?: number }): Promise<SpriteRuntimeBundleView> {
    return this.trace("build_sprite_runtime_bundle", async () => {
      const response = await this.gateway.callTool("build_sprite_runtime_bundle", { input_filename: input.inputFilename, sheet_filename: input.sheetFilename, sheet_manifest_filename: input.sheetManifestFilename, hitbox_manifest_filename: input.hitboxManifestFilename, bundle_manifest_filename: input.bundleManifestFilename, ...(input.columns === undefined ? {} : { columns: input.columns }), sheet_padding: input.sheetPadding, hitbox_mode: input.hitboxMode, hitbox_padding: input.hitboxPadding, min_component_pixels: input.minComponentPixels ?? 1 });
      return this.responseParser.parseJson<SpriteRuntimeBundleView>(response, "El MCP no devolvió el runtime bundle del sprite");
    }, { filename: input.inputFilename, sheetPadding: input.sheetPadding, hitboxMode: input.hitboxMode, hitboxPadding: input.hitboxPadding });
  }

  public async generateSpriteAnchors(filename: string, outputFilename: string, minComponentPixels = 1): Promise<SpriteAnchorsView> {
    return this.trace("generate_sprite_anchors", async () => {
      const response = await this.gateway.callTool("generate_sprite_anchors", { filename, output_filename: outputFilename, min_component_pixels: minComponentPixels });
      return this.responseParser.parseJson<SpriteAnchorsView>(response, "El MCP no devolvió los anchors del sprite");
    }, { filename, outputFilename, minComponentPixels });
  }

  public async generateAssetPreset(input: { presetId: string; outputPrefix: string; width: number; height: number; seed: number }): Promise<AssetPresetGenerationView> {
    return this.trace("generate_asset_preset", async () => {
      const response = await this.gateway.callTool("generate_asset_preset", { preset_id: input.presetId, output_prefix: input.outputPrefix, width: input.width, height: input.height, seed: input.seed, tile_size: 16, detail_level: "high" });
      return this.responseParser.parseJson<AssetPresetGenerationView>(response, "El MCP no devolvió la escena del preset");
    }, { presetId: input.presetId, width: input.width, height: input.height, seed: input.seed });
  }

  public async createAssetRecipe(input: { assetId: string; filename: string; outputPrefix: string; steps: AssetRecipeStep[]; seed: number; material: MaterialTextureKind; direction: LightDirection }): Promise<AssetRecipePlanView> {
    return this.trace("create_asset_recipe", async () => {
      const response = await this.gateway.callTool("create_asset_recipe", { asset_id: input.assetId, input_filename: input.filename, output_prefix: input.outputPrefix, format: "png", steps: input.steps, seed: input.seed, material: input.material, direction: input.direction });
      return this.responseParser.parseJson<AssetRecipePlanView>(response, "El MCP no devolvió la receta creada");
    }, { assetId: input.assetId, filename: input.filename, steps: input.steps.length, seed: input.seed });
  }

  public async executeAssetRecipe(input: { assetId: string; filename: string; outputPrefix: string; steps: AssetRecipeStep[]; seed: number; material: MaterialTextureKind; direction: LightDirection }): Promise<AssetRecipeExecutionView> {
    return this.trace("execute_asset_recipe", async () => {
      const response = await this.gateway.callTool("execute_asset_recipe", { asset_id: input.assetId, input_filename: input.filename, output_prefix: input.outputPrefix, format: "png", steps: input.steps, seed: input.seed, material: input.material, direction: input.direction });
      return this.responseParser.parseJson<AssetRecipeExecutionView>(response, "El MCP no devolvió la ejecución de receta");
    }, { assetId: input.assetId, filename: input.filename, steps: input.steps.length, seed: input.seed });
  }

  public async searchAssetLibrary(query = ""): Promise<AssetLibrarySearchView> {
    return this.trace("search_asset_library", async () => {
      const response = await this.gateway.callTool("get_asset_library", { query, limit: 24 });
      return this.responseParser.parseJson<AssetLibrarySearchView>(response, "El MCP no devolvió el catálogo de assets");
    }, { query });
  }

  public assetPreviewUrl(path: string): string { return this.gateway.assetPreviewUrl(path); }

  public async composeAssetPreset(id: string): Promise<AssetLibraryPresetCompositionView> {
    return this.trace("compose_asset_preset", async () => {
      const response = await this.gateway.callTool("compose_asset_preset", { id });
      return this.responseParser.parseJson<AssetLibraryPresetCompositionView>(response, "El MCP no devolvió la composición del preset");
    }, { presetId: id });
  }

  public async auditAssetLibrary(): Promise<AssetLibraryAuditView> {
    return this.trace("audit_asset_library", async () => {
      const response = await this.gateway.callTool("audit_asset_library", {});
      return this.responseParser.parseJson<AssetLibraryAuditView>(response, "El MCP no devolvió la auditoría de la biblioteca");
    });
  }

  public async extendScene(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number }): Promise<SceneExtensionView> {
    return this.trace("extend_scene", async () => {
      const response = await this.gateway.callTool("extend_scene", { input_map_filename: input.inputMapFilename, output_map_filename: input.outputMapFilename, ...(input.previewFilename ? { preview_filename: input.previewFilename } : {}), top: input.top, right: input.right, bottom: input.bottom, left: input.left, seed: input.seed });
      return this.responseParser.parseJson<SceneExtensionView>(response, "El MCP no devolvió la extensión de escena");
    }, { inputMapFilename: input.inputMapFilename, outputMapFilename: input.outputMapFilename, seed: input.seed });
  }

  public async generateBiomeTransition(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; transitionWidth: number; seed: number }): Promise<BiomeTransitionView> {
    return this.trace("generate_biome_transition", async () => {
      const response = await this.gateway.callTool("generate_biome_transition", { input_map_filename: input.inputMapFilename, output_map_filename: input.outputMapFilename, ...(input.previewFilename ? { preview_filename: input.previewFilename } : {}), transition_width: input.transitionWidth, seed: input.seed });
      return this.responseParser.parseJson<BiomeTransitionView>(response, "El MCP no devolvió las transiciones de bioma");
    }, { inputMapFilename: input.inputMapFilename, outputMapFilename: input.outputMapFilename, transitionWidth: input.transitionWidth, seed: input.seed });
  }

  public async harmonizePalette(filename: string, outputFilename: string, accentColor: string, strength: number, maxColors: number): Promise<PaletteHarmonizeView> {
    return this.trace("harmonize_asset_palette", async () => {
      const response = await this.gateway.callTool("harmonize_asset_palette", { input_filename: filename, output_filename: outputFilename, accent_color: accentColor, strength, max_colors: maxColors, format: "png" });
      return this.responseParser.parseJson<PaletteHarmonizeView>(response, "El MCP no devolvió la paleta armonizada");
    }, { filename, outputFilename, accentColor, strength, maxColors });
  }

  public async buildContactSheet(input: { inputFilenames: string[]; outputFilename: string; manifestFilename: string; cellWidth: number; cellHeight: number; columns?: number; padding: number }): Promise<ContactSheetView> {
    return this.trace("build_contact_sheet", async () => {
      const response = await this.gateway.callTool("build_contact_sheet", { input_filenames: input.inputFilenames, output_filename: input.outputFilename, manifest_filename: input.manifestFilename, cell_width: input.cellWidth, cell_height: input.cellHeight, ...(input.columns === undefined ? {} : { columns: input.columns }), padding: input.padding });
      return this.responseParser.parseJson<ContactSheetView>(response, "El MCP no devolvió el contact sheet");
    }, { assets: input.inputFilenames.length, outputFilename: input.outputFilename, cellWidth: input.cellWidth, cellHeight: input.cellHeight });
  }

  private async trace<T>(operation: string, action: () => Promise<T>, metadata?: Record<string, string | number | boolean>): Promise<T> {
    const startedAt = Date.now();
    const correlationId = `${operation}-${startedAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    this.record({ operation, correlationId, durationMs: 0, outcome: "started", ...(metadata ? { metadata } : {}) });
    try {
      const result = await action();
      this.record({ operation, correlationId, durationMs: Date.now() - startedAt, outcome: "success", ...(metadata ? { metadata } : {}) });
      return result;
    } catch (error) {
      this.record({ operation, correlationId, durationMs: Date.now() - startedAt, outcome: "failure", ...(metadata ? { metadata } : {}), error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private record(event: OperationEvent): void { this.logger?.record(event); }
}
