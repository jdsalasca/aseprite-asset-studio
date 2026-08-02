import { useEffect, useMemo, useState } from "react";
import { AssetJobService } from "./AssetJobService.js";
import { AssetStudioService } from "./AssetStudioService.js";
import { RequestGenerationGuard } from "./RequestGenerationGuard.js";
import { useAssetJobController } from "./useAssetJobController.js";
import { HttpAssetGateway } from "../adapters/mcp/HttpAssetGateway.js";
import { InMemoryOperationLogger } from "../adapters/observability/InMemoryOperationLogger.js";
import { validateAssetFile } from "./assetValidation.js";
import type { AssetJobView, AssetLibraryPresetCompositionView, AssetLibrarySearchView, AssetQualityBundleView, AssetRecipe, AssetRecipeStep, AssetVariantArtifactView, AssetVariantKind, EnhancementApplyView, EnhancementPlanView, LightDirection, MaterialTextureKind, RuntimeConfig, SceneEffectKind, SceneEffectStackView, SpriteEffectKind, ToolDescriptor, ToolRuntimeStatus } from "../domain/contracts.js";
import type { OperationLogEntry } from "../ports/OperationLogPort.js";
import type { RuntimeDiagnostics } from "../domain/aseprite.js";

type RecipeInput = { steps: AssetRecipeStep[]; seed: number; material: MaterialTextureKind; direction: LightDirection };
const defaultConfig: RuntimeConfig = { workspacePath: "", executablePath: "", gatewayPort: 3765, mcpRestPort: 3766 };
const offlineStatus: ToolRuntimeStatus = { state: "offline", pid: null, serverName: null, serverVersion: null, toolCount: 0, message: "Gateway local no iniciado" };

export interface AssetStudioController {
  config: RuntimeConfig;
  status: ToolRuntimeStatus;
  diagnostics: RuntimeDiagnostics | null;
  tools: ToolDescriptor[];
  logs: OperationLogEntry[];
  toolOutput: string | null;
  busy: boolean;
  assetName: string;
  assetPath: string | null;
  plan: EnhancementPlanView | null;
  previewUrl: string | null;
  enhancedPreviewUrl: string | null;
  variantPreviewUrl(path: string): string;
  quality: EnhancementApplyView["quality"] | null;
  qualityRecommendations: string[];
  variantArtifacts: AssetVariantArtifactView[];
  recipe: AssetRecipe;
  assetLibrary: AssetLibrarySearchView | null;
  assetPresetComposition: AssetLibraryPresetCompositionView | null;
  libraryQuery: string;
  updateRecipe(recipe: AssetRecipe): void;
  job: AssetJobView | null;
  notice: string;
  updateConfig(config: RuntimeConfig): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  detectAseprite(): Promise<void>;
  inspect(): Promise<void>;
  applyPlan(): Promise<void>;
  startJob(): Promise<void>;
  cancelJob(): Promise<void>;
  executeTool(name: string, args: Record<string, unknown>): Promise<void>;
  applyMaterialTexture(material: MaterialTextureKind, seed: number, intensity: number): Promise<void>;
  applyDepthLighting(direction: LightDirection, strength: number, ambient: number): Promise<void>;
  applySpriteEffect(kind: SpriteEffectKind, options: Record<string, number | string | boolean>): Promise<void>;
  generateVariantPack(variants: AssetVariantKind[], frames: number, seed: number): Promise<void>;
  generateSceneEffectStack(effects: SceneEffectKind[], frames: number, seed: number, material: MaterialTextureKind, direction: LightDirection): Promise<void>;
  generateAssetPreset(id: string): Promise<void>;
  inspectAssetQualityBundle(): Promise<void>;
  createAssetRecipe(input: RecipeInput): Promise<void>;
  executeAssetRecipe(input: RecipeInput): Promise<void>;
  extendScene(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number }): Promise<void>;
  searchAssetLibrary(): Promise<void>;
  composeAssetPreset(id: string): Promise<void>;
  updateLibraryQuery(query: string): void;
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
  const [diagnostics, setDiagnostics] = useState<RuntimeDiagnostics | null>(null);
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
  const [qualityRecommendations, setQualityRecommendations] = useState<string[]>([]);
  const [variantArtifacts, setVariantArtifacts] = useState<AssetVariantArtifactView[]>([]);
  const [assetLibrary, setAssetLibrary] = useState<AssetLibrarySearchView | null>(null);
  const [assetPresetComposition, setAssetPresetComposition] = useState<AssetLibraryPresetCompositionView | null>(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [notice, setNotice] = useState("Inicia el gateway para conectar Aseprite MCP.");

  useEffect(() => logger.subscribe((entry) => setLogs(logger.list())), [logger]);

  useEffect(() => {
    void service.config().then(setConfig).catch(() => undefined);
    void service.health().then((health) => { setStatus(health.runtime); }).catch(() => undefined);
    void service.diagnostics().then(setDiagnostics).catch(() => undefined);
  }, [service]);

  const jobController = useAssetJobController(jobs, assetPath, status.state === "online", setNotice);

  async function start(): Promise<void> {
    setBusy(true); setNotice("Lanzando aseprite-mcp y comprobando herramientas...");
    try { const next = await service.startRuntime(config); setStatus(next); setConfig(await service.config()); setDiagnostics(await service.diagnostics()); setTools(await service.tools()); setNotice(next.message); }
    catch (error) { setStatus({ ...offlineStatus, state: "error", message: errorMessage(error) }); setNotice("No se pudo iniciar el servidor. Revisa la guía y las rutas."); }
    finally { setBusy(false); }
  }

  async function stop(): Promise<void> {
    setBusy(true);
    try { const next = await service.stopRuntime(); setStatus(next); setDiagnostics(await service.diagnostics()); setTools([]); setNotice(next.message); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function detectAseprite(): Promise<void> {
    setBusy(true); setNotice("Detectando la instalación local de Aseprite...");
    try {
      const next = await service.diagnostics();
      setDiagnostics(next);
      if (next.aseprite.found && next.aseprite.executablePath && !config.executablePath) setConfig((current) => ({ ...current, executablePath: next.aseprite.executablePath! }));
      setNotice(next.aseprite.message);
    } catch (error) { setNotice(errorMessage(error)); }
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

  async function applyMaterialTexture(material: MaterialTextureKind, seed: number, intensity: number): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const outputFilename = /\.[^./\\]+$/.test(assetPath) ? assetPath.replace(/\.[^./\\]+$/, "-textured.png") : `${assetPath}-textured.png`;
    setBusy(true); setToolOutput(null); setNotice(`Aplicando textura determinista ${material}...`);
    try {
      const result = await service.applyMaterialTexture(assetPath, outputFilename, material, seed, intensity);
      setEnhancedPreviewUrl(service.assetPreviewUrl(result.outputFilename));
      setToolOutput(JSON.stringify(result, null, 2));
      setNotice(`Textura ${result.material} aplicada con seed ${result.seed}; salida preservada.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function applyDepthLighting(direction: LightDirection, strength: number, ambient: number): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const outputFilename = /\.[^./\\]+$/.test(assetPath) ? assetPath.replace(/\.[^./\\]+$/, "-lit.png") : `${assetPath}-lit.png`;
    setBusy(true); setToolOutput(null); setNotice(`Aplicando iluminación ${direction}...`);
    try {
      const result = await service.applyDepthLighting(assetPath, outputFilename, direction, strength, ambient);
      setEnhancedPreviewUrl(service.assetPreviewUrl(result.outputFilename));
      setToolOutput(JSON.stringify(result, null, 2));
      setNotice(`Iluminación ${result.direction} aplicada; salida preservada.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function applySpriteEffect(kind: SpriteEffectKind, options: Record<string, number | string | boolean>): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const suffix = kind.replaceAll("_", "-");
    const outputFilename = kind === "particles" || kind === "rain" || kind === "motion" || kind === "reflection" || kind === "caustics" || kind === "day_night" ? `${assetPath.replace(/\.[^./\\]+$/, "")}-${suffix}.gif` : `${assetPath.replace(/\.[^./\\]+$/, "")}-${suffix}.png`;
    setBusy(true); setToolOutput(null); setNotice(`Aplicando efecto ${kind}...`);
    try { const result = await service.applySpriteEffect(kind, assetPath, outputFilename, options); setEnhancedPreviewUrl(service.assetPreviewUrl(result.output)); setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Efecto ${kind} aplicado; salida preservada.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function generateVariantPack(variants: AssetVariantKind[], frames: number, seed: number): Promise<void> {
    if (!assetPath || status.state !== "online" || variants.length === 0) return;
    const outputPrefix = assetPath.replace(/\.[^./\\]+$/, "-variants");
    setBusy(true); setToolOutput(null); setNotice(`Generando ${variants.length} variantes ambientales...`);
    try {
      const result = await service.generateVariantPack({ filename: assetPath, outputPrefix, variants, frames, seed });
      const first = result.artifacts[0];
      setVariantArtifacts(result.artifacts);
      if (first) setEnhancedPreviewUrl(service.assetPreviewUrl(first.outputFilename));
      setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Pack listo: ${result.artifacts.length} variantes deterministas.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function generateSceneEffectStack(effects: SceneEffectKind[], frames: number, seed: number, material: MaterialTextureKind, direction: LightDirection): Promise<void> {
    if (!assetPath || status.state !== "online" || effects.length === 0) return;
    const outputPrefix = assetPath.replace(/\.[^./\\]+$/, "-scene-stack");
    setBusy(true); setToolOutput(null); setNotice(`Generando stack de ${effects.length} efectos...`);
    try {
      const result: SceneEffectStackView = await service.generateSceneEffectStack({ filename: assetPath, outputPrefix, effects, frames, seed, material, direction });
      const first = result.artifacts[0];
      if (first) setEnhancedPreviewUrl(service.assetPreviewUrl(first.outputFilename));
      setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Stack listo: ${result.artifacts.length} salidas deterministas.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function inspectAssetQualityBundle(): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    setBusy(true); setToolOutput(null); setNotice("Inspeccionando calidad compacta del asset...");
    try {
      const result: AssetQualityBundleView = await service.inspectAssetQualityBundle(assetPath);
      setQuality(result.quality); setQualityRecommendations(result.recommendations); setToolOutput(JSON.stringify(result, null, 2)); setNotice(result.quality.valid ? "Quality bundle aprobado." : `Quality bundle detectó ${result.quality.violations.length} alerta(s).`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function generateAssetPreset(id: string): Promise<void> {
    if (status.state !== "online") return;
    const outputPrefix = assetPath ? assetPath.replace(/\.[^./\\]+$/, `-${id}`) : `artifacts/${id}`;
    setBusy(true); setToolOutput(null); setNotice(`Generando preset ${id}...`);
    try {
      const result = await service.generateAssetPreset({ presetId: id, outputPrefix, width: 64, height: 40, seed: 1 });
      const preview = result.generation.artifacts?.previewPng;
      if (preview) setEnhancedPreviewUrl(service.assetPreviewUrl(preview));
      setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Preset ${result.presetId} generado como ${result.environmentKind}.`);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function recipeRequest(input: RecipeInput) {
    if (!assetPath) return null;
    return { assetId: assetName.replace(/\.[^./\\]+$/, ""), filename: assetPath, outputPrefix: assetPath.replace(/\.[^./\\]+$/, "-recipe"), ...input };
  }

  async function createAssetRecipe(input: RecipeInput): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const request = recipeRequest(input);
    if (!request) return;
    setBusy(true); setToolOutput(null); setNotice("Creando plan de receta determinista...");
    try { const result = await service.createAssetRecipe(request); setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Receta ${result.recipeId} lista para revisión; ${result.steps.length} pasos.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function executeAssetRecipe(input: RecipeInput): Promise<void> {
    if (!assetPath || status.state !== "online") return;
    const request = recipeRequest(input);
    if (!request) return;
    setBusy(true); setToolOutput(null); setNotice("Ejecutando receta en el MCP compartido...");
    try {
      const result = await service.executeAssetRecipe(request);
      setToolOutput(JSON.stringify(result, null, 2));
      if (result.ok) {
        setEnhancedPreviewUrl(service.assetPreviewUrl(result.outputFilename));
        setNotice(`Receta ${result.recipeId} ejecutada: ${result.steps.length} pasos y salida ${result.outputFilename}.`);
      } else {
        setNotice(`La receta falló en ${result.failedStep ?? "un paso desconocido"}: ${result.error ?? "error del MCP"}.`);
      }
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function searchAssetLibrary(): Promise<void> {
    if (status.state !== "online") return;
    setBusy(true); setNotice("Buscando en la biblioteca determinista del MCP...");
    try { const result = await service.searchAssetLibrary(libraryQuery); setAssetLibrary(result); setNotice(`${result.total} assets encontrados en la biblioteca.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function composeAssetPreset(id: string): Promise<void> {
    if (status.state !== "online") return;
    setBusy(true); setNotice(`Componiendo preset ${id}...`);
    try { const composition = await service.composeAssetPreset(id); setAssetPresetComposition(composition); setToolOutput(JSON.stringify(composition, null, 2)); setNotice(`Preset ${composition.preset.title} listo con ${composition.layers.length} capas ordenadas.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function extendScene(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number }): Promise<void> {
    if (status.state !== "online") return;
    setBusy(true); setToolOutput(null); setNotice("Extendiendo escena con el MCP compartido...");
    try { const result = await service.extendScene(input); setToolOutput(JSON.stringify(result, null, 2)); setNotice(`Escena extendida a ${result.width}×${result.height}; ${result.layers} capas preservadas.`); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function upload(files: File[]): void {
    const file = files[0];
    if (!file) return;
    const validationError = validateAssetFile(file);
    if (validationError) { setNotice(validationError); return; }
    const request = uploadGuard.next();
    setBusy(true); setAssetName(file.name); setAssetPath(null); setPreviewUrl(null); setPlan(null); setEnhancedPreviewUrl(null); setQuality(null); setQualityRecommendations([]); setVariantArtifacts([]); setNotice(`Subiendo ${file.name}...`);
    void service.upload(file).then((stored) => {
      if (!uploadGuard.accepts(request)) return;
      setAssetPath(stored.path); setPreviewUrl(service.assetPreviewUrl(stored.path)); setNotice(`${stored.filename} cargado (${stored.sizeBytes} bytes).`); setBusy(false);
    }).catch((error) => { if (uploadGuard.accepts(request)) { setNotice(errorMessage(error)); setBusy(false); } });
  }

  return { config, status, diagnostics, tools, logs, toolOutput, busy: busy || jobController.busy, assetName, assetPath, plan, previewUrl, enhancedPreviewUrl, variantPreviewUrl: service.assetPreviewUrl.bind(service), quality, qualityRecommendations, variantArtifacts, assetLibrary, assetPresetComposition, libraryQuery, recipe: jobController.recipe, updateRecipe: jobController.updateRecipe, job: jobController.job, notice, updateConfig: setConfig, start, stop, detectAseprite, inspect, applyPlan, startJob: jobController.start, cancelJob: jobController.cancel, executeTool, applyMaterialTexture, applyDepthLighting, applySpriteEffect, generateVariantPack, generateSceneEffectStack, generateAssetPreset, inspectAssetQualityBundle, createAssetRecipe, executeAssetRecipe, extendScene, searchAssetLibrary, composeAssetPreset, updateLibraryQuery: setLibraryQuery, upload };
}
