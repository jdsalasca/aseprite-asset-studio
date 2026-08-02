import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { StudioHttpController } from "../server/StudioHttpController.js";
import { ServerSetupService } from "../src/application/ServerSetupService.js";
import type { AssetContent, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";
import type { AssetStoragePort } from "../src/ports/AssetStoragePort.js";
import type { ConfigStorePort } from "../src/ports/ConfigStorePort.js";
import type { ToolSessionLaunchOptions, ToolSessionPort, ToolSessionStatus } from "../src/ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../src/ports/WorkspaceValidatorPort.js";

const defaultConfig: RuntimeConfig = { workspacePath: "", executablePath: "", gatewayPort: 3765 };

class MemorySession implements ToolSessionPort {
  private current: ToolSessionStatus = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" };

  public status(): ToolSessionStatus { return this.current; }
  public async start(_options: ToolSessionLaunchOptions): Promise<ToolSessionStatus> {
    this.current = { state: "online", pid: 101, providerName: "fake-provider", providerVersion: "1", toolCount: 2, message: "online" };
    return this.current;
  }
  public async stop(): Promise<ToolSessionStatus> {
    this.current = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" };
    return this.current;
  }
  public async listTools(): Promise<ToolDescriptor[]> { return [{ name: "inspect_asset" }]; }
  public async call(name: string, args: Record<string, unknown>): Promise<unknown> { return { name, args, ok: true }; }
}

class AcceptAllWorkspace implements WorkspaceValidatorPort<RuntimeConfig> {
  public async validate(): Promise<string | undefined> { return undefined; }
}

class MemoryConfig implements ConfigStorePort<RuntimeConfig> {
  public async load(fallback: RuntimeConfig): Promise<RuntimeConfig> { return fallback; }
  public async save(): Promise<void> {}
}

class MemoryAssetStorage implements AssetStoragePort {
  private readonly assets = new Map<string, AssetContent>();

  public async store(filename: string, data: Uint8Array): Promise<StoredAsset> {
    const path = `/memory/${filename}`;
    this.assets.set(path, { filename, contentType: "image/png", data });
    return { filename, path, sizeBytes: data.byteLength };
  }

  public async read(path: string): Promise<AssetContent> {
    const asset = this.assets.get(path);
    if (!asset) throw new Error("asset not found");
    return asset;
  }
}

async function openGateway(): Promise<{ baseUrl: string; close(): Promise<void> }> {
  const setup = new ServerSetupService(new MemorySession(), new AcceptAllWorkspace(), new MemoryConfig(), new MemoryAssetStorage());
  const controller = new StudioHttpController(setup, defaultConfig);
  const server = createServer((request: IncomingMessage, response: ServerResponse) => { void controller.handle(request, response); });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  return { baseUrl: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
}

describe("StudioHttpController integration", () => {
  let gateway: Awaited<ReturnType<typeof openGateway>> | undefined;

  afterEach(async () => { await gateway?.close(); gateway = undefined; });

  it("serves health, upload, preview, runtime start, and tool calls through the real HTTP boundary", async () => {
    gateway = await openGateway();

    const health = await fetch(`${gateway.baseUrl}/api/health`);
    expect(health.status).toBe(200);
    expect((await health.json()).data.mcp.state).toBe("offline");

    const upload = await fetch(`${gateway.baseUrl}/api/assets/upload?filename=beach.png`, { method: "POST", body: new Uint8Array([1, 2, 3]) });
    const uploaded = (await upload.json()).data as StoredAsset;
    expect(upload.status).toBe(200);
    expect(uploaded.path).toBe("/memory/beach.png");

    const preview = await fetch(`${gateway.baseUrl}/api/assets/preview?path=${encodeURIComponent(uploaded.path)}`);
    expect(preview.status).toBe(200);
    expect(preview.headers.get("content-type")).toContain("image/png");
    expect([...new Uint8Array(await preview.arrayBuffer())]).toEqual([1, 2, 3]);

    const start = await fetch(`${gateway.baseUrl}/api/mcp/start`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mcpRepoPath: "C:\\work\\provider" }) });
    expect((await start.json()).data.state).toBe("online");

    const call = await fetch(`${gateway.baseUrl}/api/mcp/call`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "inspect_asset", args: { filename: uploaded.path } }) });
    expect((await call.json()).data).toMatchObject({ name: "inspect_asset", ok: true });
  });
});
