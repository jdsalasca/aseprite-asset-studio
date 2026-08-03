import { PixelAnimationSheet, PixelButton, PixelPanel } from "@jdsalasc/pixel-ui";
import { useState } from "react";
import type { AnimationSheetView } from "../domain/contracts.js";

interface AnimationSheetPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  previewUrl?: string | null;
  result: AnimationSheetView | null;
  onBuild(columns: number, padding: number): void;
}

export function AnimationSheetPanel({ busy, online, assetName, previewUrl, result, onBuild }: AnimationSheetPanelProps) {
  const [columns, setColumns] = useState(4);
  const [padding, setPadding] = useState(1);
  return <PixelPanel title="ANIMATION SHEET" accent="pink">
    <p className="muted">Convierte todos los frames de <strong>{assetName}</strong> en un PNG para motores 2D y conserva delays/pivotes en JSON.</p>
    <div className="animation-sheet-controls">
      <label>Columns <input type="number" min="1" max="16" value={columns} onChange={(event) => setColumns(Number(event.target.value))} /></label>
      <label>Padding <input type="number" min="0" max="64" value={padding} onChange={(event) => setPadding(Number(event.target.value))} /></label>
    </div>
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={() => onBuild(columns, padding)}>{busy ? "BUILDING..." : "BUILD ANIMATION SHEET"}</PixelButton></div>
    {result ? <PixelAnimationSheet src={previewUrl ?? undefined} frames={result.frames} columns={result.columns} rows={result.rows} width={result.width} height={result.height} cellWidth={result.cellWidth} cellHeight={result.cellHeight} padding={result.padding} manifestUrl={result.manifest} data-output={result.output} /> : null}
  </PixelPanel>;
}
