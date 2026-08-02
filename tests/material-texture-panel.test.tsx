import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MaterialTexturePanel } from "../src/components/MaterialTexturePanel.js";

describe("MaterialTexturePanel", () => {
  it("exposes material presets and deterministic controls", () => {
    const markup = renderToStaticMarkup(<MaterialTexturePanel busy={false} online assetName="beach.png" onApply={() => undefined} />);

    expect(markup).toContain("MATERIAL ENHANCER");
    expect(markup).toContain("WATER FLOW");
    expect(markup).toContain("INTENSITY (0–1)");
    expect(markup).toContain("APPLY MATERIAL PASS");
  });
});
