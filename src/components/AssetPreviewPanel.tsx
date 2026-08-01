import { PixelPanel } from "@jdsalas/pixel-ui";

export function AssetPreviewPanel({ before, after }: { before: string; after?: string }) {
  return <PixelPanel title="VISUAL REVIEW" accent="cyan"><div className="preview-grid"><figure><img src={before} alt="Referencia original" /><figcaption>ORIGINAL</figcaption></figure>{after ? <figure><img src={after} alt="Asset mejorado" /><figcaption>ENHANCED OUTPUT</figcaption></figure> : <p className="muted">Aplica el plan para comparar el resultado.</p>}</div></PixelPanel>;
}
