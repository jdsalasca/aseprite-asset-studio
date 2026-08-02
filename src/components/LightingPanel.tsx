import { useState } from "react";
import { PixelButton, PixelField, PixelPanel, PixelSelect } from "@jdsalasc/pixel-ui";
import type { LightDirection } from "../domain/contracts.js";

interface LightingPanelProps {
  busy: boolean;
  online: boolean;
  assetName: string;
  onApply(direction: LightDirection, strength: number, ambient: number): void;
}

const DIRECTIONS: Array<{ value: LightDirection; label: string }> = [
  { value: "south_east", label: "SOUTH EAST · KEY LIGHT" },
  { value: "south", label: "SOUTH · FRONT LIGHT" },
  { value: "north", label: "NORTH · RIM LIGHT" },
  { value: "east", label: "EAST · SIDE LIGHT" },
  { value: "west", label: "WEST · SIDE LIGHT" },
  { value: "north_east", label: "NORTH EAST · RIM" },
  { value: "north_west", label: "NORTH WEST · RIM" },
  { value: "south_west", label: "SOUTH WEST · KEY" },
];

export function LightingPanel({ busy, online, assetName, onApply }: LightingPanelProps) {
  const [direction, setDirection] = useState<LightDirection>("south_east");
  const [strength, setStrength] = useState("0.7");
  const [ambient, setAmbient] = useState("0.35");
  function apply(): void {
    const parsedStrength = Number(strength);
    const parsedAmbient = Number(ambient);
    if (!Number.isFinite(parsedStrength) || parsedStrength < 0 || parsedStrength > 1 || !Number.isFinite(parsedAmbient) || parsedAmbient < 0 || parsedAmbient > 1) return;
    onApply(direction, parsedStrength, parsedAmbient);
  }

  return <PixelPanel title="DEPTH LIGHTING" accent="cyan">
    <p className="muted">Sombrea y resalta <strong>{assetName}</strong> según una dirección de luz reproducible.</p>
    <PixelSelect label="LIGHT DIRECTION" value={direction} onChange={(event) => setDirection(event.target.value as LightDirection)} disabled={busy || !online}>
      {DIRECTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </PixelSelect>
    <div className="lighting-controls"><PixelField label="STRENGTH (0–1)" type="number" min="0" max="1" step="0.05" value={strength} onChange={(event) => setStrength(event.target.value)} disabled={busy || !online} /><PixelField label="AMBIENT (0–1)" type="number" min="0" max="1" step="0.05" value={ambient} onChange={(event) => setAmbient(event.target.value)} disabled={busy || !online} /></div>
    <div className="tool-runner-actions"><PixelButton tone="cyan" disabled={busy || !online} onClick={apply}>{busy ? "LIGHTING..." : "APPLY DEPTH LIGHTING"}</PixelButton></div>
  </PixelPanel>;
}
