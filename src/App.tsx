import { useEffect, useMemo, useState } from "react";
import { PixelBadge, PixelButton, PixelDropzone, PixelNotice, PixelPanel, PixelProgress } from "@jdsalasc/pixel-ui";
import { useAssetStudioController } from "./application/useAssetStudioController.js";
import { AssetPreviewPanel } from "./components/AssetPreviewPanel.js";
import { AssetJobPanel } from "./components/AssetJobPanel.js";
import { DecisionPlanPanel } from "./components/DecisionPlanPanel.js";
import { QualityGatePanel } from "./components/QualityGatePanel.js";
import { ServerSetup } from "./components/ServerSetup.js";
import { ToolGrid } from "./components/ToolGrid.js";
import { ToolRunnerPanel } from "./components/ToolRunnerPanel.js";
import { MaterialTexturePanel } from "./components/MaterialTexturePanel.js";
import { LightingPanel } from "./components/LightingPanel.js";
import { SpriteEffectsPanel } from "./components/SpriteEffectsPanel.js";
import { RecipeCreatorPanel } from "./components/RecipeCreatorPanel.js";
import { ActivityLogPanel } from "./components/ActivityLogPanel.js";
import { PipelineStatus } from "./components/PipelineStatus.js";
import { RuntimeMetricsPanel } from "./components/RuntimeMetricsPanel.js";
import { AssetLibraryPanel } from "./components/AssetLibraryPanel.js";
import { SceneExtensionPanel } from "./components/SceneExtensionPanel.js";
import { VariantPackPanel } from "./components/VariantPackPanel.js";
import { VariantPreviewPanel } from "./components/VariantPreviewPanel.js";
import { SceneEffectStackPanel } from "./components/SceneEffectStackPanel.js";
import { QualityRecommendationsPanel } from "./components/QualityRecommendationsPanel.js";
import { PaletteHarmonizerPanel } from "./components/PaletteHarmonizerPanel.js";
import { ContactSheetPanel } from "./components/ContactSheetPanel.js";
import { QualityBatchPanel } from "./components/QualityBatchPanel.js";
import { AnimationAuditPanel } from "./components/AnimationAuditPanel.js";
import { buildPipelineStages } from "./application/pipelineStages.js";
import { summarizeRuntimeMetrics } from "./application/runtimeMetrics.js";
import { shortcutAction } from "./application/keyboardShortcuts.js";

export default function App() {
  const { config, status, diagnostics, tools, logs, toolOutput, busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, quality, qualityRecommendations, batchQuality, animationQuality, harmonizedPalette, contactSheet, contactSheetPreviewUrl, variantArtifacts, variantPreviewUrl, assetLibrary, assetPresetComposition, libraryQuery, recipe, job, notice, updateConfig, updateRecipe, start, stop, detectAseprite, inspect, applyPlan, startJob, cancelJob, executeTool, applyMaterialTexture, applyDepthLighting, applySpriteEffect, generateVariantPack, generateSceneEffectStack, generateAssetPreset, inspectAssetQualityBundle, inspectAssetBatch, inspectAnimationQuality, createAssetRecipe, executeAssetRecipe, extendScene, generateBiomeTransition, harmonizePalette, buildContactSheet, searchAssetLibrary, composeAssetPreset, updateLibraryQuery, upload } = useAssetStudioController();
  const [selectedToolName, setSelectedToolName] = useState("");
  const stages = useMemo(() => buildPipelineStages({ online: status.state === "online", hasAsset: Boolean(assetPath), hasPlan: Boolean(plan), hasQuality: Boolean(quality) }), [assetPath, plan, quality, status.state]);
  const metrics = useMemo(() => summarizeRuntimeMetrics(logs), [logs]);
  useEffect(() => { if (!tools.some((tool) => tool.name === selectedToolName)) setSelectedToolName(tools.find((tool) => tool.name === "inspect_reference")?.name ?? tools[0]?.name ?? ""); }, [selectedToolName, tools]);
  const initialToolArgs = useMemo(() => {
    if (!assetPath) return {};
    if (selectedToolName === "inspect_reference" || selectedToolName === "run_asset_quality_gate" || selectedToolName === "inspect_asset_bundle") return { filename: assetPath };
    if (selectedToolName === "apply_material_texture") return { input_filename: assetPath, output_filename: /\.[^./\\]+$/.test(assetPath) ? assetPath.replace(/\.[^./\\]+$/, "-textured.png") : `${assetPath}-textured.png`, material: "earth", seed: 1, intensity: 0.6 };
    if (selectedToolName === "apply_depth_lighting") return { input_filename: assetPath, output_filename: /\.[^./\\]+$/.test(assetPath) ? assetPath.replace(/\.[^./\\]+$/, "-lit.png") : `${assetPath}-lit.png`, direction: "south_east", strength: 0.7, ambient: 0.35 };
    if (selectedToolName === "suggest_enhancement_plan") return { filename: assetPath, goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] };
    return {};
  }, [assetPath, selectedToolName]);
  const noticeTone = status.state === "error" ? "danger" : busy ? "amber" : status.state === "online" ? "cyan" : "neutral" as const;
  const progressValue = quality ? 100 : plan ? 70 : status.state === "online" ? 35 : 0;
  const progressLabel = quality ? "QUALITY GATE COMPLETE" : plan ? "PLAN READY FOR REVIEW" : "READY FOR A DECISION PLAN";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.matches?.("input,textarea,select")) return;
      const action = shortcutAction(event);
      if (!action) return;
      event.preventDefault();
      if (action === "inspect") void inspect();
      if (action === "apply") void applyPlan();
      if (action === "start_job") void startJob();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyPlan, inspect, startJob]);

  return <main className="studio-shell">
    <header className="studio-header"><div><p className="eyebrow">PIXEL FORGE / ASSET STUDIO</p><h1>Aseprite MCP Gateway</h1><p className="subtitle">Mejora assets con recetas deterministas, calidad visible y control humano.</p></div><PixelBadge tone={status.state === "online" ? "cyan" : "amber"}>{status.state.toUpperCase()}</PixelBadge></header>
    <div className="studio-grid">
      <div className="studio-main">
        <PixelPanel title="ASSET INTAKE"><PixelDropzone onFiles={upload} /><div className="asset-row"><span>{assetName}</span><div className="tool-runner-actions"><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void inspect()}>INSPECT REFERENCE</PixelButton><PixelButton tone="cyan" disabled={busy || status.state !== "online" || !assetPath} onClick={() => void inspectAssetQualityBundle()}>QUALITY BUNDLE</PixelButton></div></div></PixelPanel>
        {previewUrl ? <AssetPreviewPanel before={previewUrl} after={enhancedPreviewUrl ?? undefined} /> : null}
        {plan ? <><DecisionPlanPanel plan={plan} /><div className="asset-row"><span className="muted">Salida: archivo separado -enhanced.png</span><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void applyPlan()}>APPLY ENHANCEMENT</PixelButton></div></> : null}
        {quality ? <QualityGatePanel quality={quality} /> : null}
        <QualityRecommendationsPanel recommendations={qualityRecommendations} />
        {assetPath ? <MaterialTexturePanel busy={busy} online={status.state === "online"} assetName={assetName} onApply={(material, seed, intensity) => void applyMaterialTexture(material, seed, intensity)} /> : null}
        {assetPath ? <LightingPanel busy={busy} online={status.state === "online"} assetName={assetName} onApply={(direction, strength, ambient) => void applyDepthLighting(direction, strength, ambient)} /> : null}
        {assetPath ? <PaletteHarmonizerPanel busy={busy} online={status.state === "online"} assetName={assetName} palette={harmonizedPalette} onApply={(accentColor, strength, maxColors) => void harmonizePalette(accentColor, strength, maxColors)} /> : null}
        {assetPath ? <SpriteEffectsPanel busy={busy} online={status.state === "online"} assetName={assetName} onApply={(kind, options) => void applySpriteEffect(kind, options)} /> : null}
        {assetPath ? <VariantPackPanel busy={busy} online={status.state === "online"} assetName={assetName} onGenerate={(variants, frames, seed) => void generateVariantPack(variants, frames, seed)} /> : null}
        {assetPath ? <QualityBatchPanel busy={busy} online={status.state === "online"} result={batchQuality} onInspect={() => void inspectAssetBatch()} /> : null}
        {assetPath ? <AnimationAuditPanel busy={busy} online={status.state === "online"} assetName={assetName} result={animationQuality} onInspect={() => void inspectAnimationQuality()} /> : null}
        {assetPath ? <SceneEffectStackPanel busy={busy} online={status.state === "online"} assetName={assetName} onGenerate={(effects, frames, seed, material, direction) => void generateSceneEffectStack(effects, frames, seed, material, direction)} /> : null}
        <VariantPreviewPanel previewUrl={variantPreviewUrl} artifacts={variantArtifacts} />
        {variantArtifacts.length ? <ContactSheetPanel busy={busy} online={status.state === "online"} assetCount={variantArtifacts.length} sourceNames={variantArtifacts.map((artifact) => artifact.outputFilename)} previewUrl={contactSheetPreviewUrl} result={contactSheet} onBuild={(cellWidth, cellHeight, columns, padding) => void buildContactSheet(cellWidth, cellHeight, columns, padding)} /> : null}
        {assetPath ? <RecipeCreatorPanel busy={busy} online={status.state === "online"} assetName={assetName} onCreate={(input) => void createAssetRecipe(input)} onExecute={(input) => void executeAssetRecipe(input)} /> : null}
        <AssetLibraryPanel busy={busy} online={status.state === "online"} restPort={config.mcpRestPort} query={libraryQuery} items={assetLibrary?.items ?? []} presets={assetLibrary?.presets ?? []} total={assetLibrary?.total ?? 0} composition={assetPresetComposition} onQueryChange={updateLibraryQuery} onSearch={() => void searchAssetLibrary()} onComposePreset={(id) => void composeAssetPreset(id)} onGeneratePreset={(id) => void generateAssetPreset(id)} />
        <SceneExtensionPanel busy={busy} online={status.state === "online"} onExtend={(input) => void extendScene(input)} onTransition={(input) => void generateBiomeTransition(input)} />
        {assetPath ? <AssetJobPanel recipe={recipe} job={job} busy={busy} canStart={status.state === "online" && Boolean(assetPath)} onRecipeChange={updateRecipe} onStart={() => void startJob()} onCancel={() => void cancelJob()} /> : null}
        <PipelineStatus stages={stages} />
        <PixelPanel title="ENHANCEMENT PIPELINE" accent="pink"><div className="pipeline"><span>INSPECT</span><i>→</i><span>MATERIALS</span><i>→</i><span>LIGHTING</span><i>→</i><span>QUALITY</span></div><PixelProgress value={progressValue} label={progressLabel} /></PixelPanel>
        {tools.length ? <><ToolRunnerPanel tools={tools} selectedToolName={selectedToolName} initialArgs={initialToolArgs} busy={busy} output={toolOutput} onToolChange={setSelectedToolName} onRun={(name, args) => void executeTool(name, args)} /><ToolGrid tools={tools} selectedName={selectedToolName} onSelect={setSelectedToolName} /></> : <PixelPanel title="QUICK START"><p className="muted">Carga un PNG, GIF, WebP o Aseprite y arranca el MCP. Después podrás ejecutar cualquier herramienta tipada con argumentos JSON.</p></PixelPanel>}
      </div>
      <aside className="studio-side"><ServerSetup config={config} status={status} diagnostics={diagnostics} busy={busy} onConfigChange={updateConfig} onStart={() => void start()} onStop={() => void stop()} onDetect={() => void detectAseprite()} /><PixelPanel title="LATEST EVENT"><PixelNotice tone={noticeTone} title="LATEST EVENT">{notice}</PixelNotice><p className="muted">PID: {status.pid ?? "—"} · Tools: {status.toolCount} · REST: {config.mcpRestPort ? `127.0.0.1:${config.mcpRestPort}` : "disabled"} · Shortcuts: Ctrl+I inspect, Ctrl+Enter apply, Ctrl+J job</p></PixelPanel><ActivityLogPanel entries={logs} /><RuntimeMetricsPanel metrics={metrics} /></aside>
    </div>
  </main>;
}
