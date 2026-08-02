import { useState } from "react";
import { PixelButton, PixelField, PixelPaletteStrip, PixelPanel, PixelSlider } from "@jdsalasc/pixel-ui";

interface PaletteHarmonizerPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  palette: readonly string[];
  onApply(accentColor: string, strength: number, maxColors: number): void;
}

export function PaletteHarmonizerPanel({ busy, online, assetName, palette, onApply }: PaletteHarmonizerPanelProps) {
  const [accentColor, setAccentColor] = useState("#3155D8");
  const [strength, setStrength] = useState("0.65");
  const [maxColors, setMaxColors] = useState("16");
  function apply(): void {
    const parsedStrength = Number(strength);
    const parsedMaxColors = Number(maxColors);
    if (!/^#?(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(accentColor) || !Number.isFinite(parsedStrength) || parsedStrength < 0 || parsedStrength > 1 || !Number.isInteger(parsedMaxColors) || parsedMaxColors < 2 || parsedMaxColors > 64) return;
    onApply(accentColor, parsedStrength, parsedMaxColors);
  }

  return <PixelPanel title="PALETTE HARMONIZER" accent="pink">
    <p className="muted">Unifica la familia cromática de <strong>{assetName}</strong> sin modificar el origen y conserva la transparencia.</p>
    <div className="recipe-controls">
      <PixelField label="ACCENT COLOR" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} disabled={busy || !online} />
      <PixelField label="MAX COLORS" type="number" min={2} max={64} value={maxColors} onChange={(event) => setMaxColors(event.target.value)} disabled={busy || !online} />
    </div>
    <PixelSlider label={`STRENGTH (0–1) · ${strength}`} min={0} max={1} step={0.05} value={Number(strength)} onChange={(event) => setStrength(event.target.value)} disabled={busy || !online} />
    {palette.length ? <PixelPaletteStrip label="HARMONIZED PALETTE" colors={palette.map((color) => ({ color }))} /> : null}
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !online} onClick={apply}>{busy ? "HARMONIZING..." : "HARMONIZE PALETTE"}</PixelButton></div>
  </PixelPanel>;
}
