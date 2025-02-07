// HybridAI/backend/utils/rateLimiter.ts

// Simple rate limiter class with detailed logging
class RateLimiter {
  constructor(maxRequests, interval) {
    this.maxRequests = maxRequests;
    this.interval = interval;
    this.limits = new Map();
  }

  checkLimit(key) {
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

  increment(key) {
    const entry = this.limits.get(key);
    if (entry) entry.count++;
  }
}

module.exports = RateLimiter;
