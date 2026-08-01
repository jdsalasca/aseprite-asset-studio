import type { IncomingMessage, ServerResponse } from "node:http";
import type { StudioConfig } from "../src/domain/contracts.js";
import { ServerSetupService } from "../src/application/ServerSetupService.js";

export class StudioHttpController {
  public constructor(private readonly setup: ServerSetupService, private readonly defaultConfig: StudioConfig) {}

  public async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const origin = request.headers.origin;
    if (request.method === "OPTIONS") return this.send(response, 204, {}, origin);
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
    try {
      if (request.method === "GET" && url.pathname === "/api/health") return this.send(response, 200, { data: { ok: true, service: "asset-studio-gateway", version: "0.1.0", mcp: this.setup.status() } }, origin);
      if (request.method === "GET" && url.pathname === "/api/config") return this.send(response, 200, { data: await this.setup.loadConfig(this.defaultConfig) }, origin);
      if (request.method === "GET" && url.pathname === "/api/mcp/status") return this.send(response, 200, { data: this.setup.status() }, origin);
      if (request.method === "GET" && url.pathname === "/api/mcp/tools") return this.send(response, 200, { data: await this.setup.tools() }, origin);
      if (request.method === "GET" && url.pathname === "/api/assets/preview") return this.sendAsset(response, await this.setup.previewAsset(url.searchParams.get("path") ?? ""), origin);
      if (request.method === "POST" && url.pathname === "/api/assets/upload") return this.send(response, 200, { data: await this.setup.uploadAsset(url.searchParams.get("filename") ?? "asset.png", await this.readBuffer(request)) }, origin);
      if (request.method === "POST" && url.pathname === "/api/mcp/start") return this.send(response, 200, { data: await this.setup.start(await this.readBody(request) as StudioConfig) }, origin);
      if (request.method === "POST" && url.pathname === "/api/mcp/stop") return this.send(response, 200, { data: await this.setup.stop() }, origin);
      if (request.method === "POST" && url.pathname === "/api/mcp/call") { const input = await this.readBody(request) as { name?: string; args?: Record<string, unknown> }; return this.send(response, 200, { data: await this.setup.callTool(input.name ?? "", input.args ?? {}) }, origin); }
      return this.send(response, 404, { error: "Ruta no encontrada" }, origin);
    } catch (error) {
      return this.send(response, 400, { error: error instanceof Error ? error.message : String(error) }, origin);
    }
  }

  private async readBody(request: IncomingMessage): Promise<unknown> { let raw = ""; for await (const chunk of request) raw += chunk; return raw ? JSON.parse(raw) : {}; }
  private async readBuffer(request: IncomingMessage): Promise<Uint8Array> { const chunks: Buffer[] = []; let total = 0; for await (const chunk of request) { const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); total += buffer.length; if (total > 32 * 1024 * 1024) throw new Error("Asset exceeds the 32 MB upload limit"); chunks.push(buffer); } return Buffer.concat(chunks); }
  private send(response: ServerResponse, status: number, data: unknown, origin?: string): void {
    const allowedOrigin = origin && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin) ? origin : "null";
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": allowedOrigin, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS", vary: "origin" });
    response.end(JSON.stringify(data));
  }
  private sendAsset(response: ServerResponse, asset: { contentType: string; data: Uint8Array }, origin?: string): void {
    const allowedOrigin = origin && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin) ? origin : "null";
    response.writeHead(200, { "content-type": asset.contentType, "content-length": asset.data.byteLength, "access-control-allow-origin": allowedOrigin, vary: "origin" });
    response.end(Buffer.from(asset.data));
  }
}
