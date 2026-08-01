import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ConfigStorePort } from "../../src/ports/ConfigStorePort.js";
import type { StudioConfig } from "../../src/domain/contracts.js";

export class JsonStudioConfigStore implements ConfigStorePort<StudioConfig> {
  public constructor(private readonly filename: string) {}

  public async load(fallback: StudioConfig): Promise<StudioConfig> {
    try {
      const saved = JSON.parse(await readFile(this.filename, "utf8")) as Partial<StudioConfig>;
      return { ...fallback, ...saved, gatewayPort: fallback.gatewayPort };
    } catch {
      return fallback;
    }
  }

  public async save(config: StudioConfig): Promise<void> {
    await mkdir(dirname(this.filename), { recursive: true });
    await writeFile(this.filename, `${JSON.stringify({ mcpRepoPath: config.mcpRepoPath, asepritePath: config.asepritePath }, null, 2)}\n`, "utf8");
  }
}
