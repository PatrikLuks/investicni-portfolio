/**
 * Activity Log & Audit Trail Module
 * Complete activity tracking with filtering and export
 */

class ActivityLogger {
  constructor() {
    this.activities = [];
    this.maxActivities = 1000;
    this.filters = {
      type: 'all',
      user: 'all',
      dateRange: 'all',
    };

    this.init();
  }

  /**
   * Initialize activity logger
   */
  init() {
    this.loadActivities();
    this.setupEventListeners();
    this.createActivityUI();

    console.log('✅ Activity Logger initialized');
  }

  /**
   * Log activity
   * @param {string} type - Activity type
   * @param {string} action - Action description
   * @param {Object} details - Additional details
   */
  log(type, action, details = {}) {
    const activity = {
      id: Date.now() + Math.random(),
      type,
      action,
      details,
      timestamp: new Date(),
      userId: window.collaborationManager?.userId || 'local-user',
      userName: window.collaborationManager?.userName || 'You',
      ip: 'local', // In production, get from server
      sessionId: this.getSessionId(),
    };

    this.activities.unshift(activity);

    // Trim if exceeds max
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }

    this.saveActivities();
    this.updateActivityFeed();

    // Trigger event for other modules
    window.dispatchEvent(new CustomEvent('activity-logged', { detail: activity }));
  }

  /**
   * Create activity UI
   */
  createActivityUI() {
    // Add activity log button
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {return;}

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {return;}

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {return;}

    const activityBtn = document.createElement('button');
    activityBtn.id = 'activityLogBtn';
    activityBtn.className = 'btn-icon';
    activityBtn.title = 'Activity Log';
    activityBtn.setAttribute('aria-label', 'Historie aktivit');
    activityBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    activityBtn.textContent = '📋';

    activityBtn.addEventListener('click', () => this.toggleActivityPanel());

    buttonContainer.appendChild(activityBtn);

    // Create activity panel
    this.createActivityPanel();
  }

  /**
   * Create activity panel
   */
  createActivityPanel() {
    const panel = document.createElement('div');
    panel.id = 'activityPanel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 450px;
      max-height: 700px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>📋</span>
            <span>Activity Log</span>
          </h3>
          <div style="display: flex; gap: 8px;">
            <button id="exportActivityBtn" title="Export" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">💾</button>
            <button id="clearActivityBtn" title="Clear" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #e74c3c;">🗑️</button>
            <button id="closeActivityPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">✕</button>
          </div>
        </div>
        
        <!-- Filters -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <select id="activityTypeFilter" style="padding: 6px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;">
            <option value="all">All Types</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="export">Export</option>
            <option value="import">Import</option>
            <option value="system">System</option>
          </select>
          
          <select id="activityUserFilter" style="padding: 6px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;">
            <option value="all">All Users</option>
          </select>
          
          <select id="activityDateFilter" style="padding: 6px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      
      <div id="activityFeed" style="max-height: 550px; overflow-y: auto; padding: 8px;"></div>
      
      <div style="padding: 12px; border-top: 1px solid #eee; background: #f8f9fa; text-align: center; font-size: 0.85rem; color: #666;">
        <span id="activityCount">0</span> activities logged
      </div>
    `;

    document.body.appendChild(panel);
    this.setupPanelListeners();
  }

  /**
   * Setup panel listeners
   */
  setupPanelListeners() {
    document.getElementById('closeActivityPanel')?.addEventListener('click', () => {
      this.toggleActivityPanel();
    });

    document.getElementById('exportActivityBtn')?.addEventListener('click', () => {
      this.exportActivities();
    });

    document.getElementById('clearActivityBtn')?.addEventListener('click', () => {
      if (confirm('Clear all activity logs?')) {
        this.clearActivities();
      }
    });

    // Filter listeners
    document.getElementById('activityTypeFilter')?.addEventListener('change', (e) => {
      this.filters.type = e.target.value;
      this.updateActivityFeed();
    });

    document.getElementById('activityUserFilter')?.addEventListener('change', (e) => {
      this.filters.user = e.target.value;
      this.updateActivityFeed();
    });

    document.getElementById('activityDateFilter')?.addEventListener('change', (e) => {
      this.filters.dateRange = e.target.value;
      this.updateActivityFeed();
    });
  }

  /**
   * Toggle activity panel
   */
  toggleActivityPanel() {
    const panel = document.getElementById('activityPanel');
    const isVisible = panel.style.display !== 'none';

    panel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      this.updateActivityFeed();
      this.updateUserFilter();
    }
  }

  /**
   * Update activity feed
   */
  updateActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) {return;}

    const filtered = this.filterActivities();

    if (filtered.length === 0) {
      feed.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📋</div>
          <div>No activities found</div>
        </div>
      `;
      return;
    }

    // Group by date
    const grouped = this.groupByDate(filtered);

    feed.innerHTML = Object.entries(grouped)
      .map(
        ([date, activities]) => `
      <div style="margin-bottom: 24px;">
        <div style="position: sticky; top: 0; background: white; padding: 8px 0; font-weight: 600; color: #667eea; font-size: 0.9rem; border-bottom: 2px solid #f0f0f0; margin-bottom: 8px;">
          ${date}
        </div>
        ${activities.map((activity) => this.renderActivity(activity)).join('')}
      </div>
    `
      )
      .join('');

    // Update count
    document.getElementById('activityCount').textContent = filtered.length;
  }

  /**
   * Render single activity
   */
  renderActivity(activity) {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      export: '📤',
      import: '📥',
      system: '⚙️',
      collaboration: '👥',
    };

    const colors = {
      create: '#2ecc71',
      update: '#3498db',
      delete: '#e74c3c',
      export: '#f39c12',
      import: '#9b59b6',
      system: '#95a5a6',
      collaboration: '#667eea',
    };

    return `
      <div style="
        display: flex;
        gap: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;
        border-left: 3px solid ${colors[activity.type] || '#95a5a6'};
      ">
        <div style="font-size: 1.5rem;">${icons[activity.type] || '📝'}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
            ${activity.action}
          </div>
          ${
  activity.details && Object.keys(activity.details).length > 0
    ? `
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 6px;">
              ${this.formatDetails(activity.details)}
            </div>
          `
    : ''
}
          <div style="display: flex; gap: 12px; font-size: 0.8rem; color: #999;">
            <span>${activity.userName}</span>
            <span>•</span>
            <span>${this.formatTime(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Filter activities
   */
  filterActivities() {
    let filtered = [...this.activities];

    // Filter by type
    if (this.filters.type !== 'all') {
      filtered = filtered.filter((a) => a.type === this.filters.type);
    }

    // Filter by user
    if (this.filters.user !== 'all') {
      filtered = filtered.filter((a) => a.userId === this.filters.user);
    }

    // Filter by date range
    if (this.filters.dateRange !== 'all') {
      const now = new Date();
      let cutoff;

      switch (this.filters.dateRange) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      if (cutoff) {
        filtered = filtered.filter((a) => new Date(a.timestamp) >= cutoff);
      }
    }

    return filtered;
  }

  /**
   * Group activities by date
   */
  groupByDate(activities) {
    const grouped = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      let label;
      if (dateKey.getTime() === today.getTime()) {
        label = 'Today';
      } else if (dateKey.getTime() === yesterday.getTime()) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('cs-CZ', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(activity);
    });

    return grouped;
  }

  /**
   * Update user filter dropdown
   */
  updateUserFilter() {
    const select = document.getElementById('activityUserFilter');
    if (!select) {return;}

    const users = new Set();
    this.activities.forEach((a) => {
      if (a.userId && a.userName) {
        users.add(JSON.stringify({ id: a.userId, name: a.userName }));
      }
    });

    const options = ['<option value="all">All Users</option>'];
    users.forEach((userStr) => {
      const user = JSON.parse(userStr);
      options.push(`<option value="${user.id}">${user.name}</option>`);
    });

    select.innerHTML = options.join('');
  }

  /**
   * Format details object
   */
  formatDetails(details) {
    return Object.entries(details)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        return `<strong>${key}:</strong> ${value}`;
      })
      .join(' • ');
  }

  /**
   * Format time
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Export activities
   */
  exportActivities() {
    const filtered = this.filterActivities();

    const csv = [
      ['Timestamp', 'Type', 'Action', 'User', 'Details'],
      ...filtered.map((a) => [
        new Date(a.timestamp).toISOString(),
        a.type,
        a.action,
        a.userName,
        JSON.stringify(a.details),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.log('export', 'Activity log exported');
  }

  /**
   * Clear activities
   */
  clearActivities() {
    this.activities = [];
    this.saveActivities();
    this.updateActivityFeed();
    this.log('system', 'Activity log cleared');
  }

  /**
   * Save activities to localStorage
   */
  saveActivities() {
    try {
      localStorage.setItem(
        'activity-log',
        JSON.stringify(this.activities.slice(0, this.maxActivities))
      );
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
  }

  /**
   * Load activities from localStorage
   */
  loadActivities() {
    try {
      const saved = localStorage.getItem('activity-log');
      if (saved) {
        this.activities = JSON.parse(saved).map((a) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Setup event listeners for auto-logging
   */
  setupEventListeners() {
    // Log portfolio changes
    window.addEventListener('portfolio-updated', () => {
      this.log('update', 'Portfolio updated');
    });

    // Log trades
    window.addEventListener('trade-executed', (e) => {
      this.log('create', 'Trade executed', e.detail);
    });

    // Log exports
    window.addEventListener('data-exported', (e) => {
      this.log('export', `Data exported to ${e.detail.format}`, e.detail);
    });

    // Log imports
    window.addEventListener('data-imported', (e) => {
      this.log('import', `Data imported from ${e.detail.source}`, e.detail);
    });

    // Log system events
    window.addEventListener('error', (e) => {
      this.log('system', 'Error occurred', { message: e.message });
    });
  }
}

// Global instance
window.activityLogger = new ActivityLogger();

// Log system start
window.activityLogger.log('system', 'Application started');

console.log('✅ Activity Logger loaded');
