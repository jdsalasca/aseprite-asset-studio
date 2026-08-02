import { PixelBadge, PixelPanel, PixelToolCard } from "@jdsalasc/pixel-ui";
import type { ToolDescriptor } from "../domain/contracts.js";

export function ToolGrid({ tools, selectedName, onSelect }: { tools: ToolDescriptor[]; selectedName: string; onSelect(name: string): void }) {
  return <PixelPanel title={`MCP CAPABILITIES · ${tools.length}`}><div className="tool-grid">{tools.slice(0, 16).map((tool) => <PixelToolCard key={tool.name} name={tool.name} description={tool.description ?? "Typed asset operation"} status={<PixelBadge tone={tool.name === selectedName ? "pink" : "cyan"}>{tool.name === selectedName ? "SELECTED" : "READY"}</PixelBadge>} onRun={() => onSelect(tool.name)} />)}</div>{tools.length > 16 ? <p className="muted">Showing first 16 tools. Usa MCP TOOL RUNNER para ejecutar cualquiera del catálogo completo.</p> : null}</PixelPanel>;
}
