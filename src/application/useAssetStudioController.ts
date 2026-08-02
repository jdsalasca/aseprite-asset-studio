import { useEffect, useMemo, useState } from "react";
import { AssetJobService } from "./AssetJobService.js";
import { AssetStudioService } from "./AssetStudioService.js";
import { HttpAssetGateway } from "../adapters/mcp/HttpAssetGateway.js";
import { ConsoleOperationLogger } from "../adapters/observability/ConsoleOperationLogger.js";
import type { AssetJobView, AssetRecipe, EnhancementApplyView, EnhancementPlanView, RuntimeConfig, ToolDescriptor, ToolRuntimeStatus } from "../domain/contracts.js";

const defaultConfig: RuntimeConfig = { workspacePath: "", executablePath: "", gatewayPort: 3765 };
const offlineStatus: ToolRuntimeStatus = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "Gateway local no iniciado" };

export interface AssetStudioController {
  config: RuntimeConfig;
  status: ToolRuntimeStatus;
  tools: ToolDescriptor[];
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
  upload(files: File[]): void;
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function enhancedFilename(filename: string): string { return /\.[^./\\]+$/.test(filename) ? filename.replace(/\.[^./\\]+$/, "-enhanced.png") : `${filename}-enhanced.png`; }
function jobFilename(filename: string, recipe: AssetRecipe): string { const extension = recipe === "gif" ? "gif" : "png"; return /\.[^./\\]+$/.test(filename) ? filename.replace(/\.[^./\\]+$/, `-job.${extension}`) : `${filename}-job.${extension}`; }

export function useAssetStudioController(): AssetStudioController {
  const services = useMemo(() => { const gateway = new HttpAssetGateway(); return { studio: new AssetStudioService(gateway, new ConsoleOperationLogger()), jobs: new AssetJobService(gateway) }; }, []);
  const service = services.studio;
  const jobs = services.jobs;
  const [config, setConfig] = useState(defaultConfig);
  const [status, setStatus] = useState(offlineStatus);
  const [tools, setTools] = useState<ToolDescriptor[]>([]);
  const [busy, setBusy] = useState(false);
  const [assetName, setAssetName] = useState("Ningún asset cargado");
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [plan, setPlan] = useState<EnhancementPlanView | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<EnhancementApplyView["quality"] | null>(null);
  const [recipe, setRecipe] = useState<AssetRecipe>("pixel_art");
  const [job, setJob] = useState<AssetJobView | null>(null);
  const [notice, setNotice] = useState("Inicia el gateway para conectar Aseprite MCP.");

  useEffect(() => {
    void service.config().then(setConfig).catch(() => undefined);
    void service.health().then((health) => { setStatus(health.runtime); }).catch(() => undefined);
  }, [service]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return undefined;
    const timer = window.setInterval(() => { void jobs.status(job.id).then(setJob).catch((error) => setNotice(errorMessage(error))); }, 700);
    return () => window.clearInterval(timer);
  }, [job, jobs]);

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

  async function startJob(): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    setBusy(true); setNotice(`Encolando receta ${recipe}...`);
    try {
      const started = await jobs.start({ jobs: [{ recipe, inputFilenames: [assetPath], outputFilename: jobFilename(assetPath, recipe), maxColors: 32 }] });
      setJob(started); setNotice(`Job ${started.id} encolado. El Studio actualizará su estado automáticamente.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function cancelJob(): Promise<void> {
    if (!job || ["completed", "failed", "cancelled"].includes(job.status)) return;
    setBusy(true); setNotice(`Cancelando ${job.id}...`);
    try { const cancelled = await jobs.cancel(job.id); setJob(cancelled); setNotice(`Job ${cancelled.id}: ${cancelled.status}.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function upload(files: File[]): void {
    const file = files[0];
    if (!file) return;
    setAssetName(file.name); setPlan(null); setEnhancedPreviewUrl(null); setQuality(null); setJob(null); setNotice(`Subiendo ${file.name}...`);
    void service.upload(file).then((stored) => {
      setAssetPath(stored.path); setPreviewUrl(service.assetPreviewUrl(stored.path)); setNotice(`${stored.filename} cargado (${stored.sizeBytes} bytes).`);
    }).catch((error) => setNotice(errorMessage(error)));
  }

  return { config, status, tools, busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, quality, recipe, updateRecipe: setRecipe, job, notice, updateConfig: setConfig, start, stop, inspect, applyPlan, startJob, cancelJob, upload };
}
