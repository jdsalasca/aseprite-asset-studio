import { useState } from "react";
import { PixelButton, PixelPanel, PixelSelect, PixelSpriteHitboxes } from "@jdsalasc/pixel-ui";
import type { SpriteHitboxView } from "../domain/contracts.js";

interface SpriteHitboxPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  result: SpriteHitboxView | null;
  onGenerate(mode: "components" | "union", padding: number): void;
}

export function SpriteHitboxPanel({ busy, online, assetName, result, onGenerate }: SpriteHitboxPanelProps) {
  const [mode, setMode] = useState<"components" | "union">("components");
  const [padding, setPadding] = useState(1);
  return <PixelPanel title="SPRITE HITBOXES" accent="cyan">
    <p className="muted">Genera un manifest de colisión determinista para <strong>{assetName}</strong>, reutilizando la geometría ya inspeccionada.</p>
    <div className="hitbox-controls"><PixelSelect label="MODE" value={mode} onChange={(event) => setMode(event.target.value as "components" | "union")}><option value="components">COMPONENTS</option><option value="union">UNION</option></PixelSelect><label>PADDING<input type="number" min="0" max="16" value={padding} onChange={(event) => setPadding(Math.max(0, Math.min(16, Number(event.target.value) || 0)))} /></label></div>
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={() => onGenerate(mode, padding)}>{busy ? "GENERATING..." : "GENERATE SPRITE HITBOXES"}</PixelButton></div>
    {result ? <PixelSpriteHitboxes frameCount={result.frames} mode={result.mode} padding={result.padding} hitboxes={result.hitboxes} manifestUrl={result.manifest} /> : null}
  </PixelPanel>;
}
