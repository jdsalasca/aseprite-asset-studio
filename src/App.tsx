import { PixelBadge, PixelButton, PixelDropzone, PixelNotice, PixelPanel, PixelProgress } from "@jdsalas/pixel-ui";
import { useAssetStudioController } from "./application/useAssetStudioController.js";
import { AssetPreviewPanel } from "./components/AssetPreviewPanel.js";
import { DecisionPlanPanel } from "./components/DecisionPlanPanel.js";
import { QualityGatePanel } from "./components/QualityGatePanel.js";
import { ServerSetup } from "./components/ServerSetup.js";
import { ToolGrid } from "./components/ToolGrid.js";

export default function App() {
  const { config, status, tools, busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, quality, notice, updateConfig, start, stop, inspect, applyPlan, upload } = useAssetStudioController();
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
        <PixelPanel title="ENHANCEMENT PIPELINE" accent="pink"><div className="pipeline"><span>INSPECT</span><i>→</i><span>MATERIALS</span><i>→</i><span>LIGHTING</span><i>→</i><span>QUALITY</span></div><PixelProgress value={progressValue} label={progressLabel} /></PixelPanel>
        {tools.length ? <ToolGrid tools={tools} /> : <PixelPanel title="QUICK START"><p className="muted">Carga un PNG, GIF, WebP o Aseprite y arranca el MCP. El siguiente paso será seleccionar una receta de tierra, agua, iluminación, partículas o escenario.</p></PixelPanel>}
      </div>
      <aside className="studio-side"><ServerSetup config={config} status={status} busy={busy} onConfigChange={updateConfig} onStart={() => void start()} onStop={() => void stop()} /><PixelPanel title="ACTIVITY LOG"><PixelNotice tone={noticeTone} title="LATEST EVENT">{notice}</PixelNotice><p className="muted">PID: {status.pid ?? "—"} · Tools: {status.toolCount}</p></PixelPanel></aside>
    </div>
  </main>;
}
