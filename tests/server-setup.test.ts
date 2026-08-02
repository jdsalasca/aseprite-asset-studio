import { describe, expect, it } from "vitest";
import { ServerSetupService } from "../src/application/ServerSetupService.js";
import type { RuntimeConfig } from "../src/domain/contracts.js";
import type { ConfigStorePort } from "../src/ports/ConfigStorePort.js";
import type { AssetStoragePort } from "../src/ports/AssetStoragePort.js";
import type { ToolSessionLaunchOptions, ToolSessionPort, ToolSessionStatus } from "../src/ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../src/ports/WorkspaceValidatorPort.js";
import type { AsepriteDiscoveryPort } from "../src/ports/AsepriteDiscoveryPort.js";

const config: RuntimeConfig = { workspacePath: "C:\\work\\mcp", executablePath: "C:\\apps\\Aseprite.exe", gatewayPort: 3765 };

class FakeSession implements ToolSessionPort {
  public options: ToolSessionLaunchOptions | undefined;
  private state: ToolSessionStatus = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" };
  public status() { return this.state; }
  public async start(options: ToolSessionLaunchOptions) { this.options = options; this.state = { state: "online", pid: 42, providerName: "fake", providerVersion: "1", toolCount: 2, message: "online" }; return this.state; }
  public async stop() { this.state = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "offline" }; return this.state; }
  public async listTools() { return [{ name: "inspect_asset" }]; }
  public async call() { return { ok: true }; }
}

class FakeValidator implements WorkspaceValidatorPort<RuntimeConfig> {
  public error: string | undefined;
  public async validate() { return this.error; }
}

class FakeStore implements ConfigStorePort<RuntimeConfig> {
  public saved: RuntimeConfig | undefined;
  public async load(fallback: RuntimeConfig) { return fallback; }
  public async save(configToSave: RuntimeConfig) { this.saved = configToSave; }
}

class FakeAssetStorage implements AssetStoragePort {
  public async store(filename: string, data: Uint8Array) { return { filename, path: `/tmp/${filename}`, sizeBytes: data.byteLength }; }
  public async read(path: string) { return { filename: path, contentType: "image/png", data: new Uint8Array() }; }
}

class FakeAsepriteDiscovery implements AsepriteDiscoveryPort {
  public preferredPath: string | undefined;
  public async detect(preferredPath?: string) { this.preferredPath = preferredPath; return { found: true as const, executablePath: preferredPath ?? "C:\\apps\\Aseprite.exe", source: preferredPath ? "configured" as const : "common_path" as const, candidatesChecked: 1, message: "Aseprite detectado" }; }
}

describe("ServerSetupService", () => {
  it("maps human configuration to a generic session port and persists it", async () => {
    const session = new FakeSession();
    const store = new FakeStore();
    const service = new ServerSetupService(session, new FakeValidator(), store, new FakeAssetStorage());

    const status = await service.start(config);

    expect(session.options).toEqual({ workingDirectory: config.workspacePath, environmentOverrides: { ASEPRITE_PATH: config.executablePath } });
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

  it("auto-detects Aseprite when the user leaves the executable empty", async () => {
    const session = new FakeSession();
    const store = new FakeStore();
    const detector = new FakeAsepriteDiscovery();
    const service = new ServerSetupService(session, new FakeValidator(), store, new FakeAssetStorage(), detector);
    const status = await service.start({ ...config, executablePath: "", mcpRestPort: 3766 });

    expect(detector.preferredPath).toBeUndefined();
    expect(session.options?.environmentOverrides).toEqual({ ASEPRITE_PATH: "C:\\apps\\Aseprite.exe", MCP_REST_PORT: "3766" });
    expect(store.saved?.executablePath).toBe("C:\\apps\\Aseprite.exe");
    expect(status.message).toContain("Aseprite detectado");
  });

  it("exposes diagnostics without hiding the last launch error", async () => {
    const detector = new FakeAsepriteDiscovery();
    const service = new ServerSetupService(new FakeSession(), new FakeValidator(), new FakeStore(), new FakeAssetStorage(), detector);
    const diagnostics = await service.diagnostics({ ...config, executablePath: "" });
    expect(diagnostics.aseprite.found).toBe(true);
    expect(diagnostics.runtime.state).toBe("offline");
    expect(diagnostics.lastError).toBeNull();
    expect(diagnostics.restEndpoint).toBeNull();
  });
});
