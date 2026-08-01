import type { McpStatus, McpToolSummary, StudioConfig } from "../domain/contracts.js";
import type { ConfigStorePort } from "../ports/ConfigStorePort.js";
import type { ToolSessionPort } from "../ports/ToolSessionPort.js";
import type { WorkspaceValidatorPort } from "../ports/WorkspaceValidatorPort.js";

export class ServerSetupService {
  public constructor(
    private readonly session: ToolSessionPort,
    private readonly validator: WorkspaceValidatorPort<StudioConfig>,
    private readonly configStore: ConfigStorePort<StudioConfig>,
  ) {}

  public status(): McpStatus { return this.toMcpStatus(this.session.status()); }

  public async loadConfig(fallback: StudioConfig): Promise<StudioConfig> {
    return this.configStore.load(fallback);
  }

  public async start(config: StudioConfig): Promise<McpStatus> {
    const validationError = await this.validator.validate(config);
    if (validationError) throw new Error(validationError);
    await this.configStore.save(config);
    return this.toMcpStatus(await this.session.start({
      workingDirectory: config.mcpRepoPath.trim(),
      environmentOverrides: config.asepritePath.trim() ? { ASEPRITE_PATH: config.asepritePath.trim() } : {},
    }));
  }

  public async stop(): Promise<McpStatus> { return this.toMcpStatus(await this.session.stop()); }
  public async tools(): Promise<McpToolSummary[]> { return this.session.listTools(); }
  public callTool(name: string, args: Record<string, unknown>): Promise<unknown> { return this.session.call(name, args); }

  private toMcpStatus(status: ReturnType<ToolSessionPort["status"]>): McpStatus {
    return { state: status.state, pid: status.pid, serverName: status.providerName, serverVersion: status.providerVersion, toolCount: status.toolCount, message: status.message };
  }
}
