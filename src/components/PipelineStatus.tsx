import { PixelBadge, PixelPanel } from "@jdsalasc/pixel-ui";
import type { PipelineStage } from "../application/pipelineStages.js";
export function PipelineStatus({ stages }: { stages: PipelineStage[] }) { return <PixelPanel title="PIPELINE STATUS" accent="pink"><div className="pipeline-status">{stages.map((stage) => <PixelBadge key={stage.id} tone={stage.state === "done" ? "cyan" : stage.state === "active" ? "pink" : "amber"}>{stage.label} · {stage.state.toUpperCase()}</PixelBadge>)}</div></PixelPanel>; }
