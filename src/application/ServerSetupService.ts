import type { AssetContent, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../domain/contracts.js";
import type { AssetStoragePort } from "../ports/AssetStoragePort.js";
import type { ConfigStorePort } from "../ports/ConfigStorePort.js";
import type { ToolSessionPort } from "../ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../ports/WorkspaceValidatorPort.js";

export class ServerSetupService {
  public constructor(
    private readonly session: ToolSessionPort,
    private readonly validator: WorkspaceValidatorPort<RuntimeConfig>,
    private readonly configStore: ConfigStorePort<RuntimeConfig>,
    private readonly assetStorage: AssetStoragePort,
  ) {}

  public status(): ToolRuntimeStatus { return this.toRuntimeStatus(this.session.status()); }

  public async loadConfig(fallback: RuntimeConfig): Promise<RuntimeConfig> {
    return this.configStore.load(fallback);
  }

  public async start(config: RuntimeConfig): Promise<ToolRuntimeStatus> {
    const validationError = await this.validator.validate(config);
    if (validationError) throw new Error(validationError);
    await this.configStore.save(config);
    return this.toRuntimeStatus(await this.session.start({
      workingDirectory: config.workspacePath.trim(),
      environmentOverrides: config.executablePath.trim() ? { ASEPRITE_PATH: config.executablePath.trim() } : {},
    }));
  }

  public async stop(): Promise<ToolRuntimeStatus> { return this.toRuntimeStatus(await this.session.stop()); }
  public async tools(): Promise<ToolDescriptor[]> { return this.session.listTools(); }
  public callTool(name: string, args: Record<string, unknown>): Promise<unknown> { return this.session.call(name, args); }
  public uploadAsset(filename: string, data: Uint8Array): Promise<StoredAsset> { return this.assetStorage.store(filename, data); }
  public previewAsset(path: string): Promise<AssetContent> { return this.assetStorage.read(path); }

  private toRuntimeStatus(status: ReturnType<ToolSessionPort["status"]>): ToolRuntimeStatus {
    return { state: status.state, pid: status.pid, serverName: status.providerName, serverVersion: status.providerVersion, toolCount: status.toolCount, message: status.message };
  }
}
