import { PixelButton, PixelField, PixelSceneRecommendations, PixelPanel } from "@jdsalasc/pixel-ui";
import { useState } from "react";
import type { AssetSceneRecommendationView } from "../domain/contracts.js";

interface AssetSceneRecommendationPanelProps { busy: boolean; online: boolean; result: AssetSceneRecommendationView | null; onRecommend(input: { prompt?: string; category?: string; requiredTags?: string[]; requiredVariants?: string[]; limit: number; seed: number }): void; }

export function AssetSceneRecommendationPanel({ busy, online, result, onRecommend }: AssetSceneRecommendationPanelProps) {
  const [prompt, setPrompt] = useState("coastal sunset water"); const [category, setCategory] = useState(""); const [tags, setTags] = useState("water, tropical"); const [variants, setVariants] = useState("water_reflection, day_night"); const [limit, setLimit] = useState(8); const [seed, setSeed] = useState(1);
  const list = (value: string): string[] => value.split(",").map((entry) => entry.trim()).filter(Boolean);
  return <PixelPanel title="SCENE FINDER" accent="pink">
    <p className="muted">Describe el mundo que quieres y recibe assets compatibles con razones, tags y efectos cubiertos.</p>
    <div className="scene-recommendation-controls"><PixelField label="SCENE PROMPT" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="coastal sunset water" /><PixelField label="CATEGORY (OPTIONAL)" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="biomes-and-maps" /><PixelField label="REQUIRED TAGS" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="water, tropical" /><PixelField label="REQUIRED EFFECTS" value={variants} onChange={(event) => setVariants(event.target.value)} placeholder="rain, water_reflection" /><PixelField label="LIMIT" type="number" min={1} max={24} value={limit} onChange={(event) => setLimit(Number(event.target.value))} /><PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} /><PixelButton tone="pink" disabled={busy || !online || (!prompt.trim() && !category.trim() && !tags.trim() && !variants.trim())} onClick={() => onRecommend({ ...(prompt.trim() ? { prompt: prompt.trim() } : {}), ...(category.trim() ? { category: category.trim() } : {}), requiredTags: list(tags), requiredVariants: list(variants), limit, seed })}>{busy ? "SEARCHING..." : "RECOMMEND SCENE"}</PixelButton></div>
    {result ? <PixelSceneRecommendations libraryVersion={result.libraryVersion} recommendations={result.recommendations} suggestedItemIds={result.suggestedItemIds} coveredKinds={result.coveredKinds} coveredTags={result.coveredTags} coveredVariants={result.coveredVariants} /> : null}
  </PixelPanel>;
}
