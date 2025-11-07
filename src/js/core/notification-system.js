/**
 * Advanced Notification System
 * Push notifications, in-app alerts, customizable preferences
 */

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 50;
    this.permission = 'default';
    this.preferences = this.loadPreferences();
    this.unreadCount = 0;
    this.serviceWorkerRegistration = null;

    this.init();
  }

  /**
   * Initialize notification system
   */
  async init() {
    try {
      // Check browser support

      if (!('Notification' in window)) {
        return;
      }

      // Get existing permission
      // eslint-disable-next-line no-undef
      this.permission = Notification.permission;

      // Register service worker for push notifications
      await this.registerServiceWorker();

      // Create notification UI
      this.createNotificationUI();

      // Load saved notifications
      this.loadNotifications();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Notification System initialization failed:', error);
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // First try to register service worker for push notifications
        if ('PushManager' in window) {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          });
          this.serviceWorkerRegistration = registration;
          console.log('Service Worker registered successfully');
        } else {
          // Fallback: just wait for ready
          const registration = await navigator.serviceWorker.ready;
          this.serviceWorkerRegistration = registration;
        }
      } catch (error) {
        console.warn('Service Worker registration failed (this is OK for development):', error.message);
        // Continue without service worker - not critical for functionality
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (this.permission === 'granted') {
      return true;
    }

    try {
      // eslint-disable-next-line no-undef
      const result = await Notification.requestPermission();
      this.permission = result;

      if (result === 'granted') {
        this.showInAppNotification('Notifications enabled!', 'success');
        return true;
      } else {
        this.showInAppNotification('Notifications blocked', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Show notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  // eslint-disable-next-line require-await
  async showNotification(title, options = {}) {
    const defaultOptions = {
      body: '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'portfolio-notification',
      requireInteraction: false,
      silent: false,
      ...options,
    };

    // Check preferences
    if (!this.shouldShowNotification(options.category)) {
      return;
    }

    // Store notification
    const notification = {
      id: Date.now(),
      title,
      ...defaultOptions,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(notification);
    this.unreadCount++;
    this.updateUnreadBadge();

    // Trim notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Save to localStorage
    this.saveNotifications();

    // Update UI
    this.renderNotifications();

    // Show in-app notification
    this.showInAppNotification(title, options.category || 'info', defaultOptions.body);

    // Show browser notification if permitted
    if (this.permission === 'granted') {
      this.showBrowserNotification(title, defaultOptions);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, options) {
    try {
      if (this.serviceWorkerRegistration) {
        // Use service worker for persistent notifications
        this.serviceWorkerRegistration.showNotification(title, options);
      } else {
        // Fallback to regular notification
        // eslint-disable-next-line no-undef
        const notification = new Notification(title, options);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  /**
   * Show in-app notification (toast)
   */
  showInAppNotification(title, category = 'info', body = '') {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      portfolio: '💼',
      trade: '📊',
      alert: '🔔',
    };

    const colors = {
      info: '#3498db',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      portfolio: '#667eea',
      trade: '#764ba2',
      alert: '#e74c3c',
    };

    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 400px;
      padding: 16px 20px;
      background: white;
      border-left: 4px solid ${colors[category] || colors.info};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10002;
      animation: slideInRight 0.3s ease;
      cursor: pointer;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <span style="font-size: 1.5rem;">${icons[category] || icons.info}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${title}</div>
          ${body ? `<div style="font-size: 0.9rem; color: #666;">${body}</div>` : ''}
        </div>
        <button class="toast-close-btn" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; padding: 0;">×</button>
      </div>
    `;

    document.body.appendChild(toast);

    // Add close button handler
    toast.querySelector('.toast-close-btn').addEventListener('click', () => toast.remove());

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        toast.remove();
      }
    });
  }

  /**
   * Create notification UI
   */
  createNotificationUI() {
    // Add notification bell button
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {
      return;
    }

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {
      return;
    }

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {
      return;
    }

    const notifBtn = document.createElement('button');
    notifBtn.id = 'notificationBtn';
    notifBtn.className = 'btn-icon';
    notifBtn.title = 'Notifications';
    notifBtn.setAttribute('aria-label', 'Notifikace');
    notifBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 8px; cursor: pointer; position: relative;';
    notifBtn.innerHTML =
      '🔔 <span id="notificationBadge" style="display: none; position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; min-width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; padding: 0 4px;"></span>';

    notifBtn.addEventListener('click', () => this.toggleNotificationPanel());

    buttonContainer.appendChild(notifBtn);

    // Create notification panel
    this.createNotificationPanel();
  }

  /**
   * Create notification panel
   */
  createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'notification-panel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
          <span>🔔</span>
          <span>Notifications</span>
        </h3>
        <div style="display: flex; gap: 8px;">
          <button id="markAllReadBtn" title="Mark all as read" style="background: none; border: none; color: #3498db; cursor: pointer; font-size: 0.9rem;">Mark all read</button>
          <button id="clearAllBtn" title="Clear all" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.9rem;">Clear</button>
          <button id="notificationSettingsBtn" title="Settings" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">⚙️</button>
          <button id="closeNotifPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">✕</button>
        </div>
      </div>
      
      <div id="notificationsList" style="max-height: 500px; overflow-y: auto;"></div>
      
      <div id="notificationSettings" style="display: none; padding: 16px; border-top: 1px solid #eee;">
        <h4 style="margin: 0 0 12px 0; font-size: 1rem;">Notification Preferences</h4>
        
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="enableBrowserNotif" ${this.preferences.browser ? 'checked' : ''}>
          <span>Enable browser notifications</span>
        </label>
        
        <div style="margin-top: 16px; margin-bottom: 12px; font-weight: 600; font-size: 0.9rem;">Categories:</div>
        
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="notifPortfolio" ${this.preferences.portfolio ? 'checked' : ''}>
          <span>💼 Portfolio updates</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="notifTrade" ${this.preferences.trade ? 'checked' : ''}>
          <span>📊 Trade alerts</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="notifAlert" ${this.preferences.alert ? 'checked' : ''}>
          <span>🔔 Price alerts</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="notifCollab" ${this.preferences.collaboration ? 'checked' : ''}>
          <span>👥 Collaboration</span>
        </label>
        
        <button id="saveNotifPreferences" style="width: 100%; margin-top: 12px; padding: 10px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Save Preferences</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Setup panel listeners
    this.setupPanelListeners();
  }

  /**
   * Setup panel event listeners
   */
  setupPanelListeners() {
    document.getElementById('closeNotifPanel')?.addEventListener('click', () => {
      this.toggleNotificationPanel();
    });

    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
      this.markAllAsRead();
    });

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
      // eslint-disable-next-line no-alert
      if (confirm('Clear all notifications?')) {
        this.clearAll();
      }
    });

    document.getElementById('notificationSettingsBtn')?.addEventListener('click', () => {
      this.toggleSettings();
    });

    document.getElementById('enableBrowserNotif')?.addEventListener('change', async (e) => {
      if (e.target.checked) {
        await this.requestPermission();
      }
    });

    document.getElementById('saveNotifPreferences')?.addEventListener('click', () => {
      this.savePreferences();
    });
  }

  /**
   * Toggle notification panel
   */
  toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const isVisible = panel.style.display !== 'none';

    panel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      this.renderNotifications();
      // Hide settings if open
      document.getElementById('notificationSettings').style.display = 'none';
    }
  }

  /**
   * Toggle settings
   */
  toggleSettings() {
    const settings = document.getElementById('notificationSettings');
    const list = document.getElementById('notificationsList');

    const isVisible = settings.style.display !== 'none';
    settings.style.display = isVisible ? 'none' : 'block';
    list.style.display = isVisible ? 'block' : 'none';
  }

  /**
   * Render notifications
   */
  renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) {
      return;
    }

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔔</div>
          <div>No notifications</div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.notifications
      .map(
        (notif) => `
      <div class="notification-item" data-id="${notif.id}" style="
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;
        ${notif.read ? 'opacity: 0.6;' : 'background: #f8f9fa;'}
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #333; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              ${!notif.read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: #3498db;"></div>' : ''}
              ${notif.title}
            </div>
            ${notif.body ? `<div style="font-size: 0.9rem; color: #666; margin-bottom: 6px;">${notif.body}</div>` : ''}
            <div style="font-size: 0.8rem; color: #999;">${this.formatTimestamp(notif.timestamp)}</div>
          </div>
          <button class="delete-notif-btn" data-notif-id="${notif.id}" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1rem; padding: 0;">×</button>
        </div>
      </div>
    `,
      )
      .join('');

    // Add click handlers to mark as read
    container.querySelectorAll('.notification-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        this.markAsRead(id);
      });
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateUnreadBadge();
      this.saveNotifications();
      this.renderNotifications();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead() {
    this.notifications.forEach((notif) => (notif.read = true));
    this.unreadCount = 0;
    this.updateUnreadBadge();
    this.saveNotifications();
    this.renderNotifications();
  }

  /**
   * Delete notification
   */
  deleteNotification(id) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      if (!this.notifications[index].read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
      this.updateUnreadBadge();
      this.saveNotifications();
      this.renderNotifications();
    }
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.updateUnreadBadge();
    this.saveNotifications();
    this.renderNotifications();
  }

  /**
   * Update unread badge
   */
  updateUnreadBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) {
      return;
    }

    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  /**
   * Save preferences
   */
  savePreferences() {
    this.preferences = {
      browser: document.getElementById('enableBrowserNotif')?.checked || false,
      portfolio: document.getElementById('notifPortfolio')?.checked || false,
      trade: document.getElementById('notifTrade')?.checked || false,
      alert: document.getElementById('notifAlert')?.checked || false,
      collaboration: document.getElementById('notifCollab')?.checked || false,
    };

    localStorage.setItem('notification-preferences', JSON.stringify(this.preferences));
    this.showInAppNotification('Preferences saved!', 'success');
    this.toggleSettings();
  }

  /**
   * Load preferences
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem('notification-preferences');
      return saved
        ? JSON.parse(saved)
        : {
          browser: false,
          portfolio: true,
          trade: true,
          alert: true,
          collaboration: true,
        };
    } catch (_error) {
      return {
        browser: false,
        portfolio: true,
        trade: true,
        alert: true,
        collaboration: true,
      };
    }
  }

  /**
   * Check if should show notification based on preferences
   */
  shouldShowNotification(category) {
    if (!category) {
      return true;
    }
    return this.preferences[category] !== false;
  }

  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      localStorage.setItem(
        'notifications',
        JSON.stringify(this.notifications.slice(0, this.maxNotifications)),
      );
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved).map((n) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        this.unreadCount = this.notifications.filter((n) => !n.read).length;
        this.updateUnreadBadge();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  /**
   * Setup event listeners for auto notifications
   */
  setupEventListeners() {
    // Portfolio change notifications
    window.addEventListener('portfolio-updated', () => {
      this.showNotification('Portfolio Updated', {
        body: 'Your portfolio data has been updated',
        category: 'portfolio',
      });
    });

    // Trade notifications
    window.addEventListener('trade-executed', (e) => {
      this.showNotification('Trade Executed', {
        body: `${e.detail.type}: ${e.detail.asset}`,
        category: 'trade',
      });
    });

    // Collaboration notifications
    window.addEventListener('user-joined', (e) => {
      this.showNotification('User Joined', {
        body: `${e.detail.userName} joined the session`,
        category: 'collaboration',
      });
    });
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;

    if (diff < 60000) {
      return 'Just now';
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    }

    return timestamp.toLocaleDateString('cs-CZ');
  }
}

// Global instance
window.notificationSystem = new NotificationSystem();

// Add animation styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyle);
