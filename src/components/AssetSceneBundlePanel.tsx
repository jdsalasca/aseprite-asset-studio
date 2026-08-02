import { PixelButton, PixelField, PixelSceneBundle, PixelPanel } from "@jdsalasc/pixel-ui";
import { useState } from "react";
import type { AssetSceneBundleView } from "../domain/contracts.js";

interface AssetSceneBundlePanelProps { busy: boolean; online: boolean; result: AssetSceneBundleView | null; previewUrl(path: string): string; onBuild(input: { itemIds: string[]; outputPrefix: string; width: number; height: number; padding: number; frames: number; delayMs: number }): void; }

export function AssetSceneBundlePanel({ busy, online, result, previewUrl, onBuild }: AssetSceneBundlePanelProps) {
  const [selection, setSelection] = useState("ocean, palm"); const [outputPrefix, setOutputPrefix] = useState("output/scene-bundle"); const [width, setWidth] = useState(128); const [height, setHeight] = useState(96); const [padding, setPadding] = useState(2); const [frames, setFrames] = useState(8); const [delayMs, setDelayMs] = useState(90);
  const itemIds = selection.split(",").map((value) => value.trim()).filter(Boolean);
  return <PixelPanel title="SCENE BUNDLE FACTORY" accent="cyan">
    <p className="muted">Genera PNG, GIF y manifests navegables en una sola operación reutilizable por agentes y humanos.</p>
    <div className="scene-bundle-controls"><PixelField label="ASSET IDS" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="ocean, palm" /><PixelField label="OUTPUT PREFIX" value={outputPrefix} onChange={(event) => setOutputPrefix(event.target.value)} /><PixelField label="WIDTH" type="number" min={16} max={2048} value={width} onChange={(event) => setWidth(Number(event.target.value))} /><PixelField label="HEIGHT" type="number" min={16} max={2048} value={height} onChange={(event) => setHeight(Number(event.target.value))} /><PixelField label="PADDING" type="number" min={0} max={64} value={padding} onChange={(event) => setPadding(Number(event.target.value))} /><PixelField label="FRAMES" type="number" min={2} max={24} value={frames} onChange={(event) => setFrames(Number(event.target.value))} /><PixelField label="DELAY MS" type="number" min={1} max={2000} value={delayMs} onChange={(event) => setDelayMs(Number(event.target.value))} /><PixelButton tone="cyan" disabled={busy || !online || itemIds.length === 0 || !outputPrefix.trim()} onClick={() => onBuild({ itemIds, outputPrefix, width, height, padding, frames, delayMs })}>{busy ? "BUILDING..." : "BUILD SCENE BUNDLE"}</PixelButton></div>
    {result ? <PixelSceneBundle staticSrc={previewUrl(result.static.output)} staticManifestUrl={previewUrl(result.static.manifest)} animationSrc={previewUrl(result.animation.output)} animationManifestUrl={previewUrl(result.animation.manifest)} width={result.static.width} height={result.static.height} frames={result.animation.frames} delayMs={result.animation.delayMs} deterministic={result.deterministic} sourcePreserved={result.sourcePreserved} /> : null}
  </PixelPanel>;
}
