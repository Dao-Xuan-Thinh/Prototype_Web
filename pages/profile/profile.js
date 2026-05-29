/* ===== pages/profile/profile.js ===== */

(function () {
  'use strict';

  function getToken() { return window.Auth ? window.Auth.getToken() : null; }
  function getSelf()  { return window.Auth ? window.Auth.getUser()  : null; }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 30)  return d + ' days ago';
    if (d < 365) return Math.floor(d / 30) + ' months ago';
    return Math.floor(d / 365) + ' years ago';
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Parse tags from JSON string or array
  function parseTags(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  }

  // Get username from URL ?user=<username>, or fall back to own
  function getTargetUsername() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user') || null;
  }

  let profileData = null;

  function renderProfile(data) {
    profileData = data;
    const self = getSelf();
    const isOwn = self && String(self.id) === String(data.id);

    // Avatar
    const avatarEl = document.getElementById('profile-avatar-display');
    if (data.avatar_url) {
      avatarEl.innerHTML = `<img src="${data.avatar_url}" alt="${data.username}" />`;
    } else {
      avatarEl.textContent = (data.full_name || data.username || '?').charAt(0).toUpperCase();
    }

    // Avatar edit button (own profile only)
    if (isOwn) {
      const editBtn = document.getElementById('profile-avatar-edit-btn');
      if (editBtn) editBtn.style.display = 'flex';
    }

    // Username + full name
    document.getElementById('profile-username').textContent = '@' + data.username;
    const fnEl = document.getElementById('profile-fullname');
    if (data.full_name) fnEl.textContent = data.full_name;

    // Badges
    const badgesEl = document.getElementById('profile-badges');
    const badges = [];
    if (data.role === 'admin') badges.push('<span class="profile-badge profile-badge-admin">Admin</span>');
    else if (data.role === 'mod') badges.push('<span class="profile-badge profile-badge-mod">Mod</span>');
    else if (data.role === 'mentor') badges.push('<span class="profile-badge profile-badge-role">Mentor</span>');
    else if (data.role === 'student') badges.push('<span class="profile-badge profile-badge-role">Student</span>');
    else badges.push('<span class="profile-badge profile-badge-role">' + (data.role || 'Member') + '</span>');
    badgesEl.innerHTML = badges.join('');

    // Institution
    const instEl = document.getElementById('profile-institution-text');
    if (instEl) {
      instEl.textContent = data.institution || 'No institution';
      instEl.className = data.institution ? '' : 'profile-muted';
    }

    // Joined
    const joinedEl = document.getElementById('profile-joined-text');
    if (joinedEl && data.created_at) {
      joinedEl.textContent = 'Joined ' + formatDate(data.created_at);
    }

    // Bio
    const bioEl = document.getElementById('profile-bio-text');
    if (bioEl) {
      bioEl.textContent = data.bio || 'No bio yet.';
      bioEl.className = 'profile-bio-text' + (data.bio ? '' : ' profile-muted');
    }

    // Research tags
    const tagsEl = document.getElementById('profile-tags-list');
    const tags = parseTags(data.research_tags);
    if (tagsEl) {
      tagsEl.innerHTML = tags.length
        ? tags.map(t => `<span class="profile-tag-chip">${t}</span>`).join('')
        : '<span class="profile-muted" style="font-size:0.85rem">None listed</span>';
    }

    // Edit button (own profile)
    const editBtn = document.getElementById('profile-edit-btn');
    if (editBtn && isOwn) editBtn.style.display = 'flex';

    // Document title
    document.title = '@' + data.username + ' – ResearchGate';

    // Posts
    renderPosts(data.posts || []);
  }

  function renderPosts(posts) {
    const container = document.getElementById('profile-posts-list');
    if (!posts || posts.length === 0) {
      container.innerHTML = '<div class="profile-empty">No forum posts yet.</div>';
      return;
    }

    container.innerHTML = posts.map(p => {
      const tags = parseTags(p.tags);
      const tagChips = tags.map(t => `<span class="profile-post-tag">${t}</span>`).join('');
      const snippet = (p.content || '').replace(/<[^>]+>/g, '').substring(0, 120);
      return `
        <div class="profile-post-card" onclick="window.location.href='../forum/forum.html'">
          <div class="profile-post-title">${p.title || 'Untitled'}</div>
          ${snippet ? `<div style="font-size:0.83rem;color:var(--clr-muted);margin-bottom:6px;line-height:1.4">${snippet}${p.content && p.content.length > 120 ? '...' : ''}</div>` : ''}
          <div class="profile-post-meta">
            ${tagChips}
            <span>${p.upvotes || 0} votes</span>
            <span>${timeAgo(p.created_at)}</span>
          </div>
        </div>`;
    }).join('');
  }

  async function loadProfile() {
    const token = getToken();
    const self = getSelf();
    const targetUser = getTargetUsername();
    const username = targetUser || (self && self.username);

    if (!username) {
      document.getElementById('profile-username').textContent = 'Unknown user';
      document.getElementById('profile-posts-list').innerHTML = '<div class="profile-empty">No user specified.</div>';
      return;
    }

    try {
      const res = await fetch('/api/users/profile/' + encodeURIComponent(username), {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      renderProfile(data);
    } catch (err) {
      document.getElementById('profile-username').textContent = 'User not found';
      document.getElementById('profile-posts-list').innerHTML =
        '<div class="profile-empty">Could not load profile: ' + err.message + '</div>';
    }
  }

  // Avatar upload
  document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('profile-avatar-input');
    const avatarEditBtn = document.getElementById('profile-avatar-edit-btn');

    if (avatarEditBtn) {
      avatarEditBtn.addEventListener('click', () => avatarInput && avatarInput.click());
    }

    if (avatarInput) {
      avatarInput.addEventListener('change', async () => {
        const file = avatarInput.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          alert('File is too large! Please choose a file under 2MB.');
          return;
        }
        const token = getToken();
        if (!token) return alert('Please log in to update your avatar.');

        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const res = await fetch('/api/auth/avatar', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
            body: formData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Upload failed');

          const avatarEl = document.getElementById('profile-avatar-display');
          const self = getSelf();
          avatarEl.innerHTML = `<img src="${data.avatar_url}" alt="${self ? self.username : ''}" />`;
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    }

    loadProfile();
  });

  // Edit modal
  window.openEditMode = function () {
    if (!profileData) return;
    document.getElementById('edit-institution').value = profileData.institution || '';
    document.getElementById('edit-bio').value = profileData.bio || '';
    const tags = parseTags(profileData.research_tags);
    document.getElementById('edit-tags').value = tags.join(', ');
    document.getElementById('profile-edit-modal').style.display = 'flex';
  };

  window.closeEditModal = function (e) {
    if (e && e.target !== document.getElementById('profile-edit-modal')) return;
    document.getElementById('profile-edit-modal').style.display = 'none';
  };

  window.saveProfile = async function () {
    const token = getToken();
    if (!token) return;

    const institution = document.getElementById('edit-institution').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const tagsRaw = document.getElementById('edit-tags').value;
    const research_tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    const saveBtn = document.querySelector('.profile-modal-btn-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ bio, institution, research_tags })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      // Update local data + re-render
      profileData.bio = bio;
      profileData.institution = institution;
      profileData.research_tags = JSON.stringify(research_tags);
      renderProfile(profileData);
      document.getElementById('profile-edit-modal').style.display = 'none';
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  };

})();
