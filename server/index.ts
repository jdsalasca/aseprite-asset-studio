import { createServer } from "node:http";
import { join } from "node:path";
import { ServerSetupService } from "../src/application/ServerSetupService.js";
import type { StudioConfig } from "../src/domain/contracts.js";
import { LocalMcpWorkspaceValidator } from "./adapters/LocalMcpWorkspaceValidator.js";
import { StdioMcpSessionAdapter } from "./adapters/StdioMcpSessionAdapter.js";
import { StudioHttpController } from "./StudioHttpController.js";
import { JsonStudioConfigStore } from "./persistence/JsonStudioConfigStore.js";
import { LocalAssetStore } from "./persistence/LocalAssetStore.js";

const port = Number(process.env.ASSET_STUDIO_GATEWAY_PORT ?? 3765);
const defaultConfig: StudioConfig = { mcpRepoPath: process.env.MCP_REPO_PATH ?? "", asepritePath: process.env.ASEPRITE_PATH ?? "", gatewayPort: port };
const setup = new ServerSetupService(new StdioMcpSessionAdapter(), new LocalMcpWorkspaceValidator(), new JsonStudioConfigStore(process.env.ASSET_STUDIO_CONFIG_PATH ?? join(process.cwd(), ".asset-studio", "config.json")), new LocalAssetStore(process.env.ASSET_STUDIO_UPLOAD_DIR ?? join(process.cwd(), ".asset-studio", "uploads")));
const controller = new StudioHttpController(setup, defaultConfig);

createServer((request, response) => { void controller.handle(request, response); }).listen(port, "127.0.0.1", () => console.log(`Asset Studio gateway listening on http://127.0.0.1:${port}`));
