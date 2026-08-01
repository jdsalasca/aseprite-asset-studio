import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("hexagonal boundaries", () => {
  it("keeps provider-specific names out of the domain contracts", async () => {
    const source = await readFile(new URL("../src/domain/contracts.ts", import.meta.url), "utf8");

    expect(source).not.toMatch(/Aseprite|Mcp|child_process|fetch/);
  });

  it("keeps the concrete wire vocabulary inside the MCP adapter", async () => {
    const source = await readFile(new URL("../src/adapters/mcp/HttpAssetGateway.ts", import.meta.url), "utf8");

    expect(source).toMatch(/mcpRepoPath/);
    expect(source).toMatch(/asepritePath/);
  });
});
