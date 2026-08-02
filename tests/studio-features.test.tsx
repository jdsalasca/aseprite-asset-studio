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
import { AssetLibraryPanel } from "../src/components/AssetLibraryPanel.js";
import { SceneExtensionPanel } from "../src/components/SceneExtensionPanel.js";
import { VariantPackPanel } from "../src/components/VariantPackPanel.js";
import { SceneEffectStackPanel } from "../src/components/SceneEffectStackPanel.js";
import { VariantPreviewPanel } from "../src/components/VariantPreviewPanel.js";
import { QualityRecommendationsPanel } from "../src/components/QualityRecommendationsPanel.js";
import { PaletteHarmonizerPanel } from "../src/components/PaletteHarmonizerPanel.js";
import { ContactSheetPanel } from "../src/components/ContactSheetPanel.js";
import { QualityBatchPanel } from "../src/components/QualityBatchPanel.js";
import { AnimationAuditPanel } from "../src/components/AnimationAuditPanel.js";
import { SpriteNormalizationPanel } from "../src/components/SpriteNormalizationPanel.js";
import { AnimationSheetPanel } from "../src/components/AnimationSheetPanel.js";
import { SpriteGeometryPanel } from "../src/components/SpriteGeometryPanel.js";
import { SpriteHitboxPanel } from "../src/components/SpriteHitboxPanel.js";
import { SpriteRuntimeBundlePanel } from "../src/components/SpriteRuntimeBundlePanel.js";

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
    const effectsMarkup = renderToStaticMarkup(<SpriteEffectsPanel busy={false} online assetName="hero.png" onApply={() => undefined} />);
    expect(effectsMarkup).toContain("SPRITE EFFECTS");
    expect(effectsMarkup).toContain("NEAREST UPSCALE");
    expect(effectsMarkup).toContain("SEAMLESS TEXTURE");
    expect(effectsMarkup).toContain("WATER REFLECTION");
    expect(effectsMarkup).toContain("WATER CAUSTICS");
    expect(effectsMarkup).toContain("DAY / NIGHT CYCLE");
    expect(renderToStaticMarkup(<SceneExtensionPanel busy={false} online onExtend={() => undefined} onTransition={() => undefined} />)).toContain("SCENE EXTENSION");
    expect(renderToStaticMarkup(<SceneExtensionPanel busy={false} online onExtend={() => undefined} onTransition={() => undefined} />)).toContain("BLEND BIOMES");
    expect(renderToStaticMarkup(<VariantPackPanel busy={false} online assetName="oak.png" onGenerate={() => undefined} />)).toContain("ENVIRONMENT VARIANT PACK");
    expect(renderToStaticMarkup(<SceneEffectStackPanel busy={false} online assetName="oak.png" onGenerate={() => undefined} />)).toContain("SCENE EFFECT STACK");
    expect(renderToStaticMarkup(<VariantPreviewPanel previewUrl={(path) => `/preview?path=${encodeURIComponent(path)}`} artifacts={[{ variant: "rain", outputFilename: "oak-rain.gif", operation: "generate_rain_overlay", frames: 8, format: "gif", deterministic: true, sourcePreserved: true }]} />)).toContain("VARIANT PREVIEWS");
    expect(renderToStaticMarkup(<QualityRecommendationsPanel recommendations={["Reduce the palette before export."]} />)).toContain("QUALITY RECOMMENDATIONS");
    const markup = renderToStaticMarkup(<RecipeCreatorPanel busy={false} online assetName="hero.png" onCreate={() => undefined} onExecute={() => undefined} />);
    expect(markup).toContain("RECIPE CREATOR");
    expect(markup).toContain("Quality gate");
    expect(markup).toContain("EXECUTE RECIPE");
    const libraryMarkup = renderToStaticMarkup(<AssetLibraryPanel busy={false} online restPort={3766} query="rain" items={[{ id: "oak", title: "Oak", category: "flora", folder: "flora/oak", kind: "sprite", description: "Tree", tags: ["tree"], variants: ["rain"], formats: ["png", "svg", "json"], readmePath: "flora/oak/README.md", previewPath: "flora/oak/preview.png", spritePath: "flora/oak/sprite-sheet.png", deterministic: true }]} presets={[{ id: "rainy-grove", title: "Rainy grove", description: "Oak under rain", category: "flora", itemIds: ["oak"], recommendedTools: ["generate_rain_overlay"], deterministic: true }]} total={1} composition={null} onQueryChange={() => undefined} onSearch={() => undefined} onComposePreset={() => undefined} />);
    expect(libraryMarkup).toContain("http://127.0.0.1:3766/api/v1/library/items/oak/preview");
    expect(libraryMarkup).toContain("Scene presets");
    expect(libraryMarkup).toContain('role="listbox"');
    const presetReadyMarkup = renderToStaticMarkup(<AssetLibraryPanel busy={false} online restPort={3766} query="" items={[]} presets={[]} total={0} composition={{ preset: { id: "coastal-sunset", title: "Coastal sunset", description: "Beach", category: "biomes-and-maps", itemIds: [], recommendedTools: [], deterministic: true }, items: [], layers: [], deterministic: true }} onQueryChange={() => undefined} onSearch={() => undefined} onGeneratePreset={() => undefined} />);
    expect(presetReadyMarkup).toContain("GENERATE SCENE");
    expect(renderToStaticMarkup(<PaletteHarmonizerPanel busy={false} online assetName="hero.png" palette={["#3155D8", "#8AA0F0"]} onApply={() => undefined} />)).toContain("HARMONIZE PALETTE");
    expect(renderToStaticMarkup(<PaletteHarmonizerPanel busy={false} online assetName="hero.png" palette={["#3155D8", "#8AA0F0"]} onApply={() => undefined} />)).toContain("#3155D8");
    expect(renderToStaticMarkup(<ContactSheetPanel busy={false} online assetCount={3} sourceNames={["rain.gif", "night.gif", "fire.gif"]} previewUrl="sheet.png" result={{ operation: "build_contact_sheet", output: "sheet.png", manifest: "sheet.json", assets: 3, columns: 2, rows: 2, width: 66, height: 66, cellWidth: 32, cellHeight: 32, padding: 2, deterministic: true, sourcePreserved: true }} onBuild={() => undefined} />)).toContain("BUILD CONTACT SHEET");
    expect(renderToStaticMarkup(<ContactSheetPanel busy={false} online assetCount={3} sourceNames={["rain.gif", "night.gif", "fire.gif"]} previewUrl="sheet.png" result={{ operation: "build_contact_sheet", output: "sheet.png", manifest: "sheet.json", assets: 3, columns: 2, rows: 2, width: 66, height: 66, cellWidth: 32, cellHeight: 32, padding: 2, deterministic: true, sourcePreserved: true }} onBuild={() => undefined} />)).toContain("CONTACT SHEET");
    expect(renderToStaticMarkup(<QualityBatchPanel busy={false} online result={{ operation: "inspect_asset_batch", assets: [{ filename: "hero.png", valid: true, violations: [], recommendations: [] }], summary: { total: 1, valid: 1, invalid: 0, failed: 0 }, maxColors: 64, maxIsolatedPixels: 4, deterministic: true, sourcePreserved: true }} onInspect={() => undefined} />)).toContain("AUDIT COLLECTION");
    expect(renderToStaticMarkup(<AnimationAuditPanel busy={false} online assetName="hero.gif" result={{ operation: "inspect_animation_quality", filename: "hero.gif", frameCount: 8, width: 16, height: 16, delaysMs: [90], transitions: [], duplicateFrames: [3], loop: { changedPixels: 0, closed: true }, palette: { colorsPerFrame: [4], driftFrames: [], stable: true }, timing: { consistent: true, positive: true }, quality: { valid: false, violations: ["duplicate frames: 3"] }, recommendations: [], deterministic: true, sourcePreserved: true }} onInspect={() => undefined} />)).toContain("AUDIT ANIMATION");
    expect(renderToStaticMarkup(<SpriteNormalizationPanel busy={false} online assetName="hero.gif" result={{ operation: "normalize_sprite", input: "hero.gif", output: "hero-normalized.gif", manifest: "hero-normalized.json", format: "gif", width: 24, height: 28, frames: 8, padding: 2, bounds: { x: 2, y: 3, width: 20, height: 24 }, pivot: { mode: "bottom_center", x: 12, y: 26 }, deterministic: true, sourcePreserved: true }} onNormalize={() => undefined} />)).toContain("NORMALIZE SPRITE");
    expect(renderToStaticMarkup(<AnimationSheetPanel busy={false} online assetName="hero.gif" result={{ operation: "build_animation_sheet", output: "hero-sheet.png", manifest: "hero-sheet.json", frames: 8, columns: 3, rows: 3, width: 100, height: 100, cellWidth: 32, cellHeight: 32, padding: 1, deterministic: true, sourcePreserved: true }} onBuild={() => undefined} />)).toContain("BUILD ANIMATION SHEET");
    expect(renderToStaticMarkup(<SpriteGeometryPanel busy={false} online assetName="hero.gif" result={{ operation: "inspect_sprite_geometry", filename: "hero.gif", frameCount: 8, width: 32, height: 32, minComponentPixels: 1, frames: [{ index: 0, opaquePixels: 42, bounds: { x: 4, y: 8, width: 20, height: 22 }, baselineY: 29, pivot: { x: 16, y: 29, mode: "bottom_center" }, components: [{ x: 4, y: 8, width: 20, height: 22, pixels: 42 }] }], animation: { stableBounds: false, baselineDrift: 2 }, quality: { valid: true, violations: [] }, recommendations: ["Use the reported pivots."], deterministic: true, sourcePreserved: true }} onInspect={() => undefined} />)).toContain("INSPECT SPRITE GEOMETRY");
    expect(renderToStaticMarkup(<SpriteHitboxPanel busy={false} online assetName="hero.gif" result={{ operation: "generate_sprite_hitboxes", manifest: "hero-hitboxes.json", filename: "hero.gif", frames: 8, mode: "components", padding: 1, hitboxes: 24, deterministic: true, sourcePreserved: true }} onGenerate={() => undefined} />)).toContain("GENERATE SPRITE HITBOXES");
    expect(renderToStaticMarkup(<SpriteRuntimeBundlePanel busy={false} online assetName="hero.gif" result={{ operation: "build_sprite_runtime_bundle", manifest: "hero-runtime.json", filename: "hero.gif", frames: 8, artifacts: 2, deterministic: true, sourcePreserved: true }} onBuild={() => undefined} />)).toContain("BUILD SPRITE RUNTIME BUNDLE");
  });
});
