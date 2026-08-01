import { describe, expect, it } from "vitest";
import { AssetStudioService } from "../src/application/AssetStudioService.js";
import type { AssetGateway, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";
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
    expect(logger.events).toHaveLength(1);
    expect(logger.events[0]).toMatchObject({ operation: "suggest_enhancement_plan", outcome: "success" });
    expect(logger.events[0]?.correlationId).toContain("suggest_enhancement_plan-");
  });

  it("applies to a separate output and returns a typed outcome", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyEnhancementPlan("source.png", "source-enhanced.png");
    expect(result).toMatchObject({ outputFilename: "source-enhanced.png", sourcePreserved: true, quality: { valid: true } });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_enhancement_plan", args: { output_filename: "source-enhanced.png" } });
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
