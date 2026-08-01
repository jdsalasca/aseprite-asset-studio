import { describe, expect, it } from "vitest";
import { AssetStudioService } from "../src/application/AssetStudioService.js";
import type { AssetGateway, HealthResponse, McpStatus, McpToolSummary, StoredAsset, StudioConfig } from "../src/domain/contracts.js";

const status: McpStatus = { state: "online", pid: 7, serverName: "fake", serverVersion: "1", toolCount: 1, message: "online" };

class FakeGateway implements AssetGateway {
  public calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  public async health(): Promise<HealthResponse> { return { ok: true, service: "fake", version: "1", mcp: status }; }
  public async config(): Promise<StudioConfig> { return { mcpRepoPath: "", asepritePath: "", gatewayPort: 3765 }; }
  public async startMcp(): Promise<McpStatus> { return status; }
  public async stopMcp(): Promise<McpStatus> { return status; }
  public async tools(): Promise<McpToolSummary[]> { return [{ name: "apply_enhancement_plan" }]; }
  public async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    if (name === "suggest_enhancement_plan") return { content: [{ text: JSON.stringify({ planId: "plan-1", algorithmVersion: "v1", filename: args.filename, seed: 1, detectedSignals: [], warnings: [], passes: [], destructive: false }) }] };
    return { content: [{ text: JSON.stringify({ applied: { planId: "plan-1", outputFilename: args.output_filename, format: "png", frames: 1, passesApplied: ["cleanup"], sourcePreserved: true } }) }] };
  }
  public async upload(file: File): Promise<StoredAsset> { return { filename: file.name, path: `/tmp/${file.name}`, sizeBytes: file.size }; }
  public assetPreviewUrl(path: string): string { return `/preview?path=${encodeURIComponent(path)}`; }
}

describe("AssetStudioService enhancement use cases", () => {
  it("inspects before suggesting a typed plan", async () => {
    const gateway = new FakeGateway();
    const plan = await new AssetStudioService(gateway).suggestEnhancementPlan("source.png");
    expect(plan.planId).toBe("plan-1");
    expect(gateway.calls.map((call) => call.name)).toEqual(["inspect_reference", "suggest_enhancement_plan"]);
  });

  it("applies to a separate output and returns a typed outcome", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyEnhancementPlan("source.png", "source-enhanced.png");
    expect(result).toMatchObject({ outputFilename: "source-enhanced.png", sourcePreserved: true });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_enhancement_plan", args: { output_filename: "source-enhanced.png" } });
  });
});
