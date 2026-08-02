import { useEffect, useMemo, useState } from "react";
import { AssetJobService } from "./AssetJobService.js";
import { AssetStudioService } from "./AssetStudioService.js";
import { RequestGenerationGuard } from "./RequestGenerationGuard.js";
import { useAssetJobController } from "./useAssetJobController.js";
import { HttpAssetGateway } from "../adapters/mcp/HttpAssetGateway.js";
import { InMemoryOperationLogger } from "../adapters/observability/InMemoryOperationLogger.js";
import type { AssetJobView, AssetRecipe, EnhancementApplyView, EnhancementPlanView, RuntimeConfig, ToolDescriptor, ToolRuntimeStatus } from "../domain/contracts.js";
import type { OperationLogEntry } from "../ports/OperationLogPort.js";

const defaultConfig: RuntimeConfig = { workspacePath: "", executablePath: "", gatewayPort: 3765 };
const offlineStatus: ToolRuntimeStatus = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "Gateway local no iniciado" };

export interface AssetStudioController {
  config: RuntimeConfig;
  status: ToolRuntimeStatus;
  tools: ToolDescriptor[];
  logs: OperationLogEntry[];
  toolOutput: string | null;
  busy: boolean;
  assetName: string;
  assetPath: string | null;
  plan: EnhancementPlanView | null;
  previewUrl: string | null;
  enhancedPreviewUrl: string | null;
  quality: EnhancementApplyView["quality"] | null;
  recipe: AssetRecipe;
  updateRecipe(recipe: AssetRecipe): void;
  job: AssetJobView | null;
  notice: string;
  updateConfig(config: RuntimeConfig): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  inspect(): Promise<void>;
  applyPlan(): Promise<void>;
  startJob(): Promise<void>;
  cancelJob(): Promise<void>;
  executeTool(name: string, args: Record<string, unknown>): Promise<void>;
  upload(files: File[]): void;
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function enhancedFilename(filename: string): string { return /\.[^./\\]+$/.test(filename) ? filename.replace(/\.[^./\\]+$/, "-enhanced.png") : `${filename}-enhanced.png`; }
export function useAssetStudioController(): AssetStudioController {
  const logger = useMemo(() => new InMemoryOperationLogger(), []);
  const services = useMemo(() => { const gateway = new HttpAssetGateway(); return { studio: new AssetStudioService(gateway, logger), jobs: new AssetJobService(gateway) }; }, [logger]);
  const service = services.studio;
  const jobs = services.jobs;
  const uploadGuard = useMemo(() => new RequestGenerationGuard(), []);
  const [config, setConfig] = useState(defaultConfig);
  const [status, setStatus] = useState(offlineStatus);
  const [tools, setTools] = useState<ToolDescriptor[]>([]);
  const [logs, setLogs] = useState<OperationLogEntry[]>(() => logger.list());
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [assetName, setAssetName] = useState("Ningún asset cargado");
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [plan, setPlan] = useState<EnhancementPlanView | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<EnhancementApplyView["quality"] | null>(null);
  const [notice, setNotice] = useState("Inicia el gateway para conectar Aseprite MCP.");

  useEffect(() => logger.subscribe((entry) => setLogs(logger.list())), [logger]);

  useEffect(() => {
    void service.config().then(setConfig).catch(() => undefined);
    void service.health().then((health) => { setStatus(health.runtime); }).catch(() => undefined);
  }, [service]);

  const jobController = useAssetJobController(jobs, assetPath, status.state === "online", setNotice);

  async function start(): Promise<void> {
    setBusy(true); setNotice("Lanzando aseprite-mcp y comprobando herramientas...");
    try { const next = await service.startRuntime(config); setStatus(next); setTools(await service.tools()); setNotice(next.message); }
    catch (error) { setStatus({ ...offlineStatus, state: "error", message: errorMessage(error) }); setNotice("No se pudo iniciar el servidor. Revisa la guía y las rutas."); }
    finally { setBusy(false); }
  }

  async function stop(): Promise<void> {
    setBusy(true);
    try { const next = await service.stopRuntime(); setStatus(next); setTools([]); setNotice(next.message); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function inspect(): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    setBusy(true); setNotice("Inspeccionando referencia y calculando plan...");
    try { setPlan(await service.suggestEnhancementPlan(assetPath)); setNotice("Plan determinista listo para revisión humana."); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function applyPlan(): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const outputFilename = enhancedFilename(assetPath);
    setBusy(true); setNotice("Aplicando plan y ejecutando quality gate...");
    try {
      const result = await service.applyEnhancementPlan(assetPath, outputFilename);
      setQuality(result.quality);
      setEnhancedPreviewUrl(service.assetPreviewUrl(result.outputFilename));
      const qualityMessage = result.quality.valid ? "quality gate OK" : `quality gate con ${result.quality.violations?.length ?? 0} alertas`;
      setNotice(`Salida creada: ${result.outputFilename} · ${result.passesApplied.length} pasadas · ${qualityMessage}.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function executeTool(name: string, args: Record<string, unknown>): Promise<void> {
    if (!name || status.state !== "online") return;
    setBusy(true); setToolOutput(null); setNotice(`Ejecutando ${name}...`);
    try {
      const output = await service.callTool(name, args);
      const serialized = typeof output === "string" ? output : JSON.stringify(output, null, 2) ?? String(output);
      setToolOutput(serialized.length > 24000 ? `${serialized.slice(0, 24000)}\n… output truncado por seguridad visual` : serialized);
      setNotice(`${name} terminó correctamente.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function upload(files: File[]): void {
    const file = files[0];
    if (!file) return;
    const request = uploadGuard.next();
    setBusy(true); setAssetName(file.name); setAssetPath(null); setPreviewUrl(null); setPlan(null); setEnhancedPreviewUrl(null); setQuality(null); setNotice(`Subiendo ${file.name}...`);
    void service.upload(file).then((stored) => {
      if (!uploadGuard.accepts(request)) return;
      setAssetPath(stored.path); setPreviewUrl(service.assetPreviewUrl(stored.path)); setNotice(`${stored.filename} cargado (${stored.sizeBytes} bytes).`); setBusy(false);
    }).catch((error) => { if (uploadGuard.accepts(request)) { setNotice(errorMessage(error)); setBusy(false); } });
  }

  return { config, status, tools, logs, toolOutput, busy: busy || jobController.busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, quality, recipe: jobController.recipe, updateRecipe: jobController.updateRecipe, job: jobController.job, notice, updateConfig: setConfig, start, stop, inspect, applyPlan, startJob: jobController.start, cancelJob: jobController.cancel, executeTool, upload };
}
