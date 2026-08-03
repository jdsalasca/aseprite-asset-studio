import { useMemo, useState } from "react";
import { PixelBadge, PixelField, PixelPanel, PixelToolCard } from "@jdsalasc/pixel-ui";
import type { ToolDescriptor } from "../domain/contracts.js";

export function ToolGrid({ tools, selectedName, onSelect }: { tools: ToolDescriptor[]; selectedName: string; onSelect(name: string): void }) {
  const [query, setQuery] = useState("");
  const filteredTools = useMemo(() => tools.filter((tool) => `${tool.name} ${tool.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 16), [query, tools]);
  return <PixelPanel title={`MCP CAPABILITIES · ${tools.length}`}><PixelField label="FILTER TOOLS" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lighting, terrain..." /><div className="tool-grid">{filteredTools.map((tool) => <PixelToolCard key={tool.name} name={tool.name} description={tool.description ?? "Typed asset operation"} status={<PixelBadge tone={tool.name === selectedName ? "pink" : "cyan"}>{tool.name === selectedName ? "SELECTED" : "READY"}</PixelBadge>} onRun={() => onSelect(tool.name)} />)}</div>{filteredTools.length === 0 ? <p className="muted">No hay herramientas que coincidan con ese filtro.</p> : null}{tools.length > 16 && !query ? <p className="muted">Showing first 16 tools. Usa MCP TOOL RUNNER para ejecutar cualquiera del catálogo completo.</p> : null}</PixelPanel>;
}
