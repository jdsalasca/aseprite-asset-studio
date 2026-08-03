import { PixelButton, PixelField, PixelManifestAudit, PixelPanel } from "@jdsalasc/pixel-ui";
import { useState } from "react";
import type { AssetManifestAuditView } from "../domain/contracts.js";

interface AssetManifestAuditPanelProps { busy: boolean; online: boolean; result: AssetManifestAuditView | null; onAudit(manifestFilename: string): void; }

export function AssetManifestAuditPanel({ busy, online, result, onAudit }: AssetManifestAuditPanelProps) {
  const [manifestFilename, setManifestFilename] = useState("output/scene-library-preview.json");
  return <PixelPanel title="MANIFEST AUDIT" accent={result?.valid === false ? "amber" : "cyan"}>
    <p className="muted">Verifica los archivos generados antes de importar una escena: existencia, tamaño, formato y hash.</p>
    <div className="manifest-audit-controls"><PixelField label="MANIFEST JSON" value={manifestFilename} onChange={(event) => setManifestFilename(event.target.value)} /><PixelButton tone="cyan" disabled={busy || !online || !manifestFilename.trim()} onClick={() => onAudit(manifestFilename)}>{busy ? "AUDITING..." : "AUDIT OUTPUTS"}</PixelButton></div>
    {result ? <PixelManifestAudit manifest={result.manifest} valid={result.valid} missingArtifacts={result.missingArtifacts} emptyArtifacts={result.emptyArtifacts} artifacts={result.artifacts} /> : null}
  </PixelPanel>;
}
