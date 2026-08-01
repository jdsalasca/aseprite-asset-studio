import { describe, expect, it } from "vitest";
import { buildLaunchPlan, validateLaunchConfig } from "../server/McpProcessController.js";

describe("MCP launcher", () => {
  it("uses the Windows npm launcher and forwards Aseprite configuration", () => {
    const plan = buildLaunchPlan({ workingDirectory: "C:\\work\\aseprite-mcp", environmentOverrides: { ASEPRITE_PATH: "C:\\apps\\Aseprite.exe" } }, "win32");
    expect(plan.command).toBe("npm.cmd");
    expect(plan.args).toEqual(["run", "mcp"]);
    expect(plan.cwd).toBe("C:\\work\\aseprite-mcp");
    expect(plan.env.ASEPRITE_PATH).toBe("C:\\apps\\Aseprite.exe");
  });

  it("does not create an empty Aseprite override", () => {
    const plan = buildLaunchPlan({ workingDirectory: "/work/aseprite-mcp", environmentOverrides: {} }, "linux");
    expect(plan.command).toBe("npm");
    expect(plan.env).toEqual({});
  });

  it("rejects a repository that cannot launch the MCP script", async () => {
    await expect(validateLaunchConfig({ mcpRepoPath: "C:\\does-not-exist", asepritePath: "", gatewayPort: 3765 })).resolves.toBe("La carpeta seleccionada no contiene package.json");
  });

  it("accepts the real aseprite-mcp repository contract", async () => {
    await expect(validateLaunchConfig({ mcpRepoPath: "C:\\Users\\jdsal\\Documents\\Programming-personal\\aseprite-mcp", asepritePath: "", gatewayPort: 3765 })).resolves.toBeUndefined();
  });
});
