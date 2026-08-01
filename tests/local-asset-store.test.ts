import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LocalAssetStore } from "../server/persistence/LocalAssetStore.js";

describe("LocalAssetStore", () => {
  it("stores an allowed asset under the configured root", async () => {
    const root = await mkdtemp(join(tmpdir(), "asset-studio-"));
    const stored = await new LocalAssetStore(root).store("beach.png", new Uint8Array([1, 2, 3]));
    expect(stored.path.startsWith(root)).toBe(true);
    expect(await readFile(stored.path)).toEqual(Buffer.from([1, 2, 3]));
  });

  it("rejects unsupported formats and oversized data", async () => {
    const root = await mkdtemp(join(tmpdir(), "asset-studio-"));
    const store = new LocalAssetStore(root);
    await expect(store.store("recipe.json", new Uint8Array([1]))).rejects.toThrow("Unsupported asset format");
    await expect(store.store("large.png", new Uint8Array(32 * 1024 * 1024 + 1))).rejects.toThrow("32 MB");
  });
});
