import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssetPreviewPanel } from "../src/components/AssetPreviewPanel.js";

describe("AssetPreviewPanel", () => {
  it("offers an accessible before/after control when an enhanced output exists", () => {
    const markup = renderToStaticMarkup(<AssetPreviewPanel before="original.png" after="enhanced.png" />);

    expect(markup).toContain('aria-label="Compare original and output"');
    expect(markup).toContain('aria-valuenow="50"');
    expect(markup).toContain('src="enhanced.png"');
  });

  it("keeps the original preview and guidance before processing", () => {
    const markup = renderToStaticMarkup(<AssetPreviewPanel before="original.png" />);

    expect(markup).toContain('alt="Referencia original"');
    expect(markup).toContain("Aplica el plan para comparar el resultado.");
    expect(markup).not.toContain("pixel-compare__range");
  });
});
