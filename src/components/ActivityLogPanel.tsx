import { useMemo, useState } from "react";
import { PixelField, PixelLogViewer, PixelPanel } from "@jdsalasc/pixel-ui";
import type { OperationLogEntry } from "../ports/OperationLogPort.js";
export function ActivityLogPanel({ entries }: { entries: OperationLogEntry[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => entries.filter((entry) => `${entry.operation} ${entry.outcome} ${entry.correlationId} ${entry.error ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [entries, query]);
  return <PixelPanel title="ACTIVITY LOG"><PixelField label="FILTER LOG" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="failure, tool name..." /><div className="activity-log"><PixelLogViewer maxEntries={50} entries={filtered.slice().reverse().map((entry) => ({ id: `${entry.correlationId}-${entry.outcome}`, timestamp: entry.timestamp, title: `${entry.outcome.toUpperCase()} · ${entry.operation}`, status: entry.outcome, detail: entry.error ?? `${entry.durationMs}ms · ${entry.correlationId}` }))} /></div></PixelPanel>;
}
