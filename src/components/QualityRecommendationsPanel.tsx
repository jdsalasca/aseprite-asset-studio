import { PixelPanel } from "@jdsalasc/pixel-ui";

interface QualityRecommendationsPanelProps { recommendations: readonly string[]; }

export function QualityRecommendationsPanel({ recommendations }: QualityRecommendationsPanelProps) {
  if (recommendations.length === 0) return null;
  return <PixelPanel title="QUALITY RECOMMENDATIONS" accent="amber">
    <ul className="quality-recommendations">{recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul>
  </PixelPanel>;
}
