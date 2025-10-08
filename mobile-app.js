/**
 * Mobile App Enhancement Module
 * Native-like mobile experience with touch gestures and offline-first
 */

class MobileAppEnhancement {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isStandalone = this.isStandaloneMode();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.swipeThreshold = 50;

    this.init();
  }

  /**
   * Initialize mobile enhancements
   */
  init() {
    if (this.isMobile) {
      this.setupTouchGestures();
      this.setupMobileUI();
      this.optimizeForMobile();
      this.setupPullToRefresh();
      this.preventDoubleTapZoom();

      console.log('✅ Mobile App Enhancement initialized');
    }
  }

  /**
   * Detect mobile device
   */
  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  }

  /**
   * Check if running in standalone mode (installed PWA)
   */
  isStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  /**
   * Setup touch gestures
   */
  setupTouchGestures() {
    document.addEventListener(
      'touchstart',
      (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchmove',
      (e) => {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener('touchend', () => {
      this.handleSwipe();
    });

    // Pinch to zoom on charts
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    console.log('✅ Touch gestures enabled');
  }

  /**
   * Handle swipe gestures
   */
  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > this.swipeThreshold) {
        if (deltaX > 0) {
          this.onSwipeRight();
        } else {
          this.onSwipeLeft();
        }
      }
    }
    // Vertical swipe
    else {
      if (Math.abs(deltaY) > this.swipeThreshold) {
        if (deltaY > 0) {
          this.onSwipeDown();
        } else {
          this.onSwipeUp();
        }
      }
    }
  }

  /**
   * Swipe right handler
   */
  onSwipeRight() {
    // Navigate back or open menu
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.style.transform = 'translateX(0)';
    }
  }

  /**
   * Swipe left handler
   */
  onSwipeLeft() {
    // Close menu or navigate forward
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.style.transform = 'translateX(-100%)';
    }
  }

  /**
   * Swipe down handler
   */
  onSwipeDown() {
    // Pull to refresh
    if (window.scrollY === 0) {
      this.refreshData();
    }
  }

  /**
   * Swipe up handler
   */
  onSwipeUp() {
    // Hide mobile menu if visible
  }

  /**
   * Setup mobile UI
   */
  setupMobileUI() {
    // Add mobile menu
    this.createMobileMenu();

    // Add bottom navigation
    this.createBottomNavigation();

    // Optimize table for mobile
    this.optimizeTableForMobile();

    // Add mobile-specific styles
    this.injectMobileStyles();
  }

  /**
   * Create mobile menu
   */
  createMobileMenu() {
    const menu = document.createElement('div');
    menu.id = 'mobileMenu';
    menu.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 80%;
      max-width: 300px;
      height: 100vh;
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.3);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 10000;
      overflow-y: auto;
    `;

    menu.innerHTML = `
      <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h2 style="margin: 0;">📱 Menu</h2>
      </div>
      <nav style="padding: 20px;">
        <a href="#" onclick="window.mobileApp.navigateTo('portfolio')" style="display: block; padding: 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
          💼 Portfolio
        </a>
        <a href="#" onclick="window.mobileApp.navigateTo('dashboard')" style="display: block; padding: 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
          📊 Dashboard
        </a>
        <a href="#" onclick="window.mobileApp.navigateTo('analytics')" style="display: block; padding: 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
          📈 Analytics
        </a>
        <a href="#" onclick="window.mobileApp.navigateTo('settings')" style="display: block; padding: 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
          ⚙️ Settings
        </a>
      </nav>
    `;

    document.body.appendChild(menu);

    // Add menu toggle button
    const menuBtn = document.createElement('button');
    menuBtn.id = 'mobileMenuBtn';
    menuBtn.style.cssText = `
      position: fixed;
      top: 15px;
      left: 15px;
      width: 50px;
      height: 50px;
      background: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 9999;
      display: ${this.isMobile ? 'flex' : 'none'};
      align-items: center;
      justify-content: center;
    `;
    menuBtn.textContent = '☰';
    menuBtn.onclick = () => this.toggleMenu();

    document.body.appendChild(menuBtn);
  }

  /**
   * Toggle mobile menu
   */
  toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      const isOpen = menu.style.transform === 'translateX(0px)';
      menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0)';
    }
  }

  /**
   * Navigate to section
   */
  navigateTo(section) {
    this.toggleMenu();

    // Smooth scroll to section
    const sections = {
      portfolio: 'portfolioCard',
      dashboard: 'dashboardContainer',
      analytics: 'chartsSection',
      settings: 'settingsSection',
    };

    const elementId = sections[section];
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Create bottom navigation
   */
  createBottomNavigation() {
    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: white;
      border-top: 1px solid #eee;
      display: ${this.isMobile ? 'flex' : 'none'};
      justify-content: space-around;
      align-items: center;
      z-index: 9998;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    `;

    const buttons = [
      { icon: '💼', label: 'Portfolio', action: () => this.navigateTo('portfolio') },
      { icon: '📊', label: 'Dashboard', action: () => this.navigateTo('dashboard') },
      { icon: '➕', label: 'Add', action: () => window.pridatFond?.() },
      {
        icon: '🔔',
        label: 'Alerts',
        action: () => window.notificationSystem?.toggleNotificationPanel(),
      },
      { icon: '⚙️', label: 'More', action: () => this.toggleMenu() },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement('button');
      button.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        transition: all 0.2s;
      `;
      button.innerHTML = `
        <span style="font-size: 1.5rem;">${btn.icon}</span>
        <span style="font-size: 0.7rem; margin-top: 2px;">${btn.label}</span>
      `;
      button.onclick = btn.action;

      button.addEventListener('touchstart', function () {
        this.style.transform = 'scale(0.95)';
      });
      button.addEventListener('touchend', function () {
        this.style.transform = 'scale(1)';
      });

      nav.appendChild(button);
    });

    document.body.appendChild(nav);
  }

  /**
   * Optimize table for mobile
   */
  optimizeTableForMobile() {
    if (!this.isMobile) {return;}

    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        table {
          font-size: 0.85rem;
        }
        
        th, td {
          padding: 8px 4px !important;
        }
        
        /* Make table scrollable horizontally */
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide less important columns on mobile */
        th:nth-child(3), td:nth-child(3),
        th:nth-child(4), td:nth-child(4) {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup pull to refresh
   */
  setupPullToRefresh() {
    let ptrElement;
    let startY = 0;
    let currentY = 0;
    let pulling = false;

    document.addEventListener(
      'touchstart',
      (e) => {
        if (window.scrollY === 0) {
          startY = e.touches[0].clientY;
          pulling = true;
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'touchmove',
      (e) => {
        if (!pulling) {return;}

        currentY = e.touches[0].clientY;
        const distance = currentY - startY;

        if (distance > 0) {
          if (!ptrElement) {
            ptrElement = this.createPullToRefreshIndicator();
          }

          ptrElement.style.transform = `translateY(${Math.min(distance, 80)}px)`;
          ptrElement.style.opacity = Math.min(distance / 80, 1);
        }
      },
      { passive: true }
    );

    document.addEventListener('touchend', async () => {
      if (pulling) {
        const distance = currentY - startY;

        if (distance > 80) {
          if (ptrElement) {
            ptrElement.textContent = '🔄 Refreshing...';
          }
          await this.refreshData();
        }

        if (ptrElement) {
          ptrElement.style.transform = 'translateY(-100px)';
          setTimeout(() => {
            ptrElement?.remove();
            ptrElement = null;
          }, 300);
        }

        pulling = false;
        startY = 0;
        currentY = 0;
      }
    });
  }

  /**
   * Create pull to refresh indicator
   */
  createPullToRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      padding: 10px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-size: 1.2rem;
      z-index: 10001;
      transition: transform 0.3s ease, opacity 0.3s ease;
    `;
    indicator.textContent = '⬇️ Pull to refresh';
    document.body.appendChild(indicator);
    return indicator;
  }

  /**
   * Refresh data
   */
  async refreshData() {
    try {
      // Trigger data refresh
      if (window.aktualizovatTabulku) {
        await window.aktualizovatTabulku();
      }

      // Show success
      this.showToast('✅ Data refreshed');
    } catch (error) {
      this.showToast('❌ Refresh failed');
      console.error('Refresh failed:', error);
    }
  }

  /**
   * Prevent double tap zoom
   */
  preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener(
      'touchend',
      (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );
  }

  /**
   * Optimize for mobile
   */
  optimizeForMobile() {
    // Add viewport meta if not exists
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Add mobile-optimized styles
    this.injectMobileStyles();

    // Optimize images
    this.optimizeImages();

    // Add haptic feedback
    this.setupHapticFeedback();
  }

  /**
   * Inject mobile styles
   */
  injectMobileStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        body {
          padding-bottom: 70px !important;
        }
        
        .card {
          margin: 10px !important;
          border-radius: 12px !important;
        }
        
        button {
          min-height: 44px;
          min-width: 44px;
        }
        
        input, select, textarea {
          font-size: 16px !important; /* Prevent zoom on focus */
        }
        
        /* Fixed elements positioning */
        .notification-toast {
          bottom: 80px !important;
        }
        
        /* Improve touch targets */
        a, button, input, select {
          -webkit-tap-highlight-color: rgba(0,0,0,0.1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize images for mobile
   */
  optimizeImages() {
    document.querySelectorAll('img').forEach((img) => {
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });
  }

  /**
   * Setup haptic feedback
   */
  setupHapticFeedback() {
    if ('vibrate' in navigator) {
      document.addEventListener('click', (e) => {
        if (e.target.matches('button, a')) {
          navigator.vibrate(10);
        }
      });
    }
  }

  /**
   * Show toast message
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: ${this.isMobile ? '80px' : '20px'};
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(0,0,0,0.8);
      color: white;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 10002;
      animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * Show install prompt
   */
  showInstallPrompt() {
    if (this.isMobile && !this.isStandalone) {
      const prompt = document.createElement('div');
      prompt.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10003;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      prompt.innerHTML = `
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Install App</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">Get the full experience</div>
        </div>
        <button onclick="this.closest('div').remove()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Install
        </button>
      `;
      document.body.appendChild(prompt);
    }
  }
}

// Global instance
window.mobileApp = new MobileAppEnhancement();

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✅ Mobile App Enhancement loaded');
