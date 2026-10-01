/**
 * In-Memory Cache Service with TTL support
 * Used for caching inventory lists, dashboard stats, and frequently accessed data.
 * Auto-invalidation on writes. Falls back gracefully if Redis is not available.
 */
const logger = require('../utils/logger');

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

class MemoryCache {
  constructor() {
    this._store = new Map();
    this._stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };
    this._cleanupTimer = setInterval(() => this._evictExpired(), CLEANUP_INTERVAL_MS);
    this._cleanupTimer.unref();
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*|null} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) {
      this._stats.misses++;
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      this._stats.evictions++;
      this._stats.misses++;
      return null;
    }

    this._stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttlMs=DEFAULT_TTL_MS] - Time to live in milliseconds
   */
  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : null;
    this._store.set(key, { value, expiresAt });
    this._stats.sets++;
  }

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key to delete
   */
  del(key) {
    this._store.delete(key);
  }

  /**
   * Delete all keys matching a prefix pattern
   * @param {string} prefix - Key prefix to match (e.g., 'inventory:' or 'dashboard:')
   */
  delByPrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  flush() {
    const count = this._store.size;
    this._store.clear();
    logger.info(`Cache flushed: ${count} entries removed`);
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      ...this._stats,
      size: this._store.size,
      hitRate: this._stats.hits + this._stats.misses > 0
        ? (this._stats.hits / (this._stats.hits + this._stats.misses) * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  /**
   * Evict expired entries from the store
   */
  _evictExpired() {
    const now = Date.now();
    let evicted = 0;
    for (const [key, entry] of this._store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this._store.delete(key);
        evicted++;
      }
    }
    if (evicted > 0) {
      this._stats.evictions += evicted;
    }
  }

  /**
   * Gracefully cleanup the cache (call on app shutdown)
   */
  destroy() {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
      this._cleanupTimer = null;
    }
    this._store.clear();
  }
}

// Singleton instance
const cache = new MemoryCache();

// Cache key constants
const CACHE_KEYS = {
  INVENTORY_LIST: 'inventory:list',
  INVENTORY_SUMMARY: 'inventory:summary',
  DASHBOARD_STATS: 'dashboard:stats',
  ANALYTICS_PREFIX: 'analytics:',
  INVENTORY_PREFIX: 'inventory:',
  DASHBOARD_PREFIX: 'dashboard:'
};

module.exports = { cache, CACHE_KEYS, DEFAULT_TTL_MS };

