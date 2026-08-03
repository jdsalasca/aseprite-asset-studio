import { useState } from "react";
import { PixelButton, PixelContactSheet, PixelField, PixelPanel } from "@jdsalasc/pixel-ui";
import type { ContactSheetView } from "../domain/contracts.js";

interface ContactSheetPanelProps {
  busy: boolean;
  online: boolean;
  assetCount: number;
  sourceNames: readonly string[];
  previewUrl: string | null;
  result: ContactSheetView | null;
  onBuild(cellWidth: number, cellHeight: number, columns: number, padding: number): void;
}

export function ContactSheetPanel({ busy, online, assetCount, sourceNames, previewUrl, result, onBuild }: ContactSheetPanelProps) {
  const [cellWidth, setCellWidth] = useState("32");
  const [cellHeight, setCellHeight] = useState("32");
  const [columns, setColumns] = useState(String(Math.min(4, Math.max(1, assetCount))));
  const [padding, setPadding] = useState("2");
  function build(): void {
    const values = [cellWidth, cellHeight, columns, padding].map(Number);
    if (values.some((value) => !Number.isInteger(value)) || values[0]! < 8 || values[0]! > 512 || values[1]! < 8 || values[1]! > 512 || values[2]! < 1 || values[2]! > 16 || values[3]! < 0 || values[3]! > 64) return;
    onBuild(values[0]!, values[1]!, values[2]!, values[3]!);
  }

  return <PixelPanel title="VARIANT CONTACT SHEET" accent="cyan">
    <p className="muted">Reúne {assetCount} previews heterogéneos en una rejilla navegable para revisar variantes de {sourceNames[0] ?? "tu asset"} con una sola ejecución.</p>
    <div className="recipe-controls"><PixelField label="CELL WIDTH" type="number" min={8} max={512} value={cellWidth} onChange={(event) => setCellWidth(event.target.value)} disabled={busy || !online} /><PixelField label="CELL HEIGHT" type="number" min={8} max={512} value={cellHeight} onChange={(event) => setCellHeight(event.target.value)} disabled={busy || !online} /><PixelField label="COLUMNS" type="number" min={1} max={16} value={columns} onChange={(event) => setColumns(event.target.value)} disabled={busy || !online} /><PixelField label="PADDING" type="number" min={0} max={64} value={padding} onChange={(event) => setPadding(event.target.value)} disabled={busy || !online} /></div>
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online || assetCount === 0} onClick={build}>{busy ? "BUILDING..." : "BUILD CONTACT SHEET"}</PixelButton></div>
    {result && previewUrl ? <PixelContactSheet src={previewUrl} assets={result.assets} columns={result.columns} rows={result.rows} cellWidth={result.cellWidth} cellHeight={result.cellHeight} manifestUrl={result.manifest} /> : null}
  </PixelPanel>;
}
