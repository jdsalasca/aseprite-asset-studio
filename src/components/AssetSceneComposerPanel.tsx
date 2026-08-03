import { useMemo, useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSceneAnimation, PixelSceneComposition } from "@jdsalasc/pixel-ui";
import type { AssetSceneAnimationCompositionView, AssetSceneCompositionView } from "../domain/contracts.js";

interface AssetSceneComposerPanelProps {
  busy: boolean;
  online: boolean;
  result: AssetSceneCompositionView | null;
  animationResult: AssetSceneAnimationCompositionView | null;
  previewUrl(path: string): string;
  onCompose(input: { itemIds: string[]; width: number; height: number; padding: number }): void;
  onComposeAnimation(input: { itemIds: string[]; width: number; height: number; padding: number; frames: number; delayMs: number }): void;
}

export function AssetSceneComposerPanel({ busy, online, result, animationResult, previewUrl, onCompose, onComposeAnimation }: AssetSceneComposerPanelProps) {
  const [selection, setSelection] = useState("");
  const [width, setWidth] = useState(64);
  const [height, setHeight] = useState(64);
  const [padding, setPadding] = useState(2);
  const [frames, setFrames] = useState(8);
  const [delayMs, setDelayMs] = useState(90);
  const itemIds = useMemo(() => selection.split(",").map((value) => value.trim()).filter(Boolean), [selection]);
  return <PixelPanel title="SCENE COMPOSITOR" accent="cyan">
    <p className="muted">Materializa una selección de la biblioteca como PNG + manifest navegable usando el mismo servicio del MCP.</p>
    <div className="scene-compose-controls">
      <PixelField label="ASSET IDS (COMMA SEPARATED)" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="oak, pine, rain" />
      <PixelField label="WIDTH" type="number" min={16} max={2048} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
      <PixelField label="HEIGHT" type="number" min={16} max={2048} value={height} onChange={(event) => setHeight(Number(event.target.value))} />
      <PixelField label="PADDING" type="number" min={0} max={64} value={padding} onChange={(event) => setPadding(Number(event.target.value))} />
      <PixelField label="FRAMES" type="number" min={2} max={24} value={frames} onChange={(event) => setFrames(Number(event.target.value))} />
      <PixelField label="DELAY MS" type="number" min={1} max={2000} value={delayMs} onChange={(event) => setDelayMs(Number(event.target.value))} />
      <div className="scene-compose-actions"><PixelButton tone="cyan" disabled={busy || !online || itemIds.length === 0} onClick={() => onCompose({ itemIds, width, height, padding })}>{busy ? "COMPOSING..." : "COMPOSE PNG"}</PixelButton><PixelButton tone="pink" disabled={busy || !online || itemIds.length === 0} onClick={() => onComposeAnimation({ itemIds, width, height, padding, frames, delayMs })}>{busy ? "ANIMATING..." : "COMPOSE GIF"}</PixelButton></div>
    </div>
    {result ? <PixelSceneComposition src={previewUrl(result.output)} manifestUrl={previewUrl(result.manifest)} width={result.width} height={result.height} layers={result.layers} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
    {animationResult ? <PixelSceneAnimation src={previewUrl(animationResult.output)} manifestUrl={previewUrl(animationResult.manifest)} width={animationResult.width} height={animationResult.height} frames={animationResult.frames} delayMs={animationResult.delayMs} layers={animationResult.frameLayers[0]?.layers ?? []} deterministic={animationResult.deterministic} sourcePreserved={animationResult.sourcePreserved} /> : null}
  </PixelPanel>;
}
