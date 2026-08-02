import { PixelButton, PixelQualityMatrix, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetQualityBatchView } from "../domain/contracts.js";

interface QualityBatchPanelProps {
  busy: boolean;
  online: boolean;
  result: AssetQualityBatchView | null;
  onInspect(): void;
}

export function QualityBatchPanel({ busy, online, result, onInspect }: QualityBatchPanelProps) {
  return <PixelPanel title="COLLECTION QUALITY" accent="amber">
    <p className="muted">Revisa el asset cargado y sus variantes en una sola llamada del MCP; los fallos individuales no ocultan el resto del diagnóstico.</p>
    <div className="tool-runner-actions"><PixelButton tone="amber" disabled={busy || !online} onClick={onInspect}>{busy ? "AUDITING..." : "AUDIT COLLECTION"}</PixelButton></div>
    {result ? <PixelQualityMatrix assets={result.assets} summary={result.summary} /> : null}
  </PixelPanel>;
}
