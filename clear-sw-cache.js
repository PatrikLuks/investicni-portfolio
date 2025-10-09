/**
 * 🧹 Service Worker Cache Cleaner
 * Use this in browser console to clear Service Worker cache
 * 
 * USAGE:
 * 1. Open browser console (Cmd+Option+I in Safari)
 * 2. Paste this entire script
 * 3. Press Enter
 * 4. Refresh page (Cmd+Shift+R)
 */

(async function clearServiceWorkerCache() {
  console.log('🧹 Starting Service Worker cache cleanup...');
  
  try {
    // 1. Unregister all Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`📦 Found ${registrations.length} Service Worker(s)`);
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Unregistered Service Worker:', registration.scope);
      }
    }
    
    // 2. Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`📦 Found ${cacheNames.length} cache(s):`, cacheNames);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('✅ Deleted cache:', cacheName);
      }
    }
    
    // 3. Clear localStorage
    localStorage.clear();
    console.log('✅ Cleared localStorage');
    
    // 4. Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');
    
    console.log('');
    console.log('🎉 Cache cleanup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Close this tab');
    console.log('2. Open new tab');
    console.log('3. Navigate to: http://localhost:3002/');
    console.log('4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
})();

// Alternative: Quick unregister (if above doesn't work)
// navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
