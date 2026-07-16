// Auto-generated runtime loader for thin Canvas shell.
(function () {
  var CDN = "https://cdn.jsdelivr.net/gh/arulbarker/affgo-cdn@main";

  // Patch addEventListener
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

  function autoLogin() {
    console.log('[Bootstrap] Auto-login as default user.');
    const defaultEmail = 'user@affgo.com';
    const defaultToken = 'auto-login-token';
    const defaultName = 'User';

    try {
      localStorage.setItem("affiliatego_email", defaultEmail);
      localStorage.setItem("affiliatego_token", defaultToken);
      localStorage.setItem("affiliatego_name", defaultName);
      
      window.isAdFree = true;
      window.favoritFeatureActive = true;
      if (typeof updateAdFreeBadge === "function") updateAdFreeBadge();

      var loginOverlay = document.getElementById('login-overlay');
      if (loginOverlay) loginOverlay.style.display = 'none';
      
      var mainApp = document.getElementById('main-app');
      if (mainApp) mainApp.classList.add('unlocked');
      
      var userBadge = document.getElementById('userInfoBadge');
      if (userBadge) userBadge.classList.add('active');
      
      var nameDisplay = document.getElementById('userNameDisplay');
      if (nameDisplay) nameDisplay.innerText = defaultName;

      if (typeof bukaAplikasi === 'function') {
          bukaAplikasi(defaultName);
      }
      
      console.log('[Bootstrap] Auto-login successful.');
    } catch (e) {
      console.error('[Bootstrap] Auto-login failed:', e);
    }
  }

  (async function boot() {
    try {
      // 1. Fetch body HTML
      var bodyRes = await fetch(CDN + '/body.html');
      if (!bodyRes.ok) throw new Error('Fetch body.html → HTTP ' + bodyRes.status);
      var bodyHtml = await bodyRes.text();

      var loader = document.getElementById('__loader');
      if (loader) loader.remove();
      document.body.insertAdjacentHTML('afterbegin', bodyHtml);

      // 2. Load ONLY bundle-classic.js (skip bundle-module.js)
      await loadScript(CDN + '/bundle-classic.js', false);
      
      // 3. Auto-login immediately after classic bundle loads
      autoLogin();
      
    } catch (err) {
      console.error('Bootstrap failed:', err);
      showError(err && err.message ? err.message : String(err));
    }
  })();
})();
