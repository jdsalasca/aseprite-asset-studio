import { describe, expect, it } from "vitest";
import { InMemoryOperationLogger } from "../src/adapters/observability/InMemoryOperationLogger.js";

describe("InMemoryOperationLogger", () => {
  it("publishes bounded entries to live subscribers", () => {
    const logger = new InMemoryOperationLogger();
    const received: string[] = [];
    const unsubscribe = logger.subscribe((entry) => received.push(entry.operation));
    logger.record({ operation: "inspect_asset", correlationId: "run-1", durationMs: 0, outcome: "started" });
    logger.record({ operation: "inspect_asset", correlationId: "run-1", durationMs: 12, outcome: "success" });
    unsubscribe();
    logger.record({ operation: "ignored", correlationId: "run-2", durationMs: 0, outcome: "started" });

    expect(received).toEqual(["inspect_asset", "inspect_asset"]);
    expect(logger.list()).toHaveLength(3);
    expect(logger.list(1)[0]?.operation).toBe("ignored");
    expect(logger.list(0)).toEqual([]);
    expect(logger.list(Number.NaN)).toHaveLength(3);
  });
});
