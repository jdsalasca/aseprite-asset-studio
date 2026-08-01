import type { AssetGateway, EnhancementApplyView, EnhancementPlanView, McpStatus, StoredAsset, StudioConfig } from "../domain/contracts.js";

export class AssetStudioService {
  public constructor(private readonly gateway: AssetGateway) {}

  public health() { return this.gateway.health(); }
  public config() { return this.gateway.config(); }
  public startMcp(config: StudioConfig): Promise<McpStatus> { return this.gateway.startMcp(config); }
  public stopMcp(): Promise<McpStatus> { return this.gateway.stopMcp(); }
  public tools() { return this.gateway.tools(); }
  public callTool(name: string, args: Record<string, unknown>) { return this.gateway.callTool(name, args); }
  public upload(file: File): Promise<StoredAsset> { return this.gateway.upload(file); }

  public async suggestEnhancementPlan(filename: string): Promise<EnhancementPlanView> {
    await this.gateway.callTool("inspect_reference", { filename });
    const response = await this.gateway.callTool("suggest_enhancement_plan", { filename, goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] }) as { content?: Array<{ text?: string }> };
    const text = response.content?.[0]?.text;
    if (!text) throw new Error("El MCP no devolvió un plan de mejora");
    return JSON.parse(text) as EnhancementPlanView;
  }

  public async applyEnhancementPlan(filename: string, outputFilename: string): Promise<EnhancementApplyView> {
    const response = await this.gateway.callTool("apply_enhancement_plan", { filename, output_filename: outputFilename, format: "png", goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] }) as { content?: Array<{ text?: string }> };
    const text = response.content?.[0]?.text;
    if (!text) throw new Error("El MCP no devolvió el resultado de aplicación");
    const parsed = JSON.parse(text) as { applied?: EnhancementApplyView; quality?: EnhancementApplyView["quality"] };
    if (!parsed.applied || !parsed.quality) throw new Error("El MCP devolvió una aplicación sin quality gate");
    return { ...parsed.applied, quality: parsed.quality };
  }

  public assetPreviewUrl(path: string): string { return this.gateway.assetPreviewUrl(path); }
}
