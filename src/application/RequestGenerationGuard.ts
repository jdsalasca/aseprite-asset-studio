/**
 * Small provider-agnostic guard for asynchronous operations.
 * A newer request invalidates every older response without cancelling transport.
 */
export class RequestGenerationGuard {
  private generation = 0;

  public next(): number {
    this.generation += 1;
    return this.generation;
  }

  public invalidate(): void {
    this.generation += 1;
  }

  public snapshot(): number {
    return this.generation;
  }

  public accepts(snapshot: number): boolean {
    return snapshot === this.generation;
  }
}
