import { useState } from "react";
import { PixelAmbientOcclusionControls, PixelBackgroundRemoval, PixelButton, PixelCleanupControls, PixelColorRampControls, PixelColorTemperatureControls, PixelDitherControls, PixelDustControls, PixelField, PixelFireControls, PixelFogControls, PixelGlowControls, PixelGrainControls, PixelLightningControls, PixelPanel, PixelRimLightControls, PixelSelect, PixelShadowControls, PixelSilhouetteControls, PixelSlider, PixelSmokeControls, PixelSnowControls, PixelSpecularHighlightControls, PixelTimeline, PixelWaterSprayControls, PixelWaveControls, PixelWindSwayControls } from "@jdsalasc/pixel-ui";
import type { PixelRimLightDirection, PixelWindSwayDirection } from "@jdsalasc/pixel-ui";
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
  { value: "fog", label: "FOG OVERLAY" },
  { value: "snow", label: "SNOW OVERLAY" },
  { value: "smoke", label: "SMOKE OVERLAY" },
  { value: "fire", label: "FIRE OVERLAY" },
  { value: "lightning", label: "LIGHTNING OVERLAY" },
  { value: "waves", label: "WAVES / FOAM OVERLAY" },
  { value: "water_spray", label: "WATER SPRAY OVERLAY" },
  { value: "dust", label: "DUST OVERLAY" },
  { value: "motion", label: "MOTION PACK" },
  { value: "wind_sway", label: "WIND SWAY" },
  { value: "upscale", label: "NEAREST UPSCALE" },
  { value: "seamless", label: "SEAMLESS TEXTURE" },
  { value: "reflection", label: "WATER REFLECTION" },
  { value: "caustics", label: "WATER CAUSTICS" },
  { value: "day_night", label: "DAY / NIGHT CYCLE" },
  { value: "background", label: "REMOVE BACKGROUND" },
  { value: "cleanup", label: "CLEAN ISOLATED PIXELS" },
  { value: "glow", label: "SPRITE GLOW" },
  { value: "silhouette", label: "SPRITE SILHOUETTE" },
  { value: "rim_light", label: "RIM LIGHT" },
  { value: "ambient_occlusion", label: "AMBIENT OCCLUSION" },
  { value: "specular_highlight", label: "SPECULAR HIGHLIGHT" },
  { value: "color_ramp", label: "COLOR RAMP" },
  { value: "grain", label: "MATERIAL GRAIN" },
  { value: "dither", label: "PIXEL DITHER" },
  { value: "color_temperature", label: "COLOR TEMPERATURE" },
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
  const [glowRadius, setGlowRadius] = useState(2);
  const [glowOpacity, setGlowOpacity] = useState(0.8);
  const [rimDirection, setRimDirection] = useState<PixelRimLightDirection>("north");
  const [rimStrength, setRimStrength] = useState(0.75);
  const [ambientRadius, setAmbientRadius] = useState(1);
  const [ambientStrength, setAmbientStrength] = useState(0.6);
  const [specularDirection, setSpecularDirection] = useState<PixelRimLightDirection>("north");
  const [specularRadius, setSpecularRadius] = useState(2);
  const [specularStrength, setSpecularStrength] = useState(0.8);
  const [rampShadowColor, setRampShadowColor] = useState("#101020");
  const [rampMidColor, setRampMidColor] = useState("#6080A0");
  const [rampHighlightColor, setRampHighlightColor] = useState("#FFFFFF");
  const [rampShadowThreshold, setRampShadowThreshold] = useState(0.3);
  const [rampHighlightThreshold, setRampHighlightThreshold] = useState(0.7);
  const [grainSeed, setGrainSeed] = useState(1);
  const [grainIntensity, setGrainIntensity] = useState(0.45);
  const [grainScale, setGrainScale] = useState(1);
  const [ditherDarkColor, setDitherDarkColor] = useState("#202030");
  const [ditherLightColor, setDitherLightColor] = useState("#F0E8C8");
  const [ditherStrength, setDitherStrength] = useState(1);
  const [ditherScale, setDitherScale] = useState(1);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [shadowOpacity, setShadowOpacity] = useState(0.45);
  const [temperature, setTemperature] = useState(0);
  const [temperatureIntensity, setTemperatureIntensity] = useState(0.7);
  const [silhouetteColor, setSilhouetteColor] = useState("#08111F");
  const [silhouetteOpacity, setSilhouetteOpacity] = useState(1);
  const [windDirection, setWindDirection] = useState<PixelWindSwayDirection>("right");
  const [fogDensity, setFogDensity] = useState(0.55);
  const [fogDrift, setFogDrift] = useState(0);
  const [fogSeed, setFogSeed] = useState(1);
  const [fogFrames, setFogFrames] = useState(8);
  const [snowDensity, setSnowDensity] = useState(0.55);
  const [snowWind, setSnowWind] = useState(0);
  const [snowSeed, setSnowSeed] = useState(1);
  const [snowFrames, setSnowFrames] = useState(8);
  const [smokeDensity, setSmokeDensity] = useState(0.55);
  const [smokeDrift, setSmokeDrift] = useState(0);
  const [smokeRise, setSmokeRise] = useState(0.65);
  const [smokeSeed, setSmokeSeed] = useState(1);
  const [smokeFrames, setSmokeFrames] = useState(8);
  const [fireIntensity, setFireIntensity] = useState(0.65);
  const [fireFlicker, setFireFlicker] = useState(0.55);
  const [fireSeed, setFireSeed] = useState(1);
  const [fireFrames, setFireFrames] = useState(8);
  const [lightningIntensity, setLightningIntensity] = useState(0.65);
  const [lightningFlash, setLightningFlash] = useState(0.65);
  const [lightningSeed, setLightningSeed] = useState(1);
  const [lightningFrames, setLightningFrames] = useState(8);
  const [waveDensity, setWaveDensity] = useState(0.65);
  const [waveAmplitude, setWaveAmplitude] = useState(2);
  const [waveSeed, setWaveSeed] = useState(1);
  const [waveFrames, setWaveFrames] = useState(8);
  const [sprayDensity, setSprayDensity] = useState(0.6);
  const [sprayDrift, setSprayDrift] = useState(0);
  const [spraySeed, setSpraySeed] = useState(1);
  const [sprayFrames, setSprayFrames] = useState(8);
  const [dustDensity, setDustDensity] = useState(0.6);
  const [dustDrift, setDustDrift] = useState(0);
  const [dustRise, setDustRise] = useState(0.5);
  const [dustSeed, setDustSeed] = useState(1);
  const [dustFrames, setDustFrames] = useState(8);

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
    if (kind === "glow") {
      onApply(kind, { color, radius: glowRadius, opacity: glowOpacity });
      return;
    }
    if (kind === "silhouette") {
      if (!Number.isFinite(silhouetteOpacity) || silhouetteOpacity < 0 || silhouetteOpacity > 1) return;
      onApply(kind, { color: silhouetteColor, opacity: silhouetteOpacity });
      return;
    }
    if (kind === "rim_light") {
      onApply(kind, { color, direction: rimDirection, strength: rimStrength });
      return;
    }
    if (kind === "ambient_occlusion") {
      onApply(kind, { color, radius: ambientRadius, strength: ambientStrength });
      return;
    }
    if (kind === "specular_highlight") {
      onApply(kind, { color, direction: specularDirection, radius: specularRadius, strength: specularStrength });
      return;
    }
    if (kind === "color_ramp") {
      if (rampShadowThreshold >= rampHighlightThreshold) return;
      onApply(kind, { shadow_color: rampShadowColor, mid_color: rampMidColor, highlight_color: rampHighlightColor, shadow_threshold: rampShadowThreshold, highlight_threshold: rampHighlightThreshold });
      return;
    }
    if (kind === "grain") {
      if (!Number.isInteger(grainSeed) || !Number.isFinite(grainIntensity) || grainIntensity < 0 || grainIntensity > 1 || !Number.isInteger(grainScale) || grainScale < 1 || grainScale > 8) return;
      onApply(kind, { seed: grainSeed, intensity: grainIntensity, scale: grainScale });
      return;
    }
    if (kind === "dither") {
      if (!Number.isFinite(ditherStrength) || ditherStrength < 0 || ditherStrength > 1 || !Number.isInteger(ditherScale) || ditherScale < 1 || ditherScale > 8) return;
      onApply(kind, { dark_color: ditherDarkColor, light_color: ditherLightColor, strength: ditherStrength, scale: ditherScale });
      return;
    }
    if (kind === "shadow") {
      if (!Number.isInteger(shadowOffsetX) || shadowOffsetX < -32 || shadowOffsetX > 32 || !Number.isInteger(shadowOffsetY) || shadowOffsetY < -32 || shadowOffsetY > 32 || !Number.isFinite(shadowOpacity) || shadowOpacity < 0 || shadowOpacity > 1) return;
      onApply(kind, { color: shadowColor, offset_x: shadowOffsetX, offset_y: shadowOffsetY, opacity: shadowOpacity });
      return;
    }
    if (kind === "color_temperature") {
      if (!Number.isFinite(temperature) || temperature < -1 || temperature > 1 || !Number.isFinite(temperatureIntensity) || temperatureIntensity < 0 || temperatureIntensity > 1) return;
      onApply(kind, { temperature, intensity: temperatureIntensity });
      return;
    }
    if (kind === "wind_sway") {
      const parsedFrames = Number(frames); const parsedSeed = Number(seed); const parsedAmplitude = Number(strength);
      if (!Number.isInteger(parsedFrames) || parsedFrames < 2 || parsedFrames > 24 || !Number.isInteger(parsedSeed) || !Number.isFinite(parsedAmplitude) || parsedAmplitude < 0 || parsedAmplitude > 8) return;
      onApply(kind, { frames: parsedFrames, seed: parsedSeed, amplitude: parsedAmplitude, direction: windDirection, delay_ms: 90 });
      return;
    }
    if (kind === "fog") {
      if (!Number.isInteger(fogFrames) || fogFrames < 1 || fogFrames > 24 || !Number.isInteger(fogSeed) || !Number.isFinite(fogDensity) || fogDensity < 0 || fogDensity > 1 || !Number.isFinite(fogDrift) || fogDrift < -1 || fogDrift > 1) return;
      onApply(kind, { frames: fogFrames, seed: fogSeed, density: fogDensity, drift: fogDrift, color, delay_ms: 90 });
      return;
    }
    if (kind === "snow") {
      if (!Number.isInteger(snowFrames) || snowFrames < 1 || snowFrames > 24 || !Number.isInteger(snowSeed) || !Number.isFinite(snowDensity) || snowDensity < 0 || snowDensity > 1 || !Number.isFinite(snowWind) || snowWind < -1 || snowWind > 1) return;
      onApply(kind, { frames: snowFrames, seed: snowSeed, density: snowDensity, wind: snowWind, color, delay_ms: 90 });
      return;
    }
    if (kind === "smoke") {
      if (!Number.isInteger(smokeFrames) || smokeFrames < 1 || smokeFrames > 24 || !Number.isInteger(smokeSeed) || !Number.isFinite(smokeDensity) || smokeDensity < 0 || smokeDensity > 1 || !Number.isFinite(smokeDrift) || smokeDrift < -1 || smokeDrift > 1 || !Number.isFinite(smokeRise) || smokeRise < 0 || smokeRise > 1) return;
      onApply(kind, { frames: smokeFrames, seed: smokeSeed, density: smokeDensity, drift: smokeDrift, rise: smokeRise, color, delay_ms: 90 });
      return;
    }
    if (kind === "fire") {
      if (!Number.isInteger(fireFrames) || fireFrames < 1 || fireFrames > 24 || !Number.isInteger(fireSeed) || !Number.isFinite(fireIntensity) || fireIntensity < 0 || fireIntensity > 1 || !Number.isFinite(fireFlicker) || fireFlicker < 0 || fireFlicker > 1) return;
      onApply(kind, { frames: fireFrames, seed: fireSeed, intensity: fireIntensity, flicker: fireFlicker, color, delay_ms: 90 });
      return;
    }
    if (kind === "lightning") {
      if (!Number.isInteger(lightningFrames) || lightningFrames < 1 || lightningFrames > 24 || !Number.isInteger(lightningSeed) || !Number.isFinite(lightningIntensity) || lightningIntensity < 0 || lightningIntensity > 1 || !Number.isFinite(lightningFlash) || lightningFlash < 0 || lightningFlash > 1) return;
      onApply(kind, { frames: lightningFrames, seed: lightningSeed, intensity: lightningIntensity, flash: lightningFlash, color, delay_ms: 90 });
      return;
    }
    if (kind === "waves") {
      if (!Number.isInteger(waveFrames) || waveFrames < 1 || waveFrames > 24 || !Number.isInteger(waveSeed) || !Number.isFinite(waveDensity) || waveDensity < 0 || waveDensity > 1 || !Number.isFinite(waveAmplitude) || waveAmplitude < 0 || waveAmplitude > 8) return;
      onApply(kind, { frames: waveFrames, seed: waveSeed, density: waveDensity, amplitude: waveAmplitude, color, delay_ms: 90 });
      return;
    }
    if (kind === "water_spray") {
      if (!Number.isInteger(sprayFrames) || sprayFrames < 1 || sprayFrames > 24 || !Number.isInteger(spraySeed) || !Number.isFinite(sprayDensity) || sprayDensity < 0 || sprayDensity > 1 || !Number.isFinite(sprayDrift) || sprayDrift < -1 || sprayDrift > 1) return;
      onApply(kind, { frames: sprayFrames, seed: spraySeed, density: sprayDensity, drift: sprayDrift, color, delay_ms: 90 });
      return;
    }
    if (kind === "dust") {
      if (!Number.isInteger(dustFrames) || dustFrames < 1 || dustFrames > 24 || !Number.isInteger(dustSeed) || !Number.isFinite(dustDensity) || dustDensity < 0 || dustDensity > 1 || !Number.isFinite(dustDrift) || dustDrift < -1 || dustDrift > 1 || !Number.isFinite(dustRise) || dustRise < 0 || dustRise > 1) return;
      onApply(kind, { frames: dustFrames, seed: dustSeed, density: dustDensity, drift: dustDrift, rise: dustRise, color, delay_ms: 90 });
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

  const showColor = kind !== "motion" && kind !== "wind_sway" && kind !== "fog" && kind !== "snow" && kind !== "smoke" && kind !== "fire" && kind !== "lightning" && kind !== "waves" && kind !== "water_spray" && kind !== "dust" && kind !== "upscale" && kind !== "seamless" && kind !== "reflection" && kind !== "day_night" && kind !== "background" && kind !== "cleanup" && kind !== "glow" && kind !== "rim_light" && kind !== "ambient_occlusion" && kind !== "specular_highlight" && kind !== "color_ramp" && kind !== "grain" && kind !== "dither" && kind !== "shadow" && kind !== "color_temperature";

  return (
    <PixelPanel title="SPRITE EFFECTS" accent="pink">
      <p className="muted">Aplica un efecto determinista a <strong>{assetName}</strong> y conserva el archivo original.</p>
      <PixelSelect label="EFFECT" value={kind} onChange={(event) => setKind(event.target.value as SpriteEffectKind)} disabled={disabled}>
        {EFFECTS.map((effect) => <option key={effect.value} value={effect.value}>{effect.label}</option>)}
      </PixelSelect>
      {kind === "motion" ? <PixelSelect label="MOTION" value={motion} onChange={(event) => setMotion(event.target.value)} disabled={disabled}><option value="idle">IDLE</option><option value="walk">WALK</option><option value="run">RUN</option><option value="jump">JUMP</option><option value="attack">ATTACK</option></PixelSelect> : kind === "wind_sway" ? <PixelWindSwayControls frames={Number(frames)} seed={Number(seed)} amplitude={Number(strength)} direction={windDirection} disabled={disabled} onFramesChange={(value) => setFrames(String(value))} onSeedChange={(value) => setSeed(String(value))} onAmplitudeChange={(value) => setStrength(String(value))} onDirectionChange={setWindDirection} /> : kind === "fog" ? <PixelFogControls frames={fogFrames} seed={fogSeed} density={fogDensity} drift={fogDrift} color={color} disabled={disabled} onFramesChange={setFogFrames} onSeedChange={setFogSeed} onDensityChange={setFogDensity} onDriftChange={setFogDrift} onColorChange={setColor} /> : kind === "snow" ? <PixelSnowControls frames={snowFrames} seed={snowSeed} density={snowDensity} wind={snowWind} color={color} disabled={disabled} onFramesChange={setSnowFrames} onSeedChange={setSnowSeed} onDensityChange={setSnowDensity} onWindChange={setSnowWind} onColorChange={setColor} /> : kind === "background" ? <PixelBackgroundRemoval color={color} tolerance={Number(strength)} connectedOnly={connectedOnly} disabled={disabled} onColorChange={setColor} onToleranceChange={(value) => setStrength(String(value))} onConnectedOnlyChange={setConnectedOnly} /> : kind === "cleanup" ? <PixelCleanupControls minNeighbors={minNeighbors} iterations={cleanupIterations} disabled={disabled} onMinNeighborsChange={setMinNeighbors} onIterationsChange={setCleanupIterations} /> : kind === "glow" ? <PixelGlowControls color={color} radius={glowRadius} opacity={glowOpacity} disabled={disabled} onColorChange={setColor} onRadiusChange={setGlowRadius} onOpacityChange={setGlowOpacity} /> : kind === "silhouette" ? <PixelSilhouetteControls color={silhouetteColor} opacity={silhouetteOpacity} disabled={disabled} onColorChange={setSilhouetteColor} onOpacityChange={setSilhouetteOpacity} /> : kind === "rim_light" ? <PixelRimLightControls color={color} direction={rimDirection} strength={rimStrength} disabled={disabled} onColorChange={setColor} onDirectionChange={setRimDirection} onStrengthChange={setRimStrength} /> : kind === "ambient_occlusion" ? <PixelAmbientOcclusionControls color={color} radius={ambientRadius} strength={ambientStrength} disabled={disabled} onColorChange={setColor} onRadiusChange={setAmbientRadius} onStrengthChange={setAmbientStrength} /> : kind === "specular_highlight" ? <PixelSpecularHighlightControls color={color} direction={specularDirection} radius={specularRadius} strength={specularStrength} disabled={disabled} onColorChange={setColor} onDirectionChange={setSpecularDirection} onRadiusChange={setSpecularRadius} onStrengthChange={setSpecularStrength} /> : kind === "color_ramp" ? <PixelColorRampControls shadowColor={rampShadowColor} midColor={rampMidColor} highlightColor={rampHighlightColor} shadowThreshold={rampShadowThreshold} highlightThreshold={rampHighlightThreshold} disabled={disabled} onShadowColorChange={setRampShadowColor} onMidColorChange={setRampMidColor} onHighlightColorChange={setRampHighlightColor} onShadowThresholdChange={setRampShadowThreshold} onHighlightThresholdChange={setRampHighlightThreshold} /> : kind === "grain" ? <PixelGrainControls seed={grainSeed} intensity={grainIntensity} scale={grainScale} disabled={disabled} onSeedChange={setGrainSeed} onIntensityChange={setGrainIntensity} onScaleChange={setGrainScale} /> : kind === "dither" ? <PixelDitherControls darkColor={ditherDarkColor} lightColor={ditherLightColor} strength={ditherStrength} scale={ditherScale} disabled={disabled} onDarkColorChange={setDitherDarkColor} onLightColorChange={setDitherLightColor} onStrengthChange={setDitherStrength} onScaleChange={setDitherScale} /> : kind === "shadow" ? <PixelShadowControls color={shadowColor} offsetX={shadowOffsetX} offsetY={shadowOffsetY} opacity={shadowOpacity} disabled={disabled} onColorChange={setShadowColor} onOffsetXChange={setShadowOffsetX} onOffsetYChange={setShadowOffsetY} onOpacityChange={setShadowOpacity} /> : kind === "color_temperature" ? <PixelColorTemperatureControls temperature={temperature} intensity={temperatureIntensity} disabled={disabled} onTemperatureChange={setTemperature} onIntensityChange={setTemperatureIntensity} /> : showColor ? <PixelField label="COLOR" value={color} onChange={(event) => setColor(event.target.value)} disabled={disabled} /> : null}
      {kind === "smoke" ? <PixelSmokeControls frames={smokeFrames} seed={smokeSeed} density={smokeDensity} drift={smokeDrift} rise={smokeRise} color={color} disabled={disabled} onFramesChange={setSmokeFrames} onSeedChange={setSmokeSeed} onDensityChange={setSmokeDensity} onDriftChange={setSmokeDrift} onRiseChange={setSmokeRise} onColorChange={setColor} /> : null}
      {kind === "fire" ? <PixelFireControls frames={fireFrames} seed={fireSeed} intensity={fireIntensity} flicker={fireFlicker} color={color} disabled={disabled} onFramesChange={setFireFrames} onSeedChange={setFireSeed} onIntensityChange={setFireIntensity} onFlickerChange={setFireFlicker} onColorChange={setColor} /> : null}
      {kind === "lightning" ? <PixelLightningControls frames={lightningFrames} seed={lightningSeed} intensity={lightningIntensity} flash={lightningFlash} color={color} disabled={disabled} onFramesChange={setLightningFrames} onSeedChange={setLightningSeed} onIntensityChange={setLightningIntensity} onFlashChange={setLightningFlash} onColorChange={setColor} /> : null}
      {kind === "waves" ? <PixelWaveControls frames={waveFrames} seed={waveSeed} density={waveDensity} amplitude={waveAmplitude} color={color} disabled={disabled} onFramesChange={setWaveFrames} onSeedChange={setWaveSeed} onDensityChange={setWaveDensity} onAmplitudeChange={setWaveAmplitude} onColorChange={setColor} /> : null}
      {kind === "water_spray" ? <PixelWaterSprayControls frames={sprayFrames} seed={spraySeed} density={sprayDensity} drift={sprayDrift} color={color} disabled={disabled} onFramesChange={setSprayFrames} onSeedChange={setSpraySeed} onDensityChange={setSprayDensity} onDriftChange={setSprayDrift} onColorChange={setColor} /> : null}
      {kind === "dust" ? <PixelDustControls frames={dustFrames} seed={dustSeed} density={dustDensity} drift={dustDrift} rise={dustRise} color={color} disabled={disabled} onFramesChange={setDustFrames} onSeedChange={setDustSeed} onDensityChange={setDustDensity} onDriftChange={setDustDrift} onRiseChange={setDustRise} onColorChange={setColor} /> : null}
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
        </> : kind === "wind_sway" || kind === "fog" || kind === "snow" || kind === "smoke" || kind === "fire" || kind === "lightning" || kind === "waves" || kind === "water_spray" || kind === "dust" || kind === "background" || kind === "cleanup" || kind === "glow" || kind === "silhouette" || kind === "rim_light" || kind === "ambient_occlusion" || kind === "specular_highlight" || kind === "color_ramp" || kind === "grain" || kind === "dither" || kind === "shadow" || kind === "color_temperature" ? null : <PixelSlider label={kind === "upscale" ? `SCALE · ${strength}` : kind === "seamless" ? `SEAM WIDTH · ${strength}` : kind === "normal_map" ? `STRENGTH · ${strength}` : kind === "rain" ? `RAIN INTENSITY · ${strength}` : `THICKNESS · ${strength}`} min={kind === "upscale" ? 2 : kind === "normal_map" ? 0 : 1} max={kind === "upscale" ? 16 : kind === "seamless" ? 32 : 8} step={1} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={disabled} />}
      </div>
      <div className="tool-runner-actions"><PixelButton tone="pink" disabled={disabled} onClick={apply}>{busy ? "APPLYING..." : "APPLY SPRITE EFFECT"}</PixelButton></div>
    </PixelPanel>
  );
}
