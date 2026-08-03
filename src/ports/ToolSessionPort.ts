export type ToolSessionState = "offline" | "starting" | "online" | "error";

export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface ToolSessionStatus {
  state: ToolSessionState;
  pid: number | null;
  providerName: string | null;
  providerVersion: string | null;
  toolCount: number;
  message: string;
}

export interface ToolSessionLaunchOptions {
  workingDirectory: string;
  environmentOverrides: Record<string, string>;
}

export interface ToolSessionPort {
  status(): ToolSessionStatus;
  start(options: ToolSessionLaunchOptions): Promise<ToolSessionStatus>;
  stop(): Promise<ToolSessionStatus>;
  listTools(): Promise<ToolDefinition[]>;
  call(name: string, args: Record<string, unknown>): Promise<unknown>;
}
