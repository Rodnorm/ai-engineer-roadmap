export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF-OPEN";

export interface CircuitBreakerOptions {
  failureThresholdPercentage?: number; // e.g. 30%
  consecutiveFailureThreshold?: number; // e.g. 4
  cooldownPeriodMs?: number;            // e.g. 10000ms
  windowSize?: number;                  // e.g. 20
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private failureThresholdPercentage: number;
  private consecutiveFailureThreshold: number;
  private cooldownPeriodMs: number;
  private windowSize: number;

  private recentResults: boolean[] = []; // true = success, false = failure
  private consecutiveFailures = 0;
  private openedAt = 0;

  constructor(options?: CircuitBreakerOptions) {
    this.failureThresholdPercentage = options?.failureThresholdPercentage ?? 30;
    this.consecutiveFailureThreshold = options?.consecutiveFailureThreshold ?? 4;
    this.cooldownPeriodMs = options?.cooldownPeriodMs ?? 10000;
    this.windowSize = options?.windowSize ?? 20;
  }

  public getState(): CircuitBreakerState {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.openedAt >= this.cooldownPeriodMs) {
        this.state = "HALF-OPEN";
      }
    }
    return this.state;
  }

  public canExecute(): boolean {
    const currentState = this.getState();
    if (currentState === "CLOSED") return true;
    if (currentState === "HALF-OPEN") return true; // Probe request allowed
    return false; // OPEN
  }

  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.pushResult(true);

    if (this.state === "HALF-OPEN") {
      // Successful probe brings circuit breaker back to CLOSED
      this.state = "CLOSED";
    }
  }

  public recordFailure(): void {
    this.consecutiveFailures++;
    this.pushResult(false);

    if (this.state === "HALF-OPEN") {
      // Failed probe trips back to OPEN immediately
      this.state = "OPEN";
      this.openedAt = Date.now();
      return;
    }

    if (this.consecutiveFailures >= this.consecutiveFailureThreshold) {
      this.state = "OPEN";
      this.openedAt = Date.now();
      return;
    }

    // Check sliding window failure rate
    if (this.recentResults.length >= 5) {
      const failures = this.recentResults.filter((r) => !r).length;
      const failureRate = (failures / this.recentResults.length) * 100;
      if (failureRate >= this.failureThresholdPercentage) {
        this.state = "OPEN";
        this.openedAt = Date.now();
      }
    }
  }

  private pushResult(success: boolean): void {
    this.recentResults.push(success);
    if (this.recentResults.length > this.windowSize) {
      this.recentResults.shift();
    }
  }

  public reset(): void {
    this.state = "CLOSED";
    this.recentResults = [];
    this.consecutiveFailures = 0;
    this.openedAt = 0;
  }
}

export const globalCircuitBreaker = new CircuitBreaker();
