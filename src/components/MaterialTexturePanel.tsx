import { useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSelect } from "@jdsalasc/pixel-ui";
import type { MaterialTextureKind } from "../domain/contracts.js";

interface MaterialTexturePanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  onApply(material: MaterialTextureKind, seed: number, intensity: number): void;
}

const MATERIALS: Array<{ value: MaterialTextureKind; label: string }> = [
  { value: "earth", label: "EARTH GRAIN" },
  { value: "water", label: "WATER FLOW" },
  { value: "grass", label: "GRASS DETAIL" },
  { value: "stone", label: "STONE GRAIN" },
  { value: "snow", label: "SNOW HIGHLIGHTS" },
];

export function MaterialTexturePanel({ busy, online, assetName, onApply }: MaterialTexturePanelProps) {
  const [material, setMaterial] = useState<MaterialTextureKind>("earth");
  const [seed, setSeed] = useState("1");
  const [intensity, setIntensity] = useState("0.6");
  function apply(): void {
    const parsedSeed = Number(seed);
    const parsedIntensity = Number(intensity);
    if (!Number.isInteger(parsedSeed) || !Number.isFinite(parsedIntensity) || parsedIntensity < 0 || parsedIntensity > 1) return;
    onApply(material, parsedSeed, parsedIntensity);
  }

  return <PixelPanel title="MATERIAL ENHANCER" accent="amber">
    <p className="muted">Añade granularidad determinista a <strong>{assetName}</strong> sin sobrescribir el origen.</p>
    <PixelSelect label="MATERIAL PASS" value={material} onChange={(event) => setMaterial(event.target.value as MaterialTextureKind)} disabled={busy || !online}>
      {MATERIALS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </PixelSelect>
    <div className="material-controls"><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={busy || !online} /><PixelField label="INTENSITY (0–1)" type="number" min="0" max="1" step="0.05" value={intensity} onChange={(event) => setIntensity(event.target.value)} disabled={busy || !online} /></div>
    <div className="tool-runner-actions"><PixelButton tone="amber" disabled={busy || !online} onClick={apply}>{busy ? "ENHANCING..." : "APPLY MATERIAL PASS"}</PixelButton></div>
  </PixelPanel>;
}
