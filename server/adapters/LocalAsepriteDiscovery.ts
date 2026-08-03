import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import type { AsepriteDetection } from "../../src/domain/aseprite.js";
import type { AsepriteDiscoveryPort } from "../../src/ports/AsepriteDiscoveryPort.js";

export class LocalAsepriteDiscovery implements AsepriteDiscoveryPort {
  public async detect(preferredPath?: string): Promise<AsepriteDetection> {
    const candidates = [...new Set([preferredPath, process.env.ASEPRITE_PATH, ...this.commonPaths()].filter((value): value is string => Boolean(value?.trim())).map((value) => path.normalize(value.trim())))];
    for (const [index, candidate] of candidates.entries()) if (await this.isExecutable(candidate)) return { found: true, executablePath: candidate, source: index === 0 && preferredPath ? "configured" : index === 0 && process.env.ASEPRITE_PATH ? "environment" : "common_path", candidatesChecked: index + 1, message: `Aseprite detectado en ${candidate}` };
    return { found: false, executablePath: null, source: "not_found", candidatesChecked: candidates.length, message: "No se encontró Aseprite. Instálalo o selecciona su ejecutable." };
  }

  private commonPaths(): string[] {
    const programFiles = process.env.ProgramW6432 ?? process.env.ProgramFiles ?? "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
    const localAppData = process.env.LOCALAPPDATA ?? path.join(process.env.USERPROFILE ?? "", "AppData", "Local");
    return [path.join(programFiles, "Aseprite", "Aseprite.exe"), path.join(programFilesX86, "Aseprite", "Aseprite.exe"), path.join(programFiles, "Steam", "steamapps", "common", "Aseprite", "Aseprite.exe"), path.join(programFilesX86, "Steam", "steamapps", "common", "Aseprite", "Aseprite.exe"), path.join(localAppData, "Programs", "Aseprite", "Aseprite.exe"), "/Applications/Aseprite.app/Contents/MacOS/aseprite", "/usr/bin/aseprite", "/usr/local/bin/aseprite"];
  }

  private async isExecutable(filename: string): Promise<boolean> { try { await access(filename, process.platform === "win32" ? constants.F_OK : constants.X_OK); return true; } catch { return false; } }
}
