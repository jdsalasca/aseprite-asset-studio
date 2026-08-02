import { useMemo, useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelScenePlan } from "@jdsalasc/pixel-ui";
import type { AssetScenePlanView } from "../domain/contracts.js";

interface AssetScenePlannerPanelProps { busy: boolean; online: boolean; result: AssetScenePlanView | null; onPlan(itemIds: string[]): void; }

export function AssetScenePlannerPanel({ busy, online, result, onPlan }: AssetScenePlannerPanelProps) {
  const [selection, setSelection] = useState("");
  const itemIds = useMemo(() => selection.split(",").map((value) => value.trim()).filter(Boolean), [selection]);
  return <PixelPanel title="SCENE BUILDER" accent="amber">
    <p className="muted">Selecciona assets de la biblioteca por ID y crea una composición de capas sin generar archivos todavía.</p>
    <div className="scene-plan-controls"><PixelField label="ASSET IDS (COMMA SEPARATED)" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="knight, oak, rain" /><PixelButton tone="amber" disabled={busy || !online || itemIds.length === 0} onClick={() => onPlan(itemIds)}>{busy ? "PLANNING..." : "PLAN SCENE"}</PixelButton></div>
    {result ? <PixelScenePlan libraryVersion={result.libraryVersion} layers={result.layers} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
  </PixelPanel>;
}
