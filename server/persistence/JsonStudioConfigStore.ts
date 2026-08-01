import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ConfigStorePort } from "../../src/ports/ConfigStorePort.js";
import type { RuntimeConfig } from "../../src/domain/contracts.js";

interface StoredRuntimeConfig { mcpRepoPath?: string; asepritePath?: string; }

export class JsonStudioConfigStore implements ConfigStorePort<RuntimeConfig> {
  public constructor(private readonly filename: string) {}

  public async load(fallback: RuntimeConfig): Promise<RuntimeConfig> {
    try {
      const saved = JSON.parse(await readFile(this.filename, "utf8")) as StoredRuntimeConfig;
      return { ...fallback, workspacePath: saved.mcpRepoPath ?? fallback.workspacePath, executablePath: saved.asepritePath ?? fallback.executablePath, gatewayPort: fallback.gatewayPort };
    } catch {
      return fallback;
    }
  }

  public async save(config: RuntimeConfig): Promise<void> {
    await mkdir(dirname(this.filename), { recursive: true });
    await writeFile(this.filename, `${JSON.stringify({ mcpRepoPath: config.workspacePath, asepritePath: config.executablePath }, null, 2)}\n`, "utf8");
  }
}
