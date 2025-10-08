/**
 * Social Features Module
 * Portfolio sharing, following, and community features
 */

class SocialFeatures {
  constructor() {
    this.currentUser = {
      id: this.generateUserId(),
      username: `User_${ Math.random().toString(36).substring(2, 8)}`,
      followers: 0,
      following: 0,
      portfoliosShared: 0,
    };

    this.sharedPortfolios = new Map();
    this.following = new Set();
    this.followers = new Set();
    this.feed = [];

    this.init();
  }

  /**
   * Initialize social features
   */
  init() {
    try {
      this.loadFromStorage();
      this.createSocialUI();
      this.generateMockFeed();

      console.log('✅ Social Features initialized');
    } catch (error) {
      console.error('❌ Social Features initialization failed:', error);
    }
  }

  /**
   * Generate user ID
   */
  generateUserId() {
    return `user_${ Date.now().toString(36) }${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Share portfolio
   */
  sharePortfolio(visibility = 'public', message = '') {
    const data = window.getFondyData ? window.getFondyData() : [];

    if (data.length === 0) {
      alert('No portfolio data to share');
      return null;
    }

    const share = {
      id: this.generateShareId(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      data: JSON.parse(JSON.stringify(data)),
      visibility: visibility, // 'public', 'followers', 'private'
      message: message,
      timestamp: new Date(),
      likes: 0,
      comments: [],
      views: 0,
    };

    this.sharedPortfolios.set(share.id, share);
    this.currentUser.portfoliosShared++;

    // Add to feed
    this.addToFeed({
      type: 'portfolio_shared',
      user: this.currentUser.username,
      share: share,
      timestamp: new Date(),
    });

    this.saveToStorage();
    this.updateSocialUI();

    // Generate shareable link
    const shareLink = `${window.location.origin}${window.location.pathname}?share=${share.id}`;

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification('Portfolio shared successfully!', 'success');
    }

    return {
      shareId: share.id,
      link: shareLink,
    };
  }

  /**
   * Generate share ID
   */
  generateShareId() {
    return `share_${ Date.now().toString(36) }${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Follow user
   */
  followUser(userId) {
    if (userId === this.currentUser.id) {
      alert('Cannot follow yourself');
      return;
    }

    this.following.add(userId);
    this.currentUser.following++;

    // Add to feed
    this.addToFeed({
      type: 'user_followed',
      user: this.currentUser.username,
      followedUser: `User_${ userId.substring(5, 11)}`,
      timestamp: new Date(),
    });

    this.saveToStorage();
    this.updateSocialUI();

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification('Now following user', 'success');
    }
  }

  /**
   * Unfollow user
   */
  unfollowUser(userId) {
    this.following.delete(userId);
    this.currentUser.following--;

    this.saveToStorage();
    this.updateSocialUI();
  }

  /**
   * Like portfolio
   */
  likePortfolio(shareId) {
    const share = this.sharedPortfolios.get(shareId);
    if (share) {
      share.likes++;

      this.addToFeed({
        type: 'portfolio_liked',
        user: this.currentUser.username,
        share: share,
        timestamp: new Date(),
      });

      this.saveToStorage();
      this.updateSocialUI();
    }
  }

  /**
   * Comment on portfolio
   */
  commentOnPortfolio(shareId, comment) {
    const share = this.sharedPortfolios.get(shareId);
    if (share && comment.trim()) {
      share.comments.push({
        userId: this.currentUser.id,
        username: this.currentUser.username,
        comment: comment,
        timestamp: new Date(),
      });

      this.addToFeed({
        type: 'portfolio_commented',
        user: this.currentUser.username,
        share: share,
        comment: comment,
        timestamp: new Date(),
      });

      this.saveToStorage();
      this.updateSocialUI();
    }
  }

  /**
   * Copy trading (clone shared portfolio)
   */
  copyPortfolio(shareId) {
    const share = this.sharedPortfolios.get(shareId);
    if (!share) {
      alert('Shared portfolio not found');
      return;
    }

    // Clone portfolio data
    const clonedData = JSON.parse(JSON.stringify(share.data));

    // Update IDs to avoid conflicts
    clonedData.forEach((item) => {
      item.id = Date.now() + Math.random();
    });

    // Merge with current portfolio
    const currentData = window.getFondyData ? window.getFondyData() : [];
    const mergedData = [...currentData, ...clonedData];

    if (window.setFondyData) {
      window.setFondyData(mergedData);
    }

    if (window.aktualizovatTabulku) {
      window.aktualizovatTabulku();
    }

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        `Copied portfolio from ${share.username}`,
        'success'
      );
    }
  }

  /**
   * Add to feed
   */
  addToFeed(activity) {
    this.feed.unshift(activity);

    // Keep only last 100 activities
    if (this.feed.length > 100) {
      this.feed = this.feed.slice(0, 100);
    }
  }

  /**
   * Generate mock feed for demo
   */
  generateMockFeed() {
    const mockUsers = ['Investor_Pro', 'TraderJoe', 'BullMarket', 'PortfolioQueen', 'CryptoKing'];
    const mockActivities = [
      'shared a portfolio with +15.2% returns',
      'achieved 20% yearly return',
      'added 5 new stocks to their portfolio',
      'rebalanced their portfolio',
      'reached $100k portfolio value',
    ];

    for (let i = 0; i < 10; i++) {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];

      this.addToFeed({
        type: 'general',
        user: randomUser,
        activity: randomActivity,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }
  }

  /**
   * Create social UI
   */
  createSocialUI() {
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {return;}

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {return;}

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {return;}

    const socialBtn = document.createElement('button');
    socialBtn.id = 'socialBtn';
    socialBtn.className = 'btn-icon';
    socialBtn.title = 'Social Features';
    socialBtn.setAttribute('aria-label', 'Sociální funkce');
    socialBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    socialBtn.textContent = '👥';

    socialBtn.addEventListener('click', () => this.toggleSocialPanel());

    buttonContainer.appendChild(socialBtn);

    // Create social panel
    this.createSocialPanel();
  }

  /**
   * Create social panel
   */
  createSocialPanel() {
    const panel = document.createElement('div');
    panel.id = 'socialPanel';
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
      <div style="padding: 16px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>👥</span>
            <span>Social</span>
          </h3>
          <button id="closeSocialPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: white;">✕</button>
        </div>
        
        <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 0.9rem;">
          <div>
            <strong>${this.currentUser.followers}</strong> Followers
          </div>
          <div>
            <strong>${this.currentUser.following}</strong> Following
          </div>
          <div>
            <strong>${this.currentUser.portfoliosShared}</strong> Shares
          </div>
        </div>
      </div>
      
      <div style="display: flex; border-bottom: 1px solid #eee;">
        <button id="tabFeed" class="social-tab active" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 2px solid #667eea; cursor: pointer; font-weight: 600;">
          Feed
        </button>
        <button id="tabShare" class="social-tab" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 2px solid transparent; cursor: pointer;">
          Share
        </button>
        <button id="tabExplore" class="social-tab" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 2px solid transparent; cursor: pointer;">
          Explore
        </button>
      </div>
      
      <div id="socialContent" style="max-height: 550px; overflow-y: auto; padding: 16px;">
        <!-- Dynamic content -->
      </div>
    `;

    document.body.appendChild(panel);
    this.setupSocialPanelListeners();
    this.showFeedTab();
  }

  /**
   * Setup social panel listeners
   */
  setupSocialPanelListeners() {
    document.getElementById('closeSocialPanel')?.addEventListener('click', () => {
      this.toggleSocialPanel();
    });

    document.getElementById('tabFeed')?.addEventListener('click', () => {
      this.showFeedTab();
    });

    document.getElementById('tabShare')?.addEventListener('click', () => {
      this.showShareTab();
    });

    document.getElementById('tabExplore')?.addEventListener('click', () => {
      this.showExploreTab();
    });
  }

  /**
   * Toggle social panel
   */
  toggleSocialPanel() {
    const panel = document.getElementById('socialPanel');
    const isVisible = panel.style.display !== 'none';

    panel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      this.updateSocialUI();
    }
  }

  /**
   * Show feed tab
   */
  showFeedTab() {
    this.setActiveTab('tabFeed');

    const content = document.getElementById('socialContent');
    if (!content) {return;}

    if (this.feed.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📰</div>
          <div>No activity yet</div>
          <div style="font-size: 0.85rem; margin-top: 8px;">Share your portfolio or follow others to see updates</div>
        </div>
      `;
      return;
    }

    content.innerHTML = this.feed.map((activity) => this.renderFeedItem(activity)).join('');
  }

  /**
   * Render feed item
   */
  renderFeedItem(activity) {
    const timeAgo = this.getTimeAgo(activity.timestamp);

    let icon = '📊';
    let text = '';

    switch (activity.type) {
      case 'portfolio_shared':
        icon = '📤';
        text = `<strong>${activity.user}</strong> shared their portfolio`;
        break;
      case 'portfolio_liked':
        icon = '❤️';
        text = `<strong>${activity.user}</strong> liked a portfolio`;
        break;
      case 'portfolio_commented':
        icon = '💬';
        text = `<strong>${activity.user}</strong> commented: "${activity.comment}"`;
        break;
      case 'user_followed':
        icon = '👥';
        text = `<strong>${activity.user}</strong> followed <strong>${activity.followedUser}</strong>`;
        break;
      default:
        text = `<strong>${activity.user}</strong> ${activity.activity}`;
    }

    return `
      <div style="
        padding: 16px;
        margin-bottom: 12px;
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
      ">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 2rem;">${icon}</div>
          <div style="flex: 1;">
            <div style="color: #333; margin-bottom: 6px;">${text}</div>
            <div style="font-size: 0.75rem; color: #999;">${timeAgo}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show share tab
   */
  showShareTab() {
    this.setActiveTab('tabShare');

    const content = document.getElementById('socialContent');
    if (!content) {return;}

    content.innerHTML = `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 16px 0;">Share Your Portfolio</h4>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: #666;">
            Message (optional):
          </label>
          <textarea 
            id="shareMessage" 
            placeholder="Add a message about your portfolio..."
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 80px;"
          ></textarea>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: #666;">
            Visibility:
          </label>
          <select 
            id="shareVisibility" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;"
          >
            <option value="public">🌍 Public - Anyone can see</option>
            <option value="followers">👥 Followers Only</option>
            <option value="private">🔒 Private - Link only</option>
          </select>
        </div>
        
        <button 
          id="btnSharePortfolio" 
          style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;"
        >
          📤 Share Portfolio
        </button>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px 0; color: #666;">Your Shared Portfolios:</h4>
        <div id="sharedPortfoliosList">
          ${this.renderSharedPortfolios()}
        </div>
      </div>
    `;

    document.getElementById('btnSharePortfolio')?.addEventListener('click', () => {
      const message = document.getElementById('shareMessage').value;
      const visibility = document.getElementById('shareVisibility').value;

      const result = this.sharePortfolio(visibility, message);

      if (result) {
        // Show share link
        prompt('Share this link:', result.link);
        this.showShareTab(); // Refresh
      }
    });
  }

  /**
   * Render shared portfolios
   */
  renderSharedPortfolios() {
    const myShares = Array.from(this.sharedPortfolios.values()).filter(
      (share) => share.userId === this.currentUser.id
    );

    if (myShares.length === 0) {
      return '<div style="text-align: center; padding: 20px; color: #999;">No shared portfolios yet</div>';
    }

    return myShares
      .map(
        (share) => `
      <div style="padding: 12px; background: white; border: 1px solid #eee; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
              ${share.visibility === 'public' ? '🌍' : share.visibility === 'followers' ? '👥' : '🔒'} 
              ${share.message || 'Portfolio Share'}
            </div>
            <div style="font-size: 0.75rem; color: #999;">
              ${new Date(share.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 16px; font-size: 0.85rem; color: #666;">
          <span>❤️ ${share.likes}</span>
          <span>💬 ${share.comments.length}</span>
          <span>👁️ ${share.views}</span>
        </div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Show explore tab
   */
  showExploreTab() {
    this.setActiveTab('tabExplore');

    const content = document.getElementById('socialContent');
    if (!content) {return;}

    // Generate mock portfolios to explore
    const mockPortfolios = this.generateMockPortfolios();

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <input 
          type="text" 
          placeholder="Search portfolios or users..."
          style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem;"
        >
      </div>
      
      <h4 style="margin: 0 0 12px 0; color: #666;">Trending Portfolios:</h4>
      
      ${mockPortfolios
    .map(
      (portfolio) => `
        <div style="padding: 16px; background: white; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${portfolio.username}</div>
              <div style="font-size: 0.85rem; color: #666;">${portfolio.description}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; font-size: 1.1rem; color: ${portfolio.return > 0 ? '#2ecc71' : '#e74c3c'};">
                ${portfolio.return > 0 ? '+' : ''}${portfolio.return}%
              </div>
              <div style="font-size: 0.75rem; color: #999;">1Y Return</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="window.socialFeatures.likePortfolio('${portfolio.id}')" 
              style="flex: 1; padding: 8px; background: #e8f5e9; color: #2ecc71; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
            >
              ❤️ Like (${portfolio.likes})
            </button>
            <button 
              onclick="window.socialFeatures.copyPortfolio('${portfolio.id}')" 
              style="flex: 1; padding: 8px; background: #e3f2fd; color: #3498db; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
            >
              📋 Copy
            </button>
            <button 
              onclick="window.socialFeatures.followUser('${portfolio.userId}')" 
              style="flex: 1; padding: 8px; background: #f3e5f5; color: #9b59b6; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
            >
              👥 Follow
            </button>
          </div>
        </div>
      `
    )
    .join('')}
    `;
  }

  /**
   * Generate mock portfolios for exploration
   */
  generateMockPortfolios() {
    const mockUsers = [
      { name: 'Warren_Investor', desc: 'Value investing focused on dividends', return: 15.2 },
      { name: 'TechBull_2024', desc: 'Growth stocks in technology sector', return: 28.5 },
      { name: 'DividendKing', desc: 'High-yield dividend aristocrats', return: 12.3 },
      { name: 'CryptoTrader', desc: 'Diversified crypto portfolio', return: -8.7 },
      { name: 'IndexFund_Pro', desc: 'Passive index fund strategy', return: 18.9 },
    ];

    return mockUsers.map((user, i) => ({
      id: `mock_${ i}`,
      userId: `user_mock_${ i}`,
      username: user.name,
      description: user.desc,
      return: user.return,
      likes: Math.floor(Math.random() * 100),
      followers: Math.floor(Math.random() * 500),
    }));
  }

  /**
   * Set active tab
   */
  setActiveTab(tabId) {
    document.querySelectorAll('.social-tab').forEach((tab) => {
      tab.style.borderBottom = '2px solid transparent';
      tab.style.fontWeight = 'normal';
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.style.borderBottom = '2px solid #667eea';
      activeTab.style.fontWeight = '600';
    }
  }

  /**
   * Get time ago string
   */
  getTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    if (seconds < 60) {return 'Just now';}
    if (seconds < 3600) {return `${Math.floor(seconds / 60) } minutes ago`;}
    if (seconds < 86400) {return `${Math.floor(seconds / 3600) } hours ago`;}
    if (seconds < 604800) {return `${Math.floor(seconds / 86400) } days ago`;}

    return new Date(timestamp).toLocaleDateString();
  }

  /**
   * Update social UI
   */
  updateSocialUI() {
    // Update stats in header
    const panel = document.getElementById('socialPanel');
    if (panel && panel.style.display !== 'none') {
      const header = panel.querySelector('div[style*="gap: 16px"]');
      if (header) {
        header.innerHTML = `
          <div>
            <strong>${this.currentUser.followers}</strong> Followers
          </div>
          <div>
            <strong>${this.currentUser.following}</strong> Following
          </div>
          <div>
            <strong>${this.currentUser.portfoliosShared}</strong> Shares
          </div>
        `;
      }

      // Refresh current tab content
      const activeTab = document.querySelector('.social-tab[style*="border-bottom: 2px solid"]');
      if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'tabFeed') {this.showFeedTab();} else if (tabId === 'tabShare') {this.showShareTab();} else if (tabId === 'tabExplore') {this.showExploreTab();}
      }
    }
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(
        'socialFeatures',
        JSON.stringify({
          currentUser: this.currentUser,
          sharedPortfolios: Array.from(this.sharedPortfolios.entries()),
          following: Array.from(this.following),
          followers: Array.from(this.followers),
          feed: this.feed,
        })
      );
    } catch (error) {
      console.error('Failed to save social features:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('socialFeatures');
      if (data) {
        const state = JSON.parse(data);
        this.currentUser = state.currentUser;
        this.sharedPortfolios = new Map(state.sharedPortfolios);
        this.following = new Set(state.following);
        this.followers = new Set(state.followers);
        this.feed = state.feed.map((f) => ({
          ...f,
          timestamp: new Date(f.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load social features:', error);
    }
  }
}

// Global instance
window.socialFeatures = new SocialFeatures();

console.log('✅ Social Features loaded');
