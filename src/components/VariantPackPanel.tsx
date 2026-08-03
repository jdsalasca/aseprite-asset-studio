import { useState } from "react";
import { PixelButton, PixelCheckboxGroup, PixelField, PixelPanel } from "@jdsalasc/pixel-ui";
import type { AssetVariantKind } from "../domain/contracts.js";

interface VariantPackPanelProps { busy: boolean; online: boolean; assetName: string; onGenerate(variants: AssetVariantKind[], frames: number, seed: number): void; }
const OPTIONS: Array<{ value: AssetVariantKind; label: string }> = [
  { value: "rain", label: "RAIN" }, { value: "fire", label: "FIRE" }, { value: "earthquake", label: "EARTHQUAKE" }, { value: "birds", label: "BIRDS" }, { value: "night", label: "NIGHT" }, { value: "day_night", label: "DAY / NIGHT" }, { value: "walk", label: "WALK" }, { value: "water_reflection", label: "WATER REFLECTION" }, { value: "water_caustics", label: "WATER CAUSTICS" }, { value: "wind_sway", label: "WIND SWAY" },
];

export function VariantPackPanel({ busy, online, assetName, onGenerate }: VariantPackPanelProps) {
  const [selected, setSelected] = useState<AssetVariantKind[]>(["rain", "fire", "birds", "day_night"]);
  const [frames, setFrames] = useState("8");
  const [seed, setSeed] = useState("1");
  const disabled = busy || !online;
  function generate(): void {
    const parsedFrames = Number(frames); const parsedSeed = Number(seed);
    if (selected.length === 0 || selected.length > 10 || !Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isInteger(parsedSeed)) return;
    onGenerate(selected, parsedFrames, parsedSeed);
  }
  return <PixelPanel title="ENVIRONMENT VARIANT PACK" accent="amber">
    <p className="muted">Crea salidas separadas de lluvia, fuego, terremoto, pájaros, noche, movimiento, viento y agua para <strong>{assetName}</strong>.</p>
    <PixelCheckboxGroup label="VARIANTS" options={OPTIONS} values={selected} onChange={(values) => setSelected(values as AssetVariantKind[])} disabled={disabled} />
    <div className="recipe-controls"><PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} /><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={disabled} /></div>
    <div className="tool-runner-actions"><PixelButton tone="amber" disabled={disabled || selected.length === 0} onClick={generate}>{busy ? "GENERATING..." : "GENERATE VARIANT PACK"}</PixelButton></div>
  </PixelPanel>;
}
