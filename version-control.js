/**
 * Version Control System
 * Git-like versioning for portfolio data with branches and history
 */

class VersionControl {
  constructor() {
    this.currentBranch = 'main';
    this.branches = new Map();
    this.commits = [];
    this.head = null;
    this.maxCommits = 100;
    this.staged = null;
    
    this.init();
  }

  /**
   * Initialize version control
   */
  init() {
    try {
      this.loadFromStorage();
      
      // Create main branch if not exists
      if (!this.branches.has('main')) {
        this.createBranch('main');
      }
      
      this.createVersionControlUI();
      
      console.log('✅ Version Control initialized');
    } catch (error) {
      console.error('❌ Version Control initialization failed:', error);
    }
  }

  /**
   * Create initial commit
   */
  createInitialCommit() {
    const data = window.getFondyData ? window.getFondyData() : [];
    this.commit('Initial commit', data);
  }

  /**
   * Commit current state
   */
  commit(message, data = null) {
    const portfolioData = data || (window.getFondyData ? window.getFondyData() : []);
    
    const commit = {
      id: this.generateCommitId(),
      branch: this.currentBranch,
      message: message || 'No message',
      data: JSON.parse(JSON.stringify(portfolioData)),
      timestamp: new Date(),
      author: 'User',
      parent: this.head
    };

    this.commits.push(commit);
    this.head = commit.id;
    
    // Update branch pointer
    this.branches.set(this.currentBranch, commit.id);
    
    // Cleanup old commits
    if (this.commits.length > this.maxCommits) {
      this.commits = this.commits.slice(-this.maxCommits);
    }
    
    this.saveToStorage();
    this.updateVersionControlUI();
    
    console.log('✅ Committed:', message);
    
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        `Version saved: ${message}`,
        'success'
      );
    }
    
    return commit.id;
  }

  /**
   * Create new branch
   */
  createBranch(name, fromCommit = null) {
    if (this.branches.has(name)) {
      throw new Error(`Branch ${name} already exists`);
    }

    const commitId = fromCommit || this.head || null;
    this.branches.set(name, commitId);
    
    this.saveToStorage();
    this.updateVersionControlUI();
    
    console.log('✅ Branch created:', name);
    
    return name;
  }

  /**
   * Switch to branch
   */
  checkout(branchName) {
    if (!this.branches.has(branchName)) {
      throw new Error(`Branch ${branchName} does not exist`);
    }

    // Save current state first
    if (this.hasUncommittedChanges()) {
      const save = confirm('You have uncommitted changes. Save before switching?');
      if (save) {
        this.commit(`Auto-save before checkout to ${branchName}`);
      }
    }

    this.currentBranch = branchName;
    const commitId = this.branches.get(branchName);
    
    if (commitId) {
      this.head = commitId;
      this.restoreCommit(commitId);
    }
    
    this.saveToStorage();
    this.updateVersionControlUI();
    
    console.log('✅ Switched to branch:', branchName);
    
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        `Switched to branch: ${branchName}`,
        'success'
      );
    }
  }

  /**
   * Restore data from commit
   */
  restoreCommit(commitId) {
    const commit = this.commits.find(c => c.id === commitId);
    if (!commit) {
      throw new Error('Commit not found');
    }

    // Restore portfolio data
    if (window.setFondyData) {
      window.setFondyData(commit.data);
    }
    
    if (window.aktualizovatTabulku) {
      window.aktualizovatTabulku();
    }
    
    this.head = commitId;
    
    console.log('✅ Restored commit:', commit.message);
  }

  /**
   * Revert to specific commit
   */
  revert(commitId) {
    const commit = this.commits.find(c => c.id === commitId);
    if (!commit) {
      throw new Error('Commit not found');
    }

    this.restoreCommit(commitId);
    
    // Create revert commit
    this.commit(`Revert to: ${commit.message}`);
    
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        `Reverted to: ${commit.message}`,
        'success'
      );
    }
  }

  /**
   * Merge branch into current branch
   */
  merge(sourceBranch) {
    if (!this.branches.has(sourceBranch)) {
      throw new Error(`Branch ${sourceBranch} does not exist`);
    }

    const sourceCommitId = this.branches.get(sourceBranch);
    const sourceCommit = this.commits.find(c => c.id === sourceCommitId);
    
    if (!sourceCommit) {
      throw new Error('Source commit not found');
    }

    // Simple merge: take source data
    const currentData = window.getFondyData ? window.getFondyData() : [];
    const mergedData = [...currentData, ...sourceCommit.data];
    
    // Remove duplicates by ID
    const uniqueData = Array.from(
      new Map(mergedData.map(item => [item.id, item])).values()
    );
    
    // Restore merged data
    if (window.setFondyData) {
      window.setFondyData(uniqueData);
    }
    
    // Commit merge
    this.commit(`Merge branch ${sourceBranch} into ${this.currentBranch}`);
    
    console.log('✅ Merged:', sourceBranch);
    
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        `Merged: ${sourceBranch} → ${this.currentBranch}`,
        'success'
      );
    }
  }

  /**
   * Get commit history
   */
  getHistory(branch = null) {
    const targetBranch = branch || this.currentBranch;
    return this.commits
      .filter(c => !branch || c.branch === targetBranch)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Check for uncommitted changes
   */
  hasUncommittedChanges() {
    if (!this.head) return true;
    
    const currentData = window.getFondyData ? window.getFondyData() : [];
    const lastCommit = this.commits.find(c => c.id === this.head);
    
    if (!lastCommit) return true;
    
    return JSON.stringify(currentData) !== JSON.stringify(lastCommit.data);
  }

  /**
   * Generate commit ID
   */
  generateCommitId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Create version control UI
   */
  createVersionControlUI() {
    // Add version control button
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) return;

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) return;

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) return;

    const versionBtn = document.createElement('button');
    versionBtn.id = 'versionControlBtn';
    versionBtn.className = 'btn-icon';
    versionBtn.title = 'Version Control';
    versionBtn.setAttribute('aria-label', 'Správa verzí');
    versionBtn.style.cssText = 'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    versionBtn.textContent = '🔀';

    versionBtn.addEventListener('click', () => this.toggleVersionPanel());

    buttonContainer.appendChild(versionBtn);

    // Create version control panel
    this.createVersionPanel();
  }

  /**
   * Create version control panel
   */
  createVersionPanel() {
    const panel = document.createElement('div');
    panel.id = 'versionControlPanel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 450px;
      max-height: 650px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🔀</span>
            <span>Version Control</span>
          </h3>
          <button id="closeVersionPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: white;">✕</button>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.95;">
          Branch: <strong id="currentBranchName">${this.currentBranch}</strong>
        </div>
      </div>
      
      <div style="padding: 16px; border-bottom: 1px solid #eee;">
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button id="btnCommit" style="flex: 1; padding: 10px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            💾 Commit
          </button>
          <button id="btnCreateBranch" style="flex: 1; padding: 10px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            🌿 New Branch
          </button>
        </div>
        
        <div id="changesIndicator" style="padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; font-size: 0.85rem;">
          <strong>⚠️ Uncommitted changes</strong>
        </div>
      </div>
      
      <div style="padding: 16px; border-bottom: 1px solid #eee;">
        <h4 style="margin: 0 0 12px 0; color: #666; font-size: 0.9rem;">BRANCHES</h4>
        <div id="branchesList"></div>
      </div>
      
      <div style="padding: 16px;">
        <h4 style="margin: 0 0 12px 0; color: #666; font-size: 0.9rem;">COMMIT HISTORY</h4>
        <div id="commitHistoryList" style="max-height: 300px; overflow-y: auto;"></div>
      </div>
    `;

    document.body.appendChild(panel);
    this.setupVersionPanelListeners();
    this.updateVersionControlUI();
  }

  /**
   * Setup version panel listeners
   */
  setupVersionPanelListeners() {
    document.getElementById('closeVersionPanel')?.addEventListener('click', () => {
      this.toggleVersionPanel();
    });

    document.getElementById('btnCommit')?.addEventListener('click', () => {
      const message = prompt('Commit message:');
      if (message) {
        this.commit(message);
      }
    });

    document.getElementById('btnCreateBranch')?.addEventListener('click', () => {
      const name = prompt('Branch name:');
      if (name) {
        try {
          this.createBranch(name);
          if (window.notificationSystem) {
            window.notificationSystem.showInAppNotification(
              `Branch created: ${name}`,
              'success'
            );
          }
        } catch (error) {
          alert(error.message);
        }
      }
    });
  }

  /**
   * Toggle version panel
   */
  toggleVersionPanel() {
    const panel = document.getElementById('versionControlPanel');
    const isVisible = panel.style.display !== 'none';
    
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      this.updateVersionControlUI();
    }
  }

  /**
   * Update version control UI
   */
  updateVersionControlUI() {
    // Update current branch
    const branchName = document.getElementById('currentBranchName');
    if (branchName) {
      branchName.textContent = this.currentBranch;
    }

    // Update changes indicator
    const changesIndicator = document.getElementById('changesIndicator');
    if (changesIndicator) {
      if (this.hasUncommittedChanges()) {
        changesIndicator.style.display = 'block';
      } else {
        changesIndicator.style.display = 'none';
      }
    }

    // Update branches list
    this.updateBranchesList();

    // Update commit history
    this.updateCommitHistory();
  }

  /**
   * Update branches list
   */
  updateBranchesList() {
    const list = document.getElementById('branchesList');
    if (!list) return;

    if (this.branches.size === 0) {
      list.innerHTML = '<div style="color: #999; font-size: 0.85rem;">No branches</div>';
      return;
    }

    list.innerHTML = Array.from(this.branches.entries())
      .map(([name, commitId]) => {
        const isCurrent = name === this.currentBranch;
        return `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 4px 0;
            background: ${isCurrent ? '#e8f5e9' : '#f8f9fa'};
            border-left: 4px solid ${isCurrent ? '#2ecc71' : '#ddd'};
            border-radius: 6px;
          ">
            <div>
              <div style="font-weight: ${isCurrent ? '600' : '400'}; color: #333;">
                ${isCurrent ? '→ ' : ''}${name}
              </div>
              <div style="font-size: 0.75rem; color: #666; font-family: monospace;">
                ${commitId ? commitId.substring(0, 8) : 'no commits'}
              </div>
            </div>
            ${!isCurrent ? `
              <div style="display: flex; gap: 4px;">
                <button 
                  onclick="window.versionControl.checkout('${name}')"
                  style="padding: 4px 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;"
                >
                  Checkout
                </button>
                <button 
                  onclick="window.versionControl.merge('${name}')"
                  style="padding: 4px 8px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;"
                >
                  Merge
                </button>
              </div>
            ` : ''}
          </div>
        `;
      })
      .join('');
  }

  /**
   * Update commit history
   */
  updateCommitHistory() {
    const list = document.getElementById('commitHistoryList');
    if (!list) return;

    const history = this.getHistory();

    if (history.length === 0) {
      list.innerHTML = '<div style="color: #999; font-size: 0.85rem; text-align: center; padding: 20px;">No commits yet</div>';
      return;
    }

    list.innerHTML = history
      .slice(0, 20)
      .map(commit => {
        const isHead = commit.id === this.head;
        const date = new Date(commit.timestamp);
        
        return `
          <div style="
            padding: 12px;
            margin: 8px 0;
            background: ${isHead ? '#fff3cd' : 'white'};
            border: 1px solid ${isHead ? '#ffc107' : '#eee'};
            border-radius: 8px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
              <div style="font-weight: 600; color: #333; flex: 1;">
                ${isHead ? '👉 ' : ''}${commit.message}
              </div>
              <button 
                onclick="window.versionControl.revert('${commit.id}')"
                style="padding: 4px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;"
              >
                Revert
              </button>
            </div>
            <div style="font-size: 0.75rem; color: #666;">
              <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">
                ${commit.id.substring(0, 8)}
              </span>
              <span style="margin-left: 8px;">${date.toLocaleString()}</span>
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 4px;">
              Branch: ${commit.branch} • Author: ${commit.author}
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('versionControl', JSON.stringify({
        currentBranch: this.currentBranch,
        branches: Array.from(this.branches.entries()),
        commits: this.commits,
        head: this.head
      }));
    } catch (error) {
      console.error('Failed to save version control state:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('versionControl');
      if (data) {
        const state = JSON.parse(data);
        this.currentBranch = state.currentBranch;
        this.branches = new Map(state.branches);
        this.commits = state.commits.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
        this.head = state.head;
      }
    } catch (error) {
      console.error('Failed to load version control state:', error);
    }
  }
}

// Global instance
window.versionControl = new VersionControl();

console.log('✅ Version Control loaded');
