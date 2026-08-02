import { useEffect, useState } from "react";
import type { AssetJobView, AssetRecipe } from "../domain/contracts.js";
import { AssetJobService } from "./AssetJobService.js";

export interface AssetJobController {
  recipe: AssetRecipe;
  updateRecipe(recipe: AssetRecipe): void;
  job: AssetJobView | null;
  busy: boolean;
  start(): Promise<void>;
  cancel(): Promise<void>;
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function jobFilename(filename: string, recipe: AssetRecipe): string { const extension = recipe === "gif" ? "gif" : "png"; return /\.[^./\\]+$/.test(filename) ? filename.replace(/\.[^./\\]+$/, `-job.${extension}`) : `${filename}-job.${extension}`; }

export function useAssetJobController(service: AssetJobService, assetPath: string | null, online: boolean, onNotice: (message: string) => void): AssetJobController {
  const [recipe, setRecipe] = useState<AssetRecipe>("pixel_art");
  const [job, setJob] = useState<AssetJobView | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setJob(null); }, [assetPath]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return undefined;
    const jobId = job.id;
    let active = true;
    const refresh = () => { void service.status(jobId).then((next) => { if (active) setJob(next); }).catch((error) => { if (active) onNotice(errorMessage(error)); }); };
    const timer = window.setInterval(refresh, 700);
    return () => { active = false; window.clearInterval(timer); };
  }, [job?.id, job?.status, onNotice, service]);

  async function start(): Promise<void> {
    if (!assetPath || !online) return;
    setBusy(true); onNotice(`Encolando receta ${recipe}...`);
    try {
      const started = await service.start({ jobs: [{ recipe, inputFilenames: [assetPath], outputFilename: jobFilename(assetPath, recipe), maxColors: 32 }] });
      setJob(started); onNotice(`Job ${started.id} encolado. El Studio actualizará su estado automáticamente.`);
    } catch (error) { onNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function cancel(): Promise<void> {
    if (!job || ["completed", "failed", "cancelled"].includes(job.status)) return;
    setBusy(true); onNotice(`Cancelando ${job.id}...`);
    try { const cancelled = await service.cancel(job.id); setJob(cancelled); onNotice(`Job ${cancelled.id}: ${cancelled.status}.`); }
    catch (error) { onNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return { recipe, updateRecipe: setRecipe, job, busy, start, cancel };
}
