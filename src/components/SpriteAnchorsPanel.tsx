import { PixelButton, PixelPanel, PixelSpriteAnchors } from "@jdsalasc/pixel-ui";
import type { SpriteAnchorsView } from "../domain/contracts.js";

interface SpriteAnchorsPanelProps { busy: boolean; online: boolean; assetName: string; result: SpriteAnchorsView | null; onGenerate(): void; }

export function SpriteAnchorsPanel({ busy, online, assetName, result, onGenerate }: SpriteAnchorsPanelProps) {
  return <PixelPanel title="SPRITE ANCHORS" accent="amber">
    <p className="muted">Calcula puntos de placement para <strong>{assetName}</strong>: centro, cabeza, laterales, baseline y pivote inferior.</p>
    <div className="tool-runner-actions"><PixelButton tone="amber" disabled={busy || !online} onClick={onGenerate}>{busy ? "GENERATING..." : "GENERATE SPRITE ANCHORS"}</PixelButton></div>
    {result ? <PixelSpriteAnchors frameCount={result.frames} anchorTypes={result.anchorTypes} baselineDrift={result.baselineDrift} manifestUrl={result.manifest} /> : null}
  </PixelPanel>;
}
