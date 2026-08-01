import { describe, expect, it } from "vitest";
import { ServerSetupService } from "../src/application/ServerSetupService.js";
import type { StudioConfig } from "../src/domain/contracts.js";
import type { ConfigStorePort } from "../src/ports/ConfigStorePort.js";
import type { AssetStoragePort } from "../src/ports/AssetStoragePort.js";
import type { ToolSessionLaunchOptions, ToolSessionPort, ToolSessionStatus } from "../src/ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../src/ports/WorkspaceValidatorPort.js";

const config: StudioConfig = { mcpRepoPath: "C:\\work\\mcp", asepritePath: "C:\\apps\\Aseprite.exe", gatewayPort: 3765 };

class FakeSession implements ToolSessionPort {
  public options: ToolSessionLaunchOptions | undefined;
  private state: ToolSessionStatus = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" };
  public status() { return this.state; }
  public async start(options: ToolSessionLaunchOptions) { this.options = options; this.state = { state: "online", pid: 42, providerName: "fake", providerVersion: "1", toolCount: 2, message: "online" }; return this.state; }
  public async stop() { this.state = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" }; return this.state; }
  public async listTools() { return [{ name: "inspect_asset" }]; }
  public async call() { return { ok: true }; }
}

class FakeValidator implements WorkspaceValidatorPort<StudioConfig> {
  public error: string | undefined;
  public async validate() { return this.error; }
}

class FakeStore implements ConfigStorePort<StudioConfig> {
  public saved: StudioConfig | undefined;
  public async load(fallback: StudioConfig) { return fallback; }
  public async save(configToSave: StudioConfig) { this.saved = configToSave; }
}

class FakeAssetStorage implements AssetStoragePort {
  public async store(filename: string, data: Uint8Array) { return { filename, path: `/tmp/${filename}`, sizeBytes: data.byteLength }; }
  public async read(path: string) { return { filename: path, contentType: "image/png", data: new Uint8Array() }; }
}

describe("ServerSetupService", () => {
  it("maps human configuration to a generic session port and persists it", async () => {
    const session = new FakeSession();
    const store = new FakeStore();
    const service = new ServerSetupService(session, new FakeValidator(), store, new FakeAssetStorage());

    const status = await service.start(config);

    expect(session.options).toEqual({ workingDirectory: config.mcpRepoPath, environmentOverrides: { ASEPRITE_PATH: config.asepritePath } });
    expect(store.saved).toEqual(config);
    expect(status).toMatchObject({ state: "online", pid: 42, toolCount: 2 });
  });

  it("does not start or persist an invalid configuration", async () => {
    const session = new FakeSession();
    const validator = new FakeValidator();
    validator.error = "invalid workspace";
    const store = new FakeStore();
    const service = new ServerSetupService(session, validator, store, new FakeAssetStorage());

    await expect(service.start(config)).rejects.toThrow("invalid workspace");
    expect(session.options).toBeUndefined();
    expect(store.saved).toBeUndefined();
  });
});
