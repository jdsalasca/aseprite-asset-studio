import { describe, expect, it } from "vitest";
import { buildLaunchPlan } from "../server/McpProcessController.js";

describe("MCP launcher", () => {
  it("uses the Windows npm launcher and forwards Aseprite configuration", () => {
    const plan = buildLaunchPlan({ mcpRepoPath: "C:\\work\\aseprite-mcp", asepritePath: "C:\\apps\\Aseprite.exe", gatewayPort: 3765 }, "win32");
    expect(plan.command).toBe("npm.cmd");
    expect(plan.args).toEqual(["run", "mcp"]);
    expect(plan.cwd).toBe("C:\\work\\aseprite-mcp");
    expect(plan.env.ASEPRITE_PATH).toBe("C:\\apps\\Aseprite.exe");
  });

  it("does not create an empty Aseprite override", () => {
    const plan = buildLaunchPlan({ mcpRepoPath: "/work/aseprite-mcp", asepritePath: "", gatewayPort: 3765 }, "linux");
    expect(plan.command).toBe("npm");
    expect(plan.env).toEqual({});
  });
});
