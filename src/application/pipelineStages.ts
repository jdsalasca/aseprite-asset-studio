export type PipelineStageState = "done" | "active" | "pending";
export interface PipelineStage { id: string; label: string; state: PipelineStageState; }
export function buildPipelineStages(input: { online: boolean; hasAsset: boolean; hasPlan: boolean; hasQuality: boolean }): PipelineStage[] {
  return [
    { id: "connect", label: "CONNECT", state: input.online ? "done" : "active" },
    { id: "inspect", label: "INSPECT", state: input.hasPlan ? "done" : input.hasAsset && input.online ? "active" : "pending" },
    { id: "enhance", label: "ENHANCE", state: input.hasQuality ? "done" : input.hasPlan ? "active" : "pending" },
    { id: "quality", label: "QUALITY", state: input.hasQuality ? "done" : "pending" },
  ];
}
