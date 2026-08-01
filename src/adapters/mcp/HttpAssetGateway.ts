import type { AssetGateway, HealthResponse, McpStatus, McpToolSummary, StudioConfig } from "../../domain/contracts.js";

export class HttpAssetGateway implements AssetGateway {
  public constructor(private readonly baseUrl = "http://127.0.0.1:3765") {}

  public health() { return this.request<HealthResponse>("/api/health"); }
  public config() { return this.request<StudioConfig>("/api/config"); }
  public startMcp(config: StudioConfig) { return this.request<McpStatus>("/api/mcp/start", { method: "POST", body: JSON.stringify(config) }); }
  public stopMcp() { return this.request<McpStatus>("/api/mcp/stop", { method: "POST" }); }
  public tools() { return this.request<McpToolSummary[]>("/api/mcp/tools"); }
  public callTool(name: string, args: Record<string, unknown>) { return this.request<unknown>("/api/mcp/call", { method: "POST", body: JSON.stringify({ name, args }) }); }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: { "content-type": "application/json" }, ...init });
    const payload = await response.json() as { data?: T; error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Gateway request failed (${response.status})`);
    return payload.data as T;
  }
}
