// HybridAI/src/utils/rateLimiter.ts

export class RateLimiter {
  private limits: Map<string, { count: number; lastReset: number }>;

  constructor(
    private maxRequests: number,
    private interval: number
  ) {
    this.limits = new Map();
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now - entry.lastReset > this.interval) {
      this.limits.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }

  increment(key: string) {
    const entry = this.limits.get(key);
    if (entry) {
      entry.count++;
    }
  }
}
