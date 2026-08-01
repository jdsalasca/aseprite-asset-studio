import type { OperationEvent, OperationLogPort } from "../../ports/OperationLogPort.js";

export class ConsoleOperationLogger implements OperationLogPort {
  public record(event: OperationEvent): void {
    const line = `[asset-studio] ${JSON.stringify(event)}`;
    if (event.outcome === "failure") console.error(line);
    else console.info(line);
  }
}
