import { PixelButton } from "@jdsalasc/pixel-ui";
import type { AssetRecipe } from "../domain/contracts.js";
const PRESETS: Array<{ recipe: AssetRecipe; label: string }> = [{ recipe: "pixel_art", label: "CRISP PNG" }, { recipe: "animation_pixel_art", label: "ANIMATED SPRITE" }, { recipe: "gif", label: "GIF LOOP" }, { recipe: "atlas", label: "ATLAS" }];
export function RecipePresets({ onSelect }: { onSelect(recipe: AssetRecipe): void }) { return <div className="recipe-presets" aria-label="Recipe presets">{PRESETS.map((preset) => <PixelButton key={preset.recipe} tone="cyan" onClick={() => onSelect(preset.recipe)}>{preset.label}</PixelButton>)}</div>; }
