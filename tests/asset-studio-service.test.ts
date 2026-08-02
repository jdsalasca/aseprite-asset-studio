import { describe, expect, it } from "vitest";
import { AssetStudioService } from "../src/application/AssetStudioService.js";
import type { AssetGateway, AssetRecipeExecutionView, HealthResponse, RuntimeConfig, StoredAsset, ToolDescriptor, ToolRuntimeStatus } from "../src/domain/contracts.js";
import type { OperationEvent, OperationLogPort } from "../src/ports/OperationLogPort.js";

const status: ToolRuntimeStatus = { state: "online", pid: 7, serverName: "fake", serverVersion: "1", toolCount: 1, message: "online" };

class FakeLogger implements OperationLogPort {
  public events: OperationEvent[] = [];
  public record(event: OperationEvent): void { this.events.push(event); }
}

class FakeGateway implements AssetGateway {
  public calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  public async health(): Promise<HealthResponse> { return { ok: true, service: "fake", version: "1", runtime: status }; }
  public async config(): Promise<RuntimeConfig> { return { workspacePath: "", executablePath: "", gatewayPort: 3765 }; }
  public async startRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async stopRuntime(): Promise<ToolRuntimeStatus> { return status; }
  public async tools(): Promise<ToolDescriptor[]> { return [{ name: "apply_enhancement_plan" }]; }
  public async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    if (name === "suggest_enhancement_plan") return { content: [{ text: JSON.stringify({ planId: "plan-1", algorithmVersion: "v1", filename: args.filename, seed: 1, detectedSignals: [], warnings: [], passes: [], destructive: false }) }] };
    if (name === "apply_material_texture") return { content: [{ text: JSON.stringify({ outputFilename: args.output_filename, material: args.material, seed: args.seed, intensity: args.intensity, frames: 1, format: "png", sourcePreserved: true }) }] };
    if (name === "apply_depth_lighting") return { content: [{ text: JSON.stringify({ outputFilename: args.output_filename, direction: args.direction, strength: args.strength, ambient: args.ambient, frames: 1, format: "png", sourcePreserved: true }) }] };
    if (name === "apply_pixel_outline") return { content: [{ text: JSON.stringify({ operation: name, output: args.output_filename, frames: 1, format: "png", deterministic: true, sourcePreserved: true }) }] };
    if (name === "create_asset_recipe") return { content: [{ text: JSON.stringify({ recipeId: "recipe-1", schemaVersion: 1, algorithmVersion: "asset-recipe-v1", assetId: args.asset_id, inputFilename: args.input_filename, outputPrefix: args.output_prefix, format: "png", seed: args.seed, steps: [], sourcePreserved: true, deterministic: true }) }] };
    if (name === "execute_asset_recipe") return { content: [{ text: JSON.stringify({ ok: true, recipeId: "recipe-1", outputFilename: "hero-recipe-quality_gate.png", steps: [{ id: "outline", operation: "apply_pixel_outline", ok: true, message: "ok" }, { id: "quality_gate", operation: "run_asset_quality_gate", ok: true, message: "ok" }], sourcePreserved: true, deterministic: true } satisfies AssetRecipeExecutionView) }] };
    return { content: [{ text: JSON.stringify({ applied: { planId: "plan-1", outputFilename: args.output_filename, format: "png", frames: 1, passesApplied: ["cleanup"], sourcePreserved: true }, quality: { valid: true, violations: [] } }) }] };
  }
  public async upload(file: File): Promise<StoredAsset> { return { filename: file.name, path: `/tmp/${file.name}`, sizeBytes: file.size }; }
  public assetPreviewUrl(path: string): string { return `/preview?path=${encodeURIComponent(path)}`; }
}

describe("AssetStudioService enhancement use cases", () => {
  it("inspects before suggesting a typed plan", async () => {
    const gateway = new FakeGateway();
    const logger = new FakeLogger();
    const plan = await new AssetStudioService(gateway, logger).suggestEnhancementPlan("source.png");
    expect(plan.planId).toBe("plan-1");
    expect(gateway.calls.map((call) => call.name)).toEqual(["inspect_reference", "suggest_enhancement_plan"]);
    expect(logger.events).toHaveLength(2);
    expect(logger.events.map((event) => event.outcome)).toEqual(["started", "success"]);
    expect(logger.events[1]).toMatchObject({ operation: "suggest_enhancement_plan", outcome: "success" });
    expect(logger.events[1]?.correlationId).toContain("suggest_enhancement_plan-");
  });

  it("applies to a separate output and returns a typed outcome", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyEnhancementPlan("source.png", "source-enhanced.png");
    expect(result).toMatchObject({ outputFilename: "source-enhanced.png", sourcePreserved: true, quality: { valid: true } });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_enhancement_plan", args: { output_filename: "source-enhanced.png" } });
  });

  it("executes the material pass through the generic gateway contract", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyMaterialTexture("source.png", "source-textured.png", "water", 42, 0.7);

    expect(result).toMatchObject({ outputFilename: "source-textured.png", material: "water", seed: 42, intensity: 0.7, sourcePreserved: true });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_material_texture", args: { input_filename: "source.png", output_filename: "source-textured.png", material: "water" } });
  });

  it("executes the depth lighting pass through the generic gateway contract", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).applyDepthLighting("source.png", "source-lit.png", "north_east", 0.8, 0.25);

    expect(result).toMatchObject({ outputFilename: "source-lit.png", direction: "north_east", strength: 0.8, ambient: 0.25, sourcePreserved: true });
    expect(gateway.calls[0]).toMatchObject({ name: "apply_depth_lighting", args: { input_filename: "source.png", output_filename: "source-lit.png", direction: "north_east" } });
  });

  it("maps sprite effects and recipe creation through typed application ports", async () => {
    const gateway = new FakeGateway();
    const service = new AssetStudioService(gateway);
    const effect = await service.applySpriteEffect("outline", "source.png", "source-outline.png", { color: "#172033", thickness: 1 });
    const recipe = await service.createAssetRecipe({ assetId: "hero", filename: "source.png", outputPrefix: "hero", steps: ["outline", "quality_gate"], seed: 7, material: "earth", direction: "south_east" });

    expect(effect).toMatchObject({ operation: "apply_pixel_outline", output: "source-outline.png", sourcePreserved: true });
    expect(recipe).toMatchObject({ recipeId: "recipe-1", assetId: "hero", seed: 7, deterministic: true });
    expect(gateway.calls.map((call) => call.name)).toEqual(["apply_pixel_outline", "create_asset_recipe"]);
    expect(gateway.calls[1]?.args.steps).toEqual(["outline", "quality_gate"]);
  });

  it("executes a recipe through the shared MCP tool and preserves typed output", async () => {
    const gateway = new FakeGateway();
    const result = await new AssetStudioService(gateway).executeAssetRecipe({ assetId: "hero", filename: "source.png", outputPrefix: "hero-recipe", steps: ["outline", "quality_gate"], seed: 7, material: "earth", direction: "south_east" });

    expect(result).toMatchObject({ ok: true, recipeId: "recipe-1", outputFilename: "hero-recipe-quality_gate.png", sourcePreserved: true, deterministic: true });
    expect(gateway.calls[0]).toMatchObject({ name: "execute_asset_recipe", args: { asset_id: "hero", input_filename: "source.png", output_prefix: "hero-recipe" } });
  });

  it("surfaces the MCP error instead of replacing it with a missing-plan message", async () => {
    const gateway = new FakeGateway();
    gateway.callTool = async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      gateway.calls.push({ name, args });
      if (name === "suggest_enhancement_plan") return { isError: true, content: [{ type: "text", text: "La imagen no tiene una capa válida" }] };
      return { content: [{ text: "{}" }] };
    };

    await expect(new AssetStudioService(gateway).suggestEnhancementPlan("source.png"))
      .rejects.toThrow("La imagen no tiene una capa válida");
  });

  it("rejects malformed tool JSON with a diagnostic that identifies the protocol problem", async () => {
    const gateway = new FakeGateway();
    gateway.callTool = async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      gateway.calls.push({ name, args });
      return { content: [{ type: "text", text: "{not-json" }] };
    };

    await expect(new AssetStudioService(gateway).suggestEnhancementPlan("source.png"))
      .rejects.toThrow("JSON inválido");
  });
});
