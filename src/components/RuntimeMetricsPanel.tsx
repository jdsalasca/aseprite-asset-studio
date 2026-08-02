import { PixelKpi, PixelPanel } from "@jdsalasc/pixel-ui";
import type { RuntimeMetrics } from "../application/runtimeMetrics.js";
export function RuntimeMetricsPanel({ metrics }: { metrics: RuntimeMetrics }) { return <PixelPanel title="RUNTIME METRICS" accent="cyan"><div className="runtime-metrics" aria-label="Runtime metrics"><PixelKpi label="OPS" value={metrics.total} /><PixelKpi label="OK" value={metrics.successes} /><PixelKpi label="FAIL" value={metrics.failures} tone="danger" /><PixelKpi label="AVG" value={`${metrics.averageMs}ms`} /></div></PixelPanel>; }
