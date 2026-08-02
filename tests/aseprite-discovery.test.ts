import { mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocalAsepriteDiscovery } from "../server/adapters/LocalAsepriteDiscovery.js";

describe("LocalAsepriteDiscovery", () => {
  it("accepts an explicitly selected executable and reports its source", async () => {
    const directory = await mkdtemp(path.join(process.cwd(), ".aseprite-discovery-"));
    const executable = path.join(directory, "Aseprite.exe");
    await writeFile(executable, "fake executable");
    const result = await new LocalAsepriteDiscovery().detect(executable);

    expect(result).toMatchObject({ found: true, executablePath: path.normalize(executable), source: "configured" });
  });
});
