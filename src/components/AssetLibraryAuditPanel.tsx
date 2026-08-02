import { PixelButton, PixelLibraryAudit, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetLibraryAuditView } from "../domain/contracts.js";

interface AssetLibraryAuditPanelProps { busy: boolean; online: boolean; result: AssetLibraryAuditView | null; onAudit(): void; }

export function AssetLibraryAuditPanel({ busy, online, result, onAudit }: AssetLibraryAuditPanelProps) {
  return <PixelPanel title="LIBRARY AUDIT" accent={result?.valid === false ? "amber" : "cyan"}>
    <p className="muted">Comprueba el catálogo antes de componer escenas: IDs, referencias de presets, categorías y rutas navegables.</p>
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={onAudit}>{busy ? "AUDITING..." : "AUDIT ASSET LIBRARY"}</PixelButton></div>
    {result ? <PixelLibraryAudit totalItems={result.totalItems} totalCategories={result.totalCategories} totalPresets={result.totalPresets} totalFolders={result.totalFolders} readmePaths={result.readmePaths} previewPaths={result.previewPaths} spritePaths={result.spritePaths} valid={result.valid} violations={result.violations} /> : null}
  </PixelPanel>;
}
