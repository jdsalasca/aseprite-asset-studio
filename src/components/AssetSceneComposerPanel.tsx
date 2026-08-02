import { useMemo, useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSceneComposition } from "@jdsalasc/pixel-ui";
import type { AssetSceneCompositionView } from "../domain/contracts.js";

interface AssetSceneComposerPanelProps {
  busy: boolean;
  online: boolean;
  result: AssetSceneCompositionView | null;
  previewUrl(path: string): string;
  onCompose(input: { itemIds: string[]; width: number; height: number; padding: number }): void;
}

export function AssetSceneComposerPanel({ busy, online, result, previewUrl, onCompose }: AssetSceneComposerPanelProps) {
  const [selection, setSelection] = useState("");
  const [width, setWidth] = useState(64);
  const [height, setHeight] = useState(64);
  const [padding, setPadding] = useState(2);
  const itemIds = useMemo(() => selection.split(",").map((value) => value.trim()).filter(Boolean), [selection]);
  return <PixelPanel title="SCENE COMPOSITOR" accent="cyan">
    <p className="muted">Materializa una selección de la biblioteca como PNG + manifest navegable usando el mismo servicio del MCP.</p>
    <div className="scene-compose-controls">
      <PixelField label="ASSET IDS (COMMA SEPARATED)" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="oak, pine, rain" />
      <PixelField label="WIDTH" type="number" min={16} max={2048} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
      <PixelField label="HEIGHT" type="number" min={16} max={2048} value={height} onChange={(event) => setHeight(Number(event.target.value))} />
      <PixelField label="PADDING" type="number" min={0} max={64} value={padding} onChange={(event) => setPadding(Number(event.target.value))} />
      <PixelButton tone="cyan" disabled={busy || !online || itemIds.length === 0} onClick={() => onCompose({ itemIds, width, height, padding })}>{busy ? "COMPOSING..." : "COMPOSE PNG"}</PixelButton>
    </div>
    {result ? <PixelSceneComposition src={previewUrl(result.output)} manifestUrl={previewUrl(result.manifest)} width={result.width} height={result.height} layers={result.layers} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
  </PixelPanel>;
}
