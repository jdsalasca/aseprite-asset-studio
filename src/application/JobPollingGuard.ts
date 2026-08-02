/**
 * Invalidates in-flight status reads when the user changes the job lifecycle.
 * The guard is independent from HTTP, React, and any concrete provider.
 */
export class JobPollingGuard {
  private generation = 0;

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
