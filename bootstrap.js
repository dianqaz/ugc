// Auto-generated runtime loader for thin Canvas shell.
// Fetches body.html + bundle-classic.js + bundle-module.js from jsDelivr,
// patches DOMContentLoaded semantics so dynamically-loaded scripts see the
// event fire even though it already passed during initial shell parse.
(function () {
  var CDN = "https://cdn.jsdelivr.net/gh/arulbarker/affgo-cdn@main";

  // Patch addEventListener once: when a script registers a DOMContentLoaded
  // handler AFTER the event has already fired (which is always the case here
  // since bundles load dynamically), invoke the handler on next microtask
  // instead of silently ignoring it.
  var _origAdd = document.addEventListener;
  document.addEventListener = function (type, listener, opts) {
    if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
      Promise.resolve().then(function () { try { listener(); } catch (e) { console.error(e); } });
      return;
    }
    return _origAdd.call(this, type, listener, opts);
  };

  function loadScript(url, isModule) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      if (isModule) s.type = 'module';
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + url)); };
      document.body.appendChild(s);
    });
  }

  function showError(msg) {
    document.body.innerHTML =
      '<div style="padding:24px;color:#fff;background:#3a0a0a;font-family:system-ui;min-height:100vh;">'
      + '<h2 style="margin:0 0 12px">Boot error</h2>'
      + '<pre style="white-space:pre-wrap;word-break:break-word">' + (msg || 'Unknown error') + '</pre>'
      + '<p style="margin-top:16px;opacity:.7">Buka DevTools console untuk detail teknis.</p>'
      + '</div>';
  }

  // Function to auto-login as a default user
  function autoLogin() {
    console.log('[Bootstrap] Auto-login as default user.');
    const defaultEmail = 'user@affgo.com';
    const defaultToken = 'auto-login-token';
    const defaultName = 'User';

    // Set local storage
    try {
      localStorage.setItem("affiliatego_email", defaultEmail);
      localStorage.setItem("affiliatego_token", defaultToken);
      localStorage.setItem("affiliatego_name", defaultName);
      
      // IMPORTANT: Set ad-free and favorit feature active so all features are unlocked
      window.isAdFree = true;
      window.favoritFeatureActive = true;
      if (typeof updateAdFreeBadge === "function") updateAdFreeBadge();

      // Show main app and hide login
      document.getElementById('login-overlay').style.display = 'none';
      const mainApp = document.getElementById('main-app');
      if (mainApp) {
          mainApp.classList.add('unlocked');
      }
      
      // Show user badge
      const userBadge = document.getElementById('userInfoBadge');
      if (userBadge) {
          userBadge.classList.add('active');
      }
      
      const nameDisplay = document.getElementById('userNameDisplay');
      if (nameDisplay) {
          nameDisplay.innerText = defaultName;
      }

      // Call any additional initialization
      if (typeof bukaAplikasi === 'function') {
          bukaAplikasi(defaultName);
      }
      
      console.log('[Bootstrap] Auto-login successful.');
    } catch (e) {
      console.error('[Bootstrap] Auto-login failed:', e);
      showError('Auto-login failed. Please try refreshing the page.');
    }
  }

  (async function boot() {
    try {
      // 1. Fetch body HTML (the actual app structure: 86 tab panels, login, modals)
      var bodyRes = await fetch(CDN + '/body.html');
      if (!bodyRes.ok) throw new Error('Fetch body.html → HTTP ' + bodyRes.status);
      var bodyHtml = await bodyRes.text();

      // 2. Swap placeholder loader with real body
      var loader = document.getElementById('__loader');
      if (loader) loader.remove();
      document.body.insertAdjacentHTML('afterbegin', bodyHtml);

      // 3. Load bundles in original document order: classic first (was inline blocking),
      //    then module (was deferred). Awaiting load preserves execution order.
      await loadScript(CDN + '/bundle-classic.js', false);
      await loadScript(CDN + '/bundle-module.js', true);
      
      // 4. Auto-login after everything is loaded
      // Use a slight delay to ensure DOM and other scripts are fully ready
      setTimeout(autoLogin, 100);
      
    } catch (err) {
      console.error('Bootstrap failed:', err);
      showError(err && err.message ? err.message : String(err));
    }
  })();
})();