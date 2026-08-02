import { useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSelect, PixelSlider } from "@jdsalasc/pixel-ui";
import type { SpriteEffectKind } from "../domain/contracts.js";

interface SpriteEffectsPanelProps { busy: boolean; online: boolean; assetName: string; onApply(kind: SpriteEffectKind, options: Record<string, number | string | boolean>): void; }
const EFFECTS: Array<{ value: SpriteEffectKind; label: string }> = [{ value: "outline", label: "PIXEL OUTLINE" }, { value: "color_grade", label: "COLOR GRADE" }, { value: "shadow", label: "SPRITE SHADOW" }, { value: "particles", label: "PARTICLE BURST" }, { value: "normal_map", label: "NORMAL MAP" }];

export function SpriteEffectsPanel({ busy, online, assetName, onApply }: SpriteEffectsPanelProps) {
  const [kind, setKind] = useState<SpriteEffectKind>("outline");
  const [color, setColor] = useState("#172033");
  const [strength, setStrength] = useState("0.7");
  const [frames, setFrames] = useState("8");
  const [particleCount, setParticleCount] = useState("24");
  function apply(): void {
    if (kind === "particles") { const parsedFrames = Number(frames); const parsedCount = Number(particleCount); if (!Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 128) return; onApply(kind, { frames: parsedFrames, particle_count: parsedCount, color }); return; }
    const parsedStrength = Number(strength); if (!Number.isFinite(parsedStrength) || parsedStrength < 0 || parsedStrength > 8) return; onApply(kind, kind === "normal_map" ? { strength: parsedStrength } : { color, thickness: Math.max(1, Math.min(8, Math.round(parsedStrength))) });
  }
  return <PixelPanel title="SPRITE EFFECTS" accent="pink"><p className="muted">Aplica un efecto determinista a <strong>{assetName}</strong> y conserva el archivo original.</p><PixelSelect label="EFFECT" value={kind} onChange={(event) => setKind(event.target.value as SpriteEffectKind)} disabled={busy || !online}>{EFFECTS.map((effect) => <option key={effect.value} value={effect.value}>{effect.label}</option>)}</PixelSelect><PixelField label="COLOR" value={color} onChange={(event) => setColor(event.target.value)} disabled={busy || !online} /><div className="effect-controls">{kind === "particles" ? <><PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={busy || !online} /><PixelField label="PARTICLES" type="number" min="1" max="128" value={particleCount} onChange={(event) => setParticleCount(event.target.value)} disabled={busy || !online} /></> : <PixelSlider label={kind === "normal_map" ? `STRENGTH · ${strength}` : `THICKNESS · ${strength}`} min={kind === "normal_map" ? 0 : 1} max={kind === "normal_map" ? 8 : 8} step={kind === "normal_map" ? 0.5 : 1} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={busy || !online} />}</div><div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={apply}>{busy ? "APPLYING..." : "APPLY SPRITE EFFECT"}</PixelButton></div></PixelPanel>;
}
