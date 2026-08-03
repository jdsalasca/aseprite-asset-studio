import { PixelButton, PixelPanel, PixelSpriteGeometry } from "@jdsalasc/pixel-ui";
import type { SpriteGeometryView } from "../domain/contracts.js";

interface SpriteGeometryPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  result: SpriteGeometryView | null;
  onInspect(): void;
}

export function SpriteGeometryPanel({ busy, online, assetName, result, onInspect }: SpriteGeometryPanelProps) {
  const first = result?.frames[0];
  return <PixelPanel title="SPRITE GEOMETRY" accent="amber">
    <p className="muted">Calcula bounds alfa, componentes conectados, línea de apoyo y pivote para colocar <strong>{assetName}</strong> sin jitter.</p>
    <div className="tool-runner-actions"><PixelButton tone="amber" disabled={busy || !online} onClick={onInspect}>{busy ? "INSPECTING..." : "INSPECT SPRITE GEOMETRY"}</PixelButton></div>
    {result ? <PixelSpriteGeometry frameCount={result.frameCount} width={result.width} height={result.height} stableBounds={result.animation.stableBounds} baselineDrift={result.animation.baselineDrift} valid={result.quality.valid} frames={result.frames.map((frame) => ({ index: frame.index, bounds: frame.bounds, baselineY: frame.baselineY, pivot: { x: frame.pivot.x, y: frame.pivot.y }, componentCount: frame.components.length }))} violations={result.quality.violations} data-first-frame={first?.index} /> : null}
  </PixelPanel>;
}
