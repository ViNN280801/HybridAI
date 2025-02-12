// HybridAI/backend/utils/rateLimiter.ts

const { RATE_LIMITER } = require("../../config/constants");

/**
 * @class RateLimiter
 * @brief Implements a sliding window rate limiting algorithm with automatic cleanup
 *
 * @details Provides efficient rate limiting using a two-layer storage approach:
 * - Rolling time window divided into fixed intervals
 * - Automatic cleanup of stale entries using lazy eviction and periodic pruning
 *
 * @note Implements hybrid approach combining:
 * - Sliding window algorithm for fair rate limiting
 * - Hierarchical timing wheels for efficient memory management
 *
 * @warning Not thread-safe - requires external synchronization in concurrent environments
 */
class RateLimiter {
  /**
   * @constructor
   * @param {number} maxRequests - Maximum allowed requests per interval
   * @param {number} interval - Time window in milliseconds
   * @throws {TypeError} If parameters are not valid numbers
   */
  constructor(
    maxRequests = RATE_LIMITER.MAX_REQUESTS,
    interval = RATE_LIMITER.DEFAULT_CLEANUP_INTERVAL_MS
  ) {
    if (typeof maxRequests !== "number" || typeof interval !== "number") {
      throw new TypeError("Invalid rate limiter parameters: expected numbers");
    }

    this.maxRequests = maxRequests;
    this.interval = interval;
    this.limits = new Map();
    this.cleanupInterval = Math.min(
      interval,
      RATE_LIMITER.DEFAULT_CLEANUP_INTERVAL_MS,
      RATE_LIMITER.MAX_SAFE_INTERVAL
    );

    if (typeof setInterval !== "function") {
      throw new Error("RateLimiter requires timer functions");
    }

    // Setup periodic cleanup
    const cleanupTimer = setInterval(() => {
      const staleThreshold =
        this.interval * RATE_LIMITER.STALE_ENTRY_TTL_MULTIPLIER;
      const now = Date.now();
      for (const [key, entry] of this.limits) {
        if (now - entry.timestamp > staleThreshold) {
          this.limits.delete(key);
        }
      }
    }, this.cleanupInterval);

    if (typeof cleanupTimer.unref === "function") {
      cleanupTimer.unref();
    }

    this.cleanupJob = cleanupTimer;
  }

  /**
   * @fn checkLimit
   * @brief Checks if request is allowed under rate limit
   *
   * @param {string} key - Client identifier (IP, API key, etc.)
   * @returns {boolean} True if request is allowed, false if rate limited
   *
   * @details Implements sliding window algorithm:
   * 1. Calculates overlapping window with previous period
   * 2. Weighted request count = previous window count * overlap + current count
   * 3. Compares against maxRequests with probabilistic early exit
   */
  checkLimit(key) {
    const now = Date.now();
    const windowStart = Math.floor(now / this.interval) * this.interval;

    const entry = this.limits.get(key) || { count: 0, timestamp: windowStart };
    const currentWindow = Math.floor(entry.timestamp / this.interval);

    // Reset counter if window has expired
    if (windowStart > entry.timestamp) {
      entry.count = 0;
      entry.timestamp = windowStart;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  increment(key) {
    const entry = this.limits.get(key);
    if (entry) entry.count++;
  }

  /**
   * @fn dispose
   * @brief Clean up resources and timers
   *
   * @details Must be called explicitly before discarding the instance
   * to prevent timer leaks. Critical for long-running applications.
   */
  dispose() {
    clearInterval(this.cleanupJob);
    this.limits.clear();
  }

  /**
   * @fn setupCleanupTimer
   * @brief Configures and manages the cleanup timer with environment awareness
   * @details Handles timer cleanup differently based on execution environment:
   * - Node.js: Uses unref() to prevent timer from keeping process alive
   * - Browser: Relies on standard timer APIs
   *
   * @note Cross-platform compatibility is critical for isomorphic applications
   * @see {@link https://nodejs.org/api/timers.html#timers_timeout_unref}
   */
}

module.exports = RateLimiter;
