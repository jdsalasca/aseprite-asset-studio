import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { McpStatus, StudioConfig } from "../src/domain/contracts.js";

export interface LaunchPlan { command: string; args: string[]; cwd: string; env: Record<string, string>; }

export function buildLaunchPlan(config: StudioConfig, platform = process.platform): LaunchPlan {
  const command = platform === "win32" ? "npm.cmd" : "npm";
  const env: Record<string, string> = {};
  if (config.asepritePath.trim()) env.ASEPRITE_PATH = config.asepritePath.trim();
  return { command, args: ["run", "mcp"], cwd: config.mcpRepoPath.trim(), env };
}

export function validateLaunchConfig(config: StudioConfig): string | undefined {
  const repoPath = config.mcpRepoPath.trim();
  if (!repoPath) return "Selecciona la carpeta del repositorio aseprite-mcp";
  const packagePath = join(repoPath, "package.json");
  if (!existsSync(packagePath)) return "La carpeta seleccionada no contiene package.json";
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: Record<string, unknown> };
    if (typeof packageJson.scripts?.mcp !== "string") return "El package.json no contiene el script npm 'mcp'";
  } catch {
    return "No se pudo leer el package.json del repositorio";
  }
  if (config.asepritePath.trim() && !existsSync(config.asepritePath.trim())) return "La ruta de Aseprite configurada no existe";
  return undefined;
}

export class McpProcessController {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private current: McpStatus = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "MCP detenido" };

  public status(): McpStatus { return { ...this.current }; }

  public async start(config: StudioConfig): Promise<McpStatus> {
    const validationError = validateLaunchConfig(config);
    if (validationError) throw new Error(validationError);
    if (this.current.state === "online") return this.status();
    this.current = { ...this.current, state: "starting", message: "Iniciando aseprite-mcp..." };
    const launchPlan = buildLaunchPlan(config);
    const inheritedEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) if (value !== undefined) inheritedEnv[key] = value;
    const transport = new StdioClientTransport({ ...launchPlan, stderr: "pipe", env: { ...inheritedEnv, ...launchPlan.env } });
    const client = new Client({ name: "aseprite-asset-studio", version: "0.1.0" });
    transport.onerror = (error) => { this.current = { ...this.current, state: "error", message: error.message }; };
    await client.connect(transport);
    const tools = await client.listTools();
    const serverVersion = client.getServerVersion();
    this.client = client;
    this.transport = transport;
    this.current = { state: "online", pid: transport.pid, serverName: serverVersion?.name ?? null, serverVersion: serverVersion?.version ?? null, toolCount: tools.tools.length, message: `Conectado: ${tools.tools.length} herramientas disponibles` };
    return this.status();
  }

  public async stop(): Promise<McpStatus> {
    await this.transport?.close();
    this.client = null;
    this.transport = null;
    this.current = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "MCP detenido" };
    return this.status();
  }

  public async tools() { if (!this.client) throw new Error("MCP no está iniciado"); return (await this.client.listTools()).tools; }

  public async call(name: string, args: Record<string, unknown>) { if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error("Nombre de herramienta inválido"); if (!this.client) throw new Error("MCP no está iniciado"); return this.client.callTool({ name, arguments: args }); }
}
