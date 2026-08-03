import { PixelCompare, PixelPanel } from "@jdsalasc/pixel-ui";

export function AssetPreviewPanel({ before, after }: { before: string; after?: string }) {
  return <PixelPanel title="VISUAL REVIEW" accent="cyan">
    {after ? (
      <PixelCompare before={before} after={after} beforeAlt="Referencia original" afterAlt="Asset mejorado" />
    ) : (
      <div className="preview-grid">
        <figure><img src={before} alt="Referencia original" /><figcaption>ORIGINAL</figcaption></figure>
        <p className="muted">Aplica el plan para comparar el resultado.</p>
      </div>
    )}
  </PixelPanel>;
}
