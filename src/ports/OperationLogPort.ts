export type OperationOutcome = "started" | "success" | "failure";

export interface OperationEvent {
  operation: string;
  correlationId: string;
  durationMs: number;
  outcome: OperationOutcome;
  metadata?: Record<string, string | number | boolean>;
  error?: string;
}

export interface OperationLogPort {
  record(event: OperationEvent): void;
}

export interface OperationLogEntry extends OperationEvent {
  timestamp: string;
}

export interface OperationLogReaderPort {
  list(limit?: number): OperationLogEntry[];
  subscribe(listener: (entry: OperationLogEntry) => void): () => void;
}
