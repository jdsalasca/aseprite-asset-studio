import { useState } from "react";
import { PixelButton, PixelField, PixelPaddingControl, PixelPanel } from "@jdsalasc/pixel-ui";

interface SceneExtensionInput { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number; }
interface SceneExtensionPanelProps { busy: boolean; online: boolean; onExtend(input: SceneExtensionInput): void; onTransition?(input: { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; transitionWidth: number; seed: number }): void; }

export function SceneExtensionPanel({ busy, online, onExtend, onTransition }: SceneExtensionPanelProps) {
  const [inputMapFilename, setInputMapFilename] = useState("world-map.json");
  const [outputMapFilename, setOutputMapFilename] = useState("world-map-expanded.json");
  const [previewFilename, setPreviewFilename] = useState("world-map-expanded.png");
  const [seed, setSeed] = useState("1");
  const [top, setTop] = useState("0");
  const [right, setRight] = useState("8");
  const [bottom, setBottom] = useState("0");
  const [left, setLeft] = useState("8");
  const [transitionWidth, setTransitionWidth] = useState("2");

  function extend(): void {
    const values = [top, right, bottom, left].map(Number);
    const parsedSeed = Number(seed);
    if (!inputMapFilename.trim() || !outputMapFilename.trim() || !Number.isInteger(parsedSeed) || values.some((value) => !Number.isInteger(value) || value < 0 || value > 512) || values.every((value) => value === 0)) return;
    onExtend({ inputMapFilename, outputMapFilename, ...(previewFilename.trim() ? { previewFilename } : {}), top: values[0]!, right: values[1]!, bottom: values[2]!, left: values[3]!, seed: parsedSeed });
  }

  function transition(): void { const parsedWidth = Number(transitionWidth); const parsedSeed = Number(seed); if (!inputMapFilename.trim() || !outputMapFilename.trim() || !Number.isInteger(parsedSeed) || !Number.isInteger(parsedWidth) || parsedWidth < 1 || parsedWidth > 8 || !onTransition) return; onTransition({ inputMapFilename, outputMapFilename: outputMapFilename.replace(/\.json$/i, "-transitions.json"), ...(previewFilename.trim() ? { previewFilename: previewFilename.replace(/\.png$/i, "-transitions.png") } : {}), transitionWidth: parsedWidth, seed: parsedSeed }); }

  return <PixelPanel title="SCENE EXTENSION" accent="cyan">
    <p className="muted">Amplía un mapa existente alrededor de sus bordes, preserva sus capas y desplaza sus landmarks sin regenerar el centro.</p>
    <PixelField label="INPUT MAP JSON" value={inputMapFilename} onChange={(event) => setInputMapFilename(event.target.value)} disabled={busy || !online} />
    <PixelField label="OUTPUT MAP JSON" value={outputMapFilename} onChange={(event) => setOutputMapFilename(event.target.value)} disabled={busy || !online} />
    <PixelField label="PREVIEW PNG (OPTIONAL)" value={previewFilename} onChange={(event) => setPreviewFilename(event.target.value)} disabled={busy || !online} />
    <PixelPaddingControl label="SCENE PADDING" value={{ top: Number(top), right: Number(right), bottom: Number(bottom), left: Number(left) }} onChange={(next) => { setTop(String(next.top)); setRight(String(next.right)); setBottom(String(next.bottom)); setLeft(String(next.left)); }} disabled={busy || !online} />
    <PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={busy || !online} />
    {onTransition ? <PixelField label="TRANSITION WIDTH" type="number" min="1" max="8" value={transitionWidth} onChange={(event) => setTransitionWidth(event.target.value)} disabled={busy || !online} /> : null}
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={extend}>{busy ? "EXTENDING..." : "EXTEND SCENE"}</PixelButton>{onTransition ? <PixelButton tone="amber" disabled={busy || !online} onClick={transition}>{busy ? "WORKING..." : "BLEND BIOMES"}</PixelButton> : null}</div>
  </PixelPanel>;
}
