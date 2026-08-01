import type { AssetGateway, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../../domain/contracts.js";

interface RuntimeConfigPayload { mcpRepoPath: string; asepritePath: string; gatewayPort: number; }
interface HealthPayload { ok: boolean; service: string; version: string; mcp: ToolRuntimeStatus; }

export class HttpAssetGateway implements AssetGateway {
  public constructor(private readonly baseUrl = "http://127.0.0.1:3765") {}

  public async health(): Promise<HealthResponse> {
    const payload = await this.request<HealthPayload>("/api/health");
    return { ok: payload.ok, service: payload.service, version: payload.version, runtime: payload.mcp };
  }
  public async config(): Promise<RuntimeConfig> {
    const payload = await this.request<RuntimeConfigPayload>("/api/config");
    return { workspacePath: payload.mcpRepoPath, executablePath: payload.asepritePath, gatewayPort: payload.gatewayPort };
  }
  public startRuntime(config: RuntimeConfig) {
    return this.request<ToolRuntimeStatus>("/api/mcp/start", { method: "POST", body: JSON.stringify({ mcpRepoPath: config.workspacePath, asepritePath: config.executablePath, gatewayPort: config.gatewayPort }) });
  }
  public stopRuntime() { return this.request<ToolRuntimeStatus>("/api/mcp/stop", { method: "POST" }); }
  public tools() { return this.request<ToolDescriptor[]>("/api/mcp/tools"); }
  public callTool(name: string, args: Record<string, unknown>) { return this.request<unknown>("/api/mcp/call", { method: "POST", body: JSON.stringify({ name, args }) }); }
  public async upload(file: File): Promise<StoredAsset> {
    const response = await fetch(`${this.baseUrl}/api/assets/upload?filename=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "content-type": file.type || "application/octet-stream" }, body: await file.arrayBuffer() });
    const payload = await response.json() as { data?: StoredAsset; error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Upload failed (${response.status})`);
    return payload.data as StoredAsset;
  }
  public assetPreviewUrl(path: string): string { return `${this.baseUrl}/api/assets/preview?path=${encodeURIComponent(path)}`; }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: { "content-type": "application/json" }, ...init });
    const payload = await response.json() as { data?: T; error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Gateway request failed (${response.status})`);
    return payload.data as T;
  }
}
