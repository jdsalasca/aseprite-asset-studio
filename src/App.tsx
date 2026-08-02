import { useEffect, useMemo, useState } from "react";
import { PixelBadge, PixelButton, PixelDropzone, PixelLogViewer, PixelNotice, PixelPanel, PixelProgress } from "@jdsalasc/pixel-ui";
import { useAssetStudioController } from "./application/useAssetStudioController.js";
import { AssetPreviewPanel } from "./components/AssetPreviewPanel.js";
import { AssetJobPanel } from "./components/AssetJobPanel.js";
import { DecisionPlanPanel } from "./components/DecisionPlanPanel.js";
import { QualityGatePanel } from "./components/QualityGatePanel.js";
import { ServerSetup } from "./components/ServerSetup.js";
import { ToolGrid } from "./components/ToolGrid.js";
import { ToolRunnerPanel } from "./components/ToolRunnerPanel.js";
import { MaterialTexturePanel } from "./components/MaterialTexturePanel.js";

export default function App() {
  const { config, status, tools, logs, toolOutput, busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, quality, recipe, job, notice, updateConfig, updateRecipe, start, stop, inspect, applyPlan, startJob, cancelJob, executeTool, applyMaterialTexture, upload } = useAssetStudioController();
  const [selectedToolName, setSelectedToolName] = useState("");
  useEffect(() => { if (!tools.some((tool) => tool.name === selectedToolName)) setSelectedToolName(tools.find((tool) => tool.name === "inspect_reference")?.name ?? tools[0]?.name ?? ""); }, [selectedToolName, tools]);
  const initialToolArgs = useMemo(() => {
    if (!assetPath) return {};
    if (selectedToolName === "inspect_reference" || selectedToolName === "run_asset_quality_gate") return { filename: assetPath };
    if (selectedToolName === "apply_material_texture") return { input_filename: assetPath, output_filename: /\.[^./\\]+$/.test(assetPath) ? assetPath.replace(/\.[^./\\]+$/, "-textured.png") : `${assetPath}-textured.png`, material: "earth", seed: 1, intensity: 0.6 };
    if (selectedToolName === "suggest_enhancement_plan") return { filename: assetPath, goals: ["cleanup", "terrain_grain", "water_flow", "directional_lighting", "particles"] };
    return {};
  }, [assetPath, selectedToolName]);
  const noticeTone = status.state === "error" ? "danger" : busy ? "amber" : status.state === "online" ? "cyan" : "neutral" as const;
  const progressValue = quality ? 100 : plan ? 70 : status.state === "online" ? 35 : 0;
  const progressLabel = quality ? "QUALITY GATE COMPLETE" : plan ? "PLAN READY FOR REVIEW" : "READY FOR A DECISION PLAN";

  return <main className="studio-shell">
    <header className="studio-header"><div><p className="eyebrow">PIXEL FORGE / ASSET STUDIO</p><h1>Aseprite MCP Gateway</h1><p className="subtitle">Mejora assets con recetas deterministas, calidad visible y control humano.</p></div><PixelBadge tone={status.state === "online" ? "cyan" : "amber"}>{status.state.toUpperCase()}</PixelBadge></header>
    <div className="studio-grid">
      <div className="studio-main">
        <PixelPanel title="ASSET INTAKE"><PixelDropzone onFiles={upload} /><div className="asset-row"><span>{assetName}</span><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void inspect()}>INSPECT REFERENCE</PixelButton></div></PixelPanel>
        {previewUrl ? <AssetPreviewPanel before={previewUrl} after={enhancedPreviewUrl ?? undefined} /> : null}
        {plan ? <><DecisionPlanPanel plan={plan} /><div className="asset-row"><span className="muted">Salida: archivo separado -enhanced.png</span><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void applyPlan()}>APPLY ENHANCEMENT</PixelButton></div></> : null}
        {quality ? <QualityGatePanel quality={quality} /> : null}
        {assetPath ? <MaterialTexturePanel busy={busy} online={status.state === "online"} assetName={assetName} onApply={(material, seed, intensity) => void applyMaterialTexture(material, seed, intensity)} /> : null}
        {assetPath ? <AssetJobPanel recipe={recipe} job={job} busy={busy} canStart={status.state === "online" && Boolean(assetPath)} onRecipeChange={updateRecipe} onStart={() => void startJob()} onCancel={() => void cancelJob()} /> : null}
        <PixelPanel title="ENHANCEMENT PIPELINE" accent="pink"><div className="pipeline"><span>INSPECT</span><i>→</i><span>MATERIALS</span><i>→</i><span>LIGHTING</span><i>→</i><span>QUALITY</span></div><PixelProgress value={progressValue} label={progressLabel} /></PixelPanel>
        {tools.length ? <><ToolRunnerPanel tools={tools} selectedToolName={selectedToolName} initialArgs={initialToolArgs} busy={busy} output={toolOutput} onToolChange={setSelectedToolName} onRun={(name, args) => void executeTool(name, args)} /><ToolGrid tools={tools} selectedName={selectedToolName} onSelect={setSelectedToolName} /></> : <PixelPanel title="QUICK START"><p className="muted">Carga un PNG, GIF, WebP o Aseprite y arranca el MCP. Después podrás ejecutar cualquier herramienta tipada con argumentos JSON.</p></PixelPanel>}
      </div>
      <aside className="studio-side"><ServerSetup config={config} status={status} busy={busy} onConfigChange={updateConfig} onStart={() => void start()} onStop={() => void stop()} /><PixelPanel title="ACTIVITY LOG"><div className="activity-log"><PixelNotice tone={noticeTone} title="LATEST EVENT">{notice}</PixelNotice><p className="muted">PID: {status.pid ?? "—"} · Tools: {status.toolCount}</p><PixelLogViewer entries={logs.slice().reverse().map((entry) => ({ id: `${entry.correlationId}-${entry.outcome}`, timestamp: entry.timestamp, title: `${entry.outcome.toUpperCase()} · ${entry.operation}`, status: entry.outcome, detail: entry.error ?? `${entry.durationMs}ms · ${entry.correlationId}` }))} /></div></PixelPanel></aside>
    </div>
  </main>;
}
