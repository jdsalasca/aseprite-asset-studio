import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToolRunnerPanel } from "../src/components/ToolRunnerPanel.js";

describe("ToolRunnerPanel", () => {
  it("renders a typed tool selector and JSON argument editor", () => {
    const markup = renderToStaticMarkup(<ToolRunnerPanel tools={[{ name: "apply_material_texture", description: "Add material grain" }]} selectedToolName="apply_material_texture" initialArgs={{ material: "earth" }} busy={false} output={null} onToolChange={() => undefined} onRun={() => undefined} />);

    expect(markup).toContain("apply_material_texture");
    expect(markup).toContain("ARGUMENTS JSON");
    expect(markup).toContain("RUN MCP TOOL");
  });
});
