// Compatibility facade for integrations that used the first gateway prototype.
export { StdioMcpSessionAdapter as McpProcessController, buildLaunchPlan } from "./adapters/StdioMcpSessionAdapter.js";
export { LocalMcpWorkspaceValidator as McpWorkspaceValidator } from "./adapters/LocalMcpWorkspaceValidator.js";

import type { RuntimeConfig } from "../src/domain/contracts.js";
import { LocalMcpWorkspaceValidator } from "./adapters/LocalMcpWorkspaceValidator.js";

export async function validateLaunchConfig(config: RuntimeConfig): Promise<string | undefined> {
  return new LocalMcpWorkspaceValidator().validate(config);
}
