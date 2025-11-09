/**
 * Performance Enhancement Module - PHASE 8
 *
 * Implements performance optimization strategies:
 * - Code splitting & lazy loading
 * - Caching strategy
 * - Resource optimization
 * - Database query optimization
 * - API rate limiting
 *
 * @module PerformanceEnhancement
 * @version 1.0.0
 */

import { logInfo, logWarn, logError } from "../utilities/logger.js";

class PerformanceEnhancement {
  constructor() {
    this.cache = new Map();
    this.rateLimits = new Map();
    this.metrics = {
      pageLoadTime: 0,
      apiCallCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTime: 0,
    };
    this.observerActive = false;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    logInfo("[PerformanceEnhancement] Initializing...");

    // Measure page load time
    if (window.performance && window.performance.timing) {
      window.addEventListener("load", () => {
        this.measurePageLoadTime();
      });
    }

    // Observe Core Web Vitals
    this.observeCoreWebVitals();

    // Setup resource timing
    this.setupResourceTiming();

    logInfo("[PerformanceEnhancement] Initialized");
  }

  /**
   * Measure page load time
   */
  measurePageLoadTime() {
    const { timing } = window.performance;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    this.metrics.pageLoadTime = loadTime;

    logInfo(`[PerformanceEnhancement] Page load time: ${loadTime}ms`);

    // Log performance metrics
    if (window.trackEvent) {
      window.trackEvent("performance_page_load", {
        value: loadTime,
        label: "page_load_time_ms",
      });
    }
  }

  /**
   * Observe Core Web Vitals (LCP, FID, CLS)
   */
  observeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          logInfo(
            `[PerformanceEnhancement] LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`,
          );

          if (window.trackEvent) {
            window.trackEvent("core_web_vitals_lcp", {
              value: lastEntry.renderTime || lastEntry.loadTime,
              label: "largest_contentful_paint",
            });
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        logWarn("[PerformanceEnhancement] LCP observer not supported");
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          logInfo(`[PerformanceEnhancement] CLS: ${clsValue}`);

          if (window.trackEvent) {
            window.trackEvent("core_web_vitals_cls", {
              value: clsValue,
              label: "cumulative_layout_shift",
            });
          }
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        logWarn("[PerformanceEnhancement] CLS observer not supported");
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            logInfo(
              `[PerformanceEnhancement] FID: ${entry.processingDuration}ms`,
            );

            if (window.trackEvent) {
              window.trackEvent("core_web_vitals_fid", {
                value: entry.processingDuration,
                label: "first_input_delay",
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (e) {
        logWarn("[PerformanceEnhancement] FID observer not supported");
      }
    }
  }

  /**
   * Setup resource timing analysis
   */
  setupResourceTiming() {
    if ("PerformanceObserver" in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const { duration } = entry;
            const size = entry.transferSize || 0;

            if (duration > 1000) {
              // Log slow resources (>1s)
              logWarn(
                `[PerformanceEnhancement] Slow resource: ${entry.name} (${duration.toFixed(2)}ms)`,
              );
            }

            logInfo(
              `[PerformanceEnhancement] Resource: ${entry.name} (${size}B, ${duration.toFixed(2)}ms)`,
            );
          });
        });
        resourceObserver.observe({ entryTypes: ["resource"] });
      } catch (e) {
        logWarn("[PerformanceEnhancement] Resource observer not supported");
      }
    }
  }

  /**
   * Cache management with TTL
   * @param {string} key - Cache key
   * @param {*} value - Cache value
   * @param {number} ttl - Time to live in milliseconds (default: 15 minutes)
   */
  setCache(key, value, ttl = 15 * 60 * 1000) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    logInfo(`[PerformanceEnhancement] Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/missing
   */
  getCache(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.metrics.cacheMisses++;
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      logInfo(`[PerformanceEnhancement] Cache EXPIRED: ${key}`);
      return null;
    }

    this.metrics.cacheHits++;
    logInfo(`[PerformanceEnhancement] Cache HIT: ${key}`);
    return item.value;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logInfo("[PerformanceEnhancement] Cache cleared");
  }

  /**
   * Rate limiting for API calls
   * @param {string} endpoint - API endpoint
   * @param {number} limit - Max requests per minute (default: 60)
   * @returns {boolean} True if request allowed, false if rate limited
   */
  checkRateLimit(endpoint, limit = 60) {
    const key = `rate_limit:${endpoint}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const requests = this.rateLimits.get(key);

    // Remove old requests
    const recentRequests = requests.filter((time) => time > oneMinuteAgo);
    this.rateLimits.set(key, recentRequests);

    if (recentRequests.length >= limit) {
      logWarn(`[PerformanceEnhancement] Rate limit exceeded for ${endpoint}`);
      return false;
    }

    recentRequests.push(now);
    return true;
  }

  /**
   * Lazy load modules dynamically
   * @param {string} modulePath - Path to module
   * @returns {Promise<Object>} Imported module
   */
  async lazyLoadModule(modulePath) {
    logInfo(`[PerformanceEnhancement] Lazy loading: ${modulePath}`);

    try {
      const module = await import(modulePath);
      logInfo(`[PerformanceEnhancement] Loaded: ${modulePath}`);
      return module;
    } catch (error) {
      console.error(
        `[PerformanceEnhancement] Failed to load ${modulePath}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Prefetch resources for better performance
   * @param {string} url - Resource URL
   * @param {string} type - Resource type (script, style, image, etc.)
   */
  prefetchResource(url, type = "script") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
    logInfo(`[PerformanceEnhancement] Prefetching ${type}: ${url}`);
  }

  /**
   * Preload critical resources
   * @param {string} url - Resource URL
   * @param {string} type - Resource type
   */
  preloadResource(url, type = "script") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
    logInfo(`[PerformanceEnhancement] Preloading ${type}: ${url}`);
  }

  /**
   * Batch API calls to reduce overhead
   * @param {Array<Function>} requests - Array of async functions
   * @returns {Promise<Array>} Results array
   */
  async batchRequests(requests) {
    logInfo(`[PerformanceEnhancement] Batching ${requests.length} requests`);

    try {
      const results = await Promise.all(requests.map((req) => req()));
      logInfo(
        `[PerformanceEnhancement] Batch complete: ${results.length} results`,
      );
      return results;
    } catch (error) {
      console.error("[PerformanceEnhancement] Batch request failed:", error);
      throw error;
    }
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} interval - Interval in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, interval = 300) {
    let lastTime = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastTime >= interval) {
        func(...args);
        lastTime = now;
      }
    };
  }

  /**
   * Optimize database queries
   * @param {Object} query - Firestore query
   * @param {number} limit - Result limit (default: 10)
   * @returns {Object} Optimized query
   */
  optimizeQuery(query, limit = 10) {
    // Add pagination, indexes, and limits
    return query.limit(limit);
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics object
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRatio:
        this.metrics.cacheHits /
        (this.metrics.cacheHits + this.metrics.cacheMisses || 1),
      memoryUsage: performance.memory
        ? {
          usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
          totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
          jsHeapSizeLimit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`,
        }
        : null,
    };
  }

  /**
   * Log performance report
   */
  logReport() {
    const metrics = this.getMetrics();
    console.group("[PerformanceEnhancement] REPORT");
    logInfo("Page Load Time:", metrics.pageLoadTime, "ms");
    logInfo("API Calls:", metrics.apiCallCount);
    logInfo("Cache Hits:", metrics.cacheHits);
    logInfo("Cache Misses:", metrics.cacheMisses);
    logInfo("Cache Hit Ratio:", `${(metrics.cacheHitRatio * 100).toFixed(2)}%`);
    if (metrics.memoryUsage) {
      logInfo("Memory Usage:", metrics.memoryUsage);
    }
    console.groupEnd();
  }

  /**
   * Initialize Service Worker for caching
   */
  async initServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        // Only register in production - development uses Vite
        if (import.meta.env.PROD) {
          const registration =
            await navigator.serviceWorker.register("/service-worker.js");
          logInfo(
            "[PerformanceEnhancement] Service Worker registered:",
            registration,
          );
          return registration;
        }
      } catch (error) {
        console.error(
          "[PerformanceEnhancement] Service Worker registration failed:",
          error,
        );
      }
    }
  }
}

// Export as singleton
const performanceEnhancement = new PerformanceEnhancement();
export default performanceEnhancement;
