import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import type { StoredAsset } from "../../src/domain/contracts.js";
import type { AssetStoragePort } from "../../src/ports/AssetStoragePort.js";

const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".png", ".gif", ".webp", ".aseprite"]);

export class LocalAssetStore implements AssetStoragePort {
  public constructor(private readonly directory: string) {}

  public async store(filename: string, data: Uint8Array): Promise<StoredAsset> {
    if (data.byteLength > MAX_UPLOAD_BYTES) throw new Error("Asset exceeds the 32 MB upload limit");
    const safeFilename = basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const extension = safeFilename.toLowerCase().slice(safeFilename.lastIndexOf("."));
    if (!safeFilename || !ALLOWED_EXTENSIONS.has(extension)) throw new Error("Unsupported asset format");
    const root = resolve(this.directory);
    const target = resolve(join(root, safeFilename));
    if (!target.startsWith(`${root}${process.platform === "win32" ? "\\" : "/"}`)) throw new Error("Asset path escapes the storage directory");
    await mkdir(root, { recursive: true });
    await writeFile(target, data);
    return { filename: safeFilename, path: target, sizeBytes: data.byteLength };
  }
}
