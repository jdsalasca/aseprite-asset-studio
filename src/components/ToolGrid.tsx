import { PixelBadge, PixelPanel, PixelToolCard } from "@jdsalas/pixel-ui";
import type { McpToolSummary } from "../domain/contracts.js";

export function ToolGrid({ tools }: { tools: McpToolSummary[] }) {
  return <PixelPanel title={`MCP CAPABILITIES · ${tools.length}`}><div className="tool-grid">{tools.slice(0, 16).map((tool) => <PixelToolCard key={tool.name} name={tool.name} description={tool.description ?? "Typed asset operation"} status={<PixelBadge tone="cyan">READY</PixelBadge>} />)}</div>{tools.length > 16 ? <p className="muted">Showing first 16 tools. Agents can access the complete catalog through MCP.</p> : null}</PixelPanel>;
}
