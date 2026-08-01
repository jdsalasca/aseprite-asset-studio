import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpAssetGateway } from "../src/adapters/mcp/HttpAssetGateway.js";

describe("HttpAssetGateway", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps generic runtime configuration to the concrete MCP wire contract", async () => {
    const fetchMock = vi.fn(async (_input: string | URL, init?: RequestInit) => new Response(JSON.stringify({ data: { state: "online", pid: 4, serverName: "provider", serverVersion: "1", toolCount: 2, message: "online" } }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const gateway = new HttpAssetGateway("http://studio.test");

    const status = await gateway.startRuntime({ workspacePath: "C:\\work\\provider", executablePath: "C:\\apps\\Aseprite.exe", gatewayPort: 3765 });

    expect(status.state).toBe("online");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ mcpRepoPath: "C:\\work\\provider", asepritePath: "C:\\apps\\Aseprite.exe", gatewayPort: 3765 });
  });

  it("maps the concrete health envelope into the generic runtime model", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { ok: true, service: "gateway", version: "1", mcp: { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "offline" } } }), { status: 200, headers: { "content-type": "application/json" } })));

    const health = await new HttpAssetGateway("http://studio.test").health();

    expect(health.runtime.state).toBe("offline");
    expect(health).not.toHaveProperty("mcp");
  });
});
