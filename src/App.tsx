import { useEffect, useMemo, useState } from "react";
import { PixelBadge, PixelButton, PixelDropzone, PixelPanel, PixelProgress } from "@jdsalas/pixel-ui";
import { AssetStudioService } from "./application/AssetStudioService.js";
import { HttpAssetGateway } from "./adapters/mcp/HttpAssetGateway.js";
import type { EnhancementPlanView, McpStatus, McpToolSummary, StudioConfig } from "./domain/contracts.js";
import { ServerSetup } from "./components/ServerSetup.js";
import { DecisionPlanPanel } from "./components/DecisionPlanPanel.js";
import { ToolGrid } from "./components/ToolGrid.js";

const defaultConfig: StudioConfig = { mcpRepoPath: "", asepritePath: "", gatewayPort: 3765 };
const offlineStatus: McpStatus = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "Gateway local no iniciado" };

export default function App() {
  const service = useMemo(() => new AssetStudioService(new HttpAssetGateway()), []);
  const [config, setConfig] = useState(defaultConfig);
  const [status, setStatus] = useState(offlineStatus);
  const [tools, setTools] = useState<McpToolSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [assetName, setAssetName] = useState("Ningún asset cargado");
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [plan, setPlan] = useState<EnhancementPlanView | null>(null);
  const [notice, setNotice] = useState("Inicia el gateway para conectar Aseprite MCP.");

  useEffect(() => { void service.config().then(setConfig).catch(() => undefined); void service.health().then((health) => { setStatus(health.mcp); }).catch(() => undefined); }, [service]);

  async function start() { setBusy(true); setNotice("Lanzando aseprite-mcp y comprobando herramientas..."); try { const next = await service.startMcp(config); setStatus(next); setTools(await service.tools()); setNotice(next.message); } catch (error) { setStatus({ ...offlineStatus, state: "error", message: error instanceof Error ? error.message : String(error) }); setNotice("No se pudo iniciar el servidor. Revisa la guía y las rutas."); } finally { setBusy(false); } }
  async function stop() { setBusy(true); try { const next = await service.stopMcp(); setStatus(next); setTools([]); setNotice(next.message); } catch (error) { setNotice(error instanceof Error ? error.message : String(error)); } finally { setBusy(false); } }
  async function inspect() { if (!assetPath || status.state !== "online") return; setBusy(true); setNotice("Inspeccionando referencia y calculando plan..."); try { setPlan(await service.suggestEnhancementPlan(assetPath)); setNotice("Plan determinista listo para revisión humana."); } catch (error) { setNotice(error instanceof Error ? error.message : String(error)); } finally { setBusy(false); } }
  async function applyPlan() { if (!assetPath || status.state !== "online") return; const outputFilename = assetPath.replace(/\.[^./\\]+$/, "-enhanced.png"); setBusy(true); setNotice("Aplicando plan en un archivo separado..."); try { const result = await service.applyEnhancementPlan(assetPath, outputFilename); setNotice(`Salida creada: ${result.outputFilename} · ${result.passesApplied.length} pasadas · fuente preservada.`); } catch (error) { setNotice(error instanceof Error ? error.message : String(error)); } finally { setBusy(false); } }

  return <main className="studio-shell"><header className="studio-header"><div><p className="eyebrow">PIXEL FORGE / ASSET STUDIO</p><h1>Aseprite MCP Gateway</h1><p className="subtitle">Mejora assets con recetas deterministas, calidad visible y control humano.</p></div><PixelBadge tone={status.state === "online" ? "cyan" : "amber"}>{status.state.toUpperCase()}</PixelBadge></header>
    <div className="studio-grid"><div className="studio-main"><PixelPanel title="ASSET INTAKE"><PixelDropzone onFiles={(files) => { const file = files[0]; if (!file) return; setAssetName(file.name); setPlan(null); setNotice(`Subiendo ${file.name}...`); void service.upload(file).then((stored) => { setAssetPath(stored.path); setNotice(`${stored.filename} cargado (${stored.sizeBytes} bytes).`); }).catch((error) => setNotice(error instanceof Error ? error.message : String(error))); }} /><div className="asset-row"><span>{assetName}</span><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void inspect()}>INSPECT REFERENCE</PixelButton></div></PixelPanel>{plan ? <><DecisionPlanPanel plan={plan} /><div className="asset-row"><span className="muted">Salida: archivo separado -enhanced.png</span><PixelButton disabled={busy || status.state !== "online" || !assetPath} onClick={() => void applyPlan()}>APPLY ENHANCEMENT</PixelButton></div></> : null}<PixelPanel title="ENHANCEMENT PIPELINE" accent="pink"><div className="pipeline"><span>INSPECT</span><i>→</i><span>MATERIALS</span><i>→</i><span>LIGHTING</span><i>→</i><span>QUALITY</span></div><PixelProgress value={plan ? 70 : status.state === "online" ? 35 : 0} label={plan ? "PLAN READY FOR REVIEW" : "READY FOR A DECISION PLAN"} /></PixelPanel>{tools.length ? <ToolGrid tools={tools} /> : <PixelPanel title="QUICK START"><p className="muted">Carga un PNG, GIF, WebP o Aseprite y arranca el MCP. El siguiente paso será seleccionar una receta de tierra, agua, iluminación, partículas o escenario.</p></PixelPanel>}</div><aside className="studio-side"><ServerSetup config={config} status={status} busy={busy} onConfigChange={setConfig} onStart={() => void start()} onStop={() => void stop()} /><PixelPanel title="ACTIVITY LOG"><p className="log-line"><PixelBadge tone={status.state === "error" ? "danger" : "cyan"}>INFO</PixelBadge>{notice}</p><p className="muted">PID: {status.pid ?? "—"} · Tools: {status.toolCount}</p></PixelPanel></aside></div>
  </main>;
}
