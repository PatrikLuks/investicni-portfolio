/**
 * 🧹 AGGRESSIVE SERVICE WORKER & CACHE CLEANUP SCRIPT
 * 
 * Purpose: Forcefully remove ALL Service Workers and caches
 * Use case: Development environment or when switching ports/versions
 * 
 * Instructions:
 * 1. Open Web Inspector (Cmd+Option+I on Mac, F12 on Windows)
 * 2. Go to Console tab
 * 3. Copy and paste this ENTIRE script
 * 4. Press Enter
 * 5. Wait for auto-reload OR follow manual steps
 * 
 * What it does:
 * - Unregisters ALL Service Workers (all scopes)
 * - Deletes ALL Cache API caches
 * - Clears localStorage
 * - Clears sessionStorage
 * - Auto-reloads page after 3 seconds
 */

(async function aggressiveCacheClear() {
  console.log('%c🧹 Starting AGGRESSIVE cache cleanup...', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
  
  let success = true;
  let errors = [];
  
  // Step 1: Unregister ALL Service Workers
  try {
    console.log('📋 Step 1/5: Unregistering Service Workers...');
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.log('  ✅ No Service Workers registered');
    } else {
      console.log(`  🔧 Found ${registrations.length} Service Worker(s)`);
      
      for (const registration of registrations) {
        const scope = registration.scope;
        const unregistered = await registration.unregister();
        
        if (unregistered) {
          console.log(`  ✅ Unregistered: ${scope}`);
        } else {
          console.log(`  ❌ Failed to unregister: ${scope}`);
          errors.push(`Failed to unregister SW: ${scope}`);
        }
      }
    }
  } catch (error) {
    console.error('  ❌ Error unregistering Service Workers:', error);
    errors.push(`Service Worker error: ${error.message}`);
    success = false;
  }
  
  // Step 2: Delete ALL Cache API caches
  try {
    console.log('📋 Step 2/5: Deleting Cache API caches...');
    const cacheNames = await caches.keys();
    
    if (cacheNames.length === 0) {
      console.log('  ✅ No caches found');
    } else {
      console.log(`  🔧 Found ${cacheNames.length} cache(s)`);
      
      for (const cacheName of cacheNames) {
        const deleted = await caches.delete(cacheName);
        
        if (deleted) {
          console.log(`  ✅ Deleted cache: ${cacheName}`);
        } else {
          console.log(`  ❌ Failed to delete: ${cacheName}`);
          errors.push(`Failed to delete cache: ${cacheName}`);
        }
      }
    }
  } catch (error) {
    console.error('  ❌ Error deleting caches:', error);
    errors.push(`Cache deletion error: ${error.message}`);
    success = false;
  }
  
  // Step 3: Clear localStorage
  try {
    console.log('📋 Step 3/5: Clearing localStorage...');
    const itemCount = localStorage.length;
    localStorage.clear();
    console.log(`  ✅ Cleared ${itemCount} localStorage items`);
  } catch (error) {
    console.error('  ❌ Error clearing localStorage:', error);
    errors.push(`localStorage error: ${error.message}`);
  }
  
  // Step 4: Clear sessionStorage
  try {
    console.log('📋 Step 4/5: Clearing sessionStorage...');
    const itemCount = sessionStorage.length;
    sessionStorage.clear();
    console.log(`  ✅ Cleared ${itemCount} sessionStorage items`);
  } catch (error) {
    console.error('  ❌ Error clearing sessionStorage:', error);
    errors.push(`sessionStorage error: ${error.message}`);
  }
  
  // Step 5: Summary and reload
  console.log('📋 Step 5/5: Cleanup summary');
  
  if (success && errors.length === 0) {
    console.log('%c✅ CLEANUP SUCCESSFUL!', 'color: #51cf66; font-size: 18px; font-weight: bold;');
    console.log('');
    console.log('%c📌 NEXT STEPS:', 'color: #339af0; font-size: 14px; font-weight: bold;');
    console.log('1. Close this browser tab completely');
    console.log('2. Clear browser cache: Cmd+Option+E (Safari) or Ctrl+Shift+Delete');
    console.log('3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)');
    console.log('4. Open fresh tab to http://localhost:8080/');
    console.log('');
    console.log('%c⏳ Auto-reloading in 3 seconds...', 'color: #ffd43b; font-size: 12px;');
    
    // Auto-reload after 3 seconds
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload(true); // Force reload from server
    }, 3000);
    
  } else {
    console.log('%c⚠️  CLEANUP COMPLETED WITH ERRORS', 'color: #ffd43b; font-size: 18px; font-weight: bold;');
    console.log('');
    console.log('%c❌ Errors encountered:', 'color: #ff6b6b; font-size: 14px;');
    errors.forEach(err => console.log(`  • ${err}`));
    console.log('');
    console.log('%c📌 MANUAL STEPS REQUIRED:', 'color: #339af0; font-size: 14px; font-weight: bold;');
    console.log('1. Close ALL browser tabs with this app');
    console.log('2. Quit and restart your browser completely');
    console.log('3. Clear browser cache: Cmd+Option+E (Safari)');
    console.log('4. Open fresh tab to http://localhost:8080/');
  }
  
  return {
    success: success && errors.length === 0,
    errors: errors,
    timestamp: new Date().toISOString()
  };
})();
