/**
 * Real-time Collaboration Module
 * WebSocket-based multi-user editing with presence and conflict resolution
 */

class CollaborationManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.userId = this.generateUserId();
    this.userName = this.getUserName();
    this.userColor = this.generateUserColor();
    this.onlineUsers = new Map();
    this.pendingChanges = [];
    this.isConnected = false;
    this.roomId = null;
    this.cursorPositions = new Map();
    
    this.init();
  }

  /**
   * Initialize collaboration system
   */
  async init() {
    try {
      // Load collaboration UI
      this.createCollaborationUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Auto-connect if room ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const roomId = urlParams.get('room');
      if (roomId) {
        await this.connect(roomId);
      }
      
      console.log('✅ Collaboration Manager initialized');
    } catch (error) {
      console.error('❌ Collaboration initialization failed:', error);
    }
  }

  /**
   * Connect to collaboration server
   * @param {string} roomId - Room ID to join
   */
  async connect(roomId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    this.roomId = roomId || this.generateRoomId();

    try {
      // In production, use actual WebSocket server
      // For demo, simulate WebSocket with local storage sync
      this.simulateWebSocket();
      
      this.isConnected = true;
      this.updateConnectionStatus(true);
      
      // Announce presence
      this.broadcastPresence();
      
      // Start periodic sync
      this.startSyncInterval();
      
      console.log('✅ Connected to room:', this.roomId);
      
      // Update URL with room ID
      const url = new URL(window.location);
      url.searchParams.set('room', this.roomId);
      window.history.pushState({}, '', url);
      
      return this.roomId;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Simulate WebSocket with localStorage (for demo)
   * In production, replace with actual WebSocket connection
   */
  simulateWebSocket() {
    // Listen to storage events for cross-tab communication
    window.addEventListener('storage', (e) => {
      if (e.key === `collab-${this.roomId}`) {
        try {
          const message = JSON.parse(e.newValue);
          this.handleMessage(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      }
    });

    // Periodic check for updates
    setInterval(() => {
      this.syncWithLocalStorage();
    }, 1000);
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.updateConnectionStatus(false);
    this.onlineUsers.clear();
    this.updatePresenceIndicators();
    
    console.log('✅ Disconnected from collaboration');
  }

  /**
   * Broadcast change to other users
   * @param {string} type - Change type (edit, cursor, selection)
   * @param {Object} data - Change data
   */
  broadcastChange(type, data) {
    if (!this.isConnected) {
      this.pendingChanges.push({ type, data, timestamp: Date.now() });
      return;
    }

    const message = {
      type,
      data,
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      timestamp: Date.now(),
      roomId: this.roomId
    };

    this.sendMessage(message);
  }

  /**
   * Send message via WebSocket (or localStorage in demo mode)
   */
  sendMessage(message) {
    try {
      // Demo mode: use localStorage
      const key = `collab-${this.roomId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{"messages": []}');
      existing.messages.push(message);
      
      // Keep only last 100 messages
      if (existing.messages.length > 100) {
        existing.messages = existing.messages.slice(-100);
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(message) {
    // Ignore own messages
    if (message.userId === this.userId) return;

    switch (message.type) {
      case 'presence':
        this.handlePresence(message);
        break;
      case 'edit':
        this.handleEdit(message);
        break;
      case 'cursor':
        this.handleCursor(message);
        break;
      case 'selection':
        this.handleSelection(message);
        break;
      case 'leave':
        this.handleUserLeave(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Handle user presence update
   */
  handlePresence(message) {
    this.onlineUsers.set(message.userId, {
      userId: message.userId,
      userName: message.userName,
      userColor: message.userColor,
      lastSeen: Date.now()
    });

    this.updatePresenceIndicators();
    this.showNotification(`${message.userName} joined`, 'info');
  }

  /**
   * Handle edit from another user
   */
  handleEdit(message) {
    const { data } = message;
    
    // Apply edit with conflict resolution
    this.applyRemoteEdit(data);
    
    // Show edit indicator
    this.showEditIndicator(message.userName, message.userColor);
  }

  /**
   * Apply remote edit with conflict resolution
   */
  applyRemoteEdit(edit) {
    try {
      // Get current data
      const currentData = window.getFondyData ? window.getFondyData() : [];
      
      // Apply edit based on type
      switch (edit.action) {
        case 'add':
          currentData.push(edit.row);
          break;
        case 'update':
          const updateIndex = currentData.findIndex(row => row.id === edit.rowId);
          if (updateIndex !== -1) {
            // Merge changes
            currentData[updateIndex] = { ...currentData[updateIndex], ...edit.changes };
          }
          break;
        case 'delete':
          const deleteIndex = currentData.findIndex(row => row.id === edit.rowId);
          if (deleteIndex !== -1) {
            currentData.splice(deleteIndex, 1);
          }
          break;
      }

      // Update UI without triggering another broadcast
      this.suppressNextBroadcast = true;
      if (window.aktualizovatTabulku) {
        window.aktualizovatTabulku();
      }
      this.suppressNextBroadcast = false;
      
    } catch (error) {
      console.error('Failed to apply remote edit:', error);
    }
  }

  /**
   * Handle cursor position update
   */
  handleCursor(message) {
    const { userId, position } = message.data;
    
    this.cursorPositions.set(userId, {
      x: position.x,
      y: position.y,
      userName: message.userName,
      userColor: message.userColor
    });

    this.updateRemoteCursors();
  }

  /**
   * Handle selection update
   */
  handleSelection(message) {
    const { rowId, fieldName } = message.data;
    
    // Highlight selected cell
    this.highlightRemoteSelection(rowId, fieldName, message.userColor);
  }

  /**
   * Handle user leaving
   */
  handleUserLeave(message) {
    this.onlineUsers.delete(message.userId);
    this.cursorPositions.delete(message.userId);
    this.updatePresenceIndicators();
    this.updateRemoteCursors();
    this.showNotification(`${message.userName} left`, 'info');
  }

  /**
   * Broadcast presence
   */
  broadcastPresence() {
    this.broadcastChange('presence', {
      status: 'online'
    });

    // Broadcast periodically to maintain presence
    setInterval(() => {
      if (this.isConnected) {
        this.broadcastChange('presence', { status: 'online' });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Track cell changes
   */
  trackChange(action, rowId, changes) {
    if (this.suppressNextBroadcast) return;

    this.broadcastChange('edit', {
      action,
      rowId,
      changes,
      timestamp: Date.now()
    });
  }

  /**
   * Track cursor movement
   */
  trackCursor(x, y) {
    if (!this.isConnected) return;

    // Throttle cursor updates
    clearTimeout(this.cursorThrottle);
    this.cursorThrottle = setTimeout(() => {
      this.broadcastChange('cursor', {
        position: { x, y }
      });
    }, 100);
  }

  /**
   * Track cell selection
   */
  trackSelection(rowId, fieldName) {
    if (!this.isConnected) return;

    this.broadcastChange('selection', {
      rowId,
      fieldName
    });
  }

  // ==================== UI MANAGEMENT ====================

  /**
   * Create collaboration UI
   */
  createCollaborationUI() {
    // Add collaboration panel
    const panel = document.createElement('div');
    panel.id = 'collaborationPanel';
    panel.className = 'collaboration-panel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
          <span>👥</span>
          <span>Collaboration</span>
          <button id="closeCollabPanel" style="margin-left: auto; background: none; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
        </h3>
      </div>
      
      <div id="collaborationContent" style="padding: 16px;">
        <div id="connectionStatus" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div id="statusIndicator" style="width: 10px; height: 10px; border-radius: 50%; background: #95a5a6;"></div>
            <span id="statusText">Disconnected</span>
          </div>
        </div>
        
        <div id="roomSection">
          <button id="createRoomBtn" class="collab-btn primary">Create Room</button>
          <button id="joinRoomBtn" class="collab-btn">Join Room</button>
          <div id="roomInfo" style="display: none; margin-top: 12px; padding: 12px; background: #e8f5e9; border-radius: 8px;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">Room ID:</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <code id="roomIdDisplay" style="flex: 1; padding: 6px; background: white; border-radius: 4px; font-size: 0.9rem;"></code>
              <button id="copyRoomBtn" title="Copy Room ID" style="padding: 6px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">📋</button>
            </div>
            <button id="leaveRoomBtn" style="margin-top: 8px; width: 100%; padding: 8px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">Leave Room</button>
          </div>
        </div>
        
        <div id="onlineUsers" style="margin-top: 16px;">
          <div style="font-weight: 600; margin-bottom: 8px;">Online Users:</div>
          <div id="usersList"></div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add collaboration button to header
    this.addCollaborationButton();

    // Setup panel event listeners
    this.setupPanelListeners();
  }

  /**
   * Add collaboration button to header
   */
  addCollaborationButton() {
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) return;

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) return;

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) return;

    const collabBtn = document.createElement('button');
    collabBtn.id = 'collaborationBtn';
    collabBtn.className = 'btn-icon';
    collabBtn.title = 'Collaboration';
    collabBtn.setAttribute('aria-label', 'Spolupráce');
    collabBtn.style.cssText = 'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; position: relative;';
    collabBtn.innerHTML = '👥 <span id="onlineCount" style="position: absolute; top: -8px; right: -8px; background: #2ecc71; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">0</span>';

    collabBtn.addEventListener('click', () => {
      const panel = document.getElementById('collaborationPanel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    buttonContainer.appendChild(collabBtn);
    console.log('✅ Collaboration button added');
  }

  /**
   * Setup panel event listeners
   */
  setupPanelListeners() {
    document.getElementById('closeCollabPanel')?.addEventListener('click', () => {
      document.getElementById('collaborationPanel').style.display = 'none';
    });

    document.getElementById('createRoomBtn')?.addEventListener('click', async () => {
      const roomId = await this.connect();
      this.showRoomInfo(roomId);
    });

    document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
      const roomId = prompt('Enter Room ID:');
      if (roomId) {
        this.connect(roomId);
        this.showRoomInfo(roomId);
      }
    });

    document.getElementById('copyRoomBtn')?.addEventListener('click', () => {
      const roomId = document.getElementById('roomIdDisplay').textContent;
      navigator.clipboard.writeText(roomId);
      this.showNotification('Room ID copied!', 'success');
    });

    document.getElementById('leaveRoomBtn')?.addEventListener('click', () => {
      this.disconnect();
      this.hideRoomInfo();
    });
  }

  /**
   * Show room info
   */
  showRoomInfo(roomId) {
    document.getElementById('roomIdDisplay').textContent = roomId;
    document.getElementById('roomInfo').style.display = 'block';
    document.getElementById('createRoomBtn').style.display = 'none';
    document.getElementById('joinRoomBtn').style.display = 'none';
  }

  /**
   * Hide room info
   */
  hideRoomInfo() {
    document.getElementById('roomInfo').style.display = 'none';
    document.getElementById('createRoomBtn').style.display = 'block';
    document.getElementById('joinRoomBtn').style.display = 'block';
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(isConnected) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');

    if (isConnected) {
      indicator.style.background = '#2ecc71';
      text.textContent = 'Connected';
    } else {
      indicator.style.background = '#95a5a6';
      text.textContent = 'Disconnected';
    }
  }

  /**
   * Update presence indicators
   */
  updatePresenceIndicators() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    usersList.innerHTML = '';

    // Add self
    const selfUser = document.createElement('div');
    selfUser.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 6px;';
    selfUser.innerHTML = `
      <div style="width: 10px; height: 10px; border-radius: 50%; background: ${this.userColor};"></div>
      <span style="font-weight: 600;">${this.userName} (You)</span>
    `;
    usersList.appendChild(selfUser);

    // Add other users
    this.onlineUsers.forEach((user, userId) => {
      const userDiv = document.createElement('div');
      userDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 6px;';
      userDiv.innerHTML = `
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${user.userColor};"></div>
        <span>${user.userName}</span>
      `;
      usersList.appendChild(userDiv);
    });

    // Update online count
    const onlineCount = document.getElementById('onlineCount');
    if (onlineCount) {
      onlineCount.textContent = this.onlineUsers.size + 1; // +1 for self
    }
  }

  /**
   * Update remote cursors
   */
  updateRemoteCursors() {
    // Remove old cursors
    document.querySelectorAll('.remote-cursor').forEach(el => el.remove());

    // Add current cursors
    this.cursorPositions.forEach((cursor, userId) => {
      const cursorEl = document.createElement('div');
      cursorEl.className = 'remote-cursor';
      cursorEl.style.cssText = `
        position: fixed;
        left: ${cursor.x}px;
        top: ${cursor.y}px;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.1s ease;
      `;
      cursorEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="${cursor.userColor}">
          <path d="M5.5 3.21V20.79L13.5 12.79L18.5 14.29L5.5 3.21Z"/>
        </svg>
        <div style="
          margin-left: 20px;
          margin-top: -24px;
          padding: 4px 8px;
          background: ${cursor.userColor};
          color: white;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
        ">${cursor.userName}</div>
      `;
      document.body.appendChild(cursorEl);
    });
  }

  /**
   * Highlight remote selection
   */
  highlightRemoteSelection(rowId, fieldName, color) {
    const cell = document.querySelector(`[data-row-id="${rowId}"] [data-field="${fieldName}"]`);
    if (!cell) return;

    // Add highlight
    cell.style.boxShadow = `0 0 0 2px ${color}`;
    cell.style.background = `${color}10`;

    // Remove after 2 seconds
    setTimeout(() => {
      cell.style.boxShadow = '';
      cell.style.background = '';
    }, 2000);
  }

  /**
   * Show edit indicator
   */
  showEditIndicator(userName, userColor) {
    const indicator = document.createElement('div');
    indicator.className = 'edit-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 340px;
      padding: 12px 16px;
      background: ${userColor};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    indicator.textContent = `${userName} made a change`;

    document.body.appendChild(indicator);

    setTimeout(() => {
      indicator.remove();
    }, 3000);
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const colors = {
      info: '#3498db',
      success: '#2ecc71',
      error: '#e74c3c'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${colors[type]};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // ==================== UTILITIES ====================

  /**
   * Setup event listeners for tracking changes
   */
  setupEventListeners() {
    // Track mouse movement for cursor sharing
    document.addEventListener('mousemove', (e) => {
      if (this.isConnected) {
        this.trackCursor(e.clientX, e.clientY);
      }
    });

    // Track table changes
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target.closest('table')) {
        const row = target.closest('tr');
        const rowId = row?.dataset?.rowId;
        const fieldName = target.dataset?.field;
        
        if (rowId && fieldName) {
          this.trackChange('update', rowId, {
            [fieldName]: target.value
          });
        }
      }
    });

    // Handle before unload
    window.addEventListener('beforeunload', () => {
      if (this.isConnected) {
        this.broadcastChange('leave', {});
      }
    });
  }

  /**
   * Sync with localStorage
   */
  syncWithLocalStorage() {
    if (!this.roomId) return;

    try {
      const key = `collab-${this.roomId}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"messages": []}');
      
      // Process unprocessed messages
      data.messages.forEach(message => {
        if (!this.processedMessages?.has(message.timestamp)) {
          this.handleMessage(message);
          if (!this.processedMessages) {
            this.processedMessages = new Set();
          }
          this.processedMessages.add(message.timestamp);
        }
      });

      // Clean old processed messages
      if (this.processedMessages && this.processedMessages.size > 200) {
        const arr = Array.from(this.processedMessages);
        this.processedMessages = new Set(arr.slice(-100));
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  /**
   * Start sync interval
   */
  startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncWithLocalStorage();
      
      // Clean up stale users
      const now = Date.now();
      this.onlineUsers.forEach((user, userId) => {
        if (now - user.lastSeen > 60000) { // 1 minute timeout
          this.onlineUsers.delete(userId);
          this.updatePresenceIndicators();
        }
      });
    }, 1000);
  }

  /**
   * Handle connection error
   */
  handleConnectionError() {
    this.isConnected = false;
    this.updateConnectionStatus(false);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log('Attempting to reconnect...', this.reconnectAttempts);
        this.connect(this.roomId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.showNotification('Connection failed. Please try again.', 'error');
    }
  }

  /**
   * Generate user ID
   */
  generateUserId() {
    let userId = localStorage.getItem('collaboration-user-id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('collaboration-user-id', userId);
    }
    return userId;
  }

  /**
   * Get user name
   */
  getUserName() {
    let userName = localStorage.getItem('collaboration-user-name');
    if (!userName) {
      userName = prompt('Enter your name:') || 'Anonymous';
      localStorage.setItem('collaboration-user-name', userName);
    }
    return userName;
  }

  /**
   * Generate user color
   */
  generateUserColor() {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
      '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
    ];
    let userColor = localStorage.getItem('collaboration-user-color');
    if (!userColor) {
      userColor = colors[Math.floor(Math.random() * colors.length)];
      localStorage.setItem('collaboration-user-color', userColor);
    }
    return userColor;
  }

  /**
   * Generate room ID
   */
  generateRoomId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

// Global instance
window.collaborationManager = new CollaborationManager();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .collab-btn {
    width: 100%;
    padding: 12px;
    background: #ecf0f1;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .collab-btn:hover {
    background: #bdc3c7;
  }

  .collab-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .collab-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;
document.head.appendChild(style);

console.log('✅ Collaboration module loaded');
