import { useMemo, useState } from "react";
import { PixelButton, PixelField, PixelLibraryVariantPack, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetLibraryVariantPackView, AssetVariantKind } from "../domain/contracts.js";

const supportedVariants: AssetVariantKind[] = ["rain", "fire", "earthquake", "birds", "night", "day_night", "walk", "water_reflection", "water_caustics"];
interface AssetLibraryVariantPackPanelProps { busy: boolean; online: boolean; result: AssetLibraryVariantPackView | null; previewUrl(path: string): string; onGenerate(input: { itemIds: string[]; outputPrefix: string; variants: AssetVariantKind[]; frames: number; seed: number; delayMs: number }): void; }

export function AssetLibraryVariantPackPanel({ busy, online, result, previewUrl, onGenerate }: AssetLibraryVariantPackPanelProps) {
  const [selection, setSelection] = useState(""); const [variantSelection, setVariantSelection] = useState("rain, walk"); const [outputPrefix, setOutputPrefix] = useState("output/library-variants"); const [frames, setFrames] = useState(8); const [seed, setSeed] = useState(1); const [delayMs, setDelayMs] = useState(90);
  const itemIds = useMemo(() => selection.split(",").map((value) => value.trim()).filter(Boolean), [selection]);
  const variants = useMemo(() => variantSelection.split(",").map((value) => value.trim()).filter((value): value is AssetVariantKind => supportedVariants.includes(value as AssetVariantKind)), [variantSelection]);
  return <PixelPanel title="LIBRARY VARIANT FACTORY" accent="amber">
    <p className="muted">Selecciona varios assets y genera lluvia, fuego, movimiento, noche, aves, terremoto o reflejos con una sola operación.</p>
    <div className="library-variant-pack-controls"><PixelField label="ASSET IDS (COMMA SEPARATED)" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="oak, pine, dragon" /><PixelField label="VARIANTS (COMMA SEPARATED)" value={variantSelection} onChange={(event) => setVariantSelection(event.target.value)} placeholder="rain, walk" /><PixelField label="OUTPUT PREFIX" value={outputPrefix} onChange={(event) => setOutputPrefix(event.target.value)} /><PixelField label="FRAMES" type="number" min={2} max={24} value={frames} onChange={(event) => setFrames(Number(event.target.value))} /><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} /><PixelField label="DELAY MS" type="number" min={1} max={2000} value={delayMs} onChange={(event) => setDelayMs(Number(event.target.value))} /><PixelButton tone="amber" disabled={busy || !online || itemIds.length === 0 || variants.length === 0} onClick={() => onGenerate({ itemIds, outputPrefix, variants, frames, seed, delayMs })}>{busy ? "GENERATING..." : "GENERATE LIBRARY PACK"}</PixelButton></div>
    {result ? <PixelLibraryVariantPack manifestUrl={previewUrl(result.manifest)} assets={result.assets.map((asset) => ({ assetId: asset.assetId, title: asset.title, outputPrefix: asset.outputPrefix, variants: asset.artifacts.map((artifact) => artifact.variant) }))} frames={result.frames} seed={result.seed} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
  </PixelPanel>;
}
