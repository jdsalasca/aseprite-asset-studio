import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ToolDefinition, ToolSessionLaunchOptions, ToolSessionPort, ToolSessionStatus } from "../../src/ports/ToolSessionPort.js";

export interface LaunchPlan { command: string; args: string[]; cwd: string; env: Record<string, string>; }

export function buildLaunchPlan(options: ToolSessionLaunchOptions, platform = process.platform): LaunchPlan {
  const command = platform === "win32" ? "npm.cmd" : "npm";
  return { command, args: ["run", "mcp"], cwd: options.workingDirectory, env: options.environmentOverrides };
}

export class StdioMcpSessionAdapter implements ToolSessionPort {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private current: ToolSessionStatus = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "MCP detenido" };

  public status(): ToolSessionStatus { return { ...this.current }; }

  public async start(options: ToolSessionLaunchOptions): Promise<ToolSessionStatus> {
    if (this.current.state === "online") return this.status();
    this.current = { ...this.current, state: "starting", message: "Iniciando herramienta externa..." };
    const plan = buildLaunchPlan(options);
    const inheritedEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) if (value !== undefined) inheritedEnv[key] = value;
    const transport = new StdioClientTransport({ command: plan.command, args: plan.args, cwd: plan.cwd, stderr: "pipe", env: { ...inheritedEnv, ...plan.env } });
    const client = new Client({ name: "aseprite-asset-studio", version: "0.1.0" });
    transport.onerror = (error) => { this.current = { ...this.current, state: "error", message: error.message }; };
    try {
      await client.connect(transport);
      const tools = await client.listTools();
      const providerVersion = client.getServerVersion();
      this.client = client;
      this.transport = transport;
      this.current = { state: "online", pid: transport.pid, providerName: providerVersion?.name ?? null, providerVersion: providerVersion?.version ?? null, toolCount: tools.tools.length, message: `Conectado: ${tools.tools.length} herramientas disponibles` };
      return this.status();
    } catch (error) {
      await transport.close().catch(() => undefined);
      this.current = { state: "error", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: error instanceof Error ? error.message : String(error) };
      throw error;
    }
  }

  public async stop(): Promise<ToolSessionStatus> {
    await this.transport?.close();
    this.client = null;
    this.transport = null;
    this.current = { state: "offline", pid: null, providerName: null, providerVersion: null, toolCount: 0, message: "MCP detenido" };
    return this.status();
  }

  public async listTools(): Promise<ToolDefinition[]> {
    if (!this.client) throw new Error("MCP no está iniciado");
    return (await this.client.listTools()).tools;
  }

  public async call(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error("Nombre de herramienta inválido");
    if (!this.client) throw new Error("MCP no está iniciado");
    return this.client.callTool({ name, arguments: args });
  }
}
