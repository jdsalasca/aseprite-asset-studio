export type OperationOutcome = "success" | "failure";

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
