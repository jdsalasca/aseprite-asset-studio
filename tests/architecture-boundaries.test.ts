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

  it("keeps studio presentation styles modular and avoids Sass inheritance", async () => {
    const entry = await readFile(new URL("../src/styles/app.scss", import.meta.url), "utf8");
    const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
    const foundation = await readFile(new URL("../src/styles/_foundation.scss", import.meta.url), "utf8");
    expect(entry).toContain('@use "./tokens"');
    expect(entry).toContain('@use "./foundation"');
    expect(entry).toContain('@use "./layout"');
    expect(entry).toContain('@use "./components"');
    expect(entry).not.toContain("@extend");
    expect(main).toContain('import "./styles/app.scss"');
    expect(main).not.toContain('import "./styles/app.css"');
    expect(foundation).toContain("body {");
  });
});
