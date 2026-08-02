import type { OperationLogEntry } from "../ports/OperationLogPort.js";
export interface RuntimeMetrics { total: number; successes: number; failures: number; averageMs: number; }
export function summarizeRuntimeMetrics(entries: OperationLogEntry[]): RuntimeMetrics {
  const finished = entries.filter((entry) => entry.outcome !== "started");
  return { total: finished.length, successes: finished.filter((entry) => entry.outcome === "success").length, failures: finished.filter((entry) => entry.outcome === "failure").length, averageMs: finished.length ? Math.round(finished.reduce((sum, entry) => sum + entry.durationMs, 0) / finished.length) : 0 };
}
