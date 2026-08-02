import type { AssetGateway, EnhancementApplyView, EnhancementPlanView, RuntimeConfig, StoredAsset, ToolRuntimeStatus } from "../domain/contracts.js";
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

  public assetPreviewUrl(path: string): string { return this.gateway.assetPreviewUrl(path); }

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
