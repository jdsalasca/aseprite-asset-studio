import { PixelArtifactStrip, PixelBadge, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetVariantArtifactView } from "../domain/contracts.js";

interface VariantPreviewPanelProps {
  previewUrl(path: string): string;
  artifacts: readonly AssetVariantArtifactView[];
}

export function VariantPreviewPanel({ previewUrl, artifacts }: VariantPreviewPanelProps) {
  if (artifacts.length === 0) return null;
  return <PixelPanel title="VARIANT PREVIEWS" accent="cyan">
    <p className="muted">Compara todas las salidas del pack sin abrir archivos manualmente.</p>
    <PixelArtifactStrip label="VARIANT ARTIFACTS" items={artifacts.map((artifact) => ({
      id: artifact.variant,
      name: artifact.variant.replaceAll("_", " ").toUpperCase(),
      preview: previewUrl(artifact.outputFilename),
      detail: `${artifact.frames} FRAMES · ${artifact.format.toUpperCase()}`,
      status: <PixelBadge tone="cyan">DETERMINISTIC</PixelBadge>,
    }))} />
  </PixelPanel>;
}
