import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { StudioConfig } from "../../src/domain/contracts.js";
import type { WorkspaceValidatorPort } from "../../src/ports/WorkspaceValidatorPort.js";

export class LocalMcpWorkspaceValidator implements WorkspaceValidatorPort<StudioConfig> {
  public async validate(config: StudioConfig): Promise<string | undefined> {
    const repositoryPath = config.mcpRepoPath.trim();
    if (!repositoryPath) return "Selecciona la carpeta del repositorio aseprite-mcp";
    const packagePath = join(repositoryPath, "package.json");
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
}
