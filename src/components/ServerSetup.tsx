import { PixelBadge, PixelButton, PixelField, PixelPanel } from "@jdsalas/pixel-ui";
import type { McpStatus, StudioConfig } from "../domain/contracts.js";

interface ServerSetupProps {
  config: StudioConfig;
  status: McpStatus;
  busy: boolean;
  onConfigChange: (config: StudioConfig) => void;
  onStart: () => void;
  onStop: () => void;
}

export function ServerSetup({ config, status, busy, onConfigChange, onStart, onStop }: ServerSetupProps) {
  return (
    <PixelPanel title="MCP SERVER SETUP" accent="amber">
      <div className="setup-status"><PixelBadge tone={status.state === "online" ? "cyan" : status.state === "error" ? "danger" : "amber"}>{status.state.toUpperCase()}</PixelBadge><span>{status.message}</span></div>
      <div className="setup-fields">
        <PixelField label="ASEPRITE-MCP REPOSITORY" value={config.mcpRepoPath} onChange={(event) => onConfigChange({ ...config, mcpRepoPath: event.target.value })} placeholder="C:\\...\\aseprite-mcp" />
        <PixelField label="ASEPRITE EXECUTABLE (OPTIONAL)" value={config.asepritePath} onChange={(event) => onConfigChange({ ...config, asepritePath: event.target.value })} placeholder="C:\\...\\Aseprite.exe" />
      </div>
      <div className="setup-actions"><PixelButton tone="amber" disabled={busy || status.state === "online"} onClick={onStart}>{busy ? "STARTING..." : "START MCP"}</PixelButton><PixelButton tone="danger" disabled={busy || status.state !== "online"} onClick={onStop}>STOP MCP</PixelButton></div>
      <details className="setup-guide"><summary>Guía para configurar el servidor</summary><ol><li>Instala Node.js 24 o superior y Aseprite.</li><li>Selecciona la carpeta local del repositorio <code>aseprite-mcp</code>.</li><li>Si Aseprite no está en el PATH, selecciona su ejecutable.</li><li>Pulsa <strong>START MCP</strong>; el Studio lanzará el proceso por stdio y comprobará sus herramientas.</li></ol><p>El navegador nunca ejecuta comandos del sistema: el gateway local de Asset Studio realiza esta operación y mantiene el proceso aislado.</p></details>
    </PixelPanel>
  );
}
