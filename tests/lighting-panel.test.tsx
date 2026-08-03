import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LightingPanel } from "../src/components/LightingPanel.js";

describe("LightingPanel", () => {
  it("exposes directional lighting controls", () => {
    const markup = renderToStaticMarkup(<LightingPanel busy={false} online assetName="hero.png" onApply={() => undefined} />);

    expect(markup).toContain("DEPTH LIGHTING");
    expect(markup).toContain("SOUTH EAST · KEY LIGHT");
    expect(markup).toContain("AMBIENT (0–1)");
    expect(markup).toContain("APPLY DEPTH LIGHTING");
  });
});
