import { PixelPanel, PixelQualityGate } from "@jdsalasc/pixel-ui";
import type { EnhancementApplyView } from "../domain/contracts.js";

export function QualityGatePanel({ quality }: { quality: EnhancementApplyView["quality"] }) {
  return <PixelPanel title="QUALITY REPORT" accent={quality.valid ? "cyan" : "amber"}><PixelQualityGate valid={quality.valid} violations={quality.violations} /></PixelPanel>;
}
