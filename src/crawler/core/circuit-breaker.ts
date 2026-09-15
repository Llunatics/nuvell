// Circuit Breaker for Source Scrapers in nuvelll

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // e.g. 5 consecutive failures
  cooldownPeriodMs: number; // e.g. 5 minutes before trying half-open
}

export class CircuitBreaker {
  private failureCounts: Map<string, number> = new Map();
  private state: Map<string, CircuitState> = new Map();
  private openedAt: Map<string, number> = new Map();
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 4,
      cooldownPeriodMs: config?.cooldownPeriodMs ?? 1000 * 60 * 5, // 5 mins
    };
  }

  public getState(sourceId: string): CircuitState {
    const currentState = this.state.get(sourceId) || 'CLOSED';
    if (currentState === 'OPEN') {
      const openedTime = this.openedAt.get(sourceId) || 0;
      if (Date.now() - openedTime > this.config.cooldownPeriodMs) {
        this.state.set(sourceId, 'HALF_OPEN');
        return 'HALF_OPEN';
      }
    }
    return currentState;
  }

  public canRequest(sourceId: string): boolean {
    const state = this.getState(sourceId);
    return state === 'CLOSED' || state === 'HALF_OPEN';
  }

  public recordSuccess(sourceId: string): void {
    this.failureCounts.set(sourceId, 0);
    this.state.set(sourceId, 'CLOSED');
  }

  public recordFailure(sourceId: string): { tripped: boolean; failures: number } {
    const failures = (this.failureCounts.get(sourceId) || 0) + 1;
    this.failureCounts.set(sourceId, failures);

    if (failures >= this.config.failureThreshold) {
      this.state.set(sourceId, 'OPEN');
      this.openedAt.set(sourceId, Date.now());
      return { tripped: true, failures };
    }

    return { tripped: false, failures };
  }

  public reset(sourceId: string): void {
    this.failureCounts.set(sourceId, 0);
    this.state.set(sourceId, 'CLOSED');
    this.openedAt.delete(sourceId);
  }
}

export const circuitBreaker = new CircuitBreaker();
