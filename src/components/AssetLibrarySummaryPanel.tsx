import { PixelButton, PixelLibrarySummary, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetLibrarySummaryView } from "../domain/contracts.js";

interface AssetLibrarySummaryPanelProps { busy: boolean; online: boolean; result: AssetLibrarySummaryView | null; onSummarize(): void; }

export function AssetLibrarySummaryPanel({ busy, online, result, onSummarize }: AssetLibrarySummaryPanelProps) {
  return <PixelPanel title="LIBRARY MAP" accent="pink">
    <p className="muted">Navega categorías y presets con una respuesta compacta, sin cargar el detalle de cientos de assets.</p>
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={onSummarize}>{busy ? "LOADING..." : "LOAD LIBRARY MAP"}</PixelButton></div>
    {result ? <PixelLibrarySummary totalItems={result.totalItems} totalCategories={result.totalCategories} totalPresets={result.totalPresets} categories={result.categories} presets={result.presets} /> : null}
  </PixelPanel>;
}
