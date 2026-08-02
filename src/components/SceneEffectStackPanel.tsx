import { useState } from "react";
import { PixelButton, PixelCheckboxGroup, PixelField, PixelPanel, PixelSelect } from "@jdsalasc/pixel-ui";
import type { LightDirection, MaterialTextureKind, SceneEffectKind } from "../domain/contracts.js";

interface SceneEffectStackPanelProps { busy: boolean; online: boolean; assetName: string; onGenerate(effects: SceneEffectKind[], frames: number, seed: number, material: MaterialTextureKind, direction: LightDirection): void; }
const OPTIONS: Array<{ value: SceneEffectKind; label: string }> = [
  { value: "material_texture", label: "MATERIAL GRAIN" }, { value: "depth_lighting", label: "DEPTH LIGHT" }, { value: "rain", label: "RAIN" }, { value: "particles", label: "PARTICLES" }, { value: "water_reflection", label: "WATER REFLECTION" }, { value: "water_caustics", label: "WATER CAUSTICS" }, { value: "day_night", label: "DAY / NIGHT" },
];
const DIRECTIONS: LightDirection[] = ["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"];

export function SceneEffectStackPanel({ busy, online, assetName, onGenerate }: SceneEffectStackPanelProps) {
  const [selected, setSelected] = useState<SceneEffectKind[]>(["material_texture", "depth_lighting", "rain", "particles"]);
  const [frames, setFrames] = useState("8"); const [seed, setSeed] = useState("1");
  const [material, setMaterial] = useState<MaterialTextureKind>("earth"); const [direction, setDirection] = useState<LightDirection>("south_east");
  const disabled = busy || !online;
  function generate(): void { const parsedFrames = Number(frames); const parsedSeed = Number(seed); if (!selected.length || selected.length > 7 || !Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isInteger(parsedSeed)) return; onGenerate(selected, parsedFrames, parsedSeed, material, direction); }
  return <PixelPanel title="SCENE EFFECT STACK" accent="cyan"><p className="muted">Agrupa materiales, iluminación, lluvia, partículas y ciclos ambientales en una sola ejecución determinista para <strong>{assetName}</strong>.</p><PixelCheckboxGroup label="EFFECTS" options={OPTIONS} values={selected} onChange={(values) => setSelected(values as SceneEffectKind[])} disabled={disabled} /><div className="recipe-controls"><PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} /><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={disabled} /><PixelSelect label="MATERIAL" value={material} onChange={(event) => setMaterial(event.target.value as MaterialTextureKind)} disabled={disabled}><option value="earth">EARTH</option><option value="water">WATER</option><option value="grass">GRASS</option><option value="stone">STONE</option><option value="snow">SNOW</option></PixelSelect><PixelSelect label="LIGHT DIRECTION" value={direction} onChange={(event) => setDirection(event.target.value as LightDirection)} disabled={disabled}>{DIRECTIONS.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</PixelSelect></div><div className="tool-runner-actions"><PixelButton tone="cyan" disabled={disabled || selected.length === 0} onClick={generate}>{busy ? "GENERATING..." : "GENERATE EFFECT STACK"}</PixelButton></div></PixelPanel>;
}
