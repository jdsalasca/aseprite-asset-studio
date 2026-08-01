import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { McpProcessController } from "./McpProcessController.js";
import type { StudioConfig } from "../src/domain/contracts.js";

const port = Number(process.env.ASSET_STUDIO_GATEWAY_PORT ?? 3765);
const controller = new McpProcessController();
const defaultConfig: StudioConfig = { mcpRepoPath: process.env.MCP_REPO_PATH ?? "", asepritePath: process.env.ASEPRITE_PATH ?? "", gatewayPort: port };

function send(response: ServerResponse, status: number, data: unknown) { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "http://localhost:4173", "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS" }); response.end(JSON.stringify(data)); }
async function body(request: IncomingMessage): Promise<unknown> { let raw = ""; for await (const chunk of request) raw += chunk; return raw ? JSON.parse(raw) : {}; }
async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method === "OPTIONS") return send(response, 204, {});
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { data: { ok: true, service: "asset-studio-gateway", version: "0.1.0", mcp: controller.status() } });
    if (request.method === "GET" && url.pathname === "/api/config") return send(response, 200, { data: defaultConfig });
    if (request.method === "GET" && url.pathname === "/api/mcp/status") return send(response, 200, { data: controller.status() });
    if (request.method === "GET" && url.pathname === "/api/mcp/tools") return send(response, 200, { data: await controller.tools() });
    if (request.method === "POST" && url.pathname === "/api/mcp/start") return send(response, 200, { data: await controller.start(await body(request) as StudioConfig) });
    if (request.method === "POST" && url.pathname === "/api/mcp/stop") return send(response, 200, { data: await controller.stop() });
    if (request.method === "POST" && url.pathname === "/api/mcp/call") { const input = await body(request) as { name?: string; args?: Record<string, unknown> }; return send(response, 200, { data: await controller.call(input.name ?? "", input.args ?? {}) }); }
    return send(response, 404, { error: "Ruta no encontrada" });
  } catch (error) { return send(response, 400, { error: error instanceof Error ? error.message : String(error) }); }
}

createServer((request, response) => { void handler(request, response); }).listen(port, "127.0.0.1", () => console.log(`Asset Studio gateway listening on http://127.0.0.1:${port}`));
