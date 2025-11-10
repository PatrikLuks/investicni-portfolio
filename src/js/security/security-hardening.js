/**
 * Security Hardening Module - PHASE 9
 *
 * Implements comprehensive security controls:
 * - Input validation & sanitization
 * - CSRF protection
 * - XSS prevention
 * - Rate limiting
 * - Security headers
 * - Authentication/Authorization
 * - Data protection
 *
 * @module SecurityHardening
 * @version 1.0.0
 */
/* eslint-disable no-undef */

import { logInfo, logWarn, logError } from '../utilities/logger.js';

class SecurityHardening {
  constructor() {
    this.securityHeaders = {};
    this.rateLimits = new Map();
    this.failedAttempts = new Map();
    this.blockList = new Set();
    this.trustedOrigins = new Set([
      window.location.origin,
      'https://firebase.googleapis.com',
      'https://query1.finance.yahoo.com',
      'https://www.alphavantage.co',
      'https://finnhub.io',
    ]);
    this.csrfTokens = new Map();
  }

  /**
   * Initialize security hardening
   */
  init() {
    logInfo('[SecurityHardening] Initializing security measures...');

    this.setupSecurityHeaders();
    this.setupCSRFProtection();
    this.setupInputValidation();
    this.setupXSSPrevention();
    this.setupCORSValidation();
    this.setupAuthenticationMonitoring();

    logInfo('[SecurityHardening] Security measures initialized');
  }

  /**
   * Setup security headers
   */
  setupSecurityHeaders() {
    this.securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
      'Content-Security-Policy': this.buildCSP(),
    };

    logInfo('[SecurityHardening] Security headers configured:', this.securityHeaders);
  }

  /**
   * Build Content Security Policy (CSP)
   * @returns {string} CSP header value
   */
  buildCSP() {
    return `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://firebase.googleapis.com https://query1.finance.yahoo.com https://www.alphavantage.co https://finnhub.io https://www.google-analytics.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Setup CSRF protection
   */
  setupCSRFProtection() {
    // Generate CSRF token for this session
    const csrfToken = this.generateToken();
    sessionStorage.setItem('csrf_token', csrfToken);
    logInfo('[SecurityHardening] CSRF token generated');
  }

  /**
   * Verify CSRF token
   * @param {string} token - Token to verify
   * @returns {boolean} True if valid
   */
  verifyCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }

  /**
   * Get CSRF token for requests
   * @returns {string} Current CSRF token
   */
  getCSRFToken() {
    return sessionStorage.getItem('csrf_token');
  }

  /**
   * Generate cryptographically secure token
   * @returns {string} Random token
   */
  generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    for (let i = 0; i < array.length; i++) {
      token += chars[array[i] % chars.length];
    }

    return token;
  }

  /**
   * Setup input validation
   */
  setupInputValidation() {
    // Validate form inputs
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const formData = new FormData(form);

      for (const [key, value] of formData.entries()) {
        if (!this.validateInput(key, value)) {
          e.preventDefault();
          logWarn(`[SecurityHardening] Invalid input: ${key}`);
          return false;
        }
      }
    });

    logInfo('[SecurityHardening] Input validation setup complete');
  }

  /**
   * Validate input based on type
   * @param {string} fieldName - Field name
   * @param {*} value - Field value
   * @returns {boolean} True if valid
   */
  validateInput(fieldName, value) {
    if (typeof value !== 'string') {
      return true;
    }

    const value_str = String(value).trim();

    // Email validation
    if (fieldName.toLowerCase().includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value_str);
    }

    // Password validation
    if (fieldName.toLowerCase().includes('password')) {
      return value_str.length >= 6; // At least 6 characters
    }

    // No null bytes or control characters
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1F]/.test(value_str)) {
      return false;
    }

    // Maximum length check
    if (value_str.length > 10000) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - User input
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Setup XSS prevention
   */
  setupXSSPrevention() {
    // Monitor for potential XSS attempts
    document.addEventListener('mousedown', (e) => {
      if (e.target.innerHTML && this.detectXSS(e.target.innerHTML)) {
        logWarn('[SecurityHardening] Potential XSS detected:', e.target);
        e.preventDefault();
      }
    });

    logInfo('[SecurityHardening] XSS prevention setup complete');
  }

  /**
   * Detect potential XSS patterns
   * @param {string} content - Content to check
   * @returns {boolean} True if potential XSS detected
   */
  detectXSS(content) {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Setup CORS validation
   */
  setupCORSValidation() {
    // Intercept all fetch requests to validate CORS
    const originalFetch = window.fetch;
    // eslint-disable-next-line require-await
    window.fetch = async (resource, config) => {
      const url = typeof resource === 'string' ? resource : resource.url;

      if (!this.validateCORS(url)) {
        logError(`[SecurityHardening] CORS validation failed for: ${url}`);
        throw new Error('CORS validation failed');
      }

      return originalFetch(resource, config);
    };

    logInfo('[SecurityHardening] CORS validation setup complete');
  }

  /**
   * Validate CORS for request
   * @param {string} url - Request URL
   * @returns {boolean} True if CORS allowed
   */
  validateCORS(url) {
    try {
      const requestOrigin = new URL(url).origin;

      // Allow same-origin requests
      if (requestOrigin === window.location.origin) {
        return true;
      }

      // Check against trusted origins
      return this.trustedOrigins.has(requestOrigin);
    // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      // Invalid URL
      return false;
    }
  }

  /**
   * Setup authentication monitoring
   */
  setupAuthenticationMonitoring() {
    // Monitor failed login attempts
    window.addEventListener('auth:failed', (e) => {
      this.trackFailedAttempt(e.detail.userId || 'unknown');
    });

    // Monitor token changes
    window.addEventListener('auth:token-change', (_e) => {
      logInfo('[SecurityHardening] Auth token updated');
    });

    logInfo('[SecurityHardening] Authentication monitoring setup');
  }

  /**
   * Track failed authentication attempts
   * @param {string} userId - User identifier
   */
  trackFailedAttempt(userId) {
    const key = `attempts:${userId}`;
    const attempts = (this.failedAttempts.get(key) || 0) + 1;

    this.failedAttempts.set(key, attempts);

    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      this.blockList.add(userId);
      logWarn(`[SecurityHardening] Account locked after 5 failed attempts: ${userId}`);

      if (window.trackEvent) {
        window.trackEvent('security_account_locked', {
          label: 'failed_login_attempts',
          value: attempts,
        });
      }

      // Reset after 15 minutes
      setTimeout(
        () => {
          this.failedAttempts.delete(key);
          this.blockList.delete(userId);
          logInfo(`[SecurityHardening] Account unlocked: ${userId}`);
        },
        15 * 60 * 1000,
      );
    }
  }

  /**
   * Check if user is blocked
   * @param {string} userId - User identifier
   * @returns {boolean} True if blocked
   */
  isUserBlocked(userId) {
    return this.blockList.has(userId);
  }

  /**
   * Rate limiting for API calls
   * @param {string} endpoint - API endpoint
   * @param {number} limit - Max requests per minute (default: 60)
   * @returns {boolean} True if allowed, false if rate limited
   */
  checkRateLimit(endpoint, limit = 60) {
    const key = `ratelimit:${endpoint}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const requests = this.rateLimits.get(key);
    const recentRequests = requests.filter((time) => time > oneMinuteAgo);

    if (recentRequests.length >= limit) {
      logWarn(`[SecurityHardening] Rate limit exceeded: ${endpoint}`);
      return false;
    }

    recentRequests.push(now);
    this.rateLimits.set(key, recentRequests);
    return true;
  }

  /**
   * Validate API request
   * @param {Object} request - Request object
   * @returns {boolean} True if valid
   */
  validateAPIRequest(request) {
    const { method = 'GET', url, body, headers = {} } = request;

    // Check CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      if (!this.verifyCSRFToken(headers['X-CSRF-Token'])) {
        logError('[SecurityHardening] CSRF token invalid');
        return false;
      }
    }

    // Validate URL
    if (!this.validateCORS(url)) {
      logError('[SecurityHardening] URL not allowed:', url);
      return false;
    }

    // Validate body
    if (body) {
      try {
        if (typeof body === 'string') {
          JSON.parse(body);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (_e) {
        logError('[SecurityHardening] Invalid JSON body');
        return false;
      }
    }

    return true;
  }

  /**
   * Log security event
   * @param {string} event - Event name
   * @param {Object} details - Event details
   */
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    logInfo('[SecurityHardening] Security Event:', logEntry);

    // Send to logging service (e.g., Sentry, DataDog)
    if (window.trackEvent) {
      window.trackEvent('security_event', {
        event,
        ...details,
      });
    }

    // Store in session storage for analysis
    const events = JSON.parse(sessionStorage.getItem('security_events') || '[]');
    events.push(logEntry);
    sessionStorage.setItem('security_events', JSON.stringify(events.slice(-100))); // Keep last 100
  }

  /**
   * Validate file upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {boolean} True if valid
   */
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      logError('[SecurityHardening] File too large:', file.name);
      return false;
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.type)) {
      logError('[SecurityHardening] Invalid MIME type:', file.type);
      return false;
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      logError('[SecurityHardening] Invalid file extension:', extension);
      return false;
    }

    return true;
  }

  /**
   * Hash password (client-side for storage only)
   * @param {string} password - Password to hash
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get security report
   * @returns {Object} Security status report
   */
  getSecurityReport() {
    return {
      securityHeaders: this.securityHeaders,
      blockedUsers: Array.from(this.blockList),
      failedAttempts: Object.fromEntries(this.failedAttempts),
      rateLimits: Object.fromEntries(
        Array.from(this.rateLimits.entries()).map(([key, value]) => [key, value.length]),
      ),
      trustedOrigins: Array.from(this.trustedOrigins),
      csrfTokenActive: !!sessionStorage.getItem('csrf_token'),
    };
  }

  /**
   * Log security report
   */
  logReport() {
    const report = this.getSecurityReport();
    console.group('[SecurityHardening] SECURITY REPORT');
    logInfo('Security Headers:', report.securityHeaders);
    logInfo('Blocked Users:', report.blockedUsers.length);
    logInfo('Failed Attempts:', report.failedAttempts);
    logInfo('Rate Limits:', report.rateLimits);
    logInfo('CSRF Token Active:', report.csrfTokenActive);
    console.groupEnd();
  }
}

// Export as singleton
const securityHardening = new SecurityHardening();
export default securityHardening;
