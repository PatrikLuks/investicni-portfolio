/**
 * Cloud Backup & Sync Manager
 * Features: Google Drive integration, Dropbox integration, auto-backup, conflict resolution
 */

class CloudBackupManager {
  constructor() {
    this.providers = {
      googleDrive: {
        enabled: false,
        clientId: null,
        accessToken: null,
        folderId: null,
        lastSync: null,
      },
      dropbox: {
        enabled: false,
        accessToken: null,
        lastSync: null,
      },
    };

    this.autoBackupInterval = null;
    this.autoBackupFrequency = 30 * 60 * 1000; // 30 minutes default
    this.isBackingUp = false;
    this.backupHistory = this.loadBackupHistory();
    this.maxBackupHistory = 50;

    this.init();
  }

  /**
   * Initialize cloud backup manager
   */
  init() {
    this.loadProviderSettings();
    this.setupAutoBackup();
    console.log('✅ Cloud Backup Manager initialized');
  }

  // ==================== GOOGLE DRIVE INTEGRATION ====================

  /**
   * Connect to Google Drive
   * @param {string} clientId - Google OAuth Client ID
   * @returns {Promise<boolean>}
   */
  async connectGoogleDrive(clientId) {
    try {
      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      this.providers.googleDrive.clientId = clientId;

      // Initialize Google API client
      await new Promise((resolve, reject) => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              clientId: clientId,
              scope: 'https://www.googleapis.com/auth/drive.file',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });

            // Sign in
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
              await authInstance.signIn();
            }

            const user = authInstance.currentUser.get();
            const authResponse = user.getAuthResponse();
            this.providers.googleDrive.accessToken = authResponse.access_token;
            this.providers.googleDrive.enabled = true;

            // Create app folder
            await this.createGoogleDriveFolder();

            this.saveProviderSettings();
            console.log('✅ Google Drive connected successfully');
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to connect Google Drive:', error);
      throw error;
    }
  }

  /**
   * Load Google API script
   * @returns {Promise<void>}
   */
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Create app folder in Google Drive
   * @returns {Promise<string>} - Folder ID
   */
  async createGoogleDriveFolder() {
    try {
      // Search for existing folder
      const response = await gapi.client.drive.files.list({
        q: "name='Portfolio Manager Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (response.result.files.length > 0) {
        this.providers.googleDrive.folderId = response.result.files[0].id;
        return response.result.files[0].id;
      }

      // Create new folder
      const fileMetadata = {
        name: 'Portfolio Manager Backups',
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      this.providers.googleDrive.folderId = folder.result.id;
      return folder.result.id;
    } catch (error) {
      console.error('❌ Failed to create Google Drive folder:', error);
      throw error;
    }
  }

  /**
   * Backup to Google Drive
   * @param {Object} data - Portfolio data
   * @returns {Promise<Object>} - Backup info
   */
  async backupToGoogleDrive(data) {
    if (!this.providers.googleDrive.enabled) {
      throw new Error('Google Drive not connected');
    }

    try {
      const timestamp = new Date().toISOString();
      const fileName = `portfolio-backup-${timestamp}.json`;
      const content = JSON.stringify(data, null, 2);

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [this.providers.googleDrive.folderId],
      };

      const blob = new Blob([content], { type: 'application/json' });
      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      );
      formData.append('file', blob);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.providers.googleDrive.accessToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      this.providers.googleDrive.lastSync = timestamp;
      this.addToBackupHistory('googleDrive', fileName, result.id, content.length);
      this.saveProviderSettings();

      console.log('✅ Backed up to Google Drive:', fileName);
      return { provider: 'googleDrive', fileId: result.id, fileName, timestamp };
    } catch (error) {
      console.error('❌ Google Drive backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore from Google Drive
   * @param {string} fileId - File ID to restore
   * @returns {Promise<Object>} - Portfolio data
   */
  async restoreFromGoogleDrive(fileId) {
    if (!this.providers.googleDrive.enabled) {
      throw new Error('Google Drive not connected');
    }

    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      console.log('✅ Restored from Google Drive:', fileId);
      return JSON.parse(response.body);
    } catch (error) {
      console.error('❌ Google Drive restore failed:', error);
      throw error;
    }
  }

  /**
   * List Google Drive backups
   * @returns {Promise<Array>} - List of backup files
   */
  async listGoogleDriveBackups() {
    if (!this.providers.googleDrive.enabled) {
      throw new Error('Google Drive not connected');
    }

    try {
      const response = await gapi.client.drive.files.list({
        q: `'${this.providers.googleDrive.folderId}' in parents and mimeType='application/json' and trashed=false`,
        orderBy: 'createdTime desc',
        fields: 'files(id, name, createdTime, size)',
      });

      return response.result.files || [];
    } catch (error) {
      console.error('❌ Failed to list Google Drive backups:', error);
      throw error;
    }
  }

  /**
   * Disconnect Google Drive
   */
  disconnectGoogleDrive() {
    if (window.gapi && gapi.auth2) {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut();
      }
    }

    this.providers.googleDrive = {
      enabled: false,
      clientId: null,
      accessToken: null,
      folderId: null,
      lastSync: null,
    };

    this.saveProviderSettings();
    console.log('❌ Google Drive disconnected');
  }

  // ==================== DROPBOX INTEGRATION ====================

  /**
   * Connect to Dropbox
   * @param {string} accessToken - Dropbox access token
   * @returns {Promise<boolean>}
   */
  async connectDropbox(accessToken) {
    try {
      // Verify token by getting account info
      const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid Dropbox access token');
      }

      const accountInfo = await response.json();

      this.providers.dropbox.accessToken = accessToken;
      this.providers.dropbox.enabled = true;

      // Create app folder
      await this.createDropboxFolder();

      this.saveProviderSettings();
      console.log('✅ Dropbox connected successfully:', accountInfo.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect Dropbox:', error);
      throw error;
    }
  }

  /**
   * Create app folder in Dropbox
   * @returns {Promise<void>}
   */
  async createDropboxFolder() {
    try {
      await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.providers.dropbox.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/Portfolio Manager Backups',
          autorename: false,
        }),
      });
      // Folder created or already exists
    } catch (error) {
      // Ignore error if folder already exists
    }
  }

  /**
   * Backup to Dropbox
   * @param {Object} data - Portfolio data
   * @returns {Promise<Object>} - Backup info
   */
  async backupToDropbox(data) {
    if (!this.providers.dropbox.enabled) {
      throw new Error('Dropbox not connected');
    }

    try {
      const timestamp = new Date().toISOString();
      const fileName = `portfolio-backup-${timestamp}.json`;
      const content = JSON.stringify(data, null, 2);

      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.providers.dropbox.accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `/Portfolio Manager Backups/${fileName}`,
            mode: 'add',
            autorename: true,
            mute: false,
          }),
        },
        body: content,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      this.providers.dropbox.lastSync = timestamp;
      this.addToBackupHistory('dropbox', fileName, result.id, content.length);
      this.saveProviderSettings();

      console.log('✅ Backed up to Dropbox:', fileName);
      return { provider: 'dropbox', fileId: result.id, fileName, timestamp };
    } catch (error) {
      console.error('❌ Dropbox backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore from Dropbox
   * @param {string} path - File path to restore
   * @returns {Promise<Object>} - Portfolio data
   */
  async restoreFromDropbox(path) {
    if (!this.providers.dropbox.enabled) {
      throw new Error('Dropbox not connected');
    }

    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.providers.dropbox.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path }),
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const content = await response.text();
      console.log('✅ Restored from Dropbox:', path);
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Dropbox restore failed:', error);
      throw error;
    }
  }

  /**
   * List Dropbox backups
   * @returns {Promise<Array>} - List of backup files
   */
  async listDropboxBackups() {
    if (!this.providers.dropbox.enabled) {
      throw new Error('Dropbox not connected');
    }

    try {
      const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.providers.dropbox.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/Portfolio Manager Backups',
          recursive: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const result = await response.json();
      return result.entries || [];
    } catch (error) {
      console.error('❌ Failed to list Dropbox backups:', error);
      throw error;
    }
  }

  /**
   * Disconnect Dropbox
   */
  disconnectDropbox() {
    this.providers.dropbox = {
      enabled: false,
      accessToken: null,
      lastSync: null,
    };

    this.saveProviderSettings();
    console.log('❌ Dropbox disconnected');
  }

  // ==================== AUTO-BACKUP ====================

  /**
   * Setup automatic backup
   * @param {number} frequencyMinutes - Backup frequency in minutes
   */
  setupAutoBackup(frequencyMinutes = 30) {
    this.stopAutoBackup();

    this.autoBackupFrequency = frequencyMinutes * 60 * 1000;

    this.autoBackupInterval = setInterval(() => {
      this.performAutoBackup();
    }, this.autoBackupFrequency);

    console.log(`✅ Auto-backup enabled: every ${frequencyMinutes} minutes`);
  }

  /**
   * Perform automatic backup to all enabled providers
   */
  async performAutoBackup() {
    if (this.isBackingUp) {
      console.log('⏳ Backup already in progress, skipping...');
      return;
    }

    try {
      this.isBackingUp = true;

      // Get portfolio data
      const data = window.getFondyData ? window.getFondyData() : null;
      if (!data || data.length === 0) {
        console.log('ℹ️ No data to backup');
        return;
      }

      const results = [];

      // Backup to enabled providers
      if (this.providers.googleDrive.enabled) {
        try {
          const result = await this.backupToGoogleDrive(data);
          results.push(result);
        } catch (error) {
          console.error('❌ Auto-backup to Google Drive failed:', error);
        }
      }

      if (this.providers.dropbox.enabled) {
        try {
          const result = await this.backupToDropbox(data);
          results.push(result);
        } catch (error) {
          console.error('❌ Auto-backup to Dropbox failed:', error);
        }
      }

      if (results.length > 0) {
        console.log(`✅ Auto-backup completed: ${results.length} provider(s)`);

        // Show toast notification
        if (typeof showToast === 'function') {
          showToast('success', 'Záloha', `Data zálohována do ${results.length} úložišť`);
        }
      }
    } catch (error) {
      console.error('❌ Auto-backup failed:', error);
    } finally {
      this.isBackingUp = false;
    }
  }

  /**
   * Stop automatic backup
   */
  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('❌ Auto-backup stopped');
    }
  }

  /**
   * Manual backup to all enabled providers
   * @param {Object} data - Portfolio data
   * @returns {Promise<Array>} - Backup results
   */
  async backupAll(data) {
    const results = [];

    if (this.providers.googleDrive.enabled) {
      try {
        const result = await this.backupToGoogleDrive(data);
        results.push(result);
      } catch (error) {
        console.error('❌ Google Drive backup failed:', error);
      }
    }

    if (this.providers.dropbox.enabled) {
      try {
        const result = await this.backupToDropbox(data);
        results.push(result);
      } catch (error) {
        console.error('❌ Dropbox backup failed:', error);
      }
    }

    return results;
  }

  // ==================== BACKUP HISTORY ====================

  /**
   * Add entry to backup history
   * @param {string} provider - Provider name
   * @param {string} fileName - File name
   * @param {string} fileId - File ID
   * @param {number} size - File size in bytes
   */
  addToBackupHistory(provider, fileName, fileId, size) {
    this.backupHistory.unshift({
      provider,
      fileName,
      fileId,
      size,
      timestamp: new Date().toISOString(),
    });

    // Limit history
    if (this.backupHistory.length > this.maxBackupHistory) {
      this.backupHistory = this.backupHistory.slice(0, this.maxBackupHistory);
    }

    this.saveBackupHistory();
  }

  /**
   * Get backup history
   * @returns {Array} - Backup history
   */
  getBackupHistory() {
    return [...this.backupHistory];
  }

  /**
   * Clear backup history
   */
  clearBackupHistory() {
    this.backupHistory = [];
    this.saveBackupHistory();
  }

  // ==================== PERSISTENCE ====================

  /**
   * Load provider settings from localStorage
   */
  loadProviderSettings() {
    try {
      const stored = localStorage.getItem('cloud_backup_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        // Don't restore sensitive tokens, user must reconnect
        this.autoBackupFrequency = settings.autoBackupFrequency || this.autoBackupFrequency;
      }
    } catch (error) {
      console.error('Failed to load provider settings:', error);
    }
  }

  /**
   * Save provider settings to localStorage
   */
  saveProviderSettings() {
    try {
      const settings = {
        autoBackupFrequency: this.autoBackupFrequency,
        googleDrive: {
          enabled: this.providers.googleDrive.enabled,
          lastSync: this.providers.googleDrive.lastSync,
        },
        dropbox: {
          enabled: this.providers.dropbox.enabled,
          lastSync: this.providers.dropbox.lastSync,
        },
      };
      localStorage.setItem('cloud_backup_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save provider settings:', error);
    }
  }

  /**
   * Load backup history from localStorage
   * @returns {Array} - Backup history
   */
  loadBackupHistory() {
    try {
      const stored = localStorage.getItem('backup_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load backup history:', error);
      return [];
    }
  }

  /**
   * Save backup history to localStorage
   */
  saveBackupHistory() {
    try {
      localStorage.setItem('backup_history', JSON.stringify(this.backupHistory));
    } catch (error) {
      console.error('Failed to save backup history:', error);
    }
  }
}

// Global instance
window.cloudBackupManager = new CloudBackupManager();

// Initialize UI
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCloudBackupUI);
} else {
  initCloudBackupUI();
}

function initCloudBackupUI() {
  createCloudBackupPanel();
  attachCloudBackupListeners();
}

/**
 * Create cloud backup settings panel
 */
function createCloudBackupPanel() {
  const panel = document.createElement('div');
  panel.id = 'cloud-backup-panel';
  panel.className = 'cloud-backup-panel hidden';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>☁️ Cloudové zálohování</h3>
      <button id="close-cloud-panel" class="btn-icon" aria-label="Zavřít">✕</button>
    </div>
    
    <div class="panel-content">
      <!-- Google Drive Section -->
      <div class="provider-section">
        <h4>📁 Google Drive</h4>
        <div id="google-drive-status" class="status-disconnected">
          <span class="status-icon">❌</span>
          <span>Nepřipojeno</span>
        </div>
        <div class="provider-actions">
          <button id="connect-google-drive" class="btn-primary">Připojit Google Drive</button>
          <button id="disconnect-google-drive" class="btn-secondary hidden">Odpojit</button>
          <button id="backup-google-drive" class="btn-secondary hidden">💾 Zálohovat</button>
        </div>
      </div>

      <!-- Dropbox Section -->
      <div class="provider-section">
        <h4>📦 Dropbox</h4>
        <div id="dropbox-status" class="status-disconnected">
          <span class="status-icon">❌</span>
          <span>Nepřipojeno</span>
        </div>
        <div class="provider-actions">
          <button id="connect-dropbox" class="btn-primary">Připojit Dropbox</button>
          <button id="disconnect-dropbox" class="btn-secondary hidden">Odpojit</button>
          <button id="backup-dropbox" class="btn-secondary hidden">💾 Zálohovat</button>
        </div>
      </div>

      <!-- Auto-backup Settings -->
      <div class="auto-backup-section">
        <h4>⏰ Automatické zálohování</h4>
        <label for="backup-frequency">Frekvence (minuty):</label>
        <input type="number" id="backup-frequency" value="30" min="5" max="1440" />
        <button id="apply-auto-backup" class="btn-primary">Použít</button>
      </div>

      <!-- Backup Now -->
      <div class="manual-backup-section">
        <button id="backup-now" class="btn-large btn-success">💾 Zálohovat nyní</button>
      </div>

      <!-- Backup History -->
      <div class="backup-history-section">
        <h4>📜 Historie záloh</h4>
        <div id="backup-history-list"></div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
}

/**
 * Attach cloud backup event listeners
 */
function attachCloudBackupListeners() {
  // Close panel
  document.getElementById('close-cloud-panel')?.addEventListener('click', () => {
    document.getElementById('cloud-backup-panel')?.classList.add('hidden');
  });

  // Google Drive connection
  document.getElementById('connect-google-drive')?.addEventListener('click', async () => {
    const clientId = prompt('Zadejte Google OAuth Client ID:');
    if (clientId) {
      try {
        await window.cloudBackupManager.connectGoogleDrive(clientId);
        updateCloudBackupUI();
        alert('✅ Google Drive připojeno');
      } catch (error) {
        alert(`❌ Chyba připojení Google Drive: ${error.message}`);
      }
    }
  });

  // Dropbox connection
  document.getElementById('connect-dropbox')?.addEventListener('click', async () => {
    const token = prompt('Zadejte Dropbox Access Token:');
    if (token) {
      try {
        await window.cloudBackupManager.connectDropbox(token);
        updateCloudBackupUI();
        alert('✅ Dropbox připojeno');
      } catch (error) {
        alert(`❌ Chyba připojení Dropbox: ${error.message}`);
      }
    }
  });

  // Manual backup
  document.getElementById('backup-now')?.addEventListener('click', async () => {
    const data = window.getFondyData ? window.getFondyData() : null;
    if (!data) {
      alert('Žádná data k zálohování');
      return;
    }

    try {
      const results = await window.cloudBackupManager.backupAll(data);
      alert(`✅ Záloha dokončena: ${results.length} úložišť`);
      updateCloudBackupUI();
    } catch (error) {
      alert(`❌ Chyba zálohování: ${error.message}`);
    }
  });

  // Apply auto-backup frequency
  document.getElementById('apply-auto-backup')?.addEventListener('click', () => {
    const frequency = parseInt(document.getElementById('backup-frequency').value, 10);
    if (frequency >= 5) {
      window.cloudBackupManager.setupAutoBackup(frequency);
      alert(`✅ Auto-backup nastaven: každých ${frequency} minut`);
    }
  });
}

/**
 * Update cloud backup UI
 */
function updateCloudBackupUI() {
  const gdStatus = document.getElementById('google-drive-status');
  const dbStatus = document.getElementById('dropbox-status');

  // Update statuses
  if (window.cloudBackupManager.providers.googleDrive.enabled) {
    gdStatus.innerHTML = '<span class="status-icon">✅</span><span>Připojeno</span>';
    gdStatus.className = 'status-connected';
    document.getElementById('connect-google-drive').classList.add('hidden');
    document.getElementById('disconnect-google-drive').classList.remove('hidden');
    document.getElementById('backup-google-drive').classList.remove('hidden');
  }

  if (window.cloudBackupManager.providers.dropbox.enabled) {
    dbStatus.innerHTML = '<span class="status-icon">✅</span><span>Připojeno</span>';
    dbStatus.className = 'status-connected';
    document.getElementById('connect-dropbox').classList.add('hidden');
    document.getElementById('disconnect-dropbox').classList.remove('hidden');
    document.getElementById('backup-dropbox').classList.remove('hidden');
  }

  // Update history
  const historyEl = document.getElementById('backup-history-list');
  const history = window.cloudBackupManager.getBackupHistory();
  historyEl.innerHTML =
    history
      .slice(0, 10)
      .map(
        (h) => `
    <div class="history-item">
      <span class="provider-badge">${h.provider}</span>
      <span class="file-name">${h.fileName}</span>
      <span class="timestamp">${new Date(h.timestamp).toLocaleString('cs-CZ')}</span>
    </div>
  `,
      )
      .join('') || '<p>Žádná historie</p>';
}
