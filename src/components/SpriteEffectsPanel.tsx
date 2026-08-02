import { useState } from "react";
import { PixelBackgroundRemoval, PixelButton, PixelCleanupControls, PixelField, PixelPanel, PixelSelect, PixelSlider, PixelTimeline } from "@jdsalasc/pixel-ui";
import type { SpriteEffectKind } from "../domain/contracts.js";

interface SpriteEffectsPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  onApply(kind: SpriteEffectKind, options: Record<string, number | string | boolean>): void;
}

const EFFECTS: Array<{ value: SpriteEffectKind; label: string }> = [
  { value: "outline", label: "PIXEL OUTLINE" },
  { value: "color_grade", label: "COLOR GRADE" },
  { value: "shadow", label: "SPRITE SHADOW" },
  { value: "particles", label: "PARTICLE BURST" },
  { value: "normal_map", label: "NORMAL MAP" },
  { value: "rain", label: "RAIN OVERLAY" },
  { value: "motion", label: "MOTION PACK" },
  { value: "upscale", label: "NEAREST UPSCALE" },
  { value: "seamless", label: "SEAMLESS TEXTURE" },
  { value: "reflection", label: "WATER REFLECTION" },
  { value: "caustics", label: "WATER CAUSTICS" },
  { value: "day_night", label: "DAY / NIGHT CYCLE" },
  { value: "background", label: "REMOVE BACKGROUND" },
  { value: "cleanup", label: "CLEAN ISOLATED PIXELS" },
];

export function SpriteEffectsPanel({ busy, online, assetName, onApply }: SpriteEffectsPanelProps) {
  const [kind, setKind] = useState<SpriteEffectKind>("outline");
  const [color, setColor] = useState("#172033");
  const [strength, setStrength] = useState("0.7");
  const [frames, setFrames] = useState("8");
  const [particleCount, setParticleCount] = useState("24");
  const [motion, setMotion] = useState("walk");
  const [waterline, setWaterline] = useState("16");
  const [opacity, setOpacity] = useState("0.6");
  const [seed, setSeed] = useState("1");
  const [causticsIntensity, setCausticsIntensity] = useState("0.7");
  const [causticsScale, setCausticsScale] = useState("4");
  const [causticsSeed, setCausticsSeed] = useState("1");
  const [dayNightIntensity, setDayNightIntensity] = useState("0.8");
  const [dayNightSeed, setDayNightSeed] = useState("1");
  const [connectedOnly, setConnectedOnly] = useState(true);
  const [minNeighbors, setMinNeighbors] = useState(1);
  const [cleanupIterations, setCleanupIterations] = useState(1);

  const disabled = busy || !online;

  function apply(): void {
    if (kind === "upscale") {
      const parsedScale = Number(strength);
      if (!Number.isInteger(parsedScale) || parsedScale < 2 || parsedScale > 16) return;
      onApply(kind, { scale: parsedScale });
      return;
    }
    if (kind === "background") {
      const tolerance = Number(strength);
      if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > 255) return;
      onApply(kind, { background_color: color, tolerance, connected_only: connectedOnly });
      return;
    }
    if (kind === "cleanup") {
      onApply(kind, { min_neighbors: minNeighbors, iterations: cleanupIterations });
      return;
    }
    if (kind === "seamless") {
      const parsedSeamWidth = Number(strength);
      if (!Number.isInteger(parsedSeamWidth) || parsedSeamWidth < 1 || parsedSeamWidth > 32) return;
      onApply(kind, { seam_width: parsedSeamWidth });
      return;
    }
    if (kind === "reflection") {
      const parsedWaterline = Number(waterline);
      const parsedFrames = Number(frames);
      const parsedAmplitude = Number(strength);
      const parsedOpacity = Number(opacity);
      const parsedSeed = Number(seed);
      if (!Number.isInteger(parsedWaterline) || parsedWaterline < 1 || parsedWaterline > 2048 || !Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isFinite(parsedAmplitude) || parsedAmplitude < 0 || parsedAmplitude > 8 || !Number.isFinite(parsedOpacity) || parsedOpacity < 0 || parsedOpacity > 1 || !Number.isInteger(parsedSeed)) return;
      onApply(kind, { waterline: parsedWaterline, frames: parsedFrames, amplitude: parsedAmplitude, opacity: parsedOpacity, seed: parsedSeed });
      return;
    }
    if (kind === "caustics") {
      const parsedFrames = Number(frames);
      const parsedIntensity = Number(causticsIntensity);
      const parsedScale = Number(causticsScale);
      const parsedSeed = Number(causticsSeed);
      if (!Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isFinite(parsedIntensity) || parsedIntensity < 0 || parsedIntensity > 1 || !Number.isInteger(parsedScale) || parsedScale < 1 || parsedScale > 32 || !Number.isInteger(parsedSeed)) return;
      onApply(kind, { frames: parsedFrames, intensity: parsedIntensity, scale: parsedScale, seed: parsedSeed, color });
      return;
    }
    if (kind === "day_night") {
      const parsedFrames = Number(frames);
      const parsedIntensity = Number(dayNightIntensity);
      const parsedSeed = Number(dayNightSeed);
      if (!Number.isInteger(parsedFrames) || parsedFrames < 4 || parsedFrames > 24 || !Number.isFinite(parsedIntensity) || parsedIntensity < 0.05 || parsedIntensity > 1 || !Number.isInteger(parsedSeed)) return;
      onApply(kind, { frames: parsedFrames, intensity: parsedIntensity, seed: parsedSeed });
      return;
    }
    if (kind === "particles") {
      const parsedFrames = Number(frames);
      const parsedCount = Number(particleCount);
      if (!Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 128) return;
      onApply(kind, { frames: parsedFrames, particle_count: parsedCount, color });
      return;
    }
    if (kind === "motion") {
      const parsedFrames = Number(frames);
      const parsedAmplitude = Number(strength);
      if (!Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isFinite(parsedAmplitude) || parsedAmplitude < 0 || parsedAmplitude > 8) return;
      onApply(kind, { motion, frames: parsedFrames, amplitude: parsedAmplitude, seed: 1 });
      return;
    }
    const parsedStrength = Number(strength);
    if (!Number.isFinite(parsedStrength) || parsedStrength < 0 || parsedStrength > 8) return;
    onApply(kind, kind === "normal_map" ? { strength: parsedStrength } : kind === "rain" ? { color, intensity: Math.max(0, Math.min(1, parsedStrength / 8)), wind: 0, seed: 1 } : { color, thickness: Math.max(1, Math.min(8, Math.round(parsedStrength))) });
  }

  const showColor = kind !== "motion" && kind !== "upscale" && kind !== "seamless" && kind !== "reflection" && kind !== "day_night" && kind !== "background" && kind !== "cleanup";

  return (
    <PixelPanel title="SPRITE EFFECTS" accent="pink">
      <p className="muted">Aplica un efecto determinista a <strong>{assetName}</strong> y conserva el archivo original.</p>
      <PixelSelect label="EFFECT" value={kind} onChange={(event) => setKind(event.target.value as SpriteEffectKind)} disabled={disabled}>
        {EFFECTS.map((effect) => <option key={effect.value} value={effect.value}>{effect.label}</option>)}
      </PixelSelect>
      {kind === "motion" ? <PixelSelect label="MOTION" value={motion} onChange={(event) => setMotion(event.target.value)} disabled={disabled}><option value="idle">IDLE</option><option value="walk">WALK</option><option value="run">RUN</option><option value="jump">JUMP</option><option value="attack">ATTACK</option></PixelSelect> : kind === "background" ? <PixelBackgroundRemoval color={color} tolerance={Number(strength)} connectedOnly={connectedOnly} disabled={disabled} onColorChange={setColor} onToleranceChange={(value) => setStrength(String(value))} onConnectedOnlyChange={setConnectedOnly} /> : kind === "cleanup" ? <PixelCleanupControls minNeighbors={minNeighbors} iterations={cleanupIterations} disabled={disabled} onMinNeighborsChange={setMinNeighbors} onIterationsChange={setCleanupIterations} /> : showColor ? <PixelField label="COLOR" value={color} onChange={(event) => setColor(event.target.value)} disabled={disabled} /> : null}
      <div className="effect-controls">
        {kind === "particles" || kind === "motion" ? <>
          <PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} />
          {kind === "particles" ? <PixelField label="PARTICLES" type="number" min="1" max="128" value={particleCount} onChange={(event) => setParticleCount(event.target.value)} disabled={disabled} /> : <PixelSlider label={`AMPLITUDE · ${strength}`} min={0} max={8} step={1} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={disabled} />}
        </> : kind === "reflection" ? <>
          <PixelField label="WATERLINE" type="number" min="1" max="2048" value={waterline} onChange={(event) => setWaterline(event.target.value)} disabled={disabled} />
          <PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} />
          <PixelSlider label={`AMPLITUDE · ${strength}`} min={0} max={8} step={1} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={disabled} />
          <PixelSlider label={`OPACITY · ${opacity}`} min={0} max={1} step={0.05} value={Number(opacity)} onChange={(event) => setOpacity(event.target.value)} disabled={disabled} />
          <PixelField label="SEED" type="number" value={seed} onChange={(event) => setSeed(event.target.value)} disabled={disabled} />
        </> : kind === "caustics" ? <>
          <PixelField label="FRAMES" type="number" min="2" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} />
          <PixelSlider label={`INTENSITY · ${causticsIntensity}`} min={0} max={1} step={0.05} value={Number(causticsIntensity)} onChange={(event) => setCausticsIntensity(event.target.value)} disabled={disabled} />
          <PixelField label="SCALE" type="number" min="1" max="32" value={causticsScale} onChange={(event) => setCausticsScale(event.target.value)} disabled={disabled} />
          <PixelField label="SEED" type="number" value={causticsSeed} onChange={(event) => setCausticsSeed(event.target.value)} disabled={disabled} />
        </> : kind === "day_night" ? <>
          <PixelTimeline aria-label="DAY NIGHT STAGES" activeId="day" items={[{ id: "day", label: "DAY", state: "complete" }, { id: "sunset", label: "SUNSET", state: "current" }, { id: "night", label: "NIGHT", state: "pending" }, { id: "sunrise", label: "SUNRISE", state: "pending" }]} />
          <PixelField label="FRAMES" type="number" min="4" max="24" value={frames} onChange={(event) => setFrames(event.target.value)} disabled={disabled} />
          <PixelSlider label={`INTENSITY · ${dayNightIntensity}`} min={0.05} max={1} step={0.05} value={Number(dayNightIntensity)} onChange={(event) => setDayNightIntensity(event.target.value)} disabled={disabled} />
          <PixelField label="SEED" type="number" value={dayNightSeed} onChange={(event) => setDayNightSeed(event.target.value)} disabled={disabled} />
        </> : kind === "background" || kind === "cleanup" ? null : <PixelSlider label={kind === "upscale" ? `SCALE · ${strength}` : kind === "seamless" ? `SEAM WIDTH · ${strength}` : kind === "normal_map" ? `STRENGTH · ${strength}` : kind === "rain" ? `RAIN INTENSITY · ${strength}` : `THICKNESS · ${strength}`} min={kind === "upscale" ? 2 : kind === "normal_map" ? 0 : 1} max={kind === "upscale" ? 16 : kind === "seamless" ? 32 : 8} step={1} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={disabled} />}
      </div>
      <div className="tool-runner-actions"><PixelButton tone="pink" disabled={disabled} onClick={apply}>{busy ? "APPLYING..." : "APPLY SPRITE EFFECT"}</PixelButton></div>
    </PixelPanel>
  );
}
