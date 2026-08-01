import type { AssetGateway, McpStatus, StudioConfig } from "../domain/contracts.js";

export class AssetStudioService {
  public constructor(private readonly gateway: AssetGateway) {}

  public health() { return this.gateway.health(); }
  public config() { return this.gateway.config(); }
  public startMcp(config: StudioConfig): Promise<McpStatus> { return this.gateway.startMcp(config); }
  public stopMcp(): Promise<McpStatus> { return this.gateway.stopMcp(); }
  public tools() { return this.gateway.tools(); }
  public callTool(name: string, args: Record<string, unknown>) { return this.gateway.callTool(name, args); }
}
