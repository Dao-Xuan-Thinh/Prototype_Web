/* ===== js/dashboard-shell.js =====
 * Injects the shared dashboard chrome (sidebar + topbar) for inner pages.
 *
 * Usage:
 *   <body data-active-page="settings">   <!-- or "forum", "buy", "profile" -->
 *   <div id="db-shell-sidebar"></div>
 *   <div id="db-shell-topbar"></div>
 *   <script src="../../js/dashboard-shell.js" defer></script>
 *
 * Auth: reads rg_token from localStorage or sessionStorage.
 *       Redirects to login.html if missing.
 */
(function () {
  'use strict';

  function getCookie(name) {
    const m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function getToken()   { return localStorage.getItem('rg_token') || sessionStorage.getItem('rg_token') || getCookie('rg_tkn'); }
  function getUser()    {
    try {
      const raw = localStorage.getItem('rg_user') || sessionStorage.getItem('rg_user') || getCookie('rg_usr');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function clearAuth() {
    ['rg_token','rg_user'].forEach(k => {
      localStorage.removeItem(k); sessionStorage.removeItem(k);
    });
    document.cookie = 'rg_tkn=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'rg_usr=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }

  // Restore session from server HttpOnly cookie when client-side storage is empty
  async function tryRestoreSession() {
    if (getToken()) return;
    try {
      const r = await fetch('/api/auth/session', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        sessionStorage.setItem('rg_token', d.token);
        sessionStorage.setItem('rg_user', JSON.stringify(d.user));
      }
    } catch {}
  }

  // Depth-aware path prefix (for pages 1 or 2 levels deep in /pages/)
  function getBase() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last  = parts[parts.length - 1] || '';
    const dirs  = last.includes('.') ? parts.slice(0, -1) : parts;
    return dirs.length === 0 ? './' : '../'.repeat(dirs.length);
  }
  const base = getBase();

  // Which nav item is active
  const activePage = document.body.dataset.activePage || '';

  function navItem(page, href, iconSVG, label, disabled) {
    if (disabled) {
      return `<span class="db-nav-item db-nav-disabled">${iconSVG}<span class="db-nav-label">${label} <span class="db-nav-soon">Soon</span></span></span>`;
    }
    const active = activePage === page ? ' db-nav-active' : '';
    return `<a href="${base}${href}" class="db-nav-item${active}">${iconSVG}<span class="db-nav-label">${label}</span></a>`;
  }

  const sidebarHTML = `
    <aside class="db-sidebar" id="db-sidebar">
      <div class="db-sidebar-header">
        <a href="${base}pages/dashboard/dashboard.html" class="db-sidebar-logo" style="text-decoration:none">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="11" height="11" rx="3" fill="#6c47ff"/>
            <rect x="15" y="2" width="11" height="11" rx="3" fill="#6c47ff" opacity="0.55"/>
            <rect x="2" y="15" width="11" height="11" rx="3" fill="#6c47ff" opacity="0.55"/>
            <rect x="15" y="15" width="11" height="11" rx="3" fill="#6c47ff" opacity="0.3"/>
          </svg>
          <span class="db-sidebar-brand"><span>Research</span><span class="brand-gate">Gate</span></span>
        </a>
        <div class="db-hist-btns">
          <button onclick="history.back()" class="db-hist-btn" title="Back">&#8249;</button>
          <button onclick="history.forward()" class="db-hist-btn" title="Forward">&#8250;</button>
        </div>
      </div>

      <nav class="db-nav">
        <div class="db-nav-section-label">Research</div>
        ${navItem('overview', 'pages/dashboard/dashboard.html',
          `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="11" y="3" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/><rect x="2" y="12" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/><rect x="11" y="12" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/></svg>`,
          'Overview'
        )}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M14 14l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, 'Search &amp; Discover', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M4 4h12v12H4z" stroke="currentColor" stroke-width="1.5" rx="2"/><path d="M7 8h6M7 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`, 'My Documents', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5 5.6.8-4 4 .9 5.5L10 15l-4.9 2.3.9-5.5-4-4 5.6-.8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`, 'Saved Papers', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`, 'Upload', true)}

        <div class="db-nav-section-label">AI Tools</div>
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M7 10c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="1.2" fill="currentColor"/></svg>`, 'AI Summariser', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h10M3 14h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, 'Smart Q&amp;A', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M4 16l3-7 3 4 3-6 3 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 'Trend Analyser', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 'Citation Helper', true)}

        <div class="db-nav-section-label">Community</div>
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="9" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 17c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.6"/><path d="M14 13c2 .5 4 1.8 4 4" stroke="currentColor" stroke-width="1.4"/></svg>`, 'Find Mentors', true)}
        ${navItem('forum', 'pages/forum/forum.html',
          `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 5V4a1 1 0 012 0v1M11 5V4a1 1 0 012 0v1" stroke="currentColor" stroke-width="1.4"/><path d="M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
          'Forum'
        )}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M3 4h14v9H3z" stroke="currentColor" stroke-width="1.6"/><path d="M7 17h6M10 13v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`, 'Study Groups', true)}

        <div class="db-nav-section-label">Other</div>
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M10 7v3l2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`, 'History', true)}
        ${navItem('', '', `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zM10 8v4M10 14h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`, 'Help &amp; Support', true)}
        ${navItem('settings', 'pages/settings/settings.html',
          `<svg class="db-nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
          'Settings'
        )}
      </nav>

      <button class="db-sidebar-toggle-btn" id="db-sidebar-toggle-btn" onclick="dbShellToggleLeftSidebar()" title="Collapse/Expand sidebar">
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <div class="db-sidebar-upgrade">
        <div class="db-upgrade-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2l2.4 5 5.6.8-4 4 .9 5.5L11 15l-4.9 2.3.9-5.5-4-4 5.6-.8z" fill="#f59e0b"/></svg>
        </div>
        <div class="db-upgrade-text">
          <div class="db-upgrade-title">Go Premium</div>
          <div class="db-upgrade-sub">Unlimited AI + advanced tools</div>
        </div>
        <a href="${base}pages/buy/buy.html" class="db-upgrade-btn-active">Upgrade</a>
      </div>
    </aside>`;

  const userName  = (() => { const u = getUser(); return u ? (u.full_name || u.username || 'User') : 'User'; })();
  const userLetter = userName.charAt(0).toUpperCase();
  const isGuest = (() => { const u = getUser(); return u && u.is_guest; })();

  const topbarHTML = `
    <header class="db-topbar" id="db-topbar">
      <div class="db-topbar-search" id="db-shell-search-wrap">
        <svg class="db-search-icon" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#9ca3af" stroke-width="1.8"/><path d="M14 14l3 3" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="text" id="db-shell-search-input" placeholder="Search…" class="db-topbar-input" oninput="dbShellSearch(this.value)" />
      </div>
      <div class="db-topbar-right">
        <span class="db-premium-badge">FREE</span>
        ${isGuest ? '<span class="db-guest-badge">GUEST</span>' : ''}
        <button class="db-icon-btn db-btn-disabled" title="Notifications coming soon" disabled>
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.6"/><path d="M8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
        <div class="db-user-chip-wrap" id="db-shell-user-wrap">
          <div class="db-user-chip" id="db-shell-user-chip" onclick="dbShellToggleDropdown(event)">
            <div class="db-user-avatar">${userLetter}</div>
            <span class="db-user-name">${userName}</span>
            <svg class="db-chip-chevron" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="db-user-dropdown" id="db-shell-user-dropdown">
            <a href="${base}pages/profile/profile.html" class="db-dropdown-item">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M3 19c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              Profile
            </a>
            <a href="${base}pages/settings/settings.html" class="db-dropdown-item">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              Settings
            </a>
            <div class="db-dropdown-divider"></div>
            <button onclick="dbShellLogout()" class="db-dropdown-item db-dropdown-logout">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13 3h4v14h-4M8 7l-4 3 4 3M4 10h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>`;

  const logoutModalHTML = `
    <div id="db-shell-logout-modal" class="db-modal-overlay" style="display:none" onclick="dbShellCancelLogout()">
      <div class="db-modal-box" onclick="event.stopPropagation()">
        <h3 class="db-modal-title">Log out of ResearchGate?</h3>
        <p class="db-modal-text">You'll need to sign in again to access your account.</p>
        <div class="db-modal-actions">
          <button onclick="dbShellCancelLogout()" class="db-modal-btn-cancel">Cancel</button>
          <button onclick="dbShellDoLogout()" class="db-modal-btn-confirm">Log Out</button>
        </div>
      </div>
    </div>`;

  function inject() {
    // Auth guard – redirect if no token (session restore already attempted)
    const token = getToken();
    if (!token) {
      window.location.href = base + 'pages/auth/login.html';
      return;
    }

    const sidebarRoot = document.getElementById('db-shell-sidebar');
    if (sidebarRoot) sidebarRoot.outerHTML = sidebarHTML;

    const topbarRoot = document.getElementById('db-shell-topbar');
    if (topbarRoot) topbarRoot.outerHTML = topbarHTML;

    document.body.insertAdjacentHTML('beforeend', logoutModalHTML);
    // Mobile sidebar overlay
    document.body.insertAdjacentHTML('beforeend', '<div class="db-sidebar-overlay" id="db-sidebar-overlay" onclick="dbShellCloseSidebar()"></div>');

    // Inject hamburger into topbar
    const topbar = document.getElementById('db-topbar');
    if (topbar) {
      const ham = document.createElement('button');
      ham.className = 'db-hamburger';
      ham.title = 'Open menu';
      ham.setAttribute('aria-label', 'Open sidebar');
      ham.innerHTML = '<svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      ham.onclick = () => dbShellToggleSidebar();
      topbar.insertBefore(ham, topbar.firstChild);
    }

    // Update search placeholder based on page context
    const ctx = document.body.dataset.searchContext || '';
    const searchInput = document.getElementById('db-shell-search-input');
    if (searchInput) {
      const placeholders = { forum: 'Search forum posts…', documents: 'Search documents…' };
      searchInput.placeholder = placeholders[ctx] || 'Search…';
    }

    // Restore left sidebar collapsed state
    if (localStorage.getItem('rg_left_sidebar_collapsed') === 'true') {
      document.body.classList.add('db-left-sidebar-collapsed');
    }

    // Apply saved font globally
    const savedFont = localStorage.getItem('protocol_font');
    if (savedFont) {
      document.body.style.fontFamily = "'" + savedFont + "', monospace";
      const fontLink = document.getElementById('custom-font-link');
      const FONT_URLS = {
        'JetBrains Mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        'Fira Code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
        'Victor Mono': 'https://fonts.googleapis.com/css2?family=Victor+Mono:wght@400;500;600&display=swap',
        'Space Mono': 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
        'Inconsolata': 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&display=swap',
      };
      if (!fontLink && FONT_URLS[savedFont]) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'custom-font-link';
        link.href = FONT_URLS[savedFont];
        document.head.appendChild(link);
      }
    }

    // Click outside to close dropdown
    document.addEventListener('click', () => {
      const wrap = document.getElementById('db-shell-user-wrap');
      if (wrap) wrap.classList.remove('db-dropdown-open');
    });

    // Heartbeat
    const hbToken = getToken();
    if (hbToken) {
      const heartbeat = () => fetch('/api/auth/heartbeat', {
        method: 'POST', headers: { Authorization: 'Bearer ' + hbToken }
      }).catch(() => {});
      heartbeat();
      setInterval(heartbeat, 5000);
    }
  }

  window.dbShellToggleLeftSidebar = function() {
    const collapsed = document.body.classList.toggle('db-left-sidebar-collapsed');
    localStorage.setItem('rg_left_sidebar_collapsed', collapsed ? 'true' : 'false');
    const btn = document.getElementById('db-sidebar-toggle-btn');
    if (btn) {
      btn.querySelector('svg path').setAttribute('d', collapsed ? 'M7 4l6 6-6 6' : 'M13 4l-6 6 6 6');
    }
  };

  window.dbShellToggleDropdown = function(e) {
    e.stopPropagation();
    const wrap = document.getElementById('db-shell-user-wrap');
    if (wrap) wrap.classList.toggle('db-dropdown-open');
  };

  window.dbShellToggleSidebar = function() {
    const sidebar = document.querySelector('.db-sidebar');
    const overlay = document.getElementById('db-sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('db-sidebar-open');
    if (overlay) overlay.classList.toggle('active', sidebar.classList.contains('db-sidebar-open'));
  };

  window.dbShellCloseSidebar = function() {
    const sidebar = document.querySelector('.db-sidebar');
    const overlay = document.getElementById('db-sidebar-overlay');
    if (sidebar) sidebar.classList.remove('db-sidebar-open');
    if (overlay) overlay.classList.remove('active');
  };

  // Context-aware search (debounced 300ms)
  let _searchTimer = null;
  window.dbShellSearch = function(query) {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      const ctx = document.body.dataset.searchContext || '';
      if (ctx === 'forum' && typeof window.forumSearch === 'function') {
        window.forumSearch(query);
      }
      // future contexts: 'documents', 'profile', etc.
    }, 300);
  };
  window.dbShellLogout = function() {
    const wrap = document.getElementById('db-shell-user-wrap');
    if (wrap) wrap.classList.remove('db-dropdown-open');
    const modal = document.getElementById('db-shell-logout-modal');
    if (modal) modal.style.display = 'flex';
  };
  window.dbShellCancelLogout = function() {
    const modal = document.getElementById('db-shell-logout-modal');
    if (modal) modal.style.display = 'none';
  };
  window.dbShellDoLogout = function() {
    clearAuth();
    fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }).catch(() => {});
    window.location.href = base + 'pages/auth/login.html';
  };

  async function restoreAndInject() {
    const hadToken = !!getToken();
    await tryRestoreSession();
    inject();
    // If session was just restored from server cookie, update topbar with actual user info
    if (!hadToken && getToken()) {
      const u = getUser();
      if (u) {
        const name = u.full_name || u.username || 'User';
        const letter = name.charAt(0).toUpperCase();
        const nameEl = document.querySelector('#db-shell-user-wrap .db-user-name');
        const avatarEl = document.querySelector('#db-shell-user-wrap .db-user-avatar');
        if (nameEl) nameEl.textContent = name;
        if (avatarEl) avatarEl.textContent = letter;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreAndInject);
  } else {
    restoreAndInject();
  }
})();
