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
    const typography = await readFile(new URL("../src/styles/_typography.scss", import.meta.url), "utf8");
    const workflow = await readFile(new URL("../src/styles/_workflow.scss", import.meta.url), "utf8");
    const components = await readFile(new URL("../src/styles/_components.scss", import.meta.url), "utf8");
    expect(entry).toContain('@use "./tokens"');
    expect(entry).toContain('@use "./foundation"');
    expect(entry).toContain('@use "./layout"');
    expect(entry).toContain('@use "./components"');
    expect(entry).toContain('@use "./typography"');
    expect(entry).toContain('@use "./workflow"');
    expect(entry).not.toContain("@extend");
    expect(entry).not.toContain(".pixel-button");
    expect(main).toContain('import "./styles/app.scss"');
    expect(main).not.toContain('import "./styles/app.css"');
    expect(foundation).toContain("body {");
    expect(typography).toContain(".eyebrow");
    expect(workflow).toContain(".preview-grid");
    expect(workflow).not.toContain("@extend");
    expect(workflow.match(/\.quality-recommendations \{/g)?.length).toBe(1);
    expect(components).not.toContain(".quality-recommendations {");
  });
});
