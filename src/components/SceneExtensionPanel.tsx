import { useState } from "react";
import { PixelButton, PixelField, PixelPanel } from "@jdsalasc/pixel-ui";

interface SceneExtensionInput { inputMapFilename: string; outputMapFilename: string; previewFilename?: string; top: number; right: number; bottom: number; left: number; seed: number; }
interface SceneExtensionPanelProps { busy: boolean; online: boolean; onExtend(input: SceneExtensionInput): void; }

export function SceneExtensionPanel({ busy, online, onExtend }: SceneExtensionPanelProps) {
  const [inputMapFilename, setInputMapFilename] = useState("world-map.json");
  const [outputMapFilename, setOutputMapFilename] = useState("world-map-expanded.json");
  const [previewFilename, setPreviewFilename] = useState("world-map-expanded.png");
  const [seed, setSeed] = useState("1");
  const [top, setTop] = useState("0");
  const [right, setRight] = useState("8");
  const [bottom, setBottom] = useState("0");
  const [left, setLeft] = useState("8");

  function extend(): void {
    const values = [top, right, bottom, left].map(Number);
    const parsedSeed = Number(seed);
    if (!inputMapFilename.trim() || !outputMapFilename.trim() || !Number.isInteger(parsedSeed) || values.some((value) => !Number.isInteger(value) || value < 0 || value > 512) || values.every((value) => value === 0)) return;
    onExtend({ inputMapFilename, outputMapFilename, ...(previewFilename.trim() ? { previewFilename } : {}), top: values[0]!, right: values[1]!, bottom: values[2]!, left: values[3]!, seed: parsedSeed });
  }

  return <PixelPanel title="SCENE EXTENSION" accent="cyan">
    <p className="muted">Amplía un mapa existente alrededor de sus bordes, preserva sus capas y desplaza sus landmarks sin regenerar el centro.</p>
    <PixelField label="INPUT MAP JSON" value={inputMapFilename} onChange={(event) => setInputMapFilename(event.target.value)} disabled={busy || !online} />
    <PixelField label="OUTPUT MAP JSON" value={outputMapFilename} onChange={(event) => setOutputMapFilename(event.target.value)} disabled={busy || !online} />
    <PixelField label="PREVIEW PNG (OPTIONAL)" value={previewFilename} onChange={(event) => setPreviewFilename(event.target.value)} disabled={busy || !online} />
    <div className="scene-extension-controls"><PixelField label="TOP" type="number" min="0" max="512" value={top} onChange={(event) => setTop(event.target.value)} disabled={busy || !online} /><PixelField label="RIGHT" type="number" min="0" max="512" value={right} onChange={(event) => setRight(event.target.value)} disabled={busy || !online} /><PixelField label="BOTTOM" type="number" min="0" max="512" value={bottom} onChange={(event) => setBottom(event.target.value)} disabled={busy || !online} /><PixelField label="LEFT" type="number" min="0" max="512" value={left} onChange={(event) => setLeft(event.target.value)} disabled={busy || !online} /></div>
    <PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={busy || !online} />
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={extend}>{busy ? "EXTENDING..." : "EXTEND SCENE"}</PixelButton></div>
  </PixelPanel>;
}
