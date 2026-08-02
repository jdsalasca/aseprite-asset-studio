import type { OperationEvent, OperationLogEntry, OperationLogPort, OperationLogReaderPort } from "../../ports/OperationLogPort.js";

export class InMemoryOperationLogger implements OperationLogPort, OperationLogReaderPort {
  private readonly entries: OperationLogEntry[] = [];
  private readonly listeners = new Set<(entry: OperationLogEntry) => void>();

  public record(event: OperationEvent): void {
    const entry: OperationLogEntry = { ...event, timestamp: new Date().toISOString() };
    this.entries.push(entry);
    if (this.entries.length > 200) this.entries.splice(0, this.entries.length - 200);
    for (const listener of this.listeners) listener(entry);
  }

  public list(limit = 100): OperationLogEntry[] { return limit <= 0 ? [] : this.entries.slice(-limit); }

  public subscribe(listener: (entry: OperationLogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
