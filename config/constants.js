// HybridAI/config/constants.js

/**
 * @file Application-wide constants and configuration parameters
 * @module AppConstants
 * @description Centralized configuration management for all magic numbers
 * and tunable system parameters
 */

/**
 * @namespace RATE_LIMITER
 * @description Rate limiter subsystem configuration
 */
const RATE_LIMITER = {
  /**
   * @member {number} MAX_REQUESTS
   * @default 100
   * @description Maximum number of requests per interval
   */
  MAX_REQUESTS: 100,

  /**
   * @member {number} DEFAULT_CLEANUP_INTERVAL_MS
   * @default 60000
   * @description Default interval for stale entry cleanup (1 minute)
   */
  DEFAULT_CLEANUP_INTERVAL_MS: 60_000,

  /**
   * @member {number} STALE_ENTRY_TTL_MULTIPLIER
   * @default 2
   * @description Multiplier for stale entry time-to-live calculation
   */
  STALE_ENTRY_TTL_MULTIPLIER: 2,

  /**
   * @member {number} MAX_SAFE_INTERVAL
   * @default 2147483647
   * @description Maximum safe interval for setInterval (24.8 days)
   * @see {@link https://nodejs.org/api/timers.html#timers_setinterval_callback_delay_args}
   */
  MAX_SAFE_INTERVAL: 2_147_483_647,
};

module.exports = {
  RATE_LIMITER,
};

const validateConstants = () => {
  if (
    RATE_LIMITER.DEFAULT_CLEANUP_INTERVAL_MS > RATE_LIMITER.MAX_SAFE_INTERVAL
  ) {
    throw new Error(
      "Cleanup interval exceeds safe maximum. See file config/constants.js"
    );
  }
};

validateConstants();
