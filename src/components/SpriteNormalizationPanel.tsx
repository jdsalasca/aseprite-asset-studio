import { PixelButton, PixelPanel, PixelSpriteNormalization } from "@jdsalasc/pixel-ui";
import { useState } from "react";
import type { SpriteNormalizationView, SpritePivotMode } from "../domain/contracts.js";

interface SpriteNormalizationPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  result: SpriteNormalizationView | null;
  onNormalize(padding: number, pivot: SpritePivotMode): void;
}

export function SpriteNormalizationPanel({ busy, online, assetName, result, onNormalize }: SpriteNormalizationPanelProps) {
  const [padding, setPadding] = useState(1);
  const [pivot, setPivot] = useState<SpritePivotMode>("bottom_center");
  return <PixelPanel title="SPRITE NORMALIZATION" accent="cyan">
    <p className="muted">Recorta el alfa compartido, conserva delays y genera pivote para <strong>{assetName}</strong> sin sobrescribir el original.</p>
    <div className="normalization-controls">
      <label>Padding <input type="number" min="0" max="16" value={padding} onChange={(event) => setPadding(Number(event.target.value))} /></label>
      <label>Pivot <select value={pivot} onChange={(event) => setPivot(event.target.value as SpritePivotMode)}><option value="bottom_center">BOTTOM CENTER</option><option value="center">CENTER</option></select></label>
    </div>
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={() => onNormalize(padding, pivot)}>{busy ? "NORMALIZING..." : "NORMALIZE SPRITE"}</PixelButton></div>
    {result ? <PixelSpriteNormalization width={result.width} height={result.height} frames={result.frames} padding={result.padding} bounds={result.bounds} pivot={result.pivot} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} data-output={result.output} data-manifest={result.manifest} /> : null}
  </PixelPanel>;
}
