import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { validateAssetFile } from "../src/application/assetValidation.js";
import { shortcutAction } from "../src/application/keyboardShortcuts.js";
import { buildPipelineStages } from "../src/application/pipelineStages.js";
import { summarizeRuntimeMetrics } from "../src/application/runtimeMetrics.js";
import { ActivityLogPanel } from "../src/components/ActivityLogPanel.js";
import { AssetJobPanel } from "../src/components/AssetJobPanel.js";
import { PipelineStatus } from "../src/components/PipelineStatus.js";
import { RuntimeMetricsPanel } from "../src/components/RuntimeMetricsPanel.js";
import { RecipeCreatorPanel } from "../src/components/RecipeCreatorPanel.js";
import { SpriteEffectsPanel } from "../src/components/SpriteEffectsPanel.js";
import { ToolGrid } from "../src/components/ToolGrid.js";

describe("studio feature contracts", () => {
  it("validates supported asset formats and size limits", () => {
    expect(validateAssetFile({ name: "hero.PNG", size: 12 })).toBeNull();
    expect(validateAssetFile({ name: "hero.jpg", size: 12 })).toContain("Formato");
    expect(validateAssetFile({ name: "hero.png", size: 26 * 1024 * 1024 })).toContain("25 MB");
  });

  it("maps keyboard shortcuts without hijacking modified input", () => {
    expect(shortcutAction({ key: "i", ctrlKey: true, metaKey: false, shiftKey: false })).toBe("inspect");
    expect(shortcutAction({ key: "Enter", ctrlKey: false, metaKey: true, shiftKey: false })).toBe("apply");
    expect(shortcutAction({ key: "j", ctrlKey: true, metaKey: false, shiftKey: true })).toBeNull();
  });

  it("derives pipeline states and runtime metrics deterministically", () => {
    expect(buildPipelineStages({ online: true, hasAsset: true, hasPlan: false, hasQuality: false })[1]).toMatchObject({ id: "inspect", state: "active" });
    expect(buildPipelineStages({ online: true, hasAsset: true, hasPlan: true, hasQuality: true }).every((stage) => stage.state === "done")).toBe(true);
    expect(summarizeRuntimeMetrics([{ operation: "a", correlationId: "1", timestamp: "now", durationMs: 10, outcome: "success" }, { operation: "b", correlationId: "2", timestamp: "now", durationMs: 30, outcome: "failure" }, { operation: "b", correlationId: "2", timestamp: "now", durationMs: 0, outcome: "started" }])).toEqual({ total: 2, successes: 1, failures: 1, averageMs: 20 });
  });

  it("renders progress, searchable logs, tools and runtime metrics", () => {
    const jobMarkup = renderToStaticMarkup(<AssetJobPanel recipe="gif" job={{ id: "job-1", status: "running", jobs: [], createdAt: "now", updatedAt: "now", progress: { completed: 2, total: 4 } }} busy={false} canStart onRecipeChange={() => undefined} onStart={() => undefined} onCancel={() => undefined} />);
    expect(jobMarkup).toContain("JOB PROGRESS · 2/4");
    expect(jobMarkup).toContain("CRISP PNG");
    expect(renderToStaticMarkup(<ActivityLogPanel entries={[]} />)).toContain("FILTER LOG");
    expect(renderToStaticMarkup(<ToolGrid tools={[{ name: "apply_depth_lighting", description: "Light" }]} selectedName="" onSelect={() => undefined} />)).toContain("FILTER TOOLS");
    expect(renderToStaticMarkup(<PipelineStatus stages={buildPipelineStages({ online: false, hasAsset: false, hasPlan: false, hasQuality: false })} />)).toContain("PIPELINE STATUS");
    expect(renderToStaticMarkup(<RuntimeMetricsPanel metrics={{ total: 2, successes: 1, failures: 1, averageMs: 20 }} />)).toContain("AVG");
    expect(renderToStaticMarkup(<SpriteEffectsPanel busy={false} online assetName="hero.png" onApply={() => undefined} />)).toContain("SPRITE EFFECTS");
    const markup = renderToStaticMarkup(<RecipeCreatorPanel busy={false} online assetName="hero.png" onCreate={() => undefined} onExecute={() => undefined} />);
    expect(markup).toContain("RECIPE CREATOR");
    expect(markup).toContain("Quality gate");
    expect(markup).toContain("EXECUTE RECIPE");
  });
});
