import { useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSelect, PixelSpriteRuntimeBundle } from "@jdsalasc/pixel-ui";
import type { SpriteRuntimeBundleView } from "../domain/contracts.js";

interface SpriteRuntimeBundlePanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  result: SpriteRuntimeBundleView | null;
  onBuild(mode: "components" | "union", columns: number): void;
}

export function SpriteRuntimeBundlePanel({ busy, online, assetName, result, onBuild }: SpriteRuntimeBundlePanelProps) {
  const [mode, setMode] = useState<"components" | "union">("components");
  const [columns, setColumns] = useState("4");
  return <PixelPanel title="SPRITE RUNTIME BUNDLE" accent="pink">
    <p className="muted">Empaqueta sheet, timing e hitboxes de <strong>{assetName}</strong> en una operación del MCP para reducir llamadas y errores de integración.</p>
    <div className="runtime-bundle-controls"><PixelField label="COLUMNS" type="number" min="1" max="16" value={columns} onChange={(event) => setColumns(event.target.value)} /><PixelSelect label="HITBOX MODE" value={mode} onChange={(event) => setMode(event.target.value as "components" | "union")}><option value="components">COMPONENTS</option><option value="union">UNION</option></PixelSelect></div>
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={() => onBuild(mode, Math.max(1, Math.min(16, Number(columns) || 1)))}>{busy ? "BUILDING..." : "BUILD SPRITE RUNTIME BUNDLE"}</PixelButton></div>
    {result ? <PixelSpriteRuntimeBundle frameCount={result.frames} artifactCount={result.artifacts} sourceFilename={result.filename} manifestUrl={result.manifest} /> : null}
  </PixelPanel>;
}
