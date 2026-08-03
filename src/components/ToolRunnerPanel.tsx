import { useEffect, useState } from "react";
import { PixelButton, PixelNotice, PixelPanel, PixelSchemaHint, PixelSelect, PixelTextarea } from "@jdsalasc/pixel-ui";
import type { ToolDescriptor } from "../domain/contracts.js";

interface ToolRunnerPanelProps {
  tools: ToolDescriptor[];
  selectedToolName: string;
  initialArgs: Record<string, unknown>;
  busy: boolean;
  output: string | null;
  onToolChange(name: string): void;
  onRun(name: string, args: Record<string, unknown>): void;
}

export function ToolRunnerPanel({ tools, selectedToolName, initialArgs, busy, output, onToolChange, onRun }: ToolRunnerPanelProps) {
  const [argsText, setArgsText] = useState("{}");
  const [error, setError] = useState<string | null>(null);
  const selected = tools.find((tool) => tool.name === selectedToolName);

  useEffect(() => {
    setArgsText(JSON.stringify(initialArgs, null, 2));
    setError(null);
  }, [selectedToolName, initialArgs]);

  function run(): void {
    try {
      const parsed: unknown = JSON.parse(argsText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Los argumentos deben ser un objeto JSON");
      setError(null);
      onRun(selectedToolName, parsed as Record<string, unknown>);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
  }

  return <PixelPanel title="MCP TOOL RUNNER" accent="pink">
    <PixelSelect label="TOOL" value={selectedToolName} onChange={(event) => onToolChange(event.target.value)} disabled={busy || tools.length === 0}>
      {tools.map((tool) => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
    </PixelSelect>
    <p className="muted tool-description">{selected?.description ?? "Selecciona una herramienta tipada del MCP."}</p>
    <PixelSchemaHint schema={selected?.inputSchema} />
    <PixelTextarea label="ARGUMENTS JSON" value={argsText} onChange={(event) => setArgsText(event.target.value)} spellCheck={false} disabled={busy || !selectedToolName} />
    {error ? <PixelNotice tone="danger" title="INVALID JSON">{error}</PixelNotice> : null}
    <div className="tool-runner-actions"><PixelButton tone="pink" disabled={busy || !selectedToolName} onClick={run}>{busy ? "RUNNING..." : "RUN MCP TOOL"}</PixelButton></div>
    {output ? <details className="tool-output" open><summary>LAST TOOL OUTPUT</summary><pre>{output}</pre></details> : null}
  </PixelPanel>;
}
