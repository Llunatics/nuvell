// Rate Limiter with Exponential Backoff for nuvelll

export interface RateLimiterOptions {
  minDelayMs?: number;
  maxConcurrency?: number;
}

export class DomainRateLimiter {
  private lastRequestTimes: Map<string, number> = new Map();
  private activeRequests: Map<string, number> = new Map();
  private defaultMinDelayMs: number;
  private defaultMaxConcurrency: number;

  constructor(options?: RateLimiterOptions) {
    this.defaultMinDelayMs = options?.minDelayMs ?? 2000;
    this.defaultMaxConcurrency = options?.maxConcurrency ?? 2;
  }

  /**
   * Waits until the domain is clear to make another request according to rate limit policy
   */
  public async acquire(domain: string, customDelayMs?: number): Promise<void> {
    const minDelay = customDelayMs ?? this.defaultMinDelayMs;
    
    // Wait until concurrency falls below limit
    while ((this.activeRequests.get(domain) || 0) >= this.defaultMaxConcurrency) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const now = Date.now();
    const lastTime = this.lastRequestTimes.get(domain) || 0;
    const elapsed = now - lastTime;

    if (elapsed < minDelay) {
      const waitTime = minDelay - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTimes.set(domain, Date.now());
    this.activeRequests.set(domain, (this.activeRequests.get(domain) || 0) + 1);
  }

  /**
   * Releases active request token for domain
   */
  public release(domain: string): void {
    const current = this.activeRequests.get(domain) || 1;
    this.activeRequests.set(domain, Math.max(0, current - 1));
  }

  /**
   * Calculates exponential backoff delay based on attempt index
   */
  public calculateBackoff(attempt: number, baseDelayMs = 2000, maxDelayMs = 30000): number {
    const exponential = baseDelayMs * Math.pow(2, attempt);
    // Add jitter +/- 20%
    const jitter = exponential * (0.8 + Math.random() * 0.4);
    return Math.min(jitter, maxDelayMs);
  }
}

export const domainRateLimiter = new DomainRateLimiter();
