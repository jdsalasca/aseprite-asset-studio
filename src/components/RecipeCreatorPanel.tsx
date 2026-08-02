import { useState } from "react";
import { PixelButton, PixelCheckboxGroup, PixelField, PixelPanel, PixelSelect } from "@jdsalasc/pixel-ui";
import type { AssetRecipeStep, LightDirection, MaterialTextureKind } from "../domain/contracts.js";

interface RecipeCreatorPanelProps { busy: boolean; online: boolean; assetName: string; onCreate(input: { steps: AssetRecipeStep[]; seed: number; material: MaterialTextureKind; direction: LightDirection }): void; }
const STEPS: Array<{ value: AssetRecipeStep; label: string }> = [{ value: "outline", label: "Outline" }, { value: "color_grade", label: "Color grade" }, { value: "material_texture", label: "Material texture" }, { value: "depth_lighting", label: "Depth lighting" }, { value: "shadow", label: "Shadow" }, { value: "particles", label: "Particles" }, { value: "normal_map", label: "Normal map" }, { value: "quality_gate", label: "Quality gate" }];
const DIRECTIONS: LightDirection[] = ["south_east", "south", "north", "east", "west", "north_east", "north_west", "south_west"];

export function RecipeCreatorPanel({ busy, online, assetName, onCreate }: RecipeCreatorPanelProps) {
  const [selected, setSelected] = useState<AssetRecipeStep[]>(["outline", "material_texture", "depth_lighting", "quality_gate"]);
  const [seed, setSeed] = useState("1");
  const [material, setMaterial] = useState<MaterialTextureKind>("earth");
  const [direction, setDirection] = useState<LightDirection>("south_east");
  function create(): void { const parsedSeed = Number(seed); if (!Number.isInteger(parsedSeed) || selected.length === 0 || selected.length > 8) return; onCreate({ steps: selected, seed: parsedSeed, material, direction }); }
  return <PixelPanel title="RECIPE CREATOR" accent="amber"><p className="muted">Construye un pipeline revisable para <strong>{assetName}</strong>; ningún paso se ejecuta automáticamente.</p><PixelCheckboxGroup label="RECIPE PASSES" options={STEPS} values={selected} onChange={(values) => setSelected(values as AssetRecipeStep[])} disabled={busy || !online} /><div className="recipe-controls"><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={busy || !online} /><PixelSelect label="MATERIAL" value={material} onChange={(event) => setMaterial(event.target.value as MaterialTextureKind)} disabled={busy || !online}><option value="earth">EARTH</option><option value="water">WATER</option><option value="grass">GRASS</option><option value="stone">STONE</option><option value="snow">SNOW</option></PixelSelect><PixelSelect label="LIGHT DIRECTION" value={direction} onChange={(event) => setDirection(event.target.value as LightDirection)} disabled={busy || !online}>{DIRECTIONS.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</PixelSelect></div><div className="tool-runner-actions"><PixelButton tone="amber" disabled={busy || !online || selected.length === 0} onClick={create}>{busy ? "CREATING..." : "CREATE RECIPE PLAN"}</PixelButton></div></PixelPanel>;
}
