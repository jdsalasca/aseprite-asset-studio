import { PixelBadge, PixelPanel } from "@jdsalasc/pixel-ui";
import type { EnhancementPlanView } from "../domain/contracts.js";

export function DecisionPlanPanel({ plan }: { plan: EnhancementPlanView }) {
  return <PixelPanel title={`DECISION PLAN · ${plan.planId}`} accent="pink"><div className="plan-meta"><PixelBadge tone="cyan">NON-DESTRUCTIVE</PixelBadge><span>seed {plan.seed} · {plan.algorithmVersion}</span></div>{plan.detectedSignals.length ? <p className="muted">Signals: {plan.detectedSignals.join(" · ")}</p> : null}{plan.warnings.length ? <p className="plan-warning"><PixelBadge tone="amber">WARNINGS</PixelBadge>{plan.warnings.join(" · ")}</p> : null}<div className="plan-passes">{plan.passes.map((pass) => <article key={pass.id}><PixelBadge tone={pass.id === "quality_gate" ? "cyan" : "pink"}>{pass.id}</PixelBadge><p>{pass.reason}</p></article>)}</div></PixelPanel>;
}
