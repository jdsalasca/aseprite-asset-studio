import { describe, expect, it } from "vitest";
import { AssetJobService } from "../src/application/AssetJobService.js";
import { JobPollingGuard } from "../src/application/JobPollingGuard.js";
import type { AssetGateway, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";

const status: ToolRuntimeStatus = { state: "online", pid: 1, serverName: "fake", serverVersion: "1", toolCount: 1, message: "online" };

class FakeGateway implements AssetGateway {
  public calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  public async health(): Promise<HealthResponse> { return { ok: true, service: "fake", version: "1", runtime: status }; }
  public async config(): Promise<RuntimeConfig> { return { workspacePath: "", executablePath: "", gatewayPort: 3765 }; }
  public async startRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async stopRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async tools(): Promise<ToolDescriptor[]> { return []; }
  public async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    return { content: [{ text: JSON.stringify({ id: "job-1", status: "queued", jobs: [], createdAt: "now", updatedAt: "now" }) }] };
  }
  public async upload(file: File): Promise<StoredAsset> { return { filename: file.name, path: file.name, sizeBytes: file.size }; }
  public assetPreviewUrl(path: string): string { return path; }
}

describe("AssetJobService", () => {
  it("maps generic recipe contracts to the MCP wire schema", async () => {
    const gateway = new FakeGateway();
    await new AssetJobService(gateway).start({ jobs: [{ recipe: "gif", inputFilenames: ["source.png"], outputFilename: "source.gif", maxColors: 16 }] });
    expect(gateway.calls[0]).toEqual({ name: "start_asset_job", args: { jobs: [{ recipe: "gif", input_filenames: ["source.png"], output_filename: "source.gif", max_colors: 16 }] } });
  });

  it("rejects an empty job before calling the external consumer", async () => {
    const gateway = new FakeGateway();
    await expect(new AssetJobService(gateway).start({ jobs: [] })).rejects.toThrow("al menos una receta");
    expect(gateway.calls).toHaveLength(0);
  });

  it("rejects an in-flight poll after its lifecycle is invalidated", () => {
    const guard = new JobPollingGuard();
    const snapshot = guard.snapshot();

    guard.invalidate();

    expect(guard.accepts(snapshot)).toBe(false);
    expect(guard.accepts(guard.snapshot())).toBe(true);
  });
});
