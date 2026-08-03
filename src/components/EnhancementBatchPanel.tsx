import { PixelButton, PixelEnhancementBatch, PixelPanel } from "@jdsalasc/pixel-ui";
import type { EnhancementBatchView } from "../domain/contracts.js";

interface EnhancementBatchPanelProps {
  busy: boolean;
  online: boolean;
  result: EnhancementBatchView | null;
  onApply(): void;
}

export function EnhancementBatchPanel({ busy, online, result, onApply }: EnhancementBatchPanelProps) {
  return <PixelPanel title="BATCH ENHANCER" accent="pink">
    <p className="muted">Aplica las mismas pasadas deterministas al asset cargado y a sus variantes en una sola llamada. Cada fallo queda aislado.</p>
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={onApply}>{busy ? "ENHANCING..." : "ENHANCE COLLECTION"}</PixelButton></div>
    {result ? <PixelEnhancementBatch items={result.items} summary={result.summary} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
  </PixelPanel>;
}
