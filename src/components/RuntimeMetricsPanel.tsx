import { PixelPanel } from "@jdsalasc/pixel-ui";
import type { RuntimeMetrics } from "../application/runtimeMetrics.js";
export function RuntimeMetricsPanel({ metrics }: { metrics: RuntimeMetrics }) { return <PixelPanel title="RUNTIME METRICS" accent="cyan"><div className="runtime-metrics" aria-label="Runtime metrics"><span>OPS <strong>{metrics.total}</strong></span><span>OK <strong>{metrics.successes}</strong></span><span>FAIL <strong>{metrics.failures}</strong></span><span>AVG <strong>{metrics.averageMs}ms</strong></span></div></PixelPanel>; }
