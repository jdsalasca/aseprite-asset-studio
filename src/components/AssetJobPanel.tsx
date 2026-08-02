import { PixelBadge, PixelButton, PixelPanel, PixelSelect } from "@jdsalasc/pixel-ui";
import type { AssetJobView, AssetRecipe } from "../domain/contracts.js";

interface AssetJobPanelProps {
  recipe: AssetRecipe;
  job: AssetJobView | null;
  busy: boolean;
  canStart: boolean;
  onRecipeChange(recipe: AssetRecipe): void;
  onStart(): void;
  onCancel(): void;
}

export function AssetJobPanel({ recipe, job, busy, canStart, onRecipeChange, onStart, onCancel }: AssetJobPanelProps) {
  const terminal = !job || ["completed", "failed", "cancelled"].includes(job.status);
  return <PixelPanel title="BACKGROUND ASSET JOB" accent="amber">
    <PixelSelect label="RECIPE" value={recipe} onChange={(event) => onRecipeChange(event.target.value as AssetRecipe)} disabled={busy || !canStart}>
      <option value="pixel_art">PIXEL ART CONVERSION</option>
      <option value="animation_pixel_art">ANIMATION PIXEL ART</option>
      <option value="gif">GIF EXPORT</option>
      <option value="atlas">TEXTURE ATLAS</option>
    </PixelSelect>
    {job ? <div className="asset-row"><span>JOB {job.id}</span><PixelBadge tone={job.status === "completed" ? "cyan" : job.status === "failed" ? "danger" : "amber"}>{job.status.toUpperCase()}</PixelBadge></div> : null}
    <div className="asset-row"><span className="muted">El procesamiento ocurre fuera de la interacción del navegador.</span>{terminal ? <PixelButton tone="amber" disabled={busy || !canStart} onClick={onStart}>START JOB</PixelButton> : <PixelButton tone="danger" disabled={busy} onClick={onCancel}>CANCEL JOB</PixelButton>}</div>
    {job?.outcome ? <p className="muted">{job.outcome.message}</p> : null}
    {job?.artifacts?.length ? <div className="artifact-list" aria-label="Generated artifacts"><p className="eyebrow">OUTPUT ARTIFACTS</p>{job.artifacts.map((artifact) => <article key={artifact.id}><span title={artifact.filename}>{artifact.filename}</span><small>{artifact.format.toUpperCase()} · {artifact.sizeBytes} B · {artifact.sha256.slice(0, 12)}…</small></article>)}</div> : null}
  </PixelPanel>;
}
