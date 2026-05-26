/* ===== js/shared-layout.js =====
 * Injects the shared navbar and footer into every new-shell page.
 * Uses depth-aware base-path detection so links resolve correctly
 * regardless of directory depth.
 */
(function () {
  'use strict';

  function getBase() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last  = parts[parts.length - 1] || '';
    // If the last segment has a dot it's a file — strip it to get dirs
    const dirs  = last.includes('.') ? parts.slice(0, -1) : parts;
    return dirs.length === 0 ? './' : '../'.repeat(dirs.length);
  }

  const base = getBase();

  // Simple "RG" logo icon (SVG, no emoji)
  const logoIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="15" text-anchor="middle" fill="#fff" font-size="9" font-weight="800" font-family="Segoe UI,system-ui,sans-serif">RG</text>
  </svg>`;

  const hideLogin = document.body && document.body.hasAttribute('data-hide-login-btn');

  const navHTML = `<nav class="shared-nav">
    <div class="shared-nav-left">
      <button class="nav-hist-btn" onclick="history.back()"  title="Go back">&#8249;</button>
      <button class="nav-hist-btn" onclick="history.forward()" title="Go forward">&#8250;</button>
    </div>
    <a href="${base}index.html" class="shared-nav-logo">
      <div class="shared-nav-logo-icon">${logoIcon}</div>
      <div class="shared-nav-logo-text">
        <span class="logo-research">Research</span><span class="logo-gate">Gate</span>
      </div>
    </a>
    <div class="shared-nav-right">
      ${hideLogin ? '' : `<a href="${base}pages/auth/login.html" class="shared-nav-login">Log In</a>`}
    </div>
  </nav>`;

  const footerHTML = `<footer class="shared-footer">
    &copy; 2025 ResearchGate. All rights reserved. &mdash;
    <a href="#">Terms of Service</a> &middot;
    <a href="#">Privacy Policy</a> &middot;
    <a href="#">Contact Us</a>
  </footer>`;

  function inject() {
    const navRoot = document.getElementById('navbar-root');
    if (navRoot) navRoot.outerHTML = navHTML;

    const footerRoot = document.getElementById('footer-root');
    if (footerRoot) footerRoot.outerHTML = footerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
