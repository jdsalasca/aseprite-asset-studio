import type { AssetGateway, AssetLibraryPresetCompositionView, AssetLibrarySearchView, AssetRecipeExecutionView, AssetRecipePlanView, AssetRecipeStep, DepthLightingView, EnhancementApplyView, EnhancementPlanView, LightDirection, MaterialTextureKind, MaterialTextureView, RuntimeConfig, SceneExtensionView, SpriteEffectKind, SpriteEffectView, StoredAsset, ToolRuntimeStatus } from "../domain/contracts.js";
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
      const operation = kind === "outline" ? "apply_pixel_outline" : kind === "color_grade" ? "apply_color_grade" : kind === "shadow" ? "generate_sprite_shadow" : kind === "particles" ? "generate_particle_burst" : kind === "normal_map" ? "generate_normal_map" : kind === "rain" ? "generate_rain_overlay" : kind === "motion" ? "generate_motion_pack" : "upscale_pixel_art";
      const args: Record<string, unknown> = kind === "particles"
        ? { output_filename: outputFilename, width: options.width ?? 64, height: options.height ?? 64, frames: options.frames ?? 8, particle_count: options.particle_count ?? 24, seed: options.seed ?? 1, color: options.color ?? "#FFD166", delay_ms: options.delay_ms ?? 80 }
        : kind === "rain"
          ? { input_filename: filename, output_filename: outputFilename, format: "gif", seed: options.seed ?? 1, intensity: options.intensity ?? 0.55, wind: options.wind ?? 0, color: options.color ?? "#B7D7FF", delay_ms: options.delay_ms ?? 90 }
          : kind === "motion"
            ? { input_filename: filename, output_filename: outputFilename, format: "gif", motion: options.motion ?? "walk", frames: options.frames ?? 8, seed: options.seed ?? 1, amplitude: options.amplitude ?? 2, delay_ms: options.delay_ms ?? 90 }
            : kind === "upscale"
              ? { input_filename: filename, output_filename: outputFilename, format: "png", scale: options.scale ?? 2 }
          : { input_filename: filename, output_filename: outputFilename, format: "png", ...options };
      const response = await this.gateway.callTool(operation, args);
      return this.responseParser.parseJson<SpriteEffectView>(response, "El MCP no devolvió el resultado del efecto");
    }, { filename, outputFilename, kind });
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

  public async extendScene(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number }): Promise<SceneExtensionView> {
    return this.trace("extend_scene", async () => {
      const response = await this.gateway.callTool("extend_scene", { input_map_filename: input.inputMapFilename, output_map_filename: input.outputMapFilename, ...(input.previewFilename ? { preview_filename: input.previewFilename } : {}), top: input.top, right: input.right, bottom: input.bottom, left: input.left, seed: input.seed });
      return this.responseParser.parseJson<SceneExtensionView>(response, "El MCP no devolvió la extensión de escena");
    }, { inputMapFilename: input.inputMapFilename, outputMapFilename: input.outputMapFilename, seed: input.seed });
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
