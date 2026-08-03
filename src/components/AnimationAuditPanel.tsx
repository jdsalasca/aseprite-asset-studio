import { PixelAnimationAudit, PixelButton, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AnimationQualityView } from "../domain/contracts.js";

interface AnimationAuditPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  result: AnimationQualityView | null;
  onInspect(): void;
}

export function AnimationAuditPanel({ busy, online, assetName, result, onInspect }: AnimationAuditPanelProps) {
  return <PixelPanel title="ANIMATION QUALITY" accent="pink">
    <p className="muted">Detecta frames duplicados, timing irregular, deriva de paleta y costuras de loop antes de exportar <strong>{assetName}</strong>.</p>
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={onInspect}>{busy ? "AUDITING..." : "AUDIT ANIMATION"}</PixelButton></div>
    {result ? <PixelAnimationAudit frameCount={result.frameCount} duplicateFrames={result.duplicateFrames} loopClosed={result.loop.closed} loopChangedPixels={result.loop.changedPixels} timingConsistent={result.timing.consistent && result.timing.positive} paletteStable={result.palette.stable} valid={result.quality.valid} violations={result.quality.violations} /> : null}
  </PixelPanel>;
}
