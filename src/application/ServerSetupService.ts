import type { AssetContent, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../domain/contracts.js";
import type { AsepriteDetection, RuntimeDiagnostics } from "../domain/aseprite.js";
import type { AssetStoragePort } from "../ports/AssetStoragePort.js";
import type { ConfigStorePort } from "../ports/ConfigStorePort.js";
import type { ToolSessionPort } from "../ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../ports/WorkspaceValidatorPort.js";
import type { AsepriteDiscoveryPort } from "../ports/AsepriteDiscoveryPort.js";

class PreferredPathDiscovery implements AsepriteDiscoveryPort { public async detect(preferredPath?: string): Promise<AsepriteDetection> { return preferredPath ? { found: true, executablePath: preferredPath, source: "configured", candidatesChecked: 1, message: `Aseprite configurado en ${preferredPath}` } : { found: false, executablePath: null, source: "not_found", candidatesChecked: 0, message: "No se configuró un detector de Aseprite" }; } }

export class ServerSetupService {
  public constructor(
    private readonly session: ToolSessionPort,
    private readonly validator: WorkspaceValidatorPort<RuntimeConfig>,
    private readonly configStore: ConfigStorePort<RuntimeConfig>,
    private readonly assetStorage: AssetStoragePort,
    private readonly aseprite: AsepriteDiscoveryPort = new PreferredPathDiscovery(),
  ) {}

  private lastError: string | null = null;

  public status(): ToolRuntimeStatus { return this.toRuntimeStatus(this.session.status()); }

  public async loadConfig(fallback: RuntimeConfig): Promise<RuntimeConfig> {
    return this.configStore.load(fallback);
  }

  public async start(config: RuntimeConfig): Promise<ToolRuntimeStatus> {
    try {
      const validationError = await this.validator.validate(config);
      if (validationError) throw new Error(validationError);
      const detection = await this.aseprite.detect(config.executablePath.trim() || undefined);
      if (!detection.found || !detection.executablePath) throw new Error(detection.message);
      const resolvedConfig = { ...config, executablePath: detection.executablePath };
      const environmentOverrides = { ASEPRITE_PATH: detection.executablePath, ...(config.mcpRestPort === undefined ? {} : { MCP_REST_PORT: String(config.mcpRestPort) }) };
      const status = this.toRuntimeStatus(await this.session.start({ workingDirectory: config.workspacePath.trim(), environmentOverrides }));
      await this.configStore.save(resolvedConfig);
      this.lastError = null;
      return { ...status, message: `${status.message} · ${detection.message}` };
    } catch (error) { this.lastError = error instanceof Error ? error.message : String(error); throw error; }
  }

  public async stop(): Promise<ToolRuntimeStatus> { try { const status = this.toRuntimeStatus(await this.session.stop()); this.lastError = null; return status; } catch (error) { this.lastError = error instanceof Error ? error.message : String(error); throw error; } }
  public async detectAseprite(preferredPath?: string): Promise<AsepriteDetection> { return this.aseprite.detect(preferredPath); }
  public async diagnostics(config: RuntimeConfig): Promise<RuntimeDiagnostics> { const detection = await this.aseprite.detect(config.executablePath.trim() || undefined); return { runtime: this.status(), aseprite: detection, lastError: this.lastError, restEndpoint: config.mcpRestPort ? `http://127.0.0.1:${config.mcpRestPort}` : null }; }
  public async tools(): Promise<ToolDescriptor[]> { return this.session.listTools(); }
  public callTool(name: string, args: Record<string, unknown>): Promise<unknown> { return this.session.call(name, args); }
  public uploadAsset(filename: string, data: Uint8Array): Promise<StoredAsset> { return this.assetStorage.store(filename, data); }
  public previewAsset(path: string): Promise<AssetContent> { return this.assetStorage.read(path); }

  private toRuntimeStatus(status: ReturnType<ToolSessionPort["status"]>): ToolRuntimeStatus {
    return { state: status.state, pid: status.pid, serverName: status.providerName, serverVersion: status.providerVersion, toolCount: status.toolCount, message: status.message };
  }
}
