import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readStyleModule(name: string): Promise<string> {
  return readFile(new URL(`../src/styles/${name}`, import.meta.url), "utf8");
}

describe("SCSS architecture", () => {
  it("keeps one owner for shared presentation selectors", async () => {
    const components = await readStyleModule("_components.scss");
    const workflow = await readStyleModule("_workflow.scss");
    const typography = await readStyleModule("_typography.scss");

    expect(components).not.toContain(".eyebrow");
    expect(components).not.toContain(".setup-guide");
    expect(components).not.toContain(".studio-header h1");
    expect(components).not.toContain(".subtitle");
    expect(components).not.toContain(".tool-description");

    for (const selector of [
      ".preview-grid",
      ".plan-meta",
      ".plan-warning",
      ".plan-passes",
      ".artifact-list",
      ".tool-runner-actions",
      ".tool-output",
      ".runtime-metrics",
      ".material-controls",
      ".recipe-controls",
      ".pipeline-status",
      ".asset-library-search",
      ".asset-library-grid",
      ".log-line",
      ".activity-log",
    ]) {
      expect(workflow).not.toContain(selector);
    }

    expect(typography).toContain(".tool-description");
  });

  it("composes the SCSS entrypoint and keeps the browser style import explicit", async () => {
    const entry = await readStyleModule("app.scss");
    const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

    for (const moduleName of ["tokens", "foundation", "layout", "components", "typography", "workflow", "interactions"]) {
      expect(entry).toContain(`@use \"./${moduleName}\"`);
    }
    expect(main).toContain('import "./styles/app.scss"');
    expect(main).not.toContain('import "./styles/app.css"');
  });

  it("keeps focus behavior owned by one interaction module", async () => {
    const interactions = await readStyleModule("_interactions.scss");
    const components = await readStyleModule("_components.scss");
    const workflow = await readStyleModule("_workflow.scss");
    expect(interactions).toContain(":where(button, input, select, textarea):focus-visible");
    expect(interactions).toContain("studio-focus");
    expect(components).not.toContain("button:focus-visible");
    expect(workflow).not.toContain("button:focus-visible");
  });
});
