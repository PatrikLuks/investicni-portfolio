/**
 * PHASE 5: User Authentication Service
 * Firebase Authentication with Google, Email/Password, and GitHub sign-in
 *
 * Setup instructions:
 * 1. Create Firebase project at firebase.google.com
 * 2. Enable Authentication (Email/Password, Google, GitHub)
 * 3. Replace firebaseConfig below with your Firebase credentials
 * 4. Run: npm install firebase
 */

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

class AuthenticationService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.listeners = [];

    // Check if Firebase is available
    this.firebaseAvailable = typeof firebase !== 'undefined';

    if (!this.firebaseAvailable) {
      console.warn('[Auth] Firebase not available - using local storage fallback');
      this.loadLocalUser();
    }
  }

  /**
   * Initialize Firebase Authentication
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      if (!this.firebaseAvailable) {
        console.log('[Auth] Skipping Firebase init - not installed');
        this.isInitialized = true;
        return;
      }

      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);

      const auth = firebase.auth();

      // Listen for auth state changes
      auth.onAuthStateChanged((user) => {
        this.setCurrentUser(user);
        this.notifyListeners();
      });

      this.isInitialized = true;
      console.log('[Auth] Firebase initialized');
    } catch (error) {
      console.error('[Auth] Initialization failed:', error);
      this.useLocalStorageFallback();
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email, password, displayName = '') {
    try {
      if (!this.firebaseAvailable) {
        return this.signUpLocal(email, password, displayName);
      }

      const auth = firebase.auth();
      const result = await auth.createUserWithEmailAndPassword(email, password);

      if (displayName) {
        await result.user.updateProfile({ displayName });
      }

      this.setCurrentUser(result.user);
      this.notifyListeners();
      return result.user;
    } catch (error) {
      console.error('[Auth] Sign up failed:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      if (!this.firebaseAvailable) {
        return this.signInLocal(email, password);
      }

      const auth = firebase.auth();
      const result = await auth.signInWithEmailAndPassword(email, password);

      this.setCurrentUser(result.user);
      this.notifyListeners();
      return result.user;
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      if (!this.firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      const auth = firebase.auth();
      const provider = new firebase.auth.GoogleAuthProvider();

      const result = await auth.signInWithPopup(provider);
      this.setCurrentUser(result.user);
      this.notifyListeners();
      return result.user;
    } catch (error) {
      console.error('[Auth] Google sign in failed:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub() {
    try {
      if (!this.firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      const auth = firebase.auth();
      const provider = new firebase.auth.GithubAuthProvider();

      const result = await auth.signInWithPopup(provider);
      this.setCurrentUser(result.user);
      this.notifyListeners();
      return result.user;
    } catch (error) {
      console.error('[Auth] GitHub sign in failed:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      if (this.firebaseAvailable) {
        const auth = firebase.auth();
        await auth.signOut();
      } else {
        this.signOutLocal();
      }

      this.setCurrentUser(null);
      this.notifyListeners();
    } catch (error) {
      console.error('[Auth] Sign out failed:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get user ID token for backend requests
   */
  async getUserToken() {
    if (!this.currentUser) return null;

    if (this.firebaseAvailable) {
      return await this.currentUser.getIdToken();
    }

    return localStorage.getItem('auth_token');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      if (this.firebaseAvailable) {
        await this.currentUser.updateProfile(updates);
      } else {
        // Local storage update
        const user = this.loadLocalUser();
        Object.assign(user, updates);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      this.setCurrentUser(this.firebaseAvailable ? firebase.auth().currentUser : this.currentUser);
      this.notifyListeners();
    } catch (error) {
      console.error('[Auth] Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      if (!this.firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      const auth = firebase.auth();
      await auth.sendPasswordResetEmail(email);
      console.log('[Auth] Password reset email sent to', email);
    } catch (error) {
      console.error('[Auth] Password reset failed:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * LOCAL STORAGE FALLBACK (for development without Firebase)
   */
  signUpLocal(email, password, displayName) {
    const users = JSON.parse(localStorage.getItem('auth_users') || '{}');

    if (users[email]) {
      throw new Error('User already exists');
    }

    const user = {
      uid: 'local_' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0],
      password: btoa(password), // Simple encoding (NOT for production!)
      createdAt: new Date().toISOString(),
    };

    users[email] = user;
    localStorage.setItem('auth_users', JSON.stringify(users));

    this.setCurrentUser(user);
    this.notifyListeners();
    return user;
  }

  signInLocal(email, password) {
    const users = JSON.parse(localStorage.getItem('auth_users') || '{}');
    const user = users[email];

    if (!user || atob(user.password) !== password) {
      throw new Error('Invalid email or password');
    }

    this.setCurrentUser(user);
    localStorage.setItem('auth_token', 'local_token_' + Date.now());
    this.notifyListeners();
    return user;
  }

  signOutLocal() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  loadLocalUser() {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
    return this.currentUser;
  }

  useLocalStorageFallback() {
    console.log('[Auth] Using local storage fallback mode');
    this.loadLocalUser();
  }

  /**
   * Internal methods
   */
  setCurrentUser(user) {
    this.currentUser = user
      ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
          emailVerified: user.emailVerified,
        }
      : null;

    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback) {
    this.listeners.push(callback);

    // Call immediately with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  /**
   * Helper: Convert Firebase error codes to user-friendly messages
   */
  getErrorMessage(code) {
    const messages = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'User account has been disabled',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already in use',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/too-many-requests': 'Too many login attempts. Please try again later',
      'auth/popup-blocked': 'Sign-in popup was blocked',
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
    };

    return messages[code] || 'Authentication failed: ' + code;
  }
}

// Export singleton instance
window.authService = new AuthenticationService();

export default AuthenticationService;
